import Image from "next/image";
import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
import {canManageTransport,type TransportKind} from "@/lib/transport-permissions";
import {bilingualDate,vatBreakdown,isQuoteVatTreatment,sar,type QuoteVatTreatment} from "@/lib/quotation-format";
import AdminQuoteVatEditor from "@/app/components/AdminQuoteVatEditor";
import QuotePrintButton from "./print-button";

type Props={params:Promise<{id:string}>};
const policy:Record<string,[string,string]>={
 FLIGHT:["الإلغاء والتعديل والاسترداد وفق شروط شركة الطيران وفئة التذكرة عند إصدارها.","Changes, cancellation and refunds follow the airline and issued fare rules."],
 FERRY:["الإلغاء والتعديل والاسترداد وفق سياسة مشغل الباخرة وموعد الإبحار وشروط التذكرة.","Changes, cancellation and refunds follow the ferry operator and sailing conditions."],
 VISA:["إصدار التأشيرة والموافقة عليها يخضعان لشروط الجهة المختصة.","Visa issuance and approval are subject to the issuing authority's rules."],
 DRIVING_LICENSE:["الإصدار وفق متطلبات الجهة المختصة والمستندات المعتمدة.","Issuance is subject to the competent authority and required documents."]
};
const categories:Record<string,[string,string]>={
 FLIGHT:["تذكرة طيران","Air Ticket"],
 FERRY:["تذكرة باخرة دولية","International Ferry Ticket"],
 VISA:["خدمة تأشيرة","Visa Service"],
 DRIVING_LICENSE:["رخصة قيادة دولية","International Driving Permit"],
};
function TwoLine({ar,en,large=false}:{ar:string;en:string;large?:boolean}){
 return <span className="block text-right" dir="rtl">
   <span className={"block font-black leading-6 "+(large?"text-lg":"text-xs")}>{ar}</span>
   <span dir="ltr" className="mt-0.5 block text-right text-[10px] font-medium leading-5 text-inherit opacity-80">{en}</span>
 </span>;
}
function Info({ar,en,value}:{ar:string;en:string;value:string|number|undefined|null}){
 if(value===null||value===undefined||value==="")return null;
 return <div className="min-w-0 rounded-xl border border-[#E8DDC4] bg-[#FFFEFB] p-3">
  <TwoLine ar={ar} en={en}/>
  <p className="mt-2 break-words text-sm font-bold leading-6 text-[#0D3B34]">{value}</p>
 </div>;
}
function DualDate({value}:{value:Date|string|null|undefined}){
 const d=bilingualDate(value);
 return <div className="text-xs leading-6"><p>ميلادي: <b>{d.gregorian}</b></p><p>هجري: <b>{d.hijri}</b></p></div>;
}
export default async function QuotePage({params}:Props){
 const session=await getCurrentSession();
 if(!session||!["ADMIN","SUPER_ADMIN"].includes(session.user.role))redirect("/admin/login");
 const {id}=await params;
 const item=await prisma.transportRequest.findFirst({
  where:{id,...(session.user.role==="SUPER_ADMIN"?{}:{assignedToId:session.user.id})},
 });
 if(!item)notFound();
 if(!canManageTransport(session.user,item.kind as TransportKind))notFound();
 const quoteAmount=item.quoteAmountSar===null?null:Number(item.quoteAmountSar);
 const quoteExists=quoteAmount!==null;
 const lastVat=await prisma.transportRequestEvent.findFirst({
  where:{requestId:item.id,action:"QUOTE_VAT_CLASSIFIED"},
  orderBy:[{createdAt:"desc"},{id:"desc"}],select:{createdAt:true,details:true},
 });
 const md=lastVat?.details&&typeof lastVat.details==="object"&&!Array.isArray(lastVat.details)?lastVat.details as Record<string,unknown>:null;
 const quoteVersion=item.quoteUpdatedAt?.toISOString()||null;
 const classified=md?.quoteUpdatedAt===quoteVersion&&isQuoteVatTreatment(md?.treatment);
 const treatment:QuoteVatTreatment=classified?md.treatment as QuoteVatTreatment:"UNDETERMINED";
 const breakup=quoteAmount!==null?vatBreakdown(quoteAmount,treatment):null;
 const category=categories[item.kind]||categories.FLIGHT;
 const terms=policy[item.kind]||policy.FLIGHT;
 const pax=item.adults+item.children+item.infants;
 return <main dir="rtl" className="mx-auto max-w-[920px] bg-[#F8F6EF] px-4 pb-20 pt-8 text-[#0D3B34] print:m-0 print:max-w-none print:bg-white print:p-0">
  <div className="mb-4 flex flex-wrap justify-between gap-3 print:hidden">
    <Link href={item.kind==="FERRY"?"/admin/transport/ferries?view=requests":item.kind==="FLIGHT"?"/admin/transport/flights?view=requests":"/admin/transport"} className="rounded-xl border border-[#D4AF37]/45 bg-white px-4 py-3 text-xs font-bold">← العودة للطلبات</Link>
    <QuotePrintButton disabled={!quoteExists}/>
  </div>
  {quoteExists&&<AdminQuoteVatEditor id={item.id} initial={treatment}/>}
  <article id="arees-print-sheet" className="overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-white shadow-lg print:border-0 print:rounded-none print:shadow-none">
   <header className="border-b-4 border-[#B69235] p-7 print:p-4">
    <div className="flex flex-wrap items-center justify-between gap-6">
     <div className="min-w-0 flex-1 space-y-1">
       <TwoLine ar="شركة أريس الحلول المتكاملة المحدودة" en="AREES AL-HELLOUL AL-MUTAKAMLA CO.LTD" large/>
       <TwoLine ar="الرقم الضريبي: 311897578200003" en="Tax No.: 311897578200003"/>
       <TwoLine ar="ترخيص وزارة السياحة رقم 73104550" en="Ministry of Tourism License No.: 73104550"/>
       <TwoLine ar="فئة الترخيص: وكالة سفر وسياحة" en="License Category: Travel and Tourism Agency"/>
       <TwoLine ar="السجل التجاري: 7037003618" en="Commercial Registration No.: 7037003618"/>
       <TwoLine ar="المملكة العربية السعودية — المدينة المنورة، حي قربان" en="Saudi Arabia — Medina, Qurban District"/>
       <TwoLine ar="الهاتف: ‎+9660148390473" en="Phone: +9660148390473"/>
     </div>
     <div className="flex h-[112px] w-[112px] shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/30 bg-white p-2">
       <Image src="/Logo/arees-integrated-solutions-logo.png" width={100} height={100} unoptimized alt="شعار شركة أريس" className="h-full w-full object-contain"/>
     </div>
    </div>
    <div className="mt-5 rounded-xl bg-[#0D3B34] p-4 text-white">
      <TwoLine ar="عرض سعر / تقدير" en="Quotation / Estimate" large/>
      <p className="mt-2 text-right text-xs">هذا المستند عرض سعر وليس فاتورة ضريبية.</p>
      <p dir="ltr" className="text-right text-[10px]">This quotation is not a tax invoice.</p>
    </div>
   </header>
   <div className="space-y-5 p-7 print:space-y-3 print:p-4">
    <section className="grid gap-3 sm:grid-cols-3 print:grid-cols-3">
      <Info ar="رقم المرجع" en="Quotation Reference" value={item.reference}/>
      <div className="rounded-xl border border-[#E8DDC4] bg-[#FFFEFB] p-3"><TwoLine ar="تاريخ إصدار العرض" en="Quotation Date"/><DualDate value={item.quoteUpdatedAt||item.createdAt}/></div>
      <div className="rounded-xl border border-[#E8DDC4] bg-[#FFFEFB] p-3"><TwoLine ar="صلاحية العرض" en="Valid Until"/><DualDate value={item.quoteValidUntil}/></div>
    </section>
    <section><h2 className="mb-3 border-b border-[#D4AF37]/40 pb-2"><TwoLine ar="بيانات العميل والرحلة" en="Customer & Trip Details" large/></h2>
      <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#F8F6F0] p-3 sm:grid-cols-3 print:grid-cols-3">
       <Info ar="اسم العميل" en="Customer Name" value={item.customerName}/>
       <Info ar="رقم الهاتف" en="Phone Number" value={"+"+item.countryCode+item.phone}/>
       <Info ar="الناقل / المشغل" en="Carrier / Operator" value={item.carrierName}/>
       <Info ar="من" en="Origin" value={item.origin}/>
       <Info ar="إلى" en="Destination" value={item.destination}/>
       <div className="rounded-xl border border-[#E8DDC4] bg-[#FFFEFB] p-3"><TwoLine ar="تاريخ السفر" en="Travel Date"/><DualDate value={item.travelDate}/></div>
       <Info ar="البالغون" en="Adults" value={item.adults}/>
       <Info ar="الأطفال" en="Children" value={item.children}/>
       <Info ar="الرضّع" en="Infants" value={item.infants}/>
       {item.returnDate&&<div className="rounded-xl border border-[#E8DDC4] bg-[#FFFEFB] p-3"><TwoLine ar="تاريخ العودة" en="Return Date"/><DualDate value={item.returnDate}/></div>}
      </div>
    </section>
    <section><h2 className="mb-3 border-b border-[#D4AF37]/40 pb-2"><TwoLine ar="تفاصيل عرض السعر" en="Quotation Item Details" large/></h2>
     <table className="w-full border-collapse text-right text-xs">
      <thead><tr className="bg-[#EEE5D0]">
       <th className="border border-[#D6C7A7] p-3"><TwoLine ar="البند" en="Item"/></th>
       <th className="border border-[#D6C7A7] p-3"><TwoLine ar="الوصف" en="Description"/></th>
       <th className="border border-[#D6C7A7] p-3"><TwoLine ar="الكمية" en="Qty"/></th>
       <th className="border border-[#D6C7A7] p-3"><TwoLine ar="المبلغ الإجمالي" en="Total Amount"/></th>
      </tr></thead>
      <tbody><tr>
       <td className="border border-[#E6DDC9] p-3"><TwoLine ar={category[0]} en={category[1]}/></td>
       <td className="border border-[#E6DDC9] p-3">من {item.origin} إلى {item.destination}<p dir="ltr" className="text-right text-[10px] text-[#64736B]">From {item.origin} to {item.destination}</p></td>
       <td className="border border-[#E6DDC9] p-3">{pax}</td>
       <td className="border border-[#E6DDC9] p-3 font-bold" dir="ltr">{quoteAmount===null?"—":sar(quoteAmount)}</td>
      </tr></tbody>
     </table>
    </section>
    <section className="overflow-hidden rounded-xl border border-[#D4AF37]/40">
     <h2 className="bg-[#F7F0DF] px-4 py-3"><TwoLine ar="ملخص السعر وضريبة القيمة المضافة" en="Price Summary & Value Added Tax (VAT)"/></h2>
     <div className="space-y-2 p-4 text-xs">
      <div className="flex justify-between gap-3"><TwoLine ar="نسبة ضريبة القيمة المضافة" en="VAT Rate"/><span className="font-bold">{treatment==="STANDARD_15_INCLUDED"?"15%":treatment==="ZERO_RATED_INTERNATIONAL"?"0%":"بانتظار التصنيف / Pending"}</span></div>
      <div className="flex justify-between gap-3"><TwoLine ar="السعر قبل الضريبة" en="Amount Excluding VAT"/><span className="font-bold">{breakup?.net===null||breakup===null?"—":sar(breakup.net)}</span></div>
      <div className="flex justify-between gap-3"><TwoLine ar="قيمة ضريبة القيمة المضافة" en="VAT Amount"/><span className="font-bold">{breakup?.vat===null||breakup===null?"—":sar(breakup.vat)}</span></div>
      <div className="flex justify-between gap-3 border-t border-[#D4AF37]/40 pt-3"><TwoLine ar="إجمالي السعر المستحق بالريال السعودي" en="Total Payable (SAR)"/><span className="text-lg font-black">{quoteAmount===null?"—":sar(quoteAmount)}</span></div>
     </div>
     <div className="bg-[#FFFBF1] px-4 py-3 text-xs leading-6">
      {treatment==="UNDETERMINED"?"لم تعتمد الإدارة المعالجة الضريبية لهذا العرض؛ نسبة 15% قياسية عند انطباقها، والنقل الدولي المؤهل قد يكون بنسبة صفر. لا تُفترض قيمة ضريبة دون توثيق.":treatment==="ZERO_RATED_INTERNATIONAL"?"صُنّف النقل الدولي لهذا العرض بنسبة صفر بعد مراجعة الإدارة؛ لا تُضاف ضريبة إلى السعر الإجمالي.":"صُنّف هذا العرض شاملاً ضريبة القيمة المضافة 15%، ويجري استخراج قيمتها من السعر الإجمالي دون زيادة عليه."}
      <p dir="ltr" className="mt-1 text-right text-[10px]">{treatment==="UNDETERMINED"?"VAT classification pending review; the standard 15% rate is not automatically applicable to eligible international transport.":treatment==="ZERO_RATED_INTERNATIONAL"?"International transport classified as zero-rated after administrative review.":"Standard 15% VAT is included in the displayed gross amount."}</p>
     </div>
    </section>
    {item.quoteNotes&&<section><TwoLine ar="تفاصيل وملاحظات العرض" en="Quotation Details & Notes"/><p className="mt-2 whitespace-pre-wrap rounded-xl bg-[#F6F5EF] p-4 text-xs leading-7">{item.quoteNotes}</p></section>}
    <section className="border-t border-[#D4AF37]/40 pt-4"><TwoLine ar="الشروط والأحكام" en="Terms & Conditions"/><p className="mt-2 text-xs leading-6">{terms[0]}</p><p dir="ltr" className="text-right text-[10px] leading-5">{terms[1]}</p>
     <p className="mt-3 text-xs font-bold">العرض ليس إثبات حجز أو سداد أو تذكرة صادرة.</p><p dir="ltr" className="text-right text-[10px]">This estimate does not confirm a booking, issued ticket, or payment.</p>
    </section>
    <footer className="border-t border-[#D4AF37]/30 pt-3 text-[10px] text-[#627167]"><TwoLine ar="شركة أريس الحلول المتكاملة المحدودة — المدينة المنورة" en="AREES AL-HELLOUL AL-MUTAKAMLA CO.LTD — Medina, Saudi Arabia"/></footer>
   </div>
  </article>
 </main>;
}
