Food App Core Service
A high-performance backend microservice for a food ordering platform built with Node.js and TypeScript. The project follows clean architecture principles and implements Event-Driven Communication, Pessimistic Locking for stock concurrency, and the Transactional Outbox Pattern to ensure reliable event publishing to RabbitMQ.

✨ Features
Event-Driven Architecture: Transactional Outbox Pattern for reliable message publishing via RabbitMQ.

Concurrency Protection: Stock reservation using PostgreSQL Pessimistic Locking (FOR UPDATE).

Distributed Background Workers: Horizontally scalable outbox workers using FOR UPDATE SKIP LOCKED.

Authentication & Authorization: JWT-based Auth with Role-Based Access Control (RBAC).

Customer Address Management: Multi-address management for customers.

Restaurant & Branch Management: Full CRUD and hierarchical management.

Product & Inventory Control: Product management with real-time stock updates.

Member Invitation System: Role-based team member invites.

Password Reset: Secure reset flow with Email OTP.

Advanced Querying: Dynamic Filtering and Cursor-based Pagination.

Performance & Safety: Redis Caching and Idempotency Middleware.

Clean Architecture: Dependency Injection and Repository Pattern.

🛠 Tech Stack
Runtime & Language: Node.js, TypeScript

Framework: Express.js

Database & ORM: PostgreSQL, Knex.js

Message Broker: RabbitMQ (amqplib & amqp-connection-manager)

Caching & In-Memory: Redis (ioredis)

Scheduling: Croner

Security & Mail: JWT, Mailjet

📂 Project Structure
Plaintext
src
├── app
│   ├── auth
│   ├── branch
│   ├── customer
│   ├── member
│   ├── product
│   ├── restaurant
│   └── user
├── lib
│   ├── config
│   ├── events         # Outbox pattern & RabbitMQ handlers
│   ├── knex
│   ├── logger
│   └── redis
├── pkg
├── routes
├── worker.ts          # Independent Outbox Drain Worker process
└── server.ts
🚀 Getting Started
Clone the repository
Bash
git clone https://github.com/MoSalah720/food-app-core-service.git
cd food-app-core-service
Install dependencies
Bash
npm install
Configure environment variables
Create a .env file and configure:

Code snippet
# Database & Cache
DATABASE_URL=
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# JWT
JWT_SECRET=

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_EXCHANGE=core_events
DRAIN_CRON=*/5 * * * * *
DRAIN_BATCH_SIZE=50

# Mailjet
MAILJET_API_KEY=
MAILJET_SECRET_KEY=
MAILJET_FROM_EMAIL=
MAILJET_FROM_NAME=
Run the project
Bash
# Run HTTP API Server
npm run dev

# Run Outbox Worker Process (In a separate terminal)
npm run worker:dev
🏗 Architecture & Patterns
This project bridges Layered Architecture with Event-Driven Microservices:

Layered Structure: Controllers → Services → Repositories → Data Access / Infrastructure.

Transactional Outbox Pattern: Guarantees at-least-once message delivery. Domain mutations and event writes happen atomically within the same database transaction.

Race Condition Prevention: Employs FOR UPDATE queries during stock updates to prevent inventory overdrafts under heavy concurrency.

Safe Parallel Processing: Worker processes utilize FOR UPDATE SKIP LOCKED so multiple instances can poll and process outbox batches without duplicate publishing.

🔐 Core Infrastructure Features
Publisher Confirms: RabbitMQ publishes await broker acknowledgment before marking events as dispatched.

Graceful Shutdown: Intercepts SIGINT/SIGTERM to gracefully drain outbox tasks, stop cron jobs, and safely close database and broker connections.

Redis Cache: Low-latency query caching and session management.

Cursor Pagination & Dynamic Filters: Efficient data retrieval for high-volume endpoints.

Idempotency Middleware: Prevents duplicate mutations from retried network calls.

🔮 Future Improvements
Docker & Docker Compose setup

Dead Letter Queues (DLQ) for failed outbox events

Unit & Integration Testing (Jest)

CI/CD Pipeline

API Documentation (Swagger / OpenAPI)

👨‍💻 Author
Mohamed Salah

GitHub: MoSalah720

LinkedIn: Mohamed Salah