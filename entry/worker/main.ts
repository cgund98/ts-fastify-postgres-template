import type { BaseEvent } from "@/infrastructure/messaging/base.js";
import { SQSConsumer, type SQSConsumerConfig } from "@/infrastructure/messaging/consumer/sqs.js";

import { getSettings } from "@/config/settings.js";
import { UserEventType } from "@/domain/user/events/constants.js";
import { UserCreatedEventHandler, UserUpdatedEventHandler } from "@/domain/user/events/handlers/index.js";
import { UserCreatedEventSchema, UserUpdatedEventSchema } from "@/domain/user/events/schema.js";
import { getLogger } from "@/observability/logging.js";

const settings = getSettings();
const logger = getLogger("Worker");

/**
 * Step 1: Define a map type for eventType -> deserializer + handler
 */
interface EventMapEntry<T extends BaseEvent> {
  deserializer: (data: Record<string, unknown>) => T;
  handler: { handle(event: T): Promise<void> };
  queueUrl: string;
}

/**
 * Step 2: Build the registry
 */
const eventRegistry: Record<string, EventMapEntry<BaseEvent>> = {
  [UserEventType.CREATED]: {
    deserializer: (data) => UserCreatedEventSchema.parse(data),
    handler: new UserCreatedEventHandler(),
    queueUrl: settings.EVENT_QUEUE_URL_USER_CREATED ?? "",
  },
  [UserEventType.UPDATED]: {
    deserializer: (data) => UserUpdatedEventSchema.parse(data),
    handler: new UserUpdatedEventHandler(),
    queueUrl: settings.EVENT_QUEUE_URL_USER_UPDATED ?? "",
  },
  // Add more events here
};

/**
 * Step 3: Generic consumer for any event type
 */
async function consumeQueue(eventType: string): Promise<void> {
  const entry = eventRegistry[eventType];
  if (!entry) {
    logger.warn({ eventType, msg: "No registry entry found, skipping" });
    return;
  }

  const { deserializer, handler, queueUrl } = entry;

  if (!queueUrl) {
    throw new Error(`No queue URL found for event type: ${eventType}`);
  }

  const consumerConfig: SQSConsumerConfig = {
    queueUrl,
    awsRegion: settings.AWS_REGION,
    awsEndpointUrl: settings.AWS_ENDPOINT_URL,
    useLocalstack: settings.USE_LOCALSTACK,
    maxMessages: 1,
    waitTimeSeconds: 5,
  };

  const consumer = new SQSConsumer(consumerConfig, deserializer, handler);

  try {
    await consumer.consume();
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      logger.info({ eventType, msg: "Consumer shutting down" });
      return;
    }
    logger.error({ err, eventType, msg: "Fatal error in consumer" });
    throw err;
  }
}

/**
 * Step 4: Start all consumers
 */
async function main(): Promise<void> {
  const consumers: Promise<void>[] = Object.keys(eventRegistry).map((eventType) => consumeQueue(eventType));

  await Promise.all(consumers);
}

main().catch((err: unknown) => {
  logger.error({ err, msg: "Unhandled error in main" });
  process.exit(1);
});
