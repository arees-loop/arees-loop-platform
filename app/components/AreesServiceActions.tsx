"use client";
import {useEffect,useState} from "react";
import {savedExperiencesEvent} from "@/app/components/SaveExperienceButton";
export type AreesServiceKind="FLIGHT"|"FERRY"|"HOTEL"|"VISA"|"DRIVING_LICENSE";
type Props={kind:AreesServiceKind;title:string;href:string;className?:string};
export default function AreesServiceActions({kind,title,href,className=""}:Props){
 const [saved,setSaved]=useState(false),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[notice,setNotice]=useState("");
 useEffect(()=>{let active=true;fetch("/api/customer/saved-arees-services",{cache:"no-store",credentials:"include"}).then(async r=>{
   if(r.status===401)return {unauthenticated:true};
   if(!r.ok)throw Error("UNAVAILABLE");
   return r.json();
  }).then(d=>{if(active&&Array.isArray(d?.data))setSaved(d.data.some((x:{id:string})=>x.id===kind));})
  .catch(()=>{if(active)setNotice("تعذر تحميل الاهتمامات حالياً.")}).finally(()=>{if(active)setLoading(false)});
  return()=>{active=false};
 },[kind]);
 async function toggle(){
  if(busy)return;
  setBusy(true);setNotice("");
  try{
   const r=await fetch("/api/customer/saved-arees-services",{method:saved?"DELETE":"POST",credentials:"include",
    headers:{"Content-Type":"application/json"},body:JSON.stringify({kind})});
   if(r.status===401){window.location.assign("/login?next="+encodeURIComponent(href));return;}
   const d=await r.json().catch(()=>null);if(!r.ok||!d?.success)throw Error(d?.message||"تعذر حفظ الاهتمام.");
   setSaved(!!d.saved);window.dispatchEvent(new Event(savedExperiencesEvent));
   setNotice(d.saved?"تم حفظ الخدمة في الاهتمامات":"تمت إزالة الخدمة من الاهتمامات");
  }catch(e){setNotice(e instanceof Error?e.message:"تعذر حفظ الاهتمام.");}
  finally{setBusy(false)}
 }
 async function share(){
  const url=new URL(href,window.location.origin).href;
  try{
   if(navigator.share){await navigator.share({title,url});return;}
   await navigator.clipboard.writeText(url);setNotice("تم نسخ رابط الخدمة");
  }catch(err){if((err as Error).name!=="AbortError")setNotice("تعذرت المشاركة، انسخ رابط الصفحة من المتصفح.")}
 }
 return <div className={"flex flex-wrap items-center gap-2 "+className} dir="rtl">
  <button type="button" onClick={()=>void toggle()} disabled={busy||loading}
   aria-pressed={saved} aria-label={saved?"إزالة "+title+" من الاهتمامات":"إضافة "+title+" إلى الاهتمامات"}
   className="inline-flex items-center gap-2 rounded-xl border border-[#D4AF37]/50 bg-white px-4 py-2.5 text-sm font-bold text-[#0D3B34] shadow-sm transition hover:-translate-y-0.5 hover:border-[#B88E27] disabled:opacity-50">
   <span aria-hidden="true" className={"text-xl leading-none "+(saved?"text-[#B32736]":"text-[#97722D]")}>{saved?"♥":"♡"}</span>
   <span>{saved?"في الاهتمامات":"أضف للاهتمامات"}</span>
  </button>
  <button type="button" onClick={()=>void share()} className="inline-flex items-center gap-2 rounded-xl border border-[#D4AF37]/50 bg-white px-4 py-2.5 text-sm font-bold text-[#0D3B34] shadow-sm transition hover:-translate-y-0.5 hover:border-[#B88E27]">
   <span aria-hidden="true">↗</span> مشاركة الخدمة
  </button>
  {notice&&<p role="status" className="w-full text-xs text-[#597368]">{notice}</p>}
 </div>;
}
