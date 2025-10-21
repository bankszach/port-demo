'use client';

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const ORCHESTRATOR_BASE =
  "https://agent-orchestrator-596716165839.us-west2.run.app";
const ENDPOINTS = {
  config: `${ORCHESTRATOR_BASE}/config`,
  catalog: `${ORCHESTRATOR_BASE}/catalog`,
  invoke: `${ORCHESTRATOR_BASE}/agent/invoke`,
};

const FRONTEND_LINKS = [
  { label: "Labor Agent UI (demo)", href: "https://labor-agent-ui.vercel.app/" },
  { label: "Banksorg.com", href: "https://www.banksorg.com/" },
  { label: "GhostLark.com", href: "https://ghostlark.com/" },
  {
    label: "Design Benchmark (not my build)",
    href: "https://www.kalidyne.com/",
  },
];

type ErrorType = "cors" | "network" | "http";

type ApiCallResult = {
  status: number | null;
  ok: boolean;
  data: unknown | null;
  rawText: string | null;
  isJson: boolean;
  error?: string;
  errorType?: ErrorType;
};

type CatalogEntry = {
  server: string;
  toolName: string;
  toolTitle?: string;
  raw: Record<string, unknown>;
  isError: boolean;
};

const CORS_MESSAGE =
  "CORS blocked by server. For the demo, set ALLOW_ORIGINS='*' on the orchestrator.";

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function toPrettyJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function parseCatalog(data: unknown): CatalogEntry[] {
  if (!data) return [];

  if (typeof data === "string") {
    try {
      return parseCatalog(JSON.parse(data));
    } catch {
      return [];
    }
  }

  const rows: CatalogEntry[] = [];

  const visit = (value: unknown) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (typeof value === "object") {
      const item = value as Record<string, unknown>;
      const server = item.server;
      const tool = item.tool as Record<string, unknown> | undefined;

      if (
        typeof server === "string" &&
        tool &&
        typeof tool.name === "string"
      ) {
        rows.push({
          server,
          toolName: String(tool.name),
          toolTitle:
            typeof tool.title === "string" ? String(tool.title) : undefined,
          raw: item,
          isError: String(tool.name) === "__error__",
        });
        return;
      }

      const nested =
        (Array.isArray(item.catalog) && item.catalog) ||
        (Array.isArray(item.tools) && item.tools) ||
        (Array.isArray(item.data) && item.data) ||
        (Array.isArray(item.items) && item.items);

      if (nested) {
        visit(nested);
      }
    }
  };

  visit(data);
  return rows;
}

function Badge({
  tone,
  children,
}: {
  tone: "success" | "warning" | "danger" | "info";
  children: ReactNode;
}) {
  const toneClasses: Record<typeof tone, string> = {
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    danger: "bg-rose-100 text-rose-700 border-rose-200",
    info: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={classNames(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium",
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}

function ResponseViewer({ title, result }: { title: string; result: ApiCallResult | null }) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(true);
  }, [result?.status, result?.rawText]);

  if (!result) return null;

  const statusLabel =
    result.status !== null ? `HTTP ${result.status}` : "No response";

  return (
    <div className="rounded-lg border border-slate-200 bg-white/70 shadow-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-t-lg bg-slate-50 px-4 py-2 text-left text-sm font-medium text-slate-700"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <span className="font-mono text-xs uppercase">{statusLabel}</span>
      </button>
      {result.error && (
        <div className="border-t border-slate-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {result.error}
        </div>
      )}
      {isOpen && (
        <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-sm">
          {!result.isJson && result.rawText && (
            <span className="inline-flex w-fit items-center gap-1 rounded bg-slate-200 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-700">
              non-JSON
            </span>
          )}
          <pre className="max-h-64 overflow-auto rounded bg-slate-900/95 px-3 py-2 font-mono text-xs leading-relaxed text-slate-100">
            {result.isJson
              ? toPrettyJson(result.data)
              : result.rawText || "—"}
          </pre>
        </div>
      )}
    </div>
  );
}

