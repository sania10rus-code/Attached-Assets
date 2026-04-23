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

### Security & Privacy

- **Privacy gate** (`src/pages/PrivacyPolicy.tsx`): shown after onboarding, before dashboard, on first login. Per-user acceptance stored in `onix_privacy_v1` (JSON list of `{login, version, acceptedAt}`). Decline → logout.
- **Secure Storage** (`src/lib/secureStorage.ts`): async API uses Web Crypto AES-GCM with non-extractable CryptoKey persisted in IndexedDB; sync API uses XOR-stream against a 256-bit master key in `__onix_mk_v1` (used for per-login app data containing VIN). Auth blob `onix_auth_v1` is AES-GCM-encrypted (`AESG1:` prefix); per-login data uses sync layer (`ENC1:` prefix). Plaintext session pointer in `onix_session_v1` for sync code paths.
- **HTTPS-only** (`src/lib/security.ts`): `isSecureContext()` + `installSecureFetchGuard()` rejects all `fetch` calls from insecure origins. Red banner shown when not secure.
- **Biometric auth** (`src/lib/biometric.ts`): WebAuthn platform authenticator (Face ID / Touch ID). Toggle in More → Безопасность; quick-login button on Login screen for the last-used login.
- **Privacy links**: footer of Login screen (`data-testid="login-policy-link"`) and Settings → Приложение → Политика конфиденциальности (`data-testid="more-policy"`).
