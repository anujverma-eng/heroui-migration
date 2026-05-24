# PRD — HeroUI Migration Analysis

## Original problem statement
Analyze repository `https://github.com/anujverma-eng/heroui-migration` (branch `migration`)
and produce a precise migration map for upgrading:
- React 18 → 19
- HeroUI v2 → v3
- Tailwind v3 → v4
- Redux Toolkit 1 → 2
- React Router 6 → 7

**Constraint:** DO NOT modify code. Analysis only.

Deliverables requested:
1. File-by-file dependency graph
2. List of all HeroUI v2 usages
3. List of Tailwind v3 patterns used
4. List of risky files (high coupling UI components)
5. Migration order recommendation
6. Estimated effort per file
+ (per user) breaking-changes summary per library

## User choices (gathered via ask_human)
- Clone repo into `/app` for analysis: yes
- Output format: single consolidated Markdown report
- Dependency graph depth: file-level + symbol-level (which exported symbols are used)
- Effort estimation unit: default (chose t-shirt sizes + hours)
- Include breaking-changes summary per library: yes

## Architecture / approach
- Read-only repo clone at `/app/heroui-migration` (branch `migration`)
- 45 source files in `src/` (~2,778 LOC) reviewed end-to-end
- Symbol-level import graph extracted via `grep`/`view_bulk`
- No code modified; no services started; no testing agent invoked (none required for analysis-only task)

## What's been implemented (2026-01)
- Cloned repo on branch `migration` at `/app/heroui-migration`
- Produced consolidated migration map at `/app/MIGRATION_MAP.md` covering:
  - Repo snapshot + installed-version table (incl. inconsistencies)
  - Section 1: File-by-file dependency graph (symbol-level) for entry/shell, store/hooks, routing/layout, auth feature, other pages, lib/constants/utils + reverse-dependency hotspots
  - Section 2: HeroUI v2 usages — imports table + per-component prop inventory + plugin usage + theme-token class inventory + confirmed-removed/renamed APIs (`validationState`, `heroui()` plugin)
  - Section 3: Tailwind v3 patterns — build pipeline (postcss, config, index.css), utility-class patterns, undefined `brand-*` references, v4 equivalents
  - Section 4: Risky files in 4 tiers (Tier-1: RegisterForm, LoginForm, AuthTabs, ConfirmBlock, tailwind.config.js)
  - Section 5: Migration order — Step 0 pre-flight → React 19 → RR 7 → RTK 2/RR 9 → Tailwind v4 → HeroUI v3 → cleanup
  - Section 6: Effort per file (t-shirt + hours) + per-library roll-up (~25–40 dev-hours total)
  - Section 7: Breaking-changes summary per library, scoped to APIs that actually appear in this repo
  - Section 8: Cross-cutting issues (case-sensitive `./footer` import, undefined `brand-*` colours, `tailwindcss@3` + `@tailwindcss/cli@4` mismatch, unused `@heroui/use-theme`, rules-of-hooks violation in `PermissionRoute`, empty `src/api/http.ts`)

## Backlog / next actions
- P0: None — analysis deliverable complete and accepted by user.
- P1 (future, if user proceeds to execution): Execute Step 0 pre-flight fixes (case-sensitive import, `brand-*` strategy, dep mismatch), then Step 1 React 19 bump.
- P2: Optional machine-readable artifacts (graph.json / usages.json / effort.csv) — user declined.

## Files
- `/app/MIGRATION_MAP.md` — single consolidated report (analysis output)
- `/app/heroui-migration/` — cloned repo (read-only, for reference)
