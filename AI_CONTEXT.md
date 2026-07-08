# AlumniConnect - AI Context & Handover

## Project Overview
AlumniConnect is a school alumni community platform featuring real-time chat, searchable alumni contacts, and memory media galleries. It uses a **Feature-Based Architecture** for modularity.

## Tech Stack
- **Framework:** Next.js 16.2.7 (App Router, Turbopack)
- **Language:** TypeScript (Strict mode)
- **Database:** PostgreSQL (v16)
- **ORM:** Prisma v7.8.0
- **Auth:** JWT (Cookie-based), Bcrypt
- **Styling:** Tailwind CSS v4
- **Validation:** Zod + React Hook Form

## Key Architectural Decisions
1. **Feature-Based Structure:** Code is organized by feature in `src/features/`. Each feature contains its own components, validations, and services.
2. **Next.js 16 Conventions:**
   - Middleware is located in `src/proxy.ts` (using `export function proxy`).
   - Dynamic route `params` are treated as `Promise` and must be awaited.
3. **Prisma 7 & PostgreSQL Adapter:**
   - Uses `@prisma/adapter-pg` and `pg` driver for explicit database connection.
   - Initialized in `src/lib/prisma.ts`.
4. **Security:**
   - Private routes protected via `proxy.ts`.
   - `Archive Admin Code` is required for any mutation in the Archive section (Contacts/Memories). It's stored as a Bcrypt hash in the `ArchiveAdminCode` model.

## Current Progress
- Project structure initialized.
- Database schema and migrations applied.
- Auth system (Register/Login/Logout) fully functional.
- Server management (Create/Join/Dashboard) implemented.
- Sidebar and Layout for Server pages ready.
- Chat UI and basic API ready (Socket.IO pending).
- Alumni Contacts feature functional (View/Add with Admin Code).
- Memories Gallery functional (View/Add with Admin Code).

## Important Files
- `src/proxy.ts`: Auth & Route protection.
- `src/lib/prisma.ts`: DB client initialization.
- `src/lib/auth.ts`: JWT & Hashing utilities.
- `prisma/schema.prisma`: Database models.
- `src/features/`: Core business logic.
