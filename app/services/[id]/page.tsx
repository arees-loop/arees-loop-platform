"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Service={id:string;nameAr:string;nameEn?:string|null;category:string;subCategory?:string|null;descriptionAr?:string|null;city?:string|null;locationName?:string|null;formattedAddress?:string|null;finalPrice:number;capacity?:number|null;cancellationPolicy?:string|null;meetingInstructions?:string|null;partnerName?:string|null;images:string[]};

export default function ServiceDetails(){
 const {id}=useParams<{id:string}>();
 const [service,setService]=useState<Service|null>(null);
 const [loading,setLoading]=useState(true);
 useEffect(()=>{fetch("/api/services",{cache:"no-store"}).then(r=>r.json()).then(d=>{if(d?.success)setService((d.data||[]).find((x:Service)=>x.id===id)||null)}).finally(()=>setLoading(false))},[id]);
 if(loading)return <main dir="rtl" className="min-h-screen bg-[#F7F5EF] p-10 text-center text-[#0D3B34]">جارٍ تحميل البرنامج...</main>;
 if(!service)return <main dir="rtl" className="min-h-screen bg-[#F7F5EF] p-10 text-center text-[#0D3B34]"><h1 className="text-2xl font-black">الخدمة غير متاحة</h1><Link href="/services" className="mt-5 inline-block underline">العودة للخدمات والتجارب</Link></main>;
 return <main dir="rtl" className="min-h-screen bg-[#F7F5EF] text-[#0D3B34]">
  <header className="border-b border-[#0D3B34]/10 bg-white/75"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><Link href="/"><Image src="/Logo/arees-loop-logo.png" alt="Arees Loop" width={150} height={70} className="h-auto w-[120px]"/></Link><Link href="/services" className="text-xs font-bold">← الخدمات والتجارب</Link></div></header>
  <div className="mx-auto max-w-6xl px-5 py-8">
   <div className="relative h-[320px] overflow-hidden rounded-[32px] bg-[#EAE6DC] md:h-[500px]">{service.images?.[0] ? <Image src={service.images[0]} alt={service.nameAr} fill priority className="object-cover"/> : <div className="flex h-full items-center justify-center px-6 text-center text-sm font-bold text-[#0D3B34]/35">لا توجد صورة مرفوعة لهذه الخدمة</div>}<div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent"/><div className="absolute bottom-7 right-7 left-7 text-white"><span className="rounded-full bg-white/20 px-3 py-1.5 text-xs backdrop-blur">{service.subCategory||service.category}</span><h1 className="mt-3 text-3xl font-black md:text-5xl">{service.nameAr}</h1><p className="mt-2 text-sm text-white/80">{service.city}{service.locationName&&` · ${service.locationName}`}</p></div></div>
   <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
    <section className="rounded-[28px] bg-white p-6 md:p-8"><h2 className="text-xl font-black">عن البرنامج</h2><p className="mt-4 whitespace-pre-line text-sm leading-8 text-[#0D3B34]/70">{service.descriptionAr||"تفاصيل البرنامج قيد الاستكمال."}</p>
     {service.meetingInstructions&&<><h3 className="mt-7 font-black">تعليمات اللقاء</h3><p className="mt-2 text-sm leading-7 text-[#0D3B34]/65">{service.meetingInstructions}</p></>}
     {service.cancellationPolicy&&<><h3 className="mt-7 font-black">سياسة الإلغاء</h3><p className="mt-2 text-sm leading-7 text-[#0D3B34]/65">{service.cancellationPolicy}</p></>}
     
    </section>
    <aside className="h-fit rounded-[28px] border border-[#B99124]/20 bg-white p-6 shadow-sm"><p className="text-xs text-[#0D3B34]/50">السعر للفرد يبدأ من</p><p className="mt-1 text-3xl font-black">{Number(service.finalPrice).toLocaleString("ar-SA")} <span className="text-base">ر.س</span></p>{service.capacity&&<p className="mt-3 text-xs text-[#0D3B34]/55">السعة: حتى {service.capacity} مشارك</p>}<button className="mt-6 w-full rounded-2xl bg-[#0D3B34] py-4 text-sm font-black text-white">احجز عبر Arees Loop</button><p className="mt-3 text-center text-[10px] text-[#0D3B34]/45">الحجز والتواصل يتمان عبر المنصة</p></aside>
   </div>
  </div>
 </main>
}
