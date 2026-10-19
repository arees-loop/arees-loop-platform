import Link from "next/link";
import Image from "next/image";
import type {Metadata} from "next";
import {prisma} from "@/lib/prisma";
import {buildPageMetadata} from "@/lib/seo-metadata";

export const dynamic="force-dynamic";
export const metadata:Metadata=buildPageMetadata({
 title:"البرامج السياحية المحلية في السعودية",
 description:"اكتشف البرامج السياحية المنشورة داخل المملكة، من جولات العُلا والطائف إلى تجارب جزيرة فرسان والمنطقة الشرقية. تصفح التفاصيل واطلب التجربة من أريس لوب.",
 path:"/programs/saudi",image:"/Image/hero/saudi-panorama-hero.jpg",
 imageWidth:1920,imageHeight:1080,imageType:"image/jpeg",
 imageAlt:"برامج أريس لوب السياحية المحلية داخل المملكة العربية السعودية",
});
export default async function SaudiProgramsPage(){
 const saudiCities=["العلا","الطائف","صير","الشرقية","مدينة الملك عبد الله الإقتصاديّة"];
 let services:Array<{id:string;nameAr:string;descriptionAr:string|null;city:string|null;finalPrice:unknown;images:Array<{url:string}>}>=[];
 let unavailable=false;
 try{services=await prisma.service.findMany({
   where:{status:"PUBLISHED",category:"برامج سياحية محلية",
     OR:[{countryCode:"SA"},{city:{in:saudiCities}}]},
   select:{id:true,nameAr:true,descriptionAr:true,city:true,finalPrice:true,images:{take:1,orderBy:{sortOrder:"asc"},select:{url:true}}},
   orderBy:{updatedAt:"desc"},take:60
 });}catch{unavailable=true;}
 return <main dir="rtl" className="min-h-screen bg-[#F8F6F0] pb-20 text-[#0D3B34]">
  <section className="relative isolate min-h-[330px] overflow-hidden bg-[#103A30] text-white">
   <Image src="/Image/hero/saudi-panorama-hero.jpg" alt="وجهات سياحية وتراثية داخل السعودية" fill priority sizes="100vw" className="object-cover opacity-50"/>
   <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-36"><p className="text-sm font-bold text-[#F2D28A]">AREES LOOP · SAUDI ARABIA</p>
    <h1 className="mt-3 text-3xl font-black md:text-5xl">البرامج السياحية المحلية في السعودية</h1>
    <p className="mt-4 max-w-2xl text-sm leading-8 text-white/90">استكشف التجارب والبرامج التي نشرها شركاء المنصة، مع تفاصيل الخدمة الفعلية واسم المنظم عند توفره.</p>
   </div>
  </section>
  <section className="mx-auto max-w-6xl px-5 py-10">
   <nav className="flex flex-wrap items-center gap-3 text-xs"><Link href="/" className="underline">الرئيسية</Link><span>›</span><Link href="/discover?type=domestic" className="underline">استكشف برامج السعودية</Link><span>›</span><span>البرامج المحلية</span></nav>
   {unavailable?<p className="mt-8 rounded-2xl bg-white p-6">تعذّر تحميل البرامج المنشورة مؤقتاً؛ يرجى المحاولة لاحقاً.</p>:services.length===0?<p className="mt-8 rounded-2xl bg-white p-6">لا توجد برامج سعودية منشورة تستوفي التصنيف حالياً. يمكنك استعراض جميع التجارب المعتمدة.</p>:
   <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{services.map(service=><article key={service.id} className="overflow-hidden rounded-3xl border border-[#E1D2A9] bg-white shadow-sm">
    <div className="relative aspect-[16/10] bg-[#E7E5DB]">{service.images[0]?.url?<img src={service.images[0].url} alt={"صورة "+service.nameAr} className="h-full w-full object-cover"/>:<Image src="/Image/destinations/alula-hero.webp" alt="صورة لوجهة سياحية في السعودية" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover"/>}</div>
    <div className="p-5"><p className="text-xs font-bold text-[#A37A24]">{service.city||"المملكة العربية السعودية"}</p><h2 className="mt-2 text-lg font-black">{service.nameAr}</h2>
    {service.descriptionAr&&<p className="mt-3 line-clamp-3 whitespace-pre-line text-xs leading-6 text-[#63736A]">{service.descriptionAr.replace(/<[^>]*>/g," ").slice(0,230)}</p>}
    <Link className="mt-5 inline-flex rounded-xl bg-[#0D3B34] px-5 py-3 text-xs font-bold text-white" href={"/services/"+encodeURIComponent(service.id)}>عرض البرنامج وطلب الخدمة ←</Link></div>
   </article>)}</div>}
   <div className="mt-10 flex flex-wrap gap-3"><Link className="rounded-xl border border-[#B79747] bg-white px-5 py-3 text-xs font-bold" href="/services">جميع الخدمات والتجارب</Link><Link className="rounded-xl border border-[#B79747] bg-white px-5 py-3 text-xs font-bold" href="/programs/international">البرامج السياحية العالمية</Link><Link className="rounded-xl border border-[#B79747] bg-white px-5 py-3 text-xs font-bold" href="/guides">المرشدون السياحيون</Link></div>
  </section>
 </main>;
}
