"use client";

import { AreaChart } from "@/components/tremor/area-chart";

const chartdata = [
  {
    date: "Jan 23",
    SolarPanels: 2890,
  },
  {
    date: "Feb 23",
    SolarPanels: 2756,
  },
  {
    date: "Mar 23",
    SolarPanels: 3322,
  },
  {
    date: "Apr 23",
    SolarPanels: 3470,
  },
  {
    date: "May 23",
    SolarPanels: 3475,
  },
  {
    date: "Jun 23",
    SolarPanels: 3129,
  },
  {
    date: "Jul 23",
    SolarPanels: 3490,
  },
  {
    date: "Aug 23",
    SolarPanels: 2903,
  },
  {
    date: "Sep 23",
    SolarPanels: 2643,
  },
  {
    date: "Oct 23",
    SolarPanels: 2837,
  },
  {
    date: "Nov 23",
    SolarPanels: 2954,
  },
  {
    date: "Dec 23",
    SolarPanels: 3239,
  },
];

export const MetricChart = () => (
  <AreaChart
    className="h-80"
    data={chartdata}
    index="date"
    categories={["SolarPanels"]}
    valueFormatter={(number: number) =>
      `$${Intl.NumberFormat("us").format(number).toString()}`
    }
    onValueChange={(v) => console.log(v)}
  />
);
