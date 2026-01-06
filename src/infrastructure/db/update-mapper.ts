import type { RequiredOrUnset } from "@/domain/types.js";

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function buildUpdateValues(update: Record<string, RequiredOrUnset<unknown>>): Record<string, unknown> {
  const values: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(update)) {
    if (value !== undefined) {
      // Convert camelCase to snake_case for database columns
      const dbKey = camelToSnake(key);
      values[dbKey] = value;
    }
  }

  return values;
}
