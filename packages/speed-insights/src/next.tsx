"use client";

import { useEffect } from "react";
import type { InitOptions } from "./core";
export {
  initPulseBearVitals,
  reportCustomMetric,
  setContextProvider,
  flush,
  isInitialized,
} from "./core";

// Next.js-friendly client component wrapper
export function SpeedInsights(props: InitOptions) {
  useEffect(() => {
    import("./core").then(({ initPulseBearVitals }) => {
      void initPulseBearVitals(props);
    });
  }, []);
  return null;
}

export default SpeedInsights;
