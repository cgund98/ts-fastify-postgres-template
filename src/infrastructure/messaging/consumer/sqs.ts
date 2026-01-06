import { ReceiveMessageCommand, DeleteMessageCommand, SQSClient, type SQSClientConfig } from "@aws-sdk/client-sqs";

import type { BaseEvent } from "@/infrastructure/messaging/base.js";
import type { EventDeserializer, EventHandler } from "@/infrastructure/messaging/consumer/base.js";
import type pino from "pino";

import { getLogger } from "@/observability/logging.js";

export interface SQSConsumerConfig {
  queueUrl: string;
  awsRegion: string;
  awsEndpointUrl?: string | undefined;
  useLocalstack?: boolean | undefined;
  maxMessages?: number;
  waitTimeSeconds?: number;
}

export class SQSConsumer<T extends BaseEvent> {
  private readonly sqsClient: SQSClient;
  private running = false;

  private logger: pino.Logger;

  constructor(
    private readonly config: SQSConsumerConfig,
    private readonly deserializer: EventDeserializer<T>,
    private readonly handler: EventHandler<T>
  ) {
    const sqsConfig: SQSClientConfig = {
      region: config.awsRegion,
    };

    if (config.awsEndpointUrl) {
      sqsConfig.endpoint = config.awsEndpointUrl;
    }

    if (config.useLocalstack) {
      sqsConfig.credentials = {
        accessKeyId: "test",
        secretAccessKey: "test",
      };
    }

    this.logger = getLogger("SQSConsumer").child({
      queueUrl: this.config.queueUrl,
    });

    this.sqsClient = new SQSClient(sqsConfig);
  }

  async consume(): Promise<void> {
    this.running = true;
    this.logger.info({
      msg: "Starting SQS consumer",
      queueUrl: this.config.queueUrl,
    });

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (this.running) {
      try {
        const command = new ReceiveMessageCommand({
          QueueUrl: this.config.queueUrl,
          MaxNumberOfMessages: this.config.maxMessages,
          WaitTimeSeconds: this.config.waitTimeSeconds,
          MessageAttributeNames: ["All"],
        });

        const response = await this.sqsClient.send(command);

        if (response.Messages?.length && response.Messages.length > 0) {
          for (const message of response.Messages) {
            if (!message.Body || !message.ReceiptHandle) {
              continue;
            }

            try {
              const eventData = JSON.parse(message.Body);

              // Use custom deserializer if provided, otherwise use default Zod-based deserialization
              const event = this.deserializer(eventData as Record<string, unknown>);

              await this.handler.handle(event);

              // Delete message after successful processing
              const deleteCommand = new DeleteMessageCommand({
                QueueUrl: this.config.queueUrl,
                ReceiptHandle: message.ReceiptHandle,
              });
              await this.sqsClient.send(deleteCommand);

              this.logger.info({
                msg: "Successfully processed event",
                eventId: event.eventId,
                eventType: event.eventType,
              });
            } catch (error) {
              this.logger.error({
                msg: "Error processing event",
                error: error instanceof Error ? error.message : String(error),
                err: error,
              });
              // Message will remain in queue and be retried
            }
          }
        }
      } catch (error) {
        this.logger.error({
          msg: "Error receiving messages from SQS",
          error: error instanceof Error ? error.message : String(error),
          err: error,
        });
        // Continue consuming after a short delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  stop(): void {
    this.running = false;
    this.logger.info({
      msg: "Stopping SQS consumer",
      queueUrl: this.config.queueUrl,
    });
  }
}
