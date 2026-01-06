import type { DatabaseContext } from "./context.js";

/**
 * Transaction manager that works with DatabaseContext.
 *
 * This provides a higher-level abstraction for managing transactions,
 * allowing services to work with transactions without knowing the underlying
 * database implementation.
 *
 * @template TType - The type tag of the DatabaseContext this manager works with.
 *                   Type inference ensures compatibility with repositories.
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
   * Useful for type introspection and ensuring repository compatibility.
   */
  getContext(): DatabaseContext<TType> {
    return this.context;
  }
}
