# تقرير مراجعة Arees Loop — 9 أكتوبر 2026

المستودع: `arees-loop/arees-loop-platform`، فرع المراجعة: `ci/license-review-validation`.
لم يُنفّذ دمج أو نشر Vercel، ولم تُمس قاعدة بيانات الإنتاج أو إعداداته.

## الإصلاحات

- معالجة أخطاء ESLint المتعلقة بـ any وReact effects ونقاء العرض، وإضافة أنواع Google Maps والاستجابة وعضوية الشريك. نقل cart/progress إلى useSyncExternalStore وإحاطة useSearchParams بـ Suspense.
- إصلاح حفظ خدمات الشريك بإرسال licenseId والدولة والمنطقة ونقاط الولاء، وإضافة اختيار الترخيص.
- فرض الصلاحيات التفصيلية على واجهات مراجعة الشركاء والتراخيص والمرشدين والخدمات والمكافآت، وحصر تشخيص قاعدة البيانات بالمشرف الأعلى. منع جلسات المشرف غير النشط.
- رفض العضويات LEGACY غير المصنفة افتراضياً، مع إبقاء التفويض الصريح للمدير والموظف. لا يُستنتج المالك من دور المستخدم العام؛ يوجد مسار تحقق مالك مسجل بالتدقيق للمشرف الأعلى.
- تجديد ترخيص الشريك يتطلب شريكاً نشطاً وترخيصاً VERIFIED أو EXPIRED، وتاريخاً صالحاً يمتد بعد السابق. لا يعيد التجديد تفعيل SUSPENDED أو REJECTED. تغيير الحالة والتاريخ والتدقيق داخل معاملة وتحديثات مشروطة للحماية من التعارض.
- تجديد المرشد يتطلب ملفاً APPROVED وتمديداً حقيقياً، مع إعادة التحقق عند التحديث. توحيد صلاحية يوم الانتهاء وفق UTC في صفحات المرشد وتقديم الطلب.
- توحيد أهلية الخدمات العامة والنشر والحجز: خدمة منشورة، شريك نشط، ترخيص معتمد غير منتهٍ. إعادة التحقق لحظة اعتماد النشر.
- تنقية HTML عند حفظ وقراءة الخدمات القديمة، والهروب من HTML في البريد. رفض الأسعار غير المنتهية والنقاط غير الصحيحة.
- فحص تواقيع PDF/PNG/JPEG/WEBP وحجم الملفات. تقييد تحميل صور الخدمات بالصلاحية، ومنع عرض الصور الخاصة بخدمات غير منشورة أو غير مؤهلة للعامة. تنظيف ملفات طلب المرشد عند فشل التخزين/الحفظ.
- إضافة 76 اختباراً لوحدات الأمان وواجهات API، و4 اختبارات PostgreSQL مستقلة للفهارس الجزئية والتاريخ والتزامن. الاختبارات الوحدوية تستخدم mocks للجلسة/Prisma/البريد/Blob؛ لا تمثل اختباراً شاملاً للموفرات الخارجية.
- إضافة فحص اختلاف مخطط Prisma بعد تطبيق الترحيلات. كشف نقصاً سابقاً في ترحيلات Coupon وCouponRedemption وPartnerChangeRequest وحقلي User وصنف ADMIN_INVITATION. أضيف ترحيل للمطابقة دون حذف صفوف، مع إزالة default قديم من NavigationVisibility.updatedAt لمطابقة Prisma.

- تحديث Next.js من 16.3.4 إلى 16.3.8 وeslint-config-next إلى 16.4.0، وتصحيح brace-expansion وfast-uri، وتثبيت mysql2 المتعدي على 3.24.5 عبر override. انخفض npm audit من 13 تنبيهاً (1 حرج، 11 مرتفعاً، 1 متوسط) إلى 8 مرتفعة، دون حرجة أو متوسطة.

## نتائج التحقق

