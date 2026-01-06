.PHONY: help install dev-install lint format test test-unit test-integration test-watch clean run-api run-worker build docker-build migrate db-generate

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install production dependencies
	pnpm install --prod

dev-install: ## Install development dependencies
	pnpm install

lint: ## Run linters
	pnpm run lint
	pnpm run type-check

format: ## Format code
	pnpm run format:fix

type-check: ## Run TypeScript type checking
	pnpm run type-check

test: test-unit test-integration ## Run all tests (unit + integration)

test-unit: ## Run unit tests only (fast, mocked dependencies)
	pnpm exec vitest run tests/unit

test-integration: ## Run integration tests only (slower, real dependencies)
	pnpm exec vitest run tests/integration

test-watch: ## Run tests in watch mode
	pnpm exec vitest watch

clean: ## Clean build artifacts
	rm -rf dist node_modules/.cache

run-api: ## Run API server locally
	pnpm run dev

run-worker: ## Run worker locally
	pnpm run dev:worker

build: ## Build TypeScript
	pnpm run build

docker-build: ## Build Docker image
	docker build -f resources/docker/app.Dockerfile -t app:latest .

migrate: ## Run database migrations (up)
	bash resources/scripts/migrate.sh up

migrate-down: ## Rollback last migration
	bash resources/scripts/migrate.sh down

migrate-create: ## Create a new migration (usage: make migrate-create NAME=my_migration)
	@if [ -z "$(NAME)" ]; then \
		echo "Error: NAME is required. Usage: make migrate-create NAME=my_migration"; \
		exit 1; \
	fi
	bash resources/scripts/migrate.sh create $(NAME)

migrate-version: ## Show current migration version
	bash resources/scripts/migrate.sh version

db-generate: ## Generate TypeScript types from database schema (uses local postgres)
	DATABASE_URL=postgres://postgres:postgres@localhost:5432/app \
		pnpm exec kysely-codegen \
		--config-file kysely-codegen.config.ts

localstack-up: ## Start LocalStack services
	docker-compose up -d localstack

localstack-down: ## Stop LocalStack services
	docker-compose stop localstack

localstack-setup: ## Setup LocalStack resources (SNS topics and SQS queues)
	bash resources/scripts/setup_localstack.sh

localstack-logs: ## View LocalStack logs
	docker-compose logs -f localstack

