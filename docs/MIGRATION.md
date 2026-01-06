# Migration Guide: Python/FastAPI to Node.js/TypeScript

This guide helps developers familiar with the Python FastAPI template understand the equivalent Node.js/TypeScript implementation.

## Language & Runtime

- **Python → Node.js**: Async/await patterns are similar, but Node.js uses single-threaded event loop
- **Poetry → pnpm**: Package management differs, but both use lock files

## Framework

- **FastAPI → Fastify**: Both are high-performance frameworks
- **Pydantic → TypeBox + Zod**:
  - **TypeBox** for presentation layer schemas (request/response validation) with type introspection
  - **Zod** for event serialization/deserialization and runtime validation

## Database

- **SQLAlchemy Core → Kysely**: Type-safe query builders with compile-time type checking
- **asyncpg → pg + Kysely**: Kysely provides a type-safe query builder on top of pg
- **Schema Generation**: Auto-generate TypeScript types from database schema using kysely-codegen

## Type System

- **mypy → TypeScript**: Both provide static type checking, TypeScript is built into the language

## Testing

- **pytest → Vitest**: Both are modern testing frameworks with similar features
- **Test Organization**: Tests organized into `tests/unit/` and `tests/integration/` directories
- **CI Strategy**: Unit tests run in CI (fast), integration tests run separately (slower)

## Key Differences

### Dependency Injection

Both templates use constructor injection, but TypeScript's type system provides compile-time guarantees:

```typescript
// TypeScript - types are enforced at compile time
constructor(
  private readonly transactionManager: TransactionManager<TType>,
  private readonly eventPublisher: EventPublisher,
  private readonly userRepository: UserRepository<DatabaseContext<TType>>
) {}
```

### Type Safety

TypeScript provides end-to-end type safety from database to API:

- Database schema → Kysely types (auto-generated)
- Kysely queries → TypeScript types
- Domain models → TypeScript interfaces
- API schemas → TypeBox schemas with type inference

### Event System

Both use Zod for event serialization, but TypeScript provides additional compile-time type checking:

```typescript
// TypeScript - event types are inferred from Zod schemas
export type UserCreatedEvent = z.infer<typeof UserCreatedEventSchema>;
```

