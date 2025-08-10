import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { helloWorld } from "@/inngest/functions/hello-world";
import { cleanupOldWebVitals } from "@/inngest/jobs/cleanup-old-webvitals";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld, cleanupOldWebVitals],
});
