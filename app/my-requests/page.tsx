import CustomerDashboardShell from "@/app/components/CustomerDashboardShell";
"use client";

import Link from "next/link";
import RequestAttachments from "@/app/components/RequestAttachments";
import RequestPayment from "@/app/components/RequestPayment";
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
  {id:"PROCESSING",label:"تحت الإجراء",icon:"◷",detail:"طلبات يعمل عليها فريق أريس"},
  {id:"COMPLETED",label:"طلبات مكتملة",icon:"✓",detail:"الخدمات التي تم تنفيذها"},
  {id:"CANCELED",label:"طلبات ملغاة",icon:"×",detail:"الطلبات التي أُلغيت"},
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
      <span className="text-xs font-black text-[#B18A33]">{item.kind==="FLIGHT"?"✈ طيران":item.kind==="FERRY"?"⚓ بواخر":item.kind==="VISA"?"🛂 تأشيرات":item.kind==="DRIVING_LICENSE"?"🚘 رخص دولية":"🏨 فنادق"}</span>
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
    {item.quoteAmountSar!==null&&<p className="mt-4 text-lg font-black text-[#99731E]">عرض السعر: {money(item.quoteAmountSar)}</p>}
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
      <RequestAttachments reference={item.reference}/>
      {item.quoteAmountSar!==null&&item.status==="PROCESSING"&&<RequestPayment reference={item.reference}/>}
      <p className="font-bold text-[#0D3B34]/75">هذا طلب خدمة، وليس حجزاً مؤكداً أو إثبات دفع.</p>
    </div>}
  </article>;
}

