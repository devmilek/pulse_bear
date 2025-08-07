import { deviceTypes } from "@/db/schema";
import { parseAsStringLiteral, useQueryStates } from "nuqs";
import { speedInsightsSearchParams } from "../params";

export const useSpeedInsightsFilters = () => {
  return useQueryStates(speedInsightsSearchParams);
};
