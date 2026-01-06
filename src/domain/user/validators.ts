import type { User } from "@/domain/user/model.js";
import type { UserRepository } from "@/domain/user/repo/base.js";
import type { DatabaseContext } from "@/infrastructure/db/context.js";

import { NotFoundError, ValidationError } from "@/domain/exceptions.js";
import type { RequiredOrUnset } from "@/domain/types.js";
import { DuplicateError } from "@/infrastructure/db/exceptions.js";

function validateName(name: RequiredOrUnset<string>): void {
  if (name === undefined) {
    return;
  }

  if (!name.trim()) {
    throw new ValidationError("Name cannot be empty", "name");
  }
}

async function validateEmailNotDuplicate(
  userRepository: UserRepository,
  ctx: DatabaseContext,
  email: RequiredOrUnset<string>,
  currentEmail: string
): Promise<void> {
  if (email === undefined) {
    return;
  }

  if (email !== currentEmail) {
    const existing = await userRepository.getByEmail(ctx, email);
    if (existing !== null) {
      throw new DuplicateError(`User with email ${email} already exists`);
    }
  }
}

export async function validateCreateUserRequest(
  ctx: DatabaseContext,
  email: string,
  name: string,
  userRepository: UserRepository
): Promise<void> {
  // Validate name
  if (!name.trim()) {
    throw new ValidationError("Name cannot be empty", "name");
  }

  // Check if user already exists
  const existing = await userRepository.getByEmail(ctx, email);
  if (existing !== null) {
    throw new DuplicateError(`User with email ${email} already exists`);
  }
}

export async function validatePatchUserRequest(
  ctx: DatabaseContext,
  userId: string,
  email: RequiredOrUnset<string>,
  name: RequiredOrUnset<string>,
  userRepository: UserRepository
): Promise<User> {
  // Validate user exists
  const user = await userRepository.getById(ctx, userId);
  if (user === null) {
    throw new NotFoundError("User", userId);
  }

  // Validate name if provided
  validateName(name);

  // Validate email if provided
  await validateEmailNotDuplicate(userRepository, ctx, email, user.email);

  return user;
}

export async function validateDeleteUserRequest(
  ctx: DatabaseContext,
  userId: string,
  userRepository: UserRepository
): Promise<User> {
  const user = await userRepository.getById(ctx, userId);
  if (user === null) {
    throw new NotFoundError("User", userId);
  }

  return user;
}
