import GuideAvatar from "@/app/components/GuideAvatar";
import NearbyGuideControls from "./NearbyGuideControls";
import { SAUDI_CITY_SUGGESTIONS, GUIDE_LICENSE_CATEGORIES } from "@/lib/guides/reference-data";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function GuidesPage({ searchParams }: { searchParams: Promise<{ city?: string; specialty?: string; lat?: string; lng?: string }> }) {
  const params = await searchParams;
  const city = (params.city || "").trim().slice(0, 80);
  const specialty = (params.specialty || "").trim().slice(0, 80);
  const lat = params.lat ? Number(params.lat) : NaN;
  const lng = params.lng ? Number(params.lng) : NaN;
  const nearby = Number.isFinite(lat) && Number.isFinite(lng) && lat >= 16 && lat <= 33 && lng >= 34 && lng <= 56;
  const todayUtc=new Date(new Date().toISOString().slice(0,10)+"T00:00:00.000Z");
  const guides = await prisma.partner.findMany({
    where: {
      partnerType: "INDIVIDUAL",
      status: "ACTIVE",
      licenses: { some: { status: "VERIFIED", expiryDate: { gte: todayUtc }, OR: [{ type: { contains: "إرشاد" } }, { type: { contains: "GUIDE", mode: "insensitive" } }] } },
      ...(city ? { city: { contains: city, mode: "insensitive" as const } } : {}),
      ...(specialty ? { licenses: { some: { status: "VERIFIED" as const, expiryDate: { gte: todayUtc }, type: { contains: specialty, mode: "insensitive" as const } } } } : {}),
    },
    select: { id: true, publicName: true, legalNameAr: true, descriptionAr: true, city: true, locationName: true, logoUrl: true, latitude: true, longitude: true, licenses: { where: { status: "VERIFIED", expiryDate: { gte: todayUtc } }, select: { type: true }, take: 3 } },
    orderBy: { activatedAt: "desc" },
    take: nearby ? 500 : 48,
  });

  const approvedApplications=await prisma.guideApplication.findMany({where:{status:"APPROVED",licenseExpiresAt:{gte:todayUtc},...(city?{city:{contains:city,mode:"insensitive" as const}}:{}),...(specialty?{OR:[{licenseCategory:{contains:specialty,mode:"insensitive" as const}},{specialization:{contains:specialty,mode:"insensitive" as const}}]}:{})},select:{id:true,fullName:true,gender:true,countries:true,city:true,licenseCategory:true,specialization:true,languages:true,bio:true,photoPath:true,photoPublicationConsent:true},orderBy:{reviewedAt:"desc"},take:48});
  const distanceKm = (g: {latitude: unknown; longitude: unknown}) => { const a=Number(g.latitude), b=Number(g.longitude); if(!Number.isFinite(a)||!Number.isFinite(b)||g.latitude==null||g.longitude==null)return Infinity; const dLat=(a-lat)*Math.PI/180,dLng=(b-lng)*Math.PI/180;const h=Math.sin(dLat/2)**2+Math.cos(lat*Math.PI/180)*Math.cos(a*Math.PI/180)*Math.sin(dLng/2)**2;return 6371*2*Math.asin(Math.min(1,Math.sqrt(h))); };
  const visibleGuides = nearby ? guides.filter(g=>distanceKm(g)<=100).sort((a,b)=>distanceKm(a)-distanceKm(b)).slice(0,48) : guides;
  return <main dir="rtl" className="min-h-screen bg-[#F8F5ED] px-5 pb-24 pt-36 text-[#0D3B34]">
    <div className="mx-auto max-w-7xl">
      <div className="mb-9 text-center"><p className="text-xs font-bold tracking-[.15em] text-[#A87917]">AREES LOOP GUIDES</p><h1 className="mt-2 text-4xl font-black md:text-5xl">المرشدون السياحيون</h1><p className="mx-auto mt-4 max-w-2xl leading-8 text-[#0D3B34]/65">اكتشف المرشدين المعتمدين حسب المنطقة والتخصص والمسار السياحي. تظهر هنا الملفات التي اعتمدتها المنصة وتراخيصها سارية فقط.</p></div>
      <NearbyGuideControls active={nearby}/>
      <form action="/guides/directory" className="mb-9 grid gap-3 rounded-[26px] border border-[#D4AF37]/25 bg-white/80 p-5 shadow-sm md:grid-cols-[1fr_1fr_auto]" >
        <label className="flex flex-col gap-2 text-sm font-bold">المنطقة أو المدينة<input list="guide-cities" name="city" defaultValue={city} placeholder="اختر مدينة أو اكتب للبحث" className="rounded-xl border border-[#0D3B34]/15 bg-[#FAF9F5] px-4 py-3 font-normal outline-none focus:border-[#C49A37]"/></label>
        <label className="flex flex-col gap-2 text-sm font-bold">التخصص أو المسار<input list="guide-categories" name="specialty" defaultValue={specialty} placeholder="اختر فئة الترخيص أو ابحث" className="rounded-xl border border-[#0D3B34]/15 bg-[#FAF9F5] px-4 py-3 font-normal outline-none focus:border-[#C49A37]"/></label>
        <button type="submit" className="self-end rounded-xl bg-[#0D3B34] px-8 py-3.5 font-bold text-white transition hover:bg-[#165B50]">ابحث عن مرشد</button>
        <datalist id="guide-cities">{SAUDI_CITY_SUGGESTIONS.map(c=><option key={c} value={c}/>)}</datalist>
        <datalist id="guide-categories">{GUIDE_LICENSE_CATEGORIES.map(c=><option key={c} value={c}/>)}</datalist>
      </form>
      {approvedApplications.length>0&&<div className="mb-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{approvedApplications.map(g=><article key={g.id} className="overflow-hidden rounded-[26px] border border-[#D4AF37]/25 bg-white shadow-sm"><div className="mx-auto aspect-[4/3] max-w-xs">{g.photoPublicationConsent&&g.photoPath?<img src={`/api/guides/photo?id=${encodeURIComponent(g.id)}`} alt={g.fullName} className="h-full w-full object-cover"/>:<GuideAvatar gender={g.gender==="FEMALE"?"FEMALE":"MALE"}/>}</div><div className="p-5"><p className="text-xs font-bold text-[#A87917]">مرشد سياحي معتمد من المنصة</p><h2 className="mt-2 text-xl font-black">{g.fullName}</h2><p className="mt-2 text-sm">{g.licenseCategory} · {g.city}</p><p className="mt-2 text-sm">{g.countries.join("، ")}</p><p className="mt-2 text-sm">{g.specialization||g.bio||"مرشد سياحي"}</p></div></article>)}</div>}
      {visibleGuides.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visibleGuides.map(guide => <article key={guide.id} className="overflow-hidden rounded-[26px] border border-[#D4AF37]/25 bg-white shadow-[0_12px_35px_rgba(13,59,52,.07)] transition hover:-translate-y-1 hover:shadow-xl">
        <div className="flex aspect-[4/3] items-center justify-center bg-[#EDE9DC]">{guide.logoUrl ? <img src={guide.logoUrl} alt={guide.publicName || guide.legalNameAr} className="h-full w-full object-contain"/> : <span className="text-6xl font-bold text-[#0D3B34]/25" aria-label="لا توجد صورة شخصية">◉</span>}</div>
        <div className="p-5"><p className="mb-2 text-xs font-bold text-[#A87917]">مرشد سياحي معتمد</p><h2 className="text-xl font-black">{guide.publicName || guide.legalNameAr}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-[#0D3B34]/70">{guide.descriptionAr || "مرشد سياحي مرخص"}</p><p className="mt-3 text-sm font-bold">📍 {guide.city || guide.locationName || "المملكة العربية السعودية"}{nearby && Number.isFinite(distanceKm(guide)) ? ` — ${Math.round(distanceKm(guide))} كم تقريباً` : ""}</p><p className="mt-2 text-xs text-[#0D3B34]/55">{guide.licenses.map(l=>l.type).join(" • ")}</p><Link href={`/guides/${guide.id}`} className="mt-5 block rounded-full bg-[#0D3B34] px-5 py-3 text-center text-sm font-bold text-white">عرض ملف المرشد</Link></div>
      </article>)}</div> : approvedApplications.length===0?<div className="rounded-[28px] border border-[#D4AF37]/30 bg-white p-12 text-center"><h2 className="text-xl font-black">لا توجد ملفات مرشدين مطابقة حالياً</h2><p className="mt-3 text-sm text-[#0D3B34]/65">ستظهر بطاقات المرشدين بصورهم وتخصصاتهم ومناطقهم فور اعتماد بياناتهم وتراخيصهم.</p><Link href="/guides/register" className="mt-6 inline-block rounded-full bg-[#0D3B34] px-7 py-3 font-bold text-white">انضم كمرشد سياحي</Link></div>:null}
    </div>
  </main>;
}
