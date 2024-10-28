# Arpa Backend API (arpa-be)

Arpa Backend API provides RESTful endpoints to support Arpa E-Commerce's Admin Panel. This backend is built with **NestJS** and includes authentication (with JWT), user management, and CRUD for products, categories, and orders.

## Prerequisites

Make sure you have the following installed:

- **Node.js** (>= 18.18)
- **npm**
- **PostgreSQL** (or any supported database)

## Getting Started

```bash
git clone https://github.com/faizalabdulhakim/arpa-be.git
```

install depedencies

```bash
npm install
```

setting .env

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/your_database"
JWT_SECRET="your-secret-key"
PORT=5000
```

Database Setup

```bash
npx prisma migrate dev
```

Run server

```bash
npm run start:dev
```

The server should run on http://localhost:5000 by default.

## API Endpoints

| Endpoint             | Method | Description              |
| -------------------- | ------ | ------------------------ |
| `/auth/login`        | POST   | Log in and receive a JWT |
| `/auth/register`     | POST   | Register a new user      |
| `/users`             | GET    | Fetch all users          |
| `/users/:id`         | GET    | Fetch user details       |
| `/users/:id/promote` | PATCH  | Promote a user to admin  |
| `/products`          | GET    | Fetch all products       |
| `/products`          | POST   | Create a new product     |
| `/products/:id`      | PATCH  | Update a product         |
| `/products/:id`      | DELETE | Delete a product         |
| `/categories`        | GET    | Fetch all categories     |
| `/categories`        | POST   | Create a new category    |
| `/categories/:id`    | PATCH  | Update a category        |
| `/categories/:id`    | DELETE | Delete a category        |
| `/orders`            | GET    | Fetch all orders         |
| `/orders`            | POST   | Create a new order       |
| `/orders/:id`        | PATCH  | Update an order          |

> **Note**: Authentication is required for most endpoints. Ensure to include the JWT token in the `Authorization` header as `Bearer <token>`.

## Features

- **Authentication**: Secure login with JWT tokens.
- **User Management**: Manage user roles and permissions.
- **Product Management**: CRUD operations for products.
- **Category Management**: Assign categories to products.
- **Order Management**: Create and manage customer orders.
