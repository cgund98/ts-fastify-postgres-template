import { PublishCommand, type SNSClient } from "@aws-sdk/client-sns";

import type { Settings } from "@/config/settings.js";
import type { BaseEvent } from "@/infrastructure/messaging/base.js";
import type { EventPublisher } from "@/infrastructure/messaging/publisher/base.js";

import { createSNSClient } from "@/infrastructure/aws/client.js";
import { getLogger } from "@/observability/logging.js";

const logger = getLogger("SNSPublisher");

export class SNSPublisher implements EventPublisher {
  private readonly snsClient: SNSClient;
  private readonly topicArn: string;

  constructor(settings: Settings, topicArn: string) {
    if (!topicArn) {
      throw new Error("Topic ARN must be provided");
    }
    this.snsClient = createSNSClient(settings);
    this.topicArn = topicArn;
  }

  async publish(event: BaseEvent): Promise<void> {
    try {
      // Serialize and validate event using Zod
      const message = JSON.stringify(event);

      const command = new PublishCommand({
        TopicArn: this.topicArn,
        Message: message,
        MessageAttributes: {
          event_type: {
            DataType: "String",
            StringValue: event.eventType,
          },
          message_type: {
            DataType: "String",
            StringValue: event.eventType,
          },
          aggregate_type: {
            DataType: "String",
            StringValue: event.aggregateType,
          },
        },
      });

      const response = await this.snsClient.send(command);

      logger.info({
        msg: "Published event",
        eventId: event.eventId,
        eventType: event.eventType,
        messageId: response.MessageId,
      });
    } catch (error) {
      logger.error({
        msg: "Failed to publish event",
        eventId: event.eventId,
        error: error instanceof Error ? error.message : String(error),
        err: error,
      });
      throw error;
    }
  }
}
