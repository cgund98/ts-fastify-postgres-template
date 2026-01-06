import { Pool, type PoolClient, type PoolConfig } from "pg";

import type { Settings } from "@/config/settings.js";

class DatabasePool {
  private pool: Pool | null = null;

  createPool(settings: Settings): Pool {
    if (this.pool) {
      return this.pool;
    }

    const config: PoolConfig = {
      host: settings.POSTGRES_HOST,
      port: settings.POSTGRES_PORT,
      user: settings.POSTGRES_USER,
      password: settings.POSTGRES_PASSWORD,
      database: settings.POSTGRES_DATABASE,
      min: settings.POSTGRES_MIN_POOL_SIZE,
      max: settings.POSTGRES_MAX_POOL_SIZE,
    };

    this.pool = new Pool(config);
    return this.pool;
  }

  getPool(): Pool {
    if (!this.pool) {
      throw new Error("Pool not initialized. Call createPool first.");
    }
    return this.pool;
  }

  async getConnection(): Promise<PoolClient> {
    const pool = this.getPool();
    return pool.connect();
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

export const databasePool = new DatabasePool();
