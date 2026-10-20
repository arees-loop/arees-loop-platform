"use client";

import Link from "next/link";
import {useCallback,useEffect,useRef,useState} from "react";

export type CounterKey="flights"|"ferries"|"hotels"|"visas"|"drivingLicenses";
export type RequestCounters=Record<CounterKey,number|null>;
export type AlertPayload={
 success:boolean;counts:RequestCounters;needsAttention:RequestCounters;inProgress:RequestCounters;
 emailFailed:RequestCounters;totals:{new:number;attention:number;inProgress:number;emailFailed:number};
 recent:Array<{id:string;reference:string;kind:string;type:string;createdAt:string;href:string}>;
 snapshotEventId:string|null;emailConfigured:boolean;limited:boolean;updatedAt:string;
};
const actionLabels:Record<string,string>={
 NEW_REQUEST:"طلب جديد",LICENSE_FORM_ADDED_TO_CART:"نموذج رخصة جديد في السلة",CUSTOMER_OFFER_ACCEPTED:"قبول عرض السعر",
 CUSTOMER_TRANSFER_SUBMITTED:"إشعار سداد من العميل",CUSTOMER_ATTACHMENT_UPLOADED:"مرفق جديد من العميل",
 CUSTOMER_MESSAGE_SENT:"رد جديد من العميل",
};
const serviceLabels:Record<string,string>={
 FLIGHT:"الطيران",FERRY:"البواخر",VISA:"التأشيرات",HOTEL:"الفنادق",DRIVING_LICENSE:"الرخص الدولية",
};
const empty:RequestCounters={flights:0,ferries:0,hotels:0,visas:0,drivingLicenses:0};
const soundUrl="/audio/05_AreesLoop_Booking_Confirmed.mp3"; // Branded in-app sound; browser permission required.

