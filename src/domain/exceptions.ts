import { NotFoundError, RepositoryError } from "@/infrastructure/db/exceptions.js";

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class BusinessRuleError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = "BusinessRuleError";
  }
}

// Re-export repository exceptions for convenience
export { NotFoundError, RepositoryError };
