# Final Production Hardening Report

## Files Modified
- `src/scheduler/service.ts`
- `Dockerfile`

## Production Issues Fixed

### 1. Scheduler race condition under PM2 cluster mode (`src/scheduler/service.ts`)
`ecosystem.config.js` runs the backend with `instances: 'max'` and `exec_mode: 'cluster'`, meaning multiple Node processes each run their own copy of `@nestjs/schedule`'s `@Cron(EVERY_MINUTE)` job independently — there is no cross-instance coordination. The original `escalateComplaint()` used a check-then-write pattern inside a `$transaction` (`findUnique` → validate status/timer → `update`). Under Postgres's default Read Committed isolation, two cluster instances could both read the same complaint as still-escalatable in the same tick and both proceed to write, producing duplicate `ComplaintUpdate` and `Notification` rows for the same escalation event (double notifications to IT staff, duplicate audit trail entries). This is a genuine data-integrity bug specific to the documented cluster deployment, not a style issue.

Fix: replaced the read-then-write check with an atomic conditional `updateMany` whose `WHERE` clause encodes the same eligibility condition (`status IN (...)` and `timerExpiresAt <= now`). Only the instance whose `updateMany` actually matches a row (`count > 0`) proceeds to create the follow-up `ComplaintUpdate`/`Notification` records; any racing instance sees `count === 0` and exits without side effects. No new dependency, no behavior change for the single-writer case, no API/DTO change.

### 2. Docker signal forwarding (`Dockerfile`)
The production `CMD` was `sh -c "npx prisma migrate deploy && node dist/main.js"`. Because `node` was launched as a plain child of `sh` (not exec'd), `sh` remained PID 1 inside the container. `docker stop` / orchestrator shutdown sends `SIGTERM` to PID 1; most shells do not forward that signal to non-exec'd children, so the Nest app's `enableShutdownHooks()` / Prisma `$disconnect` graceful-shutdown path would never run. In practice this means the container would sit until the platform's kill grace period expires and then get `SIGKILL`ed, dropping in-flight requests and skipping clean DB disconnect on every deploy/restart.

Fix: changed the command to `sh -c "npx prisma migrate deploy && exec node dist/main.js"`. The `exec` replaces the shell process with `node`, so `node` becomes PID 1 and receives `SIGTERM` directly, allowing the existing graceful shutdown wiring in `main.ts` to run as intended. One-word change, no behavior change to the migration step.

## Remaining Operational Recommendations
- The Dockerfile image runs as root (no `USER` directive). Adding a non-root user is good practice, but doing so safely requires verifying file ownership/permissions for `/app` (including the `npx prisma migrate deploy` step and the rebuilt native `bcrypt` binary) under a real deployment test — left as an infra follow-up rather than an unverified in-place change.
- `ecosystem.config.js` and the Dockerfile represent two different deployment paths (PM2 bare-metal vs. Docker). Confirm which is actually used in production; if both are live in different environments, the scheduler fix above benefits both, but the Docker signal-forwarding fix only matters for the Docker path.
- Consider whether a distributed lock (e.g. Postgres advisory lock) is worth adding to the scheduler job itself (skip entirely on non-leader instances) to reduce redundant `SELECT` scan work every minute across all cluster instances — the current fix eliminates the *data* duplication risk, but every instance still executes the scan query each tick. This is a minor efficiency concern, not a correctness one, so it was left alone per the "no speculative changes" rule.

## Final Verdict
Two genuine production-risk issues were found and fixed under the multi-instance/cluster deployment configuration already present in the repo (`ecosystem.config.js`). All other areas reviewed (database indexing, transactions, API stability, memory safety, logging, configuration validation, security hardening, and general code smells) were already solid and required no changes.
