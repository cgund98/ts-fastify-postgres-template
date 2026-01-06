import { describe, it, expect, beforeEach, vi } from "vitest";

import type { User } from "@/domain/user/model.js";
import type { UserRepository } from "@/domain/user/repo/base.js";
import type { DatabaseContext } from "@/infrastructure/db/context.js";
import type { EventPublisher } from "@/infrastructure/messaging/publisher/base.js";

import { ValidationError } from "@/domain/exceptions.js";
import { UserService } from "@/domain/user/service.js";
import { NotFoundError, DuplicateError, NoFieldsToUpdateError } from "@/infrastructure/db/exceptions.js";
import {
  TransactionManager,
  TransactionManager as TransactionManagerImpl,
} from "@/infrastructure/db/transaction-manager.js";
import { TestContext, createTestContext } from "../../../utils/test-context.js";

describe("UserService", () => {
  let mockTransactionManager: TransactionManager<"test">;
  let mockEventPublisher: EventPublisher;
  let mockUserRepository: UserRepository<DatabaseContext<"test">>;
  let testContext: TestContext;
  let userService: UserService<TransactionManager<"test">, "test">;

  const createMockUser = (overrides?: Partial<User>): User => {
    const now = new Date();
    return {
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      age: 30,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  };

  beforeEach(() => {
    // Create test context
    testContext = createTestContext();

    // Create transaction manager using the test context
    mockTransactionManager = new TransactionManagerImpl(testContext);
    // Spy on the transaction method for testing
    vi.spyOn(mockTransactionManager, "transaction");

    // Create mock event publisher
    mockEventPublisher = {
      publish: vi.fn(async () => {}),
    } as unknown as EventPublisher;

    // Create mock repository
    mockUserRepository = {
      create: vi.fn(),
      getById: vi.fn(),
      getByEmail: vi.fn(),
      update: vi.fn(),
      updatePartial: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
      count: vi.fn(),
    } as unknown as UserRepository<DatabaseContext<"test">>;

    // Create service instance
    userService = new UserService(mockTransactionManager, mockEventPublisher, mockUserRepository);
  });

  describe("createUser", () => {
    it("should create a user successfully", async () => {
      const user = createMockUser();

      vi.mocked(mockUserRepository.getByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.create).mockResolvedValue(user);

      const result = await userService.createUser(user.email, user.name, user.age);

      expect(result).toEqual(user);
      expect(mockUserRepository.getByEmail).toHaveBeenCalledWith(testContext, user.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        testContext,
        expect.objectContaining({
          email: user.email,
          name: user.name,
          age: user.age,
        })
      );
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "user.created",
          aggregateId: user.id,
          email: user.email,
          name: user.name,
        })
      );
    });

    it("should throw ValidationError when name is empty", async () => {
      vi.mocked(mockUserRepository.getByEmail).mockResolvedValue(null);

      await expect(userService.createUser("test@example.com", "", null)).rejects.toThrow(ValidationError);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    it("should throw DuplicateError when email already exists", async () => {
      const existingUser = createMockUser();
      vi.mocked(mockUserRepository.getByEmail).mockResolvedValue(existingUser);

      await expect(userService.createUser(existingUser.email, "New User", null)).rejects.toThrow(DuplicateError);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    it("should create user with null age when age is not provided", async () => {
      const user = createMockUser({ age: null });
      vi.mocked(mockUserRepository.getByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.create).mockResolvedValue(user);

      const result = await userService.createUser(user.email, user.name);

      expect(result.age).toBeNull();
      expect(mockUserRepository.create).toHaveBeenCalledWith(testContext, expect.objectContaining({ age: null }));
    });
  });

  describe("getUser", () => {
    it("should return a user when found", async () => {
      const user = createMockUser();
      vi.mocked(mockUserRepository.getById).mockResolvedValue(user);

      const result = await userService.getUser(user.id);

      expect(result).toEqual(user);
      expect(mockUserRepository.getById).toHaveBeenCalledWith(testContext, user.id);
    });

    it("should return null when user not found", async () => {
      vi.mocked(mockUserRepository.getById).mockResolvedValue(null);

      const result = await userService.getUser("non-existent-id");

      expect(result).toBeNull();
      expect(mockUserRepository.getById).toHaveBeenCalledWith(testContext, "non-existent-id");
    });
  });

  describe("patchUser", () => {
    it("should update user email successfully", async () => {
      const existingUser = createMockUser();
      const updatedUser = createMockUser({ email: "newemail@example.com", updatedAt: new Date() });

      vi.mocked(mockUserRepository.getById).mockResolvedValue(existingUser);
      vi.mocked(mockUserRepository.getByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.updatePartial).mockResolvedValue(updatedUser);

      const result = await userService.patchUser({ userId: existingUser.id, email: "newemail@example.com" });

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.updatePartial).toHaveBeenCalledWith(
        testContext,
        existingUser.id,
        expect.objectContaining({ email: "newemail@example.com" })
      );
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "user.updated",
          aggregateId: updatedUser.id,
          changes: expect.objectContaining({
            email: expect.objectContaining({ old: existingUser.email, new: updatedUser.email }),
          }),
        })
      );
    });

    it("should update user name successfully", async () => {
      const existingUser = createMockUser();
      const updatedUser = createMockUser({ name: "New Name", updatedAt: new Date() });

      vi.mocked(mockUserRepository.getById).mockResolvedValue(existingUser);
      vi.mocked(mockUserRepository.updatePartial).mockResolvedValue(updatedUser);

      const result = await userService.patchUser({ userId: existingUser.id, name: "New Name" });

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.updatePartial).toHaveBeenCalledWith(
        testContext,
        existingUser.id,
        expect.objectContaining({ name: "New Name" })
      );
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "user.updated",
          changes: expect.objectContaining({
            name: expect.objectContaining({ old: existingUser.name, new: updatedUser.name }),
          }),
        })
      );
    });

    it("should update user age successfully", async () => {
      const existingUser = createMockUser({ age: 30 });
      const updatedUser = createMockUser({ age: 35, updatedAt: new Date() });

      vi.mocked(mockUserRepository.getById).mockResolvedValue(existingUser);
      vi.mocked(mockUserRepository.updatePartial).mockResolvedValue(updatedUser);

      const result = await userService.patchUser({ userId: existingUser.id, age: 35 });

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.updatePartial).toHaveBeenCalledWith(
        testContext,
        existingUser.id,
        expect.objectContaining({ age: 35 })
      );
    });

    it("should update multiple fields at once", async () => {
      const existingUser = createMockUser({ age: 30 });
      const updatedUser = createMockUser({
        email: "newemail@example.com",
        name: "New Name",
        age: 35,
        updatedAt: new Date(),
      });

      vi.mocked(mockUserRepository.getById).mockResolvedValue(existingUser);
      vi.mocked(mockUserRepository.getByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.updatePartial).mockResolvedValue(updatedUser);

      const result = await userService.patchUser({
        userId: existingUser.id,
        email: "newemail@example.com",
        name: "New Name",
        age: 35,
      });

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.updatePartial).toHaveBeenCalledWith(
        testContext,
        existingUser.id,
        expect.objectContaining({
          email: "newemail@example.com",
          name: "New Name",
          age: 35,
        })
      );
    });

    it("should throw NotFoundError when user does not exist", async () => {
      vi.mocked(mockUserRepository.getById).mockResolvedValue(null);

      await expect(userService.patchUser({ userId: "non-existent-id", email: "newemail@example.com" })).rejects.toThrow(
        NotFoundError
      );
      expect(mockUserRepository.updatePartial).not.toHaveBeenCalled();
      expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    it("should throw ValidationError when name is empty", async () => {
      const existingUser = createMockUser();
      vi.mocked(mockUserRepository.getById).mockResolvedValue(existingUser);

      await expect(userService.patchUser({ userId: existingUser.id, name: "" })).rejects.toThrow(ValidationError);
      expect(mockUserRepository.updatePartial).not.toHaveBeenCalled();
    });

    it("should throw DuplicateError when email already exists", async () => {
      const existingUser = createMockUser();
      const otherUser = createMockUser({ id: "other-id", email: "other@example.com" });

      vi.mocked(mockUserRepository.getById).mockResolvedValue(existingUser);
      vi.mocked(mockUserRepository.getByEmail).mockResolvedValue(otherUser);

      await expect(userService.patchUser({ userId: existingUser.id, email: "other@example.com" })).rejects.toThrow(
        DuplicateError
      );
      expect(mockUserRepository.updatePartial).not.toHaveBeenCalled();
    });

    it("should return existing user when NoFieldsToUpdateError is thrown", async () => {
      const existingUser = createMockUser();
      vi.mocked(mockUserRepository.getById).mockResolvedValue(existingUser);
      vi.mocked(mockUserRepository.updatePartial).mockRejectedValue(new NoFieldsToUpdateError());

      const result = await userService.patchUser({ userId: existingUser.id });

      expect(result).toEqual(existingUser);
      expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    it("should not publish event when no changes are made", async () => {
      const existingUser = createMockUser();
      vi.mocked(mockUserRepository.getById).mockResolvedValue(existingUser);
      vi.mocked(mockUserRepository.updatePartial).mockRejectedValue(new NoFieldsToUpdateError());

      await userService.patchUser({ userId: existingUser.id });

      expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    it("should allow updating email to the same value", async () => {
      const existingUser = createMockUser();
      vi.mocked(mockUserRepository.getById).mockResolvedValue(existingUser);
      vi.mocked(mockUserRepository.getByEmail).mockResolvedValue(existingUser);
      vi.mocked(mockUserRepository.updatePartial).mockRejectedValue(new NoFieldsToUpdateError());

      const result = await userService.patchUser({ userId: existingUser.id, email: existingUser.email });

      expect(result).toEqual(existingUser);
      // Should not throw DuplicateError because it's the same user's email
    });
  });

  describe("listUsers", () => {
    it("should return users and total count", async () => {
      const users = [createMockUser({ id: "user-1" }), createMockUser({ id: "user-2" })];
      const total = 2;

      vi.mocked(mockUserRepository.list).mockResolvedValue(users);
      vi.mocked(mockUserRepository.count).mockResolvedValue(total);

      const result = await userService.listUsers(10, 0);

      expect(result).toEqual([users, total]);
      expect(mockUserRepository.list).toHaveBeenCalledWith(testContext, 10, 0);
      expect(mockUserRepository.count).toHaveBeenCalledWith(testContext);
    });

    it("should handle pagination correctly", async () => {
      const users = [createMockUser()];
      vi.mocked(mockUserRepository.list).mockResolvedValue(users);
      vi.mocked(mockUserRepository.count).mockResolvedValue(100);

      const result = await userService.listUsers(20, 40);

      expect(result).toEqual([users, 100]);
      expect(mockUserRepository.list).toHaveBeenCalledWith(testContext, 20, 40);
    });

    it("should return empty array when no users exist", async () => {
      vi.mocked(mockUserRepository.list).mockResolvedValue([]);
      vi.mocked(mockUserRepository.count).mockResolvedValue(0);

      const result = await userService.listUsers(10, 0);

      expect(result).toEqual([[], 0]);
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      const user = createMockUser();
      vi.mocked(mockUserRepository.getById).mockResolvedValue(user);
      vi.mocked(mockUserRepository.delete).mockResolvedValue();

      await userService.deleteUser(user.id);

      expect(mockUserRepository.getById).toHaveBeenCalledWith(testContext, user.id);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(testContext, user.id);
    });

    it("should throw NotFoundError when user does not exist", async () => {
      vi.mocked(mockUserRepository.getById).mockResolvedValue(null);

      await expect(userService.deleteUser("non-existent-id")).rejects.toThrow(NotFoundError);
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe("transaction handling", () => {
    it("should execute operations within a transaction", async () => {
      const user = createMockUser();
      vi.mocked(mockUserRepository.getByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.create).mockResolvedValue(user);

      await userService.createUser(user.email, user.name);

      expect(mockTransactionManager.transaction).toHaveBeenCalled();
      const transactionCallback = vi.mocked(mockTransactionManager.transaction).mock.calls[0]?.[0];
      expect(transactionCallback).toBeDefined();
      expect(typeof transactionCallback).toBe("function");
    });

    it("should pass context to repository methods", async () => {
      const user = createMockUser();
      vi.mocked(mockUserRepository.getById).mockResolvedValue(user);

      await userService.getUser(user.id);

      expect(mockUserRepository.getById).toHaveBeenCalledWith(testContext, user.id);
    });
  });
});
