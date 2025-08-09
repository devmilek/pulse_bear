"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeviceType, deviceTypes } from "@/db/schema";
import { CalendarIcon, ComputerIcon, DotIcon, Smartphone } from "lucide-react";
import { parseAsStringLiteral, useQueryStates } from "nuqs";
import React from "react";
import { useSpeedInsightsFilters } from "../../hooks/use-speed-insights-filters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { TimeRange, timeRanges } from "../../constants";

const timeRangesLabels: Record<TimeRange, string> = {
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

export const SpeedInsightsHeader = () => {
  const [filters, setFilters] = useSpeedInsightsFilters();

  return (
    <div className="flex items-center justify-between">
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <CalendarIcon /> {timeRangesLabels[filters.range]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup
              value={filters.range}
              onValueChange={(value) =>
                setFilters({ range: value as TimeRange })
              }
            >
              {timeRanges.map((range) => (
                <DropdownMenuRadioItem key={range} value={range}>
                  {timeRangesLabels[range]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-4">
        <Tabs
          value={filters.device}
          onValueChange={(value) => setFilters({ device: value as DeviceType })}
        >
          <TabsList>
            <TabsTrigger value="desktop">
              <ComputerIcon /> Desktop
            </TabsTrigger>
            <TabsTrigger value="mobile">
              <Smartphone /> Mobile
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs
          value={filters.percentile}
          onValueChange={(value) =>
            setFilters({ percentile: value as "p50" | "p75" })
          }
        >
          <TabsList>
            <TabsTrigger value="p75">P75</TabsTrigger>
            <TabsTrigger value="p50">P50</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
