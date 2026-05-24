# Migration Map — `anujverma-eng/heroui-migration` (branch `migration`)

> Target upgrades:
> - **React 18 → 19**
> - **HeroUI v2 → v3**
> - **Tailwind v3 → v4**
> - **Redux Toolkit 1 → 2** (and React-Redux 8 → 9)
> - **React Router 6 → 7**
>
> This document is **analysis only**. No code has been modified.
> Source root analysed: `/app/heroui-migration/src` (45 source files, ~2,778 LOC).

---

## 0. Repository snapshot

```
src/
├── api/http.ts                                   (empty)
├── app/
│   ├── App.tsx
│   ├── providers.tsx
│   └── router.tsx
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx
│   │   ├── Footer.tsx
│   │   └── PublicLayout.tsx
│   ├── loaders/FullScreenLoader.tsx
│   ├── routing/{PermissionRoute,PrivateRoute,PublicOnlyRoute,index}.tsx|ts
│   └── ui/ErrorBoundary.tsx
├── constants/{env,index,permissions,routes}.ts
├── features/
│   ├── auth/
│   │   ├── authSlice.ts
│   │   ├── confirmationSlice.ts
│   │   ├── components/{AuthBootstrap,AuthTabs,ConfirmBlock,LoginForm,RegisterForm,validation}.tsx|ts
│   │   ├── pages/LoginRegisterPage.tsx
│   │   └── types.ts
│   ├── dashboard/pages/{DashboardHomePage,ProfilePage,SettingsPage,TeamPage}.tsx
│   └── onboarding/pages/OnboardingPage.tsx
├── hooks/store.ts
├── lib/
│   ├── auth/{cognitoClient,signUpMetadata}.ts
│   ├── crypto.ts
│   └── tokenManager.ts
├── pages/{NotFoundPage,UnauthorizedPage}.tsx
├── store/index.ts
├── types/index.ts
├── utils/{api,cn,index}.ts
├── index.css
├── main.tsx
└── vite-env.d.ts
```

### Installed versions (from `package.json` — verbatim)

| Package | Version |
|---|---|
| `react`, `react-dom` | `^18.3.1` |
| `@types/react`, `@types/react-dom` | `^18.3.28`, `^18.3.7` |
| `@heroui/react` | `^2.7.8` |
| `@heroui/use-theme` | `^2.1.6` |
| `@reduxjs/toolkit` | `^1.9.7` |
| `react-redux` | `^8.1.3` |
| `react-router-dom` | `^6.14.2` |
| `tailwindcss` (devDep) | `^3.4.19` |
| `@tailwindcss/cli` (dep) | `^4.3.0` ⚠️ already pinned to v4 but config still v3 |
| `autoprefixer` | `^10.5.0` |
| `postcss` | `^8.5.14` |
| `framer-motion` | `^12.38.0` |
| `@iconify/react` | `^6.0.2` |
| `clsx`, `tailwind-merge` | `^2.1.1`, `^3.6.0` |
| `vite` | `^8.0.10` |
| `typescript` | `~6.0.2` |

⚠️ **Inconsistency found**: `@tailwindcss/cli@^4.3.0` is in `dependencies` but `tailwindcss@^3.4.19` is the actual runtime. Build is currently driven by the v3 JS plugin pipeline (`postcss.config.js` → `tailwindcss` PostCSS plugin → `tailwind.config.js`).

---

## 1. File-by-File Dependency Graph

Format: `<file>` → external packages | internal imports (symbol-level where meaningful)

### Entry / Shell

| File | External imports | Internal imports |
|---|---|---|
| `src/main.tsx` | `react` (default), `react-dom/client` (`ReactDOM`) | `@/index.css`, `./app/App` (`App`) |
| `src/app/App.tsx` | `react-router-dom` (`RouterProvider`) | `@/features/auth/components/AuthBootstrap` (`AuthBootstrap`), `./providers` (`Providers`), `./router` (`router`) |
| `src/app/providers.tsx` | `react-redux` (`Provider as ReduxProvider`), `@heroui/react` (`HeroUIProvider`) | `@/store` (`store`) |
| `src/app/router.tsx` | `react-router-dom` (`createBrowserRouter`, `Navigate`) | `@/components/layout/DashboardLayout`, `@/components/layout/PublicLayout`, `@/components/routing` (`PermissionRoute`, `PrivateRoute`, `PublicOnlyRoute`), `@/constants` (`PERMISSIONS`, `ROUTES`), `@/features/auth/pages/LoginRegisterPage`, `@/features/dashboard/pages/{DashboardHomePage,ProfilePage,SettingsPage,TeamPage}`, `@/features/onboarding/pages/OnboardingPage`, `@/pages/NotFoundPage`, `@/pages/UnauthorizedPage` |
| `src/index.css` | Tailwind (`@tailwind base/components/utilities`) | — |

### Store & hooks

| File | External imports | Internal imports |
|---|---|---|
| `src/store/index.ts` | `@reduxjs/toolkit` (`configureStore`) | `@/features/auth/authSlice` (default reducer), `@/features/auth/confirmationSlice` (default reducer) |
| `src/hooks/store.ts` | `react-redux` (`TypedUseSelectorHook`, `useDispatch`, `useSelector`) | `@/store` (types `AppDispatch`, `RootState`) |

### Routing guards / layout

| File | External imports | Internal imports |
|---|---|---|
| `src/components/routing/index.ts` | — | re-exports `PublicOnlyRoute`, `PrivateRoute`, `PermissionRoute` |
| `src/components/routing/PrivateRoute.tsx` | `react-router-dom` (`Navigate`, `Outlet`, `useLocation`) | `@/features/auth/authSlice` (`selectAuthStatus`, `selectPendingConfirmation`), `@/hooks/store` (`useAppSelector`), `@/constants` (`ROUTES`), `../loaders/FullScreenLoader` |
| `src/components/routing/PublicOnlyRoute.tsx` | `react-router-dom` (`Navigate`, `Outlet`, `useLocation`) | `@/features/auth/authSlice`, `@/hooks/store`, `@/constants` |
| `src/components/routing/PermissionRoute.tsx` | `react-router-dom` (`Outlet`, `useLocation`) | `@/constants` (`ROUTE_PERMISSIONS`) |
| `src/components/layout/PublicLayout.tsx` | `react-router-dom` (`Outlet`, `useLocation`) | `./footer` (⚠️ case mismatch — file is `Footer.tsx`), `@/constants/routes` (`ROUTES`) |
| `src/components/layout/DashboardLayout.tsx` | `react-router-dom` (`Outlet`) | — |
| `src/components/layout/Footer.tsx` | `react` (default), `@heroui/react` (`Link`), `@iconify/react` (`Icon`) | — |
| `src/components/loaders/FullScreenLoader.tsx` | `@heroui/react` (`CircularProgress`), `framer-motion` (`motion`, `AnimatePresence`) | — |
| `src/components/ui/ErrorBoundary.tsx` | `react` (`Component`, `ErrorInfo`, `ReactNode`) | — |

