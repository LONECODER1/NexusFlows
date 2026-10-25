# NexusFlows — High-Level Design (HLD)

This document is written for **system design interviews**: use it to explain *what* NexusFlows is, *how* requests and jobs flow, and *why* key technologies were chosen.

**Companion:** [README.md](../README.md) (setup, env vars, node catalog).

---

## 1. Problem statement

Build a **multi-tenant workflow automation SaaS** where:

- Users design **directed acyclic graphs** (workflows) in a browser.
- Runs are **durable** (survive restarts, retry failed steps).
- Steps can call **external APIs** and **LLMs** using stored credentials.
- Users see **live progress** during a run and **history** afterward.

Non-goals in the current codebase: horizontal sharding, per-tenant isolated workers, signed webhook verification (extension point).

---

## 2. System context (C4 Level 1)

Who interacts with the system and what external systems are involved.

```mermaid
flowchart TB
    subgraph actors [Actors]
        User[End User / Builder]
    end

    subgraph nexus [NexusFlows Platform]
        App[NexusFlows Web App]
    end

    subgraph data [Data & Jobs]
        PG[(PostgreSQL / Neon)]
        INNG[Inngest]
    end

    subgraph external [External Services]
        OAuth[GitHub / Google OAuth]
        Polar[Polar.sh Billing]
        LLM[OpenAI / Anthropic / Gemini / Groq]
        Comms[Resend / Discord / Slack / Telegram]
        Stripe[Stripe Webhooks]
        GForm[Google Forms Webhook]
    end

    User -->|HTTPS| App
    App --> PG
    App --> INNG
    App --> OAuth
    App --> Polar
    INNG --> PG
    INNG --> LLM
    INNG --> Comms
    GForm -->|POST webhook| App
    Stripe -->|POST webhook| App
    User -->|Subscribe| Polar
```

**One-liner for interviews:**  
*“The Next.js app is the control plane and API gateway; PostgreSQL is the source of truth for graphs and executions; Inngest is the data plane for running workflows and calling third parties.”*

---

## 3. Container diagram (C4 Level 2)

Major deployable / logical containers inside the platform.

```mermaid
flowchart TB
    subgraph client [Client Tier]
        Browser[Browser - React 19]
        RF[React Flow Editor]
        RQ[TanStack Query + tRPC Client]
        Browser --> RF
        Browser --> RQ
    end

    subgraph server [Next.js Server]
        Pages[App Router Pages]
        TRPC[tRPC Routers]
        Auth[Better Auth]
        WH[Webhook Routes]
        INGAPI["/api/inngest"]
        Pages --> TRPC
        TRPC --> Auth
    end

    subgraph inngest [Inngest Functions]
        EX[execute-workflow]
        CRON[schedule-cron-runner]
        REG[Executor Registry]
        EX --> REG
        CRON -->|sendEvent| EX
    end

    subgraph persistence [Persistence]
        DB[(PostgreSQL)]
        Prisma[Prisma Client + Neon Adapter]
        Prisma --> DB
    end

    RQ -->|/api/trpc| TRPC
    Browser -->|/api/auth| Auth
    WH -->|sendWorkflowExecution| INGAPI
    TRPC -->|inngest.send| INGAPI
    INGAPI --> EX
    INGAPI --> CRON
    EX --> Prisma
    CRON --> Prisma
    TRPC --> Prisma
    Auth --> Prisma
    EX -->|publish realtime| Browser
```

---

## 4. Component diagram — workflow domain

Feature modules and how they connect.

