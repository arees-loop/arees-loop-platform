import RequestAttachmentsPanel from "@/app/components/RequestAttachmentsPanel";
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readCustomerClaims } from "@/lib/customer-request-claims";

type CustomerRequest={
  reference:string;kind:"FLIGHT"|"FERRY"|"HOTEL"|"VISA"|"DRIVING_LICENSE";title:string;route:string;
  travelDate:string;returnDate:string|null;tripType?:string;itinerary?:unknown;
  guests:number;rooms?:number;status:string;group:string;
  customerReply:string|null;quoteAmountSar:number|null;quoteNotes:string|null;
  carrierName:string|null;quoteValidUntil:string|null;cancellationReason:string|null;
  createdAt:string;updatedAt:string;
};
const stages=[
  {id:"NEW",label:"طلبات جديدة",icon:"✉",detail:"وصلت طلباتك لأريس وجاري استلامها"},
  {id:"PROCESSING",label:"تحت المتابعة",icon:"◷",detail:"طلبات يعمل عليها فريق أريس"},
  {id:"COMPLETED",label:"طلبات مكتملة",icon:"✓",detail:"الخدمات التي تم تنفيذها"},
  {id:"CANCELED",label:"طلبات ملغاة",icon:"×",detail:"الطلبات التي أُلغيت"},
  {id:"CLOSED",label:"الطلبات المغلقة",icon:"⊗",detail:"عروض أو خدمات غير متاحة"},
];
const statuses:Record<string,string>={
  NEW:"طلب جديد",PROCESSING:"تحت المعالجة",QUOTE_READY:"عرض السعر جاهز",
  QUOTE_SENT:"تم إرسال عرض السعر",PAID:"تم السداد",EXECUTING:"تحت التنفيذ",
  DONE:"تم التنفيذ",COMPLETED:"تم التنفيذ",CANCELED:"تم الإلغاء",CANCELLED:"تم الإلغاء",
  CONTACTED:"تم التواصل",QUOTED:"عرض السعر جاهز",CLOSED:"مغلق",
};
const labelDate=(value:string|null)=>value?new Intl.DateTimeFormat("ar-SA",{day:"numeric",month:"short",year:"numeric"}).format(new Date(value)):"";
const money=(amount:number)=>amount.toLocaleString("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2})+" ر.س";

function RequestCard({item,featured}:{item:CustomerRequest;featured:boolean}){
  const [expanded,setExpanded]=useState(featured);
  return <article id={`request-${item.reference}`} className={`scroll-mt-36 rounded-[22px] border bg-white p-5 shadow-sm ${featured?"border-[#B69034] ring-2 ring-[#D4AF37]/25":"border-[#D4AF37]/25"}`}>
    <div className="flex flex-wrap items-start justify-between gap-2">
      <span className="text-xs font-black text-[#B18A33]">{item.kind==="FLIGHT"?"✈ طيران":item.kind==="FERRY"?"⚓ بواخر":item.kind==="VISA"?"تأشيرات":item.kind==="DRIVING_LICENSE"?"🚘 رخصة دولية":"🏨 فنادق"}</span>
      <span className="rounded-full bg-[#EAEFE9] px-3 py-1 text-[11px] font-bold">{statuses[item.status]||item.status}</span>
    </div>
    <h3 className="mt-3 text-base font-black">{item.title}</h3>
    <p className="mt-2 text-xs leading-6">{item.route}</p>
    <p className="mt-2 text-xs text-[#0D3B34]/65">السفر/الدخول: {labelDate(item.travelDate)}</p>
    <p className="mt-1 text-xs text-[#0D3B34]/60">المرجع: <span dir="ltr">{item.reference}</span></p>
    {item.customerReply&&<div className="mt-4 rounded-xl border border-[#B69034]/25 bg-[#FFF9E8] p-3">
      <p className="text-xs font-black text-[#946F18]">رد أريس على طلبك</p>
      <p className="mt-1 whitespace-pre-wrap text-xs leading-7">{item.customerReply}</p>
    </div>}
    {item.quoteAmountSar!==null&&item.status!=="CLOSED"&&<p className="mt-4 text-lg font-black text-[#99731E]">عرض السعر: {money(item.quoteAmountSar)}</p>}
    {item.status==="QUOTE_SENT"&&item.quoteAmountSar!==null&&item.quoteAmountSar>0&&(!item.quoteValidUntil||new Date(item.quoteValidUntil).getTime()>=Date.now())&&<Link href={`/checkout/request/${encodeURIComponent(item.reference)}`} className="mt-4 block rounded-xl bg-[#0D3B34] px-4 py-3 text-center text-sm font-black text-white">عرض وسائل السداد ←</Link>}
    {item.status==="QUOTE_READY"&&<p className="mt-3 rounded-xl bg-[#FFF5D9] px-3 py-2 text-xs text-[#8B671E]">عرض السعر قيد الإرسال؛ يظهر اختيار وسيلة الدفع بعد اعتماد إرساله لك.</p>}
    {item.status==="QUOTE_SENT"&&item.quoteValidUntil&&new Date(item.quoteValidUntil).getTime()<Date.now()&&<p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">انتهت صلاحية العرض. يرجى التواصل مع الإدارة للحصول على عرض جديد.</p>}
    <button type="button" onClick={()=>setExpanded(x=>!x)} className="mt-4 w-full rounded-xl border border-[#D4AF37]/40 bg-[#F8F5EC] px-3 py-3 text-sm font-bold">
      {expanded?"إخفاء التفاصيل":"عرض تفاصيل الطلب"}
    </button>
    {expanded&&<div className="mt-4 space-y-2 border-t border-[#D4AF37]/25 pt-4 text-xs leading-7">
      <p>تاريخ إرسال الطلب: {labelDate(item.createdAt)}</p>
      <p>آخر تحديث: {labelDate(item.updatedAt)}</p>
      <p>عدد المسافرين/النزلاء: {item.guests}</p>
      {item.rooms&&<p>عدد الغرف: {item.rooms}</p>}
      {item.returnDate&&<p>العودة/الخروج: {labelDate(item.returnDate)}</p>}
      {item.carrierName&&<p>الناقل: {item.carrierName}</p>}
      {item.quoteNotes&&<div className="rounded-xl bg-[#F7F4ED] p-3"><b>تفاصيل العرض:</b><p className="mt-1 whitespace-pre-wrap">{item.quoteNotes}</p></div>}
      {item.quoteValidUntil&&<p>صلاحية العرض حتى: {labelDate(item.quoteValidUntil)}</p>}
      {item.cancellationReason&&<p className="rounded-xl bg-red-50 p-3 text-red-800">سبب الإلغاء: {item.cancellationReason}</p>}
      <p className="font-bold text-[#0D3B34]/75">هذا طلب خدمة، وليس حجزاً مؤكداً أو إثبات دفع.</p>
       <RequestAttachmentsPanel reference={item.reference} requestStatus={item.status}/>
    </div>}
  </article>;
}

export default function MyRequestsPage(){
  const [requests,setRequests]=useState<CustomerRequest[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [focus,setFocus]=useState("");
  const [filter,setFilter]=useState<"ALL"|"FLIGHT"|"FERRY"|"HOTEL"|"VISA"|"DRIVING_LICENSE">("ALL");
  const [statusFilter,setStatusFilter]=useState<"ALL"|"ACTIVE"|"EXPIRED"|"COMPLETED"|"CANCELED"|"CLOSED">("ALL");
  const [view,setView]=useState<"CARDS"|"LIST">("CARDS");
  const [expandedRef,setExpandedRef]=useState<string|null>(null);
  useEffect(()=>{
    const abort=new AbortController();
    const focusRef=new URLSearchParams(window.location.search).get("reference")||"";
    setFocus(focusRef);
    fetch("/api/customer/requests",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({claims:readCustomerClaims()}),
      signal:abort.signal,
      cache:"no-store",
    }).then(async r=>{
      const data=await r.json();
      if(!r.ok||!data.success)throw new Error(data.message||"تعذر تحميل الطلبات.");
      setRequests(data.data||[]);
      if(focusRef && !data.data?.some((x:CustomerRequest)=>x.reference===focusRef))
        setError("لم نتمكن من الوصول إلى هذا الطلب في حسابك أو على هذا الجهاز. ادخل بنفس الحساب المستخدم عند الطلب.");
    }).catch(e=>{if(!abort.signal.aborted)setError(e instanceof Error?e.message:"تعذر تحميل الطلبات.");})
      .finally(()=>{if(!abort.signal.aborted)setLoading(false);});
    return()=>abort.abort();
  },[]);
  const visible=useMemo(()=>{
    const now=Date.now();
    const category=(item:CustomerRequest)=>{
      if(item.group==="CANCELED")return "CANCELED";
      if(item.group==="COMPLETED")return "COMPLETED";
      if(item.group==="CLOSED")return "CLOSED";
      if(item.quoteValidUntil&&new Date(item.quoteValidUntil).getTime()<now)return "EXPIRED";
      return "ACTIVE";
    };
    return requests.filter(item=>(filter==="ALL"||item.kind===filter)&&(statusFilter==="ALL"||category(item)===statusFilter));
  },[requests,filter,statusFilter]);
  return <main dir="rtl" className="min-h-screen bg-[#F7F4ED] px-4 pb-24 pt-32 text-[#0D3B34] md:px-8">
    <div className="mx-auto max-w-[1500px]">
      <p className="text-xs font-black tracking-[.15em] text-[#A78231]">AREES LOOP · MY REQUESTS</p>
      <h1 className="mt-2 text-4xl font-black">طلباتي</h1>
      <Link href="/my-bank-transfers" className="mt-4 inline-block rounded-full bg-[#0D3B34] px-5 py-3 text-sm font-bold text-white">متابعة التحويلات البنكية وإرفاق الإيصال ←</Link>
      <p className="mt-3 max-w-3xl text-sm leading-8 text-[#0D3B34]/70">تابع طلبات الطيران والبواخر والفنادق والتأشيرات والرخصة الدولية، واطلع على حالة كل طلب وردود الإدارة وخيارات السداد عند اعتماد العرض.</p>
      <div className="mt-5 rounded-xl border border-[#D4AF37]/30 bg-white px-4 py-3 text-xs leading-7 text-[#0D3B34]/70">
        الطلبات التي أرسلتها وأنت مسجّل الدخول مرتبطة بحسابك. طلبات الزائر مرتبطة بهذا المتصفح برمز خاص؛ للحفاظ على إمكانية متابعتها من جهاز آخر يُفضّل تسجيل الدخول قبل إرسال الطلب.
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {([["ALL","كل الطلبات"],["FLIGHT","الطيران"],["FERRY","البواخر"],["HOTEL","الفنادق"],["VISA","التأشيرات"],["DRIVING_LICENSE","الرخصة الدولية"]] as const).map(([kind,label])=>
          <button key={kind} onClick={()=>setFilter(kind)} className={`rounded-full px-5 py-2.5 text-xs font-bold ${filter===kind?"bg-[#0D3B34] text-white":"border border-[#D4AF37]/40 bg-white"}`}>{label}</button>)}
        <Link href="/cart" className="rounded-full border border-[#D4AF37]/40 bg-white px-5 py-2.5 text-xs font-bold">سلة الحجوزات</Link>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D4AF37]/30 bg-white p-3">
        <div className="flex flex-wrap gap-2" aria-label="فلترة الطلبات حسب الحالة">
          {([["ALL","الكل"],["ACTIVE","النشطة"],["EXPIRED","المنتهية"],["COMPLETED","المنجزة"],["CANCELED","الملغية"],["CLOSED","المغلقة"]] as const).map(([status,name])=><button key={status} type="button" aria-pressed={statusFilter===status} onClick={()=>{setStatusFilter(status);setExpandedRef(null)}} className={`rounded-xl px-3 py-2 text-xs font-bold ${statusFilter===status?"bg-[#0D3B34] text-white":"border border-[#D4AF37]/35"}`}>{name}</button>)}
        </div>
        <div className="flex gap-2" aria-label="طريقة عرض الطلبات">
          <button type="button" aria-pressed={view==="CARDS"} onClick={()=>setView("CARDS")} className={`rounded-xl px-4 py-2 text-xs font-bold ${view==="CARDS"?"bg-[#0D3B34] text-white":"border border-[#D4AF37]/35"}`}>▦ بطاقات</button>
          <button type="button" aria-pressed={view==="LIST"} onClick={()=>setView("LIST")} className={`rounded-xl px-4 py-2 text-xs font-bold ${view==="LIST"?"bg-[#0D3B34] text-white":"border border-[#D4AF37]/35"}`}>☷ قائمة</button>
        </div>
      </div>
      {loading&&<p className="mt-10 rounded-2xl bg-white p-7 text-sm">جاري تحميل طلباتك...</p>}
      {error&&<p role="alert" className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7">{error}</p>}
      {!loading&&requests.length===0&&!error&&<div className="mt-8 rounded-2xl border bg-white p-8 text-sm leading-8">لا توجد طلبات في حسابك أو في هذا المتصفح حتى الآن. <Link className="font-black underline" href="/flights">إرسال طلب طيران</Link></div>}
      {!loading&&requests.length>0&&visible.length===0&&<p className="mt-6 rounded-xl bg-white p-6 text-sm">لا توجد طلبات مطابقة للفلترة الحالية.</p>}
      {!loading&&view==="LIST"&&visible.length>0&&<div className="mt-7 overflow-x-auto rounded-2xl border border-[#D4AF37]/30 bg-white">
        <table className="w-full min-w-[720px] text-right text-sm">
          <thead className="bg-[#F8F3E8] text-xs"><tr><th className="p-4">رقم الطلب</th><th className="p-4">نوع الخدمة</th><th className="p-4">المسار / الوجهة</th><th className="p-4">التاريخ</th><th className="p-4">الحالة</th><th className="p-4">الإجراء</th></tr></thead>
          <tbody>{visible.map(item=><tr key={item.reference} className="border-t border-[#D4AF37]/20"><td dir="ltr" className="p-4 text-xs font-bold">{item.reference}</td><td className="p-4">{item.title}</td><td className="p-4">{item.route}</td><td className="p-4">{labelDate(item.travelDate)}</td><td className="p-4">{statuses[item.status]||item.status}</td><td className="p-4"><button type="button" onClick={()=>setExpandedRef(x=>x===item.reference?null:item.reference)} aria-expanded={expandedRef===item.reference} className="rounded-lg border border-[#D4AF37]/40 px-3 py-2 text-xs font-bold">{expandedRef===item.reference?"إغلاق":"التفاصيل"}</button></td></tr>)}</tbody>
        </table>
        {expandedRef&&visible.some(item=>item.reference===expandedRef)&&<div className="border-t border-[#D4AF37]/30 p-4"><RequestCard key={expandedRef} item={visible.find(item=>item.reference===expandedRef)!} featured={true}/></div>}
      </div>}
      {!loading&&view==="CARDS"&&<div className="mt-7 grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stages.map(stage=>{
          const list=visible.filter(x=>x.group===stage.id);
          return <section key={stage.id} className="rounded-[24px] border border-[#D4AF37]/25 bg-[#F4F0E7] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div><h2 className="text-base font-black">{stage.icon} {stage.label}</h2><p className="mt-1 text-[11px] text-[#0D3B34]/60">{stage.detail}</p></div>
              <span className="rounded-full bg-white px-3 py-1.5 text-sm font-black">{list.length}</span>
            </div>
            <div className="space-y-3">
              {list.length?list.map(item=><RequestCard key={item.reference} item={item} featured={focus===item.reference}/>):<p className="rounded-xl bg-white/70 p-5 text-center text-xs text-[#0D3B34]/50">لا توجد طلبات</p>}
            </div>
          </section>;
        })}
      </div>}
    </div>
  </main>;
}
