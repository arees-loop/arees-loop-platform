import { SAUDI_CITY_SUGGESTIONS, GUIDE_LICENSE_CATEGORIES } from "@/lib/guides/reference-data";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function GuidesPage({ searchParams }: { searchParams: Promise<{ city?: string; specialty?: string }> }) {
  const params = await searchParams;
  const city = (params.city || "").trim().slice(0, 80);
  const specialty = (params.specialty || "").trim().slice(0, 80);
  const guides = await prisma.partner.findMany({
    where: {
      partnerType: "INDIVIDUAL",
      status: "ACTIVE",
      licenses: { some: { status: "VERIFIED", expiryDate: { gt: new Date() }, OR: [{ type: { contains: "إرشاد" } }, { type: { contains: "GUIDE", mode: "insensitive" } }] } },
      ...(city ? { city: { contains: city, mode: "insensitive" as const } } : {}),
      ...(specialty ? { licenses: { some: { status: "VERIFIED" as const, expiryDate: { gt: new Date() }, type: { contains: specialty, mode: "insensitive" as const } } } } : {}),
    },
    select: { id: true, publicName: true, legalNameAr: true, descriptionAr: true, city: true, locationName: true, logoUrl: true, licenses: { where: { status: "VERIFIED", expiryDate: { gt: new Date() } }, select: { type: true }, take: 3 } },
    orderBy: { activatedAt: "desc" },
    take: 48,
  });

  return <main dir="rtl" className="min-h-screen bg-[#F8F5ED] px-5 pb-24 pt-36 text-[#0D3B34]">
    <div className="mx-auto max-w-7xl">
      <div className="mb-9 text-center"><p className="text-xs font-bold tracking-[.15em] text-[#A87917]">AREES LOOP GUIDES</p><h1 className="mt-2 text-4xl font-black md:text-5xl">المرشدون السياحيون</h1><p className="mx-auto mt-4 max-w-2xl leading-8 text-[#0D3B34]/65">اكتشف المرشدين المعتمدين حسب المنطقة والتخصص والمسار السياحي. تظهر هنا الملفات التي اعتمدتها المنصة وتراخيصها سارية فقط.</p></div>
      <form action="/guides" className="mb-9 grid gap-3 rounded-[26px] border border-[#D4AF37]/25 bg-white/80 p-5 shadow-sm md:grid-cols-[1fr_1fr_auto]" >
        <label className="flex flex-col gap-2 text-sm font-bold">المنطقة أو المدينة<input list="guide-cities" name="city" defaultValue={city} placeholder="اختر مدينة أو اكتب للبحث" className="rounded-xl border border-[#0D3B34]/15 bg-[#FAF9F5] px-4 py-3 font-normal outline-none focus:border-[#C49A37]"/></label>
        <label className="flex flex-col gap-2 text-sm font-bold">التخصص أو المسار<input list="guide-categories" name="specialty" defaultValue={specialty} placeholder="اختر فئة الترخيص أو ابحث" className="rounded-xl border border-[#0D3B34]/15 bg-[#FAF9F5] px-4 py-3 font-normal outline-none focus:border-[#C49A37]"/></label>
        <button type="submit" className="self-end rounded-xl bg-[#0D3B34] px-8 py-3.5 font-bold text-white transition hover:bg-[#165B50]">ابحث عن مرشد</button>
        <datalist id="guide-cities">{SAUDI_CITY_SUGGESTIONS.map(c=><option key={c} value={c}/>)}</datalist>
        <datalist id="guide-categories">{GUIDE_LICENSE_CATEGORIES.map(c=><option key={c} value={c}/>)}</datalist>
      </form>
      {guides.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{guides.map(guide => <article key={guide.id} className="overflow-hidden rounded-[26px] border border-[#D4AF37]/25 bg-white shadow-[0_12px_35px_rgba(13,59,52,.07)] transition hover:-translate-y-1 hover:shadow-xl">
        <div className="flex aspect-[4/3] items-center justify-center bg-[#EDE9DC]">{guide.logoUrl ? <img src={guide.logoUrl} alt={guide.publicName || guide.legalNameAr} className="h-full w-full object-contain"/> : <span className="text-6xl font-bold text-[#0D3B34]/25" aria-label="لا توجد صورة شخصية">◉</span>}</div>
        <div className="p-5"><p className="mb-2 text-xs font-bold text-[#A87917]">مرشد سياحي معتمد</p><h2 className="text-xl font-black">{guide.publicName || guide.legalNameAr}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-[#0D3B34]/70">{guide.descriptionAr || "مرشد سياحي مرخص"}</p><p className="mt-3 text-sm font-bold">📍 {guide.city || guide.locationName || "المملكة العربية السعودية"}</p><p className="mt-2 text-xs text-[#0D3B34]/55">{guide.licenses.map(l=>l.type).join(" • ")}</p><Link href={`/guides/${guide.id}`} className="mt-5 block rounded-full bg-[#0D3B34] px-5 py-3 text-center text-sm font-bold text-white">عرض ملف المرشد</Link></div>
      </article>)}</div> : <div className="rounded-[28px] border border-[#D4AF37]/30 bg-white p-12 text-center"><h2 className="text-xl font-black">لا توجد ملفات مرشدين مطابقة حالياً</h2><p className="mt-3 text-sm text-[#0D3B34]/65">ستظهر بطاقات المرشدين بصورهم وتخصصاتهم ومناطقهم فور اعتماد بياناتهم وتراخيصهم.</p><Link href="/guides/register" className="mt-6 inline-block rounded-full bg-[#0D3B34] px-7 py-3 font-bold text-white">انضم كمرشد سياحي</Link></div>}
    </div>
  </main>;
}
