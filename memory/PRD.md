# PRD — Full Migration + Validation Enhancement

## Original problem statement
Migrate repo `https://github.com/anujverma-eng/heroui-migration` (branch `migration`):
React 18→19, HeroUI v2→v3, Tailwind v3→v4, RTK 1→2 (+ React-Redux 8→9), RR 6→7.
Then: enhancement — wire zod schemas into react-aria's `validate` prop so client-side
validation renders inline instead of as toast warnings.

## User choices
- Phase 1 (analysis): Markdown report; symbol-level graph; per-library breaking-changes summary.
- Phase 2 (execution): sequential commits on `migration` branch; official HeroUI v3 docs;
  full HeroUI swap; React 19 prerequisite; RTK 2 + RR7 "properly".
- Phase 3 (enhancement): yes, implement inline native validation.

## Implementation (6 sequential commits on `migration` branch)

| Commit | What | Key result |
|---|---|---|
| `bc85c4c` | Tailwind v3 → v4 | `tailwindcss@4` + `@tailwindcss/postcss`; deleted `tailwind.config.js`; CSS-first `hero.js` + `@plugin`; renamed `shadow-sm`/`backdrop-blur*` for visual identity; fixed case-sensitive `./footer` → `./Footer`. 246 kB CSS. |
| `b40ba2d` | React 18 → 19 | Deps + types only; no source changes. |
| `a9b16a6` | HeroUI v2 → v3 (full swap) | `@heroui/react@3` + `@heroui/styles`; `<HeroUIProvider>` removed; `<ToastProvider />` added. 7 component compound rewrites: `Spinner`, `CardContent`, `Tabs > TabList > Tab/TabPanel`, `TextField + InputGroup + Label + FieldError`, `InputOTP*`, `Checkbox` compound, `Button` (`color` → `variant`). `validationState` → `isInvalid`. `addToast` → `toast.danger/warning/success`. Class renames: `primary*`→`accent*`, `content1`→`surface`, `divider`→`separator`, `default-{400-900}`→`muted`/`foreground`, warning numbered scales → `warning-soft*`. 388 kB CSS. |
| `112a4b3` | React Router 6 → 7 | Deps only; symbols used (`createBrowserRouter`, `RouterProvider`, `Navigate`, `Outlet`, `useLocation`, `useNavigate`, `useSearchParams`, `Link`) all signature-preserved. |
| `15349b9` | RTK 1 → 2 + react-redux 8 → 9 | Deps + `hooks/store.ts` migrated to v9 `useDispatch.withTypes() / useSelector.withTypes()` (replaces deprecated `TypedUseSelectorHook`). Slices unchanged. |
| `f88560e` | Validation enhancement | Wired zod schemas into react-aria native validation: `<Form validationBehavior="native">` + per-field `validate` callbacks calling `emailSchema.safeParse` / `passwordSchema.safeParse`. LoginForm: removed `toast.warning` for empty fields; inline `<FieldError>` instead. RegisterForm: dropped `react-hook-form` + `@hookform/resolvers` (RHF↔react-aria signature mismatch was silently swallowing errors); replaced with local React state + react-aria's `validate` props. Terms checkbox handled separately with explicit inline error. Bundle: -33 kB JS. |

## Verification (final state)
- `vite build` passes (388 kB CSS, ~934 kB JS).
- Dev server returns 200 on `/login`, `/login?tab=signup`, `/404`.
- **Zero page errors** across all routes and interactions.
- Functional smoke tests (Playwright):
  - LoginForm bad email → red border + "Enter a valid e-mail" inline; submit blocked.
  - RegisterForm empty submit → all 4 required fields red + "Please fill out this field."
  - RegisterForm bad data submit → 4 distinct zod messages render inline ("Full name required", "Enter a valid e-mail", "≥ 8 characters", "Passwords do not match").
  - RegisterForm valid data + Terms checked → submits, hits backend, server-side toast.
  - Sign In ↔ Create Account tab switch works (Redux-driven via `useAppSelector`/`useAppDispatch` v9 hooks).
  - Router renders 404 on unknown routes.

## Files of interest
- `/app/MIGRATION_MAP.md` — Phase 1 analysis (reference).
- `/app/heroui-migration/` — branch `migration`, 6 new commits.
- `src/features/auth/components/LoginForm.tsx` — react-aria native validation pattern.
- `src/features/auth/components/RegisterForm.tsx` — same pattern, no RHF.
- `src/features/auth/components/validation.ts` — single source of truth for zod schemas.

## Backlog (optional polish)
- Replace `framer-motion` → `motion` (HeroUI v3 dropped it internally; our 3 usages still work).
- Fix pre-existing undefined `bg-brand-*` classes in 404 / Unauthorized / ErrorBoundary / PermissionRoute (flagged in Phase 1).
- Re-enable strict TS in `tsconfig.app.json` (pre-existing `baseUrl` TS5101 deprecation blocks `tsc -b`).
- Migrate `react-router-dom` imports → `react-router` (RR7 idiom; functionally equivalent).
- Wire real Cognito env vars for production (stub `.env` only used during smoke tests, not committed).
- Remove unused `passwordsMatch` and `registerSchema` exports from `validation.ts` (RHF removal made them dead code).
