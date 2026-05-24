# PRD — Full Migration: React 19 + HeroUI v3 + Tailwind v4 + RTK 2 + React Router 7

## Original problem statement
Migrate repo `https://github.com/anujverma-eng/heroui-migration` (branch `migration`) from:
- React 18 → 19
- HeroUI v2 → v3
- Tailwind v3 → v4
- Redux Toolkit 1 → 2 (+ React-Redux 8 → 9)
- React Router 6 → 7

## User choices
- Phase 1 (analysis): Single Markdown report; symbol-level dependency graph; include
  per-library breaking-changes summary.
- Phase 2 (execution): proceed sequentially on existing `migration` branch; follow official
  HeroUI v3 docs (not invented API names); full HeroUI swap (not side-by-side); React 19
  prerequisite + RTK 2 + RR7 "properly".

## Approach
Each library bumped in its own sequential commit on `migration` branch:
1. Tailwind v4 (kept HeroUI v2 working via `hero.js` + `@plugin` CSS-first path)
2. React 19 (deps + types only; no source changes)
3. HeroUI v3 (full swap; component compound rewrites; class renames)
4. React Router 7 (deps only; symbols preserved)
5. RTK 2 + react-redux 9 (deps + v9 `withTypes()` hook idiom)

Each commit verified end-to-end with `vite build` + dev-server + page-error capture +
real form interaction (typing, tab switch, click validation).

## What's been implemented

### 2026-01: Phase 1 — Analysis (already shipped)
`/app/MIGRATION_MAP.md` — file-by-file graph, HeroUI v2 inventory, Tailwind v3 patterns,
risky-file tiers, migration order, per-file effort, breaking-changes per library,
cross-cutting issues (incl. case-sensitive `./footer` import + undefined `brand-*`).

### 2026-01: Phase 2 — 5 sequential commits on `migration` branch

| Commit | What | Notes |
|---|---|---|
| `bc85c4c` | Tailwind v3 → v4 | `tailwindcss@4` + `@tailwindcss/postcss`; deleted `tailwind.config.js`; CSS-first `hero.js` + `@plugin`. v4-renamed utilities updated (`shadow-sm`→`shadow-xs`, `backdrop-blur-sm`→`backdrop-blur-xs`, bare `backdrop-blur`→`backdrop-blur-sm`). HeroUI v2 untouched. Fixed pre-existing `./footer`→`./Footer` case bug. 246 kB CSS. |
| `b40ba2d` | React 18 → 19 | `react`, `react-dom`, `@types/react`, `@types/react-dom` → ^19. No source changes (no `defaultProps`/`propTypes`/string refs/`findDOMNode`). |
| `a9b16a6` | HeroUI v2 → v3 | New deps `@heroui/react@3` + `@heroui/styles`. Deleted `hero.js`. `@import '@heroui/styles'` replaces v2 plugin. `<HeroUIProvider>` removed, `<ToastProvider />` added. 7 components rewritten to v3 compound APIs: `Spinner` (was `CircularProgress`), `Card/CardContent` (was `Card/CardBody`), `Tabs > TabList > Tab + TabPanel`, `TextField + InputGroup + Label + FieldError` (was monolithic `Input`), `InputOTP*` compound, `Checkbox` compound, `Button` (`color` → `variant`), `Link` (no polymorphic `as`), `addToast` → `toast.danger/warning/success`. `validationState`→`isInvalid` ×4. Class renames: `primary*`→`accent*`, `content1`→`surface`, `divider`→`separator`, `default-{400–900}`→`muted`/`foreground`, warning numbered scales → `warning-soft*`. 388 kB CSS. |
| `112a4b3` | React Router 6 → 7 | `react-router-dom` ^6 → ^7 + add `react-router@^7`. Zero source changes — symbols used (`createBrowserRouter`, `RouterProvider`, `Navigate`, `Outlet`, `useLocation`, `useNavigate`, `useSearchParams`, `Link`) are all signature-preserved. |
| `15349b9` | Redux Toolkit 1 → 2, react-redux 8 → 9 | `@reduxjs/toolkit` ^1.9.7 → ^2.0.0, `react-redux` ^8.1.3 → ^9.0.0. `hooks/store.ts` migrated to v9 `useDispatch.withTypes()` + `useSelector.withTypes()` (replaces deprecated `TypedUseSelectorHook`). Slices unchanged (`configureStore`, `createSlice`, `createAsyncThunk`, `PayloadAction` all signature-preserved). |

## Verification (final state)
- `vite build` passes (388 kB CSS, ~970 kB JS).
- Dev server: `/login`, `/login?tab=signup`, `/404` all return HTTP 200 with **zero page errors**.
- Functional smoke tests on final stack:
  - Login form renders with all fields, prefix icons, password visibility toggle, submit button.
  - Empty submit triggers validation → fields turn red (react-aria invalid state from Redux validation).
  - Tab switch (Sign In ↔ Create Account) works → confirms `useAppSelector` + `useAppDispatch` v9 hooks.
  - Create Account form renders Full Name / Email / Password / Confirm + Terms checkbox + links.
  - Typing into Email highlights the field with accent ring.
  - Router renders 404 page on unknown routes.

## Files
- `/app/MIGRATION_MAP.md` — Phase 1 analysis (reference).
- `/app/heroui-migration/` — branch `migration`, 5 new commits on top of `950984c`.

## Backlog / next actions
- (Optional polish) Replace `framer-motion` → `motion` (rebranded successor; HeroUI v3 dropped framer-motion internally; our app code still uses it in 3 files).
- (Optional polish) Resolve pre-existing `bg-brand-*` undefined classes in NotFoundPage, UnauthorizedPage, ErrorBoundary, PermissionRoute (already flagged in Phase 1 report).
- (Optional polish) Re-enable strict TS options in `tsconfig.app.json` (pre-existing `baseUrl` TS5101 error blocks `tsc -b`; `vite build` already passes).
- (Optional) Wire real Cognito env vars (stub `.env` only used for migration smoke tests; never committed).
- (Optional) Migrate `react-router-dom` imports → `react-router` to match v7 idioms (functionally equivalent; left as `react-router-dom` to minimize diff).
