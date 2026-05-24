# PRD — HeroUI Migration (Tailwind v4 + React 19 + HeroUI v3)

## Original problem statement
Analyze repository `https://github.com/anujverma-eng/heroui-migration` (branch `migration`)
and migrate it from:
- React 18 → 19
- HeroUI v2 → v3
- Tailwind v3 → v4
- (Redux Toolkit 1 → 2 — deferred)
- (React Router 6 → 7 — deferred)

## User choices (gathered via ask_human)
- Clone repo into `/app` for analysis: yes
- Output format: single consolidated Markdown report (Phase 1)
- Dependency graph: file-level + symbol-level
- Effort estimation unit: default (t-shirt + hours)
- Include breaking-changes summary per library: yes
- Tailwind migration: proceed (HeroUI v2 untouched during it)
- HeroUI migration: full migration "properly" — follow official v3 docs
- React 19: bumped as prerequisite for HeroUI v3
- Commit on existing `migration` branch

## Architecture / approach
- Read-only analysis first; then execution in 3 sequential commits on `migration` branch:
  1. Tailwind v3 → v4 (HeroUI v2 untouched)
  2. React 18 → 19 (prereq for HeroUI v3)
  3. HeroUI v2 → v3 (full swap, official v3 API)
- Each commit verified with `vite build` + dev-server smoke test + page-error check
- No backend / no testing-agent (read-only Vite/React project, not the FastAPI+React platform)

## What's been implemented

### 2026-01: Phase 1 — Analysis report
- `/app/MIGRATION_MAP.md` — file-by-file dependency graph, HeroUI v2 usages, Tailwind v3 patterns,
  risky files (4 tiers), migration order, effort per file (~25-40 dev-hours total), per-library
  breaking-changes summary, cross-cutting issues.

### 2026-01: Phase 2 — Execution (3 commits on `migration` branch)

#### Commit `bc85c4c` — feat(tailwind): migrate from v3 to v4
- Replaced `tailwindcss@3` + `autoprefixer` + `@tailwindcss/cli` with `tailwindcss@4` +
  `@tailwindcss/postcss`.
- Deleted `tailwind.config.js`; introduced `hero.js` + `@plugin './hero.js'` + `@source` in CSS
  (CSS-first per HeroUI v2 Tailwind-v4 compat guide).
- `src/index.css`: `@tailwind base/components/utilities` → `@import 'tailwindcss';`
  + `@custom-variant dark`.
- Renamed v4-renamed utilities to preserve visual identity:
  - `shadow-sm` → `shadow-xs` (Footer, LoginForm)
  - `backdrop-blur-sm` → `backdrop-blur-xs` (FullScreenLoader)
  - bare `backdrop-blur` → `backdrop-blur-sm` (8 occurrences)
- Pre-existing case-sensitivity bug fixed (`./footer` → `./Footer` in PublicLayout).
- Verified: build passes (246 kB CSS, vs 238 kB v3 baseline), dev server renders.

#### Commit `b40ba2d` — feat(react): bump React 18 → 19
- `react` `^18.3.1` → `^19.0.0`, `react-dom` likewise, `@types/react(-dom)` → `^19`.
- No source changes needed (no `defaultProps` / `propTypes` / string refs / `findDOMNode`).
- Verified: build passes, /login renders, zero runtime errors. Prereq for HeroUI v3.

#### Commit `a9b16a6` — feat(heroui): migrate v2 → v3 (full swap)
- Deps: `@heroui/react@2` + `@heroui/use-theme` + `@tailwindcss/vite` removed; added
  `@heroui/react@3` + `@heroui/styles`. `hero.js` deleted.
- CSS: `@plugin './hero.js' + @source` collapsed to a single `@import '@heroui/styles';`.
- Providers: `<HeroUIProvider>` removed; `<ToastProvider />` added for toast queue.
- Component rewrites (official v3 API):
  - `CircularProgress` → `Spinner` (`color="primary"` → `color="accent"`).
  - `Card`/`CardBody` → `Card`/`CardContent` (compound).
  - `Tabs` → compound (`Tabs > TabList > Tab` + `TabPanel`); slot `classNames` removed.
  - `Input` (label/placeholder/startContent/endContent/errorMessage/validationState) →
    `TextField` + `Label` + `InputGroup`{Prefix, Input, Suffix} + `FieldError` compound.
  - `InputOtp` → `InputOTP` + `InputOTPGroup` + `InputOTPSlot` (compound; `maxLength`/`onChange`).
  - `Checkbox` → compound (`CheckboxControl` + `CheckboxIndicator` + `CheckboxContent`);
    `validationState="invalid"` → `isInvalid` (×4 in RegisterForm); `onValueChange` → `onChange`.
  - `Link` → drops `color`, `size`, polymorphic `as={RouterLink}` (now wrap with RouterLink).
  - `Button` → drops `color`; `color="primary"` → `variant="primary"`; `variant="light"` →
    `variant="ghost"`.
  - `addToast({title,description,color})` → `toast.danger/warning/success(title, {description})`.
- Class renames (v3 token system, no numbered scales):
  - `bg/text-primary*` → `bg/text-accent` (+ `bg-accent-soft` for `primary/10` backgrounds)
  - `bg-content1` → `bg-surface`
  - `border/bg-divider` → `border/bg-separator`
  - `text-default-{400-600}` → `text-muted`; `text-default-{700,900}` → `text-foreground`
  - `bg-warning-{50,100}` → `bg-warning-soft`; `text-warning-{700,800}` → `text-warning-soft-foreground`;
    `border-warning-*` → `border-warning`; dark warning classes collapsed (soft auto-adapts).
- Verified: vite build passes (388 kB CSS), dev server renders /login & /login?tab=signup,
  form fields interactive (typing highlights, password toggle, checkbox), zero runtime errors.

## Files
- `/app/MIGRATION_MAP.md` — Phase 1 analysis report (still relevant as reference)
- `/app/heroui-migration/` — cloned repo, branch `migration`, 3 new commits on top

## Backlog / next actions
- P1 (deferred from original migration plan):
  - React Router 6 → 7 (12 source files; symbol-compatible, mostly package rename)
  - Redux Toolkit 1 → 2 + React-Redux 8 → 9 (5 files; API-compatible for the symbols used here)
- P2 polish (not requested):
  - Replace `framer-motion` with `motion` (rebranded successor) for parity with HeroUI v3 internals
  - Full visual regression pass against a v2 baseline (v3 has its own visual language)
  - Re-enable `tsconfig.app.json` strictness (pre-existing TS errors unrelated to migration)
  - Wire real Cognito env vars (a stub `.env` was used only for migration smoke tests)
