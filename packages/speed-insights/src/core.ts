import type { Metric } from "web-vitals";

export type DeviceType = "mobile" | "desktop";

export interface BatchOptions {
  /** Enable client-side batching. Default: false (sends events individually for maximum compatibility). */
  enabled?: boolean;
  /** Max number of events per batch. Default: 20 */
  size?: number;
  /** Flush interval in milliseconds. Default: 5000 */
  intervalMs?: number;
  /** Optional explicit batch endpoint. If omitted, we'll try `${endpoint}/batch`. */
  endpoint?: string;
}

export interface InitOptions {
  /** Default: https://pulsebear.com/vitals */
  endpoint?: string;
  /** Project identifier (required). */
  projectId: string;
  /** Sample rate between 0 and 1. Default: 1 (100%). */
  sampling?: number;
  /** Additional headers sent with requests. */
  headers?: Record<string, string>;
  /** Batching configuration. */
  batch?: BatchOptions;
  /** Provide extra context (added to every event). Keep it small and PII-free. */
  getContext?: () => Record<string, unknown>;
  /** Log to console for debugging. Default: false */
  debug?: boolean;
  /** Pass options to web-vitals listeners. */
  vitals?: {
    reportAllChanges?: boolean;
  };
}

export type WebVitalEvent = {
  type: "web-vital";
  metric: Pick<Metric, "name" | "value" | "id">;
  timestamp: number;
  deviceType: DeviceType;
  attribution?: Record<string, unknown>;
  context?: Record<string, unknown>;
};

export type CustomEvent = {
  type: "custom";
  name: string;
  value?: number;
  attributes?: Record<string, unknown>;
  timestamp: number;
  deviceType: DeviceType;
  context?: Record<string, unknown>;
};

export type PulseBearEvent = WebVitalEvent | CustomEvent;

type InternalState = {
  initialized: boolean;
  options: Required<Pick<InitOptions, "endpoint" | "sampling" | "debug">> &
    Pick<InitOptions, "headers" | "batch" | "getContext" | "vitals"> & {
      projectId: string;
    };
  queue: PulseBearEvent[];
  flushTimer?: number;
  listenersBound: boolean;
};

const DEFAULT_ENDPOINT = "http://localhost:3000/speed/report";
const DEFAULT_BATCH_SIZE = 20;
const DEFAULT_BATCH_INTERVAL = 5000;
const MAX_QUEUE_SIZE = 1000;

const state: InternalState = {
  initialized: false,
  options: {
    endpoint: DEFAULT_ENDPOINT,
    projectId: "",
    sampling: 1,
    debug: false,
  },
  queue: [],
  listenersBound: false,
};

function isBrowser() {
  return typeof window !== "undefined" && typeof navigator !== "undefined";
}

function logDebug(...args: unknown[]) {
  if (state.options.debug) console.debug("[PulseBear]", ...args);
}

function getDeviceType(): DeviceType {
  if (!isBrowser()) return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  return /mobi|android|iphone|ipad|ipod/.test(ua) ? "mobile" : "desktop";
}

function getAttribution(): Record<string, unknown> {
  if (!isBrowser()) return {};
  const nav = navigator as any;
  const connection =
    nav.connection || nav.mozConnection || nav.webkitConnection;
  const dpr =
    typeof window !== "undefined" ? window.devicePixelRatio : undefined;
  return {
    connection: connection
      ? {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        }
      : undefined,
    deviceMemory: (nav as any).deviceMemory,
    hardwareConcurrency: nav.hardwareConcurrency,
    dpr,
    locale: navigator.language,
    viewport:
      typeof window !== "undefined"
        ? { w: window.innerWidth, h: window.innerHeight }
        : undefined,
    page:
      typeof window !== "undefined"
        ? { url: window.location.href, path: window.location.pathname }
        : undefined,
  };
}

function currentContext() {
  try {
    return state.options.getContext ? state.options.getContext() : undefined;
  } catch (e) {
    logDebug("getContext error", e);
    return undefined;
  }
}

function shouldSample(): boolean {
  const r = state.options.sampling ?? 1;
  // Respect Do Not Track
  if (typeof navigator !== "undefined") {
    const dnt =
      (navigator as any).doNotTrack ||
      (window as any).doNotTrack ||
      (navigator as any).msDoNotTrack;
    if (dnt === "1" || dnt === 1) return false;
  }
  if (r >= 1) return true;
  if (r <= 0) return false;
  return Math.random() < r;
}

function scheduleFlush() {
  if (!state.options.batch?.enabled) return; // timer-based flush not needed when batching disabled
  const interval = state.options.batch?.intervalMs ?? DEFAULT_BATCH_INTERVAL;
  if (state.flushTimer) return;
  state.flushTimer = setTimeout(() => {
    state.flushTimer = undefined;
    void flushQueue();
  }, interval) as unknown as number;
}

function getBatchEndpoint(): string {
  const endpoint = state.options.endpoint || DEFAULT_ENDPOINT;
  if (state.options.batch?.endpoint) return state.options.batch.endpoint;
  // naive default: append /batch
  return endpoint.replace(/\/$/, "") + "/batch";
}

