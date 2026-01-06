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
   * Starts a new transaction and executes the function within it.
   *
   * Note: Nested transactions are not supported. This method should only be called
   * on contexts created from the database pool, not from within transaction callbacks.
   */
  async transaction<U>(fn: (ctx: DatabaseContext<KyselyContextType>) => Promise<U>): Promise<U> {
    // Since nested transactions are not supported, this is always a Kysely instance
    const kysely = this.kyselyDb as Kysely<DB>;
    return kysely.transaction().execute(async (trx) => {
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
