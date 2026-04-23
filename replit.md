# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## ОНИКС Dashboard (artifacts/onyx-dashboard)

Russian-language mobile-first PWA. Three owner profiles + one mechanic, isolated per-login storage.

- Logins: `0000` (Skoda Octavia A5), `2222` (Audi A6 C7, seeded defects), `3333` (BMW X5 E70, seeded defects), `11111` (Mechanic).
- Storage prefix: `onix_offline_data_v1__<login>` + `onix_auth_v1` + `onix_mech_active_login_v1`.
- Cars registry: `src/lib/cars.ts` (`findCarByVin`, login↔VIN map).
- Storage API: `loadAppDataFor(login)`, `saveAppDataFor`, `loadAllOwnersData`, `subscribe`, `addAppointment`, `updateAppointmentFor(login,id,patch)`, `addOrderFor`, `markOrderPaidFor`, `addHistoryEventFor`, `addDefectFor`.
- IDs: appointments `appt-<base36ts>-<rand>`; orders `<vin4>-<base36ts>-<rand>` (globally unique across owners).
- Mechanic dashboard aggregates across all owners; uses composite `${ownerLogin}:${orderId}` key to avoid collisions.
- 3D diagnostics: `src/components/Car3D.tsx` (R3F, drei OrbitControls), WebGL fallback in `pages/Diagnostics.tsx`.
- Defect logging: `DefectForm` (mechanic) writes via `addDefectFor` → owner gets reminder + history alert.
