# Security Assessment — NexusBazaar

**Date:** 2026-08-24  
**Scope:** Auth, XSS, injection, CORS, secrets, payments, third-party APIs  
**Context:** Public deploy is a **client-side marketplace demo** at [https://nexusbazaar-market.vercel.app](https://nexusbazaar-market.vercel.app). Catalog, cart, orders, loyalty, and B2B ledgers live in `localStorage`. Gemini is optional and mocked when `GEMINI_API_KEY` is unset.

---

## Executive summary

| Area | Risk | Notes |
|------|------|--------|
| Authentication | **Demo-only (accepted)** | Header identity switcher writes `nexus_bazaar_active_user_id` to `localStorage`. Not JWT. Not NextAuth. |
| Authorization | **Demo-only** | Seller / admin chrome is a client-side role check. Anyone can pick Admin from the menu. |
| XSS | **Low** | No `dangerouslySetInnerHTML`. Product copy, reviews, and chat render as React text. |
| Injection (SQL) | **N/A** | No Prisma, no SQL. The “ledger” is JSON in `localStorage`. |
| Secrets in repo | **Hardened this pass** | `.env*` gitignored. `.env.example` has empty placeholders. AI Studio leftover env copy removed. |
| CORS | **N/A** | Same-origin Vite app + `/api/gemini/chat`. |
| Payments | **Simulated** | Card fields are UI only. No Stripe, no card vault, no charge. |
| Gemini | **Optional** | Missing key returns a canned concierge reply. Key stays server-side. |

**Overall (public Vercel demo):** Low residual risk for a public demo walkthrough. Do not treat this as a production marketplace.

---

## 1. Authentication & session

**Findings**
- Active user id is stored in `localStorage` (`nexus_bazaar_active_user_id`).
- Seeded identities: `usr_buyer`, `usr_seller`, `usr_admin`.
- There is no password, cookie, or signature. Switching the header avatar becomes that role.

**Verdict:** Do not claim NextAuth, JWT, OAuth, or bcrypt. This is a demo role switcher.

---

## 2. Authorization

Helpers in `src/lib/rbac.ts` document the intended checks and are unit-tested:

- Seller hub: `Seller` or `Admin`
- Admin panel: `Admin` only
- Banned users fall back to the first unbanned seed user

The UI hides seller/admin nav for buyers. That is **not** a server boundary.

---

## 3. XSS

- No `dangerouslySetInnerHTML`.
- User-authored strings (reviews, Q&A, chat) render as React text → default escaping.
- Product images load from Unsplash / picsum URLs.

---

## 4. Data store

`src/lib/db.ts` seeds users, products, reviews, Q&A, orders, and promo codes, then reads/writes `localStorage`.

- Local `vite`: state survives reloads on that browser.
- Vercel: each visitor has their own browser store. Nothing is shared. Clearing site data resets the demo.
- There is **no** Prisma client, **no** `DATABASE_URL`, **no** NextAuth.

---

## 5. Gemini proxy

| Path | Auth | Missing key |
|------|------|-------------|
| `POST /api/gemini/chat` (Vite middleware + Vercel function) | None | Canned NexusBot reply |

Do not put the key in `VITE_*` — it would leak to the browser. The public project should ship **without** `GEMINI_API_KEY`.

Prompt/history is clipped. Failures return the mock reply instead of a 500 that would break the drawer.

---

## 6. Payments

Checkout collects name, address, and a card number in the DOM, then writes an `Order` into `localStorage`. Nothing is POSTed to a processor.

Public promo codes (`NEXUS10`, `ELITEPRO`, `BIGSAVER`) are accepted residual risk for the demo. Cart math is unit-tested in `src/lib/pricing.ts`.

---

## 7. Secrets & supply chain

- Unused template packages removed this pass: `next`, `eslint-config-next`, `firebase-tools`, `zustand`, `recharts`, `@hookform/resolvers`, `class-variance-authority`.
- Dependabot: weekly npm + GitHub Actions, patch/minor only, majors ignored.

---

## Residual risk (accepted)

1. Anyone can become Admin from the header.
2. `localStorage` is world-writable in that browser — a visitor can edit their own cart/orders.
3. Public demo promo codes.
4. Optional Gemini route is unauthenticated; keep the key off the public project.
