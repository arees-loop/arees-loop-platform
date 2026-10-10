import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { assertSeparateDatabases } from "../../lib/database-target.mjs";

const { Client } = pg;
const sourceUrl = process.env.SOURCE_READ_ONLY_DATABASE_URL;
const stagingUrl = process.env.AREES_STAGING_DATABASE_URL;
const stagingHost = process.env.AREES_STAGING_DATABASE_HOST;
const partnerId = process.env.AREES_SOURCE_PARTNER_ID;
const sourceBlobStoreId = process.env.AREES_SOURCE_BLOB_STORE_ID;
const stagingBlobStoreId = process.env.AREES_STAGING_BLOB_STORE_ID;

if (!sourceUrl || !stagingUrl || !stagingHost || !partnerId) {
  throw new Error("Provide source read-only URL, staging URL/host, and exact source partner ID");
}
if (!sourceBlobStoreId || !stagingBlobStoreId || sourceBlobStoreId === stagingBlobStoreId) {
  throw new Error("Source and staging Blob store IDs must be provided and different");
}
if (process.env.VERCEL_PROJECT_ID !== "prj_gkTSFNIfCgVwslbCUHsKtNhuwULk") {
  throw new Error("Run catalog export only from the isolated Arees Staging project context");
}
assertSeparateDatabases(sourceUrl, stagingUrl, stagingHost);

const localAssetPath = (rawUrl) => {
  let parsed;
  try {
    parsed = new URL(rawUrl, "https://arees.invalid");
  } catch {
    throw new Error("Catalog contains an invalid image URL");
  }

  if (parsed.origin === "https://arees.invalid" && parsed.pathname === "/api/media") {
    const pathname = parsed.searchParams.get("pathname");
    if (!pathname || pathname.startsWith("/") || pathname.split("/").includes("..") || pathname.includes("\\") || !pathname.startsWith("services/")) {
      throw new Error("Catalog contains an unsafe private media path");
    }
    return { sourcePath: pathname, access: "private" };
  }

  const access = parsed.hostname === `${sourceBlobStoreId}.private.blob.vercel-storage.com`
    ? "private"
    : parsed.hostname === `${sourceBlobStoreId}.public.blob.vercel-storage.com`
      ? "public"
      : null;
  if (access && parsed.pathname.length > 1) {
    const pathname = decodeURIComponent(parsed.pathname.slice(1));
    if (pathname.startsWith("/") || pathname.split("/").includes("..") || pathname.includes("\\")) {
      throw new Error("Catalog contains an unsafe Blob path");
    }
    return { sourcePath: pathname, access };
  }

  throw new Error("Catalog contains media outside the approved source Blob store");
};

const exportDir = path.resolve(process.env.AREES_CATALOG_EXPORT_DIR || "./artifacts/staging");
const outputPath = path.join(exportDir, `catalog-${partnerId}.json`);
const client = new Client({ connectionString: sourceUrl, connectionTimeoutMillis: 8000, query_timeout: 15000 });

