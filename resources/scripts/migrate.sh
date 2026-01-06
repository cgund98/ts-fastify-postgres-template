#!/bin/bash

# Migration script using golang-migrate
# Usage: ./migrate.sh [up|down|create|version|force] [args]

set -e

MIGRATIONS_DIR="${MIGRATIONS_DIR:-./resources/db/migrations}"
DATABASE_URL="${DATABASE_URL:-postgres://postgres:postgres@localhost:5432/app?sslmode=disable}"

case "${1:-up}" in
  up)
    migrate -path "$MIGRATIONS_DIR" -database "$DATABASE_URL" up
    ;;
  down)
    migrate -path "$MIGRATIONS_DIR" -database "$DATABASE_URL" down 1
    ;;
  create)
    if [ -z "$2" ]; then
      echo "Error: Migration name is required"
      echo "Usage: $0 create <migration_name>"
      exit 1
    fi
    migrate create -ext sql -dir "$MIGRATIONS_DIR" -seq "$2"
    ;;
  version)
    migrate -path "$MIGRATIONS_DIR" -database "$DATABASE_URL" version
    ;;
  force)
    if [ -z "$2" ]; then
      echo "Error: Version number is required"
      echo "Usage: $0 force <version>"
      exit 1
    fi
    migrate -path "$MIGRATIONS_DIR" -database "$DATABASE_URL" force "$2"
    ;;
  *)
    echo "Usage: $0 [up|down|create|version|force] [args]"
    exit 1
    ;;
esac

