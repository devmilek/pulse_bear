import { ColumnDef, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Event, EventCategory } from "@/server/db/schema";
import { cn, humanizeKey } from "@/lib/utils";

export const EventsTableColumns = (
  category: EventCategory,
  data: any
): ColumnDef<Event>[] => [
  {
    accessorKey: "category",
    header: "Category",
    cell: () => <span>{category.name || "Uncategorized"}</span>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleString();
    },
  },
  ...(data?.events[0]
    ? Object.keys(data.events[0].fields as object).map((field) => ({
        accessorFn: (row: Event) => (row.fields as Record<string, any>)[field],
        header: humanizeKey(field),
        cell: ({ row }: { row: Row<Event> }) =>
          (row.original.fields as Record<string, any>)[field] || "-",
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
