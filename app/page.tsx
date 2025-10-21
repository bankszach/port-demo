import FacadeAgent from "@/components/FacadeAgent";

const HERO_FACTS = [
  { title: "Audience", items: ["Chris Dumas (Encinitas, PT)"] },
  { title: "Format", items: ["Headlines + bullets (no prose)"] },
  { title: "Promise", items: ["Less slide-ware, more shipped systems."] },
];

const TLDR_BULLETS = [
  "COMPASS-DRIVE = Always-on guardrails (compliance, safety, ops, cost) across every step.",
  "Cycle-F = Execution loop (Clarify -> Yield -> Context -> Learn -> Execute -> Feedback).",
  "Together: move fast and do not break the business with clear SLOs, budgets, and auditability.",
];

const VISUAL_BULLETS = [
  "COMPASS-DRIVE wraps the loop (think: ring fence).",
  "Cycle-F spins inside: C -> Y -> Ctx -> L -> E -> F -> repeat.",
];

const COMPASS_DRIVE_POINTS = [
  ["C - Compliance", "Policy-as-code; versioned; audit trails."],
  ["O - Observability", "Traces, logs, metrics, lineage, cost per task."],
  ["M - Minimization", "Least privilege; PII redaction; TTLs; purpose binding."],
  ["P - Policy and Permissions", "Tenants, roles, scopes, data domains."],
  ["A - AuthN/Z", "End-to-end coverage; tools and data plane included."],
  ["S - Safety I/O Sandwich", "Sanitize in; validate out; jailbreak and toxicity checks."],
  ["S - Schemas", "Strict JSON contracts; runtime validators."],
  ["D - Determinism", "Idempotency keys; safe retries; exactly-once where needed."],
  ["R - Resilience", "Timeouts, circuit breakers, sagas; backoff."],
  ["I - Invalidation and Caching", "Freshness and policy-aware caches."],
  ["V - Versioning and Eval Gates", "PR checks, canaries, golden sets."],
  ["E - Economy", "Hard budgets on time, tokens, and dollars; watchdogs."],
];

const CYCLE_F_STEPS = [
  "Clarify — Define intent, stakeholders, constraints, SLOs, and the test plan.",
  "Yield — Deterministic trigger (event, API, schedule); normalize inputs; assign run ID.",
  "Context — Retrieve and enrich (RAG, search, features, policies) with freshness checks.",
  "Learn — Reason, decide, or generate; choose tools; plan the pass.",
  "Execute — Run tools and calls; orchestrate; transact safely; update state.",
  "Feedback — Verify against SLOs; run evals; add HITL; log and distribute; loop.",
];

const CYCLE_F_OUTPUTS = [
  "Result payload.",
  "Confidence.",
  "Cost.",
  "Latency.",
  "Lineage.",
  "Next action.",
];

const EXAMPLE_STAGES = [
  {
    title: "Clarify",
    bullets: [
      "SLOs: <= 30s first summary, >= 0.85 rubric score, <= $0.015 per ticket.",
      "Constraints: PII masked; only support KB + last 30d tickets; English only (v1).",
    ],
  },
  {
    title: "Yield",
    bullets: [
      "Trigger: new Zendesk ticket.",
      "Normalize to ticket.json (title, body, product, severity, customer tier, attachments -> links).",
      "Run ID: zd-{ticket_id}-{ts} (idempotent).",
    ],
  },
  {
    title: "Context",
    bullets: [
      "Pull customer plan, last 5 tickets, KB snippets (< 24h freshness), policy notes.",
      "Deduplicate and chunk; attach source URIs.",
    ],
  },
  {
    title: "Learn",
    bullets: [
      "Decide severity bucket and owner.",
      "Produce draft summary; select Slack route.",
    ],
  },
  {
    title: "Execute",
    bullets: [
      "Post to #support-triage with summary, severity, owner, confidence, cost.",
      "If severity >= 3 or confidence < 0.7 -> page human.",
    ],
  },
  {
    title: "Feedback",
    bullets: [
      "Auto-score against rubric.",
      "Capture human label; update eval set; report daily KPIs.",
    ],
  },
];

const KPI_BULLETS = [
  "Latency (p50 and p95).",
  "Cost per ticket.",
  "Auto-route accuracy.",
  "Rubric score.",
  "Escalation rate.",
  "Drift alerts.",
  "Guardrail breach count (trend to 0).",
  "Cache hit rate.",
  "PII redaction efficacy.",
];

const PILOT_PLAN = [
  {
    title: "Days 0-3",
    bullets: [
      "Stand up COMPASS-DRIVE scaffolding (policies, tracing, budgets, eval harness).",
      "Wire one trigger (Zendesk) and one output (Slack).",
      "Ship sandbox path with safe defaults; dry runs only.",
    ],
  },
  {
    title: "Days 4-14",
    bullets: [
      "Implement Cycle-F v1; ship to shadow mode on one queue.",
      "Hit baseline SLOs; publish daily scorecard in Slack.",
      "Add HITL UI for redlines; build golden set (100 examples).",
    ],
  },
  {
    title: "Days 15-30",
    bullets: [
      "Limited production (business hours).",
      "Expand context sources; add canary and kill switch.",
      "Weekly AB vs human baseline; enforce cost and latency gates.",
    ],
  },
  {
    title: "Days 31-90",
    bullets: [
      "Roll out to all queues; add multilingual support.",
      "Budget multi-tenant; tighten evals.",
      "Document playbook; hand off to ops; queue next agents (billing, RMA, etc.).",
    ],
  },
];

