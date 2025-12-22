import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stripMarkdownFences(output: string): string {
  // Extract code from markdown fences, even if surrounded by explanatory text
  // Handles cases with or without newline after opening fence
  const fencePattern = /```(?:javascript|js|typescript|ts)?[ \t]*\n?([\s\S]*?)```/;
  const match = output.match(fencePattern);
  return match ? match[1].trim() : output.trim();
}
