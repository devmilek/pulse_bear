// SvelteKit wrapper: call in a +layout.svelte or root component via onMount.
// Example:
// <script lang="ts">
//   import { onMount } from 'svelte';
//   import { setupSpeedInsights } from '@pulsebear/speed-insights/sveltekit';
//   onMount(() => {
//     setupSpeedInsights({ projectId: 'YOUR_PROJECT_ID' });
//   });
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
  import("./core").then(({ initPulseBearVitals }) => {
    void initPulseBearVitals(options);
  });
}
