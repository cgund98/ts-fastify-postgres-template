import type { OptionalOrUnset, RequiredOrUnset } from "@/domain/types.js";

export interface User {
  id: string;
  email: string;
  name: string;
  age: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUser {
  id: string;
  email: string;
  name: string;
  age: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserUpdate {
  email: RequiredOrUnset<string>;
  name: RequiredOrUnset<string>;
  age: OptionalOrUnset<number>;
}

export function createUserUpdate(): UserUpdate {
  return {
    email: undefined,
    name: undefined,
    age: undefined,
  };
}
