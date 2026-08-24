# Changelog

All notable changes to NexusBazaar are documented in this file.

---

## [1.3.0] - 2026-08-24

### Added
- Root MIT `LICENSE`, branded `public/favicon.svg`, hiring-manager README, and `SECURITY.md`.
- GitHub Actions CI (Vitest, `tsc`, Playwright) and Dependabot (patch/minor only).
- Pure helpers for cart/promo math (`src/lib/pricing.ts`) and role gates (`src/lib/rbac.ts`) with unit tests.
- Chromium smokes for storefront, cart, search, seller hub, admin, and B2B.
- Vercel `/api/gemini/chat` mock fallback so the public demo does not require a key.

### Changed
- Package name `ai-studio-applet` → `nexus-bazaar`. Vite binds port 3000.
- TypeScript config is Vite-native (`jsx: react-jsx`, tests excluded). `tsc --noEmit` is green.
- Concierge and `.env.example` no longer assume AI Studio secrets.

### Removed
- Unused template packages: Next.js, `eslint-config-next`, `firebase-tools`, Zustand, Recharts, CVA, Hookform.
- AI Studio leftovers: `metadata.json`, `loyalty/page.tsx`, `assets/.aistudio`.

---

## [1.2.0] - 2026-07-08
### Added
- README and CHANGELOG covering multi-role views.

### Changed
- B2B and Edge Lab copy moved from jargon to business language.

### Fixed
- Edge Lab JSX nesting that broke the Vite parser.

---

## [1.1.0] - 2026-07-01
### Added
- Multi-role layouts (Buyer, Seller, Admin, B2B, Edge Lab).
- Guilds, loyalty, and client-side search helpers.
