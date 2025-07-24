import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { j, publicProcedure } from "../jstack";
import { $InferInnerFunctionType } from "zod/v4/core";
import { currentUser } from "@clerk/nextjs/server";
import { users } from "../db/schema";
import { db } from "../db";
import { getCurrentSession } from "@/lib/auth/get-current-session";

export const authRouter = j.router({
  // getDatabaseSyncStatus: publicProcedure.query(async ({ c, ctx }) => {
  //   const { user } = await getCurrentSession();
  //   if (!user) {
  //     return c.json({
  //       isSynced: false,
  //     });
  //   }
  //   const user = await db.query.users.findFirst({
  //     where: eq(users.externalId, auth.id),
  //   });
  //   if (!user) {
  //     if (!auth.emailAddresses[0]?.emailAddress) {
  //       return c.json({
  //         isSynced: false,
  //       });
  //     }
  //     await db.insert(users).values({
  //       quotaLimit: 100,
  //       email: auth.emailAddresses[0].emailAddress,
  //       externalId: auth.id,
  //     });
  //     return c.json({
  //       isSynced: true,
  //     });
  //   }
  //   return c.json({
  //     isSynced: true,
  //   });
  // }),
});
