import type { User, CreateUser, UserUpdate } from "@/domain/user/model.js";
import type { DatabaseContext } from "@/infrastructure/db/context.js";

/**
 * User repository interface.
 *
 * @template TContext - The specific DatabaseContext type this repository works with.
 *                      Type inference ensures compatibility with transaction managers.
 */
export interface UserRepository<TContext extends DatabaseContext = DatabaseContext> {
  create(ctx: TContext, createUser: CreateUser): Promise<User>;
  getById(ctx: TContext, userId: string): Promise<User | null>;
  getByEmail(ctx: TContext, email: string): Promise<User | null>;
  update(ctx: TContext, user: User): Promise<User>;
  updatePartial(ctx: TContext, userId: string, update: UserUpdate): Promise<User>;
  delete(ctx: TContext, userId: string): Promise<void>;
  list(ctx: TContext, limit: number, offset: number): Promise<User[]>;
  count(ctx: TContext): Promise<number>;
}