const DECISION_NEEDS = [
  "Green-light: 30-day pilot on one queue.",
  "Two contributors (backend + ops) with read-only access to Zendesk and KB.",
  "Budget cap: $500 infra and model spend (Economy guardrail hard stop).",
  "Owner: single-threaded DRI for escalations.",
];

const WORKING_MODE = [
  "No prose. Headlines + bullets + numbers.",
  "Drafts early. Share wireframes before polish.",
  "Call/Text > Slack > Email. Quick acknowledgments.",
  "Be crisp. Lead with headline KPI, risk, ask.",
  "Close loops. Every thread gets explicit done/next.",
  "Know the numbers. Maintain a live scorecard.",
];

const GLOSSARY = [
  ["Idempotency", "Same input -> same effect (safe retries)."],
  ["Golden set", "Curated examples with expected outputs for eval gates."],
  ["HITL", "Human in the loop for safety and quality."],
];

const FACADE_BULLETS = [
  "Clarify -> Feedback transcript for every run.",
  "Plan step uses OpenAI when key present; falls back to static plan.",
  "KPIs surface latency, cost, HITL approval each pass.",
  "Use this to narrate how COMPASS-DRIVE surrounds Cycle-F.",
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-6 py-10 sm:px-10 sm:py-16">
        <section className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_35px_-20px_rgba(15,37,72,0.75)]">
          <div className="flex flex-col gap-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-200/80">
              Zach Banks AI Engineer
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
              COMPASS-DRIVE x Cycle-F — How We Ship Fast, Safe, and Measurable
            </h1>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {HERO_FACTS.map((fact) => (
              <div
                key={fact.title}
                className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {fact.title}
                </div>
                <ul className="list-disc space-y-1 pl-4 text-sm text-slate-200">
                  {fact.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <SectionCard title="TL;DR" bullets={TLDR_BULLETS} />

        <SectionCard title="Visual mnemonic (text form)" bullets={VISUAL_BULLETS} />

        <SectionCard
          title="COMPASS-DRIVE (always-on cross-cuts)"
          bullets={COMPASS_DRIVE_POINTS.map(
            ([label, detail]) => `${label}: ${detail}`,
          )}
          footerBullets={[
            "Rule: If a step violates any COMPASS-DRIVE control -> auto fail fast with actionable error.",
          ]}
        />

        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="text-xl font-semibold text-slate-100 sm:text-2xl">
            Cycle-F (execution loop)
          </div>
          <ol className="space-y-3 pl-5 text-sm text-slate-200">
            {CYCLE_F_STEPS.map((item) => (
              <li key={item} className="list-decimal">
                {item}
              </li>
            ))}
          </ol>
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Outputs per pass
          </div>
          <ul className="list-disc space-y-1 pl-4 text-sm text-slate-200">
            {CYCLE_F_OUTPUTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-col gap-2">
            <div className="text-xl font-semibold text-slate-100 sm:text-2xl">
              {"Concrete example (3 min read, Zendesk -> Slack triage)"}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {EXAMPLE_STAGES.map((stage) => (
              <div
                key={stage.title}
                className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="text-sm font-semibold text-slate-100">
                  {stage.title}
                </div>
                <ul className="list-disc space-y-1 pl-4 text-sm text-slate-200">
                  {stage.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <SectionCard title="KPIs (measured daily and weekly)" bullets={KPI_BULLETS} />

        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="text-xl font-semibold text-slate-100 sm:text-2xl">
            30-60-90 pilot plan (bias to action)
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {PILOT_PLAN.map((phase) => (
              <div
                key={phase.title}
                className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="text-sm font-semibold text-slate-100">
                  {phase.title}
                </div>
                <ul className="list-disc space-y-1 pl-4 text-sm text-slate-200">
                  {phase.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <SectionCard title="What I need from you (decision and resources)" bullets={DECISION_NEEDS} />

        <SectionCard title="How we will work (aligned to your manual)" bullets={WORKING_MODE} />

        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="text-xl font-semibold text-slate-100 sm:text-2xl">
            Live facade run (Cycle-F inside COMPASS-DRIVE)
          </div>
          <ul className="list-disc space-y-1 pl-4 text-sm text-slate-200">
            {FACADE_BULLETS.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <FacadeAgent />
        </section>

        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="text-xl font-semibold text-slate-100 sm:text-2xl">
            Appendix (glossary)
          </div>
          <ul className="space-y-2 text-sm text-slate-200">
            {GLOSSARY.map(([term, definition]) => (
              <li key={term} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="text-sm font-semibold text-slate-100">{term}</div>
                <div className="text-sm text-slate-300">{definition}</div>
              </li>
            ))}
          </ul>
        </section>

        <footer className="flex flex-col gap-2 border-t border-white/5 pt-8 text-xs text-slate-500 sm:text-sm">
          <span>Copyright {new Date().getFullYear()} Zach Banks AI Engineer</span>
          <span className="text-slate-600">
            All live systems shown are read-only friendly and sanitized for
            demos.
          </span>
        </footer>
      </main>
    </div>
  );
}

function SectionCard({
  title,
  bullets,
  footerBullets,
}: {
  title: string;
  bullets: string[];
  footerBullets?: string[];
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
      <div className="text-xl font-semibold text-slate-100 sm:text-2xl">
        {title}
      </div>
      <ul className="list-disc space-y-1 pl-4 text-sm text-slate-200">
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      {footerBullets && (
        <ul className="list-disc space-y-1 border-t border-white/10 pt-4 pl-4 text-sm text-slate-300">
          {footerBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
