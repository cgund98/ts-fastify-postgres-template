import { getSettings, type Settings } from "@/config/settings.js";
import { KyselyUserRepository } from "@/domain/user/repo/kysely.js";
import { UserService } from "@/domain/user/service.js";
import { KyselyContext, KyselyDatabasePool, KyselyTransactionManager } from "@/infrastructure/db/kysely/index.js";
import { SNSPublisher, type EventPublisher } from "@/infrastructure/messaging/publisher/index.js";

let settings: Settings | null = null;

export const kyselyDatabasePool = new KyselyDatabasePool();

export function getSettingsInstance(): Settings {
  settings ??= getSettings();
  return settings;
}

export function getTransactionManager(): KyselyTransactionManager {
  return kyselyDatabasePool.getTransactionManager();
}

export function getEventPublisher(): EventPublisher {
  const settings = getSettingsInstance();
  const topicArn = settings.DEFAULT_EVENT_TOPIC_ARN;
  if (!topicArn) {
    throw new Error("Default event topic ARN must be configured");
  }
  return new SNSPublisher(settings, topicArn);
}

export function getUserService(eventPublisher: EventPublisher): UserService<KyselyContext> {
  const txManager = getTransactionManager();
  const userRepository = new KyselyUserRepository();
  return new UserService(txManager, eventPublisher, userRepository);
}
