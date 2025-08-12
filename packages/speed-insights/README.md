# @pulsebear/speed-insights

Enterprise-ready, lightweight Web Vitals SDK for PulseBear.

## Features

- Safe in SSR/Edge environments (no-ops outside the browser)
- sendBeacon-first with fetch fallback
- Optional batching with flush on pagehide/visibilitychange/offline→online
- Sampling (0..1) to control volume
- Context provider to attach custom metadata (PII-free)
- Device + network attribution (effectiveType, rtt, DPR, etc.)
- Tiny core, optional React component entry `@pulsebear/speed-insights/react`
- TypeScript types and ESM/CJS builds

## Install

```bash
pnpm add @pulsebear/speed-insights
```

## Usage (vanilla)

```ts
import {
  initPulseBearVitals,
  reportCustomMetric,
  setContextProvider,
} from "@pulsebear/speed-insights";

setContextProvider(() => ({
  env: process.env.NODE_ENV,
}));

initPulseBearVitals({
  projectId: "YOUR_PROJECT_ID",
  sampling: 1,
  batch: { enabled: true, size: 20, intervalMs: 5000 },
});

// Optional custom metric
reportCustomMetric("hero_visible_ms", 123);
```

## Usage (React)

```tsx
import SpeedInsights from "@pulsebear/speed-insights/react";

export default function App() {
  return (
    <>
      {/* your app */}
      <SpeedInsights projectId="YOUR_PROJECT_ID" batch={{ enabled: true }} />
    </>
  );
}
```

## API

- `initPulseBearVitals(options)` – starts web-vitals listeners
- `reportCustomMetric(name, value?, attributes?)`
- `setContextProvider(fn)` – adds metadata to each event
- `flush()` – force send queued events
- `isInitialized()` – check if SDK initialized on this page

### Options

```ts
interface InitOptions {
  endpoint?: string; // default: https://www.pulsebear.com/api/vitals
  projectId: string; // required
  sampling?: number; // 0..1, default 1
  headers?: Record<string, string>;
  batch?: {
    enabled?: boolean; // default false
    size?: number; // default 20
    intervalMs?: number; // default 5000
    endpoint?: string; // defaults to `${endpoint}/batch`
  };
  getContext?: () => Record<string, unknown>;
  debug?: boolean; // default false
  vitals?: {
    reportAllChanges?: boolean;
  };
}
```

## Notes

- The SDK avoids sending data when offline and retries on the next flush.
- Keep context small to minimize payload size. Avoid PII.
- If batching is disabled, events are sent individually as they arrive.
