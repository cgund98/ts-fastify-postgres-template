import type { UserCreatedEvent } from "../schema.js";
import type { EventHandler } from "@/infrastructure/messaging/consumer/base.js";

import { getLogger } from "@/observability/logging.js";

const logger = getLogger("UserCreatedEventHandler");

/**
 * Handler for UserCreatedEvent.
 * Processes events when a new user is created.
 */
export class UserCreatedEventHandler implements EventHandler<UserCreatedEvent> {
  handle(event: UserCreatedEvent): Promise<void> {
    logger.info({
      msg: "Processing UserCreatedEvent",
      eventId: event.eventId,
      aggregateId: event.aggregateId,
      email: event.email,
      name: event.name,
    });

    // Add your event handling logic here
    // Example: Send welcome email, update analytics, etc.
    return Promise.resolve();
  }
}