try {
  await client.connect();
  await client.query("BEGIN READ ONLY");
  const { rows: readOnlyRows } = await client.query("SHOW transaction_read_only");
  if (readOnlyRows[0]?.transaction_read_only !== "on") {
    throw new Error("Source transaction is not read-only; export stopped");
  }

  const partnerResult = await client.query(
    `SELECT "id", "partnerType"::text, "legalNameAr", "legalNameEn", "tradeNameAr", "tradeNameEn",
            "descriptionAr", "logoUrl", "websiteUrl", "country", "city", "locationName",
            "latitude"::text, "longitude"::text, "publicName", "operates24h", "operatingHours",
            "status"::text, "createdAt", "updatedAt"
       FROM "Partner"
      WHERE "id" = $1
        AND "status" = 'ACTIVE'::"PartnerStatus"
        AND (
          COALESCE("legalNameAr", '') ILIKE ANY (ARRAY['%ШЈШ±ЩЉШі%', '%Ш§Ш±ЩЉШі%']) OR
          COALESCE("tradeNameAr", '') ILIKE ANY (ARRAY['%ШЈШ±ЩЉШі%', '%Ш§Ш±ЩЉШі%']) OR
          COALESCE("publicName", '') ILIKE ANY (ARRAY['%ШЈШ±ЩЉШі%', '%Ш§Ш±ЩЉШі%']) OR
          COALESCE("legalNameEn", '') ILIKE ANY (ARRAY['%arees%', '%ares%']) OR
          COALESCE("tradeNameEn", '') ILIKE ANY (ARRAY['%arees%', '%ares%'])
        )`,
    [partnerId],
  );
  if (partnerResult.rowCount !== 1) {
    throw new Error("The specified partner is absent or not ACTIVE; no export was written");
  }

  const servicesResult = await client.query(
    `SELECT "id", "partnerId", "nameAr", "nameEn", "category", "subCategory", "descriptionAr", "descriptionEn",
            "city", "region", "locationName", "formattedAddress", "placeId", "country", "countryCode",
            "latitude"::text, "longitude"::text, "basePrice"::text, "vatRate"::text, "finalPrice"::text,
            "loyaltyPoints", "capacity", "cancellationPolicy", "meetingInstructions", "meetingPointName",
            "meetingPointAddress", "meetingLatitude"::text, "meetingLongitude"::text, "organizerType",
            "organizerName", "status"::text, "createdAt", "updatedAt"
       FROM "Service"
      WHERE "partnerId" = $1
      ORDER BY "createdAt", "id"`,
    [partnerId],
  );
  const serviceIds = servicesResult.rows.map((row) => row.id);
  const imagesResult = serviceIds.length
    ? await client.query(
        `SELECT "id", "serviceId", "url", "sortOrder", "createdAt"
           FROM "ServiceImage"
          WHERE "serviceId" = ANY($1::text[])
          ORDER BY "serviceId", "sortOrder", "createdAt", "id"`,
        [serviceIds],
      )
    : { rows: [] };

  const images = imagesResult.rows.map(({ id, serviceId, url, sortOrder, createdAt }) => ({
    id,
    serviceId,
    ...localAssetPath(url),
    sortOrder,
    createdAt,
  }));
  const partner = partnerResult.rows[0];
  const catalog = {
    format: "arees-staging-catalog-v1",
    generatedAt: new Date().toISOString(),
    source: {
      databaseHost: new URL(sourceUrl).hostname,
      databaseName: decodeURIComponent(new URL(sourceUrl).pathname.slice(1)),
      blobStoreId: sourceBlobStoreId,
    },
    staging: { databaseHost: new URL(stagingUrl).hostname, blobStoreId: stagingBlobStoreId },
    partner: {
      ...partner,
      logoSourceAsset: partner.logoUrl ? localAssetPath(partner.logoUrl) : null,
      logoUrl: null,
    },
    services: servicesResult.rows,
    images,
    exclusions: [
      "users and customer profiles",
      "bookings and payment reference~wлОmўG§ІЪоќЖ­yУ‘ИЋВ€Y\ЬШYЩN€Эљ[™ОВ€™\]Y\ЭYXЭ[ЫЋ€Эљ[™ОВџNВ‚™^Ьќ\H\ќ™\ђZQШЭ[Y[ќ™\Э[HВ€ШЭ[Y[ќY€Эљ[™ОВ€Э]\О€ђRWФ‘U’QUСQ€“‘QQЧРУФ”‘PХSУ€ЋВ€›Э\О€Эљ[™ОВџNВ‚™^Ьќ\H\ќ™\ђZT™]љY]Ф™\Э[HВ€Э]ЫЫYN€\ќ™\ђZT™]љY]УЭ]ЫЫYNВ€Э[[X\ћN€Эљ[™ОВ€\ќ™\“Y\ЬШYЩN€Эљ[™ОВ€YZ[“Y\ЬШYЩN€Эљ[™ОВ€\ЬЭY\О€\ќ™\ђZR\ЬЭYVЧNВ€ШЭ[Y[ќ™\Э[О€\ќ™\ђZQШЭ[Y[ќ™\Э[ЧNВ€[Щ[€Эљ[™ОВ€™]љY]ЩY]€Эљ[™ОВџNВ‚ќ\HЩ[Z[љT™\ЬЫњЩHHВ€Ш[™Y]\ПО€\њ^OВ€ЫЫќ[ќО€В€\ќПО€\њ^OИ^О€Эљ[™ИOЋВ€NВ€OЋВ€\њ›ЬЏО€В€Y\ЬШYЩOО€Эљ[™ОВ€NВџNВ‚ЫЫњЭPVРRWТS“S‘WР–UTИHN
€LЌ
€LЌВЫЫњЭPVРRWСРХSQS•ИHВ‚™ќ[Э[Ы€ЫX[•^
[YN€[љЫ›ЭЫ‹[XЪИH€ЉHВ€™]\›€\[Щ€[YHOOHњЭљ[™И€И[YKќљ[J
H€[XЪОВџB‚™ќ[Э[Ы€›Ь›X[^™SЭ]ЫЫYJ[YN€[љЫ›ЭЫЉN€\ќ™\ђZT™]љY]УЭ]ЫЫYHВ€Y€
€[YHOOH”‘PQH€€[YHOOH“‘QQЧРУУTUSУ€€€[YHOOH“PS•PSФ‘U’QUИ‚€
HВ€™]\›€[YNВ€B‚€™]\›€“PS•PSФ‘U’QUИЋВџB‚™ќ[Э[Ы€›Ь›X[^™R\ЬЭY\К[YN€[љЫ›ЭЫЉN€\ќ™\ђZR\ЬЭYVЧHВ€Y€
P\њ^Kљ\Р\њ^J[YJJH™]\›€ЧNВ‚€™]\›€[YB€›X\

][JHO€В€Y€
Z][H\[Щ€][HOOH›Шљ™XЭЉH™]\›€ќ[В‚€ЫЫњЭ™XЫЬ™H][H\И™XЫЬ™Эљ[™Л[љЫ›ЭЫЏЋВ€ЫЫњЭY\ЬШYЩHHЫX[•^
™XЫЬ™›Y\ЬШYЩJNВ€Y€
[Y\ЬШYЩJH™]\›€ќ[В‚€™]\›€В€љY[€ЫX[•^
™XЫЬ™™љY[™Щ[™\[ЉK€Щ]™\љ]N‚€™XЫЬ™њЩ]™\љ]HOOH‘T”“Ф€€И
‘T”“Ф€€\ИЫЫњЭ
H€
•РT“’S‘И€\ИЫЫњЭ
K€Y\ЬШYЩK€™\]Y\ЭYXЭ[ЫЋ€ЫX[•^
™XЫЬ™њ™\]Y\ЭYXЭ[ЫЉK€NВ€JB€™љ[\Љ
][JN€][H\И\ќ™\ђZR\ЬЭYHO€›ЫЫX[Љ][JJNВџB‚™ќ[Э[Ы€›Ь›X[^™QШЭ[Y[ќ™\Э[К€[YN€[љЫ›ЭЫ‹€[ЭЩYYО€Щ]Эљ[™П‹ЉN€\ќ™\ђZQШЭ[Y[ќ™\Э[ЧHВ€Y€
P\њ^Kљ\Р\њ^J[YJJH™]\›€ЧNВ‚€™]\›€[YB€›X\

][JHO€В€Y€
Z][H\[Щ€][HOOH›Шљ™XЭЉH™]\›€ќ[В‚€ЫЫњЭ™XЫЬ™H][H\И™XЫЬ™Эљ[™Л[љЫ›ЭЫЏЋВ€ЫЫњЭШЭ[Y[ќYHЫX[•^
™XЫЬ™™ШЭ[Y[ќY
NВ‚€Y€
YШЭ[Y[ќYX[ЭЩYYЛљ\КШЭ[Y[ќY
JH™]\›€ќ[В‚€™]\›€В€ШЭ[Y[ќY€Э]\О‚€™XЫЬ™њЭ]\ИOOH“‘QQЧРУФ”‘PХSУ€‚€И
“‘QQЧРУФ”‘PХSУ€€\ИЫЫњЭ
B€€
ђRWФ‘U’QUСQ€\ИЫЫњЭ
K€›Э\О€ЫX[•^
™XЫЬ™››Э\КK€NВ€JB€™љ[\Љ
][JN€][H\И\ќ™\ђZQШЭ[Y[ќ™\Э[O€›ЫЫX[Љ][JJNВџB‚™ќ[Э[Ы€›Ш”]њ›ЫU\›
љ[U\›€Эљ[™КHВ€ЫЫњЭ\›H™]ИT“
љ[U\›
NВ€™]\›€XЫЩUT’PЫЫ\Ы™[ќ
\›њ][YKњ™\XЩJЧ—КЛЛ€ЉJNВџB‚\Ю[Иќ[Э[Ы€™XYљ]]P›ШЉљ[U\›€Эљ[™КHВ€ЫЫњЭ™\Э[H]ШZ]Щ]
›Ш”]њ›ЫU\›
љ[U\›
KВ€XШЩ\ЬО€њљ]]H‹€\ЩPШXЪN€[ЩK€JNВ‚€Y€
\™\Э[
HВ€›ЭИ™]И\њ›ЬЉ”T•‘T—СРХSQS•У“ХС“ХS‘ЉNВ€B‚€™]\›€™]ИZ[ќ\њ^J]ШZ]™]И™\ЬЫњЩJ™\Э[њЭ™X[JK\њ^PќY™™\Љ
JNВџB‚™ќ[Э[Ы€Р\ЩMЌ
ћ]\О€Z[ќ\њ^JHВ€™]\›€ќY™™\‹™њ›ЫJћ]\КKќФЭљ[™К\ЩMЌЉNВџB‚™ќ[Э[Ы€]\›Z[љ\ЭXТ\ЬЭY\К[њ]€В€\ќ™\•\N€Эљ[™Иќ[В€\XШ[ќ›ЫN€Эљ[™Иќ[В€Ш]YЫЬљY\О€Эљ[™ЦЧNВ€]™YЪ\Э\™Y€›ЫЫX[ЋВ€™XЩZ]™\Ф^[Y[ќО€›ЫЫX[ЋВ€X[Ћ€Эљ[™Иќ[В€ШЭ[Y[ќ\\О€Эљ[™ЦЧNВџJHВ€ЫЫњЭ\ЬЭY\О€\ќ™\ђZR\ЬЭYVЧHHЧNВ€ЫЫњЭ\\ИH™]ИЩ]
[њ]™ШЭ[Y[ќ\\КNВ‚€Y€
[њ]Ш]YЫЬљY\Л›[™ЭOOH
HВ€\ЬЭY\Лњ\Ъ
В€љY[€Ш]YЫЬљY\И‹€Щ]™\љ]N€‘T”“Ф€‹€Y\ЬШYЩN€¶a6aH6b¶*¶aH6*¶+v+цb¶+И6a¶b6.H6)цa6+¶+цav)ц*€6)цa6*¶b€6,цb¶`¶+цavaц)И6)цa6-6,vb¶`Л€‹€™\]Y\ЭYXЭ[ЫЋ€¶)ц+¶*¶b¶)ц,H6`v)¶*H6+¶+цav*H6b6)ц+v+ц*H6.va6bH6)цa6(ц`¶a€‹€JNВ€B‚€Y€
€[њ]\XШ[ќ›ЫHOOH”‘T‘TСS•UU‘H€	‰‚€]\\Лљ\КђUUФ’VђUSУ€ЉB€
HВ€\ЬЭY\Лњ\Ъ
В€љY[€]]Ьљ^][Ы€‹€Щ]™\љ]N€‘T”“Ф€‹€Y\ЬШYЩN€¶av`¶+цaH6)цa6-цa6*6av,ц+6a6`цavav*цa6a6a6ava¶-6(ц*H6b6a6aH6b¶*¶aH6)v,v`v)ц`€6*¶`vb6b¶-‹€‹€™\]Y\ЭYXЭ[ЫЋ€¶)v,v`v)ц`€6*¶`vb6b¶-€6,ц)ц,vb€6a6avav*цa6)цa6ava¶-6(ц*K€‹€JNВ€B‚€Y€
[њ]ќ]™YЪ\Э\™Y	‰€]\\Лљ\К•ђUРСT•Q’PРUHЉJHВ€\ЬЭY\Лњ\Ъ
В€љY[€ќ]Щ\ќYљXШ]H‹€Щ]™\љ]N€‘T”“Ф€‹€Y\ЬШYЩN€¶*¶aH6)ц+¶*¶b¶)ц,H6(цa€6)цa6ava¶-6(ц*H6av,ц+6a6*H6`vb€6-¶,vb¶*6*H6)цa6`¶b¶av*H6)цa6av-¶)ц`v*H6+цb6a€6)v,v`v)ц`€6)цa6-6aц)ц+ц*K€‹€™\]Y\ЭYXЭ[ЫЋ€¶)v,v`v)ц`€6-6aц)ц+ц*H6)цa6*¶,ц+6b¶a6`vb€6-¶,vb¶*6*H6)цa6`¶b¶av*H6)цa6av-¶)ц`v*K€‹€JNВ€B‚€Y€
[њ]њ™XЩZ]™\Ф^[Y[ќИ	‰€Z[њ]љX[ЉHВ€\ЬЭY\Лњ\Ъ
В€љY[€љX[€‹€Щ]™\љ]N€‘T”“Ф€‹€Y\ЬШYЩN€¶*¶aH6)ц+¶*¶b¶)ц,H6)ц,ц*¶`¶*6)цa6)цa6*¶,цb6b¶)ц*€6)цa6av)цa6b¶*H6+цb6a€6)v+ц+¶)цaPђS‹€‹€™\]Y\ЭYXЭ[ЫЋ€¶)v+ц+¶)цaPђS€6)цa6+¶)ц-H6*6)цa6av,ц*¶`vb¶+Л€‹€JNВ€B‚€Y€
€[њ]њ™XЩZ]™\Ф^[Y[ќИ	‰‚€]\\Лљ\К’PђS—РСT•Q’PРUHЉB€
HВ€\ЬЭY\Лњ\Ъ
В€љY[€љX[ђЩ\ќYљXШ]H‹€Щ]™\љ]N€‘T”“Ф€‹€Y\ЬШYЩN€¶*¶aH6)ц+¶*¶b¶)ц,H6)ц,ц*¶`¶*6)цa6)цa6*¶,цb6b¶)ц*€6)цa6av)цa6b¶*H6+цb6a€6)v,v`v)ц`€6-6aц)ц+ц*HPђS€6(цb6+¶-ц)ц*6)цa6*6a¶`Л€‹€™\]Y\ЭYXЭ[ЫЋ€¶)v,v`v)ц`€6-6aц)ц+ц*HPђS€6(цb6+¶-ц)ц*6*6a¶`цb€6b¶*ц*6*€6)цa6+v,ц)ц*€‹€JNВ€B‚€Y€
€[њ]њ\ќ™\•\HOOHђ•TТS‘TФИ€	‰‚€]\\Лљ\КђУУSQTђТPSФ‘QТTХT€ЉH	‰‚€]\\Лљ\Кђ•TТS‘TФЧФ“УС€ЉB€
HВ€\ЬЭY\Лњ\Ъ
В€љY[€ќ\Ъ[™\ЬФ›ЫЩ€‹€Щ]™\љ]N€‘T”“Ф€‹€Y\ЬШYЩN€¶a6)И6b¶b6+6+И6av,ц*¶a¶+И6ava¶-6(ц*H6(цb6,ц+6a6*¶+6)ц,vb€6av,v`vb6.H6-¶ava€6)цa6-цa6*€‹€™\]Y\ЭYXЭ[ЫЋ€¶)v,v`v)ц`€6)цa6,ц+6a6)цa6*¶+6)ц,vb€6(цb6av,ц*¶a¶+И6)v*ц*6)ц*€6)цa6ava¶-6(ц*H6)цa6ava¶)ц,ц*€‹€JNВ€B‚€™]\›€\ЬЭY\ОВџB‚™ќ[Э[Ы€Y\™ЩR\ЬЭY\Кљ[X\ћN€\ќ™\ђZR\ЬЭYVЧKЩXЫЫ™\ћN€\ќ™\ђZR\ЬЭYVЧJHВ€ЫЫњЭЩY[€H™]ИЩ]Эљ[™ПЉ
NВ€ЫЫњЭЭ]]€\ќ™\ђZR\ЬЭYVЧHHЧNВ‚€›Ь€
ЫЫњЭ\ЬЭYHЩ€Л‹‹њљ[X\ћK‹‹њЩXЫЫ™\ћWJHВ€ЫЫњЭЩ^HHВ€\ЬЭYK™љY[€\ЬЭYK›Y\ЬШYЩK€\ЬЭYKњ™\]Y\ЭYXЭ[Ы‹€Kљ›Ъ[ЉџЉNВ‚€Y€
ЩY[‹љ\КЩ^JJHЫЫќ[ќYNВ€ЩY[‹Y
Щ^JNВ€Э]]њ\Ъ
\ЬЭYJNВ€B‚€™]\›€Э]]ВџB‚™^Ьќ\Ю[Иќ[Э[Ы€™]љY]Ф\ќ™\ђ\XШ][Ы•Ъ]ZJ€\ќ™\’Y€Эљ[™ЛЉN€›ЫZ\ЩO\ќ™\ђZT™]љY]Ф™\Э[€В€Y€
Z\РZQШЭ[Y[ќ›ШЩ\ЬЪ[™Р\›Э™Y

JHВ€›ЭИ™]И\њ›ЬЉђRWСРХSQS•Ф“РСTФТS‘ЧУ“ХРT“Х‘QЉNВ€B‚€ЫЫњЭ\ќ™\€H]ШZ]љ\ЫXKњ\ќ™\‹™љ[™[љ\]YJВ€Ъ\™N€ИY€\ќ™\’YK€[ЫYN€В€Ш]YЫЬљY\О€В€Ь™\ђћN€ИЬ™X]Y]€\ШИ€K€K€XЩ[њЩ\О€В€Ь™\ђћN€ИЬ™X]Y]€\ШИ€K€K€ШЭ[Y[ќО€В€Ь™\ђћN€ИЬ™X]Y]€™\ШИ€K€K€K€JNВ‚€Y€
\\ќ™\ЉHВ€›ЭИ™]И\њ›ЬЉ”T•‘T—У“ХС“ХS‘ЉNВ€B‚€ЫЫњЭ[Щ[B€›ШЩ\ЬЛ™[ќ‹‘СSRS’WУSСSЛќљ[J
H™Щ[Z[љKL‹ЌKY›\ЪЋВ€ЫЫњЭ\RЩ^HH›ШЩ\ЬЛ™[ќ‹‘СSRS’WРTWТСVOЛќљ[J
NВ‚€Y€
X\RЩ^JHВ€›ЭИ™]И\њ›ЬЉ‘СSRS’WРTWТСVWУ“ХРУУ‘’QХT‘QЉNВ€B‚€ЫЫњЫЫKљ[™›К”\ќ™\€RH™]љY]ИЭ\ќY‹В€\ќ™\’Y€\ќ™\‹љY€ШЭ[Y[ќЫЭ[ќ€\ќ™\‹™ШЭ[Y[ќЛ›[™Э€[Щ[€JNВ‚€ЫЫњЭќ[R\ЬЭY\ИH]\›Z[љ\ЭXТ\ЬЭY\КВ€\ќ™\•\N€\ќ™\‹њ\ќ™\•\K€\XШ[ќ›ЫN€\ќ™\‹\XШ[ќ›ЫK€Ш]YЫЬљY\О€\ќ™\‹Ш]YЫЬљY\Л›X\

][JHO€][K›[YJK€]™YЪ\Э\™Y€\ќ™\‹ќ]™YЪ\Э\™Y€™XЩZ]™\Ф^[Y[ќО€\ќ™\‹њ™XЩZ]™\Ф^[Y[ќЛ€X[Ћ€\ќ™\‹љX[‹€ШЭ[Y[ќ\\О€\ќ™\‹™ШЭ[Y[ќЛ›X\

][JHO€][Kќ\JK€JNВ‚€ЫЫњЭ\ќ™\‘]HHВ€\ќ™\•\N€\ќ™\‹њ\ќ™\•\K€\XШ[ќ›ЫN€\ќ™\‹\XШ[ќ›ЫK€YШ[[YP\Ћ€\ќ™\‹›YШ[[YP\‹€YШ[[YQ[Ћ€\ќ™\‹›YШ[[YQ[‹€YS[YP\Ћ€\ќ™\‹ќYS[YP\‹€YS[YQ[Ћ€\ќ™\‹ќYS[YQ[‹€[љYљYYќ[X™\Ћ€\ќ™\‹ќ[љYљYYќ[X™\‹€ЫЫ[Y\ЪX[™YЪ\Э\Ћ€\ќ™\‹ЫЫ[Y\ЪX[™YЪ\Э\‹€›ЫЩ•\N€\ќ™\‹њ›ЫЩ•\K€\ШЬљ\[Ыђ\Ћ€\ќ™\‹™\ШЬљ\[Ыђ\‹€]™YЪ\Э\™Y€\ќ™\‹ќ]™YЪ\Э\™Y€]ќ[X™\Ћ€\ќ™\‹ќ]ќ[X™\‹€ЩXњЪ]U\›€\ќ™\‹ќЩXњЪ]U\›€ЫЭ[ќћN€\ќ™\‹ЫЭ[ќћK€Ъ]N€\ќ™\‹Ъ]K€\XШ[ќ›Ш•]N€\ќ™\‹\XШ[ќ›Ш•]K€Ь\]\МЌ€\ќ™\‹›Ь\]\МЌ€Ь\][™ТЭ\њО€\ќ™\‹›Ь\][™ТЭ\њЛ€™XЩZ]™\Ф^[Y[ќО€\ќ™\‹њ™XЩZ]™\Ф^[Y[ќЛ€X›XУ[YN€\ќ™\‹њX›XУ[YK€Ш]YЫЬљY\О€\ќ™\‹Ш]YЫЬљY\Л›X\

][JHO€][K›[YJK€XЩ[њЩ\О€\ќ™\‹›XЩ[њЩ\Л›X\

XЩ[њЩJHO€
В€\N€XЩ[њЩKќ\K€\ЬЭY\Ћ€XЩ[њЩKљ\ЬЭY\‹€XЩ[њЩSќ[X™\Ћ€XЩ[њЩK›XЩ[њЩSќ[X™\‹€\ЬЭYQ]N€XЩ[њЩKљ\ЬЭYQ]OЛќТTУФЭљ[™К
HПИќ[€^\ћQ]N€XЩ[њЩK™^\ћQ]OЛќТTУФЭљ[™К
HПИќ[€JJK€ШЭ[Y[ќО€\ќ™\‹™ШЭ[Y[ќЛ›X\

ШЭ[Y[ќ
HO€
В€Y€ШЭ[Y[ќљY€\N€ШЭ[Y[ќќ\K€X™[€ШЭ[Y[ќ›X™[€љ[S[YN€ШЭ[Y[ќ™љ[S[YK€Z[YU\N€ШЭ[Y[ќ›Z[YU\K€Ь™X]Y]€ШЭ[Y[ќЬ™X]Y]ќТTУФЭљ[™К
K€JJK€NВ‚€ЫЫњЭ\ќО€\њ^O™XЫЬ™Эљ[™Л[љЫ›ЭЫЏЏ€HВ€В€^€6(цa¶*€6av,v)ц+6.H6)цav*¶*ц)цa6(¶a6b€6+ц)ц+¶a6ava¶-v*H\™Y\ИЫЬ‚¶avaцav*¶`И6`v+v-H6-цa6*6)цa¶-¶av)цaH6)цa6-6,vb¶`И6b6)цa6b6*ц)ц)¶`€6)цa6av,v`vb6.v*v#6b6)ц`ц*¶-6)ц`H6)цa6a¶b6)ц`¶-H6(цb6)цa6*¶.v)ц,v-¶)ц*€6)цa6b6)ц-¶+v*H6`v`¶-Л‚‚¶`¶b6)ц.v+И6)va6,¶)цavb¶*N‚‹H6a6)И6*¶ava¶+H6avb6)ц`v`¶*H6a¶aц)ц)¶b¶*H6b6a6)И6*¶,v`v-€6)цa6-6,vb¶`И6a¶aц)ц)¶b¶)цbЛ€6)цa6`¶,v)ц,H6)цa6a¶aц)ц)¶b€6a6a6)v+ц)ц,v*K‚‹H6a6)И6*¶,ц*¶+¶+цaH6+v)цa6*H¶avb6)ц`v`¶*H6av*6+ц)¶b¶*H€6(цb6(цb€6av.va¶bH6av-6)ц*6aЛ‚‹H6)v,6)И6`ц)цa€6aцa¶)ц`И6a¶`¶-H6`¶)ц*6a6a6a6*¶-v+vb¶+H6)ц+¶*¶,H‘QQЧРУУTUSУ‹‚‹H6)v,6)И6`ц)цa¶*€6)цa6*6b¶)цa¶)ц*€6b6)цa6av,v`v`¶)ц*€6av*¶,ц`¶*H6b6a6)И6b¶b6+6+И6a¶`¶-H6b6)ц-¶+H6)ц+¶*¶,H‘PQv#6b6aц,6)И6b¶.va¶b€6`v`¶-И6+6)цaц,€6a6a6av,v)ц+6.v*H6)цa6)v+ц)ц,vb¶*K‚‹H6)v,6)И6a6aH6*¶,ц*¶-ц.H6`¶,v)ц(v*H6av,ц*¶a¶+И6avaцaH6(цb6`ц)цa€6)цa6*¶+v`¶`€6b¶+v*¶)ц+6+6aц*H6,v,цavb¶*H6+¶)ц,v+6b¶*H6)ц+¶*¶,HPS•PSФ‘U’QUЛ‚‹H6a6)И6*¶+цdv.vd6(цa¶`И6*¶+v`¶`¶*€6ava€6-v+v*H6,ц+6a6(цb6*¶,v+¶b¶-H6a6+цbH6+6aц*H6+v`цb6avb¶*H6+¶)ц,v+6b¶*v&И6(цa¶*€6`v`¶-И6*¶`v+v-H6)цa6)ц*¶,ц)ц`€6b6)цa6av+v*¶b6bH6)цa6av,v`v`‹‚‹H6`¶)ц,va€6)цa6(ц,цav)ц(H6b6)цa6(ц,v`¶)цaH6b6)цa6*¶b6)ц,vb¶+€6b6)цa6-v`v*H6b6)цa6-¶,vb¶*6*H6b6)цa6*¶`vb6b¶-€6*6b¶a€6)цa6*6b¶)цa¶)ц*€6)цa6av`ц*¶b6*6*H6b6)цa6av,ц*¶a¶+ц)ц*€6`¶+ц,H6)цa6)vav`ц)цa‹€6a6)И6*¶,ц*¶a¶*¶+6(цb6*¶.v,v-€6(ц,v`¶)цaH6aцb6b¶*H6-6+¶-vb¶*K‚‹H6)v,6)И6*¶`ц,v,H6a¶b6.H6)цa6av,ц*¶a¶+ц#6)ц.v*¶*6,H6)цa6av,ц*¶a¶+И6)цa6(ц+v+ц*И6,¶ava¶b¶)цbИ6aцb6)цa6a¶,ц+¶*H6)цa6+v)цa6b¶*H6b6)ц+v*¶`v.6*6)цa6(ц`¶+цaH6`ц,ц+6a6,ц)ц*6`€6`v`¶-Л‚‹H6)цa6,v,ц)цa6*H6)цa6avb6+6aц*H6a6a6-6,vb¶`И6*¶`цb6a€6.v,v*6b¶*H6b6)ц-¶+v*H6b6av+¶*¶-v,v*H6b6ava€6+цb6a€6`ц-6`H6*¶.va6b¶av)ц*€6+ц)ц+¶a6b¶*K‚‹H6*¶`¶,vb¶,H6)цa6)v+ц)ц,v*H6b¶`цb6a€6.vava6b¶)цbИ6b6b¶,6`ц,H6a¶`¶)ц-И6)цa6av+¶)ц-ц,v*H6(цb6av)И6b¶+v*¶)ц+6*¶+v`¶`¶)цbИ6*6-6,vb¶)цbЛ‚‹H6(ц.v+И”УУ€6`v`¶-ц#6*6+цb6a€X\љЩЭЫ‹‚‚¶-vb¶.¶*H”УУ€6)цa6av-цa6b6*6*N‚ћВ€›Э]ЫЫYHЋ€”‘PQH‘QQЧРУУTUSУ€PS•PSФ‘U’QUИ‹€њЭ[[X\ћHЋ€¶ava6+¶-H6`¶-vb¶,H‹€њ\ќ™\“Y\ЬШYЩHЋ€¶)цa6,v,ц)цa6*H6)цa6*¶b€6,ц*¶,v,цa6a6a6-6,vb¶`И‹€YZ[“Y\ЬШYЩHЋ€¶ava6+¶-H6.vava6b€6a6a6)v+ц)ц,v*H‹€љ\ЬЭY\ИЋ€В€В€™љY[Ћ€¶)ц,цaH6)цa6+v`¶a6(цb6)цa6av,ц*¶a¶+И‹€њЩ]™\љ]HЋ€‘T”“Ф€РT“’S‘И‹€›Y\ЬШYЩHЋ€¶)цa6ava6)ц+v.6*H‹€њ™\]Y\ЭYXЭ[Ы€Ћ€¶)цa6)v+6,v)ц(H6)цa6av-цa6b6*‚€B€K€™ШЭ[Y[ќ™\Э[ИЋ€В€В€™ШЭ[Y[ќYЋ€¶)цa6av.v,v`H6)цa6av`¶+цaH6a6`И6`v`¶-И‹€њЭ]\ИЋ€ђRWФ‘U’QUСQ‘QQЧРУФ”‘PХSУ€‹€››Э\ИЋ€¶ava6)ц+v.6*H6`¶-vb¶,v*H‚€B€BџB‚¶*6b¶)цa¶)ц*€6)цa6-цa6*‚‰Т”УУ‹њЭљ[™ЪYћJ\ќ™\‘]J_B‚¶)цa6`v+vb6-v)ц*€6)цa6+v*¶avb¶*H6)цa6*¶b€6,v-v+цaц)И6)цa6a¶.6)цaH6`¶*6a6)цa6,6`ц)ц(H6)цa6)ц-v-цa¶)ц.vbЋ‚‰Т”УУ‹њЭљ[™ЪYћJќ[R\ЬЭY\К_B€K€NВ‚€][›[™Pћ]\ИHВ€ЫЫњЭЫZ]YШЭ[Y[ќО€Эљ[™ЦЧHHЧNВ‚€›Ь€
ЫЫњЭШЭ[Y[ќЩ€\ќ™\‹™ШЭ[Y[ќЛњЫXЩJPVРRWСРХSQS•КJHВ€Y€
€ШЭ[Y[ќ›Z[YU\HOOH\XШ][Ы‹Ь€€	‰‚€ШЭ[Y[ќ›Z[YU\HOOHљ[XYЩKЪњYИ€	‰‚€ШЭ[Y[ќ›Z[YU\HOOHљ[XYЩKЬ™И‚€
HВ€ЫZ]YШЭ[Y[ќЛњ\Ъ
ШЭ[Y[ќљY
NВ€ЫЫќ[ќYNВ€B‚€ћHВ€ЫЫњЫЫKљ[™›К”\ќ™\€RHШЭ[Y[ќШYЭ\ќY‹В€\ќ™\’Y€\ќ™\‹љY€ШЭ[Y[ќY€ШЭ[Y[ќљY€Z[YU\N€ШЭ[Y[ќ›Z[YU\K€JNВ€ЫЫњЭћ]\ИH]ШZ]™XYљ]]P›ШЉШЭ[Y[ќ™љ[U\›
NВ€ЫЫњЫЫKљ[™›К”\ќ™\€RHШЭ[Y[ќШYЫЫ\]Y‹В€\ќ™\’Y€\ќ™\‹љY€ШЭ[Y[ќY€ШЭ[Y[ќљY€ћ]S[™Э€ћ]\Лћ]S[™Э€JNВ‚€Y€
[›[™Pћ]\И
Ић]\Лћ]S[™Э€PVРRWТS“S‘WР–UTКHВ€ЫZ]YШЭ[Y[ќЛњ\Ъ
ШЭ[Y[ќљY
NВ€ЫЫќ[ќYNВ€B‚€[›[™Pћ]\И
ПHћ]\Лћ]S[™ЭВ‚€\ќЛњ\Ъ
В€^€6)цa6av,ц*¶a¶+И6)цa6*¶)цa6b€6av.v,v`vaИ	ЩШЭ[Y[ќљYH6b6a¶b6.vaИ	ЩШЭ[Y[ќќ\_H6b6.va¶b6)цa¶aИ	ЩШЭ[Y[ќ›X™[ПИШЭ[Y[ќ™љ[S[YHПИ¶*6+цb6a€6.va¶b6)цa€џK€JNВ€\ќЛњ\Ъ
В€[›[™WЩ]N€В€Z[YWЭ\N€ШЭ[Y[ќ›Z[YU\K€]N€Р\ЩMЌ
ћ]\КK€K€JNВ€HШ]Ъ
\њ›ЬЉHВ€ЫЫњЫЫK™\њ›ЬЉ•[X›HИШY\ќ™\€ШЭ[Y[ќ›Ь€RH™]љY]О€‹В€ШЭ[Y[ќY€ШЭ[Y[ќљY€\њ›Ь‹€JNВ€ЫZ]YШЭ[Y[ќЛњ\Ъ
ШЭ[Y[ќљY
NВ€B€B‚€Y€
\ќ™\‹™ШЭ[Y[ќЛ›[™Э€PVРRWСРХSQS•КHВ€ЫZ]YШЭ[Y[ќЛњ\Ъ
€‹‹њ\ќ™\‹™ШЭ[Y[ќЛњЫXЩJPVРRWСРХSQS•КK›X\

][JHO€][KљY
K€
NВ€B‚€Y€
ЫZ]YШЭ[Y[ќЛ›[™Э€
HВ€\ќЛњ\Ъ
В€^€6*¶.v,6,H6*¶av,vb¶,H6*6.v-€6)цa6av,ц*¶a¶+ц)ц*€6a6a6`¶,v)ц(v*H6)цa6(¶a6b¶*H6*6,ц*6*6)цa6+v+6aH6(цb6a¶b6.H6)цa6ava6`H6(цb6+¶-ц(И6`¶,v)ц(v*K€6av.v,v`v)ц*€6)цa6av,ц*¶a¶+ц)ц*Ћ€	ЫЫZ]YШЭ[Y[ќЛљ›Ъ[Љ‹Љ_K€6a6)И6*¶.v*¶*6,H6aц,6aИ6)цa6av,ц*¶a¶+ц)ц*€6av*¶+v`¶`¶*H6(¶a6b¶)цbц#6b6.va¶+И6*¶(ц*цb¶,vaц)И6.va6bH6)цa6`¶,v)ц,H6)ц+¶*¶,HPS•PSФ‘U’QUЛ€JNВ€B‚€ЫЫњЭЫЫќ›Ы\€H™]ИX›ЬќЫЫќ›Ы\Љ
NВ€ЫЫњЭ[Y[Э]HЩ][Y[Э]


HO€ЫЫќ›Ы\‹X›Ьќ

KНWМ
NВ‚€]™\ЬЫњЩN€™\ЬЫњЩNВ‚€ћHВ€ЫЫњЫЫKљ[™›К”\ќ™\€RHЩ[Z[љH™\]Y\ЭЭ\ќY‹В€\ќ™\’Y€\ќ™\‹љY€[Щ[€[ЫYYШЭ[Y[ќЫЭ[ќ€\ќ™\‹™ШЭ[Y[ќЛ›[™ЭHЫZ]YШЭ[Y[ќЛ›[™Э€ЫZ]YШЭ[Y[ќЫЭ[ќ€ЫZ]YШЭ[Y[ќЛ›[™Э€[›[™Pћ]\Л€JNВ€™\ЬЫњЩHH]ШZ]™]Ъ
€О‹ЛЩЩ[™\]]™[[™ЭXYЩK™ЫЫЩЫX\\ЛЫЫKЭЊX™]KЫ[Щ[ЛЙЩ[ЫЩUT’PЫЫ\Ы™[ќ
[Щ[
_N™Щ[™\]PЫЫќ[ќЪЩ^OIЩ[ЫЩUT’PЫЫ\Ы™[ќ
\RЩ^J_X€В€Y]Щ€”ФХ‹€XY\њО€В€ђЫЫќ[ќU\HЋ€\XШ][Ы‹ЪњЫЫ€‹€K€›ЩN€”УУ‹њЭљ[™ЪYћJВ€ЫЫќ[ќО€В€В€›ЫN€ќ\Щ\€‹€\ќЛ€K€K€Щ[™\][ЫђЫЫ™љYО€В€[\\]\™N€ЊK€™\ЬЫњЩSZ[YU\N€\XШ][Ы‹ЪњЫЫ€‹€K€JK€ЪYЫ[€ЫЫќ›Ы\‹њЪYЫ[€K€
NВ€Hљ[[HВ€ЫX\•[Y[Э]
[Y[Э]
NВ€B‚€ЫЫњЭ^[ШYH
]ШZ]™\ЬЫњЩKљњЫЫЉ
JH\ИЩ[Z[љT™\ЬЫњЩNВ‚€ЫЫњЫЫKљ[™›К”\ќ™\€RHЩ[Z[љH™\ЬЫњЩH™XЩZ]™Y‹В€\ќ™\’Y€\ќ™\‹љY€[Щ[€Э]\О€™\ЬЫњЩKњЭ]\Л€ЪО€™\ЬЫњЩK›ЪЛ€\РШ[™Y]N€›ЫЫX[Љ^[ШYШ[™Y]\ПЛ–МJK€\њ›Ь“Y\ЬШYЩN€^[ШY™\њ›ЬЏЛ›Y\ЬШYЩHПИќ[€JNВ‚€Y€
\™\ЬЫњЩK›ЪКHВ€›ЭИ™]И\њ›ЬЉ€^[ШY™\њ›ЬЏЛ›Y\ЬШYЩHСSRS’WТЙЬ™\ЬЫњЩKњЭ]\ЯX€
NВ€B‚€ЫЫњЭ]Х^B€^[ШYШ[™Y]\ПЛ–МOЛЫЫќ[ќЛњ\ќВ€Л›X\

\ќ
HO€\ќќ^ПИ€ЉB€љ›Ъ[Љ€ЉB€ќљ[J
HПИ€ЋВ‚€Y€
\]Х^
HВ€›ЭИ™]И\њ›ЬЉ‘СSRS’WСSTWФ‘TФУ”СHЉNВ€B‚€]\њЩY€™XЫЬ™Эљ[™Л[љЫ›ЭЫЏЋВ‚€ћHВ€\њЩYH”УУ‹њ\њЩJ]Х^
H\И™XЫЬ™Эљ[™Л[љЫ›ЭЫЏЋВ€HШ]ЪВ€›ЭИ™]И\њ›ЬЉ‘СSRS’WТS•ђSQТ”УУ€ЉNВ€B‚€ЫЫњЭ[ЭЩYШЭ[Y[ќYИH™]ИЩ]
€\ќ™\‹™ШЭ[Y[ќЛ›X\

][JHO€][KљY
K€
NВ‚€ЫЫњЭZR\ЬЭY\ИH›Ь›X[^™R\ЬЭY\К\њЩYљ\ЬЭY\КNВ€ЫЫњЭ\ЬЭY\ИHY\™ЩR\ЬЭY\Кќ[R\ЬЭY\ЛZR\ЬЭY\КNВ‚€]Э]ЫЫYHH›Ь›X[^™SЭ]ЫЫYJ\њЩY›Э]ЫЫYJNВ‚€Y€
ќ[R\ЬЭY\ЛњЫЫYJ
\ЬЭYJHO€\ЬЭYKњЩ]™\љ]HOOH‘T”“Ф€ЉJHВ€Э]ЫЫYHH“‘QQЧРУУTUSУ€ЋВ€H[ЩHY€
ЫZ]YШЭ[Y[ќЛ›[™Э€	‰€Э]ЫЫYHOOH”‘PQHЉHВ€Э]ЫЫYHH“PS•PSФ‘U’QUИЋВ€B‚€ЫЫњЭ™]љY]ЩY]H™]И]J
KќТTУФЭљ[™К
NВ‚€ЫЫњЭ™\Э[€\ќ™\ђZT™]љY]Ф™\Э[HВ€Э]ЫЫYK€Э[[X\ћN‚€ЫX[•^
\њЩYњЭ[[X\ћJH€
Э]ЫЫYHOOH”‘PQH‚€И¶)ц`ц*¶ava6*€6)цa6av,v)ц+6.v*H6)цa6(¶a6b¶*H6b6a6aH6b¶.6aц,H6a¶`¶-H6b6)ц-¶+K€‚€€¶)ц`ц*¶ava6*€6)цa6av,v)ц+6.v*H6)цa6(¶a6b¶*H6av.H6b6+6b6+И6ava6)ц+v.6)ц*€6*¶+v*¶)ц+6av*¶)ц*6.v*K€ЉK€\ќ™\“Y\ЬШYЩN‚€ЫX[•^
\њЩYњ\ќ™\“Y\ЬШYЩJH€
Э]ЫЫYHOOH“‘QQЧРУУTUSУ€‚€И¶a¶+v*¶)ц+6)ц,ц*¶`цav)цa6*6.v-€6)цa6*6b¶)цa¶)ц*€6(цb6)цa6av,ц*¶a¶+ц)ц*€6`¶*6a6av*¶)ц*6.v*H6-цa6*6)цa6-6,v)ц`ц*K€‚€€¶)ц`ц*¶ava6*€6)цa6av,v)ц+6.v*H6)цa6(¶a6b¶*H6a6-цa6*6`цaH6b6*¶aH6*¶+vb6b¶a6aИ6a6a6av,v)ц+6.v*H6)цa6)v+ц)ц,vb¶*K€ЉK€YZ[“Y\ЬШYЩN‚€ЫX[•^
\њЩYYZ[“Y\ЬШYЩJH€¶*¶av*€6)цa6av,v)ц+6.v*H6)цa6(¶a6b¶*H6a6a6-цa6*€6b¶,v+6bH6av,v)ц+6.v*H6)цa6*¶`¶,vb¶,H6b6)цa6b6*ц)ц)¶`€6`¶*6a6)ц*¶+¶)ц,6(цb€6`¶,v)ц,H6)v+ц)ц,vb‹€‹€\ЬЭY\Л€ШЭ[Y[ќ™\Э[О€›Ь›X[^™QШЭ[Y[ќ™\Э[К€\њЩY™ШЭ[Y[ќ™\Э[Л€[ЭЩYШЭ[Y[ќYЛ€
K€[Щ[€™]љY]ЩY]€NВ‚€ЫЫњЫЫKљ[™›К”\ќ™\€RH™\Э[\њЩY‹В€\ќ™\’Y€\ќ™\‹љY€Э]ЫЫYN€™\Э[›Э]ЫЫYK€\ЬЭYPЫЭ[ќ€™\Э[љ\ЬЭY\Л›[™Э€ШЭ[Y[ќ™\Э[ЫЭ[ќ€™\Э[™ШЭ[Y[ќ™\Э[Л›[™Э€JNВ‚€]ШZ]љ\ЫXK‰[њШXЭ[ЫЉ\Ю[И

HO€В€ЫЫњЭ™^Э]\ИB€™\Э[›Э]ЫЫYHOOH“‘QQЧРУУTUSУ€‚€И“‘QQЧРУУTUSУ€‚€€•S‘T—Ф‘U’QUИЋВ‚€]ШZ]њ\ќ™\‹ќ\]JВ€Ъ\™N€ИY€\ќ™\‹љYK€]N€В€Э]\О€™^Э]\Л€™]љY]ЩY]€™]И]J™]љY]ЩY]
K€ЫЫ\][Ы“›Э\О‚€™\Э[›Э]ЫЫYHOOH“‘QQЧРУУTUSУ€‚€И™\Э[њ\ќ™\“Y\ЬШYЩB€€ќ[€™]љY]У›Э\О€”УУ‹њЭљ[™ЪYћJ™\Э[
K€K€JNВ‚€›Ь€
ЫЫњЭШЭ[Y[ќЩ€\ќ™\‹™ШЭ[Y[ќКHВ€ЫЫњЭZT™\Э[H™\Э[™ШЭ[Y[ќ™\Э[Л™љ[™
€
][JHO€][K™ШЭ[Y[ќYOOHШЭ[Y[ќљY€
NВ‚€ЫЫњЭШ\УЫZ]YHЫZ]YШЭ[Y[ќЛљ[ЫY\КШЭ[Y[ќљY
NВ‚€]ШZ]њ\ќ™\‘ШЭ[Y[ќќ\]JВ€Ъ\™N€ИY€ШЭ[Y[ќљYK€]N€В€ZTЭ]\О€Ш\УЫZ]Y€Иќ[€€ZT™\Э[ЛњЭ]\ИПИђRWФ‘U’QUСQ‹€ZS›Э\О€Ш\УЫZ]Y€И¶*¶.v,6,H6`v+v-H6aц,6)И6)цa6av,ц*¶a¶+И6(¶a6b¶)цbИ6b6b¶+v*¶)ц+6av,v)ц+6.v*H6*6-6,vb¶*K€‚€€ZT™\Э[Л››Э\И¶*¶av*€6av,v)ц+6.v*H6)цa6av,ц*¶a¶+И6(¶a6b¶)цbЛ€‹€K€JNВ€B‚€]ШZ]]Y]ЩЛЬ™X]JВ€]N€В€XЭ[ЫЋ€”T•‘T—РRWФ‘U’QUЧРУУTUQ‹€[ќ]U\N€”\ќ™\€‹€[ќ]RY€\ќ™\‹љY€Yќ\‘]N€В€Э]\О€™^Э]\Л€Э]ЫЫYN€™\Э[›Э]ЫЫYK€[Щ[€™\Э[›[Щ[€\ЬЭYPЫЭ[ќ€™\Э[љ\ЬЭY\Л›[™Э€ЫZ]YШЭ[Y[ќYО€ЫZ]YШЭ[Y[ќЛ€K€K€JNВ€JNВ‚€ЫЫњЫЫKљ[™›К”\ќ™\€RH™]љY]И\њЪ\ЭY‹В€\ќ™\’Y€\ќ™\‹љY€Э]ЫЫYN€™\Э[›Э]ЫЫYK€™]љY]ЩY]€™\Э[њ™]љY]ЩY]€JNВ‚€™]\›€™\Э[ВџB