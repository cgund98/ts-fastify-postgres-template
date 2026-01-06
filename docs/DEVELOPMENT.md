# Development Guide

This guide covers local development setup, Docker usage, and development workflows.

## Local Development Setup

### Prerequisites

- Node.js 20+
- pnpm (install via `npm install -g pnpm` or `corepack enable`)
- PostgreSQL 15+
- Docker (for PostgreSQL and LocalStack)

### Initial Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   # Copy the example file for local development (non-secret values)
   cp .env.local.example .env.local

   # Edit .env.local with your local configuration
   ```

3. **Start PostgreSQL:**

   ```bash
   docker-compose up -d postgres
   ```

4. **Run migrations:**

   ```bash
   make migrate
   ```

5. **Set up LocalStack** (see [LocalStack Setup](#localstack-setup) below)

## Running the Application

### API Server

```bash
make run-api
# or
pnpm run dev
```

The API server will be available at `http://localhost:8000/api`. Swagger UI documentation will be at `http://localhost:8000/docs`.

### Worker

```bash
make run-worker
# or
pnpm run dev:worker
```

The worker will start consuming messages from SQS queues.

## Development Commands

### Linting

```bash
make lint
# or
pnpm run lint
```

Note: The project uses ESLint 9+ with flat config format (`eslint.config.ts`).

### Formatting

```bash
make format
# or
pnpm run format:fix
```

### Type Checking

```bash
make type-check
# or
pnpm run type-check
```

### Testing

```bash
# Run all tests (unit + integration)
make test

# Run only unit tests (fast, mocked dependencies - use in CI)
make test-unit

# Run only integration tests (slower, real dependencies)
make test-integration

# Run tests in watch mode
make test-watch
```

The test suite is organized into:

- **Unit Tests** (`tests/unit/`): Fast, isolated tests with mocked dependencies. All service tests mock repositories and transaction managers, ensuring tests run quickly without requiring a database connection.
- **Integration Tests** (`tests/integration/`): Slower tests that interact with real dependencies (database, message queues, etc.)

See `tests/README.md` for detailed testing guidelines.

## LocalStack Setup

For local development, you can use [LocalStack](https://localstack.cloud/) to emulate AWS SNS and SQS services without connecting to real AWS infrastructure.

### Prerequisites

1. Docker and Docker Compose installed
2. AWS CLI installed (`aws --version`)
3. LocalStack running

### Setup Steps

1. **Start LocalStack:**

   ```bash
   make localstack-up
   # or
   docker-compose up -d localstack
   ```

2. **Wait for LocalStack to be healthy:**

   ```bash
   docker-compose ps
   # Wait until localstack shows as "healthy"
   ```

3. **Run the setup script to create SNS topics and SQS queues:**

   ```bash
   make localstack-setup
   # or
   bash resources/scripts/setup_localstack.sh
   ```

   The script will:
   - Create an SNS topic (`events-topic`) for publishing events
   - Create SQS queues for each event type (user-created, user-updated, etc.)
   - Subscribe queues to the topic with filter policies based on `event_type`
   - Output environment variables you need to add to your `.env.local` file

4. **Add environment variables to `.env.local`:**

   Copy the environment variables from the script output. They will look like:

   ```bash
   AWS_ENDPOINT_URL=http://localhost:4566
   AWS_REGION=us-east-1
   USE_LOCALSTACK=true
   DEFAULT_EVENT_TOPIC_ARN=arn:aws:sns:us-east-1:000000000000:events-topic
   EVENT_QUEUE_URL_USER_CREATED=http://localhost:4566/000000000000/user-created
   EVENT_QUEUE_URL_USER_UPDATED=http://localhost:4566/000000000000/user-updated
   # ... etc
   ```

### LocalStack Commands

```bash
# Start LocalStack
make localstack-up

# Stop LocalStack
make localstack-down

# Setup LocalStack resources (SNS topics and SQS queues)
make localstack-setup

# View LocalStack logs
make localstack-logs
```

## Docker

The API and worker **share the same Docker image**, with different entrypoints:

```bash
# Build the shared image
docker build -f resources/docker/app.Dockerfile -t app:latest .

# Run API server (default)
docker run -p 8000:8000 app:latest

# Run worker (override CMD)
docker run app:latest node dist/entry/worker/main.js
```

## Code Generation

### Database Types

After running migrations or making schema changes, generate TypeScript types from your database schema:

```bash
pnpm run db:generate
```

This will update `src/infrastructure/db/kysely/schema.ts` with type-safe definitions matching your database schema.
