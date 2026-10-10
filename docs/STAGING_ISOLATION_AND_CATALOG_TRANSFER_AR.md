# ضوابط Staging وخطة نقل كتالوج أريس

## حالة الموارد

- مشروع Vercel المعزول: `arees-loop-staging` (`prj_gkTSFNIfCgVwslbCUHsKtNhuwULk`). عليه SSO، بلا نطاقات مخصصة، بلا ربط Git، وبلا Deployments.
- مخزن الصور الخاص: `arees-loop-staging-media` (`store_euuB9sJFEyMP9s6Q`)، منفصل عن مخزن الإنتاج، فارغ عند آخر فحص.
- لا توجد قاعدة Staging بعد. لم يُنشأ مورد قاعدة بيانات لأن موصل Vercel المتاح لا يعرض عملية إنشاء Prisma Postgres، ولأن إنشاء مورد قد يترتب عليه رسوم ويحتاج موافقة صريحة.
- لا تُضاف مفاتيح الإنتاج. لا توجد مفاتيح دفع في تطبيق Staging. مفاتيح البريد/SMS/الخرائط/AI تظل غائبة أو تجريبية إلى أن تُراجع منفردة.

## عزل قاعدة البيانات

مشروع Staging لا يقرأ `DATABASE_URL` العام. عندما يكون `VERCEL_PROJECT_ID` هو معرف المشروع المعزول، يستخدم التطبيق فقط `AREES_STAGING_DATABASE_URL`، ويتطلب `AREES_DATABASE_ENV=staging` و`AREES_STAGING_DATABASE_HOST` المطابق حرفياً لاسم مضيف قاعدة Staging. وجود `DATABASE_URL` عام يشير إلى قاعدة مختلفة يوقف اتصال Prisma. إعداد Prisma CLI يستخدم عنوان Staging نفسه.

أضف متغيرات قاعدة Staging إلى مشروع Staging وحده بعد إنشائها، ولا تنسخ متغيرات مشروع `arees-loop-platform` إليه. نفّذ فحص الاتصال بـ:

```bash
VERCEL_PROJECT_ID=prj_gkTSFNIfCgVwslbCUHsKtNhuwULk \
node scripts/staging/check-connections.mjs
```

الفحص يتصل بالعنوان المصدر بمتغير `SOURCE_READ_ONLY_DATABASE_URL` والهدف بمتغيرات Staging، ويستخدم `BEGIN READ ONLY` ثم `SELECT` للهوية التقنية فقط. يفشل إذا تشارك المصدر والهدف المضيف نفسه أو اختلف مضيف Staging عن قائمة السماح. لا يُشغّل قبل إضافة قاعدة منفصلة.

## نسخ احتياطي واستعادة

1. قبل نقل الكتالوج، خذ نسخة احتياطية مشفرة من **قاعدة Staging** (بعد تهيئتها) إلى تخزين محدود الصلاحيات، واحفظ SHA-256. لا تنشئ نسخة كاملة من الإنتاج ضمن هذه الخطوة؛ فهي قد تشمل مستخدمين وحجوزات ومستندات.
2. تحقق من سلامة نسخة Staging باستخدام `pg_restore --list <backup.dump>`، واحتفظ بها دون رفعها إلى Git أو Library عامة.
3. استيراد الكتالوج يتطلب ملف النسخة وبصمته؛ يفحص السكربت البصمة وقابلية قراءة قائمة النسخة قبل أي كتابة.
4. التراجع يكون باستعادة نسخة Staging السابقة إلى قاعدة Staging فقط. لا توجد أوامر حذف تلقائي أو `db push` أو `migrate deploy` ضمن أدوات النقل.

## نقل شريك أريس والخدمات والصور

