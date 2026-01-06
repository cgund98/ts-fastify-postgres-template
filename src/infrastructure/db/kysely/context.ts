import type { DB } from "./schema.js";
import type { DatabaseContext } from "../context.js";
import type { Kysely, Transaction } from "kysely";

/**
 * Type tag for Kysely database contexts.
 */
export type KyselyContextType = "kysely";

/**
 * Kysely-specific implementation of DatabaseContext.
 *
 * This provides a type-safe way to access the database using Kysely's query builder
 * while maintaining transaction support through Kysely's transaction API.
 */
export class KyselyContext implements DatabaseContext<KyselyContextType> {
  readonly __type: KyselyContextType = "kysely";

  constructor(private readonly kyselyDb: Kysely<DB> | Transaction<DB>) {}

  /**
   * Get the underlying Kysely database instance.
   * This provides access to Kysely's query builder methods.
   */
  get db(): Kysely<DB> | Transaction<DB> {
    return this.kyselyDb;
  }

  /**
   * Execute a function within a transaction.
   * If already in a transaction (Transaction<DB>), the function executes within the existing transaction.
   * Otherwise, a new transaction is started.
   */
  async transaction<U>(fn: (ctx: DatabaseContext<KyselyContextType>) => Promise<U>): Promise<U> {
    // If we're already in a transaction, Transaction doesn't have a transaction() method
    // So we check if transaction() exists - if not, we're already in a transaction
    if (!("transaction" in this.kyselyDb) || typeof (this.kyselyDb as Kysely<DB>).transaction !== "function") {
      // Already in a transaction, execute directly
      return fn(this);
    }

    // Otherwise, start a new transaction
    return (this.kyselyDb as Kysely<DB>).transaction().execute(async (trx) => {
      const ctx = new KyselyContext(trx);
      return fn(ctx);
    });
  }
}

/**
 * Type guard to check if a context is a KyselyContext.
 * Uses type introspection via the __type property.
 */
export function isKyselyContext(ctx: DatabaseContext): ctx is KyselyContext {
  return ctx.__type === "kysely";
}

/**
 * Helper function to extract Kysely database instance from a DatabaseContext.
 *
 * This function uses type introspection to safely extract the Kysely instance,
 * throwing a descriptive error if the context is not a KyselyContext.
 *
 * @param ctx - The database context
 * @returns The Kysely database instance (may be a transaction)
 * @throws Error if the context is not a KyselyContext
 */
export function getKyselyDb(ctx: DatabaseContext): Kysely<DB> | Transaction<DB> {
  if (!isKyselyContext(ctx)) {
    throw new Error(
      `Expected KyselyContext (type: "kysely") but got context with type: "${ctx.__type}". ` +
        `Make sure you're using the Kysely database implementation.`
    );
  }
  return ctx.db;
}