### Auth feature

| File | External imports | Internal imports |
|---|---|---|
| `src/features/auth/authSlice.ts` | `@reduxjs/toolkit` (`createAsyncThunk`, `createSlice`, `PayloadAction`) | `./types`, `@/utils` (`getErrorMessage`), `@/lib/tokenManager`, `@/lib/auth/cognitoClient` (`* as cognitoClient`) |
| `src/features/auth/confirmationSlice.ts` | `@reduxjs/toolkit` (`createSlice`, `PayloadAction`, `createAsyncThunk`) | `@/lib/auth/cognitoClient`, `@/store` (`RootState`) |
| `src/features/auth/types.ts` | — | `@/types` (`OrgRole`) |
| `src/features/auth/components/validation.ts` | `zod` (`z`) | — |
| `src/features/auth/components/AuthBootstrap.tsx` | `react` (`useEffect`) | `@/hooks/store`, `../authSlice` (`initializeAuth`) |
| `src/features/auth/components/AuthTabs.tsx` | `@heroui/react` (`Card`, `CardBody`, `Tab`, `Tabs`), `framer-motion` (`motion`), `react-router-dom` (`useSearchParams`) | `./LoginForm`, `./RegisterForm` |
| `src/features/auth/components/ConfirmBlock.tsx` | `@heroui/react` (`Button`, `InputOtp`, `addToast`), `react` (default) | `@/hooks/store`, `@/features/auth/confirmationSlice` (`confirmCode`, `resendCode`, `tick`) |
| `src/features/auth/components/LoginForm.tsx` | `@heroui/react` (`addToast`, `Button`, `Input`, `Link`), `@iconify/react` (`Icon`), `react` (default), `react-router-dom` (`Link as RouterLink`, `useNavigate`, `useSearchParams`) | `@/hooks/store`, `@/features/auth/authSlice` (`login`), `@/features/auth/confirmationSlice` (`start`), `./ConfirmBlock` |
| `src/features/auth/components/RegisterForm.tsx` | `@heroui/react` (`addToast`, `Button`, `Checkbox`, `Input`, `Link`), `@hookform/resolvers/zod` (`zodResolver`), `@iconify/react` (`Icon`), `framer-motion` (`motion`), `react` (default), `react-hook-form` (`Controller`, `useForm`, types `Control`, `ControllerRenderProps`, `FieldPath`, `SubmitHandler`), `react-router-dom` (`useNavigate`, `useSearchParams`), `zod` (`z`) | `@/features/auth/authSlice` (`login`, `register`), `./validation` (`emailSchema`, `passwordSchema`), `@/features/auth/confirmationSlice` (`start`), `@/hooks/store`, `./ConfirmBlock` |
| `src/features/auth/pages/LoginRegisterPage.tsx` | `framer-motion` (`motion`) | `../components/AuthTabs` |

### Other pages

| File | External imports | Internal imports |
|---|---|---|
| `src/features/dashboard/pages/DashboardHomePage.tsx` | — | — |
| `src/features/dashboard/pages/ProfilePage.tsx` | — | — |
| `src/features/dashboard/pages/SettingsPage.tsx` | — | — |
| `src/features/dashboard/pages/TeamPage.tsx` | — | — |
| `src/features/onboarding/pages/OnboardingPage.tsx` | — | — |
| `src/pages/NotFoundPage.tsx` | `react-router-dom` (`Link`) | `@/constants` (`ROUTES`) |
| `src/pages/UnauthorizedPage.tsx` | `react-router-dom` (`Link`) | `@/constants` (`ROUTES`) |

### Lib / constants / utils

| File | External imports | Internal imports |
|---|---|---|
| `src/lib/auth/cognitoClient.ts` | `amazon-cognito-identity-js` (`CognitoUserPool`, `CognitoUser`, `AuthenticationDetails`, `CognitoUserSession`, `ISignUpResult`, `CognitoRefreshToken`, `CognitoUserAttribute`, `ICognitoUserAttributeData`) | `@/constants` (`ENV`), `./signUpMetadata` (`getSignupMetadata`) |
| `src/lib/auth/signUpMetadata.ts` | `ua-parser-js` (`UAParser`) | — |
| `src/lib/crypto.ts` | `crypto-js` (`CryptoJs`) | `@/constants` (`ENV`) |
| `src/lib/tokenManager.ts` | — | `./crypto` (`crypto`) |
| `src/constants/env.ts` | (Vite `import.meta.env`) | — |
| `src/constants/index.ts` | — | re-exports `./env`, `./routes`, `./permissions` |
| `src/constants/permissions.ts` | — | `./routes` (`ROUTES`) |
| `src/constants/routes.ts` | — | — |
| `src/types/index.ts` | — | — |
| `src/utils/cn.ts` | `clsx` (`ClassValue`, `clsx`), `tailwind-merge` (`twMerge`) | — |
| `src/utils/api.ts` | — | `@/types` (`ApiResponse`) |
| `src/utils/index.ts` | — | re-exports `./api`, `./cn` |
| `src/api/http.ts` | — | (empty file) |

### Reverse-dependency hot-spots (what imports each library)

