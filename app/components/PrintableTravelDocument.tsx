"use client";
import Image from "next/image";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {useEffect,useState} from "react";
import {readCustomerClaims} from "@/lib/customer-request-claims";

type Trip={
 reference:string;kind:string;status:string;customerName:string;contactNumber:string;
 origin:string;destination:string;travelDate:string;returnDate:string|null;tripType:string;
 adults:number;children:number;infants:number;carrierName:string|null;createdAt:string;
 quoteAmountSar:number|null;quoteNotes:string|null;quoteValidUntil:string|null;
};
type Docs={success:boolean;request:Trip;available:{quote:boolean;confirmedBooking:boolean};confirmation:Record<string,string>|null;confirmedAt:string|null;message?:string};
const shortDate=(value:string|null|undefined)=>value?new Intl.DateTimeFormat("ar-SA",{dateStyle:"long",timeZone:"UTC"}).format(new Date(value)):"غير محدد";
const price=(n:number)=>new Intl.NumberFormat("ar-SA",{style:"currency",currency:"SAR"}).format(n);
function Cell({name,value}:{name:string;value:string|number|undefined|null}){
 if(value===undefined||value===null||value==="")return null;
 return <div className="rounded-lg border border-[#E9DDC3] bg-[#FFFEFA] p-3"><p className="text-[10px] font-bold text-[#98782E]">{name}</p><p className="mt-1 break-words text-xs font-black leading-6 text-[#123E32]">{value}</p></div>;
}
export default function PrintableTravelDocument({type}:{type:"quote"|"confirmed"}){
 const params=useSearchParams();
 const reference=params.get("reference")||"";
 const [data,setData]=useState<Docs|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 useEffect(()=>{
  if(!reference){setError("لم يتم تحديد مرجع الطلب.");setLoading(false);return;}
  let live=true;
  const load=async()=>{
   try{
    const claim=readCustomerClaims().find(c=>c.reference===reference);
    const headers:Record<string,string>=claim?{"x-arees-request-token":claim.token}:{};
    const r=await fetch("/api/customer/travel-documents?reference="+encodeURIComponent(reference),{cache:"no-store",credentials:"include",headers});
    const d=await r.json();
    if(!r.ok||!d.success)throw Error(d.message||"تعذر تحميل المستند.");
    if(live){setData(d);setError("");}
   }catch(e){if(live)setError(e instanceof Error?e.message:"تعذر قراءة المستند.");}
   finally{if(live)setLoading(false);}
  };
  void load();return()=>{live=false;};
 },[reference]);
 const ready=type==="quote"?data?.available.quote:data?.available.confirmedBooking;
 const r=data?.request;
 const c=data?.confirmation;
 const ferry=r?.kind==="FERRY";
 return <main dir="rtl" className="min-h-screen bg-[#F5F3ED] px-4 py-6 text-[#103D34] print:bg-white print:p-0">
  <style>{'@page{size:A4;margin:12mm} @media print{body{background:white!important} .print-document{box-shadow:none!important;border:none!important;border-radius:0!important} .print-hide{display:none!important}}'}</style>
  <div className="print-hide mx-auto mb-4 flex max-w-[820px] flex-wrap items-center justify-between gap-3">
   <Link href={"/my-requests?reference="+encodeURIComponent(reference)} className="rounded-xl border border-[#D4AF37] bg-white px-4 py-3 text-xs font-bold">← العودة إلى طلباتي</Link>
   {ready&&<button type="button" onClick={()=>window.print()} className="rounded-xl bg-[#0D3B34] px-6 py-3 text-sm font-black text-white">🖨 طباعة / حفظ PDF</button>}
  </div>
  {loading&&<p role="status" className="mx-auto max-w-3xl rounded-xl bg-white p-6">جارٍ تحميل المستند...</p>}
  {error&&<p role="alert" className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">{error}</p>}
  {!loading&&!error&&!ready&&<p className="mx-auto max-w-3xl rounded-xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">هذا المستند لم يُعتمد بعد، ولا يمكن إصداره قبل استكمال مرحلته. عرض السعر يتطلب نشر الإدارة، وتأكيد الحجز يتطلب اعتماد السداد وتسجيل بيانات الحجز الفعلية.</p>}
  {ready&&r&&<article className="print-document mx-auto max-w-[820px] overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-white shadow-lg">
   <header className="border-b-4 border-[#B99644] p-6 print:p-3 sm:p-8">
    <div className="flex flex-wrap items-center justify-between gap-4">
     <div className="min-w-0 flex-1">
      <p className="text-[10px] font-extrabold tracking-wider text-[#B08A31]">AREES · OFFICIAL SERVICE DOCUMENT</p>
      <h1 className="mt-1 text-lg font-black">شركة أريس الحلول المتكاملة المحدودة</h1>
      <p dir="ltr" className="mt-1 text-left text-xs font-black">AREES AL-HELLOUL AL-MUTAKAMLA CO.LTD</p>
      <p className="mt-3 text-[11px] font-bold leading-6">ترخيص وزارة السياحة: 73104550 · وكيل سفر وسياحة</p>
      <p className="text-[11px] leading-6">السجل التجاري: 7037003618 · الرقم الضريبي: 311897578200003</p>
      <p className="text-[11px] leading-6">المملكة العربية السعودية · المدينة المنورة - حي قربان</p>
      <p dir="ltr" className="text-left text-[11px]">Saudi Arabia · Medina - Qurban District · Phone: +9660148390473</p>
     </div>
     <Image src="/Logo/arees-integrated-solutions-logo.png" width={112} height={112} unoptimized alt="شعار شركة أريس" className="h-[100px] w-[100px] shrink-0 object-contain"/>
    </div>
    <div className="mt-4 rounded-xl bg-[#0D3B34] px-5 py-4 text-white">
     <h2 className="text-xl font-black">{type==="quote"?("عرض سعر "+(ferry?"باخرة":"طيران")):("تفاصيل حجز "+(ferry?"باخرة":"طيران")+" مؤكد")}</h2>
     <p dir="ltr" className="mt-1 text-left text-xs font-bold">{type==="quote"?"Quotation / Estimate":"Confirmed Booking Details"}</p>
    </div>
   </header>
   <div className="space-y-5 px-6 py-6 print:space-y-3 print:px-4 print:py-3 sm:px-8">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 print:grid-cols-3">
     <Cell name="رقم طلب أريس" value={r.reference}/>
     <Cell name="اسم العميل" value={r.customerName}/>
     <Cell name="تاريخ المستند" value={shortDate(type==="quote"?r.createdAt:data?.confirmedAt)}/>
     <Cell name="من" value={r.origin}/>
     <Cell name="إلى" value={r.destination}/>
     <Cell name={ferry?"شركة البواخر / الناقل":"شركة الطيران / الناقل"} value={r.carrierName||undefined}/>
     <Cell name="تاريخ السفر" value={shortDate(r.travelDate)}/>
     <Cell name="تاريخ العودة" value={r.returnDate?shortDate(r.returnDate):undefined}/>
     <Cell name="رقم التواصل" value={r.contactNumber}/>
    </div>
    <section>
     <h3 className="border-b border-[#D4AF37] pb-2 text-sm font-black">بيانات المسافرين</h3>
     <div className="mt-2 grid grid-cols-3 gap-2 text-center">
      {[["البالغون",r.adults],["الأطفال",r.children],["الرضع",r.infants]].map(([label,n])=><div key={String(label)} className="rounded-xl bg-[#F8F4EA] p-3"><p className="text-xs">{label}</p><b className="mt-1 block text-xl">{n}</b></div>)}
     </div>
    </section>
    {type==="quote"&&r.quoteAmountSar!==null&&<>
     <section className="overflow-hidden rounded-xl border border-[#E2D3B2]">
      <table className="w-full border-collapse text-right text-xs">
       <thead className="bg-[#F4ECD9]"><tr><th className="p-3">البند</th><th className="p-3">الكمية</th><th className="p-3">السعر الإجمالي</th></tr></thead>
       <tbody><tr className="border-t border-[#E2D3B2]"><td className="p-3">عرض خدمة {ferry?"الباخرة":"الطيران"} حسب البيانات الموضحة أعلاه</td><td className="p-3">1</td><td className="p-3 font-black">{price(r.quoteAmountSar)}</td></tr></tbody>
      </table>
     </section>
     <div className="flex justify-between rounded-xl bg-[#0D3B34] px-4 py-3 text-white"><span className="font-bold">إجمالي عرض السعر</span><strong>{price(r.quoteAmountSar)}</strong></div>
     {r.quoteNotes&&<section><h3 className="text-sm font-black">تفاصيل العرض</h3><p className="mt-2 whitespace-pre-wrap rounded-xl bg-[#F7F5EF] p-4 text-xs leading-7">{r.quoteNotes}</p></section>}
     {r.quoteValidUntil&&<p className="text-xs">صالح حتى: {shortDate(r.quoteValidUntil)}</p>}
     <p className="rounded-xl border border-[#D4AF37]/40 bg-[#FFFAED] p-3 text-[11px] leading-6">هذا المستند عرض سعر وليس فاتورة ضريبية أو تذكرة صادرة أو تأكيد حجز. الأسعار والخدمات خاضعة للشروط والتوفر حتى إتمام التأكيد النهائي. لا يُفترض من هذا المستند وحده أن السداد تم.</p>
    </>}
    {type==="confirmed"&&c&&<>
     <section><h3 className="border-b border-[#D4AF37] pb-2 text-sm font-black">تفاصيل الرحلة المؤكدة</h3>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 print:grid-cols-3">
       <Cell name="رقم الحجز لدى الناقل" value={c.bookingReference}/>
       <Cell name={ferry?"الباخرة أو رقم الرحلة":"رقم الرحلة"} value={c.flightNumber}/>
       <Cell name={ferry?"موعد الإبحار":"موعد الإقلاع"} value={c.departureTime}/>
       <Cell name="موعد الوصول" value={c.arrivalTime}/>
       <Cell name="صالة / بوابة المغادرة" value={c.departureTerminal}/>
       <Cell name="صالة الوصول" value={c.arrivalTerminal}/>
       <Cell name="رحلة العودة" value={c.returnFlightNumber}/>
       <Cell name="مغادرة العودة" value={c.returnDepartureTime}/>
       <Cell name="وصول العودة" value={c.returnArrivalTime}/>
      </div>
     </section>
     <section><h3 className="border-b border-[#D4AF37] pb-2 text-sm font-black">الأمتعة حسب فئة المسافر</h3>
      <table className="mt-2 w-full border-collapse text-right text-xs"><thead><tr className="bg-[#F4ECD9]"><th className="border border-[#E4D5B5] p-2">الفئة</th><th className="border border-[#E4D5B5] p-2">العدد</th><th className="border border-[#E4D5B5] p-2">الأمتعة وفق التذكرة</th></tr></thead>
       <tbody>{[["البالغون",r.adults,c.adultBaggage],["الأطفال",r.children,c.childBaggage],["الرضع",r.infants,c.infantBaggage]].map(([name,count,baggage])=><tr key={String(name)}><td className="border border-[#E4D5B5] p-2">{name}</td><td className="border border-[#E4D5B5] p-2">{count}</td><td className="border border-[#E4D5B5] p-2">{baggage||"راجع شروط التذكرة الأصلية"}</td></tr>)}</tbody>
      </table>
     </section>
     {(c.hotelName||c.hotelAddress||c.hotelNotes)&&<section><h3 className="border-b border-[#D4AF37] pb-2 text-sm font-black">تفاصيل السكن (إن كان مشمولاً)</h3>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 print:grid-cols-3"><Cell name="اسم الفندق" value={c.hotelName}/><Cell name="الدخول" value={c.hotelCheckIn}/><Cell name="الخروج" value={c.hotelCheckOut}/><Cell name="نوع الغرفة" value={c.roomType}/><Cell name="عنوان الفندق" value={c.hotelAddress}/></div>
      {c.hotelNotes&&<p className="mt-2 whitespace-pre-wrap rounded-xl bg-[#F7F5EF] p-3 text-xs leading-7">{c.hotelNotes}</p>}
     </section>}
     {c.travelNotes&&<section><h3 className="text-sm font-black">ملاحظات وتعليمات السفر</h3><p className="mt-2 whitespace-pre-wrap rounded-xl bg-[#F7F5EF] p-3 text-xs leading-7">{c.travelNotes}</p></section>}
     <p className="rounded-xl border border-[#D4AF37]/40 bg-[#FFFAED] p-3 text-[11px] leading-6">هذا مستند تفاصيل حجز مؤكد وفق البيانات المسجلة من موظف أريس بعد اعتماد السداد. ليس التذكرة الأصلية ولا فاتورة ضريبية. يرجى الرجوع إلى التذكرة الأصلية للتأكد من بيانات الصعود والشروط النهائية.</p>
    </>}
   </div>
   <footer className="border-t border-[#D4AF37]/35 px-6 py-3 text-[10px] text-[#6F776D]">AREES · شركة أريس الحلول المتكاملة المحدودة · المدينة المنورة · هذا المستند خاص بصاحب الطلب</footer>
  </article>}
 </main>;
}
