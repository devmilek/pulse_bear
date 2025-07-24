import {
  parseAsIndex,
  parseAsInteger,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";

const tabs = ["today", "week", "month"] as const;
export type Tab = (typeof tabs)[number];

const parsers = {
  pageIndex: parseAsIndex.withDefault(0),
  pageSize: parseAsInteger.withDefault(10),
  tab: parseAsStringLiteral(tabs).withDefault("today").withOptions({
    clearOnDefault: true,
  }),
};

const paginationUrlKeys = {
  pageIndex: "page",
  pageSize: "perPage",
};

export const useEventCategoryParams = () => {
  return useQueryStates(parsers, {
    urlKeys: paginationUrlKeys,
  });
};
