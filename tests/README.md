# Test Organization

This directory contains all tests for the application, organized by test type and layer.

## Structure

```
tests/
├── unit/                    # Fast, isolated unit tests with mocked dependencies
│   ├── domain/             # Domain layer tests (business logic)
│   │   ├── user/
│   │   │   ├── service.spec.ts         # UserService unit tests
│   │   │   └── events.spec.ts          # Event logic tests
│   │   └── billing/
│   │       └── invoice.spec.ts
│   ├── infrastructure/     # Infrastructure layer tests
│   │   └── db.spec.ts                  # Transaction manager, repositories
│   └── presentation/       # Presentation layer tests
│       └── mapper.spec.ts
├── integration/            # Slower tests that interact with real dependencies
│   ├── domain/             # Domain layer integration tests
│   │   └── user/
│   │       └── service.integration.spec.ts # Tests hitting DB
│   ├── presentation/       # Presentation layer integration tests
│   │   └── routes.integration.spec.ts     # Test Fastify routes
│   └── infrastructure/     # Infrastructure layer integration tests
│       └── sqs.integration.spec.ts       # Test message queues
```

## Test Types

### Unit Tests (`tests/unit/`)

- **Purpose**: Test individual units of code in isolation
- **Dependencies**: All dependencies are mocked
- **Speed**: Fast (milliseconds per test)
- **Examples**: Service methods, utility functions, domain logic
- **Naming**: `*.spec.ts`

### Integration Tests (`tests/integration/`)

- **Purpose**: Test how multiple components work together
- **Dependencies**: Real dependencies (database, message queues, etc.)
- **Speed**: Slower (seconds per test)
- **Examples**: Database operations, API endpoints, message queue processing
- **Naming**: `*.integration.spec.ts`

## Running Tests

```bash
# Run all tests
pnpm test

# Run only unit tests
pnpm exec vitest run tests/unit

# Run only integration tests
pnpm exec vitest run tests/integration

# Run tests for a specific domain
pnpm exec vitest run tests/unit/domain/user

# Run tests in watch mode
pnpm exec vitest watch

# Generate coverage report
pnpm test:coverage
```

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserService } from "@/domain/user/service.js";

describe("UserService", () => {
  // Mock dependencies
  let mockRepository: UserRepository;
  let mockEventPublisher: EventPublisher;

  beforeEach(() => {
    // Setup mocks
  });

  it("should create a user successfully", async () => {
    // Test implementation
  });
});
```

### Integration Test Example

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { UserService } from "@/domain/user/service.js";
import { getDatabaseContext } from "@/presentation/deps.js";

describe("UserService Integration", () => {
  let service: UserService;

  beforeAll(async () => {
    // Setup real database connection
  });

  afterAll(async () => {
    // Cleanup
  });

  it("should create and retrieve a user from database", async () => {
    // Test with real database
  });
});
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Naming**: Use descriptive test names that explain what is being tested
3. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
4. **Mocking**: Mock external dependencies in unit tests, use real dependencies in integration tests
5. **Coverage**: Aim for high code coverage, but focus on testing important business logic
6. **Speed**: Keep unit tests fast; integration tests can be slower but should still be reasonable
