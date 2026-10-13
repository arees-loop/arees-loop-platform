import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export const runtime = "nodejs";

const IMAGE_EXTENSIONS = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
} as const;

function validImageHeader(type: string, b: Uint8Array) {
  if (type === "image/png") {
    return b.length >= 8 && [137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v);
  }
  if (type === "image/jpeg") {
    return b.length >= 3 && b[0]===255 && b[1]===216 && b[2]===255;
  }
  if (type === "image/webp") {
    return b.length >= 12 && String.fromCharCode(...b.slice(0,4))==="RIFF"
      && String.fromCharCode(...b.slice(8,12))==="WEBP";
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success:false, message:"سجل الدخول أولاً." }, { status:401 });
    }
    if (!["PARTNER_OWNER","PARTNER_ADMIN"].includes(session.user.role) || !session.user.emailVerifiedAt) {
      return NextResponse.json({ success:false, message:"يجب توثيق حساب الشريك قبل رفع الشعار." }, { status:403 });
    }

    const membership = await prisma.partnerMember.findFirst({
      where: { userId:session.user.id, isActive:true },
      include: { partner:{select:{ id:true, partnerType:true, status:true }} },
      orderBy: { createdAt:"desc" },
    });
    if (!membership || membership.partner.partnerType !== "GOVERNMENT_NONPROFIT") {
      return NextResponse.json({success:false,message:"رفع شعار الجهة متاح لطلبات الجهات الحكومية وغير الربحية فقط."}, {status:403});
    }
    if (!["DRAFT","SUBMITTED","UNDER_REVIEW","NEEDS_COMPLETION"].includes(membership.partner.status)) {
      return NextResponse.json({success:false,message:"لا يمكن تعديل الشعار بعد اعتماد الطلب أو إغلاقه. تواصل مع إدارة المنصة."},{status:409});
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({success:false,message:"اختر ملف الشعار الرسمي."},{status:400});
    }
    const extension = IMAGE_EXTENSIONS[file.type as keyof typeof IMAGE_EXTENSIONS];
    if (!extension) {
      return NextResponse.json({success:false,message:"يسمح بشعار PNG أو JPG أو WEBP فقط."},{status:415});
    }
    if (file.size > 3*1024*1024) {
      return NextResponse.json({success:false,message:"يجب ألا يزيد حجم الشعار عن 3 ميجابايت."},{status:413});
    }
    const header = new Uint8Array(await file.slice(0,16).arrayBuffer());
    if (!validImageHeader(file.type,header)) {
      return NextResponse.json({success:false,message:"محتوى الملف لا يطابق صيغة الصورة المختارة."},{status:415});
    }

    const pathname = `partners/${membership.partnerId}/logos/${crypto.randomUUID()}.${extension}`;
    const blob = await put(pathname, file, {
      access:"private",
      addRandomSuffix:false,
      contentType:file.type,
    });
    const logoUrl = `/api/media?pathname=${encodeURIComponent(blob.pathname)}`;

    await prisma.$transaction([
      prisma.partner.update({where:{id:membership.partnerId},data:{logoUrl}}),
      prisma.auditLog.create({
        data:{
          userId:session.user.id,
          action:"GOVERNMENT_PARTNER_LOGO_UPLOADED",
          entityType:"Partner",
          entityId:membership.partnerId,
          afterData:{blobPath:blob.pathname,verificationStatus:"PENDING_ADMIN_REVIEW"},
        },
      }),
    ]);

    return NextResponse.json({success:true,message:"رُفع الشعار وأُرسل لمراجعة أريس.",logoUrl});
  } catch (error) {
    console.error("POST /api/partner/logo failed:",error);
    return NextResponse.json({success:false,message:"تعذر حفظ الشعار حالياً."},{status:500});
  }
}
