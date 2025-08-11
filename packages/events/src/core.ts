import { Primitive } from "./types";

const DEFAULT_API_URL = "http://localhost:3000/api/events" as const;

const isInBrowser =
  typeof window !== "undefined" && typeof window.fetch !== "undefined";

export async function sendEvent(opts: {
  apiUrl?: string;
  apiKey?: string;
  category: string;
  action: string;
  description?: string;
  fields?: Record<string, Primitive>;
}): Promise<void> {
  if (!isInBrowser) {
    console.warn(
      `PulseBear: track() requires a browser environment. Event "${opts.category}" will be discarded.`
    );
    return;
  }

  if (!opts.apiKey) {
    console.warn(
      `PulseBear: track() requires an apiKey. Event "${opts.category}" will be discarded.`
    );
    return;
  }

  try {
    const endpoint = opts.apiUrl ?? DEFAULT_API_URL;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${opts.apiKey}`,
      },
      body: JSON.stringify({
        category: opts.category,
        action: opts.action,
        description: opts.description,
        fields: opts.fields || {},
      }),
    });

    if (response.status >= 300) {
      const responseBody = await response.text();
      console.warn(
        `Failed to send event "${opts.category}" to ${endpoint}: ${response.status} ${responseBody}`
      );
    }
  } catch (e) {
    console.warn(`Failed to send event "${opts.category}"`);
    console.warn(e);
  }
}