- **`@heroui/react`** is imported by: `providers.tsx`, `Footer.tsx`, `FullScreenLoader.tsx`, `AuthTabs.tsx`, `ConfirmBlock.tsx`, `LoginForm.tsx`, `RegisterForm.tsx` (7 files), **plus** `tailwind.config.js` (consumes `heroui()` plugin).
- **`react-router-dom`** is imported by: `App.tsx`, `router.tsx`, `PrivateRoute.tsx`, `PublicOnlyRoute.tsx`, `PermissionRoute.tsx`, `DashboardLayout.tsx`, `PublicLayout.tsx`, `NotFoundPage.tsx`, `UnauthorizedPage.tsx`, `AuthTabs.tsx`, `LoginForm.tsx`, `RegisterForm.tsx` (12 files).
- **`@reduxjs/toolkit`** is imported by: `store/index.ts`, `authSlice.ts`, `confirmationSlice.ts` (3 files).
- **`react-redux`** is imported by: `providers.tsx`, `hooks/store.ts` (2 files).
- **`react` namespace / `react-dom`**: `main.tsx`, `providers.tsx`, `ErrorBoundary.tsx`, `ConfirmBlock.tsx`, `LoginForm.tsx`, `RegisterForm.tsx`, `Footer.tsx`, `AuthBootstrap.tsx`, `PermissionRoute.tsx` (9 files use `React.*` namespace style).

---

## 2. HeroUI v2 usages (every occurrence in code)

### 2.1 Imports from `@heroui/react`

| File | Imported symbols |
|---|---|
| `src/app/providers.tsx` | `HeroUIProvider` |
| `src/components/layout/Footer.tsx` | `Link` |
| `src/components/loaders/FullScreenLoader.tsx` | `CircularProgress` |
| `src/features/auth/components/AuthTabs.tsx` | `Card`, `CardBody`, `Tab`, `Tabs` |
| `src/features/auth/components/ConfirmBlock.tsx` | `Button`, `InputOtp`, `addToast` |
| `src/features/auth/components/LoginForm.tsx` | `addToast`, `Button`, `Input`, `Link` |
| `src/features/auth/components/RegisterForm.tsx` | `addToast`, `Button`, `Checkbox`, `Input`, `Link` |
| `tailwind.config.js` | `heroui` (plugin factory) |

> Note: `@heroui/use-theme` is declared in `package.json` but **not imported anywhere in `src/`**.

### 2.2 Component-level prop usage (verbatim from code)

#### `<HeroUIProvider>` — `providers.tsx`
- No props (default config).

#### `<CircularProgress>` — `FullScreenLoader.tsx`
- `size="lg"`, `color="primary"`, `className="w-16 h-16"`, `aria-label="Loading spinner"`.

#### `<Tabs>` / `<Tab>` — `AuthTabs.tsx`
- `<Tabs>`: `defaultSelectedKey={defaultTab}`, `aria-label`, `color="primary"`, `variant="underlined"`,
  `classNames={{ tabList, cursor, tab, tabContent }}` with selectors using
  `group-data-[selected=true]:text-primary-500`.
- `<Tab key="login" title={<div…>}>`, `<Tab key="signup" title={<div…>}>`.

#### `<Card>` / `<CardBody>` — `AuthTabs.tsx`
- `<Card className="w-full max-w-lg">`, `<CardBody className="gap-4">`.

#### `<Input>` — `LoginForm.tsx`, `RegisterForm.tsx`
- Props used: `type`, `name`, `label`, `placeholder`, `value`, `onValueChange`, `isRequired`,
  `autoComplete`, `variant="bordered"`, `startContent`, `endContent`,
  `classNames={{ inputWrapper: 'bg-background/60 backdrop-blur' }}`,
  **`validationState={'invalid' | undefined}`** (in `RegisterForm.tsx`),
  `errorMessage` (in `RegisterForm.tsx`).

#### `<Button>` — `LoginForm.tsx`, `RegisterForm.tsx`, `ConfirmBlock.tsx`
- Props used: `type`, `color="primary" | "danger"`, `size="sm" | "lg"`, `variant="light"`,
  `isLoading`, `isDisabled`, `onPress`, `className`.

#### `<Checkbox>` — `RegisterForm.tsx`
- `isSelected`, `onValueChange`, `validationState`, `aria-label`, `className="translate-y-[2pt]"`.

#### `<Link>` (HeroUI) — `Footer.tsx`, `LoginForm.tsx`, `RegisterForm.tsx`
- `Footer.tsx`: `href`, `target`, `rel`, `color="foreground"`, `aria-label`, `className`.
- `LoginForm.tsx`: `as={RouterLink}`, `to="/forgot-password"`, `color="primary"`, `size="sm"` (uses the polymorphic `as` prop bridging RR `<Link>`).
- `RegisterForm.tsx`: `as="a"`, `href`, `target`, `rel`, `color="primary"`, `onPointerDown`, `onClick`.

#### `<InputOtp>` — `ConfirmBlock.tsx`
- `length={6}`, `value`, `onValueChange`, `classNames={{ input, base }}`.

#### `addToast({...})` — `ConfirmBlock.tsx`, `LoginForm.tsx`, `RegisterForm.tsx`
- Shape: `{ title: string, description: string, color: 'danger' | 'warning' | 'success' }`.

### 2.3 HeroUI plugin usage in Tailwind config

`tailwind.config.js`:
```js
const { heroui } = require('@heroui/react');
plugins: [
  heroui({
    themes: {
      light: {
        colors: { background, foreground, primary: { 50…900, DEFAULT, foreground } }
      }
    }
  })
]
```
Plus content scan path `./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}`.

### 2.4 HeroUI design-token classes used in JSX/CSS (Tailwind-resolved by the `heroui` plugin)

These classes are **not native Tailwind utilities** — they exist only because HeroUI’s plugin
extends the theme:

- Semantic backgrounds/text: `bg-background`, `text-foreground`, `bg-content1`, `border-divider`
- Default greyscale: `text-default-400`, `text-default-500`, `text-default-600`, `text-default-900`, `text-default-700`(? — not present, confirm only 400/500/600/900 are used)
- Primary palette: `bg-primary`, `text-primary`, `bg-primary/10`, `bg-primary-500`, `text-primary-500`
- Warning palette: `bg-warning-100`, `bg-warning-50`, `bg-warning-900/30`, `bg-warning-900/10`, `border-warning-200`, `border-warning-200/70`, `border-warning-800/40`, `border-warning-800/30`, `text-warning-700`, `text-warning-800`, `text-warning-200`, `text-warning-300`
- HeroUI selectors via data-attributes: `group-data-[selected=true]:text-primary-500`

