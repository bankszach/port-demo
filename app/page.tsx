import Image from "next/image";
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
      "Production view of orchestrator health signals with read-only guarantees.",
    shippedBlurb:
      "Single-page demo wired to Cloud Run. Shows orchestrator config, browser CORS preflight, and live MCP root status. Catalog/invoke deliberately disabled until transport lands—see curl panel.",
  },
  {
    title: "Labor Agent UI",
    href: "https://labor-agent-ui.vercel.app/",
    description:
      "Streamlined dashboard for agent telemetry narratives and brand system demos.",
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
      "Lightweight storytelling site powered by modern web primitives.",
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
    <div className="font-sans grid grid-rows-[20px_1fr_20px] min-h-screen gap-16 p-8 pb-20 sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-16">
        <section className="flex w-full max-w-5xl flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Portfolio control center for live MCP demos
            </h1>
            <p className="text-base leading-relaxed text-slate-600">
              This Next.js workspace is wired to Google Cloud Run services so you
              can narrate orchestrator health, MCP uptime, and front-end launch
              links in real time during demos.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a
              className="inline-flex items-center gap-2 rounded-full border border-black/[.08] bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-black/80"
              href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="dark:invert"
                src="/vercel.svg"
                alt="Vercel logomark"
                width={20}
                height={20}
              />
              Deploy now
            </a>
            <a
              className="inline-flex items-center rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
              href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the docs
            </a>
          </div>
        </section>

        <section className="w-full max-w-5xl">
          <div className="mb-6 flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-slate-900">
              Launch Surfaces
            </h2>
            <p className="text-base text-slate-600">
              Keep these links handy for interviews—each one is production ready
              today.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {LIVE_PROJECTS.map((project) => (
              <a
                key={project.href}
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-600">{project.description}</p>
                  {project.shippedBlurb && (
                    <p className="text-sm text-slate-500">
                      {project.shippedBlurb}
                    </p>
                  )}
                </div>
                <span className="text-sm font-medium text-slate-700">
                  Open in new tab →
                </span>
              </a>
            ))}
          </div>
        </section>

        <div className="w-full max-w-5xl">
          <LiveApiDemos />
        </div>
      </main>
      <footer className="row-start-3 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
