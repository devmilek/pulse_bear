import { inngest } from "../client";
import { db } from "@/db";
import { webVitals } from "@/db/schema";
import { subDays } from "date-fns";
import { lt } from "drizzle-orm";

export const cleanupOldWebVitals = inngest.createFunction(
  { id: "cleanup-old-webvitals" },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - 90);

    const deleted = await step.run("delete-old-webvitals", async () => {
      const res = await db
        .delete(webVitals)
        .where(lt(webVitals.createdAt, cutoff));

      return res.rowCount ?? 0;
    });

    return { deleted, cutoff: cutoff.toISOString() };
  }
);