These bindings break the moment HeroUI v3 ships, because v3 ships its theme via **CSS variables / Tailwind v4 `@theme`**, not via a Tailwind JS plugin.

### 2.5 Confirmed-removed / renamed in v3 (must be addressed)

These are flagged because the v2 prop names appear literally in this codebase and are widely-reported breaking changes in HeroUI v3 (per HeroUI v3 release notes):

| v2 API in code | v3 status |
|---|---|
| `validationState={'invalid' \| undefined}` on `<Input>`, `<Checkbox>` | **Removed** — replaced by `isInvalid` boolean. |
| `onValueChange` on `<Input>`, `<InputOtp>`, `<Checkbox>` | Kept, behaviour unchanged. |
| `onPress` on `<Button>` | Kept (React-Aria). |
| `addToast` import path | Moved — toasts are now driven by `<ToastProvider>` + `addToast` exported from `@heroui/react` (still works) but provider must wrap the tree. |
| `HeroUIProvider` | Still exists; **no longer requires Tailwind JS plugin**, expects v4 CSS theme. |
| Tailwind plugin `heroui(...)` from `@heroui/react` | **Removed** — Tailwind v3 plugin API is no longer the integration mechanism. v3 uses `@plugin "@heroui/react"` (or equivalent) inside CSS. |
| `classNames` slot API on `Tabs`/`Input`/`InputOtp` | Slot names mostly preserved, but `cursor`/`tab`/`tabContent` slots on `Tabs` should be re-verified against the v3 component API before relying on them. |
| `variant="underlined"` on `<Tabs>` | Preserved in v3. |
| `as={RouterLink}` on `<Link>` | Polymorphic `as` is preserved. |

> ⚠️ This codebase relies on **slot-level `classNames`** for `Tabs`, `Input`, `Checkbox`, `InputOtp`. Each slot name **must** be re-verified per-component against v3 docs — this is the largest non-obvious risk.

---

## 3. Tailwind v3 patterns used

### 3.1 Build pipeline (v3 specific)

| Location | Pattern |
|---|---|
| `postcss.config.js` | `plugins: { tailwindcss: {}, autoprefixer: {} }` — v3 PostCSS plugin. |
| `tailwind.config.js` | JS config file (CommonJS `require` mixed with `export default`). |
| `src/index.css` line 1–3 | `@tailwind base; @tailwind components; @tailwind utilities;` |
| `src/index.css` line 6–16 | `@layer base { html {...}; body { @apply bg-background text-foreground; } }` |
| `tailwind.config.js` line 5–9 | `content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}']` |
| `tailwind.config.js` line 13 | `darkMode: 'class'` |
| `tailwind.config.js` line 2 | `const { heroui } = require('@heroui/react')` — JS plugin integration. |
| `tailwind.config.js` line 14–39 | `plugins: [heroui({ themes: { light: { colors: { background, foreground, primary: {...} } } } })]` |

### 3.2 Utility-class patterns (still valid in v4 but worth noting)

- Arbitrary values: `rounded-[32px]`, `rounded-[28px]`, `h-[2px]`, `translate-y-[2pt]`, `text-[length:…]`.
  - `translate-y-[2pt]` (RegisterForm L241) uses a CSS `pt` unit inside an arbitrary value — keep an eye on parsing.
- Opacity modifiers on colour utilities: `bg-background/80`, `bg-background/60`, `bg-white/80`, `bg-white/85`, `bg-black/30`, `bg-black/60`, `bg-warning-900/30`, `bg-warning-900/10`, `border-warning-200/70`, `border-warning-800/40`, `border-warning-800/30`, `bg-primary/10`.
- Group / data variants: `group-data-[selected=true]:text-primary-500` (AuthTabs L33).
- Dark-mode prefix: `dark:bg-black/30`, `dark:border-warning-800/40`, `dark:bg-warning-900/30`, `dark:bg-warning-900/10`, `dark:text-warning-300`, `dark:text-warning-200`, `dark:border-warning-800/30`.
- `backdrop-blur`, `backdrop-blur-sm`.

### 3.3 Undefined / broken colour references (already broken pre-migration)

`bg-brand-600`, `text-brand-600`, `hover:bg-brand-700` are used in **4 files** but the `brand` palette is **not** defined in `tailwind.config.js` (only `primary` is configured under the HeroUI plugin). These resolve to nothing today and should be addressed during the Tailwind v4 migration.

Affected files:
- `src/pages/NotFoundPage.tsx` (L11, L18, L19)
- `src/pages/UnauthorizedPage.tsx` (L15, L16)
- `src/components/ui/ErrorBoundary.tsx` (L50, L51)
- `src/components/routing/PermissionRoute.tsx` (L61, L62)

### 3.4 What changes in v4

| v3 pattern in this repo | v4 equivalent |
|---|---|
| `@tailwind base/components/utilities` in `index.css` | Single `@import "tailwindcss";` (the three layers are imported automatically). |
| `tailwind.config.js` with `content`, `theme.extend`, `plugins`, `darkMode: 'class'` | Either keep a JS config via `@config "./tailwind.config.js";` **or** migrate to CSS-first config using `@theme { ... }` and `@plugin "..."` in `index.css`. `darkMode: 'class'` becomes `@custom-variant dark (&:is(.dark *));`. |
| `postcss.config.js` with `tailwindcss: {}` | Replace with `@tailwindcss/postcss` (or use `@tailwindcss/vite`). `autoprefixer` becomes optional (vendoring is built-in). |
| `heroui()` Tailwind plugin | **Removed in HeroUI v3** — replaced by CSS-side `@plugin "@heroui/…"` and CSS variables. |
| `@apply bg-background text-foreground` inside `@layer base` | Still works in v4, but `bg-background`/`text-foreground` will now resolve via HeroUI v3’s CSS-variable theme, not the JS plugin. |

---

## 4. Risky files (high coupling to migrating libraries)

Risk score is qualitative: it combines (a) number of migrating libraries touched, (b) use of APIs that change in those libraries, and (c) downstream blast-radius.

