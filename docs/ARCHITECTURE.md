# Architecture

This document describes the architecture and design patterns used in this template.

## 3-Tier Architecture

This template follows a **3-tier architecture** with clear separation of concerns:

### Presentation Layer (`src/presentation/`)

- **API Routes**: Fastify route handlers with TypeBox schema validation
- **Schemas**: TypeBox schemas for request/response validation with automatic type inference
- **Exception Handling**: Domain exception to HTTP status code mapping

### Domain Layer (`src/domain/`)

- **Models**: Domain entities with business logic
- **Services**: Domain-specific business logic with integrated transaction management
- **Repositories**: Data access interfaces using Kysely query builder with type-safe queries
- **Events**: Domain events with Zod schemas for serialization/deserialization
- **Event Handlers**: Dedicated event handlers for processing domain events

### Infrastructure Layer (`src/infrastructure/`)

- **Database**: Kysely-based database access with generic context interface for transaction support
- **Messaging**: Event publishing (SNS) and consumption (SQS) with Zod-based serialization
- **AWS**: AWS SDK client configuration for SNS/SQS

### Observability (`src/observability/`)

- **Logging**: Structured logging with pino

## Design Patterns

This template demonstrates the following patterns:

- **3-Tier Architecture**: Clear separation of concerns
- **Repository Pattern**: Data access abstraction
- **Unit of Work**: Transaction management
- **Domain Events**: Event-driven communication
- **Dependency Injection**: Loose coupling
- **Factory Pattern**: Service creation

## Event System

The template includes a **generic event system** for decoupled communication:

| Component             | Purpose                                              |
| --------------------- | ---------------------------------------------------- |
| **BaseEvent**         | Base interface for all domain events with metadata   |
| **Event Schemas**     | Zod schemas for runtime validation and serialization |
| **Event Publishing**  | Events published to SNS topics                       |
| **Event Consumption** | Workers consume events from SQS queues               |
| **Event Handlers**    | Domain-specific handlers process events              |

### Event Flow

1. **Event Creation**: Domain services create events using factory functions (e.g., `createUserCreatedEvent()`)
2. **Event Publishing**: Events are serialized using Zod and published to SNS topics
3. **Event Routing**: SNS filters events by `event_type` and routes them to appropriate SQS queues
4. **Event Consumption**: Workers poll SQS queues and deserialize events using Zod schemas
5. **Event Handling**: Dedicated event handlers process events with type-safe event objects

**Example: Publishing a domain event**

```typescript
// In UserService.createUser()
const event = createUserCreatedEvent(user.id, user.email, user.name);
await eventPublisher.publish(event);
```

**Example: Event handler**

```typescript
// In src/domain/user/events/handlers/user-created.ts
export class UserCreatedEventHandler implements EventHandler<UserCreatedEvent> {
  handle(event: UserCreatedEvent): Promise<void> {
    // Process event with type-safe event object
    logger.info({ email: event.email, name: event.name });
    return Promise.resolve();
  }
}
```

### LocalStack Architecture

The LocalStack setup creates:

- **1 SNS topic** (`events-topic`) for publishing events
- **5 SQS queues** (one for each event type):
  - `user-created`
  - `user-updated`
  - `invoice-created`
  - `invoice-payment-requested`
  - `invoice-paid`
- **Subscriptions** linking queues to the topic with filter policies based on `event_type`

Events published to the SNS topic are automatically filtered and routed to the appropriate SQS queue based on the `event_type` field in the event metadata.

## Example Business Case

This template implements a **User Management System** to demonstrate real-world patterns:

### 👤 User Domain

- **User Registration**: Create users with email uniqueness validation
- **User Updates**: Update user information (e.g., name changes)
- **User Deletion**: Delete users
- **Event Publishing**: Emits `UserCreatedEvent` and `UserUpdatedEvent` for downstream processing

### 🔑 Key Patterns Demonstrated

- **Transaction Management**: All operations use application-level transactions
- **Business Rule Enforcement**: Prevents invalid states (e.g., duplicate emails)
- **Domain Events**: Decoupled communication between services via events

