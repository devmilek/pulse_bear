import { subscription } from "@/db/schema";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseColor = (color: string) => {
  const hex = color.startsWith("#") ? color.slice(1) : color;
  return parseInt(hex, 16);
};

export function intToHex(int: number): string {
  const hex = int.toString(16).toUpperCase();
  return hex.length < 6 ? hex.padStart(6, "0") : hex;
}

export function hexToRgba(hex: string, opacity: number): string {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function humanizeKey(key: string) {
  if (key == null) return "";
  const k = String(key).trim();

  const cap = (w: string) =>
    w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

  // 1) snake_case lub kebab-case
  if (/[_-]/.test(k)) {
    return k.split(/[_-]+/).filter(Boolean).map(cap).join(" ");
  }

  // 2) "Firstname" (jedno słowo, tylko pierwsza litera wielka) — zostaw bez zmian
  if (/^[A-Z][a-z]+$/.test(k)) {
    return k;
  }

  // 3) camelCase / PascalCase / akronimy typu URLPath
  const words = k
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .split(/\s+/)
    .filter(Boolean)
    .map(cap);

  return words.join(" ");
}

export const getEventCodeSnippet = (categoryName: string) => {
  const codeSnippet = `await fetch('${process.env.NEXT_PUBLIC_APP_URL}/api/events', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    category: '${categoryName}',
    action: 'Payment successfull', // for example: Payment sucessfull, User registered, etc.
    description: '2x 1TB SSD - Overnight Shipping', // optional: description of the event
    user_id: 'abc123', // optional: identifier of the user
    fields: {
      shipping: 'overnight',
      quantity: 2,
      success: true
    } // optional: additional fields
  })
})`;

  return codeSnippet;
};

export function isSubscriptionActive(
  sub: typeof subscription.$inferSelect | undefined
): boolean {
  if (!sub) return false;
  return (
    sub.status === "active" &&
    new Date(sub.currentPeriodEnd).getTime() > Date.now()
  );
}
