import OpenAI from "openai";

export async function planWithOpenAI(task: string, facts: string[]) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return [
      "- Define KPI + guardrails for one-week win.",
      "- Ship a tiny workflow with HITL approvals.",
      "- Measure p95 latency and cost per run daily; kill or scale.",
      "- Add COMPASS-DRIVE rails (traces, budgets) after the win.",
    ].join("\n");
  }

  const client = new OpenAI({ apiKey: key });
  const res = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: "Be terse. Bullet points only." },
      {
        role: "user",
        content: `Task: ${task}\nFacts: ${facts.join(
          " | ",
        )}\nOutput: 4-6 bullets, minimal plan for a one-week win.`,
      },
    ],
    temperature: 0.2,
    max_tokens: 250,
  } as any);

  return res.choices?.[0]?.message?.content ?? "- plan unavailable";
}
