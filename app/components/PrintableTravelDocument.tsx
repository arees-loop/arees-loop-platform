"use client";
import Image from "next/image";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {useEffect,useState} from "react";
import {readCustomerClaims} from "@/lib/customer-request-claims";
import {bilingualDate,vatBreakdown,sar,type QuoteVatTreatment} from "@/lib/quotation-format";

type Trip={
 reference:string;kind:string;status:string;customerName:string;contactNumber:string;
 origin:string;destination:string;travelDate:string;returnDate:string|null;tripType:string;
 adults:number;children:number;infants:number;carrierName:string|null;createdAt:string;
 quoteAmountSar:number|null;quoteNotes:string|null;quoteValidUntil:string|null;quoteUpdatedAt:string|null;quoteVatTreatment:QuoteVatTreatment;
};
type Docs={success:boolean;request:Trip;available:{quote:boolean;confirmedBooking:boolean};confirmation:Record<string,string>|null;confirmedAt:string|null;message?:string};
const shortDate=(value:string|null|undefined)=>{const d=bilingualDate(value);return "ميلادي / Gregorian: "+d.gregorian+"\nهجري / Hijri: "+d.hijri;};
function Cell({name,en,value}:{name:string;en?:string;value:string|number|undefined|null}){
 if(value===undefined||value===null||value==="")return null;
 return <div className="rounded-lg border border-[#E9DDC3] bg-[#FFFEFA] p-3"><p className="text-[10px] font-bold text-[#98782E]">{name}</p>{en&&<p dir="ltr" className="text-right text-[9px] leading-5 text-[#796E55]">{en}</p>}<p className="mt-1 whitespace-pre-line break-words text-xs font-black leading-6 text-[#123E32]">{value}</p></div>;
}
function DualLabel({ar,en}:{ar:string;en:string}){
 return <span className="block text-right" dir="rtl"><span className="block text-xs font-black">{ar}</span><span dir="ltr" className="mt-1 block text-right text-[10px] font-medium opacity-80">{en}</span></span>;
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
 const vat=r?.quoteAmountSar!==null&&r?.quoteAmountSar!==undefined?vatBreakdown(r.quoteAmountSar,r.quoteVatTreatment||"UNDETERMINED"):null;
 return <main dir="rtl" className="min-h-screen bg-[#F5F3ED] px-4 py-6 text-[#103D34] print:bg-white print:p-0">
  <style>{'@page{size:A4;margin:12mm} @media print{body{background:white!important} .print-document{box-shadow:none!important;border:none!important;border-radius:0!important} .print-hide{display:none!important}}'}</style>
  <div className="print-hide mx-auto mb-4 flex max-w-[820px] flex-wrap items-center justify-between gap-3">
   <Link href={"/my-requests?reference="+encodeURIComponent(reference)} className="rounded-xl border border-[#D4AF37] bg-white px-4 py-3 text-xs font-bold">← العودة إلى طلباتي</Link>
   {ready&&<button type="button" onClick={()=>window.print()} className="rounded-xl bg-[#0D3B34] px-6 py-3 text-sm font-black text-white">🖨 طباعة / حفظ PDF</button>}
  </div>
  {loading&&<p role="status" className="mx-auto max-w-3xl rounded-xl bg-white p-6">جارٍ تحميل المستند...</p>}
  {error&&<p role="alert" className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">{error}</p>}
  {!loading&&!error&&!ready&&<p className="mx-auto max-w-3xl rounded-xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">هذا المستند لم يُعتمد بعد، ولا يمكن إصداره قبل استكمال مرحلته. عرض السعر يتطلب نشر الإدارة، وتأكيد الحجز يتطلب اعتماد السداد وتسجيل بيانات الحجز الفعلية.</p>}
  {ready&&r&&<article id="arees-print-sheet" className="print-document mx-auto max-w-[820px] overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-white shadow-lg">
   <header className="border-b-4 border-[#B99644] p-6 print:p-3 sm:p-8">
    <div className="flex flex-wrap items-center justify-between gap-4">
     <div className="min-w-0 flex-1 space-y-1">
      <DualLabel ar="شركة أريس الحلول المتكاملة المحدودة" en="AREES AL-HELLOUL AL-MUTAKAMLA CO.LTD"/>
      <DualLabel ar="الرقم الضريبي: 311897578200003" en="Tax No.: 311897578200003"/>
      <DualLabel ar="ترخيص وزارة السياحة رقم 73104550" en="Ministry of Tourism License No.: 73104550"/>
      <DualLabel ar="فئة الترخيص: وكالة سفر وسياحة" en="License Category: Travel and Tourism Agency"/>
      <DualLabel ar="السجل التجاري: 7037003618" en="Commercial Registration No.: 7037003618"/>
      <DualLabel ar="السعودية — المدينة المنورة، حي قربان" en="Saudi Arabia — Medina, Qurban District"/>
      <DualLabel ar="الهاتف: +9660148390473" en="Phone: +9660148390473"/>
     </div>
     <Image src="/Logo/arees-integrated-solutions-logo.png" width={112} height={112} unoptimized alt="شعار شركة أريس" className="h-[100px] w-[100px] shrink-0 object-contain"/>
    </div>
    <div className="mt-4 rounded-xl bg-[#0D3B34] px-5 py-4 text-white">
     <h2 className="text-xl font-black">{type==="quote"?("عرض سعر "+(ferry?"باخرة":"طيران")):("تفاصيل حجز "+(ferry?"باخرة":"طيران")+" مؤكد")}</h2>
     <p dir="ltr" className="mt-1 text-right text-xs font-bold">{type==="quote"?"Quotation / Estimate":"Confirmed Booking Details"}</p>
    </div>
   </header>
   <div className="space-y-5 px-6 py-6 print:space-y-3 print:px-4 print:py-3 sm:px-8">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 print:grid-cols-3">
     <Cell name="رقم طلب أريس" value={r.reference}/>
     <Cell name="اسم العميل" value={r.customerName}/>
     <Cell name="تاريخ المستند" en="Document Date" value={shortDate(type==="quote"?r.quoteUpdatedAt||r.createdAt:data?.confirmedAt)}/>
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
       <thead className="bg-[#F4ECD9]"><tr>
         <th className="border border-[#E2D3B2] p-3"><DualLabel ar="البند" en="Item"/></th>
         <th className="border border-[#E2D3B2] p-3"><DualLabel ar="الوصف" en="Description"/></th>
         <th className="border border-[#E2D3B2] p-3"><DualLabel ar="الكمية" en="Qty"/></th>
         <th className="border border-[#E2D3B2] p-3"><DualLabel ar="المبلغ الإجمالي" en="Total Amount"/></th>
       </tr></thead>
       <tbody><tr>
         <td className="border border-[#E2D3B2] p-3"><DualLabel ar={ferry?"تذكرة باخرة دولية":"تذكرة طيران"} en={ferry?"International Ferry Ticket":"Air Ticket"}/></td>
         <td className="border border-[#E2D3B2] p-3"><p>{r.origin} ← {r.destination}</p><p dir="ltr" className="mt-1 text-right text-[10px]">From {r.origin} to {r.destination}</p></td>
         <td className="border border-[#E2D3B2] p-3">1</td>
         <td dir="ltr" className="border border-[#E2D3B2] p-3 text-right font-bold">{sar(r.quoteAmountSar)}</td>
       </tr></tbody>
      </table>
     </section>
     <section className="rounded-xl border border-[#D4AF37]/40 p-4">
       <h3 className="mb-3"><DualLabel ar="ملخص السعر وضريبة القيمة المضافة" en="Price Summary & Value Added Tax (VAT)"/></h3>
       <div className="space-y-3 text-xs">
         <div className="flex justify-between gap-3"><DualLabel ar="نسبة ضريبة القيمة المضافة" en="VAT Rate"/><b>{r.quoteVatTreatment==="STANDARD_15_INCLUDED"?"15%":r.quoteVatTreatment==="ZERO_RATED_INTERNATIONAL"?"0%":"قيد المراجعة / Pending"}</b></div>
         <div className="flex justify-between gap-3"><DualLabel ar="السعر قبل الضريبة" en="Amount Excluding VAT"/><b>{vat?.net===null||vat===null?"—":sar(vat.net)}</b></div>
         <div className="flex justify-between gap-3"><DualLabel ar="قيمة ضريبة القيمة المضافة" en="VAT Amount"/><b>{vat?.vat===null||vat===null?"—":sar(vat.vat)}</b></div>
         <div className="flex justify-between gap-3 border-t border-[#D4AF37]/40 pt-3"><DualLabel ar="إجمالي عرض السعر" en="Total Quotation (SAR)"/><strong>{sar(r.quoteAmountSar)}</strong></div>
       </div>
       <p className="mt-3 text-[10px] leading-5 text-[#776437]">{r.quoteVatTreatment==="STANDARD_15_INCLUDED"?"ضريبة 15% مشمولة ضمن السعر الإجمالي ولا تُضاف عليه.":r.quoteVatTreatment==="ZERO_RATED_INTERNATIONAL"?"النقل الدولي مصنّف بنسبة صفر بعد مراجعة الإدارة.":"لم يُعتمد التصنيف الضريبي بعد؛ لا تُحسب 15% تلقائياً على النقل الدولي المؤهل."}</p>
       <p dir="ltr" className="mt-1 text-right text-[10px] leading-5 text-[#776437]">{r.quoteVatTreatment==="STANDARD_15_INCLUDED"?"15% VAT is included in the gross price.":r.quoteVatTreatment==="ZERO_RATED_INTERNATIONAL"?"Eligible international transport: zero-rated after review.":"VAT treatment is pending; standard 15% is not automatically applicable to eligible international transport."}</p>
     </section>
     {r.quoteNotes&&<section><DualLabel ar="تفاصيل وملاحظات العرض" en="Quotation Details & Notes"/><p className="mt-2 whitespace-pre-wrap rounded-xl bg-[#F7F5EF] p-4 text-xs leading-7">{r.quoteNotes}</p></section>}
     {r.quoteValidUntil&&<div><DualLabel ar="صلاحية العرض" en="Valid Until"/><p className="whitespace-pre-line text-xs">{shortDate(r.quoteValidUntil)}</p></div>}
     <p className="rounded-xl border border-[#D4AF37]/40 bg-[#FFFAED] p-3 text-[11px] leading-6">هذا المستند عرض سعر وليس فاتورة ضريبية أو تذكرة صادرة أو تأكيد حجز. الأسعار والخدمات خاضعة للشروط والتوفر حتى إتمام التأكيد النهائي. لا يُفترض من هذا المستند وحده أن السداد تم.</p>
     <p dir="ltr" className="text-right text-[10px] leading-5">This is a quotation, not a tax invoice, issued ticket or confirmed booking. Payment is not confirmed by this quotation.</p>
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
