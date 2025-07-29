import { EventCategory } from "@/db/schema";
import React from "react";
import { GetEventsByCategoryName } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { hexToRgba, humanizeKey, intToHex } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

interface EventsListProps {
  data: GetEventsByCategoryName | undefined;
  isFetching: boolean;
  category: EventCategory;
}

export const EventsList = ({ data, isFetching, category }: EventsListProps) => {
  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-y-4 w-full mx-auto">
      {data?.events.map((event) => (
        <Card key={event.id}>
          <CardContent className="flex gap-6">
            <div
              className="size-10 flex items-center justify-center rounded-xl text-xl"
              style={{
                border: `2px solid ${hexToRgba(intToHex(category.color), 1)}`,
                backgroundColor: hexToRgba(intToHex(category.color), 0.4),
              }}
            >
              {category.emoji}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{event.action}</h3>
              <p className="text-sm text-muted-foreground">
                {event.description}
              </p>
              <time
                dateTime={event.createdAt.toISOString()}
                className="text-xs text-muted-foreground mt-4"
              >
                {formatDistanceToNow(event.createdAt, {
                  addSuffix: true,
                })}
              </time>

              <div className="flex flex-wrap gap-1 mt-5">
                {event.fields &&
                  Object.entries(event.fields).map(([key, value]) => {
                    const formatValue = (val: any) => {
                      if (typeof val === "boolean") return val ? "Yes" : "No";
                      if (val === null || val === undefined) return "N/A";
                      if (typeof val === "number") return val.toString();
                      return val;
                    };

                    return (
                      <Badge
                        variant="outline"
                        key={key}
                        className="font-semibold"
                      >
                        {humanizeKey(key)}:
                        <span className="font-normal">
                          {humanizeKey(formatValue(value))}
                        </span>
                      </Badge>
                    );
                  })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
