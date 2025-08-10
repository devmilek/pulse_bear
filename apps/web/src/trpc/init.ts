import { getCurrentSession } from "@/lib/auth/get-current-session";
import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import SuperJSON from "superjson";

export const createTRPCContext = cache(async () => {
  const { session, user } = await getCurrentSession();

  return {
    session,
    user,
  };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      session: ctx.session,
    },
  });
});
