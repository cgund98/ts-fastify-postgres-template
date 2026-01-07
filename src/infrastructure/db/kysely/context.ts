import type { DB } from "./schema.js";
import type { Kysely, Transaction } from "kysely";

/**
 * Kysely-specific implementation of DatabaseContext.
 *
 * This provides a type-safe way to access the database using Kysely's query builder
 * while maintaining transaction support through Kysely's transaction API.
 */
interface KyselyContext {
  db: Kysely<DB> | Transaction<DB>;
}

export default KyselyContext;
