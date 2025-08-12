// Lightweight Astro helper: call in a client-side <script> within an .astro file.
// Example:
// <script>
//   import { setupSpeedInsights } from '@pulsebear/speed-insights/astro';
//   setupSpeedInsights({ projectId: 'YOUR_PROJECT_ID' });
// </script>

import type { InitOptions } from "./core";
export {
  initPulseBearVitals,
  reportCustomMetric,
  setContextProvider,
  flush,
  isInitialized,
} from "./core";

export function setupSpeedInsights(options: InitOptions) {
  if (typeof window === "undefined") return;
  // Lazy import to avoid affecting SSR build
  import("./core").then(({ initPulseBearVitals }) => {
    void initPulseBearVitals(options);
  });
}
