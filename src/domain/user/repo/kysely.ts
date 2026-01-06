import type { User, CreateUser, UserUpdate } from "@/domain/user/model.js";
import type { UserRepository } from "@/domain/user/repo/base.js";
import type { KyselyContext } from "@/infrastructure/db/kysely/index.js";

import { DatabaseError, NoFieldsToUpdateError } from "@/infrastructure/db/exceptions.js";
import { buildUpdateValuesFromObject } from "@/infrastructure/db/update-mapper.js";
import { getLogger } from "@/observability/logging.js";

const logger = getLogger("KyselyUserRepository");

/**
 * Kysely-based implementation of UserRepository.
 *
 * This repository uses Kysely query builder to interact with the database.
 * It requires a KyselyContext (type: "kysely") and uses type introspection
 * to ensure compatibility with the transaction manager.
 * All operations automatically participate in transactions when called within a transaction context.
 */
export class KyselyUserRepository implements UserRepository<KyselyContext> {
  /**
   * Map database row to User domain model.
   * Converts snake_case database columns to camelCase domain model properties.
   */
  private mapToUser(row: {
    id: string;
    email: string;
    name: string;
    age: number | null;
    created_at: Date;
    updated_at: Date;
  }): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      age: row.age,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async create(ctx: KyselyContext, createUser: CreateUser): Promise<User> {
    try {
      const result = await ctx.db
        .insertInto("users")
        .values({
          id: createUser.id,
          email: createUser.email,
          name: createUser.name,
          age: createUser.age,
          created_at: createUser.createdAt,
          updated_at: createUser.updatedAt,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return this.mapToUser(result);
    } catch (error) {
      logger.error({ err: error, msg: "Database error while creating user" });
      throw new DatabaseError();
    }
  }

  async getById(ctx: KyselyContext, userId: string): Promise<User | null> {
    try {
      const result = await ctx.db.selectFrom("users").where("id", "=", userId).selectAll().executeTakeFirst();

      return result ? this.mapToUser(result) : null;
    } catch (error) {
      logger.error({ err: error, msg: "Database error while retrieving user by ID" });
      throw new DatabaseError();
    }
  }

  async getByEmail(ctx: KyselyContext, email: string): Promise<User | null> {
    try {
      const result = await ctx.db.selectFrom("users").where("email", "=", email).selectAll().executeTakeFirst();

      return result ? this.mapToUser(result) : null;
    } catch (error) {
      logger.error({ err: error, msg: "Database error while retrieving user by email" });
      throw new DatabaseError();
    }
  }

  async update(ctx: KyselyContext, user: User): Promise<User> {
    try {
      const result = await ctx.db
        .updateTable("users")
        .set({
          email: user.email,
          name: user.name,
          updated_at: user.updatedAt,
        })
        .where("id", "=", user.id)
        .returningAll()
        .executeTakeFirstOrThrow();

      return this.mapToUser(result);
    } catch (error) {
      logger.error({ err: error, msg: "Database error while updating user" });
      throw new DatabaseError();
    }
  }

  async updatePartial(ctx: KyselyContext, userId: string, update: UserUpdate): Promise<User> {
    try {
      const values = buildUpdateValuesFromObject(update);
      if (Object.keys(values).length === 0) {
        throw new NoFieldsToUpdateError();
      }

      // Always update the updated_at timestamp
      values.updated_at = new Date();

      const result = await ctx.db
        .updateTable("users")
        .set(values)
        .where("id", "=", userId)
        .returningAll()
        .executeTakeFirst();

      if (!result) {
        throw new DatabaseError("Query returned no rows when updating user");
      }

      return this.mapToUser(result);
    } catch (error) {
      if (error instanceof NoFieldsToUpdateError) {
        throw error;
      }
      logger.error({ err: error, msg: "Database error while partially updating user" });
      throw new DatabaseError();
    }
  }

  async delete(ctx: KyselyContext, userId: string): Promise<void> {
    try {
      await ctx.db.deleteFrom("users").where("id", "=", userId).execute();
    } catch (error) {
      logger.error({ err: error, msg: "Database error while deleting user" });
      throw new DatabaseError();
    }
  }

  async list(ctx: KyselyContext, limit: number, offset: number): Promise<User[]> {
    try {
      const results = await ctx.db
        .selectFrom("users")
        .selectAll()
        .orderBy("created_at", "desc")
        .limit(limit)
        .offset(offset)
        .execute();

      return results.map((row) => this.mapToUser(row));
    } catch (error) {
      logger.error({ err: error, msg: "Database error while listing users" });
      throw new DatabaseError();
    }
  }

  async count(ctx: KyselyContext): Promise<number> {
    try {
      const result = await ctx.db
        .selectFrom("users")
        .select((eb) => eb.fn.count<number>("id").as("count"))
        .executeTakeFirstOrThrow();

      return result.count;
    } catch (error) {
      logger.error({ err: error, msg: "Database error while counting users" });
      throw new DatabaseError();
    }
  }
}
