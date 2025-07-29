"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

export const AccountSettings = ({
  discordId: initialDiscordId,
}: {
  discordId: string;
}) => {
  const trpc = useTRPC();
  const [discordId, setDiscordId] = useState(initialDiscordId);

  const { mutate, isPending } = useMutation(
    trpc.project.setDiscordID.mutationOptions()
  );

  return (
    <Card className="max-w-xl w-full space-y-4">
      <CardContent>
        <div className="pt-2">
          <Label>Discord ID</Label>
          <Input
            className="mt-1"
            value={discordId}
            onChange={(e) => setDiscordId(e.target.value)}
            placeholder="Enter your Discord ID"
          />
        </div>

        <p className="mt-2 text-sm/6 text-gray-600">
          Don't know how to find your Discord ID?{" "}
          <Link
            href="https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 hover:text-brand-500"
          >
            Learn how to obtain it here
          </Link>
          .
        </p>

        <div className="pt-4">
          <Button
            onClick={() =>
              mutate({
                discordId,
              })
            }
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
