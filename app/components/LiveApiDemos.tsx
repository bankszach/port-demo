'use client';

import { useCallback, useEffect, useMemo, useState } from "react";

const ORCHESTRATOR_BASE = "https://agent-orchestrator-5c75vfnzoq-wl.a.run.app";
const FASTAPI_ROOT = "https://fastapi-mcp-5c75vfnzoq-wl.a.run.app";
const PREVIEW_ORIGIN = "https://port-demo-six.vercel.app";

const ENDPOINTS = {
  config: `${ORCHESTRATOR_BASE}/config`,
  catalog: `${ORCHESTRATOR_BASE}/catalog`,
  invoke: `${ORCHESTRATOR_BASE}/agent/invoke`,
  preflight: `${ORCHESTRATOR_BASE}/agent/invoke`,
  fastApiRoot: `${FASTAPI_ROOT}/`,
};

const CURL_BLOCKS = [
  {
    label: "/config",
    command:
      'curl -sS https://agent-orchestrator-5c75vfnzoq-wl.a.run.app/config | jq .',
  },
  {
    label: "Preflight /agent/invoke",
    command:
      'curl -i -X OPTIONS https://agent-orchestrator-5c75vfnzoq-wl.a.run.app/agent/invoke -H "Origin: https://port-demo-six.vercel.app" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type"',
  },
  {
    label: "fastapi-mcp root",
    command:
      'curl -sS https://fastapi-mcp-5c75vfnzoq-wl.a.run.app/ | jq .',
  },
];

type ErrorType = "cors" | "network" | "http";

type ApiCallResult = {
  status: number | null;
  ok: boolean;
  data: unknown | null;
  rawText: string | null;
  isJson: boolean;
  headers: Record<string, string>;
  fetchedAt: number | null;
  error?: string;
  errorType?: ErrorType;
};

type CatalogEntry = {
  server: string;
  toolName: string;
  isError: boolean;
};

type StatusTone = "success" | "warning" | "danger" | "neutral";

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function parseCatalog(value: unknown): CatalogEntry[] {
  if (!value) return [];

  if (typeof value === "string") {
    try {
      return parseCatalog(JSON.parse(value));
    } catch {
      return [];
    }
  }

  const results: CatalogEntry[] = [];

  const visit = (input: unknown) => {
    if (!input) return;

    if (Array.isArray(input)) {
      input.forEach(visit);
      return;
    }

    if (typeof input === "object") {
      const item = input as Record<string, unknown>;
      const server = item.server;
      const tool = item.tool as Record<string, unknown> | undefined;

      if (typeof server === "string" && tool && typeof tool.name === "string") {
        const toolName = String(tool.name);
        results.push({
          server,
          toolName,
          isError: toolName === "__error__",
        });
        return;
      }

      const nested =
        (Array.isArray(item.catalog) && item.catalog) ||
        (Array.isArray(item.tools) && item.tools) ||
        (Array.isArray(item.items) && item.items) ||
        (Array.isArray(item.data) && item.data);

      if (nested) {
        visit(nested);
      }
    }
  };

  visit(value);
  return results;
}

function formatTimestamp(timestamp: number | null | undefined) {
  if (!timestamp) return "—";
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function toPrettyJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return typeof value === "string" ? value : String(value);
  }
}

function StatusChip({
  tone,
  children,
}: {
  tone: StatusTone;
  children: string;
}) {
  const toneClasses: Record<StatusTone, string> = {
    success: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
    warning: "border-amber-400/40 bg-amber-500/15 text-amber-100",
    danger: "border-rose-500/40 bg-rose-500/15 text-rose-200",
    neutral: "border-white/12 bg-white/8 text-slate-200",
  };

  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}

function StatusStack({
  tone,
  label,
  caption,
  timestamp,
}: {
  tone: StatusTone;
  label: string;
  caption: string;
  timestamp: number | null | undefined;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-white/[0.04] p-4">
      <StatusChip tone={tone}>{label}</StatusChip>
      <div className="flex flex-col gap-1 text-xs text-slate-300">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
          {caption}
        </span>
        <span className="text-slate-400">
          Last checked · {formatTimestamp(timestamp)}
        </span>
      </div>
    </div>
  );
}

