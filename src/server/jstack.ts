import { jstack } from "jstack";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "hono/adapter";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { currentUser } from "@clerk/nextjs/server";
import { getCurrentSession } from "@/lib/auth/get-current-session";

interface Env {
  Bindings: { DATABASE_URL: string };
}

export const j = jstack.init<Env>();

const authMiddleware = j.middleware(async ({ c, next }) => {
  const authHeader = c.req.header("Authorization");

  if (authHeader) {
    const apiKey = authHeader.split(" ")[1]; // bearer <API_KEY>

    if (!apiKey) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.apiKey, apiKey),
    });

    if (user) return next({ user });
  }

  const { user } = await getCurrentSession();

  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  return next({ user });
});

/**
 * Public (unauthenticated) procedures
 *
 * This is the base piece you use to build new queries and mutations on your API.
 */
export const publicProcedure = j.procedure;
export const privateProcedure = publicProcedure.use(authMiddleware);
