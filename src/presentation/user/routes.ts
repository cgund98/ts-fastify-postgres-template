import { Type, type Static } from "@sinclair/typebox";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsync } from "fastify";

import type { PaginatedResponse } from "../schemas";

import { NotFoundError } from "@/domain/exceptions.js";
import { getEventPublisher, getUserService } from "@/presentation/deps.js";
import { createPaginatedResponse, pageToLimitOffset, paginatedResponseSchema } from "@/presentation/pagination.js";
import {
  userCreateRequestSchema,
  userPatchRequestSchema,
  userResponseSchema,
  type UserResponse,
} from "@/presentation/user/schema.js";

const listUsersQuerySchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
});

const userIdParamsSchema = Type.Object({
  userId: Type.String({ format: "uuid" }),
});

export const userRoutes: FastifyPluginAsync<{ provider: TypeBoxTypeProvider }> = async (fastify) => {
  // GET /users - List users with pagination
  fastify.get<{
    Querystring: Static<typeof listUsersQuerySchema>;
  }>(
    "/users",
    {
      schema: {
        querystring: listUsersQuerySchema,
        response: { 200: paginatedResponseSchema(userResponseSchema) },
      },
    },
    async (request): Promise<PaginatedResponse<UserResponse>> => {
      const { page = 1, pageSize = 20 } = request.query;

      const service = getUserService(getEventPublisher());
      const [limit, offset] = pageToLimitOffset(page, pageSize);
      const [users, total] = await service.listUsers(limit, offset);

      return createPaginatedResponse(
        users.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          age: user.age,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        })),
        page,
        pageSize,
        total
      );
    }
  );

  // POST /users - Create a new user
  fastify.post<{
    Body: Static<typeof userCreateRequestSchema>;
  }>(
    "/users",
    {
      schema: {
        body: userCreateRequestSchema,
        response: { 201: userResponseSchema },
      },
    },
    async (request, reply): Promise<UserResponse> => {
      const service = getUserService(getEventPublisher());
      const { email, name, age } = request.body;
      const user = await service.createUser(email, name, age ?? null);

      // Infer response from schema
      return reply.status(201).send({
        id: user.id,
        email: user.email,
        name: user.name,
        age: user.age,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      });
    }
  );

  // GET /users/:userId - Get a user by ID
  fastify.get<{
    Params: Static<typeof userIdParamsSchema>;
  }>(
    "/users/:userId",
    {
      schema: {
        params: userIdParamsSchema,
        response: { 200: userResponseSchema },
      },
    },
    async (request): Promise<UserResponse> => {
      const service = getUserService(getEventPublisher());
      const user = await service.getUser(request.params.userId);

      if (!user) {
        throw new NotFoundError("User", request.params.userId);
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        age: user.age,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    }
  );

  // PATCH /users/:userId - Partially update a user
  fastify.patch<{
    Params: Static<typeof userIdParamsSchema>;
    Body: Static<typeof userPatchRequestSchema>;
  }>(
    "/users/:userId",
    {
      schema: {
        params: userIdParamsSchema,
        body: userPatchRequestSchema,
        response: { 200: userResponseSchema },
      },
    },
    async (request): Promise<UserResponse> => {
      const service = getUserService(getEventPublisher());

      // Fields are optional in the schema, so they'll be undefined if not provided
      const email = request.body.email;
      const name = request.body.name;
      const age = request.body.age;

      const user = await service.patchUser(request.params.userId, email, name, age);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        age: user.age,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    }
  );

  // DELETE /users/:userId - Delete a user
  fastify.delete<{
    Params: Static<typeof userIdParamsSchema>;
  }>(
    "/users/:userId",
    {
      schema: {
        params: userIdParamsSchema,
        response: { 204: Type.Null() },
      },
    },
    async (request, reply): Promise<void> => {
      const service = getUserService(getEventPublisher());
      await service.deleteUser(request.params.userId);
      return reply.status(204).send();
    }
  );
};
