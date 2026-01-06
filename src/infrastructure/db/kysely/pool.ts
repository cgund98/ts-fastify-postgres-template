import { Kysely, PostgresDialect, type Transaction } from "kysely";
import { Pool } from "pg";

import { KyselyContext } from "./context.js";

import type { DB } from "./schema.js";
import type { Settings } from "@/config/settings.js";

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

  getDatabase(): Kysely<DB> {
    if (!this.db) {
      throw new Error("Database not initialized. Call createDatabase first.");
    }
    return this.db;
  }

  /**
   * Get a database context for use in repositories.
   */
  getContext(): KyselyContext {
    const db = this.getDatabase();
    return new KyselyContext(db);
  }

  /**
   * Get a connection context (for transactions).
   * This creates a new context that can be used within a transaction.
   */
  getConnectionContext(): KyselyContext {
    const db = this.getDatabase();
    // For connection-level operations, we still use the main database instance
    // Transactions will be handled by the context's transaction method
    return new KyselyContext(db);
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
