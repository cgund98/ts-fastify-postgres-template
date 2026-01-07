/**
 * Transaction manager interface.
 *
 * Provides a simple interface for executing operations within database transactions.
 */
interface TransactionManager<TContext> {
  transaction<U>(fn: (ctx: TContext) => Promise<U>): Promise<U>;
}

export default TransactionManager;
