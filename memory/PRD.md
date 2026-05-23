# PRD — دُكانك (Dukkank)

## Original Problem Statement
موقع متجر اشتراكات وألعاب رقمية. الطلبات في هذه الجولة:
1. **لوحة إدارة (Admin Panel)** لإدارة المنتجات بدون تعديل الكود.
2. **دعم اللغة الإنجليزية** (عربي افتراضي + زر تبديل EN/AR).
3. ~~Google Analytics~~ (تم تجاهلها بناءً على طلب المستخدم).
4. ~~تحسينات تصميمية~~ (تم تجاهلها بناءً على طلب المستخدم).

## Architecture
- **Backend** — FastAPI + Motor (async MongoDB). JWT-based auth with bcrypt password hashing.
- **Frontend** — React (CRA) + Tailwind + shadcn/ui + react-router-dom v7.
- **Data** — Products/Subscriptions/Bundles/Store config all in MongoDB collections, seeded on first startup from `backend/initial_data.py`. Frontend fetches via `/api/store`, `/api/subscriptions`, `/api/games`, `/api/bundles` and falls back to static products.js while loading.
- **Auth** — Bearer token (24h JWT) in `localStorage` key `dukkank_admin_token`. Admin user seeded from `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars on startup; password auto-syncs if env changes.
- **Checkout** still WhatsApp deep-link via `wa.me/<whatsapp>?text=<order>`.

## User Personas
- **Admin (store owner)**: login at `/admin/login`, manages everything from `/admin`.
- **Customer**: browses, picks language (AR/EN), adds to cart, checks out via WhatsApp.

## Core Requirements (static)
- Browse subscriptions + games with PS4/PS5 pricing.
- Local cart, WhatsApp checkout.
- Arabic RTL by default, English LTR toggle.
- Admin can fully manage store settings, subscriptions, games, bundles.

## Implemented (2026-05-23)
### Backend (FastAPI + MongoDB)
- ✅ `POST /api/auth/login`, `GET /api/auth/me` (JWT HS256, 24h expiry, bcrypt)
- ✅ Admin seeding from env (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) — idempotent, updates hash if env changes.
- ✅ Public reads: `/api/store`, `/api/subscriptions`, `/api/games`, `/api/bundles`.
- ✅ Admin CRUD: `PUT /api/admin/store`; `POST/PUT/DELETE /api/admin/{subscriptions,games,bundles}/:id`.
- ✅ Initial seed migrates the original `products.js` content (1 store config, 2 subs, 22 games, 4 bundles).
- ✅ Unique indexes on `users.email`, `subscriptions.id`, `games.id`, `bundles.id`.

### Frontend
- ✅ **i18n**: `LanguageContext` (ar/en) + `translations.js` dictionary. Toggle button in Header. `<html dir>` updates dynamically.
- ✅ **DataContext** — replaces static imports across 10 files; loads from API, falls back to bundled static data while loading.
- ✅ **AuthContext** — Bearer-token auth; on mount validates token via `/auth/me`.
- ✅ **Admin pages**: `/admin/login` (form, error display) and `/admin` (Tabs: Store / Subscriptions / Games / Bundles).
- ✅ **Store Settings tab**: name (AR/EN), tagline (AR/EN), whatsapp number, instagram link.
- ✅ **Subscriptions tab**: edit each sub's name/tagline (AR/EN) + each duration's label + PS4/PS5 prices.
- ✅ **Games tab**: search, add new game (full editor), edit, quick toggle available, delete.
- ✅ **Bundles tab**: add/edit/delete bundles with dropdowns for sub/duration/game/tier.
- ✅ Translated UI strings: Header nav, Hero, Ticker, Section headers, Subscription/Game cards, Cart drawer, Footer, custom-game CTA.

## Backend Test Suite
- ✅ `/app/backend/tests/backend_test.py` — 18 pytest cases (auth, public, admin CRUD), 18/18 pass.

## Test Credentials
- `/app/memory/test_credentials.md` — admin@dukkank.com / omar512@@OoD

## Backlog — P1
- [ ] Add `data-testid` attributes to admin tab elements for E2E test reliability.
- [ ] Add image upload (instead of typing image URL) — would need file storage.
- [ ] Reorder games via drag-and-drop (currently order = insertion order).
- [ ] Translate the remaining Arabic-heavy sections (FAQ, Reviews, Recommender quiz, Bundle Builder content) to English.

## Backlog — P2
- [ ] Audit log (who changed what, when).
- [ ] Multi-admin support (currently a single seeded admin).
- [ ] PWA support.

## Next Tasks
1. Polish admin UI tags + add testids on action buttons.
2. Translate remaining sections (Reviews/FAQ/Recommender) fully to EN.
3. Deploy to Netlify (frontend) + a Python host (backend) when ready.
