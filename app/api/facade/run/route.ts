import { NextResponse } from "next/server";
import { planWithOpenAI } from "@/utils/openaiFacade";

type Stage = {
  stage: string;
  ok: boolean;
  ms: number;
  data?: Record<string, unknown>;
};

type RunResponse = {
  runId: string;
  durationMs: number;
  stages: Stage[];
  kpis: Record<string, string>;
};

const randomMs = () => 50 + Math.floor(Math.random() * 120);

export async function POST(request: Request) {
  const { task = "Ship a 10-minute demo and one KPI win", kpi = "p95_latency" } =
    await request.json().catch(() => ({}));

  const started = Date.now();
  const stages: Stage[] = [];

  const push = (stage: Stage["stage"], data: Stage["data"] = {}) => {
    stages.push({ stage, ok: true, ms: randomMs(), data });
  };

  push("Clarify", {
    task,
    slo: { kpi, target: "<= 8s", budget: "<= $0.25" },
  });

  push("Yield", {
    trigger: "/api/facade/run",
    at: new Date().toISOString(),
  });

  const facts = [
    "COMPASS-DRIVE surrounds every stage with safety, policy, and cost controls.",
    "CYCLE-F = Clarify -> Yield -> Contextualize -> Learn -> Execute -> Feedback.",
    "HITL where it matters; schema checks at boundaries.",
  ];

  push("Contextualize", { facts });

  const plan = await planWithOpenAI(task, facts);
  push("Learn", { plan });

  push("Execute", {
    tools: [
      { tool: "vector.search", ok: true, ms: 110 },
      { tool: "slack.post", ok: true, ms: 90 },
      { tool: "db.write", ok: true, ms: 80 },
    ],
  });

  const score = { quality: 0.92, grounded: 0.9, est_cost_usd: 0.018 };
  push("Feedback", { score });

  const durationMs = Date.now() - started;
  const kpis = {
    p95_latency: "7.6 s",
    cost_per_run: "$0.014",
    hitl_approval: "94.1%",
  };

  const response: RunResponse = {
    runId: Math.random().toString(36).slice(2, 8),
    durationMs,
    stages,
    kpis,
  };

  return NextResponse.json(response);
}
