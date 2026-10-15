"use client";
import Link from "next/link";
import {useParams} from "next/navigation";
import {useEffect,useState} from "react";
import {readCustomerClaims} from "@/lib/customer-request-claims";

type Quote={reference:string;kind:string;title:string;status:string;amountSar:number|null;quoteNotes:string|null;expiresAt:string|null};
type Method={id:string;label:string;available:boolean;note:string};
type Payload={success:true;quote:Quote;eligible:boolean;reason:string;methods:Method[]};
const money=(value:number)=>value.toLocaleString("ar-SA",{style:"currency",currency:"SAR"});
export default function RequestCheckoutPage(){
 const params=useParams<{reference:string}>();
 const reference=params?.reference||"";
 const [data,setData]=useState<Payload|null>(null);
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(true);
 const [method,setMethod]=useState("BANK_TRANSFER");
 useEffect(()=>{
  if(!reference)return;
  const abort=new AbortController();
  void fetch("/api/customer/request-checkout",{
   method:"POST",headers:{"Content-Type":"application/json"},
   body:JSON.stringify({reference,claims:readCustomerClaims().filter(c=>c.reference===reference)}),
   credentials:"include",cache:"no-store",signal:abort.signal
  }).then(async r=>{const payload=await r.json();if(!r.ok||!payload.success)throw new Error(payload.message||"تعذر تحميل عرض السعر.");return payload as Payload})
   .then(payload=>{if(!abort.signal.aborted)setData(payload)})
   .catch(e=>{if(!abort.signal.aborted)setError(e instanceof Error?e.message:"تعذر تحميل عرض السعر.")})
   .finally(()=>{if(!abort.signal.aborted)setLoading(false)});
  return()=>abort.abort();
 },[reference]);
 return <main dir="rtl" className="min-h-screen bg-[#F7F5EF] px-4 pb-20 pt-32 text-[#0D3B34] md:px-8">
  <div className="mx-auto max-w-3xl">
   <p className="text-xs font-black tracking-widest text-[#AE8A31]">AREES LOOP · REQUEST CHECKOUT</p>
   <h1 className="mt-3 text-3xl font-black">مراجعة عرض السعر واختيار وسيلة الدفع</h1>
   <p className="mt-2 text-sm leading-7 text-[#0D3B34]/65">السعر والحالة يتم التحقق منهما مباشرة من الطلب لدى أريس لوب، ولا يمكن تعديل المبلغ من هذه الصفحة.</p>
   <Link href={`/my-requests?reference=${encodeURIComponent(reference)}`} className="mt-4 inline-flex rounded-xl border border-[#D4AF37]/40 px-4 py-2 text-xs font-bold">العودة إلى تفاصيل الطلب ←</Link>
   {loading&&<p role="status" className="mt-7 rounded-2xl bg-white p-6">جارٍ التحقق من طلبك...</p>}
   {error&&<div role="alert" className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-sm">{error}</p><Link href="/login" className="mt-3 inline-block text-sm font-bold underline">تسجيل الدخول</Link></div>}
   {data&&<section className="mt-7 space-y-5">
     <div className="rounded-3xl border border-[#D4AF37]/35 bg-white p-6 shadow-sm">
       <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-black">{data.quote.title}</h2><p className="mt-1 text-xs">رقم الطلب: <span dir="ltr">{data.quote.reference}</span></p></div><span className={`rounded-full px-3 py-2 text-xs font-black ${data.eligible?"bg-emerald-100 text-emerald-800":"bg-amber-100 text-amber-900"}`}>{data.eligible?"متاح — عرض معتمد":"غير متاح للسداد"}</span></div>
       {data.quote.amountSar!==null&&data.eligible&&<p className="mt-5 text-3xl font-black text-[#9A7224]">{money(data.quote.amountSar)}</p>}
       {data.quote.quoteNotes&&<p className="mt-4 whitespace-pre-wrap rounded-xl bg-[#F8F5EB] p-3 text-sm leading-7">{data.quote.quoteNotes}</p>}
       {data.quote.expiresAt&&<p className="mt-3 text-xs text-[#0D3B34]/70">صلاحية العرض: {new Intl.DateTimeFormat("ar-SA",{dateStyle:"medium"}).format(new Date(data.quote.expiresAt))}</p>}
       {!data.eligible&&<p role="status" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-7 text-amber-900">{data.reason}</p>}
     </div>
     {data.eligible&&<div className="rounded-3xl border border-[#D4AF37]/35 bg-white p-6">
       <h2 className="text-lg font-black">اختر وسيلة السداد</h2>
       <p className="mt-2 text-sm text-[#0D3B34]/65">الوسائل تظهر للمعاينة فقط حتى يتم ربط الطلب بالتحصيل والتحقق من الحساب البنكي.</p>
       <div className="mt-5 space-y-3">{data.methods.map(option=><label key={option.id} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#D4AF37]/30 p-4">
         <input type="radio" name="payment-method" className="mt-1 accent-[#0D3B34]" checked={method===option.id} onChange={()=>setMethod(option.id)}/>
         <span className="flex-1"><strong className="text-sm">{option.label}</strong><span className="mt-1 block text-xs leading-6 text-[#0D3B34]/65">{option.note}</span></span>
         <span className="rounded-full bg-[#F4E9D1] px-2 py-1 text-[10px] font-bold">غير مفعّل</span>
       </label>)}</div>
       <button type="button" disabled className="mt-5 w-full rounded-xl bg-[#0D3B34] px-5 py-3.5 text-sm font-black text-white opacity-50">إتمام السداد — قريباً بعد التحقق</button>
       <p className="mt-3 text-xs leading-6 text-[#0D3B34]/60">لن نطلب منك إجراء تحويل مالي أو رفع إيصال حتى تصبح وسيلة الدفع جاهزة وآمنة. لا يعني عرض السعر تأكيد الحجز.</p>
     </div>}
   </section>}
  </div>
 </main>;
}
