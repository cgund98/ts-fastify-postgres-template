import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  /**
   * ==========================
   * Global ignores
   * ==========================
   */
  {
    ignores: [
      "dist/**",
      "build/**",
      "coverage/**",
      "**/*.d.ts",
      "eslint.config.ts",
      "kysely-codegen.config.ts",
      "vitest.config.ts",
      "resources/infra/cdk/**/*.js",
      "resources/infra/cdk/jest.config.js",
    ],
  },

  /**
   * ==========================
   * Base JS (strict)
   * ==========================
   */
  js.configs.recommended,

  /**
   * ==========================
   * TypeScript (STRICT + TYPE-AWARE)
   * ==========================
   */
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
  })),
  ...tseslint.configs.stylisticTypeChecked.map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
  })),

  /**
   * ==========================
   * Global TS settings
   * ==========================
   */
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: true, // REQUIRED for strictTypeChecked
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      /**
       * ---- Absolute no-gos ----
       */

      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "max-params": ["error", 3], // Encourage use of argument objects

      /**
       * ---- Async correctness ----
       */

      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/require-await": "error",

      /**
       * ---- API clarity ----
       */

      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: false,
          allowTypedFunctionExpressions: true,
        },
      ],

      "@typescript-eslint/explicit-module-boundary-types": "error",

      /**
       * ---- Nullability discipline ----
       */

      "@typescript-eslint/no-non-null-assertion": "error",

      /**
       * ---- Error handling ----
       */

      "@typescript-eslint/only-throw-error": "error",
      "@typescript-eslint/prefer-promise-reject-errors": "error",

      /**
       * ---- Imports ----
       */

      "no-duplicate-imports": "error",

      /**
       * ---- Code hygiene ----
       */

      "no-console": "error",
      "no-debugger": "error",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  /**
   * ==========================
   * Infrastructure / Adapters
   * ==========================
   */
  {
    files: [
      "src/infrastructure/**/*.ts",
      "src/presentation/**/*.ts",
      "src/entry/**/*.ts",
      "resources/infra/cdk/**/*.ts",
    ],
    rules: {
      // Boundaries with the outside world
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",

      // Fastify + framework realities
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/require-await": "off",

      // Logging is valid here
      "no-console": "off",
    },
  },

  /**
   * ==========================
   * Domain layer (MAX STRICT)
   * ==========================
   */
  {
    files: ["src/domain/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-non-null-assertion": "error",

      // Domain logic must be explicit
      "@typescript-eslint/explicit-function-return-type": "error",
    },
  },

  /**
   * ==========================
   * Tests (pragmatic)
   * ==========================
   */
  {
    files: ["**/*.test.ts", "**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-empty-function": "off",
      "no-console": "off",
    },
  }
);
