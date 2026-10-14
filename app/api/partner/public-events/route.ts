import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { getActivePartnerMembership, userHasPartnerPermission } from "@/lib/partner-permissions";

async function membership() {
  const session = await getCurrentSession();
  if (!session) return null;
  if (!await userHasPartnerPermission(session.user.id, "services")) return { session, member: null };
  const member = await getActivePartnerMembership(session.user.id);
  return { session, member };
}

function reject(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

function clean(value: unknown, max = 4000) {
  return typeof value === "string" ? value.trim().slice(0,max) : "";
}
function httpUrl(value: unknown) {
  const v=clean(value, 1000);
  if (!v) return null;
  try { const u = new URL(v); return ["https:","http:"].includes(u.protocol) ? u.href : null; } catch { return null; }
}

export async function GET() {
  try {
    const auth=await membership();
    if (!auth) return reject("يجب تسجيل الدخول.",401);
    if (!auth.member || auth.member.partner.partnerType !== "GOVERNMENT_NONPROFIT") return reject("القائمة متاحة للجهات الحكومية وغير الربحية فقط.",403);
    const items=await prisma.publicEvent.findMany({where:{partnerId:auth.member.partnerId},orderBy:{createdAt:"desc"},take:100});
    return NextResponse.json({success:true,data:items,partnerName:auth.member.partner.publicName||auth.member.partner.legalNameAr});
  } catch(e) { console.error("public event GET",e); return reject("تعذر جلب الفعاليات. قد يلزم تفعيل جدول الفعاليات.",503); }
}

export async function POST(request:NextRequest) {
  try {
    const auth=await membership();
    if (!auth) return reject("يجب تسجيل الدخول.",401);
    const member=auth.member;
    if (!member || member.partner.partnerType !== "GOVERNMENT_NONPROFIT") return reject("إضافة الفعاليات متاحة للجهات الحكومية وغير الربحية فقط.",403);
    if (member.partner.status !== "ACTIVE") return reject("يلزم اعتماد الجهة وتفعيل الحساب قبل نشر الفعاليات.",403);
    const b=await request.json().catch(()=>null);
    if (!b || !["EVENT","PROGRAM"].includes(b.kind)) return reject("اختر فعالية أو برنامجاً.",400);
    const nameAr=clean(b.nameAr,180),nameEn=clean(b.nameEn,180),descriptionAr=clean(b.descriptionAr,8000),descriptionEn=clean(b.descriptionEn,8000);
    const city=clean(b.city,100),locationName=clean(b.locationName,180);
    if (![nameAr,nameEn,descriptionAr,descriptionEn,city,locationName].every(Boolean)) return reject("أكمل العنوان والوصف بالعربية والإنجليزية والمدينة والموقع.",400);
    const startsAt=new Date(b.startsAt),endsAt=new Date(b.endsAt);
    if (!Number.isFinite(startsAt.valueOf()) || !Number.isFinite(endsAt.valueOf()) || endsAt < startsAt) return reject("أدخل تاريخ بداية ونهاية صحيحين.",400);
    const latitude=b.latitude==="" || b.latitude==null ? null : Number(b.latitude);
    const longitude=b.longitude==="" || b.longitude==null ? null : Number(b.longitude);
    if ((latitude!==null && (!Number.isFinite(latitude)||Math.abs(latitude)>90)) || (longitude!==null && (!Number.isFinite(longitude)||Math.abs(longitude)>180))) return reject("إحداثيات الموقع غير صحيحة.",400);
    // Public direct publishing is restricted to approved government/nonprofit partners only.
    // Store poster by pre-existing verified URL; do not allow untrusted arbitrary external upload.
    const posterUrl=clean(b.posterUrl,1100);
    if (posterUrl && !posterUrl.startsWith("/api/media?pathname=") && !posterUrl.startsWith("https://")) return reject("رابط صورة الفعالية غير صالح.",400);
    const item=await prisma.publicEvent.create({data:{
      partnerId:member.partnerId,createdByUserId:auth.session.user.id,kind:b.kind,
      nameAr,nameEn,descriptionAr,descriptionEn,
      includesAr:clean(b.includesAr,5000)||null,includesEn:clean(b.includesEn,5000)||null,
      excludesAr:clean(b.excludesAr,5000)||null,excludesEn:clean(b.excludesEn,5000)||null,
      notesAr:clean(b.notesAr,5000)||null,notesEn:clean(b.notesEn,5000)||null,
      city,locationName,latitude,longitude,posterUrl:posterUrl||null,
      startsAt,endsAt,registrationUrl:httpUrl(b.registrationUrl),
      status:"PUBLISHED",publishedAt:new Date(),
    }});
    return NextResponse.json({success:true,data:item},{status:201});
  } catch(e) { console.error("public event POST",e); return reject("تعذر حفظ الفعالية. تأكد من تفعيل جدول الفعاليات وإعداد الصور.",503); }
}