export default function MyRequestsPage(){
  const [requests,setRequests]=useState<CustomerRequest[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [focus,setFocus]=useState("");
  const [filter,setFilter]=useState<"ALL"|"FLIGHT"|"FERRY"|"HOTEL"|"VISA"|"DRIVING_LICENSE"|"PARTNER">("ALL");
  const [stageFilter,setStageFilter]=useState("ALL");
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
  const [period,setPeriod]=useState("3");
  const [query,setQuery]=useState("");
  const [showHistory,setShowHistory]=useState(false);
  const [partnerBookings,setPartnerBookings]=useState<{id:string;reference:string;status:string;bookingDate:string;service:{nameAr:string;city:string|null}}[]>([]);
  useEffect(()=>{fetch("/api/customer/bookings",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>{if(Array.isArray(d?.bookings))setPartnerBookings(d.bookings)}).catch(()=>{});},[]);
  const allItems=useMemo(()=>[
    ...requests,
    ...partnerBookings.map(b=>({reference:b.reference||b.id,kind:"PARTNER" as const,title:b.service?.nameAr||"طلب خدمة شريك",route:b.service?.city||"خدمة من شركاء أريس",travelDate:b.bookingDate,returnDate:null,guests:0,status:b.status,group:["COMPLETED","CONFIRMED"].includes(b.status)?"COMPLETED":b.status==="CANCELLED"?"CANCELED":"PROCESSING",customerReply:null,quoteAmountSar:null,quoteNotes:null,carrierName:null,quoteValidUntil:null,cancellationReason:null,createdAt:b.bookingDate,updatedAt:b.bookingDate}))
  ].sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()),[requests,partnerBookings]);
  const visible=useMemo(()=>allItems.filter(x=>{
    const age=period==="ALL"||new Date(x.createdAt).getTime()>=Date.now()-Number(period)*31*86400000;
    const matchKind=filter==="ALL"||x.kind===filter;
    const matchStage=stageFilter==="ALL"||(stageFilter==="CLOSED"?["CANCELED","CANCELLED","CLOSED"].includes(x.status):stageFilter==="NEW"?["NEW","PENDING"].includes(x.status):stageFilter==="PROCESSING"?["PROCESSING","QUOTE_READY","QUOTE_SENT","CONTACTED","QUOTED","PAID","EXECUTING","IN_PROGRESS"].includes(x.status):stageFilter==="COMPLETED"?["DONE","COMPLETED","CONFIRMED"].includes(x.status):false);
    return age&&matchKind&&matchStage&&[x.reference,x.title,x.route].join(" ").toLowerCase().includes(query.toLowerCase());
  }),[allItems,period,filter,stageFilter,query]);
  const active=visible.filter(x=>!["DONE","COMPLETED","CANCELED","CANCELLED","CLOSED","CONFIRMED"].includes(x.status));
  const history=visible.filter(x=>!active.includes(x));
  return <CustomerDashboardShell><main dir="rtl" className="min-w-0">
   <div className="mx-auto max-w-[1000px]">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black tracking-wider text-[#A78231]">AREES LOOP · MY REQUESTS</p><h1 className="mt-2 text-3xl font-black">طلباتي</h1></div><Link href="/bookings" className="rounded-full border border-[#D4AF37]/50 bg-white px-4 py-2 text-xs font-bold">حجوزاتي المؤكدة</Link></div>
    <p className="mt-3 text-sm text-[#0D3B34]/65">كل طلبات الخدمات والحجوزات في قائمة واحدة، من الأحدث للأقدم.</p>
    <div className="mt-6 grid gap-3 rounded-2xl border border-[#D4AF37]/25 bg-white p-4 sm:grid-cols-3">
      <label className="text-xs font-bold">الفترة<select aria-label="الفترة الزمنية" value={period} onChange={e=>setPeriod(e.target.value)} className="mt-2 w-full rounded-lg border p-3"><option value="3">آخر 3 أشهر</option><option value="6">آخر 6 أشهر</option><option value="12">آخر سنة</option><option value="ALL">كل الفترات</option></select></label>
      <label className="text-xs font-bold">الحالة<select aria-label="حالة الطلب" value={stageFilter} onChange={e=>setStageFilter(e.target.value)} className="mt-2 w-full rounded-lg border p-3"><option value="ALL">كل الحالات</option><option value="NEW">جديد</option><option value="PROCESSING">تحت الإجراء</option><option value="COMPLETED">مكتمل</option><option value="CLOSED">مغلق / ملغي</option></select></label>
      <label className="text-xs font-bold">نوع الخدمة<select aria-label="نوع الخدمة" value={filter} onChange={e=>setFilter(e.target.value as typeof filter)} className="mt-2 w-full rounded-lg border p-3"><option value="ALL">كل الخدمات</option><option value="FLIGHT">الطيران</option><option value="FERRY">البواخر</option><option value="VISA">التأشيرات</option><option value="DRIVING_LICENSE">الرخص الدولية</option><option value="HOTEL">الفنادق</option><option value="PARTNER">خدمات الشركاء والسلة</option></select></label>
      <input aria-label="البحث عن طلب" value={query} onChange={e=>setQuery(e.target.value)} placeholder="ابحث برقم الطلب أو اسم الخدمة أو الوجهة..." className="rounded-lg border p-3 text-sm sm:col-span-3"/>
    </div>
    {loading&&<p className="mt-6 rounded-xl bg-white p-5">جاري تحميل الطلبات...</p>}
    {error&&<p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">{error}</p>}
    {!loading&&<><div className="mt-6 flex items-center justify-between"><h2 className="text-lg font-black">الطلبات الحالية ({active.length})</h2><Link href="/cart" className="text-xs font-bold underline">سلة الحجوزات</Link></div>
    <div className="mt-3 space-y-3">{active.length?active.map(item=>item.kind==="PARTNER"?<PartnerRequestRow key={item.reference} item={item}/>:<RequestCard key={item.reference} item={item} featured={focus===item.reference}/>):<p className="rounded-xl bg-white p-5 text-sm text-[#0D3B34]/60">لا توجد طلبات حالية مطابقة للفلاتر.</p>}</div>
    <button type="button" onClick={()=>setShowHistory(x=>!x)} className="mt-7 flex w-full items-center justify-between rounded-xl border border-[#D4AF37]/35 bg-white px-5 py-4 font-bold"><span>سجل الطلبات السابقة ({history.length})</span><span>{showHistory?"إخفاء السجل ▲":"عرض السجل ▼"}</span></button>
    {showHistory&&<div className="mt-3 space-y-3">{history.length?history.map(item=>item.kind==="PARTNER"?<PartnerRequestRow key={item.reference} item={item}/>:<RequestCard key={item.reference} item={item} featured={focus===item.reference}/>):<p className="rounded-xl bg-white p-5 text-sm">لا توجد طلبات سابقة مطابقة.</p>}</div>}
    </>}
   </div>
  </main></CustomerDashboardShell>;
}
function PartnerRequestRow({item}:{item:{reference:string;title:string;route:string;status:string;createdAt:string}}){
 return <article className="rounded-xl border border-[#D4AF37]/25 bg-white p-4"><div className="flex items-center justify-between gap-3"><b>🤝 {item.title}</b><span className="rounded-full bg-[#F4F0E7] px-3 py-1 text-xs">{statuses[item.status]||item.status}</span></div><p className="mt-2 text-xs">{item.route} · {labelDate(item.createdAt)}</p><p className="mt-2 text-xs text-[#0D3B34]/60">رقم الطلب: {item.reference}</p><Link href="/bookings" className="mt-3 inline-block text-xs font-bold underline">عرض تفاصيل الحجز</Link></article>;
}
