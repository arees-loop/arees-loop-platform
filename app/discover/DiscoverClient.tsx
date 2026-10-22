"use client";
import Link from "next/link";
import ExperiencePhoto from "@/app/components/ExperiencePhoto";
import ExperienceDistance from "@/app/components/ExperienceDistance";
import SaveExperienceButton from "@/app/components/SaveExperienceButton";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

type Service={id:string;nameAr:string;category:string;subCategory?:string|null;city?:string|null;locationName?:string|null;formattedAddress?:string|null;nameEn?:string|null;finalPrice:number;loyaltyPoints:number;images:string[];latitude?:number|null;longitude?:number|null};
function norm(v?:string|null){return (v||"").trim().toLowerCase()}
function cityKey(v?:string|null){
 const x=norm(v).replace(/[أإآ]/g,"ا").replace(/[\u064B-\u065F]/g,"").replace(/\s+/g," ").trim();
 if(/^(المدينة|المدينة المنورة|مدينة المدينة المنورة|medina|madinah|al madinah|al madinah al munawwarah)$/.test(x))return "المدينة المنورة";
 if(/^(makkah|mecca|مكه|مكة|مكة المكرمة)$/.test(x))return "مكة المكرمة";
 if(/^(jeddah|jidda|جده|جدة)$/.test(x))return "جدة";
 if(/^(riyadh|الرياض)$/.test(x))return "الرياض";
 return x;
}
function matchesType(s:Service,type:string){
 const h=norm(s.category+" "+(s.subCategory||""));
 if(type==="domestic")return h.includes("محلية")||h.includes("داخلي");
 if(type==="international")return h.includes("عالمية")||h.includes("دولي");
 if(type==="cruise")return h.includes("كروز")||h.includes("cruise");
 if(type==="experiences")return !h.includes("برامج سياحية")&&!h.includes("كروز");
 return true;
}
const labels:Record<string,string>={domestic:"برامج سياحية محلية",international:"برامج سياحية عالمية",cruise:"رحلات الكروز",experiences:"التجارب"};
function distanceKm(a:number,b:number,c:number,d:number){const r=Math.PI/180,dl=(c-a)*r,dn=(d-b)*r,h=Math.sin(dl/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin(dn/2)**2;return 12742*Math.asin(Math.min(1,Math.sqrt(h)));}
export default function Page(){return <Suspense fallback={<main className="min-h-screen bg-[#F7F5EF] pt-24"/>}><Content/></Suspense>}

function Content(){
 const p=useSearchParams(),type=p.get("type")||"all";
 const [services,setServices]=useState<Service[]>([]);
 const [city,setCity]=useState("");
 const [destination,setDestination]=useState(p.get("destination")||"");
 const [showAllLocations,setShowAllLocations]=useState(false);
 const [loading,setLoading]=useState(true);
 const [loadError,setLoadError]=useState(false);
 const [refresh,setRefresh]=useState(0);
 useEffect(()=>{
  let active=true;
  fetch("/api/services",{cache:"no-store"})
   .then(r=>{if(!r.ok)throw Error("SERVICES_FETCH_FAILED");return r.json();})
   .then(j=>{if(!j?.success||!Array.isArray(j.data))throw Error("SERVICES_FETCH_FAILED");if(active){setServices(j.data);setLoadError(false);}})
   .catch(()=>{if(active)setLoadError(true);})
   .finally(()=>{if(active)setLoading(false);});
  return()=>{active=false};
 },[refresh]);
 const typed=useMemo(()=>services.filter(s=>matchesType(s,type)),[services,type]);
 const cities=useMemo(()=>(Array.from(new Set(typed.map(s=>s.city).filter(Boolean))) as string[]).sort((a,b)=>a.localeCompare(b,"ar")),[typed]);
 const locationMode=p.get("source")==="location";
 const lat=Number(p.get("lat")),lng=Number(p.get("lng"));
 const validLocation=locationMode&&p.has("lat")&&p.has("lng")&&Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=-90&&lat<=90&&lng>=-180&&lng<=180;
 const nearbyCity=locationMode?(p.get("near")||""):"";
 const manualSearch=Boolean(city||norm(destination));
 const nearbyOnly=locationMode&&!showAllLocations&&!manualSearch;
 // Coordinates may be absent or inconsistent on partner offers. When the
 // browser independently confirmed a city, keep its published offers visible.
 const shown=typed.filter(s=>{
  const geoNear=validLocation&&typeof s.latitude==="number"&&typeof s.longitude==="number"&&distanceKm(lat,lng,s.latitude,s.longitude)<=50;
  const cityNear=Boolean(nearbyCity)&&Boolean(s.city)&&cityKey(s.city)===cityKey(nearbyCity);
  return (!nearbyOnly||geoNear||cityNear)
   &&(!city||cityKey(s.city)===cityKey(city))
   &&(!norm(destination)||norm([s.city,s.locationName,s.formattedAddress,s.nameAr,s.nameEn].filter(Boolean).join(" ")).includes(norm(destination)));
 });
 const isMedina=(value?:string|null)=>cityKey(value)==="المدينة المنورة";
 const selectedMedina=isMedina(city)||isMedina(destination)||(!city&&!norm(destination)&&isMedina(nearbyCity));
 const missionDestination=selectedMedina?"المدينة المنورة":city||destination.trim()||nearbyCity;
 const missionHref="/missions"+(missionDestination?"?destination="+encodeURIComponent(missionDestination):"");
 const all=()=>{setCity("");setDestination("");setShowAllLocations(true);};
 const nearby=()=>{setCity("");setDestination("");setShowAllLocations(false);};
 return <main dir="rtl" className="min-h-screen bg-[#F7F5EF] px-4 pb-24 pt-7 text-[#0D3B34] md:px-8">
  <div className="mx-auto max-w-[1380px]">
   <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
    <h1 className="text-xl font-black md:text-2xl">{labels[type]||"البرامج والتجارب"}</h1>
    <span className="text-[11px] text-[#6C806F]">{loading?"جاري تحميل التجارب":loadError?"البيانات غير متاحة الآن":`${shown.length.toLocaleString("ar-SA")} تجربة متاحة`}</span>
   </div>
   <section aria-label="بحث الوجهات والمهام" className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#D4AF37]/30 bg-white/90 p-2.5 shadow-sm md:flex-nowrap">
    <label htmlFor="next-destination" className="sr-only">ابحث عن وجهتك</label>
    <input id="next-destination" type="search" value={destination}
      onChange={e=>{setDestination(e.target.value);setCity("");setShowAllLocations(true);}}
      placeholder="📍 ابحث عن مدينة أو تجربة..."
      className="h-10 min-w-0 flex-[1_1_170px] rounded-xl border border-[#0D3B34]/15 bg-[#F7F5EF] px-3 text-xs outline-none focus:border-[#D4AF37]"/>
    <label htmlFor="available-destinations" className="sr-only">اختر وجهة</label>
    <select id="available-destinations" value={city||(nearbyOnly?"__nearby__":"")}
      onChange={e=>{const value=e.target.value;setCity(value==="__nearby__"?"":value);setDestination("");setShowAllLocations(value!=="__nearby__");}}
      aria-label="اختيار وجهة من القائمة"
      className="h-10 min-w-0 flex-[1_1_150px] rounded-xl border border-[#0D3B34]/15 bg-[#F7F5EF] px-2 text-xs outline-none focus:border-[#D4AF37] md:max-w-[250px]">
      {locationMode&&<option value="__nearby__">📍 القريبة من موقعي</option>}
      <option value="">كل المواقع — جميع البرامج</option>
      {cities.map(x=><option key={x} value={x}>{x}</option>)}
    </select>
    <button type="button" onClick={all} className="h-10 shrink-0 rounded-xl border border-[#C99C2E] bg-[#FFF5DB] px-3 text-xs font-bold">كل المواقع — عرض جميع البرامج</button>
    {locationMode&&<button type="button" onClick={nearby} className="h-10 shrink-0 rounded-xl border border-[#0D3B34]/15 px-3 text-xs font-bold">📍 القريبة</button>}
    <Link href={missionHref} aria-label="مهام اللوب" className="inline-flex h-10 shrink-0 items-center rounded-xl bg-[#0D3B34] px-3 text-xs font-bold text-white">🎯 مهام اللوب <span className="mr-1 text-[10px] opacity-75">(تجريبية)</span></Link>
   </section>
   {loading?<div className="mt-4 rounded-2xl bg-white p-7 text-center text-sm">جاري تحميل البرامج...</div>:
   loadError?<div role="alert" className="mt-4 rounded-2xl border border-amber-300 bg-white p-5 text-center text-sm">تعذر تحميل التجارب حالياً. <button type="button" className="font-bold underline" onClick={()=>{setLoading(true);setRefresh(x=>x+1);}}>إعادة المحاولة</button></div>:
   shown.length===0?<div className="mt-4 rounded-2xl bg-white p-6 text-center text-sm font-bold">ما في برامج مطابقة للاختيار حالياً. <button type="button" onClick={all} className="mr-2 text-[#9A741B] underline">عرض كل البرامج</button></div>:
   <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {shown.map(s=><article key={s.id} className="overflow-hidden rounded-[28px] bg-white">
     <div className="relative w-full overflow-hidden bg-[#F5EFE2]">
      <SaveExperienceButton experience={{id:s.id,name:s.nameAr,city:s.city||"",image:s.images?.[0]||null,category:s.category}}/>
      <div className="aspect-[4/3]"><ExperiencePhoto src={s.images?.[0]} alt={s.nameAr}/></div>
     </div>
     <div className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[10px] font-bold text-[#B99124]">{s.category}</p><ExperienceDistance latitude={s.latitude} longitude={s.longitude}/></div>
      <h2 className="mt-2 text-xl font-black">{s.nameAr}</h2>
      <p className="mt-2 text-xs text-[#0D3B34]/55">{[s.city,s.locationName].filter(Boolean).join(" · ")}</p>
      <div className="mt-4 flex items-center justify-between gap-3"><b>{Number(s.finalPrice).toLocaleString("ar-SA")} ر.س</b><span className="flex items-center gap-2 rounded-full bg-[#D4AF37]/10 px-3 py-2 text-[10px] font-bold text-[#9A741B]"><img src="/Logo/arees-loop-logo.png" className="h-6 w-auto" alt="Arees Loop"/> {Number(s.loyaltyPoints)>0?`نقاط الخدمة: ${s.loyaltyPoints}`:"نقاط الخدمة حسب شروط الحجز"}</span></div>
      <Link href={`/services/${s.id}`} className="mt-5 flex justify-center rounded-xl bg-[#0D3B34] py-3 text-xs font-bold text-white">عرض التفاصيل</Link>
     </div>
    </article>)}
   </div>}
  </div>
 </main>;
}