```mermaid
flowchart LR
    subgraph ui [Presentation]
        Editor[editor/ - React Flow]
        ExecUI[executions/ - history + detail]
        CredUI[credentials/]
        WfUI[workflows/ - list]
    end

    subgraph api [Application API]
        WfRouter[workflowsRouter]
        CredRouter[credentialsRouter]
        ExecRouter[executionsRouter]
    end

    subgraph runtime [Execution Runtime]
        Orch[inngest/functions.ts - executeWorkflow]
        Sort[topologicalSort]
        GetEx[getExecutor]
        Nodes[Per-type executors]
        Orch --> Sort
        Orch --> GetEx
        GetEx --> Nodes
    end

    subgraph config [Registration]
        NC[node-components.ts]
        ER[executor-registry.ts]
    end

    Editor --> WfRouter
    WfUI --> WfRouter
    CredUI --> CredRouter
    ExecUI --> ExecRouter
    WfRouter -->|execute| Orch
    Editor --> NC
    ER --> GetEx
```

**Design pattern:** *Plugin-style node types* — UI component map and executor map keyed by the same `NodeType` enum from Prisma.

---

## 5. Core data model (ER)

```mermaid
erDiagram
    User ||--o{ Workflow : owns
    User ||--o{ Credential : owns
    User ||--o{ Session : has
    User ||--o{ Account : has

    Workflow ||--o{ Node : contains
    Workflow ||--o{ Connection : contains
    Workflow ||--o{ Execution : runs

    Node ||--o{ Connection : from
    Node ||--o{ Connection : to
    Credential ||--o{ Node : optional

    User {
        string id PK
        string email UK
        datetime trialEndsAt
    }

    Workflow {
        string id PK
        string userId FK
        string name
    }

    Node {
        string id PK
        string workflowId FK
        enum type
        json position
        json data
        string credentialId FK
    }

    Connection {
        string id PK
        string fromNodeId FK
        string toNodeId FK
        string fromOutput
        string toInput
    }

    Execution {
        string id PK
        string workflowId FK
        enum status
        string inngestEventId UK
        json output
    }

    Credential {
        string id PK
        string userId FK
        enum type
        string value
    }
```

**Graph semantics:**

- **Nodes** = steps; **Connections** = edges with optional handles (`fromOutput` / `toInput`) for branching.
- **Workflow** save = transaction: delete old nodes, recreate nodes + connections from React Flow state.

---

## 6. Sequence — manual workflow execution

Typical path when the user clicks **Execute** in the editor.

```mermaid
sequenceDiagram
    actor U as User
    participant E as Editor UI
    participant T as tRPC workflows.execute
    participant I as Inngest Client
    participant F as execute-workflow
    participant DB as PostgreSQL
    participant X as Node Executor
    participant RT as Inngest Realtime

    U->>E: Click Execute
    E->>T: mutate({ workflowId })
    T->>DB: verify workflow.userId
    T->>I: send workflows/execute.workflow
    T-->>E: OK (async)

    I->>F: Invoke function
    F->>DB: create Execution RUNNING
    F->>DB: load nodes + connections
    F->>F: topologicalSort(nodes)

    loop Each node in order
        F->>X: executor({ context, step, publish })
        X->>RT: publish status loading/success/error
        RT-->>E: live node indicator
        X->>X: optional step.run (durable side effect)
        X-->>F: updated context
        alt IF/ELSE or Switch branch
            F->>F: mark skipped downstream nodes
        end
    end

    F->>DB: update Execution SUCCESS + output JSON
```

---

## 7. Sequence — scheduled execution

```mermaid
sequenceDiagram
    participant CRON as schedule-cron-runner
    participant DB as PostgreSQL
    participant I as Inngest
    participant F as execute-workflow

    Note over CRON: Runs every minute (* * * * *)

    CRON->>DB: find workflows with SCHEDULE_TRIGGER
    CRON->>CRON: shouldRunTimer(interval, lastRun)
    CRON->>DB: update lastScheduledRunAt on node.data
    CRON->>I: sendEvent workflows/execute.workflow
    I->>F: execute with initialData.triggeredBy=SCHEDULE_TRIGGER
```

**Idempotency:** Schedule uses deterministic `eventId` from `getScheduleEventId` to reduce duplicate fires for the same tick.

