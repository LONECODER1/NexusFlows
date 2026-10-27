# NexusFlows

**NexusFlows** is a full-stack workflow automation platform (similar in spirit to Zapier or n8n) where users visually design multi-step automations on a canvas, connect third-party services, and run them on demand, on a schedule, or via webhooks. Workflows execute asynchronously on a durable job runner with step-level retries, live node status in the editor, and a full execution history.

Use this README for setup and day-to-day development. For system design and interview walkthroughs, see **[docs/HLD-ARCHITECTURE.md](./docs/HLD-ARCHITECTURE.md)**.

---

## Table of contents

- [Why this project exists](#why-this-project-exists)
- [High-level capabilities](#high-level-capabilities)
- [Tech stack](#tech-stack)
- [Architecture at a glance](#architecture-a

t-a-glance)
- [Workflow execution model](#workflow-execution-model)
- [Supported node types](#supported-node-types)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [API and integration surface](#api-and-integration-surface)
- [Security and multi-tenancy](#security-and-multi-tenancy)
- [Interview talking points](#interview-talking-points)

---

## Why this project exists

Modern teams need to glue together APIs, AI providers, and notifications without deploying separate infra for every integration. NexusFlows demonstrates:

- **Visual orchestration** — DAG-based workflows with branching (IF/ELSE, Switch).
- **Reliable execution** — background jobs with persisted steps, concurrency limits, and failure handling.
- **Extensibility** — each node type is a pair of UI component + executor registered in one place.
- **Production patterns** — auth, subscriptions, encrypted secrets, observability, and serverless-friendly DB access.

---

## High-level capabilities

| Area | What users can do |
|------|-------------------|
| **Editor** | Drag-and-drop nodes (React Flow), connect edges, auto-save graph to Postgres |
| **Triggers** | Manual run, interval schedule, Google Form webhook, Stripe webhook |
| **Actions** | HTTP requests, email (Resend), Discord/Slack/Telegram, LLMs (OpenAI, Anthropic, Gemini, Groq) |
| **Logic** | IF/ELSE and Switch nodes with branch-aware graph traversal |
| **Code** | Custom JavaScript node executed in a VM sandbox |
| **Credentials** | Per-user API keys stored encrypted and linked to nodes |
| **Executions** | List runs, view status/output/errors, realtime node status while running |
| **Billing** | 30-day trial; Polar.sh subscription gating for premium actions (create workflow, credentials) |

---

## Tech stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router), React 19, TypeScript |
| **UI** | Tailwind CSS 4, Radix/shadcn, React Flow (`@xyflow/react`) |
| **API** | tRPC 11 + TanStack Query, SuperJSON |
| **Auth** | Better Auth (email/password, GitHub, Google) |
| **Database** | PostgreSQL via Prisma 6 + Neon serverless driver adapter |
| **Jobs / realtime** | Inngest (workflow function, cron scheduler, Realtime channels) |
| **AI** | Vercel AI SDK (`ai`, `@ai-sdk/*`) |
| **Templating** | Handlebars (`{{context.path}}`) in node configs |
| **Payments** | Polar.sh (`@polar-sh/better-auth`, `@polar-sh/sdk`) |
| **Observability** | Sentry |
| **Local dev** | `mprocs` runs Next.js + Inngest dev server together |

---

## Architecture at a glance

```
┌─────────────┐     tRPC / REST      ┌──────────────────────────────────┐
│   Browser   │ ───────────────────► │  Next.js (App Router + API routes) │
│  React Flow │ ◄── Inngest Realtime │  Auth · tRPC · Webhooks · Inngest  │
└─────────────┘                      └───────────┬──────────────┬───────────┘
                                                 │              │
                                    ┌────────────▼──┐    ┌──────▼──────┐
                                    │  PostgreSQL   │    │   Inngest   │
                                    │  (Neon)       │    │   Cloud/Dev │
                                    └───────────────┘    └──────┬──────┘
                                                                │
                                                    External APIs (OpenAI, etc.)
```

Detailed diagrams (context, components, sequence, ER model, deployment): **[docs/HLD-ARCHITECTURE.md](./docs/HLD-ARCHITECTURE.md)**.

---

## Workflow execution model

1. **Trigger** — User clicks “Execute” (tRPC `workflows.execute`), a schedule fires (`schedule-cron-runner` every minute), or a webhook hits `/api/webhooks/*` with `?workflowId=`.
2. **Enqueue** — App sends Inngest event `workflows/execute.workflow` with optional `initialData` (Stripe payload, form responses, etc.).
3. **Orchestrator** — Inngest function `execute-workflow`:
   - Creates an `Execution` row (`RUNNING`).
   - Loads workflow nodes/connections from DB.
   - **Topologically sorts** nodes (`toposort`); rejects cycles.
   - For each node in order, resolves **`getExecutor(nodeType)`** from the executor registry.
   - Passes a shared **`context`** object; each executor merges its output (e.g. `{ myVar: { ... } }`).
   - **Branching**: IF/ELSE and Switch set `_branchOutcome`; downstream nodes on non-matching edges are skipped.
   - Wraps side effects in **`step.run`** for durability; publishes **Realtime** status per node.
4. **Completion** — Updates execution to `SUCCESS` with final context JSON, or `FAILED` via `onFailure` handler.

Concurrency: one active run per `workflowId` (Inngest concurrency key).

---

## Supported node types

Defined in `prisma/schema.prisma` (`NodeType` enum) and wired in `src/config/node-components.ts` + `src/features/executions/lib/executor-registry.ts`.

| Category | Types |
|----------|--------|
| **Triggers** | `MANUAL_TRIGGER`, `SCHEDULE_TRIGGER`, `GOOGLE_FORM_TRIGGER`, `STRIPE_TRIGGER`, `INITIAL` (placeholder) |
| **Integrations** | `HTTP_REQUEST`, `EMAIL`, `DISCORD`, `SLACK`, `TELEGRAM` |
| **AI** | `OPENAI`, `ANTHROPIC`, `GEMINI`, `GROQ` |
| **Logic** | `IF_ELSE`, `SWITCH` |
| **Code** | `JAVASCRIPT` |

Adding a node: Prisma enum → React Flow node component → executor → register in `executor-registry` → optional Inngest Realtime channel.

---

## Project structure

```
src/
├── app/                    # Next.js routes (landing, auth, dashboard, API)
│   └── api/
│       ├── auth/           # Better Auth handler
│       ├── inngest/        # Inngest serve endpoint
│       ├── trpc/           # tRPC HTTP handler
│       └── webhooks/       # Google Form, Stripe ingress
├── features/
│   ├── auth/               # Login/register UI
│   ├── credentials/        # Encrypted API keys (tRPC)
│   ├── editor/             # React Flow workflow canvas
│   ├── executions/         # Node executors + execution UI
│   ├── triggers/           # Trigger nodes + schedule utils
│   ├── workflows/          # Workflow CRUD + execute mutation
│   ├── subscriptions/      # Trial + upgrade modal
│   └── landing/            # Marketing page
├── inngest/
│   ├── functions.ts        # execute-workflow orchestrator
│   ├── cron-runner.ts      # Scheduled workflow dispatcher
│   ├── channels/           # Realtime topics per node type
│   └── utils.ts            # Topological sort + sendWorkflowExecution
├── trpc/                   # Router init, procedures (protected / premium)
├── lib/                    # db, auth, encryption, polar
└── generated/prisma/       # Prisma client output
prisma/
├── schema.prisma
└── migrations/
```

---

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL database (Neon recommended)
- [Inngest](https://www.inngest.com/) account or local dev server for background jobs

### Install and run

```bash
npm install
npx prisma migrate dev
npm run mprocs
```

- App: [http://localhost:3000](http://localhost:3000)
- Inngest dev UI: typically [http://localhost:8288](http://localhost:8288) (when using `inngest-cli dev`)

Alternatively run processes separately:

```bash
npm run dev          # Next.js on port 3000
npm run inngest:dev  # Inngest dev server → http://127.0.0.1:3000/api/inngest
```

### Production build

```bash
npm run build
npm run start
```

Deploy Next.js (e.g. Vercel) with `DATABASE_URL`, Inngest keys, and `INNGEST_DEV` unset/false in production so jobs use Inngest Cloud.

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `ENCRYPTION_KEY` | Symmetric key for credential encryption (`cryptr`) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | OAuth |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth |
| `POLAR_ACCESS_TOKEN` | Polar.sh API |
| `POLAR_SUCCESS_URL` | Checkout redirect after payment |
| `NEXT_PUBLIC_APP_URL` | Public base URL for webhook URLs in UI |
| `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` | Inngest Cloud (production) |
| `INNGEST_DEV` | Local dev mode for Inngest client |
| `ADMIN_EMAIL` / `ADMIN_USER_ID` | Bypass subscription checks (server) |
| `BYPASS_SUBSCRIPTION` | `true` to disable premium gating (dev) |
| `NEXT_PUBLIC_BYPASS_SUBSCRIPTION` | Client-side subscription bypass |
| Sentry | Standard `@sentry/nextjs` env vars when enabled |

Never commit secrets. Use `.env.local` for local development.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js dev server (Turbopack, port 3000) |
| `npm run inngest:dev` | Inngest CLI dev against local `/api/inngest` |
| `npm run mprocs` | Next.js + Inngest together |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `postinstall` | `prisma generate` |

---

## API and integration surface

### tRPC routers (`src/trpc/routers/_app.ts`)

| Router | Responsibility |
|--------|----------------|
| `workflows` | CRUD, persist graph, `execute` → Inngest |
| `credentials` | Create/update/list encrypted credentials |
| `executions` | List and fetch execution records |

Procedures:

- **`protectedProcedure`** — requires Better Auth session.
- **`premiumProcedure`** — active trial, Polar subscription, or admin bypass.

### HTTP routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...all]` | * | Better Auth |
| `/api/trpc/[trpc]` | * | tRPC |
| `/api/inngest` | GET/POST/PUT | Inngest function registration + runs |
| `/api/webhooks/google-form?workflowId=` | POST | Form submission → workflow |
| `/api/webhooks/stripe?workflowId=` | POST | Stripe event → workflow |

---

## Security and multi-tenancy

- **Row-level ownership**: Workflows and credentials are scoped by `userId`; tRPC queries enforce `userId` on mutations/queries.
- **Credentials at rest**: Encrypted with `ENCRYPTION_KEY`; decrypted only inside server-side executors.
- **JavaScript node**: Runs user code in `node:vm` sandbox with a copied context (still treat as trusted-user feature in production).
- **Webhooks**: Workflow ID in query string — in production you would add signing secrets per workflow (extension point for interviews).

---

## Interview talking points

1. **Why Inngest instead of inline API execution?** Long-running LLM/HTTP steps, retries, observability, and `step.run` idempotency without blocking HTTP requests.
2. **Why topological sort?** Guarantees dependencies run before dependents; cycle detection prevents invalid graphs.
3. **Context passing** — Executors read/write a shared JSON context; Handlebars templates reference prior node outputs.
4. **Branching** — Not separate graphs: skipped node IDs propagated along edges whose `fromOutput` does not match `_branchOutcome`.
5. **Realtime UX** — Inngest Realtime `publish` from executors; editor subscribes for per-node loading/success/error.
6. **Premium gating** — Middleware on tRPC separates “read” vs “create automation” monetization; trial on user signup via Better Auth hook.
7. **Neon + Prisma adapter** — Serverless-friendly DB for edge/serverless deployments.

For layered diagrams and walkthrough scripts, open **[docs/HLD-ARCHITECTURE.md](./docs/HLD-ARCHITECTURE.md)**.

---

## License

Private project (`package.json`: `"private": true`). Adjust license section if you open-source the repo.
