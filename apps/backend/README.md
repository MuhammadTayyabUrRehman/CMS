# 🏛️ Ministry of Finance — Complaint Portal
## Auth Backend (NestJS + Prisma + PostgreSQL)

---

## 🖥️ Local Setup (copy-paste, full stack)

Runs both the backend (`:3001`) and frontend (`:3000`) on a personal machine.
Tested on Node 22 + PostgreSQL 15.

**1. Prerequisites**
```bash
node -v   # Node 20+ (tested on 22)
psql --version   # PostgreSQL 14+
```

**2. Create the database**
```bash
createdb finance_portal
# or: psql -U postgres -c "CREATE DATABASE finance_portal;"
```

**3. Backend**
```bash
cd back
npm install
cp .env.example .env
npx prisma migrate deploy
npm run seed
```
`.env` defaults to `postgresql://postgres:postgres@localhost:5432/finance_portal` —
edit the password if your local PostgreSQL uses a different one.

**4. Frontend**
```bash
cd front
npm install
cp .env.example .env
```

**5. Run both**
```bash
# Terminal 1 — backend on :3001
cd back && npm run start:dev

# Terminal 2 — frontend on :3000
cd front && npm run dev
```

**6. Verify it's working**
```bash
curl http://localhost:3001/api/health        # expect "status": "UP"
# open http://localhost:3000/login in a browser
```
The frontend proxies `/api/*` to `http://localhost:3001` (see `front/next.config.mjs`),
so no CORS or separate API URL is needed locally.

**Seeded accounts** (`npm run seed` creates these):
```
Email:    admin@finance.gov.pk     Password: Admin@12345     Role: ADMIN
Email:    staff@finance.gov.pk     Password: Staff@12345     Role: IT_STAFF  (only if SEED_IT_STAFF=true)
```
> ⚠️ Change these passwords immediately on any shared or public deployment.

---

## 📁 Complete File Structure

```
nestjs-auth-backend/
├── src/
│   ├── main.ts                              ← App entry point, starts server
│   ├── app.module.ts                        ← Root module, connects everything
│   │
│   ├── prisma/
│   │   ├── prisma.module.ts                 ← Makes DB available everywhere
│   │   └── prisma.service.ts               ← Database connection
│   │
│   ├── mail/
│   │   ├── mail.module.ts                   ← Mail module
│   │   └── mail.service.ts                 ← Sends reset password emails
│   │
│   └── auth/
│       ├── auth.module.ts                   ← Auth module
│       ├── auth.controller.ts              ← All 5 API routes defined here
│       ├── auth.service.ts                 ← All business logic here
│       │
│       ├── dto/
│       │   ├── register.dto.ts             ← Register request shape
│       │   ├── login.dto.ts                ← Login request shape
│       │   ├── forgot-password.dto.ts      ← Forgot password request shape
│       │   └── reset-password.dto.ts       ← Reset password request shape
│       │
│       ├── strategies/
│       │   └── jwt.strategy.ts             ← Verifies JWT on every request
│       │
│       ├── guards/
│       │   ├── jwt-auth.guard.ts           ← Protects routes (must be logged in)
│       │   └── roles.guard.ts              ← Protects routes (must have correct role)
│       │
│       └── decorators/
│           └── roles.decorator.ts          ← @Roles('ADMIN') decorator
│
├── prisma/
│   ├── schema.prisma                        ← Database table definitions
│   └── seed.ts                             ← Creates first admin account
│
├── .env.example                             ← Copy this to .env and fill in values
├── package.json                             ← Project dependencies
├── tsconfig.json                            ← TypeScript settings
├── nest-cli.json                            ← NestJS CLI settings
└── README.md                               ← This file
```

---

## 🚀 Step-by-Step Setup Guide

### Step 1 — Install required software
Make sure these are installed on your laptop:
- Node.js LTS → https://nodejs.org
- PostgreSQL → https://www.postgresql.org/download
- VS Code → https://code.visualstudio.com

### Step 2 — Install NestJS CLI globally
Open your terminal (Command Prompt / PowerShell) and run:
```bash
npm install -g @nestjs/cli
```

### Step 3 — Clone / download this project
```bash
# If using Git
git clone <your-repo-url>
cd nestjs-auth-backend

# Or just open the folder in VS Code
```

### Step 4 — Install all dependencies
```bash
npm install
```

