import { Metric } from "@/db/schema";

export type MetricInfo = {
  name: string;
  unit: string;
  description: string;
  whyItMatters: string;
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

type MetricsInfo = {
  [K in Metric]: MetricInfo;
};

export const metricsInfo: MetricsInfo = {
  LCP: {
    name: "Largest Contentful Paint",
    unit: "ms",
    description:
      "The point when the single largest element in the viewport (hero image, headline block, or video poster) finishes rendering. It answers “When is the main thing on the page visible?”",
    whyItMatters:
      "Users won’t interact until the core content shows up, so a low LCP tightly correlates with perceived loading speed.",
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
    description:
      "The moment the browser draws the first text, image, or non-blank canvas from the DOM onto the screen. It’s the user’s first visual cue that “something is happening.”",
    whyItMatters:
      "Humans start judging speed as soon as any content appears, so a fast FCP makes the site feel alive quickly.",
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
    description:
      "The running total of all unexpected layout movements that occur after initial paint, scored as a dimensionless number.",
    whyItMatters:
      "Sudden jumps make sites feel janky—and can cause mis-taps that buy the wrong product.",
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
    description:
      "The latency of the slowest (worst) user interaction—tap, click, or key press—between first paint and page hide, observed across a session. It times how long from input start until the next frame that reflects UI changes is painted.",
    whyItMatters:
      "INP replaced FID in March 2024 because it captures real “in-use” responsiveness, not just the first tap. High INP means the page feels sluggish even after it looks loaded.",
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
    description:
      "How long the browser waits after making the HTTP request before the first byte of the response arrives. It captures DNS look-up, TLS negotiation, and server processing time.",
    whyItMatters:
      "Slow backend or network latency delays everything that follows—rendering, scripts, images, the lot.",
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
