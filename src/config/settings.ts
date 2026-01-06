import { z } from "zod";

const settingsSchema = z.object({
  // Application
  SERVICE_NAME: z.string().default("app"),
  ENVIRONMENT: z.enum(["development", "staging", "production"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

  // Database
  POSTGRES_HOST: z.string().default("localhost"),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_USER: z.string().default("postgres"),
  POSTGRES_PASSWORD: z.string().default("postgres"),
  POSTGRES_DATABASE: z.string().default("app"),
  POSTGRES_MIN_POOL_SIZE: z.coerce.number().default(5),
  POSTGRES_MAX_POOL_SIZE: z.coerce.number().default(20),

  // AWS
  AWS_REGION: z.string().default("us-east-1"),
  AWS_ENDPOINT_URL: z.string().optional(),
  USE_LOCALSTACK: z.coerce.boolean().default(false),
  DEFAULT_EVENT_TOPIC_ARN: z.string().optional(),

  // Event queue URLs
  EVENT_QUEUE_URL_USER_CREATED: z.string().optional(),
  EVENT_QUEUE_URL_USER_UPDATED: z.string().optional(),
  EVENT_QUEUE_URL_INVOICE_CREATED: z.string().optional(),
  EVENT_QUEUE_URL_INVOICE_PAYMENT_REQUESTED: z.string().optional(),
  EVENT_QUEUE_URL_INVOICE_PAID: z.string().optional(),
});

export type Settings = z.infer<typeof settingsSchema>;

export function getSettings(): Settings {
  const parsed = settingsSchema.parse(process.env);

  // Auto-detect LocalStack if endpoint URL is set
  const useLocalstack = parsed.USE_LOCALSTACK || !!parsed.AWS_ENDPOINT_URL;

  return {
    ...parsed,
    USE_LOCALSTACK: useLocalstack,
  };
}
