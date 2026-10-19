"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {readCustomerClaims} from "@/lib/customer-request-claims";
import CustomerTicket from "@/app/components/CustomerTicket";

type Documents={
 available:{quote:boolean;originalTicket:boolean;confirmedBooking:boolean};
 request:{reference:string;kind:string;status:string};
};

export default function CustomerTravelDocuments({reference}:{reference:string}){
 const [documents,setDocuments]=useState<Documents|null>(null);
 const [loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{
  let live=true;
  const load=async()=>{
   try{
    const claim=readCustomerClaims().find(x=>x.reference===reference);
    const headers:Record<string,string>=claim?{"x-arees-request-token":claim.token}:{};
    const r=await fetch("/api/customer/travel-documents?reference="+encodeURIComponent(reference),{headers,cache:"no-store",credentials:"include"});
    const d=await r.json();
    if(!r.ok||!d.success)throw Error(d.message||"تعذر تحميل مستندات الطلب.");
    if(live){setDocuments(d);setError("");}
   }catch(e){if(live)setError(e instanceof Error?e.message:"تعذر تحميل المستندات.");}
   finally{if(live)setLoading(false);}
  };
  void load();return()=>{live=false};
 },[reference]);

 const previewPath=(type:"quote"|"confirmed")=>"/my-requests/documents/"+type+"?reference="+encodeURIComponent(reference);
 const items=[
  {id:"quote",number:"01",title:"عرض السعر",description:"عرض السعر المعتمد وشروط الخدمة",ready:documents?.available.quote||false,href:previewPath("quote")},
  {id:"ticket",number:"02",title:"التذكرة الأصلية",description:"ملف PDF الصادر من الناقل أو مشغل الباخرة",ready:documents?.available.originalTicket||false,href:""},
  {id:"confirmed",number:"03",title:"تفاصيل الحجز المؤكد",description:"مرجع الحجز، المسافرون، الأمتعة، السكن وتعليمات السفر",ready:documents?.available.confirmedBooking||false,href:previewPath("confirmed")}
 ] as const;
 return <section dir="rtl" className="mt-5 rounded-2xl border border-[#D4AF37]/45 bg-[#FFFCF6] p-4">
  <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-base font-black text-[#0D3B34]">📁 مستندات رحلتك الثلاثة</h3><p className="mt-1 text-xs leading-6 text-[#65746C]">ملفات خاصة بطلبك، تظهر عند اعتماد كل مرحلة. عرض السعر وتأكيد الحجز قابلان للحفظ PDF عبر الطباعة، والتذكرة الأصلية PDF مباشر.</p></div><span className="rounded-full bg-[#F7E9C6] px-3 py-1 text-xs font-black text-[#8C671C]">{items.filter(x=>x.ready).length} / 3 جاهز</span></div>
  {loading&&<p className="mt-4 text-xs" role="status">جارٍ فحص المستندات الخاصة بطلبك...</p>}
  {error&&<p className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-800" role="alert">{error}</p>}
  {documents&&<div className="mt-4 grid gap-3 sm:grid-cols-3">
   {items.map(item=><div key={item.id} className={"rounded-xl border p-4 "+(item.ready?"border-[#B8D6C1] bg-white":"border-[#E5D9C2] bg-[#F8F6F0]")}>
     <div className="flex items-center justify-between gap-3"><span className="text-xs font-bold text-[#A78633]">{item.number}</span><span className={"rounded-full px-2 py-1 text-[10px] font-bold "+(item.ready?"bg-[#E2F3E8] text-[#14623D]":"bg-[#F0EBE1] text-[#766B55]")}>{item.ready?"✓ جاهز":"قيد التجهيز"}</span></div>
     <p className="mt-2 text-sm font-black text-[#103D34]">{item.title}</p>
     <p className="mt-2 min-h-[43px] text-[11px] leading-5 text-[#6B766C]">{item.description}</p>
     {item.id==="ticket"?(item.ready?<CustomerTicket reference={reference}/>:<p className="mt-3 rounded-lg border border-dashed border-[#DED4C4] px-3 py-2 text-xs">تظهر التذكرة بعد إصدارها وإرفاقها من الإدارة.</p>):
      item.ready?<Link target="_blank" href={item.href} className="mt-3 inline-block w-full rounded-xl bg-[#0D3B34] px-4 py-2.5 text-center text-xs font-black text-white">معاينة / حفظ PDF ↗</Link>:
      <p className="mt-3 rounded-lg border border-dashed border-[#DED4C4] px-3 py-2 text-xs">{item.id==="quote"?"بانتظار نشر عرض السعر من الإدارة.":"بانتظار اعتماد السداد وحفظ تفاصيل الحجز المؤكد."}</p>}
   </div>)}
  </div>}
  <p className="mt-3 text-[11px] leading-5 text-[#6C776F]">هذه الملفات لا تعني تأكيد الدفع إلا بعد مراجعة الإدارة للتحويل. رابط واتساب لا يتيح الوصول للملفات دون تسجيل الدخول أو رمز متابعة الطلب الخاص.</p>
 </section>;
}
