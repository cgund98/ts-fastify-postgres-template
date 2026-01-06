import type { RequiredOrUnset } from "@/domain/types.js";

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Safely converts an object to a Record for database updates.
 * Filters out undefined values and converts camelCase keys to snake_case.
 *
 * This function accepts any object type (not just Record types) and safely
 * converts it to a Record by iterating over its entries.
 *
 * @param update - An object with optional/undefined properties
 * @returns A Record with only defined values, with keys converted to snake_case
 */
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

/**
 * Type-safe helper to convert an object to a Record and build update values.
 * Use this when you have an object type without an index signature.
 *
 * This function safely converts any object to a Record by using Object.entries(),
 * which works correctly at runtime for any object type. The type assertion is safe
 * because we're only reading properties, not modifying the object structure.
 *
 * @param update - An object with optional/undefined properties
 * @returns A Record with only defined values, with keys converted to snake_case
 */
export function buildUpdateValuesFromObject(update: object): Record<string, unknown> {
  // Object.entries() safely converts any object to [string, unknown][] pairs
  // This type assertion is safe because Object.entries() works on any object
  return buildUpdateValues(update as Record<string, RequiredOrUnset<unknown>>);
}
