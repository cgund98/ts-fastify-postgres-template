import { DatabaseContext } from "./context.js";

/**
 * Transaction manager for Kysely database contexts.
 *
 * Provides a simple interface for executing operations within database transactions.
 */
export class TransactionManager<TType extends string = string> {
  constructor(private readonly context: DatabaseContext<TType>) {}

  /**
   * Execute a function within a transaction.
   *
   * @param fn - Function to execute within the transaction
   * @returns The result of the function
   */
  async transaction<U>(fn: (ctx: DatabaseContext<TType>) => Promise<U>): Promise<U> {
    return this.context.transaction(fn);
  }

  /**
   * Get the underlying database context.
   */
  getContext(): DatabaseContext<TType> {
    return this.context;
  }
}