function ResponseCard({
  title,
  result,
  summary,
}: {
  title: string;
  result: ApiCallResult | null;
  summary: string | null;
}) {
  const statusLabel = result
    ? result.status !== null
      ? `HTTP ${result.status}`
      : "No response"
    : "Pending";

  const content = () => {
    if (!result) {
      return (
        <p className="text-sm text-slate-500">
          Awaiting first check.
        </p>
      );
    }

    if (result.error) {
      return (
        <p className="text-sm text-rose-600">
          {result.error}
        </p>
      );
    }

    if (result.isJson && result.data) {
      return (
        <pre className="max-h-56 overflow-auto rounded bg-slate-950/95 px-3 py-2 text-xs leading-relaxed text-slate-100">
          {toPrettyJson(result.data)}
        </pre>
      );
    }

    if (result.rawText) {
      return (
        <pre className="max-h-56 overflow-auto rounded bg-slate-950/95 px-3 py-2 text-xs leading-relaxed text-slate-100">
          {result.rawText}
        </pre>
      );
    }

    return (
      <p className="text-sm text-slate-500">
        No body returned.
      </p>
    );
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_18px_40px_-28px_rgba(40,119,255,0.65)]">
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            {title}
          </h3>
          {summary && (
            <p className="text-xs text-slate-400">
              {summary}
            </p>
          )}
          <span className="text-xs text-slate-500">
            Captured: {formatTimestamp(result?.fetchedAt)}
          </span>
        </div>
        <span className="font-mono text-xs text-slate-300">
          {statusLabel}
        </span>
      </div>
      {content()}
    </div>
  );
}

function CurlBlock({ label, command }: { label: string; command: string }) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [command]);

  return (
    <details
      className="rounded-xl border border-white/10 bg-white/[0.05] shadow-[0_15px_45px_-32px_rgba(58,124,255,0.6)]"
      open={isOpen}
      onToggle={(event) => {
        const target = event.currentTarget as HTMLDetailsElement;
        setIsOpen(target.open);
      }}
    >
      <summary className="flex cursor-pointer items-center justify-between gap-4 rounded-t-xl bg-white/[0.08] px-4 py-3 text-sm font-semibold text-slate-100">
        <span>{label}</span>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleCopy();
          }}
          className={classNames(
            "rounded-full border px-3 py-1 text-xs font-semibold transition",
            copied
              ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-100"
              : "border-white/20 bg-white/5 text-slate-100 hover:border-white/35 hover:bg-white/10",
          )}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </summary>
      <div className="border-t border-white/10 px-4 py-3">
        <pre className="overflow-auto font-mono text-xs leading-relaxed text-slate-200">
          {command}
        </pre>
      </div>
    </details>
  );
}

