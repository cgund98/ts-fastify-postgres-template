import { Kysely, PostgresDialect, type Transaction } from "kysely";
import { Pool } from "pg";

import type { DB } from "./schema.js";
import type { Settings } from "@/config/settings.js";
import KyselyTransactionManager from "./transaction-manager.js";

/**
 * Kysely database pool manager.
 *
 * Uses PostgreSQL dialect with the `pg` driver for connection pooling.
 * The PostgresDialect provides PostgreSQL-specific SQL generation and features.
 */
export class KyselyDatabasePool {
  private db: Kysely<DB> | null = null;
  private pool: Pool | null = null;

  createDatabase(settings: Settings): Kysely<DB> {
    if (this.db) {
      return this.db;
    }

    // Create PostgreSQL connection pool using pg driver
    const pgPool = new Pool({
      host: settings.POSTGRES_HOST,
      port: settings.POSTGRES_PORT,
      user: settings.POSTGRES_USER,
      password: settings.POSTGRES_PASSWORD,
      database: settings.POSTGRES_DATABASE,
      min: settings.POSTGRES_MIN_POOL_SIZE,
      max: settings.POSTGRES_MAX_POOL_SIZE,
    });

    this.pool = pgPool;

    // Create Kysely instance with PostgreSQL dialect
    // PostgresDialect uses the pg pool for executing queries with PostgreSQL-specific SQL syntax
    this.db = new Kysely<DB>({
      dialect: new PostgresDialect({
        pool: pgPool,
      }),
    });

    return this.db;
  }

  // Fetch a new transaction manager for use in services.
  getTransactionManager(): KyselyTransactionManager {
    return new KyselyTransactionManager(this.getDatabase());
  }

  getDatabase(): Kysely<DB> {
    if (!this.db) {
      throw new Error("Database not initialized. Call createDatabase first.");
    }
    return this.db;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.destroy();
      this.db = null;
    }
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

/**
 * Type for database instance (can be Kysely or Transaction).
 * Used for transaction support in repository functions.
 */
export type Database = Kysely<DB> | Transaction<DB>;
