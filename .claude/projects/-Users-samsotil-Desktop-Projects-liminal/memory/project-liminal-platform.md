---
name: project-liminal-platform
description: Liminal prosthetic rehabilitation platform — initial full build completed, key architecture decisions and file layout
metadata:
  type: project
---

Full Liminal platform built and passing build/typecheck as of 2026-05-29.

**Why:** User requested complete MVP build of a futuristic prosthetic rehabilitation platform with AR, bilingual (Hebrew RTL default / English LTR), three dashboard roles, and landing page with 3D hero character.

**How to apply:** Treat this as a working baseline. Future sessions should read existing files before modifying; do not regenerate what exists.

## Key architecture decisions

- **Next.js 16**: uses `proxy.ts` (not `middleware.ts`) and `params` is a `Promise` that must be awaited
- **next-intl v4**: config in `i18n/request.ts`, registered via `createNextIntlPlugin` in `next.config.ts`. Locales: `['he', 'en']`, default `'he'`, prefix `'always'`. Navigation helpers in `i18n/navigation.ts`.
- **RTL**: Root layout sets `dir="rtl"` (Hebrew default). `HtmlAttributes` client component updates dir/lang on locale switch. `[dir="rtl"]` CSS in globals.css switches fonts to Rubik.
- **Design tokens**: Teal primary at `oklch(0.62 0.19 195)`. No purple. White background. Custom `.glass`, `.glow-teal`, `.mesh-bg`, `.placeholder-card` utilities in globals.css.
- **Fonts**: Sora (headings LTR), DM Sans (body LTR), Rubik (Hebrew + RTL fallback). All via `next/font/google` in root layout.
- **3D character**: `HeroCharacter3D.tsx` uses `@react-three/fiber` Canvas + `Float` from drei. Dynamic import with `ssr: false` in `HeroSection.tsx`. Mesh refs typed as `THREE.Mesh<BufferGeometry, MeshBasicMaterial>`.
- **Framer Motion 12**: cubic-bezier ease arrays must be cast `as [number, number, number, number]` — plain `number[]` fails TypeScript.
- **Icon components**: Must type as `React.ComponentType<{ className?: string }>` not `React.ElementType` to pass className props without TS errors.

## File layout

All files at project root (not `src/`). Key paths:
- `app/layout.tsx` — root layout (fonts, html/body with RTL default)
- `app/[locale]/layout.tsx` — locale layout (NextIntlClientProvider + ThemeProvider)
- `app/[locale]/page.tsx` — landing page
- `app/[locale]/register/page.tsx` — registration flow
- `app/[locale]/dashboard/patient/page.tsx`
- `app/[locale]/dashboard/experience/page.tsx`
- `app/[locale]/dashboard/therapist/page.tsx`
- `components/landing/` — Navbar, LoginPanel, HeroSection, HeroCharacter3D, HologramPlatform, UploadCharacterModal, HowItWorks
- `components/registration/` — RoleSelector, PatientForm, TherapistForm, ExperienceForm
- `components/dashboard/` — Sidebar, TopBar, PatientOverview, LimbGrid, LimbPlaceholderCard, TrainingGoals, SessionHistory, ProgressChart, CalibrationZone, DigitalLayerDisplay, PatientTable, PatientFileView, ReportsPanel, RemotePlanBuilder
- `components/shared/` — ThemeProvider, HtmlAttributes, LanguageToggle
- `lib/mock-data.ts` — all mock data (patients, progress charts, limb models)
- `messages/he.json`, `messages/en.json` — translations
- `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`
- `proxy.ts` — next-intl locale routing middleware (Next.js 16 naming)
- `PRODUCT.md`, `DESIGN.md` — impeccable skill context files
