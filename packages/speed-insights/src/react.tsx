import { useEffect } from "react";
import type { InitOptions } from "./core";
export {
  initPulseBearVitals,
  reportCustomMetric,
  setContextProvider,
  flush,
  isInitialized,
} from "./core";

export function SpeedInsights(props: InitOptions) {
  // Lazy import to avoid SSR pitfalls; component only runs client-side
  useEffect(() => {
    // Import inside effect so SSR won't try to access window prematurely
    import("./core").then(({ initPulseBearVitals }) => {
      void initPulseBearVitals(props);
    });
  }, [JSON.stringify(props)]);
  return null;
}

export default SpeedInsights;
export { SpeedInsights as SpeedInsightsProvider };
