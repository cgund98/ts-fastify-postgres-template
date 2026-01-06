import { type FastifyReply, type FastifyRequest } from "fastify";

import {
  BusinessRuleError,
  DomainError,
  NotFoundError,
  RepositoryError,
  ValidationError,
} from "@/domain/exceptions.js";
import { DatabaseError, DuplicateError, NoFieldsToUpdateError } from "@/infrastructure/db/exceptions.js";
import { getLogger } from "@/observability/logging.js";

const logger = getLogger("Exceptions");

export async function handleDomainExceptions(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (error instanceof ValidationError) {
    await reply.status(400).send({
      error: "ValidationError",
      message: error.message,
      field: error.field,
    });
    return;
  }

  if (error instanceof BusinessRuleError) {
    await reply.status(422).send({
      error: "BusinessRuleError",
      message: error.message,
    });
    return;
  }

  if (error instanceof NotFoundError) {
    await reply.status(404).send({
      error: "NotFoundError",
      message: error.message,
      entityType: error.entityType,
      identifier: error.identifier,
    });
    return;
  }

  if (error instanceof DuplicateError) {
    await reply.status(409).send({
      error: "DuplicateError",
      message: error.message,
    });
    return;
  }

  if (error instanceof NoFieldsToUpdateError) {
    await reply.status(400).send({
      error: "NoFieldsToUpdateError",
      message: error.message,
    });
    return;
  }

  if (error instanceof DatabaseError || error instanceof RepositoryError) {
    await reply.status(500).send({
      error: "DatabaseError",
      message: "An internal database error occurred",
    });
    return;
  }

  if (error instanceof DomainError) {
    await reply.status(500).send({
      error: "DomainError",
      message: error.message,
    });
    return;
  }

  // The check for FastifyError cannot use 'instanceof' because FastifyError is a type, not a value.
  // Instead, check for the known properties of FastifyError.
  if (
    typeof error === "object" &&
    typeof error.name === "string" &&
    typeof error.message === "string" &&
    Object.prototype.hasOwnProperty.call(error, "statusCode")
  ) {
    await reply.status((error as any).statusCode ?? 500).send({
      error: (error as any).name,
      message: (error as any).message,
    });
    return;
  }

  // Log all errors before mapping to response types
  logger.error(
    {
      err: error,
      msg: "Uncaught exception",
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
    },
    "Uncaught exception in request handler"
  );

  // Unknown error
  await reply.status(500).send({
    error: "InternalServerError",
    message: "An unexpected error occurred",
  });
}
