# 🚀 Fastify PostgreSQL Template

<div align="center">

**A production-ready Fastify backend template demonstrating efficient organization and modern design patterns**

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.6+-green.svg)](https://www.fastify.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)

_Built with ❤️ using Domain-Driven Design and Event-Driven Architecture_

[Quick Start](#-getting-started) • [Documentation](#-documentation) • [Features](#-features)

</div>

## 👥 Who Is This For?

This template is designed for **backend engineers** building:

- RESTful APIs with clean separation between HTTP handlers, business logic, and data access
- Event-driven microservices with async message processing (SQS/SNS)
- Type-safe codebases with comprehensive TypeScript types and fast unit tests
- Production-ready systems with proper transaction management and error handling

## ✨ Features

- **3-Tier Architecture**: Clear separation between presentation, domain, and infrastructure layers
- **Domain-Driven Design**: Business logic encapsulated in domain services with rich domain models
- **Event-Driven Architecture**: Decoupled communication via domain events and message queues
- **Type Safety**: End-to-end type safety from database schema to API responses
- **Type-Safe Database**: Kysely query builder with auto-generated TypeScript types
- **Comprehensive Testing**: Organized test structure with separate unit and integration tests
- **Docker Support**: Containerized API and worker services for consistent deployments
- **AWS CDK**: Infrastructure as code for provisioning AWS resources
- **Structured Logging**: JSON-formatted logs with pino for easy parsing and analysis

## 📚 Documentation

- **[Architecture](docs/ARCHITECTURE.md)** - Architecture overview, design patterns, and event system
- **[Development Guide](docs/DEVELOPMENT.md)** - Local setup, Docker, and development workflows
- **[Database](docs/DATABASE.md)** - Schema, migrations, and type generation
- **[Migration Guide](docs/MIGRATION.md)** - Guide for migrating from Python/FastAPI template
- **[CDK Infrastructure](resources/infra/cdk/README.md)** - AWS infrastructure deployment

## 📁 Project Structure

```
fastify-postgres-template/
├── entry/
│   ├── api/
│   │   └── main.ts                 # Fastify server entrypoint
│   └── worker/
│       └── main.ts                 # Async event consumer entrypoint
│
├── src/
│   ├── config/
│   │   └── settings.ts             # Environment/config variables
│   │
│   ├── domain/
│   │   ├── user/                   # User domain
│   │   │   ├── model.ts
│   │   │   ├── repo/               # Repository implementations
│   │   │   │   ├── base.ts         # Repository interface
│   │   │   │   └── kysely.ts      # Kysely implementation
│   │   │   ├── service.ts
│   │   │   ├── events/
│   │   │   │   ├── constants.ts
│   │   │   │   ├── schema.ts      # Zod schemas for events
│   │   │   │   └── handlers/      # Event handlers
│   │   │   ├── validators.ts
│   │   │   └── diff.ts
│   │   │
│   │   ├── exceptions.ts
│   │   └── types.ts
│   │
│   ├── infrastructure/
│   │   ├── db/                     # Database access
│   │   │   ├── kysely/            # Kysely-specific implementations
│   │   │   │   ├── schema.ts      # Auto-generated schema types
│   │   │   │   ├── context.ts
│   │   │   │   └── pool.ts
│   │   │   ├── context.ts         # Generic DatabaseContext interface
│   │   │   └── transaction-manager.ts
│   │   ├── messaging/              # Event publishing/consumption
│   │   │   ├── base.ts            # BaseEvent and Zod serialization
│   │   │   ├── publisher/         # SNS publisher
│   │   │   └── consumer/          # SQS consumer
│   │   └── aws/                    # AWS SDK client configuration
│   │
│   ├── presentation/
│   │   ├── user/                   # User API
│   │   │   ├── routes.ts          # Fastify routes
│   │   │   └── schema.ts          # TypeBox schemas
│   │   ├── deps.ts                 # Dependency injection
│   │   ├── exceptions.ts           # Error handlers
│   │   ├── mapper.ts              # Request/response mappers
│   │   └── pagination.ts           # Pagination helpers
│   │
│   └── observability/
│       └── logging.ts              # Structured logging with pino
│
├── tests/
│   ├── unit/                       # Fast unit tests with mocks
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   └── presentation/
│   └── integration/                # Slower tests with real dependencies
│       ├── domain/
│       ├── infrastructure/
│       └── presentation/
│
├── resources/
│   ├── db/migrations/              # Database migrations
│   ├── docker/                     # Dockerfiles
│   ├── infra/cdk/                  # AWS CDK infrastructure code
│   │   ├── bin/                    # CDK app entry point
│   │   ├── lib/                    # Stack definitions
│   │   └── test/                   # CDK unit tests
│   └── scripts/                    # Utility scripts
│
├── eslint.config.mjs               # ESLint flat config
├── Makefile
├── package.json
├── tsconfig.json
├── kysely-codegen.config.ts        # Kysely codegen configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm (install via `npm install -g pnpm` or `corepack enable`)
- PostgreSQL 15+
- Docker (for local development)

### Quick Start

1. **Clone and install:**

   ```bash
   git clone <repository-url>
   cd fastify-postgres-template
   pnpm install
   ```

2. **Set up environment:**

   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start services:**

   ```bash
   docker-compose up -d postgres
   make migrate
   ```

4. **Run the API:**

   ```bash
   pnpm run dev
   ```

   API available at `http://localhost:8000/api`, docs at `http://localhost:8000/docs`

For detailed setup instructions, see the [Development Guide](docs/DEVELOPMENT.md).

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. ✅ Follow the existing code structure and patterns
2. ✅ Maintain type safety throughout (TypeScript must pass)
3. ✅ Write tests for new features:
   - Unit tests in `tests/unit/` with mocked dependencies
   - Integration tests in `tests/integration/` for real dependencies
4. ✅ Run linting and type checking before committing (`make lint`)
5. ✅ Follow the Makefile commands for common tasks
6. ✅ Update documentation for any architectural changes
7. ✅ Use TypeBox for presentation layer schemas, Zod for event schemas

See the [documentation](docs/) for detailed guides on architecture, development, and database management.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ for the Node.js backend community**

⭐ Star this repo if you find it useful!

</div>
