import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

async function authorize() {
  const session = await getCurrentSession();
  if (!session) return { error: NextResponse.json({ success: false, message: "يلزم تسجيل الدخول." }, { status: 401 }) };
  if (session.user.role !== "SUPER_ADMIN") return { error: NextResponse.json({ success: false, message: "هذا الإجراء مخصص للسوبر أدمن." }, { status: 403 }) };
  return { userId: session.user.id };
}

function parseWebsite(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  if (value.length > 300) throw new Error("رابط الشريك طويل جداً.");
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || !url.hostname || url.username || url.password) {
      throw new Error("الرابط غير صالح.");
    }
    return url.toString();
  } catch {
    throw new Error("أدخل رابط موقع إلكتروني صحيحاً يبدأ بـ https://");
  }
}

async function saveLogo(file: File, id: string) {
  const ext = TYPES[file.type];
  if (!ext) throw new Error("صيغة الشعار يجب أن تكون PNG أو JPG أو WEBP.");
  if (file.size <= 0 || file.size > 3 * 1024 * 1024) {
    throw new Error("حجم الشعار يجب أن يكون بين 1 بايت و3 ميجابايت.");
  }
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const valid = file.type === "image/png"
    ? [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => header[i] === n)
    : file.type === "image/jpeg"
      ? header[0] === 255 && header[1] === 216 && header[2] === 255
      : String.fromCharCode(...header.slice(0, 4)) === "RIFF" && String.fromCharCode(...header.slice(8, 12)) === "WEBP";
  if (!valid) throw new Error("محتوى الملف لا يطابق نوع الصورة.");
  const pathname = `success-partners/${id}/${crypto.randomUUID()}.${ext}`;
  const blob = await put(pathname, file, {
    access: "private",
    addRandomSuffix: false,
    contentType: file.type,
  });
  return `/api/media?pathname=${encodeURIComponent(blob.pathname)}`;
}

function failure(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET() {
  const admin = await authorize();
  if (admin.error) return admin.error;
  try {
    const entries = await prisma.successPartner.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      take: 200,
    });
    return NextResponse.json({ success: true, data: entries }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/admin/success-partners failed", error);
    return failure("تعذر قراءة الشركاء. تحقق من قاعدة البيانات والترحيل.", 503);
  }
}

export async function POST(request: NextRequest) {
  const admin = await authorize();
  if (admin.error) return admin.error;
  try {
    const form = await request.formData();
    const name = String(form.get("name") ?? "").trim();
    if (!name || name.length > 120) return failure("اسم الشريك مطلوب (بحد أقصى 120 حرفاً).");
    const file = form.get("file");
    if (!(file instanceof File)) return failure("اختر الشعار المراد رفعه.");
    const websiteUrl = parseWebsite(String(form.get("websiteUrl") ?? ""));
    const id = crypto.randomUUID();
    // Check the table is accessible before creating a remote file.
    await prisma.successPartner.findFirst({ select: { id: true } });
    const logoUrl = await saveLogo(file, id);
    const last = await prisma.successPartner.aggregate({ _max: { sortOrder: true } });
    const entry = await prisma.successPartner.create({
      data: { id, name, logoUrl, websiteUrl, sortOrder: Math.min((last._max.sortOrder ?? -1) + 1, 9999), isVisible: true },
    });
    await prisma.auditLog.create({
      data: { userId: admin.userId, action: "SUCCESS_PARTNER_ADDED", entityType: "SuccessPartner", entityId: id, afterData: { name, logoUrl, websiteUrl } },
    }).catch(err => console.error("Success partner audit insert failed", err));
    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/success-partners failed", error);
    return failure(error instanceof Error && (/الشعار|حجم|صورة|الرابط|صيغة/.test(error.message)) ? error.message : "تعذر إضافة الشريك. تحقق من خدمة الصور وقاعدة البيانات.", 400);
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await authorize();
  if (admin.error) return admin.error;
  try {
    const form = await request.formData();
    const id = String(form.get("id") ?? "");
    if (!id || id.length > 80) return failure("معرف الشريك غير صالح.");
    const previous = await prisma.successPartner.findUnique({ where: { id } });
    if (!previous) return failure("الشريك غير موجود.", 404);
    const name = String(form.get("name") ?? "").trim();
    if (!name || name.length > 120) return failure("اسم الشريك مطلوب (بحد أقصى 120 حرفاً).");
    const websiteUrl = parseWebsite(String(form.get("websiteUrl") ?? ""));
    const isVisible = String(form.get("isVisible") ?? "true") === "true";
    const file = form.get("file");
    const logoUrl = file instanceof File && file.size > 0
      ? await saveLogo(file, id)
      : previous.logoUrl;
    const entry = await prisma.successPartner.update({
      where: { id },
      data: { name, websiteUrl, isVisible, logoUrl },
    });
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "SUCCESS_PARTNER_UPDATED",
        entityType: "SuccessPartner",
        entityId: id,
        beforeData: { name: previous.name, isVisible: previous.isVisible, websiteUrl: previous.websiteUrl },
        afterData: { name, isVisible, websiteUrl, logoChanged: previous.logoUrl !== logoUrl },
      },
    }).catch(err => console.error("Success partner audit insert failed", err));
    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error("PATCH /api/admin/success-partners failed", error);
    return failure(error instanceof Error && (/الشعار|حجم|صورة|الرابط|صيغة/.test(error.message)) ? error.message : "تعذر تعديل الشريك.");
  }
}

export async function PUT(request: NextRequest) {
  const admin = await authorize();
  if (admin.error) return admin.error;
  try {
    const body = await request.json();
    const ids: unknown = body?.ids;
    if (!Array.isArray(ids) || ids.length > 200 || !ids.every(v => typeof v === "string") || new Set(ids).size !== ids.length) {
      return failure("قائمة الترتيب غير صالحة.");
    }
    const existing = await prisma.successPartner.findMany({ select: { id: true } });
    if (ids.length !== existing.length || ids.some(id => !existing.some(x => x.id === id))) {
      return failure("تغيرت قائمة الشركاء. حدّث الصفحة وحاول مرة أخرى.", 409);
    }
    await prisma.$transaction(ids.map((id, i) => prisma.successPartner.update({
      where: { id }, data: { sortOrder: i },
    })));
    await prisma.auditLog.create({
      data: { userId: admin.userId, action: "SUCCESS_PARTNERS_REORDERED", entityType: "SuccessPartner", afterData: { ids } },
    }).catch(err => console.error("Success partners reorder audit failed", err));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/admin/success-partners failed", error);
    return failure("تعذر ترتيب الشركاء.", 500);
  }
}
