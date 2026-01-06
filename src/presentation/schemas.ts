import { Type, type Static } from "@sinclair/typebox";

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const DateTimeSchema = Type.String({ format: "date-time" });

export type DateTimeType = Static<typeof DateTimeSchema>;