export default function AdminNotificationCenter({
 identityKey,onUpdate
}:{
 identityKey:string;onUpdate:(result:AlertPayload)=>void
}){
 const [data,setData]=useState<AlertPayload|null>(null);
 const [panelOpen,setPanelOpen]=useState(false),[enabled,setEnabled]=useState(false);
 const [notice,setNotice]=useState(""),[busy,setBusy]=useState(false);
 const [permission,setPermission]=useState<string>("unknown");
 const audio=useRef<HTMLAudioElement|null>(null);
 const enabledRef=useRef(false);
 const baseline=useRef<string|null>(null);
 const initialized=useRef(false);
 const polling=useRef(false);
 const storageKey="arees-admin-alert-last:"+identityKey;
 const soundPreferenceKey="arees-admin-sound-enabled:"+identityKey;
 const playSound=useCallback(async()=>{
   try {
     const player=audio.current;
     if(!player)return;
     player.currentTime=0;
     await player.play();
   }catch{
     setNotice("المتصفح منع الصوت التلقائي. اضغط «تشغيل التنبيهات» مجدداً للسماح بالصوت.");
   }
 },[]);
 const notifyDevice=useCallback(async(message:string)=>{
   try{
     if(typeof window==="undefined"||!('Notification' in window)||Notification.permission!=="granted")return;
     if("serviceWorker" in navigator){
       const reg=await navigator.serviceWorker.getRegistration("/admin-alerts-sw.js");
       if(reg){await reg.showNotification("Arees Loop · إشعار إداري",{
         body:message,icon:"/icons/arees-loop-app-icon.png",
         tag:"arees-admin-request",data:{url:"/admin/dashboard"},
       });return;}
     }
     new Notification("Arees Loop · إشعار إداري",{body:message,tag:"arees-admin-request"});
   }catch{
     // Notification APIs vary between installed iOS/Android PWAs and desktops.
   }
 },[]);
 const refresh=useCallback(async()=>{
  if(polling.current)return;polling.current=true;
  try{
    const r=await fetch("/api/admin/request-alerts",{credentials:"include",cache:"no-store"});
    if(!r.ok)return;
    const result:AlertPayload=await r.json();
    if(!result.success)return;
    setData(result);onUpdate(result);
    const signal=result.snapshotEventId;
    // Always suppress an initial chime: no unverified 'new' event on first login.
    if(!initialized.current){
      initialized.current=true;baseline.current=signal;
      try{const previous=window.localStorage.getItem(storageKey);if(previous)baseline.current=previous;}catch{}
    }
    if(signal&&baseline.current&&signal!==baseline.current){
      const newest=result.recent[0];
      if(enabledRef.current){
        await playSound();
        void notifyDevice((actionLabels[newest?.type||""]||"تحديث في الطلبات")+" — "+(serviceLabels[newest?.kind||""]||"أريس لوب"));
      }
    }
    baseline.current=signal;
    try{if(signal)window.localStorage.setItem(storageKey,signal);}catch{}
  }catch{
   setNotice("تعذر تحديث إشعارات الطلبات؛ أعد المحاولة عند عودة الاتصال.");
  }finally{polling.current=false;}
 },[onUpdate,storageKey,playSound,notifyDevice]);

 useEffect(()=>{
   if(!identityKey)return;
   initialized.current=false;baseline.current=null;
   try{const preference=window.localStorage.getItem(soundPreferenceKey)==="true";enabledRef.current=preference;void Promise.resolve().then(()=>setEnabled(preference));}catch{}
   void refresh();
   const timer=window.setInterval(()=>{void refresh()},45_000);
   const focus=()=>{void refresh()};
   const visible=()=>{if(document.visibilityState==="visible")void refresh()};
   window.addEventListener("focus",focus);
   document.addEventListener("visibilitychange",visible);
   return()=>{window.clearInterval(timer);window.removeEventListener("focus",focus);document.removeEventListener("visibilitychange",visible)};
 },[identityKey,refresh,soundPreferenceKey]);

 async function activate(){
   if(busy)return;setBusy(true);setNotice("");
   try{
     if(typeof window==="undefined")return;
     if(!window.isSecureContext){setNotice("إشعارات الجهاز تتطلب اتصال HTTPS.");return;}
     // Unlock audio synchronously on the actual button gesture, before any await.
     enabledRef.current=true;setEnabled(true);
     try{window.localStorage.setItem(soundPreferenceKey,"true");}catch{}
     void playSound();
     if("serviceWorker" in navigator)await navigator.serviceWorker.register("/admin-alerts-sw.js",{scope:"/"});
     if("Notification" in window){
       let p=Notification.permission;
       if(p==="default")p=await Notification.requestPermission();
       setPermission(p);
       if(p==="denied")setNotice("إشعارات الجهاز محظورة من إعدادات المتصفح. الصوت داخل اللوحة سيظل متاحاً.");
       else if(p==="granted")setNotice("تم السماح بإشعارات الجهاز طالما التطبيق مفتوح. التنبيه عند إغلاقه يحتاج تفعيل Web Push في الخادم.");
       else setNotice("تم تشغيل صوت الإدارة. لم تسمح بعد بإشعارات الجهاز.");
     }else setNotice("جهازك لا يدعم إشعارات المتصفح من هذه الصفحة؛ صوت اللوحة سيظل متاحاً.");
     // The preview chime was initiated directly by the user action.
   }catch{setNotice("تعذر تفعيل إشعارات الجهاز. يمكنك متابعة التنبيهات داخل لوحة الإدارة.");}
   finally{setBusy(false);}
 }
 const total=data?data.totals.new+data.totals.attention:0;
 return <div className="relative z-30" dir="rtl">
   <audio ref={audio} preload="auto" src={soundUrl}/>
   <button type="button" onClick={()=>setPanelOpen(x=>!x)}
    aria-expanded={panelOpen} aria-label={total>0?"إشعارات الإدارة: "+total+" طلب أو تفاعل":"فتح إشعارات الإدارة"}
    className="relative flex h-10 w-10 items-center justify-center rounded-[13px] bg-white/45 text-xl hover:bg-[#F7EACA]">
     🔔
     {total>0&&<span className="absolute -top-1 -left-1 min-w-5 rounded-full bg-[#B73532] px-1 text-center text-[10px] font-black text-white">{total>99?"99+":total}</span>}
   </button>
   {panelOpen&&<div className="absolute left-0 top-12 z-[110] w-[min(340px,calc(100vw-24px))] space-y-3 rounded-2xl border border-[#D4AF37]/40 bg-white p-4 shadow-xl">
     <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-black text-[#0D3B34]">إشعارات الإدارة</h3><button type="button" onClick={()=>setPanelOpen(false)} className="rounded-lg px-2 text-xs">✕</button></div>
     <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
      <div className="rounded-lg bg-[#FFF5DC] p-2"><b className="block text-lg">{data?.totals.new??"–"}</b>جديد</div>
      <div className="rounded-lg bg-[#F0F8F1] p-2"><b className="block text-lg">{data?.totals.attention??"–"}</b>رد / سداد</div>
      <div className="rounded-lg bg-[#F3F7FA] p-2"><b className="block text-lg">{data?.totals.inProgress??"–"}</b>تحت الإجراء</div>
     </div>
     <div className="flex flex-wrap gap-2">
      <button type="button" disabled={busy} onClick={()=>void activate()}
       className="rounded-lg bg-[#0D3B34] px-3 py-2 text-[11px] font-black text-white disabled:opacity-40">{enabled?"🔊 اختبار صوت أريس":"🔊 تشغيل الصوت وإشعارات الجهاز"}</button>
      <button type="button" onClick={()=>void refresh()} className="rounded-lg border border-[#D4AF37]/50 px-3 py-2 text-[11px]">↻ تحديث</button>
     </div>
     {notice&&<p role="status" className="rounded-lg bg-[#FFF8E6] p-2 text-[11px] leading-5 text-[#72581E]">{notice}</p>}
     {data&&!data.emailConfigured&&<p role="alert" className="rounded-lg bg-red-50 p-2 text-[11px] text-red-800">إعدادات بريد الإدارة غير مكتملة في الخادم.</p>}
     {!!data?.totals.emailFailed&&<p role="status" className="rounded-lg bg-[#FFF2EB] p-2 text-[11px] text-[#99401F]">فشل إرسال البريد لـ {data.totals.emailFailed} طلب مفتوح بحسب سجل النظام. راجعها من الإدارة.</p>}
     <div className="max-h-72 space-y-2 overflow-y-auto">
      {data?.recent.length?data.recent.slice(0,9).map(item=><Link key={item.id} href={item.href} onClick={()=>setPanelOpen(false)}
       className="block rounded-lg border border-[#EBDCB7] p-2 text-[11px] hover:bg-[#FFF9E8]">
       <span className="font-black text-[#0D3B34]">{actionLabels[item.type]||"متابعة مطلوبة"} · {serviceLabels[item.kind]||item.kind}</span>
       <span className="mt-1 block font-mono text-[10px] text-[#6D776E]">{item.reference}</span>
       </Link>):<p className="py-2 text-center text-xs text-[#68776D]">لا توجد طلبات جديدة أو تفاعلات تنتظر المتابعة.</p>}
     </div>
     <Link href="/admin/dashboard" onClick={()=>setPanelOpen(false)} className="block rounded-xl bg-[#F3E7C8] px-3 py-2 text-center text-xs font-black text-[#0D3B34]">الذهاب إلى لوحة الإدارة ←</Link>
     <p className="text-[10px] leading-5 text-[#70766C]">لصوت الإشعارات على الجوال اضغط «تشغيل الصوت وإشعارات الجهاز» مرة واحدة ووافق على الأذونات. يعمل الصوت عند بقاء لوحة الإدارة نشطة؛ عند إغلاق المتصفح يلزم Web Push وتسمح المنصة بصوت النظام فقط.</p>
   </div>}
 </div>;
}
