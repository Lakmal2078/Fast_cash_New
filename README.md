💰 Fast Cash — Sri Lanka Cashier Management System

<p align="center">
  <strong>🇱🇰 Mobile-first Cashier Management Platform for Web & Android</strong>
</p><p align="center">
  A full-stack digital cashier system designed around customer accounts, deposits, withdrawals, transaction management, administration, and secure API workflows.
</p><p align="center">
  <a href="https://github.com/Lakmal2078/Fast_cash_New">
    <img src="https://img.shields.io/badge/GitHub-Fast__cash__New-181717?style=for-the-badge&logo=github" alt="GitHub">
  </a>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Android-Java-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android">
</p>---

🇱🇰 සිංහලෙන් | Project එක ගැන

Fast Cash යනු customer සහ admin workflows එකට සම්බන්ධ කරන full-stack cashier management system එකකි.

මෙහි Web Frontend, Backend API, PostgreSQL database layer සහ Android application wrapper එකක් ඇතුළත් වේ.

ප්‍රධාන අරමුණ වන්නේ:

- 💰 Deposit requests
- 💸 Withdrawal requests
- 🧾 Receipt handling
- 👤 Customer management
- 💳 Payment account management
- 🔔 Notifications
- 🛠️ Admin management
- 📊 Transaction tracking

වැනි workflows සඳහා fast, secure, reliable සහ mobile-friendly digital experience එකක් ලබාදීමයි.

«⚠️ Important: මෙම project එක financial / transaction-related workflows සමඟ සම්බන්ධ වන බැවින් production deployment එකකට පෙර security, authorization, financial logic, storage, secrets, payment integrations සහ applicable legal/regulatory requirements වෙනම audit කළ යුතුය.»

---

🇬🇧 About the Project

Fast Cash is a full-stack cashier management platform combining a modern web frontend, REST API backend, database layer, and Android WebView client.

The architecture is designed around:

- Customer authentication
- Deposits
- Withdrawals
- Receipt uploads
- Transaction history
- Customer notifications
- Payment account management
- Administrative controls
- Audit logging
- Role-based access control

The project is built with a mobile-first approach and is intended to provide a clean foundation for further development into a production-grade digital cashier platform.

---

✨ Core Features

👤 Customer Features

- 🔐 Registration & Login
- 📊 Customer Dashboard
- 💰 Deposit Request
- 💸 Withdrawal Request
- 🧾 Receipt Upload
- 📜 Transaction History
- 🔔 Notifications
- 💳 Payment Account Information
- 🎟️ Promo Code Support
- 📱 Mobile-first UI

---

🛠️ Admin Features

- 📊 Admin Dashboard
- 💰 Deposit Management
- 💸 Withdrawal Management
- 👥 Customer Management
- 💳 Payment Account Management
- 🎟️ Promo Code Management
- 🧾 Audit Log Viewer
- ⚙️ System Settings
- 🔐 Role-based Access Control

---

🔐 Security Architecture

The backend includes several security-oriented mechanisms.

Authentication

- JWT-based authentication
- Password hashing with "bcryptjs"
- Role-based access control

Roles

CUSTOMER
ADMIN
SUPER_ADMIN

API Security

- Helmet security headers
- CORS configuration
- Authentication rate limiting
- Upload rate limiting
- Input validation with Zod
- Protected administrative routes

Transaction Safety

Financial state changes should be handled atomically.

The architecture includes:

- Database transactions
- Idempotency keys
- Balance locking
- Audit logging
- Protected authorization checks

File Upload Security

Receipt uploads are designed around validation and controlled storage.

Security considerations include:

- MIME validation
- File-extension validation
- Upload size limits
- Path-traversal protection
- Controlled storage access

«Production note: Security mechanisms must be tested under real-world attack and concurrency scenarios. Their presence in source code does not automatically guarantee a secure production deployment.»

---

🏗️ System Architecture

                    ┌──────────────────────┐
                    │      Customers       │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
       ┌──────────────────┐        ┌──────────────────┐
       │   React Web App  │        │ Android WebView  │
       │ React + Vite     │        │ Java + WebView   │
       └─────────┬────────┘        └─────────┬────────┘
                 │                           │
                 └─────────────┬─────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     REST API         │
                    │ Node.js + Express    │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
       │    Prisma   │  │ Auth / RBAC │  │ Async Queue │
       └──────┬──────┘  └─────────────┘  └─────────────┘
              │
              ▼
       ┌─────────────────┐
       │   PostgreSQL    │
       │     Database    │
       └─────────────────┘

---

🧰 Technology Stack

