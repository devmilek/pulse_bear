// 👇 constant value in all uppercase
export const FREE_QUOTA = {
  maxEventsPerMonth: 100,
  maxEventCategories: 3,
  maxSpeedInsightsDataPoints: 5_000,
} as const;

export const PRO_QUOTA = {
  maxEventsPerMonth: 1000,
  maxEventCategories: 10,
  maxSpeedInsightsDataPoints: 20_000,
} as const;
