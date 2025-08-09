"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useConfirmationStore from "@/hooks/use-confirmation-store";
import { useProjectData } from "@/modules/projects/hooks/use-project-data";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { KeyIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

export const ApiKeysView = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const project = useProjectData();
  const { data } = useQuery(
    trpc.apiKeys.getApiKeys.queryOptions({
      projectId: project.id,
    })
  );

  const { openConfirmation } = useConfirmationStore();
  const { mutateAsync } = useMutation(
    trpc.apiKeys.deleteApiKey.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.apiKeys.getApiKeys.queryOptions({
            projectId: project.id,
          })
        );
      },
    })
  );

  const handleDelete = (apiKeyId: string) => {
    openConfirmation({
      title: "Delete API Key",
      description:
        "Are you sure you want to delete this API key? This action cannot be undone.",
      actionLabel: "Delete",
      cancelLabel: "Cancel",
      onAction: async () => {
        toast.promise(mutateAsync({ apiKeyId }), {
          loading: "Deleting API key...",
          success: "API key deleted successfully.",
          error: "Failed to delete API key.",
        });
      },
      onCancel: () => {},
    });
  };

  return (
    <div className="overflow-hidden rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((apiKey) => (
            <TableRow key={apiKey.id}>
              <TableCell>{apiKey.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  <KeyIcon />
                  {apiKey.apiKey}
                </Badge>
              </TableCell>
              <TableCell>
                {apiKey.lastUsedAt
                  ? formatDistanceToNow(apiKey.lastUsedAt, {
                      addSuffix: true,
                    })
                  : "Never"}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(apiKey.createdAt, {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  onClick={() => handleDelete(apiKey.id)}
                >
                  <TrashIcon />
                </Button>
              </TableCell>
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
