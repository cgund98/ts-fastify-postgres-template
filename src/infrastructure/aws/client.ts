import { SNSClient, type SNSClientConfig } from "@aws-sdk/client-sns";
import { SQSClient, type SQSClientConfig } from "@aws-sdk/client-sqs";

import type { Settings } from "@/config/settings.js";

export function createSNSClient(settings: Settings): SNSClient {
  const config: SNSClientConfig = {
    region: settings.AWS_REGION,
  };

  if (settings.AWS_ENDPOINT_URL) {
    config.endpoint = settings.AWS_ENDPOINT_URL;
  }

  if (settings.USE_LOCALSTACK) {
    // LocalStack uses test credentials
    config.credentials = {
      accessKeyId: "test",
      secretAccessKey: "test",
    };
  }

  return new SNSClient(config);
}

export function createSQSClient(settings: Settings): SQSClient {
  const config: SQSClientConfig = {
    region: settings.AWS_REGION,
  };

  if (settings.AWS_ENDPOINT_URL) {
    config.endpoint = settings.AWS_ENDPOINT_URL;
  }

  if (settings.USE_LOCALSTACK) {
    // LocalStack uses test credentials
    config.credentials = {
      accessKeyId: "test",
      secretAccessKey: "test",
    };
  }

  return new SQSClient(config);
}
