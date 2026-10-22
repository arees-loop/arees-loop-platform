import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { getActivePartnerMembership } from "@/lib/partner-permissions";
import { runPartnerApplicationWorkflow } from "@/lib/partners/application-workflow";
import {
  checkRateLimit,
  createIdentityRateLimitKey,
  getRateLimitHeaders,
} from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب تسجيل الدخول أولاً.",
        },
        { status: 401 },
      );
    }

    if (
      session.user.role !== "PARTNER_OWNER" &&
      session.user.role !== "PARTNER_ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "هذا الحساب غير مخول لإرسال طلب الشراكة للمراجعة.",
        },
        { status: 403 },
      );
    }

    const limit = checkRateLimit({
      key: createIdentityRateLimitKey(
        "partner-ai-review",
        session.user.id,
      ),
      limit: 4,
      windowMs: 1000 * 60 * 15,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message:
            "تم طلب المراجعة عدة مرات خلال وقت قصير. حاول مرة أخرى بعد قليل.",
        },
        {
          status: 429,
          headers: getRateLimitHeaders(limit),
        },
      );
    }

    const active = await getActivePartnerMembership(session.user.id);
    const membership = active ? await prisma.partnerMember.findFirst({
      where: { userId: session.user.id, partnerId: active.partnerId, isActive: true },
      include: { partner: { include: {
        documents: { select: { id: true, label: true, fileName: true, type: true } },
        licenses: { select: { type: true, issuer: true, licenseNumber: true, expiryDate: true } },
        guideAreas: { where:{isActive:true}, select:{city:true,label:true,latitude:true,longitude:true,radiusKm:true} }
      } } },
    }) : null;

    if (!membership) {
      return NextResponse.json(
        {
          success: false,
          message: "لا يوجد طلب شراكة مرتبط بهذا الحساب.",
        },
        { status: 404 },
      );
    }

    const partner = membership.partner;

    if (
      partner.status === "ACTIVE" ||
      partner.status === "APPROVED" ||
      partner.status === "WAITING_AGREEMENT" ||
      partner.status === "AGREEMENT_ACCEPTED" ||
      partner.status === "REJECTED" ||
      partner.status === "SUSPENDED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "حالة الطلب الحالية لا تسمح بإعادة إرسال الطلب للمراجعة.",
        },
        { status: 409 },
      );
    }

    if (partner.documents.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "يجب رفع مستند واحد على الأقل قبل إرسال الطلب للمراجعة.",
        },
        { status: 400 },
      );
    }

    if (partner.partnerType === "INDIVIDUAL") {
      const documents = partner.documents;
      const licenses = partner.licenses;
      const validLicences=licenses.filter(l=>l.issuer.trim()&&l.licenseNumber.trim()&&
        l.expiryDate && l.expiryDate.getTime()>Date.now());
      const hasWork=validLicences.some(l=>l.type.includes("عمل حر"));
      const hasGuide=validLicences.some(l=>/مرشد|إرشاد/.test(l.type));
      const hasDocument=(matcher:(x:string)=>boolean)=>documents.some(d=>
        matcher(String(d.label||"")) && Boolean(d.fileName));
      const hasLicenseScans=hasDocument(x=>x.includes("عمل حر")) &&
        hasDocument(x=>/مرشد|إرشاد/.test(x));
      const hasPortrait=typeof partner.logoUrl==="string" &&
        partner.logoUrl.includes(`partners%2F${partner.id}%2Fguide-portraits%2F`);
      const hasBank=Boolean(partner.bankName?.trim() && partner.beneficiaryName?.trim() &&
        /^SA\d{22}$/.test(partner.iban||""));
      const hasCoverage=partner.guideAreas.length>0 && partner.guideAreas.every(a=>
        Boolean(a.city&&a.label)&&a.radiusKm===50&&
        Number.isFinite(Number(a.latitude))&&Number.isFinite(Number(a.longitude)));
      if(!hasWork || !hasGuide || !hasLicenseScans || !hasPortrait || !hasBank || !hasCoverage){
        return NextResponse.json({success:false,
          message:"طلب المرشد غير مكتمل. تحقق من رخصة الإرشاد ووثيقة العمل الحر ومرفقيهما، والصورة الشخصية، والحساب البنكي والمسارات المؤكدة بنطاق 50 كم.",
          missing:{guideLicense:!hasGuide,freelanceLicense:!hasWork,licenseAttachments:!hasLicenseScans,
            portrait:!hasPortrait,bankAccount:!hasBank,coverage:!hasCoverage}
        },{status:400});
      }
    }

    const previousStatus = partner.status;

    const workflow = await runPartnerApplicationWorkflow({
      partnerId: partner.id,
      legalNameAr: partner.legalNameAr,
      tradeNameAr: partner.tradeNameAr,
      partnerEmail: session.user.email,
      status: previousStatus,
      previousStatus,
    });

    const responseMessage =
      workflow.status === "NEEDS_COMPLETION"
        ? "تمت مراجعة الطلب ويوجد استكمال مطلوب."
        : "تم استلام الطلب وتحويله للمراجعة الإدارية.";

    return NextResponse.json(
      {
        success: true,
        message: responseMessage,
        application: {
          id: partner.id,
          status: workflow.status,
        },
        review: workflow.aiReview
          ? {
              outcome: workflow.aiReview.outcome,
              summary: workflow.aiReview.summary,
              partnerMessage: workflow.aiReview.partnerMessage,
              issues: workflow.aiReview.issues,
            }
          : {
              outcome: "MANUAL_REVIEW",
              summary:
                "تم استلام الطلب وتحويله للمراجعة الإدارية.",
              partnerMessage:
                "تم استلام طلبكم وتحويله للمراجعة الإدارية.",
              issues: [],
            },
      },
      {
        status: 200,
        headers: getRateLimitHeaders(limit),
      },
    );
  } catch (error) {
    console.error(
      "POST /api/partner/application/review failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "تعذر إرسال الطلب للمراجعة حالياً. تم حفظ الطلب ويمكن إعادة المحاولة.",
      },
      { status: 500 },
    );
  }
}