export default function LiveApiDemos() {
  const [configResult, setConfigResult] = useState<ApiCallResult | null>(null);
  const [catalogResult, setCatalogResult] = useState<ApiCallResult | null>(null);
  const [preflightResult, setPreflightResult] = useState<ApiCallResult | null>(
    null,
  );
  const [fastApiRootResult, setFastApiRootResult] =
    useState<ApiCallResult | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleFetch = useCallback(
    async (input: RequestInfo, init?: RequestInit): Promise<ApiCallResult> => {
      try {
        const response = await fetch(input, {
          mode: "cors",
          credentials: "omit",
          ...init,
        });

        const status = response.status ?? null;
        const text = await response.text();
        const lowerHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          lowerHeaders[key.toLowerCase()] = value;
        });

        const contentType = lowerHeaders["content-type"] ?? "";
        const guessesJson =
          contentType.includes("application/json") ||
          contentType.includes("text/json");

        let parsed: unknown = null;
        let isJson = false;
        if (text) {
          if (guessesJson) {
            try {
              parsed = JSON.parse(text);
              isJson = true;
            } catch {
              // keep as raw text
            }
          } else {
            try {
              parsed = JSON.parse(text);
              isJson = true;
            } catch {
              parsed = null;
              isJson = false;
            }
          }
        }

        return {
          status,
          ok: response.ok,
          data: isJson ? parsed : null,
          rawText: text || null,
          isJson,
          headers: lowerHeaders,
          fetchedAt: Date.now(),
          error:
            response.ok || response.statusText
              ? response.ok
                ? undefined
                : response.statusText || "Request failed"
              : undefined,
          errorType: response.ok ? undefined : "http",
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Network request failed";
        const normalized = message.toLowerCase();
        const isCors = normalized.includes("cors") || normalized.includes("fetch");
        return {
          status: null,
          ok: false,
          data: null,
          rawText: null,
          isJson: false,
          headers: {},
          fetchedAt: Date.now(),
          error: isCors
            ? "CORS blocked by orchestrator."
            : message || "Network request failed",
          errorType: isCors ? "cors" : "network",
        };
      }
    },
    [],
  );

  const refreshConfig = useCallback(async () => {
    const result = await handleFetch(ENDPOINTS.config);
    setConfigResult(result);
    return result;
  }, [handleFetch]);

  const refreshCatalog = useCallback(async () => {
    const result = await handleFetch(ENDPOINTS.catalog);
    setCatalogResult(result);
    return result;
  }, [handleFetch]);

  const refreshPreflight = useCallback(async () => {
    const result = await handleFetch(ENDPOINTS.preflight, {
      method: "OPTIONS",
      headers: {
        Origin: PREVIEW_ORIGIN,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });
    setPreflightResult(result);
    return result;
  }, [handleFetch]);

  const refreshFastApiRoot = useCallback(async () => {
    const result = await handleFetch(ENDPOINTS.fastApiRoot);
    setFastApiRootResult(result);
    return result;
  }, [handleFetch]);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshConfig(),
        refreshPreflight(),
        refreshFastApiRoot(),
        refreshCatalog(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshCatalog, refreshConfig, refreshFastApiRoot, refreshPreflight]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const catalogEntries = useMemo(
    () => parseCatalog(catalogResult?.data ?? catalogResult?.rawText),
    [catalogResult],
  );

  const fastApiHasHealthyTool = catalogEntries.some(
    (entry) => entry.server === "fastapi-mcp" && !entry.isError,
  );

  const corsHeaders = preflightResult?.headers ?? {};
  const corsHasOrigin = Boolean(
    corsHeaders["access-control-allow-origin"],
  );
  const corsHasMethods = Boolean(
    corsHeaders["access-control-allow-methods"],
  );
  const corsStatus = preflightResult?.status ?? null;
  const corsGreen =
    (corsStatus === 204 || corsStatus === 200) && corsHasOrigin && corsHasMethods;

  const fastApiRootOk = fastApiRootResult?.status === 200;

  const configSummary = useMemo(() => {
    if (!configResult?.isJson || !configResult.data) return null;
    const data = configResult.data as Record<string, unknown>;
    const servers = Array.isArray(data.servers_configured)
      ? (data.servers_configured as string[])
      : [];
    return servers.length > 0
      ? `servers_configured: ${servers.join(", ")}`
      : "No servers_configured reported.";
  }, [configResult]);

  const preflightSummary = useMemo(() => {
    if (!preflightResult) return null;
    const allowOrigin = corsHeaders["access-control-allow-origin"] ?? "—";
    const allowMethods = corsHeaders["access-control-allow-methods"] ?? "—";
    return `ACAO: ${allowOrigin} · ACAM: ${allowMethods}`;
  }, [corsHeaders, preflightResult]);

  const fastApiSummary = useMemo(() => {
    if (!fastApiRootResult?.isJson || !fastApiRootResult.data) return null;
    const rootData = fastApiRootResult.data as Record<string, unknown>;
    const keys = Object.keys(rootData);
    if (keys.length === 0) return "Empty JSON body.";
    return `Keys: ${keys.slice(0, 3).join(", ")}`;
  }, [fastApiRootResult]);

  const statusItems = useMemo(() => {
    const items: Array<{
      tone: StatusTone;
      label: string;
      caption: string;
      timestamp: number | null | undefined;
    }> = [];

    if (configResult?.status === 200) {
      items.push({
        tone: "success",
        label: "Orchestrator · Online",
        caption: ORCHESTRATOR_BASE.replace("https://", ""),
        timestamp: configResult.fetchedAt,
      });
    }

    if (corsGreen && preflightResult) {
      items.push({
        tone: "success",
        label: "CORS · Preflight OK",
        caption: "OPTIONS /agent/invoke",
        timestamp: preflightResult.fetchedAt,
      });
    }

    if (fastApiRootOk) {
      items.push({
        tone: fastApiHasHealthyTool ? "success" : "warning",
        label: fastApiHasHealthyTool
          ? "fastapi-mcp · Tools ready"
          : "fastapi-mcp · Root 200",
        caption: FASTAPI_ROOT.replace("https://", ""),
        timestamp: fastApiRootResult?.fetchedAt,
      });
    }

    return items;
  }, [
    configResult,
    corsGreen,
    fastApiHasHealthyTool,
    fastApiRootOk,
    fastApiRootResult?.fetchedAt,
    preflightResult,
  ]);

  const responseCards = useMemo(() => {
    const cards: Array<{
      title: string;
      result: ApiCallResult | null;
      summary: string | null;
    }> = [];

    if (configResult?.status === 200) {
      cards.push({
        title: "GET /config",
        result: configResult,
        summary: configSummary,
      });
    }

    if (corsGreen && preflightResult) {
      cards.push({
        title: "OPTIONS /agent/invoke",
        result: preflightResult,
        summary: preflightSummary,
      });
    }

    if (fastApiRootOk) {
      cards.push({
        title: "GET fastapi-mcp /",
        result: fastApiRootResult,
        summary: fastApiSummary,
      });
    }

    return cards;
  }, [
    configResult,
    configSummary,
    corsGreen,
    fastApiRootOk,
    fastApiRootResult,
    fastApiSummary,
    preflightResult,
    preflightSummary,
  ]);

  const availableCurlBlocks = useMemo(() => {
    const blocks: Array<(typeof CURL_BLOCKS)[number]> = [];
    if (configResult?.status === 200) blocks.push(CURL_BLOCKS[0]);
    if (corsGreen) blocks.push(CURL_BLOCKS[1]);
    if (fastApiRootOk) blocks.push(CURL_BLOCKS[2]);
    return blocks;
  }, [configResult, corsGreen, fastApiRootOk]);

  return (
    <section className="flex flex-col gap-8 rounded-3xl border border-white/12 bg-white/[0.04] p-6 shadow-[0_25px_65px_-35px_rgba(58,124,255,0.85)] sm:p-8">
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-slate-100 sm:text-2xl">
          Live API Demos (Stabilized)
        </h2>
        <p className="max-w-3xl text-sm text-slate-300 sm:text-base">
          Only green systems render. Each block is read-only, cached for live
          narration, and safe to re-check on demand.
        </p>
      </div>

      {statusItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statusItems.map((item) => (
            <StatusStack
              key={`${item.label}-${item.caption}`}
              tone={item.tone}
              label={item.label}
              caption={item.caption}
              timestamp={item.timestamp}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-sm text-slate-400">
          Successful health checks appear as soon as endpoints respond with the
          expected headers. Use Re-check below once infra is ready.
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={refreshAll}
          disabled={isRefreshing}
          className={classNames(
            "inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition",
            isRefreshing
              ? "border-white/15 bg-white/5 text-slate-400"
              : "border-sky-400/40 bg-sky-500/10 text-sky-100 hover:border-sky-300 hover:bg-sky-500/20",
          )}
        >
          {isRefreshing ? "Refreshing…" : "Re-check"}
        </button>
        <span className="text-sm text-slate-400">
          Runs GET /config, OPTIONS /agent/invoke, GET fastapi-mcp root.
        </span>
      </div>

      {responseCards.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-3">
          {responseCards.map((card) => (
            <ResponseCard
              key={card.title}
              title={card.title}
              result={card.result}
              summary={card.summary}
            />
          ))}
        </div>
      )}

      {availableCurlBlocks.length > 0 && (
        <div className="flex flex-col gap-3">
          {availableCurlBlocks.map((block) => (
            <CurlBlock
              key={block.label}
              label={block.label}
              command={block.command}
            />
          ))}
        </div>
      )}

      <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.05] p-5">
        <div className="text-sm font-semibold uppercase tracking-wide text-slate-200">
          MCP_SERVERS (read-only)
        </div>
        <pre className="overflow-auto rounded bg-black/60 px-3 py-2 font-mono text-xs leading-relaxed text-slate-200">
          {`[{"name":"fastapi-mcp","url":"https://fastapi-mcp-5c75vfnzoq-wl.a.run.app/"}]`}
        </pre>
        <p className="text-xs text-slate-400">
          To demo only config/CORS, run with MCP_SERVERS=[] so the orchestrator
          skips tool registration entirely.
        </p>
      </div>
    </section>
  );
}