المصدر يُفتح من `SOURCE_READ_ONLY_DATABASE_URL` داخل معاملة `READ ONLY` وباستعلامات `SELECT` محددة الأعمدة. يلزم `AREES_SOURCE_PARTNER_ID` للشريك الأساسي الذي أكد المستخدم أنه `ACTIVE`. الشريك التجريبي المرفوض `REJECTED` لا يدخل في التصدير.

التصدير يستثني حسابات العملاء، الحجوزات، أعضاء الشركاء، الدعوات، المستندات، التراخيص، بيانات الاتصال والبنوك، أرقام موافقات البرامج، وأرقام التراخيص. ويحافظ على IDs الأصلية للشريك والخدمات والصور وعلى علاقاتها وأسعارها وحالاتها وحقول العرض.

صور الخدمات وشعار الشريك تُنسخ فقط من مخزن Blob الإنتاج المحدد إلى مخزن Staging الخاص، كملفات خاصة. المسارات الجديدة حتمية حسب IDs؛ الملفات المتطابقة تُتخطى، والملف المختلف بالمعرّف نفسه يوقف العملية بلا استبدال. تُحفظ بصمة SHA-256 وقياسات كل صورة في سجل النقل. الصور الخارجية أو أنواع MIME خارج JPEG/PNG/WebP توقف النسخ للمراجعة. شعار الشريك يُخدم عبر مسار خاص يتحقق من أن الرابط يطابق شعار الشريك النشط.

```bash
# التصدير يقرأ قاعدة المصدر فقط، ويكتب ملف كتالوج محلياً بصلاحيات 0600
node scripts/staging/export-catalog.mjs

# معاينة عدد الصور؛ لا يرفع ملفات ولا يكتب في Blob
node scripts/staging/copy-catalog-media.mjs artifacts/staging/catalog-<partner-id>.json --dry-run

# بعد الموافقة على رسوم النقل وإعداد رموز المخزنين حصراً في بيئة آمنة
node scripts/staging/copy-catalog-media.mjs artifacts/staging/catalog-<partner-id>.json --apply

# معاينة تحقق الاستيراد؛ لا يكتب في قاعدة البيانات
node scripts/staging/import-catalog.mjs artifacts/staging/catalog-<partner-id>.json artifacts/staging/media-<partner-id>.json --dry-run

# بعد النسخة الاحتياطية وموافقة النقل
node scripts/staging/import-catalog.mjs artifacts/staging/catalog-<partner-id>.json artifacts/staging/media-<partner-id>.json --apply
```

كل `--apply` يتطلب علامة موافقة منفصلة في متغير بيئة، ومشروع/مخزن Staging المحددين. الاستيراد لا يعمل تحديثاً للسجلات الموجودة: يتخطى الصف المطابق، ويرفض التعارض، وينفذ العملية في معاملة واحدة.

## حسابات اختبار جديدة

`scripts/staging/seed-test-fixtures.mjs` ينشئ، على قاعدة Staging وحدها، شريكاً وخدمة اصطناعيين، وحساب عميل، ومالك شريك، وموظفاً بصلاحيات محدودة، ومشرف محتوى بصلاحية `CONTENT_EXPERIENCES` وحدها. تستخدم الحسابات نطاق `example.test` المحجوز ولا تمثل أشخاصاً. كلمة المرور تأتي من `AREES_STAGING_TEST_PASSWORD` ولا يطبعها السكربت. السكربت يبدأ بوضع `--dry-run`، ويشترط `--apply` وعلامة سماح منفصلة للكتابة.

## النشر بعد الموافقة

قبل نشر Staging، يجب أن تكون قاعدة منفصلة موجودة ومربوطة بمشروع Staging وحده، ونجح فحص الاتصال، وفحوصات CI/build على Commit المراجعة، وأضيفت حسابات الاختبار، وضُبطت حماية SSO. لن يُربط Git أو يُنشأ Deployment أو تُنسخ بيانات أو ملفات قبل موافقة المستخدم الصريحة على خطة النشر والتكلفة. بعد نشر Staging فقط يُرسل رابط Vercel للتجربة.
