import type {Metadata} from "next";
import {buildPageMetadata} from "@/lib/seo-metadata";
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
 const {id}=await params;
 const event=await prisma.publicEvent.findFirst({
  where:{id,status:"PUBLISHED",partner:{partnerType:"GOVERNMENT_NONPROFIT",status:"ACTIVE"}},
  select:{nameAr:true,descriptionAr:true,city:true,posterUrl:true}
 }).catch(()=>null);
 if(!event)return {title:"الفعالية غير متاحة",robots:{index:false,follow:false}};
 const availablePoster=typeof event.posterUrl==="string"&&(
  event.posterUrl.startsWith("/")||/^https:\/\/[^\s]+$/i.test(event.posterUrl)
 );
 const image=availablePoster?event.posterUrl!:"/api/og/event?title="+encodeURIComponent(event.nameAr);
 const suffix=image.toLowerCase().split("?")[0];
 const imageType=suffix.endsWith(".png")?"image/png" as const:/\.jpe?g$/i.test(suffix)?"image/jpeg" as const:suffix.endsWith(".webp")?"image/webp" as const:"image/png" as const;
 return buildPageMetadata({
  title:event.nameAr+" — "+event.city,
  description:event.descriptionAr.replace(/<[^>]*>/g," ").slice(0,175),
  path:"/events/"+encodeURIComponent(id),image,imageWidth:1200,imageHeight:630,imageType,
  imageAlt:"فعالية "+event.nameAr+" في "+event.city
 });
}
import Link from "next/link";
import {notFound} from "next/navigation";
import {prisma} from "@/lib/prisma";
export const dynamic="force-dynamic";
export default async function EventPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{lang?:string}>}){
 const {id}=await params;
 const english=(await searchParams).lang==="en";
 let event;
 try{event=await prisma.publicEvent.findFirst({where:{id,status:"PUBLISHED",partner:{partnerType:"GOVERNMENT_NONPROFIT",status:"ACTIVE"}},include:{partner:{select:{legalNameAr:true,publicName:true}}}})}catch{return <main dir="rtl" className="mx-auto max-w-3xl px-5 py-36 text-center">تفاصيل الفعاليات غير متاحة قبل تفعيل قاعدة البيانات.</main>}
 if(!event)notFound();
 const sections=english?[["Includes",event.includesEn],["Excludes",event.excludesEn],["Notes",event.notesEn]]:[["يشمل البرنامج",event.includesAr],["لا يشمل البرنامج",event.excludesAr],["ملاحظات",event.notesAr]];
 return <main dir="rtl" className="min-h-screen bg-[#F8F5ED] px-5 pb-24 pt-32 text-[#0D3B34]"><article className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-white shadow-sm">
 {event.posterUrl&&<img src={event.posterUrl} alt={event.nameAr} className="max-h-[480px] w-full object-contain bg-[#F8F5ED]"/>}
 <div className="p-7 md:p-11"><nav className="mb-5 flex gap-3 text-sm font-bold"><Link href={`/events/${id}`} className={!english?"underline":""}>العربية</Link><Link href={`/events/${id}?lang=en`} className={english?"underline":""}>English</Link></nav><p className="text-xs font-bold text-[#B99124]">{event.kind==="PROGRAM"?"برنامج":"فعالية"} · {event.city}</p><h1 className="mt-3 text-3xl font-black">{english?event.nameEn:event.nameAr}</h1><p dir="ltr" className="mt-2 text-left text-sm text-[#0D3B34]/60">{event.nameEn}</p>
 <p className="mt-5 font-bold">الجهة المنظمة: {event.partner.publicName||event.partner.legalNameAr}</p><p className="mt-2 text-sm">📍 {event.locationName}</p><p className="mt-2 text-sm">📅 {event.startsAt.toLocaleDateString("ar-SA")} — {event.endsAt.toLocaleDateString("ar-SA")}</p>
 <section className="mt-8"><h2 className="text-xl font-bold">{english?"Event details":"تفاصيل البرنامج"}</h2><p className="mt-3 whitespace-pre-line text-sm leading-8">{english?event.descriptionEn:event.descriptionAr}</p><p dir="ltr" className="mt-3 whitespace-pre-line text-left text-sm leading-8 text-[#0D3B34]/70">{event.descriptionEn}</p></section>
 {sections.filter(([,v])=>Boolean(v)).map(([title,value])=><section key={title} className="mt-7"><h2 className="text-lg font-bold">{title}</h2><p className="mt-3 whitespace-pre-line text-sm leading-8">{value}</p></section>)}
 {event.registrationUrl&&<a href={event.registrationUrl} rel="noopener noreferrer" target="_blank" className="mt-8 inline-block rounded-full bg-[#0D3B34] px-6 py-3 font-bold text-white">رابط التسجيل لدى الجهة المنظمة</a>}
 <div className="mt-8"><Link href="/events" className="text-sm font-bold underline">جميع الفعاليات</Link></div></div></article></main>
}
