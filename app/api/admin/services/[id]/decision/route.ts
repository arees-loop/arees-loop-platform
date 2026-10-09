import {escapeHtml} from "@/lib/service-html";
import {serviceEligibilityWhere} from "@/lib/services/eligibility";
import {hasAdminPermission} from "@/lib/admin-permissions";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { sendEmail } from "@/lib/notifications/email";


export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session || !hasAdminPermission(session.user,"CONTENT_EXPERIENCES")) {
    return NextResponse.json({ success: false, message: "غير مصرح." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const action = String(body?.action || "");
  const reason = String(body?.reason || "").trim();

  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      partner: {
        include: {
          members: {
            where: { isActive: true },
            include: { user: { select: { email: true, firstName: true } } },
          },
        },
      },
    },
  });

  if (!service) {
    return NextResponse.json({ success: false, message: "الخدمة غير موجودة." }, { status: 404 });
  }

  if (action === "APPROVE") {
    if (service.status !== "UNDER_REVIEW") {
      return NextResponse.json({success:false,message:"لا يمكن اعتماد خدمة ليست تحت المراجعة."},{status:409});
    }
    const today=new Date(new Date().toISOString().slice(0,10)+"T00:00:00.000Z");
    const license=service.licenseId?await prisma.license.findFirst({where:{id:service.licenseId,partnerId:service.partnerId,status:"VERIFIED",expiryDate:{gte:today}},select:{id:true}}):null;
    if(service.partner.status!=="ACTIVE"||!license){
      return NextResponse.json({success:false,message:"لا يمكن نشر الخدمة: المنشأة غير نشطة أو الترخيص غير معتمد أو منتهي الصلاحية."},{status:403});
    }
    const updated=await prisma.$transaction(async tx=>{
    const changed=await tx.service.updateMany({where:{id,partnerId:service.partnerId,status:"UNDER_REVIEW",licenseId:license.id,...serviceEligibilityWhere()},data:{status:"PUBLISHED"}});
    if(changed.count!==1)return null;
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "SERVICE_APPROVED_PUBLISHED",
        entityType: "Service",
        entityId: id,
        beforeData: { status: service.status },
        afterData: { status: "PUBLISHED" },
      },
    });

    return tx.service.findUniqueOrThrow({where:{id}});
    });
    if(!updated)return NextResponse.json({success:false,message:"تغيرت حالة الخدمة أو الترخيص أثناء المراجعة."},{status:409});
    const recipients = [...new Set(service.partner.members.map((m) => m.user.email).filter(Boolean))];
    if (recipients.length) {
      await sendEmail({
        to: recipients,
        subject: "تم اعتماد ونشر خدمتك على Arees Loop",
        html: `
          <div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8">
            <h2>تم اعتماد الخدمة بنجاح</h2>
            <p>تمت الموافقة على خدمة <strong>${escapeHtml(service.nameAr)}</strong> وأصبحت منشورة للعملاء على Arees Loop.</p>
            <p>يمكنكم في أي لحظة إخفاء نشر الخدمة مؤقتاً في حالة رغبتكم في ذلك من لوحة تحكم الشريك، ثم إظهارها مجدداً عند توفرها.</p>
            <p>فريق Arees Loop</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true, data: { ...updated, finalPrice: Number(updated.finalPrice) } });
  }

  if (action === "REJECT") {
    if (!reason) {
      return NextResponse.json({ success: false, message: "سبب الرفض مطلوب." }, { status: 400 });
    }
    const updated=await prisma.$transaction(async tx=>{
    const changed=await tx.service.updateMany({where:{id,status:"UNDER_REVIEW"},data:{status:"REJECTED"}});
    if(changed.count!==1)return null;
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "SERVICE_REJECTED",
        entityType: "Service",
        entityId: id,
        beforeData: { status: service.status },
        afterData: { status: "REJECTED", reason },
      },
    });

    return tx.service.findUniqueOrThrow({where:{id}});
    });
    if(!updated)return NextResponse.json({success:false,message:"الخدمة ليست تحت المراجعة أو تغيرت حالتها."},{status:409});
    const recipients = [...new Set(service.partner.members.map((m) => m.user.email).filter(Boolean))];
    let emailSent = false;
    if (recipients.length) {
      const delivery = await sendEmail({
        to: recipients,
        subject: "ملاحظة على خدمتك في Arees Loop",
        html: `
          <div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8">
            <h2>لم يتم اعتماد الخدمة</h2>
            <p>بعد مراجعة خدمة <strong>${escapeHtml(service.nameAr)}</strong>، لم يتم اعتمادها للنشر حالياً.</p>
            <p><strong>سبب الرفض:</strong> ${escapeHtml(reason)}</p>
            <p>يمكنكم مراجعة الملاحظة وتعديل الخدمة من لوحة تحكم الشريك ثم إعادة إرسالها للمراجعة.</p>
            <p>فريق Arees Loop</p>
          </div>
        `,
      });
      emailSent = delivery.sent;
      if (!delivery.sent) console.warn("Service rejection email failed:", delivery.reason);
    }

    return NextResponse.json({ success: true, data: { ...updated, finalPrice: Number(updated.finalPrice) }, notification: { emailSent } });
  }

  return NextResponse.json({ success: false, message: "إجراء غير صالح." }, { status: 400 });
}