### Tier 1 — Highest risk (touch 3+ migrating libs **and** use APIs known to break)

| File | Why it’s risky |
|---|---|
| `src/features/auth/components/RegisterForm.tsx` (380 LOC) | Uses HeroUI v2 `<Input>`, `<Button>`, `<Checkbox>`, `<Link as="a">`, **`validationState`** (removed in v3 → `isInvalid`), slot-level `classNames`, `errorMessage`. Also React 19 RHF integration (`Controller`, `useForm`), `react-router-dom` (`useNavigate`, `useSearchParams`), `framer-motion`. The only file using `validationState` on **two** components. Biggest single migration target. |
| `src/features/auth/components/LoginForm.tsx` (300 LOC) | HeroUI v2 `<Input>` (with slot `classNames`), `<Button>`, `<Link as={RouterLink}>` (polymorphic), `<Icon>`, `addToast`, `react-router-dom`. Polymorphic `<Link as={RouterLink}>` is sensitive to both HeroUI v3 and React Router 7 typings. |
| `src/features/auth/components/AuthTabs.tsx` (65 LOC) | `<Tabs>` slot-level `classNames` (`tabList`, `cursor`, `tab`, `tabContent`) + `group-data-[selected=true]` selector. Slot names must be reconfirmed in v3. Also `framer-motion` + `react-router-dom`. |
| `src/features/auth/components/ConfirmBlock.tsx` (97 LOC) | `<InputOtp>` (whose slot API tends to change), `addToast`, `<Button>`. Used by both Login and Register flows — fan-out high. |
| `tailwind.config.js` | Single hardest file: JS-plugin HeroUI theme **and** Tailwind v3 config syntax. Must be deleted or fully rewritten in CSS for v4 + HeroUI v3. |

### Tier 2 — High risk (touch HeroUI v2 OR a critical lib API)

| File | Why |
|---|---|
| `src/components/layout/Footer.tsx` (141 LOC) | HeroUI `<Link>` with `color="foreground"` and many instances; biggest single source of `<Link>` JSX. Also imports `react` default. |
| `src/components/loaders/FullScreenLoader.tsx` | `<CircularProgress>` usage; `framer-motion`. Rendered globally by `PrivateRoute`. |
| `src/app/providers.tsx` | `HeroUIProvider` + `react-redux` `Provider` — the **single point of contact** for both HeroUI v3 init and React-Redux 9. Any provider-shape change cascades everywhere. |
| `src/store/index.ts` | RTK 1 `configureStore` with custom `middleware` callback (`serializableCheck`) — needs to be re-verified against RTK 2 strict mode defaults. |
| `src/hooks/store.ts` | Uses `TypedUseSelectorHook` from `react-redux` 8. v9 recommends `useSelector.withTypes<RootState>()` (the deprecated type alias still exists). |
| `src/app/router.tsx` (121 LOC) | The single source of truth for routing — every RR 7 change ripples through here. |
| `src/index.css` | Replaces `@tailwind` directives; under v4 changes to `@import "tailwindcss";` plus HeroUI v3 CSS hooks. |
| `postcss.config.js` | Must swap `tailwindcss` plugin for `@tailwindcss/postcss` (or remove and use `@tailwindcss/vite`). |

### Tier 3 — Medium risk (one migrating lib, low coupling)

- `src/app/App.tsx` — only `react-router-dom.RouterProvider`.
- `src/components/routing/{PrivateRoute,PublicOnlyRoute,PermissionRoute}.tsx` — RR 7 hooks only.
- `src/components/layout/{PublicLayout,DashboardLayout}.tsx` — RR 7 `<Outlet>`; PublicLayout has a **case-mismatched import** `./footer` vs file `Footer.tsx` (latent bug exposed by case-sensitive CI).
- `src/features/auth/authSlice.ts`, `src/features/auth/confirmationSlice.ts` — RTK 2 should be source-compatible; double-check `serializableCheck.ignoredActions`/`ignoredPaths` shape.
- `src/pages/NotFoundPage.tsx`, `src/pages/UnauthorizedPage.tsx`, `src/components/ui/ErrorBoundary.tsx`, `src/components/routing/PermissionRoute.tsx` — Tailwind v4 + undefined `brand-*` classes.
- `src/main.tsx` — `ReactDOM.createRoot` still valid in React 19. Only the React types upgrade.

### Tier 4 — Low risk (rename / pin only)

`src/lib/**`, `src/constants/**`, `src/utils/**`, `src/types/**`, `src/features/auth/types.ts`, `src/features/auth/components/validation.ts`, `src/features/auth/components/AuthBootstrap.tsx`, `src/features/{dashboard,onboarding}/pages/*` (10-line stubs), `src/api/http.ts` (empty), `src/vite-env.d.ts`.

---

## 5. Migration order recommendation

Strict ordering (each step builds on the previous; do **not** parallelise across libraries unless noted).

### Step 0 — Pre-flight (must do before touching any code)
1. Delete `package-lock.json` mismatch suspicions; create a clean branch from `migration`.
2. Pin current versions (`yarn.lock`/`package-lock.json` snapshot) so you can diff.
3. Fix the latent `./footer` vs `Footer.tsx` import-case bug in `PublicLayout.tsx` **first** (it’s independent of every migration and will otherwise mask CI failures on case-sensitive runners).
4. Decide on `brand-*` resolution strategy (rename to `primary-*` or define `brand` palette). This is independent and can land before any library bump.

### Step 1 — React 18 → 19 (foundation)
- **Why first**: every other library (HeroUI v3, React Router 7, RTK 2 / RR 9) requires/officially supports React 19. Doing this first means subsequent bumps can target a single React version.
- **Touchpoints**: `package.json` (`react`, `react-dom`, `@types/react`, `@types/react-dom`), `main.tsx` (verify `createRoot`), `ErrorBoundary.tsx` (verify `ErrorInfo` typing), all files using `React.useState`/`useEffect` namespace style (they continue to work — no rewrite needed).
- **Validation**: build + run the app in StrictMode, exercise login/register/OTP flows.

