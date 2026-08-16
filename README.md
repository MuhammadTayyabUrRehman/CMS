
to Start the postgreSQL server...
Open Command Prompt (Run as Administrator if possible):

cd /d "C:\Program Files\PostgreSQL\18\bin"


pg_ctl -D "C:\Program Files\PostgreSQL\18\data" start

Expected output:

waiting for server to start.... done
server started

---

# Finance Division — IT Complaint Portal

A Ministry of Finance complaint portal built as a single **npm-workspaces monorepo**:

- **Backend** — NestJS + Prisma ORM + PostgreSQL. Stateless JWT auth, bcrypt (cost 12) password hashing. Serves the API on **port 3001**.
- **Frontend** — Next.js 16. Serves the UI on **port 3000**.

```
CMS - Integrated front with backend/
├── AGENTS.md            # source-of-truth rules & business context
├── .gitignore
├── README.md            # this file
└── apps/
    ├── package.json     # npm workspace root
    ├── package-lock.json
    ├── backend/         # NestJS API  (port 3001)
    └── frontend/        # Next.js UI  (port 3000)
```

---

## Prerequisites

| Tool        | Version   | Notes                                              |
|-------------|-----------|----------------------------------------------------|
| Node.js     | >= 20     | Required by NestJS 10 and Next.js 16               |
| npm         | >= 10     | Workspace install & root scripts                   |
| PostgreSQL  | 18        | Local dev DB `finance-portal` (user `postgres`, pw `1234`) |

---

## 1. Start PostgreSQL

Open Command Prompt (Run as Administrator if possible):

```bat
cd /d "C:\Program Files\PostgreSQL\18\bin"
pg_ctl -D "C:\Program Files\PostgreSQL\18\data" start
```

Expected output:

```
waiting for server to start.... done
server started
```

---

## 2. Install dependencies (from the apps workspace root)

```bat
cd "C:\Local Disk (D)\reports finance\CMS - Integrated front with backend\apps"
npm install
```

This installs both `backend` and `frontend` via npm workspaces and creates the shared `apps/node_modules`.

---

## 3. Environment configuration

Backend variables live in `apps/backend/.env` (already present). Important values:

```dotenv
DATABASE_URL="postgresql://postgres:1234@localhost:5432/finance-portal"
JWT_SECRET="change-me-local-dev-secret-please"
PORT=3001
FRONTEND_URL="http://localhost:3000"
SEED_IT_STAFF=true
```

Frontend variables live in `apps/frontend/.env`:

```dotenv
JWT_SECRET="change-me-local-dev-secret-please"   # must match the backend
NEXT_PUBLIC_API_URL="/api"
```

> **No SMTP / no email** — this system has no email provider configured. Password recovery and all flows work without sending real email (see `AGENTS.md` → Known issues: forgot-password alternatives are awaiting a decision).

---

## 4. Run database migrations

From the **apps workspace root**:

```bat
cd "C:\Local Disk (D)\reports finance\CMS - Integrated front with backend\apps"
npm run prisma:generate
npm run prisma:migrate
```

`prisma:migrate` runs `prisma migrate dev` — applies pending migrations, updates the DB schema, and regenerates the Prisma client.

> Equivalent one-liner via the root workspace script:
> ```bat
> npm run prisma:generate && npm run prisma:migrate
> ```

---

## 5. Seed the database

Creates the first admin (and optionally IT staff) account. bcrypt-hashed (cost 12).

From the **apps workspace root**:

```bat
cd "C:\Local Disk (D)\reports finance\CMS - Integrated front with backend\apps"
npm run seed
```

Or directly from inside the backend folder:

```bat
cd "C:\Local Disk (D)\reports finance\CMS - Integrated front with backend\apps\backend"
npm run seed
```

Default seeded accounts:

| Role      | Email                | Password     | Notes                                            |
|-----------|----------------------|--------------|--------------------------------------------------|
| Admin     | admin@finance.gov.pk | Admin@12345  | Full access — user management, analytics, staff  |
| IT Staff  | staff@finance.gov.pk | Staff@12345  | Created when `SEED_IT_STAFF=true` in `.env`        |

> **Change these passwords after first login** via the in-app change-password flow.

---

## 6. Start the backend

### Option A — from the backend folder (direct)

Open a terminal and `cd` into the backend directory, then run the NestJS dev server with hot reload:

```bat
cd "C:\Local Disk (D)\reports finance\CMS - Integrated front with backend\apps\backend"
npm run start:dev
```

This starts the API on **http://localhost:3001** with `--watch` (auto-restarts on file changes).

### Option B — from the apps workspace root

```bat
cd "C:\Local Disk (D)\reports finance\CMS - Integrated front with backend\apps"
npm run start:dev --workspace=backend
```

### Production build

```bat
npm run build --workspace=backend
npm run start:prod --workspace=backend
```

---

## 7. Start the frontend

Open a **new** terminal (the backend must already be running for the API proxy to work).

### Option A — from the frontend folder (direct)

```bat
cd "C:\Local Disk (D)\reports finance\CMS - Integrated front with backend\apps\frontend"
npm run dev
```

This starts the Next.js dev server on **http://localhost:3000**.

### Option B — from the apps workspace root

```bat
cd "C:\Local Disk (D)\reports finance\CMS - Integrated front with backend\apps"
npm run dev --workspace=frontend
```

### Production build

```bat
npm run build --workspace=frontend
npm run start --workspace=frontend
```

---

## 8. Start both at once (from the apps workspace root)

```bat
cd "C:\Local Disk (D)\reports finance\CMS - Integrated front with backend\apps"
npm run dev
```

This uses `concurrently` to run the backend (`start:dev`) and frontend (`next dev`) in one terminal. The backend listens on **3001** and the frontend on **3000**.

---

## Quick command reference

| Command (run from `apps` unless noted)                                                | What it does                                  |
|----------------------------------------------------------------------------------------|-----------------------------------------------|
| `npm install`                                                                          | Install all dependencies (root + workspaces)  |
| `npm run dev`                                                                          | Start backend + frontend (dev, both)          |
| `npm run start:dev --workspace=backend`                                               | Start backend only                            |
| `npm run dev --workspace=frontend`                                                    | Start frontend only                           |
| `npm run build`                                                                        | Build both apps                               |
| `npm run lint`                                                                         | Lint both apps                                |
| `npm run prisma:generate`                                                              | Regenerate the Prisma client                  |
| `npm run prisma:migrate`                                                              | Apply DB migrations (dev)                     |
| `npm run prisma:deploy`                                                               | Apply DB migrations (prod)                    |
| `npm run seed`                                                                         | Seed the database (admin + staff accounts)    |
| `npm run start:prod --workspace=backend`                                              | Start backend in production mode              |
| `npm run start --workspace=frontend`                                                  | Start frontend in production mode             |
| `npm run prisma:studio --workspace=backend`                                           | Open Prisma Studio (DB GUI)                   |

### Direct-from-folder equivalents (cd first)

```bat
cd "C:\Local Disk (D)\reports finance\CMS - Integrated front with backend\apps\backend"
npm run start:dev      & rem  backend dev server (port 3001)
npm run seed           & rem  seed the database
npm run prisma:migrate & rem  run migrations locally

cd "C:\Local Disk (D)\reports finance\CMS - Integrated front with backend\apps\frontend"
npm run dev            & rem  frontend dev server (port 3000)
```
