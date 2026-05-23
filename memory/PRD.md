# PRD — دُكانك (Dukkank)

## Original Problem Statement
موقع متجر اشتراكات وألعاب رقمية. التعديلات حسب الجلسات:

### Iteration 1 (مكتملة)
1. لوحة إدارة كاملة (Admin Panel) لإدارة المنتجات بدون كود.
2. دعم اللغة الإنجليزية (مع تبديل).

### Iteration 2 (مكتملة)
1. حذف اللغة الإنجليزية بالكامل (عربي فقط).
2. حذف حاسبة التوفير.
3. حذف بطاقات الشحن من Bundle Builder.
4. تحسين نموذج تعديل اللعبة (أوضح + معاينة مباشرة).
5. إضافة تبويب "ترتيب الأقسام" مع سحب/أرقام + إخفاء/إظهار لكل قسم.

## Architecture
- **Backend** — FastAPI + Motor (async MongoDB). JWT auth + bcrypt.
- **Frontend** — React (CRA) + Tailwind + shadcn/ui + react-router-dom v7. Arabic RTL only.
- **Data** — Products/Subscriptions/Bundles/Store/Sections in MongoDB; seeded on first startup; CRUD via admin panel.
- **Auth** — Bearer token (24h JWT) in `localStorage`. Admin seeded from `ADMIN_EMAIL`/`ADMIN_PASSWORD` env.
- **Checkout** — WhatsApp deep-link.

## User Personas
- **Admin** — full management at `/admin`.
- **Customer** — Arabic-only browsing + WhatsApp checkout.

## Implemented Features

### Backend
- ✅ Auth: login + me (JWT, bcrypt).
- ✅ Admin seeding from env (idempotent).
- ✅ Public reads: `/api/store`, `/api/subscriptions`, `/api/games`, `/api/bundles`, `/api/sections`.
- ✅ Admin CRUD on all entities + sections reorder/visibility.
- ✅ Seed of original products on first startup.

### Frontend
- ✅ Arabic-only UI (LanguageContext locked to ar).
- ✅ Homepage renders sections dynamically per `/api/sections` (order + visibility).
- ✅ DataContext fetches everything from API; falls back to static while loading.
- ✅ Admin Dashboard with 5 tabs: Store Settings, ترتيب الأقسام, Subscriptions, Games, Bundles.
- ✅ **Sections tab**: drag-and-drop + arrow buttons + visibility toggle, save/reset with dirty-state.
- ✅ **Games editor**: 3 numbered sections (Basic info, Pricing & Availability, Image & Look) + Live preview panel + hints under every field. Advanced colors hidden in `<details>`.
- ✅ Removed: Language toggle button, Savings Calculator section, BundleBuilder top-up cards.

### Tests
- ✅ Backend pytest: 22/22 (auth, public, admin CRUD, sections).
- ✅ Frontend E2E: language removal, section reorder/visibility persistence, games editor sections + preview.

## Test Credentials
`/app/memory/test_credentials.md` — admin@dukkank.com / omar512@@OoD

## Backlog
- P1: Image upload (replace URL input).
- P1: Validate sections payload contains all 9 known ids on PUT.
- P2: Audit log.
- P2: Multi-admin support.
- P3: Live social-proof ticker ("X اشترى للتو من جدة").

## Next Tasks
- Wait for user feedback / next change request.
