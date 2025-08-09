import { ColumnDef, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Event, EventCategory } from "@/db/schema";
import { cn, humanizeKey } from "@/lib/utils";
import { formatDistance, formatDistanceToNow } from "date-fns";

export const EventsTableColumns = (
  category: EventCategory,
  data: any
): ColumnDef<Event>[] => [
  {
    accessorKey: "action",
    header: ({ column }) => "Action",
    cell: ({ row }) => row.getValue("action"),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      return formatDistanceToNow(row.getValue("createdAt"), {
        addSuffix: true,
      });
    },
  },
  ...(data?.events[0]
    ? Object.keys(data.events[0].fields as object).map((field) => ({
        accessorFn: (row: Event) => (row.fields as Record<string, any>)[field],
        header: humanizeKey(field),
        cell: ({ row }: { row: Row<Event> }) => {
          const value = (row.original.fields as Record<string, any>)[field];

          // Format different data types
          if (typeof value === "boolean") return value ? "Yes" : "No";
          if (value === null || value === undefined) return "-";
          if (typeof value === "number") return value.toString();
          return humanizeKey(value);
        },
      }))
    : []),
  {
    accessorKey: "deliveryStatus",
    header: "Delivery Status",
    cell: ({ row }) => (
      <span
        className={cn("px-2 py-1 rounded-full text-xs font-semibold", {
          "bg-green-100 text-green-800":
            row.getValue("deliveryStatus") === "DELIVERED",
          "bg-red-100 text-red-800":
            row.getValue("deliveryStatus") === "FAILED",
          "bg-yellow-100 text-yellow-800":
            row.getValue("deliveryStatus") === "PENDING",
        })}
      >
        {row.getValue("deliveryStatus")}
      </span>
    ),
  },
];
