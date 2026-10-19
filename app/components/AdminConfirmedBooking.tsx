"use client";
import Link from "next/link";
import {useCallback,useEffect,useState} from "react";

type BookingDetails={
 bookingReference:string;flightNumber:string;departureTime:string;arrivalTime:string;
 returnFlightNumber:string;returnDepartureTime:string;returnArrivalTime:string;
 departureTerminal:string;arrivalTerminal:string;
 adultBaggage:string;childBaggage:string;infantBaggage:string;
 hotelName:string;hotelCheckIn:string;hotelCheckOut:string;hotelAddress:string;roomType:string;
 travelNotes:string;hotelNotes:string;
};
const initial:BookingDetails={
 bookingReference:"",flightNumber:"",departureTime:"",arrivalTime:"",
 returnFlightNumber:"",returnDepartureTime:"",returnArrivalTime:"",
 departureTerminal:"",arrivalTerminal:"",
 adultBaggage:"",childBaggage:"",infantBaggage:"",
 hotelName:"",hotelCheckIn:"",hotelCheckOut:"",hotelAddress:"",roomType:"",
 travelNotes:"",hotelNotes:"",
};
const groups:Array<{title:string;caption:string;fields:Array<{key:keyof BookingDetails;label:string;hint?:string;required?:boolean;multi?:boolean}>}>=[
 {title:"بيانات الحجز المؤكد",caption:"تُكتب من نظام الحجز أو التذكرة الصادرة، وليست بيانات تقديرية.",fields:[
  {key:"bookingReference",label:"رقم الحجز لدى شركة الطيران (PNR)",required:true},
  {key:"flightNumber",label:"رقم رحلة الذهاب",required:true},
  {key:"departureTime",label:"موعد الإقلاع المؤكد — بالتوقيت المحلي",required:true,hint:"مثال: 16 نوفمبر، 08:30 مساءً"},
  {key:"arrivalTime",label:"موعد الوصول المؤكد — بالتوقيت المحلي",required:true},
  {key:"departureTerminal",label:"صالة أو بوابة المغادرة (إن وجدت)"},
  {key:"arrivalTerminal",label:"صالة الوصول (إن وجدت)"},
  {key:"returnFlightNumber",label:"رقم رحلة العودة (إن وجدت)"},
  {key:"returnDepartureTime",label:"موعد إقلاع العودة"},
  {key:"returnArrivalTime",label:"موعد وصول العودة"}
 ]},
 {title:"الأمتعة حسب فئة المسافر",caption:"عدد المسافرين يُقرأ من الطلب تلقائياً. أدخل الأوزان من شروط التذكرة الصادرة فقط.",fields:[
  {key:"adultBaggage",label:"أمتعة البالغ",hint:"مثال: 23 كجم شحن + 7 كجم يدوي"},
  {key:"childBaggage",label:"أمتعة الطفل"},
  {key:"infantBaggage",label:"أمتعة الرضيع"}
 ]},
 {title:"السكن وملاحظات السفر",caption:"اترك السكن فارغاً إن لم يتضمن الحجز سكناً. لا نعرض مرفق فندق غير موجود.",fields:[
  {key:"hotelName",label:"اسم الفندق / السكن"},
  {key:"hotelCheckIn",label:"الدخول للفندق"},
  {key:"hotelCheckOut",label:"المغادرة من الفندق"},
  {key:"hotelAddress",label:"عنوان السكن"},
  {key:"roomType",label:"نوع الغرفة"},
  {key:"travelNotes",label:"تعليمات السفر والتنبيهات",multi:true},
  {key:"hotelNotes",label:"ملاحظات السكن والضيافة",multi:true}
 ]}
];
type Request={reference:string;kind:string;status:string;adults:number;children:number;infants:number;origin:string;destination:string};
export default function AdminConfirmedBooking({id,status,onReadyChange}:{id:string;status:string;onReadyChange?:(ready:boolean)=>void}){
 const [details,setDetails]=useState<BookingDetails>(initial);
 const [request,setRequest]=useState<Request|null>(null);
 const [ready,setReady]=useState(false),[eligible,setEligible]=useState(false),[canConfirm,setCanConfirm]=useState(false),[isDraft,setIsDraft]=useState(false);
 const [confirmed,setConfirmed]=useState(false);
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false);
 const [error,setError]=useState(""),[message,setMessage]=useState("");
 const refresh=useCallback(async()=>{
  try{
   const r=await fetch("/api/admin/transport/confirmed-details?id="+encodeURIComponent(id),{cache:"no-store",credentials:"include"});
   const data=await r.json();
   if(!r.ok||!data.success)throw Error(data.message||"تعذر قراءة تفاصيل الحجز.");
   setRequest(data.request);setEligible(!!data.canPrepare);setCanConfirm(!!data.canConfirm);setIsDraft(!!data.draftSaved);
   if(data.details){
    const received=data.details as Record<string,unknown>;
    setDetails(Object.fromEntries(Object.keys(initial).map(key=>[key,typeof received[key]==="string"?received[key]:""])) as BookingDetails);
    setReady(!!data.confirmedDetails);onReadyChange?.(!!data.confirmedDetails);
   }else{setDetails(initial);setReady(false);onReadyChange?.(false);}
   setError("");
  }catch(e){setError(e instanceof Error?e.message:"تعذر قراءة تفاصيل الحجز.");}
  finally{setLoading(false);}
 },[id,onReadyChange]);
 useEffect(()=>{setLoading(true);void refresh()},[refresh,status]);
 async function save(){
  if(saving||!eligible||(canConfirm&&!confirmed))return;
  setSaving(true);setError("");setMessage("");
  try{
   const r=await fetch("/api/admin/transport/confirmed-details",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,details,draft:!canConfirm,confirmed:canConfirm&&confirmed})});
   const data=await r.json();
   if(!r.ok||!data.success)throw Error(data.message||"تعذر حفظ بيانات الحجز.");
   setMessage(data.message||"حُفظت التفاصيل.");setReady(!!data.confirmed);setIsDraft(!data.confirmed);onReadyChange?.(!!data.confirmed);setConfirmed(false);
  }catch(e){setError(e instanceof Error?e.message:"تعذر حفظ بيانات الحجز.");}
  finally{setSaving(false);}
 }
 const ferry=request?.kind==="FERRY";
 return <section dir="rtl" className="mt-4 rounded-2xl border border-[#D4AF37]/35 bg-white p-4 text-[#0D3B34]">
  <div className="flex flex-wrap items-start justify-between gap-3">
   <div><h3 className="text-sm font-black">📋 تفاصيل الحجز المؤكد · PDF مستقل</h3><p className="mt-2 text-xs leading-6 text-[#557167]">مستند مستقل عن التذكرة الأصلية. يُقرأ عدد المسافرين من الطلب، وتضيف الإدارة بيانات رحلة الباخرة أو الطيران وملاحظات السفر والسكن المؤكدة.</p></div>
   {ready&&<Link href={"/admin/transport/confirmed/"+encodeURIComponent(id)} target="_blank" className="rounded-xl border border-[#C6A45C] bg-[#FFF7E5] px-4 py-2.5 text-xs font-black">فتح تفاصيل الحجز · طباعة PDF ↗</Link>}
  </div>
  {request&&<div className="mt-3 rounded-xl bg-[#F3F8F4] p-3 text-xs leading-7"><b>المرجع:</b> {request.reference} · <b>الوجهة:</b> {request.origin} ← {request.destination}<p><b>المسافرون:</b> {request.adults} بالغ / {request.children} طفل / {request.infants} رضيع — الأرقام تُقرأ تلقائياً من الطلب ولا تُعدّل هنا.</p></div>}
  {loading?<p className="mt-4 text-xs">جارٍ تحميل تفاصيل الحجز...</p>:!eligible?<p className="mt-4 rounded-xl border border-[#E5CE8F] bg-[#FFFBEE] p-3 text-xs text-[#866427]">سيُفتح إعداد تفاصيل الرحلة فور موافقة العميل على عرض السعر الحالي. بيانات الحجز السابقة محفوظة ولا تظهر للعميل قبل الاعتماد.</p>:
   <div className="mt-4 space-y-5">
    {!canConfirm&&<p role="status" className="rounded-xl border border-[#D9BC69] bg-[#FFFAE9] p-3 text-xs leading-6 text-[#855B0D]">✓ وافق العميل على عرض السعر: يمكنك تجهيز تفاصيل الباخرة/الطيران الآن وحفظها كمسودة. <b>لن تُصدر للعميل</b> إلا بعد اعتماد وصول السداد والتحقق من إصدار الحجز فعلياً.</p>}
    {isDraft&&<p className="rounded-xl border border-[#D4AF37]/40 bg-[#FFF8E9] p-3 text-xs font-bold text-[#786124]">المسودة محفوظة داخل الإدارة — غير منشورة للعميل.</p>}
    {groups.map(group=><fieldset key={group.title} className="rounded-xl border border-[#DDD3B7] bg-[#FFFEFB] p-4">
    <legend className="px-2 text-sm font-black">{group.title}</legend>
    <p className="mb-3 text-xs leading-6 text-[#68776A]">{group.caption}</p>
    <div className="grid gap-3 sm:grid-cols-2">{group.fields.map(field=><label key={field.key} className={"block text-xs font-bold "+(field.multi?"sm:col-span-2":"")}>{ferry&&field.key==="bookingReference"?"مرجع حجز الباخرة لدى المشغل":ferry&&field.key==="flightNumber"?"اسم الباخرة أو رقم الرحلة البحرية":ferry&&field.key==="departureTime"?"موعد الإبحار المؤكد":ferry&&field.key==="arrivalTime"?"موعد الوصول المتوقع":field.label}{field.required&&(!ferry||!["flightNumber","arrivalTime"].includes(field.key))&&<span className="text-red-700"> *</span>}
      {field.multi?<textarea rows={3} maxLength={2000} value={details[field.key]} onChange={e=>setDetails(v=>({...v,[field.key]:e.target.value}))} className="mt-2 w-full resize-y rounded-xl border border-[#CFC5A7] bg-white p-3 text-sm"/>:
      <input required={field.required&&(!ferry||!["flightNumber","arrivalTime"].includes(field.key))} maxLength={field.key==="hotelAddress"?250:180} value={details[field.key]} onChange={e=>setDetails(v=>({...v,[field.key]:e.target.value}))} placeholder={field.hint||""} className="mt-2 w-full rounded-xl border border-[#CFC5A7] bg-white p-3 text-sm"/>}
    </label>)}</div>
   </fieldset>)}
    {canConfirm&&<label className="flex items-start gap-2 rounded-xl border border-[#E2D3B3] bg-[#FFF9ED] p-3 text-xs leading-6"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} className="mt-1"/> أؤكد أن الحجز صدر فعلياً لدى الناقل وأن رقم الحجز والمواعيد والأمتعة والسكن — إن وُجد — صحيحة ومطابقة للمستندات المصدرة.</label>}
    <button type="button" onClick={()=>void save()} disabled={saving||!eligible||(canConfirm&&(!confirmed||!details.bookingReference.trim()||!details.departureTime.trim()||(!ferry&&(!details.flightNumber.trim()||!details.arrivalTime.trim()))))} className="rounded-xl bg-[#0D3B34] px-5 py-3 text-xs font-black text-white disabled:opacity-40">{saving?"جارٍ الحفظ...":canConfirm?"اعتماد تفاصيل الحجز المؤكد وإتاحتها للعميل":"حفظ مسودة تفاصيل الرحلة (غير منشورة)"}</button>
   </div>}
  {error&&<p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-800">{error}</p>}
  {message&&<p role="status" className="mt-3 rounded-xl bg-[#EAF8ED] p-3 text-xs font-bold text-[#17643F]">{message}</p>}
 </section>;
}
