import { createCheckoutSession } from "@/lib/stripe";
import { createTRPCRouter, protectedProcedure } from "../init";

export const paymentRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx;

    const session = await createCheckoutSession({
      userEmail: user.email,
      userId: user.id,
    });

    return { url: session.url };
  }),

  getUserPlan: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    return { plan: user.plan };
  }),
});
