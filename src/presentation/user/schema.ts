import { Type, type Static } from "@sinclair/typebox";

import { DateTimeSchema } from "../schemas.js";

/**
 * User create request schema.
 * Type is automatically inferred from the schema using Static<T>.
 */
export const UserCreateRequestSchema = Type.Object({
  email: Type.String({ format: "email" }),
  name: Type.String({ minLength: 1, maxLength: 255 }),
  age: Type.Optional(Type.Union([Type.Integer({ minimum: 0 }), Type.Null()])),
});

export type UserCreateRequest = Static<typeof UserCreateRequestSchema>;

/**
 * User patch request schema.
 * Fields are optional - if omitted (undefined), they won't be updated.
 * If provided as null, they will be set to null (for optional fields like age).
 */
export const UserPatchRequestSchema = Type.Object({
  email: Type.Optional(Type.String({ format: "email" })),
  name: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  age: Type.Optional(Type.Union([Type.Integer({ minimum: 0 }), Type.Null()])),
});

export type UserPatchRequest = Static<typeof UserPatchRequestSchema>;

/**
 * User response schema.
 */
export const UserResponseSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  email: Type.String({ format: "email" }),
  name: Type.String(),
  age: Type.Union([Type.Integer(), Type.Null()]),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
});

export type UserResponse = Static<typeof UserResponseSchema>;
