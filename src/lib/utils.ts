import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseColor = (color: string) => {
  const hex = color.startsWith("#") ? color.slice(1) : color;
  return parseInt(hex, 16);
};

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
