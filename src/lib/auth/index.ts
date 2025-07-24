import { db } from "@/server/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import cuid from "cuid";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  advanced: {
    database: {
      generateId: false,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      discordId: {
        type: "string",
        required: false,
        input: true,
      },
      apiKey: {
        type: "string",
        required: true,
        input: false,
        defaultValue: () => cuid(),
      },
      plan: {
        type: "string",
        required: true,
        input: false,
        defaultValue: "FREE",
      },
    },
  },
});
