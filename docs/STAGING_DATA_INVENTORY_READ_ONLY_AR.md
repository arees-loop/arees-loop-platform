# جرد البيانات قبل تجهيز Staging

هذه الاستعلامات للقراءة فقط ومبنية على `prisma/schema.prisma` الحالي. شغّلها منفصلة في Vercel Storage → قاعدة Prisma Postgres → Browser → Query، على قاعدة البيانات التي يُشتبه أنها تحتوي البيانات السابقة. لا تُرجع كلمات مرور أو بيانات اتصال أو بيانات شخصية.

**لا تشغّل إلا استعلامات `SELECT`.** لا تُلصق نتائج تحتوي بيانات إضافية غير مطلوبة. أسماء الشريك التجاري ومعرّفاته مقصودة لتحديد سجلات أريس؛ لن تظهر أسماء العملاء أو بريدهم أو أرقامهم أو معرّفات حساباتهم.

## 1. الشركاء المرشحون وأعداد الخدمات والصور

```sql
SELECT
  p."id" AS partner_id,
  p."legalNameAr",
  p."tradeNameAr",
  p."legalNameEn",
  p."tradeNameEn",
  p."publicName",
  p."status"::text AS partner_status,
  COUNT(DISTINCT s."id") AS service_count,
  COUNT(DISTINCT si."id") AS image_count
FROM "Partner" p
LEFT JOIN "Service" s ON s."partnerId" = p."id"
LEFT JOIN "ServiceImage" si ON si."serviceId" = s."id"
WHERE
  COALESCE(p."legalNameAr", '') ILIKE ANY (ARRAY['%أريس%', '%اريس%']) OR
  COALESCE(p."tradeNameAr", '') ILIKE ANY (ARRAY['%أريس%', '%اريس%']) OR
  COALESCE(p."publicName", '') ILIKE ANY (ARRAY['%أريس%', '%اريس%']) OR
  COALESCE(p."legalNameEn", '') ILIKE ANY (ARRAY['%arees%', '%ares%']) OR
  COALESCE(p."tradeNameEn", '') ILIKE ANY (ARRAY['%arees%', '%ares%'])
GROUP BY p."id"
ORDER BY p."createdAt";
```

## 2. البرامج والخدمات والأسعار والصور المرتبطة

أرسل `partner_id` الذي ظهر في الاستعلام الأول مكان القيمة النصية أدناه. تُحذف معاملات الرابط بعد `?` من مخرجات الصور.

```sql
SELECT
  s."id" AS service_id,
  s."partnerId" AS partner_id,
  s."nameAr",
  s."nameEn",
  s."category",
  s."subCategory",
  s."basePrice",
  s."vatRate",
  s."finalPrice",
  s."status"::text AS service_status,
  s."createdAt",
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'imageId', si."id",
        'sortOrder', si."sortOrder",
        'urlWithoutQuery', split_part(si."url", '?', 1)
      ) ORDER BY si."sortOrder", si."createdAt", si."id"
    ) FILTER (WHERE si."id" IS NOT NULL),
    '[]'::jsonb
  ) AS images
FROM "Service" s
LEFT JOIN "ServiceImage" si ON si."serviceId" = s."id"
WHERE s."partnerId" = '<PARTNER_ID_FROM_QUERY_1>'
GROUP BY s."id"
ORDER BY s."createdAt", s."id";
```

## 3. أعداد حسابات العملاء والحجوزات فقط

يعرض أعداداً مجمعة حسب الحالة. لا يعرض أي حقول تعريفية عن الأشخاص أو الحجوزات.

```sql
WITH arees AS (
  SELECT p."id"
  FROM "Partner" p
  WHERE
    COALESCE(p."legalNameAr", '') ILIKE ANY (ARRAY['%أريس%', '%اريس%']) OR
    COALESCE(p."tradeNameAr", '') ILIKE ANY (ARRAY['%أريس%', '%اريس%']) OR
    COALESCE(p."publicName", '') ILIKE ANY (ARRAY['%أريس%', '%اريس%']) OR
    COALESCE(p."legalNameEn", '') ILIKE ANY (ARRAY['%arees%', '%ares%']) OR
    COALESCE(p."tradeNameEn", '') ILIKE ANY (ARRAY['%arees%', '%ares%'])
)
SELECT 'customer_accounts_by_status' AS record_group,
       u."status"::text AS record_status,
       COUNT(*) AS record_count
FROM "User" u
WHERE u."role" = 'CUSTOMER'::"UserRole"
GROUP BY u."status"

UNION ALL

SELECT CASE WHEN b."partnerId" IN (SELECT "id" FROM arees)
            THEN 'arees_bookings_by_status'
            ELSE 'all_other_bookings_by_status' END AS record_group,
       b."status"::text AS record_status,
       COUNT(*) AS record_count
FROM "Booking" b
GROUP BY CASE WHEN b."partnerId" IN (SELECT "id" FROM arees)
              THEN 'arees_bookings_by_status'
              ELSE 'all_other_bookings_by_status' END,
         b."status"
ORDER BY record_group, record_status;
```

## ضوابط النسخ إلى Staging بعد الجرد

- لا تُنسخ صفوف `User` أو `Booking` أو `PartnerDocument` أو رموز المصادقة/الجلسات. لا تُنسخ كلمات مرور أو أسرار دفع إنتاجية.
- لا يبدأ النسخ قبل نسخة احتياطية قابلة للاستعادة للبيئة المصدر، والتحقق من مكان قاعدة البيانات ومخزن الصور، وموافقة صريحة على النسخ.
- تُنقل سجلات `Partner` اللازمة و`Service` و`ServiceImage` بعلاقاتها ومعرّفاتها الأصلية. تُحفظ صور الشريك/الخدمات في مخزن Blob خاص منفصل، مع سجل ربط من المعرّف الأصلي إلى المسار المنسوخ، ثم تُحدّث روابط الصور داخل نسخة Staging فقط.
- يمنع التكرار بقيد فريد على المعرّف الأصلي في سجل النقل ومقارنة المحتوى/البصمة قبل إضافة أي صورة. لا يكتب مسار استيراد Staging إلى قاعدة الإنتاج.
- قبل ترحيل أي برامج أو خدمات من Staging مستقبلاً، تُراجع الفروقات وتُجرّب على نسخة احتياطية؛ ثم تستخدم upsert بمعرّفات الإنتاج الأصلية بعد اعتماد التغيير، دون نسخ مستخدمين أو حجوزات تجريبية.

**حالة الجرد:** لم تُشغّل هذه الاستعلامات من الموصل، إذ لا يدعم استعلام Prisma Postgres، وتعذّر إكمال Google sign-in من واجهة المتصفح. لذلك لا توجد أعداد مؤكدة حتى الآن.
