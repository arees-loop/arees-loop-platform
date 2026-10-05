"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Service = {
  id:string; nameAr:string; category:string; subCategory?:string|null; descriptionAr?:string|null;
  city?:string|null; locationName?:string|null; finalPrice:number; capacity?:number|null;
  partnerName?:string|null; images:string[];
};

export default function PublicServicesPage(){
  const [services,setServices]=useState<Service[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    fetch("/api/services",{cache:"no-store"})
      .then(r=>r.json()).then(d=>{ if(d?.success) setServices(d.data||[]); })
      .finally(()=>setLoading(false));
  },[]);

  return <main dir="rtl" className="min-h-screen bg-[#F7F5EF] text-[#0D3B34]">
    <header className="border-b border-[#0D3B34]/10 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/"><Image src="/Logo/arees-loop-logo.png" alt="Arees Loop" width={150} height={70} className="h-auto w-[120px]"/></Link>
        <Link href="/discover" className="rounded-full border border-[#0D3B34]/15 px-4 py-2 text-xs font-bold">اكتشف حولك</Link>
      </div>
    </header>

    <section className="mx-auto max-w-7xl px-5 py-10">
      <p className="text-xs font-bold text-[#B99124]">AREES LOOP</p>
      <h1 className="mt-2 text-3xl font-black md:text-4xl">الخدمات والتجارب</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#0D3B34]/65">برامج وتجارب معتمدة ومنشورة عبر Arees Loop.</p>

      {loading ? <div className="mt-10 rounded-3xl bg-white p-8 text-center">جارٍ تحميل التجارب...</div> :
      services.length===0 ? <div className="mt-10 rounded-3xl border border-[#0D3B34]/10 bg-white p-8 text-center">لا توجد خدمات منشورة حالياً.</div> :
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {services.map(service=><Link key={service.id} href={`/services/${service.id}`} className="group overflow-hidden rounded-[28px] border border-[#0D3B34]/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
          <div className="relative h-56 bg-[#EAE6DC]">
            {service.images?.[0] ? <Image src={service.images[0]} alt={service.nameAr} fill className="object-cover"/> : <div className="flex h-full items-center justify-center px-6 text-center text-xs font-bold text-[#0D3B34]/35">لا توجد صورة مرفوعة لهذه الخدمة</div>}
            <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold">{service.subCategory || service.category}</span>
          </div>
          <div className="p-5">
            <p className="text-xs text-[#0D3B34]/55">{service.locationName || service.city || "الموقع غير محدد"}</p>
            <h2 className="mt-2 text-xl font-black">{service.nameAr}</h2>
            <p className="mt-3 line-clamp-2 text-xs leading-6 text-[#0D3B34]/60">{service.descriptionAr || "اكتشف تفاصيل هذه التجربة واحجزها عبر Arees Loop."}</p>
            <div className="mt-5 flex items-end justify-between border-t border-[#0D3B34]/10 pt-4">
              <div><span className="text-[10px] text-[#0D3B34]/50">ابتداءً من</span><p className="text-lg font-black">{Number(service.finalPrice).toLocaleString("ar-SA")} ر.س</p></div>
              <span className="rounded-full bg-[#0D3B34] px-4 py-2 text-[11px] font-bold text-white">عرض التفاصيل</span>
            </div>
          </div>
        </Link>)}
      </div>}
    </section>
  </main>;
}
