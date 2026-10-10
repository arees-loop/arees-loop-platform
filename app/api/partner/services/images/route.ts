import {prisma} from "@/lib/prisma";
import {canManagePartnerServices} from "@/lib/partner-permissions";
import {matchesLicenseDocument} from "@/lib/license-document";
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ success: false, message: "غير مصرح." }, { status: 401 });

  const member=await prisma.partnerMember.findFirst({where:{userId:session.user.id,isActive:true},orderBy:{createdAt:"desc"},select:{permissions:true,partner:{select:{status:true}}}});
  if(!member||member.partner.status!=="ACTIVE"||!canManagePartnerServices(member.permissions))return NextResponse.json({success:false,message:"ليس لديك صلاحية رفع صور الخدمات"},{status:403});
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ success: false, message: "الصورة مطلوبة." }, { status: 400 });
  if (!["image/jpeg","image/png","image/webp"].includes(file.type)) return NextResponse.json({ success: false, message: "نوع الصورة غير مدعوم." }, { status: 400 });
  if (file.size===0 || file.size > 5 * 1024 * 1024) return NextResponse.json({ success: false, message: "حجم الصورة غير مناسب. الحد الأقصى 5 MB." }, { status: 400 });

  if(!matchesLicenseDocument(new Uint8Array(await file.slice(0,12).arrayBuffer()),file.type))return NextResponse.json({success:false,message:"محتوى الصورة لا يطابق نوعها"},{status:400});
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const blob = await put(`services/${session.user.id}/${Date.now()}-${safeName}`, file, { access: "private", addRandomSuffix: true });
  return NextResponse.json({ success: true, url: `/api/media?pathname=${encodeURIComponent(blob.pathname)}`, pathname: blob.pathname });
}
