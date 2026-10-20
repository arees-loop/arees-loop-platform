"use client";
import {useEffect,useState} from "react";
const items=[{slot:"PASSPORT",label:"جواز السفر"},{slot:"LOCAL_LICENSE",label:"الرخصة المحلية"},{slot:"PORTRAIT",label:"الصورة الشخصية"}] as const;
export default function LicenseDocumentPreview({reference}:{reference:string}){
 const [slot,setSlot]=useState<(typeof items)[number]["slot"]|null>(null);
 useEffect(()=>{if(!slot)return;const close=(e:KeyboardEvent)=>{if(e.key==="Escape")setSlot(null)};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close)},[slot]);
 const link=(s:string,preview=false)=>"/api/admin/license-cart-document?reference="+encodeURIComponent(reference)+"&slot="+encodeURIComponent(s)+(preview?"&preview=true":"");
 return <section className="rounded-2xl border border-[#D4AF37]/35 p-5" dir="rtl">
  <h3 className="text-base font-black">مراجعة مستندات العميل — للإدارة فقط</h3>
  <p className="mt-2 text-xs text-[#66766A]">عاين كل مستند دون تنزيله، ثم أرسل ملاحظاتك للعميل من نموذج الرد أدناه عند الحاجة.</p>
  <div className="mt-3 flex flex-wrap gap-2">{items.map(item=><button type="button" key={item.slot} onClick={()=>setSlot(item.slot)} className="rounded-xl border border-[#D4AF37] bg-white px-4 py-2 text-xs font-bold">معاينة {item.label}</button>)}</div>
  {slot&&<div role="presentation" className="fixed inset-0 z-[300] flex items-center justify-center bg-[#081D19]/85 p-2 sm:p-5">
   <div role="dialog" aria-modal="true" aria-label={"معاينة "+items.find(i=>i.slot===slot)?.label} className="flex h-[90dvh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DDD0AC] p-3">
     <b>{items.find(i=>i.slot===slot)?.label}</b>
     <div className="flex gap-2">
      <a href={link(slot)} className="rounded-lg border border-[#D4AF37] px-3 py-2 text-xs font-bold">تحميل</a>
      <button type="button" autoFocus onClick={()=>setSlot(null)} className="rounded-lg bg-[#0D3B34] px-3 py-2 text-xs font-bold text-white">إغلاق ×</button>
     </div>
    </div>
    <iframe title={"مستند "+slot} src={link(slot,true)} referrerPolicy="no-referrer" className="min-h-0 w-full flex-1 bg-[#F2F3F0]"/>
    <p className="px-3 py-2 text-xs text-[#66766A]">إذا لم تظهر المعاينة في متصفحك، استخدم زر التحميل. المستندات خاصة ولا تُرسل في البريد الإلكتروني.</p>
   </div>
  </div>}
 </section>;
}