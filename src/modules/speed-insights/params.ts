import { deviceTypes } from "@/db/schema";
import { parseAsFloat, createLoader, parseAsStringLiteral } from "nuqs/server";
import { timeRanges } from "./constants";

export const speedInsightsSearchParams = {
  device: parseAsStringLiteral(deviceTypes).withDefault("desktop").withOptions({
    clearOnDefault: true,
  }),
  percentile: parseAsStringLiteral(["p50", "p75"])
    .withDefault("p75")
    .withOptions({
      clearOnDefault: true,
    }),
  range: parseAsStringLiteral(timeRanges).withDefault("7d").withOptions({
    clearOnDefault: true,
  }),
};

export const loadInsightsSpeedSearchParams = createLoader(
  speedInsightsSearchParams
);
