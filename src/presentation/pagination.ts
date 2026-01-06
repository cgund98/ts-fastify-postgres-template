import type { PaginatedResponse } from "@/presentation/schemas.js";
import { type TSchema, Type } from "@sinclair/typebox";

export function pageToLimitOffset(page: number, pageSize: number): [number, number] {
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  return [limit, offset];
}

export const paginatedResponseSchema = (itemSchema: TSchema): TSchema =>
  Type.Object({
    items: Type.Array(itemSchema),
    page: Type.Integer(),
    pageSize: Type.Integer(),
    total: Type.Integer(),
    totalPages: Type.Integer(),
  });

export function createPaginatedResponse<T>(
  items: T[],
  page: number,
  pageSize: number,
  total: number
): PaginatedResponse<T> {
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;

  return {
    items,
    page,
    pageSize,
    total,
    totalPages,
  };
}