---

## 8. Sequence — webhook-triggered execution

```mermaid
sequenceDiagram
    participant Ext as Stripe / Google Form
    participant WH as /api/webhooks/*
    participant I as Inngest
    participant F as execute-workflow

    Ext->>WH: POST ?workflowId=xxx + body
    WH->>WH: normalize payload to initialData
    WH->>I: sendWorkflowExecution({ workflowId, initialData })
    WH-->>Ext: 200 { success: true }
    I->>F: run workflow
    Note over F: Trigger node reads initialData from context
```

Webhook URLs are shown in trigger node dialogs using `NEXT_PUBLIC_APP_URL`.

---

## 9. Execution engine — internal flow

```mermaid
flowchart TD
    Start([Event: workflows/execute.workflow]) --> CreateExec[step.run: create Execution]
    CreateExec --> Load[step.run: load workflow]
    Load --> Sort[Topological sort nodes]
    Sort --> Loop{Next node}

    Loop --> Skip{In skippedNodeIds?}
    Skip -->|yes| PropSkip[Propagate skip to children]
    PropSkip --> Loop

    Skip -->|no| Exec[getExecutor type]
    Exec --> Run[Run executor with shared context]
    Run --> Branch{_branchOutcome set?}
    Branch -->|yes| MarkSkip[Skip edges where fromOutput mismatch]
    Branch -->|no| Loop
    MarkSkip --> Loop

    Loop -->|done| Update[step.run: SUCCESS + output]
    Update --> End([Return result])

    Fail[onFailure handler] --> FailDB[Execution FAILED + error]
```

**Shared context:** A plain JSON object passed through the DAG. Nodes typically write under a user-defined variable name, e.g. `{ "httpResult": { "status": 200, "body": "..." } }`.

**Templating:** Many executors compile config strings with Handlebars against `context`.

---

## 10. Branching model (IF/ELSE & Switch)

```mermaid
flowchart LR
    IF[IF/ELSE node] -->|fromOutput: true| PathA[Branch A nodes]
    IF -->|fromOutput: false| PathB[Branch B nodes]

    IF --> SetCtx["context._branchOutcome = true|false"]
    SetCtx --> Orch[Orchestrator skips nodes<br/>on non-matching edges]
```

- Connection **`fromOutput`** must match **`context._branchOutcome`** for the target node to run.
- Skipped nodes recursively skip their descendants (for nodes that were only reachable through a losing branch).

---

## 11. Realtime updates (Inngest Realtime)

```mermaid
flowchart LR
    subgraph executors [Node Executors]
        P[publish status]
    end

    subgraph inngest [Inngest]
        MW[realtimeMiddleware]
        CH[channels e.g. openai, http-request]
    end

    subgraph ui [Editor / Node UI]
        SUB[subscribe with token]
        IND[NodeStatusIndicator]
    end

    executors --> P
    P --> CH
    CH --> SUB
    SUB --> IND
```

Each heavy node type can define a channel under `src/inngest/channels/`. Executors call `publish` at start, success, and error so the canvas reflects run state without polling execution rows.

---

## 12. Authentication & authorization

```mermaid
flowchart TB
    Req[Incoming tRPC request] --> Sess[getServerSession - Better Auth]
    Sess -->|no session| UNAUTH[401 UNAUTHORIZED]
    Sess -->|ok| Protected[protectedProcedure]

    Protected --> Premium{premiumProcedure?}
    Premium -->|no| Handler[Route handler]
    Premium -->|yes| Trial{trial active?}
    Trial -->|yes| Handler
    Trial -->|no| Admin{admin bypass?}
    Admin -->|yes| Handler
    Admin -->|no| Polar[Polar customer activeSubscriptions]
    Polar -->|empty| FORB[403 FORBIDDEN]
    Polar -->|active| Handler
```

---

## 13. Deployment view (typical production)