### Step 2 — React Router 6 → 7
- **Why second**: RR 7 is largely a rename / package consolidation. Doing it before HeroUI v3 means HeroUI’s polymorphic `<Link as={RouterLink}>` only changes once.
- **Touchpoints** (12 files importing `react-router-dom`): `App.tsx`, `router.tsx`, `PrivateRoute.tsx`, `PublicOnlyRoute.tsx`, `PermissionRoute.tsx`, `DashboardLayout.tsx`, `PublicLayout.tsx`, `NotFoundPage.tsx`, `UnauthorizedPage.tsx`, `AuthTabs.tsx`, `LoginForm.tsx`, `RegisterForm.tsx`.
- **Concrete changes**: package install (`react-router` v7; `react-router-dom` is still re-exported as a compatibility shim), no source-level API changes needed for the symbols actually used in this repo (`createBrowserRouter`, `RouterProvider`, `Navigate`, `Outlet`, `useLocation`, `useNavigate`, `useSearchParams`, `Link`). Re-verify `Link as RouterLink` polymorphism.

### Step 3 — Redux Toolkit 1 → 2 (and React-Redux 8 → 9)
- **Why third**: independent of HeroUI/Tailwind. RTK 2 + RR 9 are a paired upgrade; both must move together.
- **Touchpoints**: `store/index.ts`, `authSlice.ts`, `confirmationSlice.ts`, `hooks/store.ts`, `providers.tsx`.
- **Concrete changes**:
  - `configureStore({ middleware: (gDM) => gDM({ serializableCheck: { ignoredActions, ignoredPaths } }) })` — call signature unchanged in RTK 2, but the returned tuple is type-narrowed; just re-typecheck.
  - `react-redux` 9 drops UMD and re-types `useSelector`/`useDispatch`. Update `hooks/store.ts` to either keep `TypedUseSelectorHook` (still available) or migrate to `useSelector.withTypes<RootState>()`.
  - `Provider` still works as `Provider as ReduxProvider`.

### Step 4 — Tailwind v3 → v4 (must precede HeroUI v3 because HeroUI v3 *requires* Tailwind v4)
- **Touchpoints**: `postcss.config.js`, `tailwind.config.js`, `src/index.css`, `package.json`.
- **Concrete changes**:
  - Install `tailwindcss@^4`, `@tailwindcss/postcss` (or `@tailwindcss/vite`). Reconcile the existing `@tailwindcss/cli@^4.3.0` dep.
  - Replace `postcss.config.js` plugin from `tailwindcss` → `@tailwindcss/postcss`.
  - Rewrite `src/index.css` line 1–3 to `@import "tailwindcss";`. Keep the `@layer base { html {…}; body { @apply bg-background text-foreground; } }` block.
  - `tailwind.config.js`: either keep as-is and reference it via `@config "./tailwind.config.js";` in `index.css` (lowest-touch path), or migrate to CSS-first `@theme` + `@custom-variant dark`.
  - At this point the `heroui()` plugin still exists in v2 form; you stay on HeroUI v2 until Step 5.
  - Resolve undefined `brand-*` classes (defer to renaming step if you started in Step 0).

### Step 5 — HeroUI v2 → v3 (biggest surface area; do last)
- **Touchpoints (8 files)**: `tailwind.config.js`, `providers.tsx`, `Footer.tsx`, `FullScreenLoader.tsx`, `AuthTabs.tsx`, `ConfirmBlock.tsx`, `LoginForm.tsx`, `RegisterForm.tsx`.
- **Concrete changes**:
  - Remove `heroui()` from `tailwind.config.js`; remove the `./node_modules/@heroui/theme/dist/**` content scan path.
  - Add HeroUI v3 CSS theme hook in `index.css` (`@plugin "@heroui/react"` or HeroUI’s prescribed `@source`/`@plugin` directive — exact directive must come from HeroUI v3 release notes; do not assume).
  - Replace `validationState={'invalid' | undefined}` with `isInvalid={true|false}` in:
    - `RegisterForm.tsx` — 4 occurrences (`fullName`, `email`, two `PasswordInput`, `Checkbox`).
  - Re-verify slot-level `classNames` for `Tabs` (`tabList`, `cursor`, `tab`, `tabContent`), `Input` (`inputWrapper`), `InputOtp` (`input`, `base`) against v3 component API — keep the unchanged ones; rename the ones that moved.
  - Ensure `addToast` consumers are wrapped by the HeroUI v3 toast provider (in `providers.tsx`).
  - Confirm polymorphic `<Link as={RouterLink}>` and `<Link as="a">` still work — both forms are present.
- **Validation**: visual regression on `LoginRegisterPage`, `Footer`, `FullScreenLoader`, OTP flow.

### Step 6 — Cleanup
- Delete `@heroui/use-theme` (unused).
- Reconcile `@tailwindcss/cli` dependency.
- Re-run ESLint / TypeScript with new types.

---

## 6. Estimated effort per file

Sizing scale (t-shirt → expected developer-hours, including review):

- **XS** ≈ 0–0.25 h (no code change or trivial rename)
- **S** ≈ 0.25–1 h
- **M** ≈ 1–3 h
- **L** ≈ 3–6 h
- **XL** ≈ 6–12 h (multi-library refactor)