دفعة الكود الأخيرة: [d990cc72](https://github.com/arees-loop/arees-loop-platform/commit/d990cc72ebf3ea9b0714968baca3fc12489ce88c). الفحوص المحلية: 76/76 ناجحة، TypeScript ناجح، ESLint صفر أخطاء و71 تحذيراً، وbuild ناجح على Next.js 16.3.8. تطبيق سلسلة الترحيلات على قاعدة مؤقتة ناجح، وPrisma migrate diff: No difference detected. [تشغيل CI النهائي للكود](https://github.com/arees-loop/arees-loop-platform/actions/runs/37997424931) هو المرجع للفحوص الكاملة على PostgreSQL 16. التشغيل السابق [37996885871](https://github.com/arees-loop/arees-loop-platform/actions/runs/37996885871) نجح في كامل الفحوص: الترحيلات، 76 اختباراً، 4 اختبارات PostgreSQL 16، TypeScript وESLint والبناء. اكتشف التشغيل [37997028703](https://github.com/arees-loop/arees-loop-platform/actions/runs/37997028703) اختلاف المخطط عند إضافة فحصه؛ لم يُخفَ هذا الفشل.

البناء المحلي الأصلي نجح بتوليد 136 صفحة. ESLint: صفر أخطاء و71 تحذيراً، أغلبها متغيرات غير مستخدمة وعناصر img والتنقل المباشر وتحذير dependencies. TypeScript والاختبارات الوحدوية نجحت محلياً. قاعدة PostgreSQL المدمجة المحلية تعثرت في اختبارات المعاملات؛ نتائج PostgreSQL 16 الحقيقية في Actions هي المرجع، ولا تُحسب التجربة المحلية نجاحاً.

## ما يلزم قبل الإنتاج

1. فحص حالة الإنتاج وسجل الترحيلات على نسخة آمنة: قد تكون بعض العناصر المضافة موجودة سابقاً عبر db push أو SQL يدوي. لا يجوز تطبيق الترحيل الجديد تلقائياً قبل مطابقة السجل والمخطط والنسخ الاحتياطي وموافقة المالك.
2. تصنيف أعضاء LEGACY والتحقق من الملكية ومنح صلاحيات المشرفين صراحة. العضويات الجديدة/القديمة التي لا تحمل تصنيفاً ستُمنع من القدرات الحساسة؛ هذا تغيير مقصود يجب اختباره على بيانات staging.
3. تنفيذ تجربة كاملة على staging لرفع المستندات الخاصة، البريد، Google Maps، القرار الإداري، انقضاء الترخيص ثم التجديد. لا تشمل الاختبارات اتصالاً حقيقياً بهذه الموفرات.
4. لم يظهر مسار API متكامل لإنشاء الحجز والدفع في الشجرة المفحوصة؛ توجد واجهات وبيانات تجريبية. يجب أن يستخدم أي checkout لاحق شرط الأهلية داخل المعاملة. لا تُعد هذه المراجعة إثباتاً لجاهزية دورة الدفع.
5. Cron يدعم حتى 100 صفحة ×100 سجل لكل نوع ضمن مهلة مشتركة 35 ثانية، لكنه يستخدم upserts متتابعة ويعيد البدء من أول السجلات عند الإعادة. يلزم اختبار حجم فعلي وآلية متابعة قبل التوسع؛ قد تحرم الأحجام الكبيرة سجلات متأخرة من التنبيه. التنبيهات داخليّة، وليست بريد/SMS من cron.
6. طلبات التجديد تحفظ معرّفات الملكية كسلاسل دون علاقات FK في Prisma؛ اختبارات التزامن تثبت قيود الطلب المعلق، ولا تثبت سلامة كل البيانات التاريخية أو كل السباقات بين العضوية والقرارات.
7. بعض الخطوط لها OFL/ترخيص مرفق؛ لا تظهر ملفات إثبات ترخيص مستقلة لـ din-next-arabic-regular.ttf وkhebrat-musamim.ttf. يلزم إثبات حق استخدامها أو استبدالها قبل النشر التجاري؛ لم يُصدر حكم قانوني.
8. npm audit لا يزال يسجل 8 تنبيهات HIGH عبر سلسلتين أصليتين: braces في أدوات ESLint/glob، وdeepmerge-ts في @prisma/config. لا يوجد إصدار braces تصحيحي في السلسلة الحالية بحسب فحص npm؛ اقتراح audit الرجوع إلى eslint-config-next 14.2.35 أو Prisma 6.19.3 يغيّر الإصدارات الرئيسية ويكسر افتراضات المشروع. لم يُطبّق --force أو تجاوز deepmerge-ts إلى الإصدار الرئيسي 8 دون تقييم توافقه. أغلب السياق أدوات بناء/إعداد، لكن Prisma CLI مدرج dependencies؛ لا يُدّعى أن الخطر معدوم. يلزم حل أو قبول مخاطر موثق قبل الإنتاج.
9. معالجة تحذيرات ESLint المتبقية وتحسين القراءة/التنسيق في الملفات الكثيفة مهمة لاحقة، دون أخطاء مانعة للفحص.

## تقييم الجاهزية

الإصلاحات مناسبة للمراجعة وتجربة staging بعد نجاح آخر CI. لا يوصى بالنشر الإنتاجي قبل مطابقة الترحيلات، تصنيف العضويات، واختبار التكامل الحقيقي. لا يُفهم نجاح build أو الاختبارات على أنه تفويض للنشر أو تطبيق الترحيل على الإنتاج.

## الملفات المعدلة

- `docs/CI_LICENSE_REVIEW_REPORT_AR.md`
- `docs/PRE_DEPLOY_LICENSE_REVIEW.md`

- `.github/workflows/validate.yml`
- `app/admin/invite/page.tsx`
- `app/admin/services/page.tsx`
- `app/api/admin/guide-license-renewals/document/route.ts`
- `app/api/admin/guide-license-renewals/route.ts`
- `app/api/admin/guides/document/route.ts`
- `app/api/admin/guides/route.ts`
- `app/api/admin/license-renewal-queue/route.ts`
- `app/api/admin/license-renewals/document/route.ts`
- `app/api/admin/license-renewals/route.ts`
- `app/api/admin/partners/[id]/decision/route.ts`
- `app/api/admin/partners/route.ts`
- `app/api/admin/rewards/route.ts`
- `app/api/admin/services/[id]/decision/route.ts`
- `app/api/admin/services/route.ts`
- `app/api/diagnostics/loyalty-db/route.ts`
- `app/api/guides/apply/route.ts`
- `app/api/guides/license-renewals/route.ts`
- `app/api/media/route.ts`
- `app/api/partner/license-renewals/route.ts`
- `app/api/partner/operations/route.ts`
- `app/api/partner/portal/route.ts`
- `app/api/partner/services/[id]/route.ts`
- `app/api/partner/services/images/route.ts`
- `app/api/partner/services/route.ts`
- `app/api/services/route.ts`
- `app/cart/page.tsx`
- `app/components/GlobalHeader.tsx`
- `app/discover/page.tsx`
- `app/guides/[id]/page.tsx`
- `app/guides/license-renewals/page.tsx`
- `app/map-test/page.tsx`
- `app/onboarding/page.tsx`
- `app/partner/_components/PartnerDataPage.tsx`
- `app/partner/_components/TeamInvitations.tsx`
- `app/partner/_components/TeamRoleHistory.tsx`
- `app/partner/bookings/[id]/page.tsx`
- `app/partner/coupons/page.tsx`
- `app/partner/loyalty/page.tsx`
- `app/partner/services/new/page.tsx`
- `app/partner/services/page.tsx`
- `app/rewards/page.tsx`
- `eslint.config.mjs`
- `lib/admin-permissions.ts`
- `lib/browser-storage.ts`
- `lib/license-document.ts`
- `lib/license-validity.ts`
- `lib/loop-progress.ts`
- `lib/partner-permissions.ts`
- `lib/service-html.ts`
- `lib/services/bookability.ts`
- `lib/services/eligibility.ts`
- `lib/session.ts`
- `package-lock.json`
- `package.json`
- `prisma/migrations/20261010003000_align_existing_feature_schema/migration.sql`
- `tests/api-authorization.test.mjs`
- `tests/integration/database.test.mjs`
- `tests/register.mjs`
- `tests/security.test.mjs`

## Commits

- [4babc12b — إصلاحات الواجهة والفحص](https://github.com/arees-loop/arees-loop-platform/commit/4babc12be7b405d714ffa7875e6105353e880235)
- [818f80f7 — التراخيص والصلاحيات واختبارات الأمان](https://github.com/arees-loop/arees-loop-platform/commit/818f80f7688d83cb7351f630a46270a4d74ef0be)
- [d7b7d0bf — كشف اختلاف المخطط](https://github.com/arees-loop/arees-loop-platform/commit/d7b7d0bf3dccbe01540848c1005b70cfce2425ee)
- [d990cc72 — ترحيل المطابقة والتحديثات الأمنية](https://github.com/arees-loop/arees-loop-platform/commit/d990cc72ebf3ea9b0714968baca3fc12489ce88c)
