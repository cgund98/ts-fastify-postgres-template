import type { CodegenConfig } from "kysely-codegen";

const config: CodegenConfig = {
  dialect: "postgres",
  // Connection string will be read from environment variables or kysely-codegen will prompt
  // Format: postgres://user:password@host:port/database
  connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/app",
  outFile: "./src/infrastructure/db/kysely/schema.ts",
  camelCase: false, // Keep snake_case to match database
  excludePattern: "schema_migrations", // Exclude migration tracking table
};

export default config;
