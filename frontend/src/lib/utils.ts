import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function deriveTitleFromText(text: string, maxLength = 60): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "Pasted note";
  if (normalized.length <= maxLength) return normalized;

  const truncated = normalized.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  const base = lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated;
  return `${base.trim()}…`;
}
