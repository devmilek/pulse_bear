"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export const ApiKeySettings = () => {
  const { data } = useQuery({
    queryFn: async () => {
      const res = await client.apiKeys.getApiKeys.$get();
      const apiKeys = await res.json();
      return apiKeys;
    },
    queryKey: ["apiKeys"],
  });
  return (
    <div className="overflow-hidden rounded-md border">
      {JSON.stringify(data)}
      <Table>
        <TableHeader>
          {/* {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))} */}
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((apiKey) => (
            <TableRow key={apiKey.id}>
              <TableHead>{apiKey.name}</TableHead>
              <TableHead>{apiKey.apiKey}</TableHead>
              <TableHead>
                {apiKey.lastUsedAt
                  ? new Date(apiKey.lastUsedAt).toLocaleDateString()
                  : "Never"}
              </TableHead>
              <TableHead>
                {new Date(apiKey.createdAt).toLocaleDateString()}
              </TableHead>
            </TableRow>
          ))}

          {!data ||
            (data.length == 0 && (
              <TableRow>
                <TableHead colSpan={4} className="h-24 text-center">
                  No API keys found.
                </TableHead>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};
