import { z } from "zod";

import { UserAggregateType, UserEventType } from "@/domain/user/events/constants.js";
import { createBaseEvent } from "@/infrastructure/messaging/base.js";

export const UserCreatedEventSchema = z.object({
  eventId: z.string(),
  eventType: z.literal(UserEventType.CREATED),
  aggregateId: z.string(),
  aggregateType: z.literal(UserAggregateType.USER),
  createdAt: z.string(),
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  email: z.string().email(),
  name: z.string(),
});

export const UserUpdatedEventSchema = z.object({
  eventId: z.string(),
  eventType: z.literal(UserEventType.UPDATED),
  aggregateId: z.string(),
  aggregateType: z.literal(UserAggregateType.USER),
  createdAt: z.string(),
  changes: z.record(
    z.string(), // key type (field names like "name", "email", etc.)
    z.object({
      old: z.string(),
      new: z.string(),
    })
  ),
});

export type UserCreatedEvent = z.infer<typeof UserCreatedEventSchema>;
export type UserUpdatedEvent = z.infer<typeof UserUpdatedEventSchema>;

export function createUserCreatedEvent(aggregateId: string, email: string, name: string): UserCreatedEvent {
  // You can still use createBaseEvent if it provides eventId, createdAt, etc.
  return UserCreatedEventSchema.parse({
    ...createBaseEvent(UserEventType.CREATED, aggregateId, UserAggregateType.USER),
    eventType: UserEventType.CREATED,
    aggregateType: UserAggregateType.USER,
    email,
    name,
  });
}

export function createUserUpdatedEvent(
  aggregateId: string,
  changes: Record<string, { old: string; new: string }>
): UserUpdatedEvent {
  return UserUpdatedEventSchema.parse({
    ...createBaseEvent(UserEventType.UPDATED, aggregateId, UserAggregateType.USER),
    eventType: UserEventType.UPDATED,
    aggregateType: UserAggregateType.USER,
    changes,
  });
}

/**
 * These parser functions help in runtime deserialization/validation.
 */
export function parseUserCreatedEvent(data: unknown): UserCreatedEvent {
  return UserCreatedEventSchema.parse(data);
}

export function parseUserUpdatedEvent(data: unknown): UserUpdatedEvent {
  return UserUpdatedEventSchema.parse(data);
}
