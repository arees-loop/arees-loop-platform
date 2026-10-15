import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentSession } from "@/lib/session";
import { userHasPartnerPermission } from "@/lib/partner-permissions";
import { getServerImageDimensions } from "@/lib/server-image-dimensions";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ success: false, message: "غير مصرح." }, { status: 401 });
  if(!await userHasPartnerPermission(session.user.id,"services"))return NextResponse.json({success:false,message:"لا توجد صلاحية لإضافة صور الخدمة."},{status:403});

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ success: false, message: "الصورة مطلوبة." }, { status: 400 });
  if (!["image/jpeg","image/png","image/webp"].includes(file.type)) return NextResponse.json({ success: false, message: "نوع الصورة غير مدعوم." }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ success: false, message: "حجم الصورة غير مناسب. الحد الأقصى 5 MB." }, { status: 400 });
  try {
    const dimensions = await getServerImageDimensions(file);
    if(dimensions.width<100||dimensions.height<100)return NextResponse.json({success:false,message:"الصورة صغيرة للغاية."},{status:400});
  } catch {
    return NextResponse.json({ success: false, message: "تعذر قراءة أبعاد الصورة." }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const blob = await put(`services/${session.user.id}/${Date.now()}-${safeName}`, file, { access: "private", addRandomSuffix: true });
  return NextResponse.json({ success: true, url: `/api/media?pathname=${encodeURIComponent(blob.pathname)}`, pathname: blob.pathname });
}
