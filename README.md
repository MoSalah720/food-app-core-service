# Food App Core Service

A backend microservices core service for a food ordering platform built with **Node.js** and **TypeScript**. The project follows clean architecture principles and provides authentication, authorization, RBAC, restaurant management, customer management, Redis caching, cursor pagination, email integration, and idempotency support.

---

## ✨ Features

- Authentication & Authorization
- Role-Based Access Control (RBAC)
- Customer Address Management
- Restaurant Management
- Branch Management
- Product Management
- Member Invitation
- Password Reset with Email OTP
- Dynamic Filtering
- Cursor Pagination
- Redis Caching
- Idempotency Middleware
- Dependency Injection
- Repository Pattern

---

## 🛠 Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Redis
- Knex.js
- JWT
- Mailjet
- Git

---

## 📂 Project Structure

```text
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
├── pkg
├── routes
├── config
└── server.ts
```

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/MoSalah720/Food-App-Core-Service.git
```

```bash
cd Food-App-Core-Service
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env` file and configure:

```env
DATABASE_URL=

REDIS_HOST=
REDIS_PORT=

JWT_SECRET=

MAILJET_API_KEY=
MAILJET_SECRET_KEY=
MAILJET_FROM_EMAIL=
MAILJET_FROM_NAME=
```

### Run the project

```bash
npm run dev
```

---

## 📌 Main Modules

- Authentication
- Users
- Members
- Restaurants
- Branches
- Products
- Customer Addresses

---

## 🏗 Architecture

This project follows a layered architecture:

- Controllers
- Services
- Repositories
- Dependency Injection
- PostgreSQL
- Redis

The codebase is organized to keep business logic separated from infrastructure and data access layers.

---

## 🔐 Backend Features

- JWT Authentication
- Role-Based Authorization (RBAC)
- Password Reset via Email OTP
- Redis Cache
- Cursor Pagination
- Dynamic Filtering
- Idempotency Middleware

---

## 🔮 Future Improvements

- Docker Support
- Unit Testing
- CI/CD Pipeline
- API Documentation (Swagger)
- Event-Driven Communication

---

## 👨‍💻 Author

**Mohamed Salah**

- GitHub: https://github.com/MoSalah720
- LinkedIn: https://www.linkedin.com/in/mohamed-salah-889291168
