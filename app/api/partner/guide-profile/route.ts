import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { getActivePartnerMembership } from "@/lib/partner-permissions";

const ALLOWED_CATEGORIES = new Set(["هايكينق", "مغامرات", "تاريخ", "آثار", "ثقافة وتراث", "طبيعة", "أخرى"]);
type RawArea = {id?: unknown; city?: unknown; label?: unknown; category?: unknown; notes?: unknown; latitude?: unknown; longitude?: unknown; radiusKm?: unknown};
type GuideProfileBody = { areas?: RawArea[]; bankName?: unknown; iban?: unknown; beneficiaryName?: unknown; guideSpecialty?: unknown; guideLanguages?: unknown; publicName?: unknown };

const clean = (x:unknown, max=150) => typeof x === "string" ? x.trim().slice(0,max) : "";
const invalid = (message:string,status=400) => NextResponse.json({success:false,message},{status});
const editable = new Set(["DRAFT","SUBMITTED","UNDER_REVIEW","NEEDS_COMPLETION"]);

async function getGuide() {
  const session = await getCurrentSession();
  if (!session || !["PARTNER_OWNER","PARTNER_ADMIN"].includes(session.user.role) || !session.user.emailVerifiedAt) return null;
  const membership = await getActivePartnerMembership(session.user.id);
  if (!membership || membership.partner.partnerType !== "INDIVIDUAL") return null;
  return {session,membership};
}

export async function GET() {
  const guide = await getGuide();
  if (!guide) return invalid("لا توجد صلاحية للوصول إلى ملف المرشد.",403);
  const areas = await prisma.guideServiceArea.findMany({
    where:{partnerId:guide.membership.partnerId,isActive:true},
    select:{id:true,city:true,label:true,category:true,notes:true,latitude:true,longitude:true,radiusKm:true},
    orderBy:{createdAt:"asc"}
  });
  return NextResponse.json({success:true,areas:areas.map(a=>({...a,latitude:Number(a.latitude),longitude:Number(a.longitude)}))});
}

export async function POST(request:NextRequest) {
  try {
    const guide = await getGuide();
    if (!guide) return invalid("يجب الدخول بحساب المرشد المؤكد أولاً.",403);
    const {session,membership} = guide;
    if (!editable.has(membership.partner.status)) return invalid("الملف معتمد أو مقفل. التعديلات الجديدة تتطلب مراجعة الإدارة.",409);
    const body = (await request.json()) as GuideProfileBody;
    if (!Array.isArray(body.areas) || body.areas.length<1 || body.areas.length>20)
      return invalid("حدد مسار إرشاد واحداً على الأقل وبحد أقصى 20 مساراً.");
    const bankName = clean(body.bankName,120);
    const iban = clean(body.iban,24).replace(/\s/g,"").toUpperCase();
    const beneficiaryName = clean(body.beneficiaryName,160);
    if (!bankName || !/^SA\d{22}$/.test(iban) || !beneficiaryName)
      return invalid("اسم البنك، آيبان سعودي صحيح، واسم صاحب الحساب إلزامية للمرشد.");
    const specialty=clean(body.guideSpecialty,160),languages=clean(body.guideLanguages,180);
    if(!specialty||!languages)return invalid("تخصص الإرشاد واللغات إلزاميان.");
    const areas: Array<{id:string|null;city:string;label:string;category:string;notes:string|null;latitude:number;longitude:number;radiusKm:number}> = [];
    for (const raw of body.areas) {
      const city=clean(raw.city,80),label=clean(raw.label,140),category=clean(raw.category,60),notes=clean(raw.notes,500);
      const lat=Number(raw.latitude),lng=Number(raw.longitude);
      if(!city||!label||!ALLOWED_CATEGORIES.has(category)||!Number.isFinite(lat)||!Number.isFinite(lng)||lat<16||lat>33||lng<34||lng>56||raw.radiusKm!==50)
        return invalid("أكمل المدينة والموقع الجغرافي داخل السعودية وتصنيف المسار ونطاق 50 كم لكل مسار.");
      areas.push({id:clean(raw.id,80)||null,city,label,category,notes:notes||null,latitude:lat,longitude:lng,radiusKm:50});
    }
    const old = await prisma.guideServiceArea.findMany({where:{partnerId:membership.partnerId},select:{id:true}});
    const oldIds=new Set(old.map(item=>item.id));
    const selectedIds=areas.map(a=>a.id).filter((id):id is string=>Boolean(id));
    if(selectedIds.some(id=>!oldIds.has(id))||new Set(selectedIds).size!==selectedIds.length)
      return invalid("أحد المسارات لا يتبع لهذا المرشد.",403);
    const previousDescription=membership.partner.descriptionAr||"";
    const overview=previousDescription
      .replace(/^تخصص المرشد:.*\r?\n?/gm,"")
      .replace(/^اللغات:.*\r?\n?/gm,"")
      .trim();
    const descriptionAr=`تخصص المرشد: ${specialty}\nاللغات: ${languages}\n${overview}`.trim();
    await prisma.$transaction(async tx=>{
      for (const area of areas) {
        const data={city:area.city,label:area.label,category:area.category,notes:area.notes,latitude:area.latitude,longitude:area.longitude,radiusKm:50,isActive:true};
        if(area.id) await tx.guideServiceArea.update({where:{id:area.id,partnerId:membership.partnerId},data});
        else await tx.guideServiceArea.create({data:{...data,partnerId:membership.partnerId}});
      }
      const removed=old.filter(a=>!selectedIds.includes(a.id)).map(a=>a.id);
      if(removed.length) await tx.guideServiceArea.updateMany({where:{partnerId:membership.partnerId,id:{in:removed}},data:{isActive:false}});
      await tx.partner.update({where:{id:membership.partnerId},data:{
        bankName,iban,beneficiaryName,receivesPayments:true,
        city:areas[0].city,descriptionAr,publicName:clean(body.publicName,160)||undefined,
      }});
      await tx.auditLog.create({data:{userId:session.user.id,action:"GUIDE_PROFILE_AREAS_UPDATED",
        entityType:"Partner",entityId:membership.partnerId,
        afterData:{coveragePoints:areas.length,removedCount:removed.length,bankAccountProvided:true,submittedAt:new Date().toISOString()}}});
    });
    return NextResponse.json({success:true,message:"حُفظت معلومات المرشد والمسارات على الطلب نفسه للمراجعة، دون إنشاء طلب جديد."});
  } catch(error) {
    console.error("POST /api/partner/guide-profile failed:",error);
    return invalid("تعذر حفظ بيانات المرشد. لم يتم اعتماد تغييرات غير مكتملة.",500);
  }
}
