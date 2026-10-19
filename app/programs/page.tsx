import Image from "next/image";
import Link from "next/link";
import type {Metadata} from "next";
import {buildPageMetadata} from "@/lib/seo-metadata";

export const metadata:Metadata=buildPageMetadata({
 title:"البرامج السياحية المحلية والعالمية",
 description:"اكتشف البرامج والتجارب السياحية المنشورة عبر أريس لوب داخل السعودية وحول العالم، واختر وجهتك مع خدمات السفر والفنادق والتأشيرات.",
 path:"/programs",image:"/api/og/discover?type=experiences",imageWidth:1200,imageHeight:630,imageType:"image/png",
 imageAlt:"البرامج السياحية المحلية والعالمية — أريس لوب"
});
const groups=[
 {href:"/programs/local",title:"البرامج السياحية المحلية",desc:"استكشف خدمات وتجارب منشورة في وجهات السعودية، من المدينة المنورة إلى باقي مدن المملكة حسب العروض المتاحة.",image:"/Image/hero/alula.jpg"},
 {href:"/programs/international",title:"البرامج السياحية العالمية",desc:"تصفّح الوجهات والخدمات المنشورة خارج السعودية، واعرف تفاصيل كل عرض ومتطلبات السفر المرتبطة به.",image:"/Image/hero/world-destinations-hero.webp"},
] as const;
export default function ProgramsIndex(){
 return <main dir="rtl" className="min-h-screen bg-[#F8F6F0] px-5 pb-24 pt-28 text-[#0D3B34]">
  <div className="mx-auto max-w-6xl">
   <p className="text-xs font-black text-[#A7852D]">AREES LOOP · شركة أريس الحلول المتكاملة المحدودة</p>
   <h1 className="mt-3 text-4xl font-black">البرامج السياحية المحلية والعالمية</h1>
   <p className="mt-4 max-w-3xl text-base leading-9 text-[#49645A]">اكتشف الوجهات والتجارب السياحية المنشورة في منصة أريس لوب. اختر بين الرحلات المحلية والوجهات العالمية، وراجع معلومات الخدمة والسعر وشروط الحجز في صفحة كل عرض.</p>
   <div className="mt-9 grid gap-6 md:grid-cols-2">
    {groups.map(group=><Link key={group.href} href={group.href} className="overflow-hidden rounded-3xl border border-[#D4AF37]/40 bg-white shadow-md transition hover:-translate-y-1">
      <div className="relative aspect-[16/8]"><Image unoptimized fill sizes="(max-width:768px) 100vw,50vw" src={group.image} alt={group.title} className="object-cover"/></div>
      <div className="p-7"><h2 className="text-2xl font-black">{group.title}</h2><p className="mt-3 text-sm leading-8 text-[#536A60]">{group.desc}</p><span className="mt-5 inline-flex rounded-full bg-[#0D3B34] px-5 py-3 text-sm font-bold text-white">تصفح البرامج ←</span></div>
    </Link>)}
   </div>
   <div className="mt-12 rounded-2xl border border-[#E5D5B4] bg-white p-6"><h2 className="text-xl font-black">خدمات تكمّل رحلتك</h2><div className="mt-5 flex flex-wrap gap-4 text-sm font-bold"><Link href="/flights">تذاكر الطيران ←</Link><Link href="/ferries">تذاكر البواخر ←</Link><Link href="/hotels">الفنادق ←</Link><Link href="/visas">التأشيرات ←</Link></div></div>
   <p className="mt-8 text-xs text-[#61766B]">أريس للسفر والسياحة — ترخيص وزارة السياحة 73104550، فئة وكالة سفر وسياحة.</p>
  </div>
 </main>;
}