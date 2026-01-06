export class DatabaseError extends Error {
  constructor(message?: string) {
    super(message ?? "Database error occurred");
    this.name = "DatabaseError";
  }
}

export class NotFoundError extends Error {
  constructor(
    public readonly entityType: string,
    public readonly identifier: string
  ) {
    super(`${entityType} with identifier ${identifier} not found`);
    this.name = "NotFoundError";
  }
}

export class DuplicateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateError";
  }
}

export class RepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryError";
  }
}

export class NoFieldsToUpdateError extends Error {
  constructor() {
    super("No fields to update");
    this.name = "NoFieldsToUpdateError";
  }
}
