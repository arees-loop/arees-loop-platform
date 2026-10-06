import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentSession } from "@/lib/session";
import sharp from "sharp";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ success: false, message: "غير مصرح." }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ success: false, message: "الصورة مطلوبة." }, { status: 400 });
  if (!["image/jpeg","image/png","image/webp"].includes(file.type)) return NextResponse.json({ success: false, message: "نوع الصورة غير مدعوم." }, { status: 400 });
  if (file.size > 2 * 1024 * 1024) return NextResponse.json({ success: false, message: "حجم الصورة غير مناسب. الحد الأقصى 2 MB." }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const metadata = await sharp(bytes).metadata();
  if (metadata.width !== 1080 || metadata.height !== 1080) return NextResponse.json({ success: false, message: `مقاس الصورة غير مناسب (${metadata.width ?? "?"}×${metadata.height ?? "?"}). المطلوب 1080×1080 بكسل.` }, { status: 400 });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const blob = await put(`services/${session.user.id}/${Date.now()}-${safeName}`, bytes, { access: "private", contentType: file.type, addRandomSuffix: true });
  return NextResponse.json({ success: true, url: `/api/media?pathname=${encodeURIComponent(blob.pathname)}`, pathname: blob.pathname });
}
