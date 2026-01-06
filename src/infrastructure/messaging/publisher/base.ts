import type { BaseEvent } from "@/infrastructure/messaging/base.js";

export interface EventPublisher {
  publish(event: BaseEvent): Promise<void>;
}
