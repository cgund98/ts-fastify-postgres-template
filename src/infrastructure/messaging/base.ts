import { randomUUID } from "crypto";

import { z } from "zod";

/**
 * Zod schema for BaseEvent validation.
 * Used for serializing and deserializing events with type safety.
 */
export const baseEventSchema = z.object({
  eventId: z.string(),
  eventType: z.string(),
  aggregateId: z.string(),
  aggregateType: z.string(),
  createdAt: z.string(),
});

export type BaseEvent = z.infer<typeof baseEventSchema>;

export function createBaseEvent(eventType: string, aggregateId: string, aggregateType: string): BaseEvent {
  return {
    eventId: randomUUID(),
    eventType,
    aggregateId,
    aggregateType,
    createdAt: new Date().toISOString(),
  };
}
