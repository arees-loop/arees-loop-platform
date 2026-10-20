"use client";
import {useEffect,useState} from "react";

/** This UI does not fetch or copy receipt bytes into application state. The
 * same-origin, admin-authorized endpoint streams only a private receipt. */
export default function BankReceiptPreview({reference,label="معاينة الإيصال"}:{
 reference:string;label?:string;
}){
 const [opened,setOpened]=useState(false);
 const src="/api/admin/cart-bank-payments?receipt=true&preview=true&reference="+encodeURIComponent(reference);
 const download="/api/admin/cart-bank-payments?receipt=true&reference="+encodeURIComponent(reference);
 useEffect(()=>{
  if(!opened)return;
  function close(e:KeyboardEvent){if(e.key==="Escape")setOpened(false)}
  window.addEventListener("keydown",close);
  return()=>window.removeEventListener("keydown",close);
 },[opened]);
 return <>
  <button type="button" onClick={()=>setOpened(true)}
   className="rounded-xl border border-[#B99124] bg-[#FFFAEE] px-4 py-2 text-xs font-black text-[#0D3B34]">
   <span aria-hidden="true">◉ </span>{label}
  </button>
  {opened&&<div dir="rtl" role="presentation" className="fixed inset-0 z-[300] flex items-center justify-center bg-[#071B17]/85 p-2 sm:p-5">
   <section role="dialog" aria-modal="true" aria-label={"معاينة إيصال التحويل "+reference}
    className="flex h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-white shadow-2xl">
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8D5A8] bg-[#FDF9EF] p-3 sm:px-5">
     <div className="min-w-0">
      <h2 className="text-base font-black text-[#0D3B34]">معاينة إثبات التحويل البنكي</h2>
      <p dir="ltr" className="mt-1 break-all text-right font-mono text-[11px] text-[#5C6F66]">{reference}</p>
     </div>
     <div className="flex flex-wrap gap-2">
      <a href={download} className="rounded-lg border border-[#D4AF37] bg-white px-3 py-2 text-xs font-bold">تحميل الإيصال</a>
      <button type="button" onClick={()=>setOpened(false)} autoFocus
       className="rounded-lg bg-[#0D3B34] px-4 py-2 text-xs font-bold text-white">إغلاق ×</button>
     </div>
    </header>
    <div className="min-h-0 flex-1 bg-[#E8EAE7] p-1 sm:p-3">
     <iframe key={reference} title={"الإيصال "+reference} src={src}
      className="h-full w-full rounded-lg border border-[#D2D8D3] bg-white"
      referrerPolicy="no-referrer"/>
    </div>
    <p className="px-4 py-2 text-xs text-[#5D7068]">المعاينة للاطلاع فقط؛ اعتماد المبلغ يتم بعد التحقق من وصول التحويل في كشف البنك. إذا لم يدعم متصفحك عرض الملف، استخدم تحميل الإيصال.</p>
   </section>
  </div>}
 </>;
}