Layer| Technologies
📱 Android| Java, Android SDK, WebView
🎨 Frontend| React 18, TypeScript, Vite
🎨 Styling| Tailwind CSS
📡 API Client| Axios
🔄 Data Fetching| TanStack Query
📝 Forms| React Hook Form, Zod
🧭 Routing| React Router
📊 Charts| Recharts
🎨 Icons| Lucide React
⚙️ Backend| Node.js, Express, TypeScript
🗄️ ORM| Prisma
🐘 Database| PostgreSQL
🔐 Auth| JWT, bcryptjs
🛡️ Security| Helmet, CORS, express-rate-limit
📁 Uploads| Multer / Storage abstraction
🔧 Development| Git, GitHub, npm

---

📂 Project Structure

Fast_cash_New/
│
├── android/
│   └── app/
│       └── src/
│           └── main/
│               ├── java/
│               │   └── com/example/fastcash/
│               │       └── MainActivity.java
│               │
│               └── assets/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── router/
│   │   └── types/
│   │
│   ├── package.json
│   └── vite.config.*
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── src/
│   │   ├── middleware/
│   │   ├── modules/
│   │   ├── queue/
│   │   └── utils/
│   │
│   └── package.json
│
├── index.html
├── replit.md
├── .env.example
└── README.md

---

🚀 Getting Started

1️⃣ Requirements

Install:

- Node.js 18+
- npm
- PostgreSQL
- Git
- Android Studio + Android SDK — only if building Android
- Java 17 — required for the Android module

---

2️⃣ Clone Repository

git clone https://github.com/Lakmal2078/Fast_cash_New.git
cd Fast_cash_New

---

⚙️ Backend Setup

Move into the backend:

cd backend

Install dependencies:

npm install

Create your local environment configuration.

Example:

DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
JWT_SECRET=replace-with-a-long-random-secret
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5000
STORAGE_TYPE=local

«Never commit ".env" files, passwords, private keys, API keys, or production secrets.»

---

🗄️ Database Setup

Generate Prisma Client:

npx prisma generate

Apply the schema:

npx prisma db push

Seed development data if required:

npm run db:seed

---

▶️ Start Backend

Development:

npm run dev

Backend:

http://localhost:3001

Production build:

npm run build
npm start

---

🌐 Frontend Setup

Open a second terminal:

cd frontend

Install dependencies:

npm install

Start development server:

npm run dev

Frontend:

http://localhost:5000

Build:

npm run build

Preview production build:

npm run preview

---

📱 Android Setup

The Android module is a lightweight native wrapper around the project's web experience.

Current Android configuration

Configuration| Value
Namespace| "com.example.fastcash"
Application ID| "com.example.fastcash"
Compile SDK| 34
Target SDK| 34
Minimum SDK| 24
Java| 17
Version| 1.0

The current Android application uses:

Java
   ↓
Android Activity
   ↓
WebView
   ↓
Bundled Web Assets

Build with Android Studio

1. Open the "android/" directory in Android Studio.
2. Allow Gradle synchronization.
3. Install required Android SDK components.
4. Select an emulator or physical Android device.
5. Build and run the application.

«Before a public release, configure release signing, review WebView security settings, remove development identifiers, and test the application on supported Android versions.»

---

🔌 API Overview

The backend currently exposes routes covering authentication, customer operations, transactions, public data, and administration.

Endpoint| Description
"GET /api/health"| API health check
"POST /api/auth/register"| Customer registration
"POST /api/auth/login"| Customer login
"GET /api/auth/me"| Current authenticated user
"GET /api/users/dashboard"| Customer dashboard
"POST /api/deposits"| Create deposit request
"GET /api/deposits/my"| Customer deposit history
"POST /api/deposits/upload-url"| Request receipt upload URL
"PUT /api/deposits/upload/:key"| Upload receipt
"POST /api/withdrawals"| Create withdrawal request
"GET /api/withdrawals/my"| Customer withdrawal history
"GET /api/payment-accounts"| Public payment accounts
"GET /api/notifications"| Customer notifications
"GET /api/public/landing"| Public landing data
"GET /api/admin/dashboard"| Admin dashboard
"GET/POST /api/admin/deposits"| Deposit administration
"POST /api/admin/deposits/:id/approve"| Approve deposit
"POST /api/admin/deposits/:id/reject"| Reject deposit
"GET /api/admin/withdrawals"| Withdrawal administration
"POST /api/admin/withdrawals/:id/approve"| Approve withdrawal
"POST /api/admin/withdrawals/:id/reject"| Reject withdrawal
"GET /api/admin/customers"| Customer management
"GET/POST /api/admin/promos"| Promo management
"GET /api/admin/audit-logs"| Audit logs
"GET/PUT /api/admin/settings"| System settings

«The actual backend route implementations are the source of truth for API behavior.»

---

