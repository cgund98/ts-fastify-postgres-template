import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";

import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

import { getSettings } from "@/config/settings.js";
import { getLogger } from "@/observability/logging.js";
import { kyselyDatabasePool } from "@/presentation/deps";
import { handleDomainExceptions } from "@/presentation/exceptions.js";
import { userRoutes } from "@/presentation/user/routes.js";

const settings = getSettings();
const logger = getLogger("API");

async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: settings.LOG_LEVEL,
    },
  }).withTypeProvider<TypeBoxTypeProvider>();

  // Register plugins
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  // Register exception handlers
  app.setErrorHandler(async (error, request, reply) => {
    await handleDomainExceptions(error instanceof Error ? error : new Error(String(error)), request, reply);
  });

  // Register swagger
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Fastify PostgreSQL Template",
        version: "0.1.0",
      },
      servers: [{ url: "/api" }], // <- match the actual host path
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
  });

  // Register API routes
  await app.register(
    async (api) => {
      await api.register(helmet);
      await api.register(userRoutes as FastifyPluginAsync);
    },
    { prefix: "/api" }
  );

  // Health check
  app.get("/health", () => {
    return { status: "healthy" };
  });

  return app;
}

async function main(): Promise<void> {
  try {
    logger.info({ environment: settings.ENVIRONMENT, msg: "Starting API server" });

    // Initialize database pool
    kyselyDatabasePool.createDatabase(settings);
    logger.info({ msg: "Database pool initialized" });

    const app = await buildApp();

    const port = process.env.PORT ? Number(process.env.PORT) : 8000;
    const host = process.env.HOST ?? "0.0.0.0";

    await app.listen({ port, host });
    logger.info({ port, host, msg: "API server started" });
  } catch (error) {
    logger.error({ err: error, msg: "Failed to start API server" });
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
  logger.info({ msg: "Received SIGTERM, shutting down gracefully" });
  void kyselyDatabasePool.close().finally(() => {
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info({ msg: "Received SIGINT, shutting down gracefully" });
  void kyselyDatabasePool.close().finally(() => {
    process.exit(0);
  });
});

// Run main if this file is executed directly
if (import.meta.url === `file://${process.argv[1] ?? ""}` || process.argv[1]?.endsWith("main.ts")) {
  main().catch((error: unknown) => {
    logger.error({ err: error, msg: "Unhandled error in main" });
    process.exit(1);
  });
}
