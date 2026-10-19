import Image from "next/image";
import Link from "next/link";
import {publishedPrograms,type ProgramCard} from "./program-data";

type Scope="local"|"international"|"georgia";
type Props={scope:Scope;title:string;intro:string;banner:string;back?:string};
function Row({item}:{item:ProgramCard}){
 return <article className="overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-white shadow-sm">
  <Link href={"/services/"+encodeURIComponent(item.id)} className="block">
   <div className="relative aspect-[16/9] overflow-hidden bg-[#EDF1E7]">
    <Image unoptimized fill sizes="(max-width: 768px) 100vw, 33vw" src={item.image} alt={"صورة "+item.title+" في "+(item.city||item.country)} className="object-cover" />
   </div>
   <div className="space-y-2 p-5">
    <p className="text-xs font-semibold text-[#967123]">{item.category}{item.city?" · "+item.city:""}{item.country?" · "+item.country:""}</p>
    <h2 className="text-lg font-black text-[#0D3B34]">{item.title}</h2>
    {item.description&&<p className="line-clamp-3 text-sm leading-7 text-[#4B645C]">{item.description}</p>}
    <div className="flex items-center justify-between pt-2">
     <span className="text-xs font-black text-[#0D3B34]">{item.price.toLocaleString("ar-SA")} ر.س</span>
     <span className="rounded-full bg-[#0D3B34] px-4 py-2 text-xs font-bold text-white">عرض التفاصيل ←</span>
    </div>
   </div>
  </Link>
 </article>;
}
export default async function ProgramsListing({scope,title,intro,banner,back="/programs"}:Props){
 let programs:ProgramCard[]=[];
 let loadError=false;
 try{programs=await publishedPrograms(scope);}catch(error){console.error("Published programs SEO listing failed",error);loadError=true;}
 return <main dir="rtl" className="min-h-screen bg-[#F8F6F0] pb-20 pt-24 text-[#0D3B34]">
   <section className="mx-auto max-w-7xl px-5">
    <Link className="mb-4 inline-block text-sm font-bold text-[#8D6D20]" href={back}>← البرامج السياحية</Link>
    <div className="relative overflow-hidden rounded-3xl bg-[#0D3B34]">
     <Image unoptimized fill priority sizes="100vw" src={banner} alt={"صورة وجهات "+title+" لدى أريس لوب"} className="object-cover opacity-35"/>
     <div className="relative max-w-3xl space-y-4 p-8 text-white md:p-14">
      <p className="text-xs font-black tracking-wide text-[#E6CE88]">AREES LOOP · أريس للسفر والسياحة</p>
      <h1 className="text-3xl font-black md:text-5xl">{title}</h1>
      <p className="text-base leading-8 text-white/95">{intro}</p>
     </div>
    </div>
    <section className="mt-10">
      <h2 className="text-2xl font-black">التجارب والخدمات السياحية المنشورة</h2>
      <p className="mt-2 text-sm leading-7 text-[#5B6D65]">القائمة تعرض الخدمات المنشورة فعلياً من شركاء أريس لوب. توافر الخدمة وشروط الحجز موجودة في صفحة تفاصيل كل عرض.</p>
      {loadError?<div className="mt-7 rounded-xl border border-[#E3CAA0] bg-[#FFF4DE] p-5 text-sm">تعذر تحميل البرامج في الوقت الحالي؛ يُرجى المحاولة لاحقاً.</div>:
       programs.length?<div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{programs.map(item=><Row key={item.id} item={item}/>)}</div>:
       <div className="mt-7 rounded-xl border border-[#E3D9C3] bg-white p-6 text-sm leading-7">لا توجد حالياً خدمات معتمدة ومنشورة ضمن هذه الوجهة. يمكنك متابعة <Link className="font-black text-[#967123]" href="/discover">صفحة الاستكشاف</Link> للاطلاع على الخيارات المتاحة.</div>}
    </section>
    <div className="mt-10 flex flex-wrap gap-4 rounded-2xl border border-[#E3D3B0] bg-white p-5 text-sm">
      <Link href="/flights" className="font-black text-[#0D3B34] underline decoration-[#D4AF37]">تذاكر الطيران</Link>
      <Link href="/hotels" className="font-black text-[#0D3B34] underline decoration-[#D4AF37]">الفنادق</Link>
      <Link href="/visas" className="font-black text-[#0D3B34] underline decoration-[#D4AF37]">التأشيرات</Link>
      <Link href="/ferries" className="font-black text-[#0D3B34] underline decoration-[#D4AF37]">البواخر</Link>
    </div>
    <p className="mt-8 text-xs leading-6 text-[#62796D]">تُقدَّم خدمات وكالة السفر والسياحة ضمن نشاط شركة أريس الحلول المتكاملة المحدودة، ترخيص وزارة السياحة رقم 73104550 — فئة وكالة سفر وسياحة.</p>
   </section>
 </main>;
}
