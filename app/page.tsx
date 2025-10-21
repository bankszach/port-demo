import ReactMarkdown from "react-markdown";

import FacadeAgent from "@/components/FacadeAgent";
import { COMPASS_MD } from "@/utils/facadeData";

import LiveApiDemos from "./components/LiveApiDemos";

type LiveProject = {
  title: string;
  href: string;
  description: string;
  shippedBlurb?: string;
};

const LIVE_PROJECTS: LiveProject[] = [
  {
    title: "Portfolio API Demo",
    href: "https://port-demo-six.vercel.app/",
    description:
      "Live Cloud Run wiring with verified read-only checks and infra narration.",
    shippedBlurb:
      "Single-page demo wired to Cloud Run. Shows orchestrator config, browser CORS preflight, and live MCP root status. Catalog/invoke deliberately disabled until transport lands—see curl panel.",
  },
  {
    title: "Labor Agent UI",
    href: "https://labor-agent-ui.vercel.app/",
    description:
      "Launch-only telemetry console showcasing agent UX patterns and brand system.",
    shippedBlurb:
      "Frontend-only console with curated data; showcases UI/brand and agent telemetry patterns without backend provisioning.",
  },
  {
    title: "Banksorg.com",
    href: "https://www.banksorg.com/",
    description:
      "Studio portfolio for banking UX explorations and pitch decks.",
  },
  {
    title: "GhostLark.com",
    href: "https://ghostlark.com/",
    description:
      "Lightweight storytelling surface powered by modern web primitives.",
  },
  {
    title: "Design Benchmark (not my build)",
    href: "https://www.kalidyne.com/",
    description:
      "Reference experience used to compare motion and layout polish.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-10 sm:px-10 sm:py-16">
        <section className="flex flex-col gap-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-200/80">
            Zach Banks AI Engineer
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
              Portfolio control center for live MCP demos
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
              A single operational view of production-safe demos, agent
              orchestrator health, and verified endpoints. Everything on this
              page is wired to shipping infrastructure so you can narrate uptime
              with confidence.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/10 px-5 py-2 text-sm font-semibold text-sky-100 transition hover:border-sky-300 hover:bg-sky-500/20"
              href="https://port-demo-six.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open portfolio demo ↗
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/10"
              href="mailto:hello@cognitivedesign.group"
            >
              Request briefing
            </a>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-slate-100 sm:text-2xl">
              Launch surfaces
            </h2>
            <p className="max-w-3xl text-sm text-slate-300 sm:text-base">
              Only links with current production coverage stay visible here.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {LIVE_PROJECTS.map((project) => (
              <a
                key={project.href}
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_35px_-20px_rgba(15,37,72,0.75)] transition hover:border-sky-400/40 hover:bg-white/[0.08]"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-slate-100">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-300">
                    {project.description}
                  </p>
                  {project.shippedBlurb && (
                    <p className="text-sm text-slate-400">
                      {project.shippedBlurb}
                    </p>
                  )}
                </div>
                <span className="text-sm font-medium text-sky-200">
                  Open in new tab →
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-slate-100 sm:text-2xl">
              MCP facade run loop
            </h2>
            <p className="max-w-3xl text-sm text-slate-300 sm:text-base">
              CYCLE-F stages wrapped in COMPASS-DRIVE guardrails. Runs the whole
              loop with hard-wired data so you can narrate how it fits together.
            </p>
          </div>
          <FacadeAgent />
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_35px_-20px_rgba(15,37,72,0.75)]">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-slate-100 sm:text-2xl">
              Architecture at a glance
            </h2>
            <p className="max-w-3xl text-sm text-slate-300 sm:text-base">
              COMPASS-DRIVE surrounds the loop. Use this copy for quick walk
              throughs with Chris or anyone curious about the hull.
            </p>
          </div>
          <div className="prose prose-invert max-w-none text-sm">
            <ReactMarkdown>{COMPASS_MD}</ReactMarkdown>
          </div>
        </section>

        <LiveApiDemos />

        <footer className="flex flex-col gap-2 border-t border-white/5 pt-8 text-xs text-slate-500 sm:text-sm">
          <span>© {new Date().getFullYear()} Zach Banks AI Engineer</span>
          <span className="text-slate-600">
            All live systems shown are read-only friendly and sanitized for
            demos.
          </span>
        </footer>
      </main>
    </div>
  );
}
