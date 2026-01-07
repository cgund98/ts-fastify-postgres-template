import { Kysely } from "kysely";
import TransactionManager from "../transaction-manager.js";
import KyselyContext from "./context.js";
import { DB } from "./schema.js";

class KyselyTransactionManager implements TransactionManager<KyselyContext> {
  constructor(private readonly db: Kysely<DB>) {}

  async transaction<U>(fn: (ctx: KyselyContext) => Promise<U>): Promise<U> {
    return this.db.transaction().execute(async (trx) => {
      const ctx: KyselyContext = { db: trx };
      return fn(ctx);
    });
  }
}

export default KyselyTransactionManager;
