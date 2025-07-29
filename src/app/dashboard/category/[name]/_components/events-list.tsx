import { EventCategory } from "@/db/schema";
import React from "react";
import { GetEventsByCategoryName } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { hexToRgba, humanizeKey, intToHex } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface EventsListProps {
  data: GetEventsByCategoryName | undefined;
  isFetching: boolean;
  category: EventCategory;
}

export const EventsList = ({ data, isFetching, category }: EventsListProps) => {
  return (
    <div className="grid gap-y-4 max-w-xl w-full">
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
                  Object.entries(event.fields).map(([key, value]) => (
                    <Badge variant="outline" key={key}>
                      {humanizeKey(key)}:
                      <span className="font-normal">{value}</span>
                    </Badge>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
