import { randomUUID } from "crypto";

import type { OptionalOrUnset, RequiredOrUnset } from "@/domain/types.js";
import type { UserRepository } from "@/domain/user/repo/base.js";
import type { TransactionManager } from "@/infrastructure/db/transaction-manager.js";
import type { EventPublisher } from "@/infrastructure/messaging/publisher/base.js";
import { generateUserChanges } from "@/domain/user/diff.js";
import { createUserCreatedEvent, createUserUpdatedEvent } from "@/domain/user/events/schema.js";
import { type CreateUser, type User, type UserUpdate } from "@/domain/user/model.js";
import {
  validateCreateUserRequest,
  validateDeleteUserRequest,
  validatePatchUserRequest,
} from "@/domain/user/validators.js";
import { NoFieldsToUpdateError } from "@/infrastructure/db/exceptions.js";
import type { DatabaseContext } from "@/infrastructure/db/context.js";

/**
 * User domain service.
 *
 * The database context type is inferred from the TransactionManager to ensure
 * type safety between the transaction manager and repository.
 */
export class UserService<TManager extends TransactionManager<TType>, TType extends string = string> {
  constructor(
    private readonly transactionManager: TManager,
    private readonly eventPublisher: EventPublisher,
    private readonly userRepository: UserRepository<DatabaseContext<TType>>
  ) {}

  async createUser(email: string, name: string, age: number | null = null): Promise<User> {
    return this.transactionManager.transaction(async (ctx) => {
      // Validate request
      await validateCreateUserRequest({
        ctx,
        email,
        name,
        userRepository: this.userRepository,
      });

      // Generate UUID and timestamps
      const userId = randomUUID();
      const now = new Date();
      const createUser: CreateUser = {
        id: userId,
        email,
        name,
        age,
        createdAt: now,
        updatedAt: now,
      };

      const user = await this.userRepository.create(ctx, createUser);

      // Publish event (after commit)
      const event = createUserCreatedEvent(user.id, user.email, user.name);
      await this.eventPublisher.publish(event);

      return user;
    });
  }

  async getUser(userId: string): Promise<User | null> {
    return this.transactionManager.transaction(async (ctx) => {
      return this.userRepository.getById(ctx, userId);
    });
  }

  async patchUser({
    userId,
    email,
    name,
    age,
  }: {
    userId: string;
    email?: RequiredOrUnset<string>;
    name?: RequiredOrUnset<string>;
    age?: OptionalOrUnset<number>;
  }): Promise<User> {
    return this.transactionManager.transaction(async (ctx) => {
      // Validate request and get user
      const user = await validatePatchUserRequest({
        ctx,
        userId,
        email,
        name,
        userRepository: this.userRepository,
      });

      // Build UserUpdate from provided fields
      const userUpdate: UserUpdate = {
        email,
        name,
        age,
      };

      // Generate changes dictionary for event
      const changes = generateUserChanges(userUpdate, user);

      // Perform partial update
      try {
        const updatedUser = await this.userRepository.updatePartial(ctx, userId, userUpdate);

        // Publish event if there were changes
        if (Object.keys(changes).length > 0) {
          const event = createUserUpdatedEvent(updatedUser.id, changes);
          await this.eventPublisher.publish(event);
        }
        return updatedUser;
      } catch (error) {
        if (error instanceof NoFieldsToUpdateError) {
          return user;
        }
        throw error;
      }
    });
  }

  async listUsers(limit: number, offset: number): Promise<[User[], number]> {
    return this.transactionManager.transaction(async (ctx) => {
      const users = await this.userRepository.list(ctx, limit, offset);
      const total = await this.userRepository.count(ctx);
      return [users, total];
    });
  }

  async deleteUser(userId: string): Promise<void> {
    return this.transactionManager.transaction(async (ctx) => {
      // Validate request and get user
      await validateDeleteUserRequest(ctx, userId, this.userRepository);
      // Delete the user
      await this.userRepository.delete(ctx, userId);
    });
  }
}
