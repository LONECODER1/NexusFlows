import { Cpu, Zap, Bot, Globe, Lock, CheckCircle2 } from "lucide-react";

export function FeaturesGrid() {
  return (
    <section id="features" className="border-t border-border/40 bg-muted/10 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Engineered for Speed, Built for Scale
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to orchestrate APIs, manage stateful executions, and build triggers.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-xl font-bold">Stateful Canvas</h3>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              Connect triggers, delays, custom codes, and API connections dynamically using our drag-and-drop workflow canvas interface.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-xl font-bold">Event-Driven Scheduling</h3>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              Trigger workflows on demand via standard Webhooks, specific schedules (Cron), or custom system events.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-xl font-bold">AI Integrations</h3>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              Leverage top LLMs (Anthropic, OpenAI, Google Gemini) natively to synthesize data, generate summaries, and classify requests.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-xl font-bold">Custom Webhooks</h3>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              Send data anywhere. Execute authenticated HTTP requests, format payloads, and handle errors dynamically.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-xl font-bold">Secure Credentials</h3>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              Safeguard API keys, OAuth tokens, and system secrets with industry-standard encryption protocols.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-xl font-bold">Execution Logs</h3>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              Monitor runs in real time, view historical execution steps, retry failures, and debug payloads.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