🔄 Deposit & Withdrawal Workflow

                   CUSTOMER
                       │
                       ▼
                ┌─────────────┐
                │    Login    │
                └──────┬──────┘
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
        💰 DEPOSIT          💸 WITHDRAWAL
             │                   │
             ▼                   ▼
       Submit Request       Submit Request
             │                   │
             ▼                   │
       Receipt Upload            │
             │                   │
             └─────────┬─────────┘
                       ▼
                  ADMIN REVIEW
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
           APPROVE            REJECT
              │                 │
              └────────┬────────┘
                       ▼
                  STATUS UPDATE
                       │
                       ▼
                  NOTIFICATION

---

🧾 Transaction Safety

Financial workflows require special care around concurrency and retries.

The application architecture uses concepts including:

Request
   ↓
Authentication
   ↓
Authorization
   ↓
Validation
   ↓
Idempotency Check
   ↓
Database Transaction
   ↓
Balance / State Update
   ↓
Audit Record
   ↓
Notification / Background Work

For production, test these cases explicitly:

- Concurrent requests
- Duplicate submissions
- Network retries
- Client refresh during submission
- Admin approval race conditions
- Database transaction failures
- Partial upload failures

---

🛡️ Production Security Checklist

Before deploying publicly:

[ ] Replace all development secrets
[ ] Generate a strong JWT secret
[ ] Never commit .env files
[ ] Enable HTTPS
[ ] Configure strict CORS
[ ] Review authentication expiration
[ ] Review all authorization rules
[ ] Test idempotency under retries
[ ] Test concurrent financial requests
[ ] Validate receipt uploads
[ ] Restrict upload size and MIME types
[ ] Use durable object storage for production uploads
[ ] Review WebView permissions
[ ] Configure Android release signing
[ ] Remove demo credentials
[ ] Review audit logging
[ ] Run dependency vulnerability audits
[ ] Configure database backups
[ ] Configure monitoring and alerts
[ ] Test disaster recovery
[ ] Review applicable laws and platform policies

---

🧪 Development Commands

Frontend

cd frontend

npm install
npm run dev
npm run build
npm run preview

Backend

cd backend

npm install
npm run dev
npm run build
npm start

npm run db:generate
npm run db:push
npm run db:seed

---

🗺️ Roadmap

✅ Implemented

- [x] Mobile-first web interface
- [x] React + TypeScript frontend
- [x] Node.js + Express backend
- [x] Prisma database layer
- [x] PostgreSQL support
- [x] Customer authentication
- [x] Role-based access control
- [x] Deposit workflow
- [x] Withdrawal workflow
- [x] Receipt upload workflow
- [x] Customer transaction history
- [x] Admin transaction management
- [x] Audit-log support
- [x] Android WebView client

🚧 Planned Improvements

- [ ] Expand automated test coverage
- [ ] Production-grade object storage
- [ ] Improved monitoring and observability
- [ ] CI/CD quality gates
- [ ] Automated security scanning
- [ ] Production Android release pipeline
- [ ] More robust background job processing
- [ ] Enhanced notification infrastructure
- [ ] Advanced admin analytics
- [ ] Comprehensive API documentation

---

🧑‍💻 Development Philosophy

🇬🇧 Build with purpose.

Good software should be:

⚡ Fast
🔐 Secure
🛡️ Reliable
🧩 Maintainable
📱 User-Friendly
📈 Scalable

🇱🇰 හොඳ Software එකක් කියන්නේ...

«වේගවත් + ආරක්ෂිත + විශ්වසනීය + භාවිතයට පහසු + Maintainable»

---

👨‍💻 Author

Lakmal Vidana Gamage 🇱🇰

Developer focused on:

- 📱 Android Development
- 🌐 Web Development
- ⚙️ Backend Development
- 🐍 Python
- 🔥 Firebase
- 🤖 Automation
- 🧩 Practical Digital Products

<p align="center">
  <a href="https://github.com/Lakmal2078">
    <img src="https://img.shields.io/badge/GitHub-Lakmal2078-181717?style=for-the-badge&logo=github" alt="GitHub">
  </a>
  <a href="https://www.linkedin.com/in/lakmal-vidanagamage">
    <img src="https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin" alt="LinkedIn">
  </a>
  <a href="https://lakmal2078.github.io/gamagemarketing/">
    <img src="https://img.shields.io/badge/Portfolio-Visit-00A67E?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Portfolio">
  </a>
</p>---

📄 License

This project documentation previously referenced the MIT License.

If this repository is intended to be distributed under MIT, make sure a matching "LICENSE" file containing the official MIT License text exists in the repository.

---

<p align="center">🇱🇰 Built from Sri Lanka • Designed for practical digital experiences 🚀

Code • Create • Learn • Improve • Repeat

⭐ Explore the repository and follow the development journey.

</p>