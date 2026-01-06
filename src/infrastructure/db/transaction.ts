import type { PoolClient } from "pg";

export interface TransactionManager {
  transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T>;
}

export class SQLTransactionManager implements TransactionManager {
  constructor(private readonly client: PoolClient) {}

  async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    try {
      await this.client.query("BEGIN");
      const result = await fn(this.client);
      await this.client.query("COMMIT");
      return result;
    } catch (error) {
      await this.client.query("ROLLBACK").catch(() => {
        // Ignore rollback errors
      });
      throw error;
    }
  }
}
