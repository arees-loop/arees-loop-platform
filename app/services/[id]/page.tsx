"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Service={id:string;nameAr:string;nameEn?:string|null;category:string;subCategory?:string|null;descriptionAr?:string|null;city?:string|null;locationName?:string|null;formattedAddress?:string|null;finalPrice:number;capacity?:number|null;cancellationPolicy?:string|null;meetingInstructions?:string|null;partnerName?:string|null;organizerType?:string|null;organizerName?:string|null;organizerLicenseNumber?:string|null;organizerLicenseIssuer?:string|null;images:string[]};

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
   <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)]">
    <div className="order-2 lg:order-1">
     <div className="mb-5"><p className="text-xs font-bold text-[#0D3B34]/50">{service.category}{service.subCategory&&` · ${service.subCategory}`}</p><h1 className="mt-2 text-3xl font-black leading-tight">{service.nameAr}</h1><p className="mt-2 text-sm text-[#0D3B34]/55">{service.city}{service.locationName&&` · ${service.locationName}`}</p></div>
     <section className="rounded-[24px] bg-white p-6 shadow-sm md:p-7">
      <h2 className="text-xl font-black">تفاصيل البرنامج</h2>
      <div className="mt-4 text-sm leading-8 text-[#0D3B34]/75 [&_p]:mb-2 [&_ul]:mr-5 [&_ul]:list-disc [&_ol]:mr-5 [&_ol]:list-decimal" dangerouslySetInnerHTML={{__html:service.descriptionAr||"<p>تفاصيل البرنامج قيد الاستكمال.</p>"}} />
      {(service.partnerName||service.organizerName||service.organizerLicenseNumber||service.organizerLicenseIssuer)&&<div className="mt-7 border-t border-[#0D3B34]/10 pt-5"><h3 className="font-black">مقدم الخدمة والتنظيم</h3><div className="mt-3 grid gap-2 text-sm text-[#0D3B34]/70">{service.partnerName&&<p><b>مقدم الخدمة:</b> {service.partnerName}</p>}<p><b>منظم البرنامج:</b> {service.organizerType==="OTHER"?(service.organizerName||"غير محدد"):(service.partnerName||"مقدم الخدمة")}</p>{service.organizerLicenseIssuer&&<p><b>جهة الترخيص أو التصريح:</b> {service.organizerLicenseIssuer}</p>}{service.organizerLicenseNumber&&<p><b>رقم الترخيص/التصريح:</b> {service.organizerLicenseNumber}</p>}</div></div>}
      {service.meetingInstructions&&<><h3 className="mt-7 font-black">تعليمات اللقاء</h3><p className="mt-2 text-sm leading-7 text-[#0D3B34]/65">{service.meetingInstructions}</p></>}
      {service.cancellationPolicy&&<><h3 className="mt-7 font-black">سياسة الإلغاء والاسترداد</h3><div className="mt-2 text-sm leading-7 text-[#0D3B34]/65" dangerouslySetInnerHTML={{__html:service.cancellationPolicy}} /></>}
     </section>
     <aside className="mt-5 rounded-[24px] border border-[#B99124]/20 bg-white p-6 shadow-sm"><p className="text-xs text-[#0D3B34]/50">السعر للفرد يبدأ من</p><p className="mt-1 text-3xl font-black">{Number(service.finalPrice).toLocaleString("ar-SA")} <span className="text-base">ر.س</span></p>{service.capacity&&<p className="mt-3 text-xs text-[#0D3B34]/55">السعة: حتى {service.capacity} مشارك</p>}<button className="mt-6 w-full rounded-2xl bg-[#0D3B34] py-4 text-sm font-black text-white">احجز عبر Arees Loop</button><p className="mt-3 text-center text-[10px] text-[#0D3B34]/45">الحجز والتواصل يتمان عبر المنصة</p></aside>
    </div>
    <div className="order-1 lg:order-2 lg:sticky lg:top-6">
     <div className="relative mx-auto aspect-square w-full max-w-[520px] overflow-hidden rounded-[24px] bg-[#EAE6DC]">{service.images?.[0] ? <img src={service.images[0]} alt={service.nameAr} className="h-full w-full object-contain" /> : <div className="flex h-full items-center justify-center px-6 text-center text-sm font-bold text-[#0D3B34]/35">لا توجد صورة مرفوعة لهذه الخدمة</div>}</div>
    </div>
   </div>  </div>
 </main>
}
