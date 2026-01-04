**Overview**

- **Repo:** `event-management-be` — Express-based backend for a multi-tenant event management system.
- **Main entry:** `server.js` — calls `registerRedis(app)`, `initializeDb()` and `testDbConnection()` before listening.
- **HTTP app:** `src/app.js` — sets up middleware, routes and Swagger at `/api-docs`.

**Architecture & data flow**

- **Layers:** `routes` -> `controllers` -> `services` -> `db` (pg-promise). Example: `src/controllers/auth.controller.js` invokes `tenant.service` and `user.service`.
- **Responses:** controllers use `src/models/response.model.js` helpers (`successRes`, `errorRes`) — follow this shape when returning JSON.
- **DB init:** `src/db/db.js` exposes `initializeDb()` and `getDb()`; `getDb()` throws until `initializeDb()` has run. `server.js` runs `initializeDb()` then `testDbConnection()`.
- **Secrets:** production loads secrets from AWS Secrets Manager (`src/db/secrets.js` / `loadSecretsSM()`); for local set `NODE_ENV=local` and provide `DB_*` env vars (see `loadEnvSecrets`).
- **Sessions / Redis:** Session setup lives in `src/middlewares/session.middleware.js` and `src/redis/*`. The app expects `registerRedis(app)` to install session middleware before routes (see `server.js` and `src/app.js` comment).

**Important files to reference**

- `server.js` — startup ordering and lifecycle (register redis, init DB, test DB).
- `src/app.js` — global middleware, version prefix `/v1`, swagger mounting.
- `src/routes/routes.js` — canonical place for route collection (`/health`, `/auth`, `/users`, `/tenants`, `/redis-session`).
- `src/models/response.model.js` — canonical response shape and common DB error codes handling (e.g. `23505`, `23502`).
- `src/db/secrets.js` — AWS secrets vs local env fallback.
- `src/redis/redisClient.js` & `src/middlewares/session.middleware.js` — Redis connection and compatibility notes for `connect-redis`.

**Env & run commands**

- Dev: `npm run watch` (uses `nodemon server.js`).
- Prod: `npm run start` (runs `node server.js`).
- Required / common env vars:
  - `NODE_ENV` (`local` to use env vars, otherwise fetch secrets from AWS)
  - `SECRET_NAME` (when not local — for AWS Secrets Manager)
  - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (for local)
  - `DB_SSL` (`true`/`false`) — toggles SSL behavior in `src/db/db.js`
  - `REDIS_URL`, `REDIS_TLS`, `REDIS_REJECT_UNAUTHORIZED` — Redis connection options
  - `SESSION_SECRET`, `SESSION_COOKIE_NAME`, `SESSION_SAMESITE`, `SESSION_MAX_AGE_MS`

**Project-specific conventions & gotchas**

- **Route versioning:** All routes are mounted under `/v1` in `src/app.js` (so call paths like `/v1/users`).
- **Session registration:** Session middleware must be registered before routes — `server.js` calls `registerRedis(app)`; `src/app.js` contains a commented reminder "SESSION MUST be registered BEFORE routes".
- **pg-promise config:** DB options include `options: "-c search_path=emdb-schema,public"` — queries assume schema-scoped tables.
- **connect-redis compatibility:** `src/middlewares/session.middleware.js` contains compatibility handling for different `connect-redis` versions — if modifying session code, preserve the compatibility checks.
- **Error codes:** `response.model` maps certain Postgres error codes to friendly messages; services often bubble DB errors into controllers that then call `errorRes(...)`.

**When editing or adding APIs**

- Add route in `src/routes/*` and mount in `src/routes/routes.js`.
- Implement controller in `src/controllers/*` and use `successRes` / `errorRes` shape.
- Put business logic in `src/services/*` and only access DB via `src/db/getDb()` (through service helpers).

**Debugging tips**

- If server fails to start with DB errors: check whether `initializeDb()` logged secrets loaded successfully and that `DB_SSL` matches your environment (see `src/db/db.js`).
- If sessions fail: ensure `SESSION_SECRET` is set and `REDIS_URL` is reachable; use `src/redis/redisClient.js` to inspect connection settings.
- To reproduce locally: set `NODE_ENV=local` and export the `DB_*` env vars, set `REDIS_URL` to a local Redis instance, then run `npm run watch`.

**What an AI agent should not assume**

- Tests are not present — do not add test-run hooks without confirming the preferred framework.
- Deployment details (Cloud infra) are not fully encoded here — assume secrets live in AWS unless `NODE_ENV=local`.

If anything here looks incomplete or you want me to add automated checks, CI steps, or example `.env` files, tell me which area to expand.
