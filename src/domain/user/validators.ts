import type { User } from "@/domain/user/model.js";
import type { UserRepository } from "@/domain/user/repo/base.js";

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

interface ValidateEmailNotDuplicateParams<TContext> {
  userRepository: UserRepository<TContext>;
  ctx: TContext;
  email: RequiredOrUnset<string>;
  currentEmail: string;
}

async function validateEmailNotDuplicate<TContext>({
  userRepository,
  ctx,
  email,
  currentEmail,
}: ValidateEmailNotDuplicateParams<TContext>): Promise<void> {
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

export interface ValidateCreateUserRequestParams<TContext> {
  ctx: TContext;
  email: string;
  name: string;
  userRepository: UserRepository<TContext>;
}

export async function validateCreateUserRequest<TContext>({
  ctx,
  email,
  name,
  userRepository,
}: ValidateCreateUserRequestParams<TContext>): Promise<void> {
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

export interface ValidatePatchUserRequestParams<TContext> {
  ctx: TContext;
  userId: string;
  email: RequiredOrUnset<string>;
  name: RequiredOrUnset<string>;
  userRepository: UserRepository<TContext>;
}

export async function validatePatchUserRequest<TContext>({
  ctx,
  userId,
  email,
  name,
  userRepository,
}: ValidatePatchUserRequestParams<TContext>): Promise<User> {
  // Validate user exists
  const user = await userRepository.getById(ctx, userId);
  if (user === null) {
    throw new NotFoundError("User", userId);
  }

  // Validate name if provided
  validateName(name);

  // Validate email if provided
  await validateEmailNotDuplicate({
    userRepository,
    ctx,
    email,
    currentEmail: user.email,
  });

  return user;
}

export async function validateDeleteUserRequest<TContext>(
  ctx: TContext,
  userId: string,
  userRepository: UserRepository<TContext>
): Promise<User> {
  const user = await userRepository.getById(ctx, userId);
  if (user === null) {
    throw new NotFoundError("User", userId);
  }

  return user;
}
