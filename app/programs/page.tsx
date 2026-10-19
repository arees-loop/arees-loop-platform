import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import {prisma} from "@/lib/prisma";
import {buildPageMetadata} from "@/lib/seo-metadata";
import LicensedTravelOperator from "@/app/components/LicensedTravelOperator";
export const dynamic="force-dynamic";
export const metadata:Metadata=buildPageMetadata({
 title:"البرامج السياحية المحلية والعالمية",
 description:"تصفح البرامج والتجارب المنشورة من شركاء أريس لوب، واستكشف خيارات السفر المحلي والعالمي حسب الوجهة. قدّم طلبك من صفحة الخدمة المتاحة.",
 path:"/programs",image:"/Image/hero/world-destinations-hero.webp",imageWidth:1920,imageHeight:1080,imageType:"image/webp",imageAlt:"البرامج والوجهات السياحية المحلية والعالمية في أريس لوب"
});
type Item={id:string;nameAr:string;descriptionAr:string|null;city:string|null;country:string|null;countryCode:string|null;category:string;images:{url:string}[]};
function short(text:string|null){return (text||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().slice(0,145);}
function validImage(url:string|undefined){
 if(!url)return null;
 try{const parsed=new URL(url,"https://www.areesloop.com");return parsed.protocol==="https:"?parsed.href:null}catch{return null;}
}
export default async function ProgramsPage(){
 let programs:Item[]=[];let unavailable=false;
 try{programs=await prisma.service.findMany({where:{status:"PUBLISHED"},select:{
   id:true,nameAr:true,descriptionAr:true,city:true,country:true,countryCode:true,category:true,
   images:{orderBy:{sortOrder:"asc"},take:1,select:{url:true}}
 },orderBy:{updatedAt:"desc"},take:36});}catch{unavailable=true;}
 return <main dir="rtl" className="min-h-screen bg-[#F7F5EE] pb-14 pt-24 text-[#0D3B34] md:pt-32">
  <div className="mx-auto max-w-6xl px-5">
    <p className="text-xs font-bold tracking-widest text-[#B08C2D]">AREES LOOP · PROGRAMS</p>
    <h1 className="mt-3 text-3xl font-black md:text-5xl">البرامج السياحية المحلية والعالمية</h1>
    <p className="mt-4 max-w-3xl text-sm leading-8 text-[#475C50]">اكتشف الخدمات والبرامج السياحية المنشورة من شركاء المنصة. تختلف الوجهات والتوفر بحسب الخدمات المعتمدة فعلياً، ولا يُعد استعراض الوجهة عرض حجز مؤكد.</p>
    <div className="mt-7 grid gap-5 md:grid-cols-2">
     <Link href="/discover?type=domestic" className="group relative overflow-hidden rounded-3xl border border-[#D4AF37]/25 bg-[#0D3B34] text-white shadow-sm">
       <div className="relative h-56"><Image src="/Image/destinations/alula-hero.webp" alt="مشهد من العلا — استكشاف برامج السعودية المحلية" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover opacity-75 transition group-hover:scale-[1.02]"/></div>
       <div className="p-5"><h2 className="text-xl font-black">البرامج السياحية داخل السعودية</h2><p className="mt-2 text-sm">تصفح التجارب والوجهات المحلية المتاحة ←</p></div>
     </Link>
     <Link href="/discover?type=international" className="group overflow-hidden rounded-3xl border border-[#D4AF37]/25 bg-[#0D3B34] text-white shadow-sm">
       <div className="relative h-56"><Image src="/Image/hero/world-destinations-hero.webp" alt="وجهات عالمية متنوعة — استكشاف برامج السفر الدولية" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover opacity-75 transition group-hover:scale-[1.02]"/></div>
       <div className="p-5"><h2 className="text-xl font-black">البرامج السياحية العالمية</h2><p className="mt-2 text-sm">تصفح الخيارات الدولية والوجهات المتاحة ←</p></div>
     </Link>
    </div>
    <section className="mt-12" aria-labelledby="programs-list-title">
      <h2 id="programs-list-title" className="text-2xl font-black">الخدمات والتجارب المنشورة حالياً</h2>
      <p className="mt-2 text-sm text-[#567165]">تظهر هنا الخدمات الموجودة فعلياً في المنصة؛ لن تُعرض برامج أو أسعار افتراضية.</p>
      {unavailable?<p className="mt-6 rounded-2xl bg-white p-6 text-sm">تعذر جلب البرامج المنشورة مؤقتاً. يمكنك تصفح صفحات الخدمات مباشرة.</p>:programs.length===0?<p className="mt-6 rounded-2xl bg-white p-6 text-sm">لا توجد برامج أو خدمات منشورة حالياً في هذا القسم. تابع المنصة عند اعتماد برامج جديدة.</p>:
       <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{programs.map(item=>{
         const image=validImage(item.images[0]?.url);
         const place=[item.city,item.country].filter(Boolean).join("، ");
         return <Link key={item.id} href={"/services/"+encodeURIComponent(item.id)} className="overflow-hidden rounded-2xl border border-[#D4AF37]/25 bg-white transition hover:border-[#A98832] hover:shadow-md">
           {image?
             <img src={image} alt={"صورة "+item.nameAr} className="h-40 w-full object-cover"/>:
             <div className="flex h-40 items-center justify-center bg-[#ECF1EB] text-xs text-[#51675B]">AREES LOOP</div>}
           <div className="p-4"><h3 className="font-black">{item.nameAr}</h3>
            {place&&<p className="mt-2 text-xs text-[#65786D]">{place}</p>}
            {short(item.descriptionAr)&&<p className="mt-2 text-xs leading-6 text-[#56685D]">{short(item.descriptionAr)}</p>}
            <span className="mt-3 inline-block text-xs font-bold text-[#A48222]">التفاصيل وطلب الخدمة ←</span>
           </div>
         </Link>;
       })}</div>}
    </section>
  </div>
  <LicensedTravelOperator/>
 </main>;
}
