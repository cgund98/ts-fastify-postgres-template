# Database

This document covers database schema, migrations, and type generation.

## Schema

The template includes example domains (User). Database migrations are managed using [golang-migrate](https://github.com/golang-migrate/migrate) and located in `resources/db/migrations/`.

### Current Schema

- **Users table**: Stores user information with email uniqueness

## Migrations

To run migrations:

```bash
make migrate
```

Migrations are located in `resources/db/migrations/` and follow the naming convention:
- `{version}_{description}.up.sql` - Migration up
- `{version}_{description}.down.sql` - Migration down

## Type Generation

This project uses [Kysely](https://kysely.dev/) with auto-generated TypeScript types from your PostgreSQL database schema.

After running migrations or making schema changes:

```bash
# Generate TypeScript types from database schema
pnpm run db:generate
```

This will update `src/infrastructure/db/kysely/schema.ts` with type-safe definitions matching your database schema.

The generated types ensure:
- **Compile-time type safety**: TypeScript will catch type errors at compile time
- **Auto-completion**: Your IDE will provide autocomplete for database columns
- **Refactoring safety**: Renaming columns will be caught by the type system

## Kysely Query Builder

Kysely provides a type-safe SQL query builder. Example:

```typescript
// Type-safe query with autocomplete
const user = await db
  .selectFrom("users")
  .selectAll()
  .where("email", "=", email)
  .executeTakeFirst();
```

The query builder ensures that:
- Table names are valid
- Column names exist
- Types match between columns and values
- Joins are type-safe

