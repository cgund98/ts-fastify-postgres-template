import type { BaseEvent } from "@/infrastructure/messaging/base.js";

export interface EventHandler<T extends BaseEvent> {
  handle(event: T): Promise<void>;
}

export type EventDeserializer<T extends BaseEvent> = (eventData: Record<string, unknown>) => T;
