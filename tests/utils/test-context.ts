import type TransactionManager from "@/infrastructure/db/transaction-manager.js";

/**
 * Type tag for test database contexts.
 */
export type TestContextType = "test";

/**
 * Test implementation of DatabaseContext for unit tests.
 *
 * This provides a simple, no-op implementation of DatabaseContext that can be used
 * in unit tests without requiring a real database connection. The transaction method
 * simply executes the function directly without any transaction logic.
 */
export interface TestContext {
  __type: "test";
}

/**
 * Test implementation of TransactionManager for unit tests.
 *
 * This wraps a TestContext and provides the TransactionManager interface.
 */
export class TestTransactionManager implements TransactionManager<TestContext> {
  constructor(private readonly context: TestContext) {}

  async transaction<U>(fn: (ctx: TestContext) => Promise<U>): Promise<U> {
    return fn(this.context);
  }
}

/**
 * Create a new test context instance.
 * Useful for creating test contexts in unit tests.
 */
export function createTestContext(): TestContext {
  return { __type: "test" };
}

/**
 * Create a new test transaction manager instance.
 * Useful for creating transaction managers in unit tests.
 */
export function createTestTransactionManager(context: TestContext): TestTransactionManager {
  return new TestTransactionManager(context);
}