| File | LOC | Affected by | Effort |
|---|---:|---|---|
| `package.json` | — | React 19, HeroUI v3, Tailwind v4, RTK 2, RR 7 | **L** (3–4 h: bump versions, install peer deps, reconcile `@tailwindcss/cli` + `tailwindcss` mismatch, install `@tailwindcss/postcss`, retest install/build). |
| `tailwind.config.js` | 40 | Tailwind v4, HeroUI v3 | **L** (3–5 h: drop `heroui()` plugin, drop `@heroui/theme` content scan, migrate `darkMode` to `@custom-variant`, decide CSS-first vs `@config` shim, port primary palette to `@theme` if going CSS-first). |
| `postcss.config.js` | 6 | Tailwind v4 | **S** (15 min: swap `tailwindcss` → `@tailwindcss/postcss`; keep/drop `autoprefixer`). |
| `src/index.css` | 16 | Tailwind v4, HeroUI v3 | **M** (1–2 h: replace `@tailwind` directives with `@import "tailwindcss"`, add HeroUI v3 CSS plugin/theme directives, retain `@layer base` block). |
| `src/main.tsx` | 10 | React 19 | **XS** (no code change; just verify `createRoot` + `StrictMode`). |
| `src/app/App.tsx` | 16 | RR 7 | **XS**. |
| `src/app/providers.tsx` | 15 | React 19, RTK 2 / RR 9, HeroUI v3 (ToastProvider) | **M** (1–2 h: confirm RR 9 `Provider` signature; add HeroUI v3 `<ToastProvider>` if required by v3 toast API; verify `HeroUIProvider` props). |
| `src/app/router.tsx` | 121 | RR 7 | **S** (0.5 h: package rename, no source-level API changes for symbols used). |
| `src/store/index.ts` | 21 | RTK 2 | **S** (0.5–1 h: re-typecheck the `middleware` callback under RTK 2). |
| `src/hooks/store.ts` | 8 | RR 9 | **S** (15–30 min: optionally migrate to `useSelector.withTypes<RootState>()`). |
| `src/components/routing/PrivateRoute.tsx` | 39 | RR 7 | **XS**. |
| `src/components/routing/PublicOnlyRoute.tsx` | 35 | RR 7 | **XS**. |
| `src/components/routing/PermissionRoute.tsx` | 69 | RR 7, Tailwind v4 (`brand-*`) | **S** (0.5 h: rename `brand-*` classes or define palette). |
| `src/components/routing/index.ts` | 3 | — | **XS**. |
| `src/components/layout/DashboardLayout.tsx` | 34 | RR 7, Tailwind v4 | **XS**. |
| `src/components/layout/PublicLayout.tsx` | 22 | RR 7 + **fix case-import `./footer`** | **S** (15–30 min, mainly the case fix). |
| `src/components/layout/Footer.tsx` | 141 | HeroUI v3 (`<Link>`), React 19 | **M** (1–2 h: re-verify HeroUI v3 `<Link>` props `color`, `target`, `rel`; visual diff). |
| `src/components/loaders/FullScreenLoader.tsx` | 43 | HeroUI v3 (`<CircularProgress>`), React 19, `framer-motion` | **S** (0.5–1 h: confirm v3 `CircularProgress` props `size`/`color`/`aria-label`). |
| `src/components/ui/ErrorBoundary.tsx` | 62 | React 19, Tailwind v4 (`brand-*`) | **S** (0.5 h: rename `brand-*`; verify `ErrorInfo` type). |
| `src/features/auth/authSlice.ts` | 403 | RTK 2 | **S** (0.5–1 h: typecheck; no API signature changes for `createAsyncThunk`/`createSlice`/`PayloadAction`). |
| `src/features/auth/confirmationSlice.ts` | 106 | RTK 2 | **S** (0.5 h: same). |
| `src/features/auth/types.ts` | 26 | — | **XS**. |
| `src/features/auth/components/validation.ts` | 32 | — (zod-only) | **XS**. |
| `src/features/auth/components/AuthBootstrap.tsx` | 23 | React 19, RR 9 | **XS** (effectless on UI; just retypes). |
| `src/features/auth/components/AuthTabs.tsx` | 65 | HeroUI v3 (`<Tabs>`/`<Tab>`/`<Card>`/`<CardBody>`, slot `classNames`), RR 7, `framer-motion` | **M** (2–3 h: re-verify Tabs slot names `tabList`/`cursor`/`tab`/`tabContent`; verify `group-data-[selected=true]` selector still resolves in v3 + Tailwind v4). |
| `src/features/auth/components/ConfirmBlock.tsx` | 97 | HeroUI v3 (`<InputOtp>`, `<Button>`, `addToast`), RR 9 | **M** (2–3 h: `InputOtp` slot API is the highest unknown; confirm `length`/`onValueChange` and slot names `input`/`base`). |
| `src/features/auth/components/LoginForm.tsx` | 300 | HeroUI v3 (`<Input>`, `<Button>`, `<Link as={RouterLink}>`, `addToast`), RR 7, React 19, `framer-motion` (indirect) | **L** (4–6 h: 2× `<Input>` with slot `classNames`, polymorphic `Link`, password-toggle pattern; full visual regression). |
| `src/features/auth/components/RegisterForm.tsx` | 380 | HeroUI v3 (`<Input>`, `<Button>`, `<Checkbox>`, `<Link as="a">`, `addToast`), **`validationState` → `isInvalid` x4**, RHF, RR 7 | **XL** (6–10 h: largest single rewrite — 4 fields with `validationState`, 2 password inputs with slot props, RHF `Controller` integration, full visual + interaction regression). |
| `src/features/auth/pages/LoginRegisterPage.tsx` | 37 | — (only `framer-motion`) | **XS**. |
| `src/features/dashboard/pages/DashboardHomePage.tsx` | 10 | Tailwind v4 | **XS**. |
| `src/features/dashboard/pages/ProfilePage.tsx` | 10 | Tailwind v4 | **XS**. |
| `src/features/dashboard/pages/SettingsPage.tsx` | 10 | Tailwind v4 | **XS**. |
| `src/features/dashboard/pages/TeamPage.tsx` | 10 | Tailwind v4 | **XS**. |
| `src/features/onboarding/pages/OnboardingPage.tsx` | 10 | Tailwind v4 | **XS**. |
| `src/pages/NotFoundPage.tsx` | 26 | RR 7, Tailwind v4 (`brand-*`) | **S** (15 min). |
| `src/pages/UnauthorizedPage.tsx` | 23 | RR 7, Tailwind v4 (`brand-*`) | **S** (15 min). |
| `src/lib/auth/cognitoClient.ts` | 290 | — | **XS** (no migrating-lib dependency). |
| `src/lib/auth/signUpMetadata.ts` | 45 | — | **XS**. |
| `src/lib/crypto.ts` | 19 | — | **XS**. |
| `src/lib/tokenManager.ts` | 55 | — | **XS**. |
| `src/constants/{env,index,permissions,routes}.ts` | 7+3+53+28 | — | **XS** each. |
| `src/types/index.ts` | 32 | — | **XS**. |
| `src/utils/{api,cn,index}.ts` | 14+6+2 | — | **XS** each. |
| `src/api/http.ts` | 0 | — | **XS** (empty). |
| `src/vite-env.d.ts` | 1 | — | **XS**. |

