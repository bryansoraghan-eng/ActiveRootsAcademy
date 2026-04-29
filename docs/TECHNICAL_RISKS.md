# Technical Risk Register — Active Roots Academy Hub

Last updated: 2026-04-28  
Branch at time of writing: `schools-fixes`

This document records known architectural and security risks that have been reviewed and intentionally accepted, deferred, or constrained. Each entry states what the risk is, where it lives in the codebase, its current exposure, and explicit rules about what may or may not be built on top of it.

---

## Risk 1 — Dual User Tables

**Status: ACCEPTABLE FOR NOW — MUST NOT BE EXPANDED**

### What it is
There are two separate tables that represent authenticated users:

- `User` — covers `admin`, `school_admin`, `coach`, `principal`, `online_coach`, `client`
- `Teacher` — a separate table, always school-scoped, used for the teacher-facing UI

Login (`POST /api/auth/login`) checks `User` first, then falls back to `Teacher`. The JWT payload encodes which table the session came from via `userType: 'teacher'` vs other values.

### Where it appears
- `backend/prisma/schema.prisma` — both models defined with separate primary keys
- `backend/src/routes/auth.ts` — dual-table login logic (lines ~218–283)
- `backend/src/routes/teachers.ts` — CRUD against the `Teacher` table only
- Coaching models (`CoachingClient`, `TrainingPlan`, etc.) — `coachId` is a plain `String` with no foreign key constraint; it references `User.id` informally

### Current exposure
- Email uniqueness across both tables is enforced in application code (`/register` checks both), but the `POST /api/teachers/` management endpoint does not re-check the `User` table for conflicts. A collision is possible if an admin creates a teacher whose email already exists as a User.
- No referential integrity on `coachId` — a deleted coach leaves orphaned coaching records.
- If a future route checks the wrong table, a user could be silently not found.

### Rules
- **Do not add a third user table or user-like model under any circumstances.**
- **Do not write any route that fetches "a user" without being explicit about which table it targets.**
- **Do not expand `coachId` usage to new models as a plain String FK.** If a new model needs a coach reference, add a proper Prisma relation with `@relation` and a real FK.
- The correct long-term fix is a unified `User` table with a `role` column covering all types including `teacher`. That migration should be scoped and planned separately.

---

## Risk 2 — Legacy Registration Endpoint

**Status: RESOLVED — STUB RETAINED FOR VISIBILITY**

### What it is
`POST /api/auth/register-teacher` was a legacy teacher self-registration route that has been removed as of 2026-04-28. It has been replaced with a `410 Gone` response directing clients to `POST /api/auth/register` with `role: "teacher"`.

### Why it was removed
The legacy endpoint had two compounding flaws:
1. The original frontend performed school code validation **client-side only** in JavaScript and did not send the code to the backend — any direct HTTP call bypassed it entirely.
2. The backend fallback for schools without a proper code was the **first 3 characters of the school name**, which is public knowledge (returned by `GET /api/auth/schools`) and trivially guessable.

### Remaining gap in `/register`
`POST /api/auth/register` with `role: "teacher"` still accepts a bare `schoolId` in the body without requiring `schoolCode`, as long as no `schoolCode` is also supplied. The cross-validation only runs when both fields are present. The frontend always sends both, so this gap is not currently reachable from the UI — but it is reachable via direct API call.

### Rules
- **Do not restore or re-implement `/register-teacher` under any name.**
- **Do not add any self-registration path that validates a school association using anything other than the server-side `schoolCode` lookup.**
- The remaining gap (schoolId-without-code on `/register`) should be closed by making `schoolCode` a required field for `role: "teacher"` registrations on the server side.

---

## Risk 3 — JSON Fields Without Schema

**Status: ACCEPTABLE FOR NOW — MUST NOT BE EXPANDED**

### What it is
Multiple Prisma model fields are typed as `String` in the schema but store serialised JSON at runtime. There is no validation at the database level and no TypeScript type covering the shape of the parsed value.

### Affected fields

| Model | Field | Stored shape |
|---|---|---|
| `User` | `permissions` | `Record<string, boolean>` |
| `LessonPlan` | `skillFocus`, `warmUp`, `mainActivity`, `coolDown`, `equipment`, `notes` | structured objects |
| `GeneratedProgramme` | `weeks`, `skillFocus`, `equipment` | arrays / structured objects |
| `MovementBreakSchedule` | `slots`, `generated` | arrays of break objects |
| `Assessment` | `fmsScores` | skill score map |
| `NutritionLesson` | `resources` | array |
| `FoodItem` | `allergens`, `ageGroups`, `preferences`, `mealTypes` | string arrays |

### Current exposure
- A write path that stores malformed JSON (e.g. a partially constructed object) will corrupt that record silently. Reads of the affected record will then either throw a parse error or return `{}` depending on whether the caller wraps in try/catch.
- Shape drift: if the stored structure is changed in application code without a migration, old records have the old shape and new records have the new shape, with no way to distinguish them.
- `permissions` on `User` is parsed in several places with `try { JSON.parse(...) } catch { return {} }` — silent fallback to empty object means a corrupted permissions field will give a user no permissions rather than erroring visibly.

### Rules
- **Do not add any new `String` field to the Prisma schema that stores JSON.** Use Prisma's native `Json` type if moving to PostgreSQL (already the production database), or model the data relationally.
- **Do not add new consumers of these fields without a parse-and-validate step** (e.g. using `zod` or a manual shape check) rather than raw `JSON.parse`.
- The correct long-term fix is to migrate these fields to Prisma `Json` type columns with application-layer schema validation. The `permissions` field is the highest priority because silent fallback to `{}` affects access control.

---

## Risk 4 — Impersonation Is Preview-Only

**Status: ACCEPTABLE FOR NOW — MUST NOT BE EXPANDED**

### What it is
`POST /api/admin/impersonate/:userId` (in `backend/src/routes/admin.ts`) allows an admin to retrieve another user's profile data — their `id`, `name`, `role`, `permissions`, and `schoolId`. The frontend uses this to render a read-only preview of what that user would see.

### What the endpoint does NOT do
- It does **not** issue a JWT token scoped to the target user.
- It does **not** create a session as the target user.
- It does **not** allow the admin to perform write actions as the target user.
- The admin's own token remains the active credential for all subsequent API calls.

### Current exposure
- The endpoint returns the raw `permissions` JSON string for a `User` record. This is informational (used to display the permission preview) but means any code that reads the impersonation response receives the target's full permission set in plaintext. This is intentional but should be noted.
- Because no token is issued, there is no audit trail of what was viewed during an impersonation session beyond the single API call to this endpoint. If admin activity logging is added in future, this call should be included.

### Rules
- **This endpoint must never issue a JWT or any other token that authenticates requests as the target user.** Doing so would allow an admin to make API calls indistinguishable from the real user, with no per-action audit trail.
- **Do not add a `?write=true` mode, a `sudo` flag, or any parameter that causes state changes to be applied as the target user.**
- If true impersonation (acting-as) is needed in future, it must be implemented as a separate, explicitly scoped feature with: a time-limited token, an immutable audit log entry on issue and expiry, and a visible UI indicator that the session is impersonated.
- The endpoint is admin-only and must remain so. Do not add `school_admin` access.
