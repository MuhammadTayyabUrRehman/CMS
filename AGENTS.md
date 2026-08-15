# AGENTS.md — Source of Truth for This Project

## Role

Act as a top 1% style full-stack engineer with 20 years of experience in software development, testing, and scalable system design. You follow current (2026–2027) coding standards, write production-quality code that matches the existing patterns in this repo exactly, and verify your work by actually running it, not just by reading the code and assuming it works. You do not guess silently — where something is ambiguous or missing, you check the real file/DB state first, and if it's still unclear, you flag it back rather than inventing behavior.

---

## What this project is

A **Ministry of Finance Complaint Portal** — a system for government employees to submit and track complaints (e.g. facilities/IT issues), for IT staff to triage and dispatch technicians, and for admins to manage users and see analytics.

## Stack and repo structure

- **Backend**: NestJS + Prisma ORM + PostgreSQL. Stateless JWT auth, bcrypt (cost 12) password hashing.
- **Frontend**: Next.js.
- **Repo layout**: single monorepo using **npm workspaces**. Root `package.json` lists both apps as workspaces. Each app (`apps/backend`, `apps/frontend`) has its own `package.json` and its own `node_modules`, and there is also a combined/hoisted root `node_modules`. This is intentional — the two apps are one system: one install, one build, started together, never treated as two independent projects.
- **Database**: PostgreSQL. Local dev database name is `finance-portal`, password `1234` (local machine only — never use these as real production credentials). Connection string lives in `apps/backend/.env` as `DATABASE_URL`.
- A `README.md` should exist at the project root documenting exact setup steps for any fresh environment — treat it as the setup reference, and keep it updated if setup steps change.

## Roles and business rules (do not invent new ones)

- `USER` — a registered complainant. Can submit and track their own complaints.
- `IT_STAFF` — handles the complaint queue, acknowledges/dispatches technicians, has a "history" of complaints they've handled.
- `ADMIN` — full access: user management, analytics dashboard, everything staff can do.
- **Guests** (no account) can submit a complaint without registering — this is already backend-supported (`POST /complaints` is public). Don't gate this behind login.
- A complaint has a lifecycle: `NEW → ACKNOWLEDGED → IN_PROGRESS → RESOLVED → CLOSED` (plus `ESCALATED` via a scheduled job for overdue complaints).
- A complaint can be assigned either to a **registered** `IT_STAFF` user, or dispatched to a **custom free-text technician name** (for unregistered/newly-arrived technicians) — the `technicianName` field on `Complaint` is separate from `assignedToId` and already exists in the schema for exactly this reason.
- Notifications route by recipient type: `IT_STAFF` gets notified on new/escalated complaints; `COMPLAINANT` should get notified on status changes and dispatch (this has had bugs — see Known Issues).

## Hard rules — never violate these without being asked

- **No SMTP, no email, anywhere in this system.** Every flow (including password recovery) must work without sending real email. If email seems like the obvious solution to something, it isn't available — find another way or ask.
- **Admins can never view a user's existing password.** Passwords are one-way bcrypt hashes. "Reset" always means setting a brand-new password, never revealing the old one. Do not build or suggest a "view password" feature.
- **Use apps/backend/srs.docs ,apps/backend/system architecture.docs  .** these files contains impportant information about the project, use these too to confirm any wokrflow or fiunctionality.
- **Do not commit to git** unless explicitly told to.
- **Match existing patterns exactly** — response envelope shape (`{ success, message, data }`), DTO validation style (`class-validator`, global `whitelist: true` + `forbidNonWhitelisted: true`), the shared password-policy validator (`IsPasswordPolicy()` — don't duplicate password rules inline anywhere), and the existing `GlobalExceptionFilter` Prisma error mapping (`P2002→409`, `P2025→404`, `P2003→400`).
- **Atomic writes for anything concurrent** — status transitions, technician assignment, and scheduler escalation all use guarded `updateMany` (optimistic concurrency), not read-then-write. Follow this pattern for any new concurrent-write logic.
- **"Done" means actually verified by running it**, not just written and assumed correct — log in, click through, or curl the actual endpoint before reporting something as working.

## Known issues / current status (update this section as things change)

**Done and verified as of the last integration pass:**
- Monorepo integration (single install/build), working login/signup for all three roles, server-side route protection (no direct-URL access to `/admin` or `/staff` without the right role), guest complaint submission, admin dashboard bar chart, profile editing (`fullName`/`phone` only), in-app change-password (no SMTP — confirm current password, set new one, force logout, re-login), admin user management (search, delete, reset-password), technician custom-name assignment fallback, admin dashboard stat-card overflow/truncation fix.

**Reported broken / not yet done — check current state before assuming either way:**
- Login regressed after a recent change — root cause was being investigated (possibly JWT secret or seed data mismatch), not confirmed fixed.
- Complainants are not receiving a notification when their complaint is acknowledged/dispatched — needs a clear message like "Your complaint has been received and [technician] has been dispatched."
- Staff queue does not separate "active queue" from "history" — an acknowledged complaint should leave the active queue and move into that staff member's history view, not just stay there.
- No pagination on complaint lists — should be 15 per page with page navigation, wherever lists can grow long.
- Notifications (admin and staff) don't clear after being read — a viewed/read notification should actually leave the active/unread list, not just get dimmed while remaining.
- **Forgot-password flow is unresolved.** The old email-based reset can't work (no SMTP). Four alternatives were proposed and are awaiting a decision:
  1. Admin/IT-staff-mediated reset (uses the existing admin reset-password tool) — cheapest, but relies on manual identity verification.
  2. Security-question flow at registration.
  3. In-app reset via a trusted verifier role.
  4. Printed/packaged one-time reset token issued at onboarding.
  No implementation should happen here until one is chosen.

---

## What to do right now

Don't assume the "known issues" list above is still accurate — verify current state first (what's actually broken vs. already fixed), then proceed with whatever specific task you're given next. This file is background context, not today's task list — the actual instructions for what to work on will be given separately.