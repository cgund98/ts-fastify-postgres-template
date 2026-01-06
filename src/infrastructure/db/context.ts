/**
 * Generic database context interface.
 *
 * This interface abstracts over different database implementations (Kysely, raw SQL, etc.)
 * while maintaining transaction support. Repositories depend on this interface rather than
 * specific implementations, enabling easy testing and swapping of database backends.
 *
 * @template TType - A type tag that identifies the specific database implementation
 *                   (e.g., "kysely", "sql"). Used for type-safe matching with repositories.
 */
export interface DatabaseContext<TType extends string = string> {
  /**
   * Type tag that identifies the database implementation.
   * Used for type introspection and ensuring repository/context compatibility.
   */
  readonly __type: TType;

  /**
   * Execute a function within a transaction.
   * The function receives a new context that operates within the transaction.
   *
   * @param fn - Function to execute within the transaction
   * @returns The result of the function
   */
  transaction<U>(fn: (ctx: DatabaseContext<TType>) => Promise<U>): Promise<U>;
}