### Step 5 — Create your .env file
```bash
# Copy the example file
cp .env.example .env
```
Then open `.env` in VS Code and fill in your actual values:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/finance_portal"
JWT_SECRET="any-long-random-string-here"
MAIL_USER="yourgmail@gmail.com"
MAIL_PASSWORD="your-gmail-app-password"
FRONTEND_URL="http://localhost:3000"
```

> ⚠️ For Gmail App Password:
> Go to Google Account → Security → 2-Step Verification → App Passwords → Generate

### Step 6 — Create the database
Open pgAdmin (installed with PostgreSQL), right-click on Databases → Create → Database.
Name it: `finance_portal`

### Step 7 — Run database migration (creates tables)
```bash
npm run prisma:migrate
# When it asks for a name, type: init
```

> **Production:** always use `npm run prisma:deploy` (`prisma migrate deploy`),
> never `migrate dev`. `migrate dev` is for local development only and may
> generate/apply uncommitted schema drift. `migrate deploy` applies committed
> migrations from `prisma/migrations/` without prompting.

### Step 8 — Visually check your tables (optional)
```bash
npm run prisma:studio
# Opens a browser tab showing your database tables
```

### Step 9 — Create the first Admin account
```bash
npm run seed
```
This creates:
```
Email:    admin@finance.gov.pk
Password: Admin@12345
Role:     ADMIN
```
> ⚠️ Change this password after first login!

### Step 10 — Start the server
```bash
npm run start:dev
```
You should see:
```
🚀 Finance Portal Auth Server is running!
📡 URL: http://localhost:3001/api
```

---

## 🔌 API Endpoints

| Method | Endpoint | What it does | Login required? |
|--------|----------|-------------|-----------------|
| POST | `/api/auth/register` | Create new account | No |
| POST | `/api/auth/login` | Login, get JWT token | No |
| GET | `/api/auth/me` | Get my info | Yes |
| POST | `/api/auth/forgot-password` | Send reset email | No |
| POST | `/api/auth/reset-password` | Set new password | No |
| GET | `/api/auth/admin-test` | Test admin access | Yes (ADMIN only) |

---

## 📬 Testing with Postman

### Register
```
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "fullName": "Ahmed Khan",
  "employeeId": "EMP-2024-001",
  "department": "IT_DEPARTMENT",
  "email": "ahmed@finance.gov.pk",
  "password": "Password1",
  "confirmPassword": "Password1"
}
```

### Login
```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "ahmed@finance.gov.pk",
  "password": "Password1"
}
```
Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "fullName": "Ahmed Khan",
    "email": "ahmed@finance.gov.pk",
    "role": "USER"
  }
}
```

### Get My Info (requires token)
```
GET http://localhost:3001/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Forgot Password
```
POST http://localhost:3001/api/auth/forgot-password
Content-Type: application/json

{
  "email": "ahmed@finance.gov.pk"
}
```

### Reset Password
```
POST http://localhost:3001/api/auth/reset-password
Content-Type: application/json

{
  "token": "the-token-from-the-email-link",
  "newPassword": "NewPassword1"
}
```

---

## 🤝 What to Give the Frontend Team

```
Base URL: http://localhost:3001/api

After Login, the response includes:
{
  "token": "JWT token — store this in localStorage",
  "user": {
    "role": "ADMIN" or "USER"  ← use this to redirect
  }
}

Redirect logic:
  role === "ADMIN" → navigate to /admin/dashboard
  role === "USER"  → navigate to /user/dashboard

For protected pages, send token in every request header:
  Authorization: Bearer <token>
```

---

## 📋 Valid Department Values (for Register dropdown)
```
BUDGET_WING
ACCOUNTS_WING
EXPENDITURE_WING
ECONOMIC_ADVISER_WING
INTERNAL_FINANCE_WING
DEBT_MANAGEMENT_WING
INVESTMENT_WING
IT_DEPARTMENT
ADMINISTRATION
CORPORATE_FINANCE_WING
```

---

## ⚠️ Security Rules
1. Never commit `.env` file to GitHub — it's in `.gitignore`
2. JWT tokens expire after 24 hours
3. Password reset tokens expire after 15 minutes
4. Passwords are always hashed — never stored as plain text
5. Admin accounts only created via `npm run seed`

---

## ❓ Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `Cannot connect to database` | Check `DATABASE_URL` in `.env` and make sure PostgreSQL is running |
| `Invalid email or password` | Double-check credentials. Run seed script to create admin first |
| `Prisma client not generated` | Run `npm run prisma:generate` |
| `Port 3001 already in use` | Change `PORT=3002` in `.env` |
| `Gmail not sending` | Make sure you used App Password, not your regular Gmail password |
