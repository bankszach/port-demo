export const COMPASS_DRIVE_TABLE = [
  [
    "C - Compliance",
    "Policies-as-code; versioned; auditable.",
    "Policy repo defines which data sources an agent may read.",
  ],
  [
    "O - Observability",
    "Traces; metrics; lineage; cost.",
    "Each prompt/tool emits spans.",
  ],
  [
    "M - Minimization",
    "Least-privilege; redact PII; TTL.",
    "Redact emails; auto-delete after 30 days.",
  ],
  [
    "P - Policy & Permissions",
    "Tenants; roles; scopes; domain ACLs.",
    "Finance agent can't read HR docs.",
  ],
  [
    "A - AuthN/Z",
    "Verify who + authorize what.",
    "Verify API key/OIDC before task starts.",
  ],
  [
    "S - Safety I/O Sandwich",
    "Sanitize IN -> validate OUT.",
    "Pre/post filter model I/O.",
  ],
  [
    "S - Schemas",
    "Strict JSON; runtime validation.",
    "Every payload must match schema.",
  ],
  [
    "D - Determinism",
    "Idempotency; safe retries; exactly-once.",
    "Duplicate triggers return same result.",
  ],
  [
    "R - Resilience",
    "Timeouts; circuit breakers; sagas.",
    "Retry vector DB with backoff.",
  ],
  [
    "I - Invalidation & Caching",
    "Freshness tags; policy-aware eviction.",
    "Auto-purge stale context.",
  ],
  [
    "V - Versioning & Eval Gates",
    "Canaries; golden sets; PR gates.",
    "Test prompts before rollout.",
  ],
  ["E - Economy", "Budgets on latency/tokens/$.", "Abort if cost > $0.25 or >8s."],
];

export const CYCLE_F = [
  "Clarify",
  "Yield",
  "Contextualize",
  "Learn",
  "Execute",
  "Feedback",
] as const;

export const COMPASS_MD = `# COMPASS-DRIVE

(Always-On Core for Agent Safety, Policy, and Determinism)

## Purpose
To make every agent operation compliant, observable, resilient, and cost-controlled - no matter what the task or phase.

| Layer | What It Ensures | Everyday Example |
|---|---|---|
| **C - Compliance** | Policies are written as code, versioned, and auditable. | Policy repo defines which data sources an agent may read. |
| **O - Observability** | End-to-end traces, metrics, cost, and lineage collection. | Each prompt and tool call emits spans to OpenTelemetry. |
| **M - Minimization** | Use least-privilege data; redact PII; respect TTLs. | Redact emails before embedding; auto-delete after 30 days. |
| **P - Policy & Permissions** | Role-, tenant-, and domain-scoped access control. | Finance agent can't read HR docs. |
| **A - AuthN / Z** | Authenticate identities and authorize scopes. | Verify API key or OIDC token before task starts. |
| **S - Safety I/O Sandwich** | Sanitize -> validate; block jailbreaks, bias, toxicity. | Pre- and post-filter model I/O. |
| **S - Schemas** | Strict JSON contracts and runtime validation. | Every payload must match its schema before use. |
| **D - Determinism** | Idempotency, safe retries, exactly-once semantics. | Duplicate triggers return the same stored result. |
| **R - Resilience** | Timeouts, circuit breakers, sagas, fault isolation. | Retry failed vector-DB call with exponential backoff. |
| **I - Invalidation & Caching** | Freshness tags and policy-aware cache eviction. | Auto-purge context older than its TTL. |
| **V - Versioning & Eval Gates** | Canary releases, golden sets, PR evaluation gates. | New prompt versions tested before rollout. |
| **E - Economy** | Hard budgets on latency, tokens, and $. | Abort if cost > $0.25 or > 8 s latency. |

## How It Relates to CYCLE-F
- Always running: DRIVE surrounds every stage (Clarify -> Feedback).
- Invisible scaffolding: You shouldn't notice it until something fails - then it catches the failure safely.
- Shared language: COMPASS-DRIVE terms show up in your SLOs, logs, and design docs.

## Memory Trick
COMPASS-DRIVE = the hull around the CYCLE.
When the compass spins (Clarify -> Feedback), DRIVE keeps the ship upright.
`;
