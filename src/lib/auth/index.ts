import { db } from "@/server/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }, request) => {
      await resend.emails.send({
        from: "Pulse Bear <pulsebear@asteriostudio.com>",
        to: user.email,
        subject: "Verify your email",
        html: `<p>Click the link to verify your email:</p><a href="${url}">${url}</a>`,
      });
    },
  },

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      await resend.emails.send({
        from: "Pulse Bear <pulsebear@asteriostudio.com>",
        to: user.email,
        subject: "Reset your password",
        html: `<p>Click the link to reset your password:</p><a href="${url}">${url}</a>`,
      });
    },
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
        required: false,
        input: false,
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
