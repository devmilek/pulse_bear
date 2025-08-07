import { Metric } from "@/db/schema";

type Metrics = {
  [K in Metric]: {
    name: string;
    unit: string;
    description: string;
    thresholds: {
      mobile: {
        good: { min: number; max: number };
        needsImprovement: { min: number; max: number };
        poor: { min: number; max: number };
      };
      desktop: {
        good: { min: number; max: number };
        needsImprovement: { min: number; max: number };
        poor: { min: number; max: number };
      };
    };
  };
};

export const metrics: Metrics = {
  LCP: {
    name: "Largest Contentful Paint",
    unit: "ms",
    description: "Measures loading performance",
    thresholds: {
      mobile: {
        good: { min: 0, max: 2500 },
        needsImprovement: { min: 2501, max: 4000 },
        poor: { min: 4001, max: Infinity },
      },
      desktop: {
        good: { min: 0, max: 2500 },
        needsImprovement: { min: 2501, max: 4000 },
        poor: { min: 4001, max: Infinity },
      },
    },
  },
  FCP: {
    name: "First Contentful Paint",
    unit: "ms",
    description: "Measures loading performance (non‑Core Web Vital)",
    thresholds: {
      mobile: {
        good: { min: 0, max: 1800 },
        needsImprovement: { min: 1801, max: 3000 },
        poor: { min: 3001, max: Infinity },
      },
      desktop: {
        good: { min: 0, max: 1800 },
        needsImprovement: { min: 1801, max: 3000 },
        poor: { min: 3001, max: Infinity },
      },
    },
  },
  CLS: {
    name: "Cumulative Layout Shift",
    unit: "",
    description: "Measures visual stability",
    thresholds: {
      mobile: {
        good: { min: 0, max: 0.1 },
        needsImprovement: { min: 0.11, max: 0.25 },
        poor: { min: 0.26, max: Infinity },
      },
      desktop: {
        good: { min: 0, max: 0.1 },
        needsImprovement: { min: 0.11, max: 0.25 },
        poor: { min: 0.26, max: Infinity },
      },
    },
  },
  INP: {
    name: "Interaction to Next Paint",
    unit: "ms",
    description: "Measures responsiveness (Core Web Vital)",
    thresholds: {
      mobile: {
        good: { min: 0, max: 200 },
        needsImprovement: { min: 201, max: 500 },
        poor: { min: 501, max: Infinity },
      },
      desktop: {
        good: { min: 0, max: 200 },
        needsImprovement: { min: 201, max: 500 },
        poor: { min: 501, max: Infinity },
      },
    },
  },
  TTFB: {
    name: "Time to First Byte",
    unit: "ms",
    description: "Measures server response time (experimental)",
    thresholds: {
      mobile: {
        good: { min: 0, max: 800 },
        needsImprovement: { min: 801, max: 1800 },
        poor: { min: 1801, max: Infinity },
      },
      desktop: {
        good: { min: 0, max: 800 },
        needsImprovement: { min: 801, max: 1800 },
        poor: { min: 1801, max: Infinity },
      },
    },
  },
} as const;

export const percentiles = ["p50", "p75", "p90"] as const;
export type Percentile = (typeof percentiles)[number];

export const timeRanges = ["24h", "7d", "30d", "90d"] as const;
export type TimeRange = (typeof timeRanges)[number];
