"use client";

import { useState } from "react";

type StageTool = { tool: string; ok: boolean; ms: number };

type StageData = {
  plan?: string;
  facts?: string[];
  tools?: StageTool[];
  score?: Record<string, number>;
  [key: string]: unknown;
};

type Stage = {
  stage: string;
  ok: boolean;
  ms: number;
  data?: StageData;
};

type RunResponse = {
  runId: string;
  durationMs: number;
  stages: Stage[];
  kpis: Record<string, string>;
};

const INTRO_BULLETS = [
  "Clarify -> Feedback in one click with optional OpenAI plan.",
  "Stages stay deterministic so you can narrate COMPASS-DRIVE coverage.",
];

export default function FacadeAgent() {
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<RunResponse | null>(null);
  const [task, setTask] = useState(
    "Ship a 10-minute demo and one KPI win this week.",
  );

  async function run() {
    try {
      setLoading(true);
      const response = await fetch("/api/facade/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, kpi: "p95_latency" }),
      });
      const json = await response.json();
      setResp(json);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_35px_-20px_rgba(15,37,72,0.75)]">
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-slate-100">
          MCP Facade - CYCLE-F inside COMPASS-DRIVE
        </h3>
        <ul className="list-disc space-y-1 pl-4 text-sm text-slate-300">
          {INTRO_BULLETS.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-sky-400/40 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
          value={task}
          onChange={(event) => setTask(event.target.value)}
          placeholder="What should the facade ship?"
        />
        <button
          onClick={run}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Running..." : "Run demo"}
        </button>
      </div>

      {resp && (
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Run summary
          </div>
          <div className="text-sm text-slate-300">
            runId: <span className="font-mono text-slate-100">{resp.runId}</span>{" "}
            · {resp.durationMs} ms
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Kpi label="p95 latency" value={resp.kpis.p95_latency} />
            <Kpi label="cost per run" value={resp.kpis.cost_per_run} />
            <Kpi label="HITL approval" value={resp.kpis.hitl_approval} />
          </div>

          <div className="space-y-3">
            {resp.stages.map((stage, index) => (
              <StageCard key={index} stage={stage} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StageCard({ stage }: { stage: Stage }) {
  const facts = stage.data?.facts ?? [];
  const tools = stage.data?.tools ?? [];
  const score = stage.data?.score ?? null;

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-100">{stage.stage}</div>
        <div className="text-xs font-medium text-emerald-400">
          {stage.ok ? "OK" : "Issue"} · {stage.ms} ms
        </div>
      </div>

      {typeof stage.data?.plan === "string" && (
        <pre className="whitespace-pre-wrap rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-slate-200">
          {stage.data.plan}
        </pre>
      )}

      {facts.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
          {facts.map((fact, factIndex) => (
            <li key={factIndex}>{fact}</li>
          ))}
        </ul>
      )}

      {tools.length > 0 && (
        <div className="space-y-1 text-xs text-slate-400">
          {tools.map((tool, toolIndex) => (
            <div
              key={toolIndex}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2"
            >
              <span className="font-mono text-slate-200">{tool.tool}</span>
              <span className="text-slate-300">
                {tool.ok ? "OK" : "Issue"} · {tool.ms} ms
              </span>
            </div>
          ))}
        </div>
      )}

      {score && (
        <div className="grid gap-2 sm:grid-cols-3">
          {Object.entries(score).map(([metric, value]) => (
            <div
              key={metric}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200"
            >
              <div className="uppercase tracking-[0.2em] text-slate-500">
                {metric}
              </div>
              <div className="text-lg font-semibold text-slate-100">{value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
        {label}
      </div>
      <div className="text-2xl font-semibold text-slate-100">{value}</div>
    </div>
  );
}
