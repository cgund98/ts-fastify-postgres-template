import type { DatabaseContext } from "@/infrastructure/db/context.js";

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
export class TestContext implements DatabaseContext<TestContextType> {
  readonly __type: TestContextType = "test";

  /**
   * Execute a function within a "transaction".
   * For unit tests, this simply executes the function directly without any
   * actual transaction logic.
   */
  async transaction<U>(fn: (ctx: DatabaseContext<TestContextType>) => Promise<U>): Promise<U> {
    return fn(this);
  }
}

/**
 * Create a new test context instance.
 * Useful for creating test contexts in unit tests.
 */
export function createTestContext(): TestContext {
  return new TestContext();
}