```mermaid
flowchart TB
    User[Users] --> CDN[Vercel / Edge CDN]
    CDN --> Next[Next.js Serverless Functions]
    Next --> Neon[(Neon PostgreSQL)]
    Next --> IC[Inngest Cloud]
    IC --> Next
    Note1[Inngest invokes /api/inngest]
    IC --> Neon
    Next --> Sentry[Sentry]
    Next --> PolarAPI[Polar API]
```

**Local dev:** `mprocs` runs Next on `:3000` and Inngest Dev Server pointing at `http://127.0.0.1:3000/api/inngest`.

**Production Inngest client:** `NODE_ENV=production` forces cloud mode; set `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`.

---

## 14. Key design decisions (interview cheat sheet)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Workflow storage | Relational graph (Node + Connection) | Easy queries, FK integrity, matches editor model |
| Run orchestration | Inngest function + `step.run` | Retries, durability, concurrency control, no self-managed queue |
| Order of execution | Topological sort | Respects dependencies; detects cycles |
| Node extensibility | Registry pattern | Add type in one enum + two registrations |
| API to frontend | tRPC + SuperJSON | End-to-end types, efficient mutations for graph saves |
| DB in serverless | Prisma Neon adapter | Connection pooling / serverless driver |
| Secrets | Encrypted credentials table | Keys not in workflow JSON; linked by `credentialId` |
| Monetization | Polar + trial field on User | Server-side gate on premium mutations |
| Live UX | Inngest Realtime | Push node status to editor during long steps |

---

## 15. Scalability & reliability (talking points)

**What scales easily today**

- **Stateless Next.js** instances behind a load balancer.
- **Inngest** scales workers; concurrency limit per workflow prevents overlapping runs on the same graph.
- **Neon** scales storage and compute independently.

**Current bottlenecks / future work**

- **Sequential node loop** in one function — very large workflows increase single-run duration (could shard into sub-functions per node).
- **Cron scanner** loads all scheduled workflows every minute — would move to per-workflow cron or Inngest schedules at scale.
- **Webhook security** — add HMAC verification and workflow-specific secrets.
- **JavaScript node** — stronger isolation (worker process, WASM, or disallow in multi-tenant SaaS).

---

## 16. Failure handling

| Scenario | Behavior |
|----------|----------|
| Executor throws | Inngest retries (3× in production); `onFailure` marks `Execution` `FAILED` with message/stack |
| `NonRetriableError` | No retry (e.g. misconfigured node) |
| Cycle in graph | Topological sort throws before run |
| Missing executor | Hard error at runtime for unknown `NodeType` |
| DB unavailable | Request fails; Inngest may retry the step |

---

## 17. Suggested 2-minute interview pitch

> “NexusFlows is a workflow automation product built on Next.js and PostgreSQL. Users edit a visual DAG in React Flow; we persist nodes and edges in Postgres. When a workflow runs—manually, on a schedule, or via webhooks—we enqueue an Inngest event. A single orchestrator function topologically sorts the graph, runs a typed executor per node, and passes a JSON context forward. Branching nodes set a branch outcome and we skip downstream paths on losing edges. Side effects like LLM calls run inside Inngest steps for durability, and we push live status to the UI with Inngest Realtime. Credentials are encrypted at rest, auth is Better Auth, and premium features are gated with Polar subscriptions after a trial.”

---

## 18. File reference (implementation map)

| Concern | Primary files |
|---------|----------------|
| Orchestrator | `src/inngest/functions.ts` |
| Schedule | `src/inngest/cron-runner.ts` |
| Executors | `src/features/executions/lib/executor-registry.ts` |
| Sort / enqueue | `src/inngest/utils.ts` |
| tRPC entry | `src/trpc/routers/_app.ts` |
| Schema | `prisma/schema.prisma` |
| Inngest HTTP | `src/app/api/inngest/route.ts` |
| Editor | `src/features/editor/components/editor.tsx` |
