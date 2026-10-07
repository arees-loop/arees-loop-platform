"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Booking = {
  id:string; reference:string; guests:number; totalAmount:string|number; status:string; serviceDate:string|null; bookingDate:string;
  service:{ id:string; nameAr:string; city:string|null; images:{url:string}[] };
};

const statusLabel:Record<string,string>={PENDING:"قيد الانتظار",PAID:"مدفوع",CONFIRMED:"مؤكد",IN_PROGRESS:"قيد التنفيذ",COMPLETED:"مكتمل",CANCELLED:"ملغي",REFUNDED:"مسترد"};

export default function BookingsPage(){
 const [bookings,setBookings]=useState<Booking[]>([]);
 const [loading,setLoading]=useState(true);
 const [filter,setFilter]=useState("ALL");
 useEffect(()=>{fetch("/api/customer/bookings",{cache:"no-store"}).then(r=>r.json()).then(d=>{if(d.success)setBookings(d.bookings||[])}).finally(()=>setLoading(false));},[]);
 const shown=useMemo(()=>filter==="ALL"?bookings:bookings.filter(b=>b.status===filter),[bookings,filter]);
 const completed=bookings.filter(b=>b.status==="COMPLETED").length;
 const upcoming=bookings.filter(b=>["PENDING","PAID","CONFIRMED","IN_PROGRESS"].includes(b.status)).length;
 return <main dir="rtl" className="min-h-screen bg-[#F7F5EF] px-5 pb-24 pt-32 text-[#0D3B34] md:px-8">
  <div className="mx-auto max-w-[1380px]">
   <p className="text-[9px] font-bold tracking-[.2em] text-[#B99124]">MY BOOKINGS</p><h1 className="mt-2 text-4xl font-black">حجوزاتي</h1>
   <p className="mt-2 text-xs text-[#0D3B34]/60">الحجوزات الفعلية المرتبطة بحسابك في Arees Loop.</p>
   <section className="mt-7 grid gap-4 sm:grid-cols-3">
    {[["إجمالي الحجوزات",bookings.length],["القادمة",upcoming],["المكتملة",completed]].map(([x,n])=><div key={String(x)} className="rounded-[22px] border border-white bg-white/70 p-5"><p className="text-xs text-[#0D3B34]/55">{x}</p><p className="mt-2 text-3xl font-black">{n}</p></div>)}
   </section>
   <div className="mt-7 flex flex-wrap gap-2">{[["ALL","الكل"],["CONFIRMED","المؤكدة"],["COMPLETED","المكتملة"],["CANCELLED","الملغاة"]].map(([v,l])=><button key={v} onClick={()=>setFilter(v)} className={"rounded-full px-5 py-2 text-xs font-bold "+(filter===v?"bg-[#0D3B34] text-white":"border border-[#0D3B34]/10 bg-white")}>{l}</button>)}</div>
   <section className="mt-5 space-y-4">
    {loading?<div className="rounded-3xl bg-white/70 p-10 text-center">جاري تحميل حجوزاتك...</div>:shown.length===0?<div className="rounded-3xl bg-white/70 p-10 text-center"><h2 className="font-black">لا توجد حجوزات في هذا القسم</h2><Link href="/discover" className="mt-4 inline-flex rounded-xl bg-[#0D3B34] px-5 py-3 text-xs font-bold text-white">اكتشف البرامج والتجارب</Link></div>:shown.map(b=><article key={b.id} className="overflow-hidden rounded-[26px] border border-white bg-white/75 md:grid md:grid-cols-[210px_1fr]">
     <div className="min-h-[170px] bg-[#0D3B34]/10 bg-cover bg-center" style={b.service.images[0]?.url?{backgroundImage:`url("${b.service.images[0].url}")`}:{}} />
     <div className="p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="rounded-full bg-[#0D3B34]/8 px-3 py-1 text-[10px] font-bold">{statusLabel[b.status]||b.status}</span><h2 className="mt-3 text-xl font-black">{b.service.nameAr}</h2><p className="mt-2 text-xs text-[#0D3B34]/60">{b.service.city||"الموقع حسب تفاصيل الخدمة"} · {b.guests} زائر</p><p className="mt-2 text-[10px] text-[#0D3B34]/50">رقم الحجز: {b.reference}</p></div><div><p className="text-[10px] text-[#0D3B34]/50">الإجمالي</p><p className="mt-1 text-lg font-black">{Number(b.totalAmount).toFixed(2)} ر.س</p></div></div>
     <div className="mt-5 border-t border-[#0D3B34]/10 pt-4 text-xs">{new Intl.DateTimeFormat("ar-SA",{dateStyle:"medium"}).format(new Date(b.serviceDate||b.bookingDate))}</div>
    </div></article>)}
   </section>
  </div>
 </main>
}