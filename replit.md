# Xbet Fast Cash — Sri Lanka Cashier Management Web App

A full-stack cashier management system for an Xbet Sri Lanka agent. Customers can register, deposit funds (with receipt upload), request withdrawals, and track transaction history. Admins manage deposits, withdrawals, customers, payment accounts, promo codes, and audit logs.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, React Hook Form, Zod, Lucide React |
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| Database | PostgreSQL (Replit managed) |
| Queue | In-memory async queue (BullMQ-compatible interface) |
| Storage | Local filesystem (`/uploads`) — swappable to S3/R2 |
| Auth | JWT (Bearer tokens), RBAC (CUSTOMER / ADMIN / SUPER_ADMIN) |

## Project Structure

```
cashier-system/
├── frontend/          React + Vite app (port 5000)
│   └── src/
│       ├── api/       Axios API clients
│       ├── components/ Reusable UI components
│       ├── hooks/     useAuth, usePublicData
│       ├── layouts/   PublicLayout, CustomerLayout, AdminLayout
│       ├── pages/     Home, Login, Register, customer/*, admin/*
│       ├── router/    React Router v7 config
│       └── types/     Shared TypeScript types
├── backend/           Express API server (port 3001)
│   ├── prisma/        Schema + seed data
│   └── src/
│       ├── middleware/ Auth, error, rate limiting
│       ├── modules/   auth, users, deposits, withdrawals,
│       │              payments, notifications, audit, admin, public
│       ├── queue/     Async job queue
│       └── utils/     JWT, hash, reference, response helpers
├── index.html         Original static design reference
└── .env.example       Environment variable template
```

## How to Run

Two workflows are configured and run in parallel:

- **Backend** — `cd backend && npm run dev` → `http://localhost:3001`
- **Frontend** — `cd frontend && npm run dev` → `http://localhost:5000`

The Vite dev server proxies `/api` and `/uploads` requests to the backend automatically.

## Default Credentials (DEVELOPMENT ONLY)

| Role | Username | Password |
|------|----------|----------|
| Super Admin | `superadmin` | `Admin@123` |
| Admin | `admin` | `Admin@123` |
| Customer | `demoplayer` | `Demo@123` |

⚠️ **Change all passwords before going to production.**

## Environment Variables

See `.env.example` for the full list. Key variables:

```env
DATABASE_URL=          # Replit PostgreSQL (auto-provided)
JWT_SECRET=            # Min 32 characters, random hex
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5000
STORAGE_TYPE=local     # Switch to "s3" for cloud storage
```

## Database Setup

Prisma schema is already applied. To re-run:

```bash
cd backend
npx prisma db push        # Apply schema to database
npx tsx prisma/seed.ts    # Seed demo data
```

## API Routes

| Prefix | Description |
|--------|-------------|
| `GET /api/health` | Health check |
| `POST /api/auth/register` | Customer registration |
| `POST /api/auth/login` | Login (rate limited) |
| `GET /api/auth/me` | Current user |
| `GET /api/users/dashboard` | Customer dashboard stats |
| `POST /api/deposits` | Submit deposit (Idempotency-Key required) |
| `GET /api/deposits/my` | Customer's deposits |
| `POST /api/deposits/upload-url` | Get presigned upload URL |
| `PUT /api/deposits/upload/:key` | Upload receipt file |
| `POST /api/withdrawals` | Submit withdrawal (Idempotency-Key required) |
| `GET /api/withdrawals/my` | Customer's withdrawals |
| `GET /api/payment-accounts` | Active payment accounts (public) |
| `GET /api/notifications` | Customer notifications |
| `GET /api/public/landing` | Landing page data (promos, tickers, contacts) |
| `GET /api/admin/dashboard` | Admin dashboard stats |
| `GET/POST /api/admin/deposits` | Admin deposit management |
| `POST /api/admin/deposits/:id/approve` | Approve deposit |
| `POST /api/admin/deposits/:id/reject` | Reject deposit |
| `GET /api/admin/withdrawals` | Admin withdrawal management |
| `POST /api/admin/withdrawals/:id/approve` | Approve withdrawal |
| `POST /api/admin/withdrawals/:id/reject` | Reject withdrawal |
| `GET /api/admin/customers` | Customer list |
| `GET/POST /api/admin/promos` | Promo code management |
| `GET /api/admin/audit-logs` | Audit log viewer |
| `GET/PUT /api/admin/settings` | System settings |

## Security Features

- JWT authentication with 7-day expiry
- RBAC: CUSTOMER / ADMIN / SUPER_ADMIN roles
- Rate limiting on auth and upload endpoints
- Helmet security headers
- CORS restricted to FRONTEND_URL
- Idempotency keys on all financial mutations (24h TTL)
- Prisma transactions with balance locking for all financial state changes
- Account numbers encrypted at rest, masked in responses
- Receipt uploads validated by MIME type and extension; path traversal prevented
- Audit logs are append-only (no UPDATE/DELETE in application code)
- Sensitive data never logged or returned to frontend

## User Preferences

- Preserve Xbet Fast Cash visual identity (dark navy/blue theme, Rajdhani/Teko/Noto Sans Sinhala fonts, gold CTAs)
- Keep mobile-first design (max-width 520px for public landing)
- All database-driven data — no hardcoded bank details, promos, or contact info in frontend
- No fake transaction data in production — show "No recent transactions" when empty