async function sendPayload(body: unknown, useBeacon: boolean) {
  const url = state.options.batch?.enabled
    ? getBatchEndpoint()
    : state.options.endpoint;
  const json = JSON.stringify({
    projectId: state.options.projectId,
    events: Array.isArray(body) ? body : [body],
  });

  // Prefer sendBeacon when allowed
  if (useBeacon && isBrowser() && (navigator as any).sendBeacon) {
    try {
      const blob = new Blob([json], { type: "application/json" });
      (navigator as any).sendBeacon(url, blob);
      return;
    } catch (e) {
      // fallthrough to fetch
    }
  }

  try {
    await fetch(url, {
      method: "POST",
      body: json,
      headers: {
        "Content-Type": "application/json",
        ...(state.options.headers || {}),
      },
      keepalive: true,
      credentials: "omit",
    });
  } catch (e) {
    logDebug("send error", e);
    // If failed and we're online, keep events for the next attempt (basic retry on next flush)
    if (Array.isArray(body)) state.queue.unshift(...(body as PulseBearEvent[]));
    else state.queue.unshift(body as PulseBearEvent);
  }
}

async function flushQueue(forceBeacon = false) {
  if (!isBrowser()) return;
  if (state.queue.length === 0) return;
  if (navigator && "onLine" in navigator && !navigator.onLine) {
    logDebug("offline, delaying flush");
    return;
  }

  const batchEnabled = !!state.options.batch?.enabled;
  const items = state.queue.splice(
    0,
    batchEnabled ? (state.options.batch?.size ?? DEFAULT_BATCH_SIZE) : 1
  );

  await sendPayload(batchEnabled ? items : items[0], forceBeacon);

  // More in queue? Schedule another flush quickly
  if (state.queue.length > 0) {
    scheduleFlush();
  }
}

function bindLifecycleListeners() {
  if (!isBrowser() || state.listenersBound) return;
  state.listenersBound = true;

  const flushHidden = () => void flushQueue(true);
  // Flush before the page gets hidden or unloaded
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flushHidden();
    });
    window.addEventListener("pagehide", flushHidden);
    window.addEventListener("beforeunload", flushHidden);
  }

  // Flush when back online
  if (typeof window !== "undefined") {
    window.addEventListener("online", () => void flushQueue());
  }
}

function enqueue(event: PulseBearEvent) {
  if (!shouldSample()) return;
  state.queue.push(event);
  if (state.queue.length > MAX_QUEUE_SIZE) {
    // Drop oldest to cap memory usage
    state.queue.splice(0, state.queue.length - MAX_QUEUE_SIZE);
  }
  const batchEnabled = !!state.options.batch?.enabled;
  if (!batchEnabled) {
    // Send immediately when batching is disabled
    void flushQueue();
  } else {
    scheduleFlush();
    const size = state.options.batch?.size ?? DEFAULT_BATCH_SIZE;
    if (state.queue.length >= size) void flushQueue();
  }
}

export async function initPulseBearVitals(options: InitOptions) {
  if (!isBrowser()) return; // SSR/Node safe no-op
  if (state.initialized) {
    // Allow runtime updates of options minimally
    state.options = {
      ...state.options,
      ...options,
      endpoint: options.endpoint ?? DEFAULT_ENDPOINT,
      sampling: options.sampling ?? 1,
      debug: options.debug ?? false,
    };
    return;
  }

  // Initialize options
  state.options = {
    endpoint: options.endpoint ?? DEFAULT_ENDPOINT,
    projectId: options.projectId,
    sampling: options.sampling ?? 1,
    headers: options.headers,
    batch: options.batch,
    getContext: options.getContext,
    debug: options.debug ?? false,
    vitals: options.vitals,
  };
  state.initialized = true;

  bindLifecycleListeners();

  // Lazy import web-vitals only in the browser
  const { onCLS, onFCP, onLCP, onINP, onTTFB } = await import("web-vitals");
  const opts = state.options.vitals || {};
  const listener = (metric: Metric) => {
    const event: WebVitalEvent = {
      type: "web-vital",
      metric: { name: metric.name, value: metric.value, id: metric.id },
      timestamp: Date.now(),
      deviceType: getDeviceType(),
      attribution: getAttribution(),
      context: currentContext(),
    };
    enqueue(event);
  };

  onCLS(listener, opts);
  onFCP(listener, opts);
  onLCP(listener, opts);
  onINP(listener, opts);
  onTTFB(listener, opts);
}

/** Manually report a custom numeric metric. */
export function reportCustomMetric(
  name: string,
  value?: number,
  attributes?: Record<string, unknown>
) {
  if (!isBrowser() || !state.initialized) return;
  const event: CustomEvent = {
    type: "custom",
    name,
    value,
    attributes,
    timestamp: Date.now(),
    deviceType: getDeviceType(),
    context: currentContext(),
  };
  enqueue(event);
}

/** Update runtime context provider. */
export function setContextProvider(getContext?: InitOptions["getContext"]) {
  state.options.getContext = getContext;
}

/** Force sending events immediately. Useful in tests. */
export async function flush() {
  await flushQueue();
}

/** Return whether the SDK is initialized in this document. */
export function isInitialized() {
  return state.initialized;
}
