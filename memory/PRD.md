# PRD — دُكانك (Dakanak)

## Original Problem Statement
عميل عنده متجر على إنستغرام يريد موقع إلكتروني لعرض المنتجات والأسعار بدون بوابة دفع — عند الضغط على زر الدفع، يتم تحويل العميل إلى واتساب مع تفاصيل طلبه. النشر على Netlify (drag & drop). اسم المتجر: دُكانك. واتساب: 0775585112 (الأردن). يبيع اشتراكات PS Plus (Essential / Extra) وألعاب PS4/PS5. الأسعار المعطاة + 10$ على كل سعر.

## Architecture
- **Frontend only** — React (CRA) + Tailwind + shadcn/ui + lucide-react + sonner.
- **No backend / database** — منتجات ثابتة في `frontend/src/data/products.js`.
- **Cart** محفوظة في LocalStorage.
- **Checkout** عبر `https://wa.me/962775585112?text=…`.
- **Deploy target**: Netlify static (folder `frontend/build`).

## User Personas
- **مالك المتجر**: يدير المنتجات بتعديل ملف `products.js` فقط.
- **العميل**: يتصفح، يضيف للسلة، يبعت الطلب على واتساب.

## Core Requirements (static)
- عرض جميع المنتجات بأسعار شفافة (السعر شامل +10$).
- اختيار PS4/PS5 ومدة الاشتراك.
- سلة بقابلية زيادة/نقصان/حذف.
- زر دفع → فتح واتساب مع رسالة طلب جاهزة.
- تصميم RTL عربي بالكامل، مستوحى من شعار الكوفية.

## Implemented (2026-02-25)
- ✅ هيكلة الـ React app كاملة (App.js + 7 components + context + lib).
- ✅ Header مع شعار + ناف + عداد سلة.
- ✅ Hero مع شعار + CTAs.
- ✅ Ticker متحرك للضمانات.
- ✅ قسم Essential وExtra مع بطاقات اختيار PS4/PS5 ومدة الاشتراك.
- ✅ قسم الألعاب مع 8 ألعاب وغلاف متدرج لكل واحدة.
- ✅ Cart Drawer (Sheet) مع تحكم بالكميات وزر Checkout يفتح واتساب.
- ✅ Floating WhatsApp button + Footer كامل بمعلومات التواصل.
- ✅ Toast notifications عند الإضافة للسلة.
- ✅ ملف `netlify.toml` جاهز للنشر.
- ✅ خط Cairo (للعناوين) + Tajawal (للنص) — يعرض العربية بشكل ممتاز.
- ✅ ثيم مستوحى من ألوان الشعار: أزرق فولاذي + أحمر القماش + كريمي.

## Backlog — P1 (suggested)
- [ ] قسم "أحدث الإضافات" / "الأكثر طلباً" بشارة بصرية.
- [ ] بحث/فلترة في قسم الألعاب لما يكبر الكتالوج.
- [ ] دعم لغة إنجليزية (toggle).
- [ ] لوحة إدارة بسيطة (admin panel) لإضافة/تعديل المنتجات بدون تعديل الكود.
- [ ] تحليلات بسيطة (Google Analytics / Plausible).

## Backlog — P2
- [ ] صفحة تفاصيل لكل لعبة (سكرين شوت + وصف موسّع).
- [ ] قسم آراء العملاء (Testimonials).
- [ ] دومين مخصص + شعار في tab + Open Graph image.
- [ ] PWA + قابلية التثبيت على الجوال.

## Implemented (2026-05-19 — Catalog Refactor + New Games)
- ✅ حذف شارة "Made with Emergent" من أسفل الموقع (`public/index.html`).
- ✅ إعادة هيكلة `frontend/src/data/products.js` بشكل شامل مع كومنتات عربية واضحة:
  - قسم STORE (رقم واتساب + اسم المتجر + إنستغرام) في الأعلى مع شرح.
  - قسم SUBSCRIPTIONS مع تنسيق أعمدة مرتب.
  - قسم GAMES مع شرح كل حقل (four/five/available).
- ✅ إضافة حقل `available: true/false` لكل لعبة.
  - عند `available: false` تظهر شارة حمراء "غير متوفرة حالياً" فوق صورة اللعبة + يتعطل زر الإضافة + يتغير السعر إلى "غير متوفرة".
  - منطق الـ disable مطبّق في `GameCard.jsx` عبر `canBuy = isAvailable && hasPrice`.
- ✅ إضافة ٩ ألعاب جديدة: Arc Raiders، Ghost of Tsushima (Arabic)، The Crew Motorfest، TLOU 1 Remastered، Elden Ring، RE 8 Village، RE 7 Biohazard، NBA 2K26 Slam Edition، Horizon Forbidden West.
- ✅ تحميل أغلفة جميع الألعاب الجديدة من Steam CDN + Wikipedia (Arc Raiders + NBA 2K26 + Crew Motorfest استخدمنا fallback gradient لعدم توفر صورة موثوقة).
- ✅ كل أسعار الألعاب الجديدة تبدأ كـ `null` (تظهر شارة "السعر قريباً") لينضبطها المستخدم لاحقاً بسهولة.

## How to Edit (للمستخدم)
كل التعديلات في ملف واحد: `frontend/src/data/products.js`
- **تغيير رقم الواتساب** → بدّل قيمة `whatsapp` و `whatsappDisplay` في قسم STORE.
- **تغيير سعر لعبة** → عدّل قيمة `four:` أو `five:` (السعر بالدولار).
- **تعطيل لعبة مؤقتاً** → غيّر `available: true` إلى `available: false`.
- **حفظ الملف** → الموقع يتحدّث تلقائياً.

## Next Tasks
1. تزويد المستخدم بأسعار الألعاب الجديدة عند توفرها.
2. (اختياري) رفع صور بديلة لـ Arc Raiders + NBA 2K26 + The Crew Motorfest.
3. النشر على Netlify (تعليمات في `README.md`).
