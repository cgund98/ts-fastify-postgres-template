import type { UserUpdatedEvent } from "../schema";
import type { EventHandler } from "@/infrastructure/messaging/consumer/base";

import { getLogger } from "@/observability/logging";

const logger = getLogger("UserUpdatedEventHandler");

/**
 * Handler for UserUpdatedEvent.
 * Processes events when a user is updated.
 */
export class UserUpdatedEventHandler implements EventHandler<UserUpdatedEvent> {
  handle(event: UserUpdatedEvent): Promise<void> {
    logger.info({
      msg: "Processing UserUpdatedEvent",
      eventId: event.eventId,
      aggregateId: event.aggregateId,
      changes: event.changes,
    });

    // Add your event handling logic here
    // Example: Update search index, send notification, etc.
    return Promise.resolve();
  }
}