### Effort roll-up (per migration)

| Migration | Files touched | Total effort estimate |
|---|---:|---|
| **React 18 → 19** | ~6 (mostly tooling + type bumps) | **S–M** (2–4 h end-to-end) |
| **React Router 6 → 7** | 12 source + `package.json` | **S** (1–2 h; mostly package rename for the symbols this repo actually uses) |
| **Redux Toolkit 1 → 2 + React-Redux 8 → 9** | 5 source + `package.json` | **M** (2–4 h) |
| **Tailwind v3 → v4** | `tailwind.config.js`, `postcss.config.js`, `src/index.css`, `package.json` + `brand-*` rename across 4 files | **M–L** (4–6 h) |
| **HeroUI v2 → v3** | 7 source + `tailwind.config.js` + `index.css` + `providers.tsx` (ToastProvider) | **XL** (12–20 h, driven by `RegisterForm.tsx` + `LoginForm.tsx` + `AuthTabs.tsx` slot/`validationState` rework) |
| **Grand total (sequential, with overlap of test/QA cycles)** | — | **~25–40 developer-hours** (3–5 days for one developer including verification) |

---

## 7. Per-library breaking-changes summary (only items that actually touch this code)

### React 18 → 19
- **Used here & still safe**: `createRoot`, `<StrictMode>`, `React.useState`/`useEffect` namespace style, class components with `getDerivedStateFromError`/`componentDidCatch` (`ErrorBoundary.tsx`), `React.FormEvent`.
- **Not present in code → no action needed**: `defaultProps` on function components, `propTypes`, string refs, `findDOMNode`, legacy context.
- **Type-only changes that will affect TS**: `ReactNode` no longer includes `JSX.Element` implicitly via `bigint` — verify `Props.children: ReactNode` (used in `ErrorBoundary.tsx`, `providers.tsx`, `PermissionRoute.tsx`). Bump `@types/react` to 19.x.

### HeroUI v2 → v3
- `validationState` removed → `isInvalid: boolean`. **Found in `RegisterForm.tsx`** on `Input` x3 and `Checkbox` x1.
- Tailwind JS plugin `heroui()` removed → CSS-side `@plugin` / `@theme`. **Found in `tailwind.config.js`**.
- Theme tokens (`bg-background`, `text-foreground`, `text-default-*`, `bg-content1`, `border-divider`, `bg-primary/*`, `bg-warning-*`, `border-warning-*`, `text-warning-*`) now resolve through HeroUI v3’s CSS-variable theme. **Used across 9 files** (≈ 90 occurrences).
- Slot `classNames` API preserved but slot names may shift per component — re-verify on `Tabs`, `Input`, `InputOtp`, `Checkbox`.
- `addToast` requires a `<ToastProvider>` in v3 — **must be added to `providers.tsx`**.
- Polymorphic `as` on `<Link>` preserved — `Footer.tsx`, `LoginForm.tsx`, `RegisterForm.tsx`.

### Tailwind v3 → v4
- `@tailwind base/components/utilities` → `@import "tailwindcss";`. **`src/index.css` L1–3**.
- `tailwind.config.js` becomes optional (CSS-first); if kept, reference via `@config`. **`tailwind.config.js`**.
- PostCSS plugin renamed `tailwindcss` → `@tailwindcss/postcss`. **`postcss.config.js`**.
- `darkMode: 'class'` → `@custom-variant dark (&:is(.dark *));`. **`tailwind.config.js` L13**.
- `content` glob → `@source` directives (or rely on automatic detection). **`tailwind.config.js` L5–9** (including `./node_modules/@heroui/theme/dist/**` which goes away with HeroUI v3).
- Arbitrary value syntax (`rounded-[32px]`, `translate-y-[2pt]`) preserved.
- Opacity modifiers (`bg-background/80`, etc.) preserved.
- Group/data variants (`group-data-[selected=true]:…`) preserved.

### Redux Toolkit 1 → 2 + React-Redux 8 → 9
- `configureStore` API used here (with `middleware: (gDM) => gDM({serializableCheck: {...}})`) is preserved in RTK 2.
- `createAsyncThunk`, `createSlice`, `PayloadAction` — preserved.
- `import.meta.env.DEV` — preserved.
- `TypedUseSelectorHook` from `react-redux` — still exported in v9 (deprecated in favour of `useSelector.withTypes<RootState>()`).
- React-Redux 9 requires React 18+ (compatible with the React 19 bump done in Step 1) and drops UMD builds.
- `Provider` import shape — unchanged.

### React Router 6 → 7
- Package name: `react-router-dom` still re-exports for back-compat in v7; main package is `react-router`.
- Symbols used here are all preserved with identical signatures: `createBrowserRouter`, `RouterProvider`, `Navigate`, `Outlet`, `useLocation`, `useNavigate`, `useSearchParams`, `Link`.
- Route-object shape (`{ path, element, children, index }`) preserved.
- `state` prop on `<Navigate state={{ from: location }}>` preserved.
- Re-verify the polymorphic `as={RouterLink}` bridge in `LoginForm.tsx`.

---

## 8. Cross-cutting issues found during analysis (independent of migration but worth flagging)

1. **Case-sensitive import bug**: `src/components/layout/PublicLayout.tsx` line 2 imports from `'./footer'`, but the file on disk is `Footer.tsx`. This breaks on case-sensitive filesystems (Linux CI, Docker).
2. **Undefined Tailwind colour**: `brand-600` / `brand-700` referenced in 4 files but never defined in `tailwind.config.js`. Currently a silent no-op.
3. **Dependency mismatch**: `tailwindcss@^3.4.19` (devDep) coexists with `@tailwindcss/cli@^4.3.0` (dep). Resolve during the Tailwind migration.
4. **Unused dependency**: `@heroui/use-theme` is declared in `package.json` but never imported in `src/`. Safe to remove.
5. **React Hooks rule violated**: `src/components/routing/PermissionRoute.tsx` L37–39 calls `useHasPermission` inside `.every(...)` (already suppressed with an `eslint-disable`). Unrelated to migrations but flagged for visibility.
6. **`src/api/http.ts`** is an empty file. Either populate or remove.

---

*End of migration map.*
