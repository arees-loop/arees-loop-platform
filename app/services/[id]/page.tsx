"use client";
import Image from "next/image";
import Link from "next/link";
import {useParams} from "next/navigation";
import {useEffect,useState} from "react";
type Service={id:string;nameAr:string;nameEn?:string|null;category:string;subCategory?:string|null;descriptionAr?:string|null;city?:string|null;locationName?:string|null;finalPrice:number;capacity?:number|null;cancellationPolicy?:string|null;meetingInstructions?:string|null;partnerName?:string|null;organizerType?:string|null;organizerName?:string|null;organizerLicenseNumber?:string|null;organizerLicenseIssuer?:string|null;images:string[]};
export default function ServiceDetails(){
 const {id}=useParams<{id:string}>();const [service,setService]=useState<Service|null>(null);const [loading,setLoading]=useState(true);const [qty,setQty]=useState(1);
 useEffect(()=>{fetch("/api/services",{cache:"no-store"}).then(r=>r.json()).then(d=>{if(d?.success)setService((d.data||[]).find((x:Service)=>x.id===id)||null)}).finally(()=>setLoading(false))},[id]);
 if(loading)return <main dir="rtl" className="min-h-screen bg-[#F7F5EF] p-10 text-center text-[#0D3B34]">جارٍ تحميل البرنامج...</main>;
 if(!service)return <main dir="rtl" className="min-h-screen bg-[#F7F5EF] p-10 text-center text-[#0D3B34]"><h1 className="text-2xl font-bold">الخدمة غير متاحة</h1><Link href="/services" className="mt-5 inline-block underline">العودة للخدمات والتجارب</Link></main>;
 const total=Number(service.finalPrice||0)*qty;
 return <main dir="rtl" className="min-h-screen bg-[#F7F5EF] text-[#0D3B34]">
  <header className="border-b border-[#0D3B34]/10 bg-white/75"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><Link href="/"><Image src="/Logo/arees-loop-logo.png" alt="Arees Loop" width={150} height={70} className="h-auto w-[120px]"/></Link><Link href="/services" className="text-xs font-bold">← الخدمات والتجارب</Link></div></header>
  <div className="mx-auto max-w-6xl px-5 py-8">
   <div className="grid items-start gap-8 lg:grid-cols-[minmax(360px,520px)_minmax(0,1fr)]" dir="ltr">
    <div className="lg:sticky lg:top-6" dir="rtl">
     <div className="relative mx-auto aspect-square w-full max-w-[520px] overflow-hidden rounded-[24px] bg-[#EAE6DC]">{service.images?.[0]?<img src={service.images[0]} alt={service.nameAr} className="h-full w-full object-contain"/>:<div className="flex h-full items-center justify-center text-sm font-bold opacity-35">لا توجد صورة مرفوعة لهذه الخدمة</div>}</div>
     <aside className="mx-auto mt-4 w-full max-w-[520px] rounded-[24px] border border-[#B99124]/20 bg-white p-5 shadow-sm">
      <div className="flex items-end justify-between gap-4"><div><p className="text-[11px] opacity-50">السعر يبدأ من</p><p className="mt-1 text-2xl font-bold">{Number(service.finalPrice).toLocaleString("ar-SA")} <span className="text-sm">ر.س</span></p></div><div><p className="mb-1 text-[11px] opacity-50">الكمية</p><div className="flex items-center rounded-xl border border-[#0D3B34]/15"><button onClick={()=>setQty(q=>Math.max(1,q-1))} className="h-9 w-9 text-lg">−</button><b className="min-w-9 text-center">{qty}</b><button onClick={()=>setQty(q=>q+1)} className="h-9 w-9 text-lg">+</button></div></div></div>
      <div className="mt-4 flex items-center justify-between border-t border-[#0D3B34]/8 pt-3 text-sm"><span>الإجمالي</span><b>{total.toLocaleString("ar-SA")} ر.س</b></div>
      <div className="mt-4 grid grid-cols-2 gap-2"><button className="rounded-xl border border-[#0D3B34] py-3 text-xs font-bold">ضع في السلة</button><button className="rounded-xl bg-[#0D3B34] py-3 text-xs font-bold text-white">احجز الآن</button></div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2"><div className="rounded-xl bg-[#F7F4EA] p-3"><p className="text-[10px] font-bold text-[#B99124]">نقاط AREES LOOP</p><p className="mt-1 text-[11px] opacity-60">استخدم نقاطك عند إتمام الحجز</p></div><div className="rounded-xl bg-[#F7F4EA] p-3"><p className="text-[10px] font-bold text-[#B99124]">كوبون خصم</p><div className="mt-1 flex gap-1"><input placeholder="أدخل الكود" className="min-w-0 flex-1 bg-transparent text-[11px] outline-none"/><button className="text-[10px] font-bold">تطبيق</button></div></div></div>
     </aside>
    </div>
    <div dir="rtl">
     <div className="mb-5"><p className="text-xs font-bold opacity-50">{service.category}{service.subCategory&&` · ${service.subCategory}`}</p><h1 className="mt-2 text-3xl font-bold leading-tight">{service.nameAr}</h1><p className="mt-2 text-sm opacity-55">{service.city}{service.locationName&&` · ${service.locationName}`}</p></div>
     <section className="rounded-[24px] bg-white p-6 shadow-sm md:p-7">
      <h2 className="text-xl font-bold">تفاصيل البرنامج</h2><div className="mt-4 text-sm leading-8 text-[#0D3B34]/75 [&_p]:mb-2 [&_ul]:mr-5 [&_ul]:list-disc [&_ol]:mr-5 [&_ol]:list-decimal" dangerouslySetInnerHTML={{__html:service.descriptionAr||"<p>تفاصيل البرنامج قيد الاستكمال.</p>"}}/>
      {service.meetingInstructions&&<><h3 className="mt-7 font-bold">تعليمات اللقاء</h3><p className="mt-2 text-sm leading-7 opacity-65">{service.meetingInstructions}</p></>}
      {service.cancellationPolicy&&<><h3 className="mt-7 font-bold">سياسة الإلغاء والاسترداد</h3><div className="mt-2 text-sm leading-7 opacity-65" dangerouslySetInnerHTML={{__html:service.cancellationPolicy}}/></>}
      {(service.partnerName||service.organizerName||service.organizerLicenseNumber||service.organizerLicenseIssuer)&&<div className="mt-7 border-t border-[#0D3B34]/10 pt-4"><div className="grid gap-1.5 text-[11px] leading-5 text-[#0D3B34]/48"><p><span className="font-bold">مقدم الخدمة:</span> {service.partnerName||"—"}</p><p><span className="font-bold">منظم البرنامج:</span> {service.organizerType==="OTHER"?(service.organizerName||"—"):(service.partnerName||"—")}</p>{service.organizerLicenseIssuer&&<p><span className="font-bold">جهة الترخيص أو التصريح:</span> {service.organizerLicenseIssuer}</p>}{service.organizerLicenseNumber&&<p><span className="font-bold">رقم الترخيص/التصريح:</span> {service.organizerLicenseNumber}</p>}</div></div>}
     </section>
    </div>
   </div>
  </div>
 </main>;
}