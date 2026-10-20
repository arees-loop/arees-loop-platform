"use client";
import Link from "next/link";
import {useCallback,useEffect,useState} from "react";
import {savedExperiencesEvent} from "@/app/components/SaveExperienceButton";
type Service={id:string;title:string;href:string;image:string;icon:string};
export default function SavedAreesServices(){
 const [items,setItems]=useState<Service[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const [busy,setBusy]=useState<string|null>(null);
 const refresh=useCallback(async()=>{
  try{
   const r=await fetch("/api/customer/saved-arees-services",{cache:"no-store",credentials:"include"});
   if(r.status===401){setItems([]);return;}
   const d=await r.json();if(!r.ok||!d.success)throw Error("unavailable");
   setItems(Array.isArray(d.data)?d.data:[]);setError("");
  }catch{setError("تعذر عرض خدمات أريس المحفوظة حالياً.");}
  finally{setLoading(false);}
 },[]);
 useEffect(()=>{void refresh();window.addEventListener(savedExperiencesEvent,refresh);return()=>window.removeEventListener(savedExperiencesEvent,refresh);},[refresh]);
 async function remove(kind:string){
  if(busy)return;setBusy(kind);
  try{
   const r=await fetch("/api/customer/saved-arees-services",{method:"DELETE",credentials:"include",
    headers:{"Content-Type":"application/json"},body:JSON.stringify({kind})});
   const d=await r.json();if(!r.ok||!d.success)throw Error("failed");
   setItems(old=>old.filter(x=>x.id!==kind));setError("");
   window.dispatchEvent(new Event(savedExperiencesEvent));
  }catch{setError("تعذرت إزالة الخدمة من الاهتمامات.");}
  finally{setBusy(null);}
 }
 if(loading)return <p className="mt-5 text-xs">جارٍ تحميل خدمات أريس المحفوظة...</p>;
 if(!items.length&&!error)return null;
 return <section aria-label="خدمات أريس المحفوظة" className="mt-8">
  <h2 className="mb-4 text-xl font-black">خدمات أريس المحفوظة</h2>
  {error&&<p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map(item=><article key={item.id} className="overflow-hidden rounded-2xl border border-[#D4AF37]/35 bg-white shadow-sm">
   <div className="relative h-32 bg-[#F4F0E6]"><img alt="" src={item.image} className="h-full w-full object-cover"/></div>
   <div className="p-4"><h3 className="text-lg font-black">{item.icon} {item.title}</h3>
    <div className="mt-4 flex flex-wrap gap-2">
     <Link href={item.href} className="rounded-xl bg-[#0D3B34] px-4 py-2 text-xs font-bold text-white">عرض الخدمة</Link>
     <button type="button" disabled={busy===item.id} onClick={()=>void remove(item.id)} className="rounded-xl border px-4 py-2 text-xs font-bold disabled:opacity-50">إزالة من الاهتمامات</button>
    </div>
   </div></article>)}</div>
 </section>;
}
