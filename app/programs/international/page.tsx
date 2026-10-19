import Link from "next/link";
import Image from "next/image";
import type {Metadata} from "next";
import {prisma} from "@/lib/prisma";
import {buildPageMetadata} from "@/lib/seo-metadata";
export const dynamic="force-dynamic";
export const metadata:Metadata=buildPageMetadata({
 title:"البرامج السياحية العالمية والرحلات الدولية",
 description:"تصفح برامج أريس لوب السياحية العالمية المنشورة إلى وجهات مثل طوكيو وميلان ولندن وسيشل، واطلع على تفاصيل الرحلة واطلب الخدمة من المنصة.",
 path:"/programs/international",image:"/Image/hero/world-destinations-hero.webp",
 imageWidth:1920,imageHeight:1080,imageType:"image/webp",
 imageAlt:"البرامج السياحية الدولية والوجهات العالمية لدى أريس لوب"
});
export default async function InternationalProgramsPage(){
 let offers:Array<{id:string;nameAr:string;descriptionAr:string|null;city:string|null;finalPrice:unknown;images:Array<{url:string}>}>=[];
 let unavailable=false;
 try{offers=await prisma.service.findMany({
  where:{status:"PUBLISHED",category:"برامج سياحية عالمية"},
  select:{id:true,nameAr:true,descriptionAr:true,city:true,finalPrice:true,images:{take:1,orderBy:{sortOrder:"asc"},select:{url:true}}},
  orderBy:{updatedAt:"desc"},take:60,
 });}catch{unavailable=true;}
 return <main dir="rtl" className="min-h-screen bg-[#F8F6F0] pb-20 text-[#0D3B34]">
  <section className="relative isolate min-h-[350px] overflow-hidden bg-[#103A30] text-white">
   <Image src="/Image/hero/world-destinations-hero.webp" alt="وجهات عالمية وبرامج سفر دولية" fill sizes="100vw" priority className="object-cover opacity-55"/>
   <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-36"><p className="text-sm font-bold text-[#F2D28A]">AREES LOOP · WORLD DESTINATIONS</p>
    <h1 className="mt-3 text-3xl font-black md:text-5xl">البرامج السياحية العالمية</h1>
    <p className="mt-4 max-w-2xl text-sm leading-8 text-white/90">برامج دولية منشورة من شركاء أريس لوب. اختر الوجهة واقرأ تفاصيل الرحلة الحقيقية قبل إرسال طلبك.</p>
   </div>
  </section>
  <section className="mx-auto max-w-6xl px-5 py-10">
   <nav className="flex flex-wrap items-center gap-3 text-xs"><Link href="/" className="underline">الرئيسية</Link><span>›</span><Link href="/discover?type=international" className="underline">استكشف الوجهات العالمية</Link><span>›</span><span>البرامج العالمية</span></nav>
   {unavailable?<p className="mt-8 rounded-2xl bg-white p-6">تعذّر تحميل البرامج الدولية المنشورة مؤقتاً.</p>:offers.length===0?<p className="mt-8 rounded-2xl bg-white p-6">لا توجد برامج دولية منشورة حالياً، ويمكنك إرسال طلب الطيران أو التأشيرة عبر خدماتنا.</p>:
   <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{offers.map(offer=><article key={offer.id} className="overflow-hidden rounded-3xl border border-[#E1D2A9] bg-white shadow-sm">
    <div className="relative aspect-[16/10] bg-[#E9E2D6]">{offer.images[0]?.url?<img src={offer.images[0].url} alt={"صورة برنامج "+offer.nameAr} className="h-full w-full object-cover"/>:<Image src="/Image/hero/world-destinations-hero.webp" fill alt="صورة لوجهة عالمية" sizes="(max-width:768px) 100vw, 33vw" className="object-cover"/>}</div>
    <div className="p-5"><p className="text-xs font-bold text-[#A37A24]">{offer.city||"وجهة عالمية"}</p><h2 className="mt-2 text-lg font-black">{offer.nameAr}</h2>
    {offer.descriptionAr&&<p className="mt-3 line-clamp-3 whitespace-pre-line text-xs leading-6 text-[#63736A]">{offer.descriptionAr.replace(/<[^>]*>/g," ").slice(0,230)}</p>}
    <Link href={"/services/"+encodeURIComponent(offer.id)} className="mt-5 inline-flex rounded-xl bg-[#0D3B34] px-5 py-3 text-xs font-bold text-white">تفاصيل البرنامج وطلب الخدمة ←</Link></div>
   </article>)}</div>}
   <div className="mt-10 flex flex-wrap gap-3"><Link className="rounded-xl border border-[#B79747] bg-white px-5 py-3 text-xs font-bold" href="/flights">طلبات الطيران</Link><Link className="rounded-xl border border-[#B79747] bg-white px-5 py-3 text-xs font-bold" href="/visas">التأشيرات</Link><Link className="rounded-xl border border-[#B79747] bg-white px-5 py-3 text-xs font-bold" href="/programs/saudi">برامج السعودية</Link></div>
  </section>
 </main>;
}