export function LiveApiDemos() {
  const [toast, setToast] = useState<string | null>(null);
  const [configState, setConfigState] = useState<ApiCallResult | null>(null);
  const [catalogState, setCatalogState] = useState<ApiCallResult | null>(null);
  const [invokeState, setInvokeState] = useState<ApiCallResult | null>(null);
  const [clockInvokeState, setClockInvokeState] =
    useState<ApiCallResult | null>(null);
  const [fastApiInvokeState, setFastApiInvokeState] =
    useState<ApiCallResult | null>(null);

  const hasPrimed = useRef(false);

  const showToast = useCallback((message: string) => {
    setToast(message);
    const timer = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleFetch = useCallback(
    async (input: RequestInfo, init?: RequestInit): Promise<ApiCallResult> => {
      try {
        const method = init?.method ?? "GET";
        const headers =
          method && method.toUpperCase() !== "GET"
            ? {
                "Content-Type": "application/json",
                ...(init?.headers || {}),
              }
            : init?.headers;

        const response = await fetch(input, {
          mode: "cors",
          credentials: "omit",
          ...init,
          headers,
        });

        const status = response.status ?? null;
        const text = await response.text();
        const contentType = response.headers.get("content-type") ?? "";
        const looksJson =
          contentType.includes("application/json") ||
          contentType.includes("text/json");

        let data: unknown = null;
        let isJson = false;
        if (text) {
          if (looksJson) {
            try {
              data = JSON.parse(text);
              isJson = true;
            } catch {
              // fall through
            }
          }

          if (!isJson) {
            try {
              data = JSON.parse(text);
              isJson = true;
            } catch {
              isJson = false;
            }
          }
        }

        return {
          status,
          ok: response.ok,
          data: isJson ? data : null,
          rawText: text || null,
          isJson,
          error: response.ok ? undefined : response.statusText || "Request failed",
          errorType: response.ok ? undefined : "http",
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Network request failed";
        const isCors =
          error instanceof TypeError && message.toLowerCase().includes("fetch");
        if (isCors) {
          showToast(CORS_MESSAGE);
        }
        return {
          status: null,
          ok: false,
          data: null,
          rawText: null,
          isJson: false,
          error: isCors ? CORS_MESSAGE : message,
          errorType: isCors ? "cors" : "network",
        };
      }
    },
    [showToast],
  );

  const refreshConfig = useCallback(async () => {
    const result = await handleFetch(ENDPOINTS.config);
    setConfigState(result);
  }, [handleFetch]);

  const refreshCatalog = useCallback(async () => {
    const result = await handleFetch(ENDPOINTS.catalog);
    setCatalogState(result);
  }, [handleFetch]);

  const callOrchestratorInvoke = useCallback(async () => {
    const result = await handleFetch(ENDPOINTS.invoke, {
      method: "POST",
      body: JSON.stringify({
        server: "clock",
        tool: "get_time",
        arguments: {},
      }),
    });
    setInvokeState(result);
    return result;
  }, [handleFetch]);

  const callClock = useCallback(async () => {
    const result = await callOrchestratorInvoke();
    setClockInvokeState(result);
  }, [callOrchestratorInvoke]);

  const callFastApi = useCallback(
    async (toolName: string) => {
      const result = await handleFetch(ENDPOINTS.invoke, {
        method: "POST",
        body: JSON.stringify({
          server: "fastapi-mcp",
          tool: toolName,
          arguments: {},
        }),
      });
      setFastApiInvokeState(result);
    },
    [handleFetch],
  );

  useEffect(() => {
    if (hasPrimed.current) return;
    hasPrimed.current = true;
    refreshConfig();
    refreshCatalog();
  }, [refreshCatalog, refreshConfig]);

  const catalogEntries = useMemo(
    () => parseCatalog(catalogState?.data ?? catalogState?.rawText),
    [catalogState],
  );

  const fastApiEntries = useMemo(
    () => catalogEntries.filter((entry) => entry.server === "fastapi-mcp"),
    [catalogEntries],
  );

  const fastApiTools = useMemo(
    () => fastApiEntries.filter((entry) => !entry.isError),
    [fastApiEntries],
  );

  const fastApiHasSentinel = fastApiEntries.some((entry) => entry.isError);

  const orchestratorHasSentinel = catalogEntries.some(
    (entry) => entry.isError,
  );

  const orchestratorHealth = useMemo(() => {
    if (!configState || configState.status !== 200) return "Down";

    if (!catalogState || catalogState.status !== 200) {
      return "Degraded";
    }

    if (orchestratorHasSentinel) {
      return "Degraded";
    }

    const serversConfigured = Array.isArray(
      (configState.data as Record<string, unknown> | null)?.servers_configured,
    )
      ? ((configState.data as Record<string, unknown>).servers_configured as string[])
      : [];

    const hasClock = serversConfigured.includes("clock");
    const hasFastApi = serversConfigured.includes("fastapi-mcp");
    if (hasClock && hasFastApi) {
      return "Healthy";
    }

    return "Degraded";
  }, [catalogState, configState, orchestratorHasSentinel]);

  const orchestratorBadgeTone =
    orchestratorHealth === "Healthy"
      ? "success"
      : orchestratorHealth === "Degraded"
        ? "warning"
        : "danger";

  const fastApiStatus = useMemo(() => {
    if (catalogState?.errorType === "cors") return "Private";
    if (fastApiTools.length > 0) return "Healthy";
    if (fastApiHasSentinel) return "Unavailable (503)";
    if (catalogState && catalogState.status && catalogState.status >= 400)
      return `HTTP ${catalogState.status}`;
    if (catalogState?.errorType === "network") return "Network error";
    return "Awaiting catalog";
  }, [catalogState, fastApiHasSentinel, fastApiTools.length]);

  const fastApiBadgeTone =
    fastApiStatus === "Healthy"
      ? "success"
      : fastApiStatus === "Private"
        ? "warning"
        : fastApiStatus.includes("Unavailable") || fastApiStatus.includes("HTTP")
          ? "danger"
          : "info";

  const clockBadge = clockInvokeState
    ? clockInvokeState.status === 200
      ? "Healthy"
      : `HTTP ${clockInvokeState.status ?? "—"}`
    : "Awaiting call";

  const clockBadgeTone =
    clockBadge === "Healthy"
      ? "success"
      : clockBadge.startsWith("HTTP")
        ? "danger"
        : "info";

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">
          Live API Demos
        </h2>
        <p className="text-base text-slate-600">
          Hit the orchestrator & MCPs in real time. Open the front-end demos in
          new tabs.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="col-span-1 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm lg:col-span-2">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Agent Orchestrator
              </h3>
              <p className="text-sm text-slate-600">
                Hard-wired to {ORCHESTRATOR_BASE}
              </p>
            </div>
            <Badge tone={orchestratorBadgeTone}>
              {orchestratorHealth}
            </Badge>
          </header>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
              onClick={refreshConfig}
              type="button"
            >
              View /config
            </button>
            <button
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
              onClick={refreshCatalog}
              type="button"
            >
              View /catalog
            </button>
            <button
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
              onClick={callOrchestratorInvoke}
              type="button"
            >
              Invoke: clock/get_time
            </button>
          </div>

          <div className="grid gap-4">
            <ResponseViewer title="GET /config" result={configState} />
            <ResponseViewer title="GET /catalog" result={catalogState} />
            <ResponseViewer
              title="POST /agent/invoke (clock/get_time)"
              result={invokeState}
            />
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              Catalog Snapshot
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 font-semibold text-slate-700">
                      server
                    </th>
                    <th className="px-4 py-2 font-semibold text-slate-700">
                      tool.name
                    </th>
                    <th className="px-4 py-2 font-semibold text-slate-700">
                      tool.title
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {catalogEntries.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-3 text-center text-sm text-slate-500"
                      >
                        Call /catalog to load entries.
                      </td>
                    </tr>
                  )}
                  {catalogEntries
                    .filter((entry) => !entry.isError)
                    .map((entry, index) => (
                      <tr key={`${entry.server}-${entry.toolName}-${index}`}>
                        <td className="px-4 py-2 font-mono text-xs text-slate-700">
                          {entry.server}
                        </td>
                        <td className="px-4 py-2 font-mono text-xs text-slate-700">
                          {entry.toolName}
                        </td>
                        <td className="px-4 py-2 text-xs text-slate-600">
                          {entry.toolTitle ?? "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {orchestratorHasSentinel && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
              MCP reported <strong>503</strong> (Service Unavailable). Check the
              MCP service.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {FRONTEND_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
              >
                {link.label}
              </a>
            ))}
          </div>
        </article>

        <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <header className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Clock MCP (reference)
              </h3>
              <p className="text-sm text-slate-600">
                Routed through orchestrator invoke
              </p>
            </div>
            <Badge tone={clockBadgeTone}>{clockBadge}</Badge>
          </header>

          <button
            className="w-fit rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
            onClick={callClock}
            type="button"
          >
            Clock → get_time
          </button>

          <ResponseViewer
            title="POST /agent/invoke (clock/get_time)"
            result={clockInvokeState}
          />
        </article>

        <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm lg:col-span-3">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                FastAPI MCP (service-under-test)
              </h3>
              <p className="text-sm text-slate-600">
                Catalog filtered to fastapi-mcp via orchestrator
              </p>
            </div>
            <Badge tone={fastApiBadgeTone}>{fastApiStatus}</Badge>
          </header>

          <div className="rounded-lg border border-slate-200 bg-white/60">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              Catalog tools
            </div>
            <ul className="divide-y divide-slate-100">
              {fastApiTools.length > 0 ? (
                fastApiTools.map((entry, index) => (
                  <li key={`${entry.toolName}-${index}`} className="px-4 py-2">
                    <span className="font-mono text-xs text-slate-700">
                      {entry.toolName}
                    </span>
                    {entry.toolTitle && (
                      <span className="ml-2 text-xs text-slate-500">
                        {entry.toolTitle}
                      </span>
                    )}
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-sm text-slate-500">
                  {catalogState
                    ? "Call /catalog to populate the tool list."
                    : "Awaiting catalog response."}
                </li>
              )}
            </ul>
          </div>

          {fastApiHasSentinel && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
              MCP reported <strong>503</strong> (Service Unavailable). Check the
              MCP service.
            </p>
          )}

          {catalogState?.errorType === "cors" && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
              Auth/CORS required.
            </p>
          )}

          {fastApiTools.length > 0 && (
            <button
              className="w-fit rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
              onClick={() => callFastApi(fastApiTools[0].toolName)}
              type="button"
            >
              Invoke first tool ({fastApiTools[0].toolName})
            </button>
          )}

          <ResponseViewer
            title="POST /agent/invoke (fastapi-mcp)"
            result={fastApiInvokeState}
          />
        </article>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          Front-end demos
        </h3>
        <p className="mb-4 text-sm text-slate-600">
          Open these portfolio surfaces in new tabs.
        </p>
        <div className="flex flex-wrap gap-2">
          {FRONTEND_LINKS.map((link) => (
            <a
              key={`${link.href}-footer`}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-xs rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 shadow-lg">
          {toast}
        </div>
      )}
    </section>
  );
}

export default LiveApiDemos;
