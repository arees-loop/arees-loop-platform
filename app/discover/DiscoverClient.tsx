"use client";
import Link from "next/link";
import ExperiencePhoto from "@/app/components/ExperiencePhoto";
import SaveExperienceButton from "@/app/components/SaveExperienceButton";
import {getCurrentLocation} from "@/lib/location";
import {useSearchParams} from "next/navigation";
import {Suspense,useCallback,useEffect,useMemo,useState} from "react";

type Service={
 id:string;nameAr:string;category:string;subCategory?:string|null;city?:string|null;
 locationName?:string|null;formattedAddress?:string|null;nameEn?:string|null;
 finalPrice:number;loyaltyPoints:number;images:string[];latitude?:number|null;longitude?:number|null;
};
type Coordinates={lat:number;lng:number};
type Place={name:string;address:string;city:string;country:string;location:Coordinates};
type Mode="all"|"nearby"|"destination";
const RADIUS_KM=50;
const norm=(x?:string|null)=>(x||"").trim().toLocaleLowerCase("ar-SA").replace(/[أإآ]/g,"ا").replace(/ة/g,"ه");
const valid=(lat:number,lng:number)=>Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180;
function distanceKm(a:Coordinates,b:Coordinates){
 const r=Math.PI/180,dLat=(b.lat-a.lat)*r,dLng=(b.lng-a.lng)*r;
 const h=Math.sin(dLat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLng/2)**2;
 return 12742*Math.asin(Math.min(1,Math.sqrt(h)));
}
function matchesType(s:Service,type:string){
 const h=norm(s.category+" "+(s.subCategory||""));
 if(type==="domestic")return h.includes("محليه")||h.includes("داخلي");
 if(type==="international")return h.includes("عالميه")||h.includes("دولي");
 if(type==="cruise")return h.includes("كروز")||h.includes("cruise");
 if(type==="experiences")return !h.includes("برامج سياحيه")&&!h.includes("كروز");
 return true;
}
const labels:Record<string,string>={domestic:"برامج سياحية محلية",international:"برامج سياحية عالمية",cruise:"رحلات الكروز",experiences:"التجارب"};
function PageContent(){
 const params=useSearchParams();
 const type=params.get("type")||"all";
 const queryFromUrl=params.get("destination")||"";
 const urlLat=Number(params.get("lat")),urlLng=Number(params.get("lng"));
 const locationFromUrl=params.get("source")==="location"&&params.has("lat")&&params.has("lng")&&valid(urlLat,urlLng);
 const [services,setServices]=useState<Service[]>([]);
 const [loading,setLoading]=useState(true);
 const [loadError,setLoadError]=useState(false);
 const [mode,setMode]=useState<Mode>(locationFromUrl?"nearby":queryFromUrl?"destination":"all");
 const [center,setCenter]=useState<Coordinates|null>(locationFromUrl?{lat:urlLat,lng:urlLng}:null);
 const [areaName,setAreaName]=useState("");
 const [district,setDistrict]=useState("");
 const [query,setQuery]=useState(queryFromUrl);
 const [selectedPlace,setSelectedPlace]=useState<Place|null>(null);
 const [suggestions,setSuggestions]=useState<Place[]>([]);
 const [searching,setSearching]=useState(false);
 const [locating,setLocating]=useState(false);
 const [notice,setNotice]=useState("");
 const [cityFilter,setCityFilter]=useState("");

 useEffect(()=>{
  const controller=new AbortController();
  void fetch("/api/services",{cache:"no-store",signal:controller.signal})
   .then(async r=>{if(!r.ok)throw Error("LOAD_FAILED");return r.json()})
   .then(data=>{if(data?.success&&Array.isArray(data.data))setServices(data.data);else setLoadError(true)})
   .catch(()=>{if(!controller.signal.aborted)setLoadError(true)})
   .finally(()=>{if(!controller.signal.aborted)setLoading(false)});
  return()=>controller.abort();
 },[]);
 useEffect(()=>{
  if(!locationFromUrl)return;
  const controller=new AbortController();
  void fetch(`/api/location/reverse-geocode?lat=${urlLat}&lng=${urlLng}`,{cache:"no-store",signal:controller.signal})
   .then(r=>r.ok?r.json():null)
   .then(data=>{if(!controller.signal.aborted&&data){setAreaName(data.city||"");setDistrict(data.area||"")}})
   .catch(()=>{});
  return()=>controller.abort();
 },[locationFromUrl,urlLat,urlLng]);
 useEffect(()=>{
  if(query.trim().length<2||selectedPlace||mode==="nearby"){setSuggestions([]);setSearching(false);return;}
  const controller=new AbortController();
  const timer=window.setTimeout(()=>{
   setSearching(true);
   void fetch("/api/location/search?query="+encodeURIComponent(query.trim()),{cache:"no-store",signal:controller.signal})
    .then(async r=>r.ok?r.json():null)
    .then(data=>{if(!controller.signal.aborted)setSuggestions(Array.isArray(data?.suggestions)?data.suggestions:[])})
    .catch(()=>{if(!controller.signal.aborted)setSuggestions([])})
    .finally(()=>{if(!controller.signal.aborted)setSearching(false)});
  },350);
  return()=>{window.clearTimeout(timer);controller.abort()};
 },[query,selectedPlace,mode]);

 const detect=useCallback(async()=>{
  setLocating(true);setNotice("");
  try{
   const location=await getCurrentLocation();
   const {lat,lng,accuracy}=location.coordinates;
   if(accuracy===null||accuracy>25000){setNotice("دقة موقعك الحالية غير كافية. حاول مرة أخرى أو اختر وجهتك يدوياً.");return;}
   setCenter({lat,lng});setAreaName(location.city||"");setDistrict(location.area||"");
   setQuery("");setCityFilter("");setSelectedPlace(null);setSuggestions([]);setMode("nearby");
  }catch{
   setNotice("لم نتمكن من تحديد الموقع. يمكنك السماح بالموقع من المتصفح أو البحث عن المدينة والوجهة يدوياً.");
  }finally{setLocating(false)}
 },[]);
 const typed=useMemo(()=>services.filter(s=>matchesType(s,type)),[services,type]);
 const cities=useMemo(()=>Array.from(new Set(typed.map(s=>s.city).filter((x):x is string=>!!x))).sort((a,b)=>a.localeCompare(b,"ar")),[typed]);
 const nearby=mode==="nearby"&&center!==null;
 const chosen=mode==="destination"&&selectedPlace!==null;
 const locationCenter=nearby?center:chosen?selectedPlace.location:null;
 const results=useMemo(()=>{
  const needle=norm(query);
  return typed.map(service=>{
    const coords=typeof service.latitude==="number"&&typeof service.longitude==="number"&&valid(service.latitude,service.longitude)?
      {lat:service.latitude,lng:service.longitude}:null;
    const distance=locationCenter&&coords?distanceKm(locationCenter,coords):null;
    return {service,distance};
  }).filter(({service,distance})=>{
    if(locationCenter&&(distance===null||distance>RADIUS_KM))return false;
    if(cityFilter&&service.city!==cityFilter)return false;
    if(mode==="destination"&&!selectedPlace&&needle.length>0&&!norm([service.city,service.locationName,service.formattedAddress,service.nameAr,service.nameEn].filter(Boolean).join(" ")).includes(needle))return false;
    return true;
  }).sort((a,b)=>{
    if(locationCenter)return (a.distance??Infinity)-(b.distance??Infinity);
    return a.service.nameAr.localeCompare(b.service.nameAr,"ar");
  });
 },[typed,locationCenter,cityFilter,mode,selectedPlace,query]);
 const locationLabel=[district,areaName].filter(Boolean).join("، ");
 const title=mode==="nearby"&&center?"التجارب القريبة منك":
   mode==="destination"?"استكشف وجهتك القادمة":labels[type]||"البرامج والتجارب";
 function changeSearch(text:string){
  setQuery(text);setSelectedPlace(null);setSuggestions([]);setCityFilter("");
  setMode(text.trim()?"destination":"all");setNotice("");
 }
 function pickPlace(place:Place){
  if(!place.location||!valid(place.location.lat,place.location.lng))return;
  setQuery(place.name||place.city||place.address);
  setSelectedPlace(place);setCityFilter("");setSuggestions([]);setAreaName("");setDistrict("");
  setMode("destination");setNotice("");
 }
 function resetAll(){setMode("all");setCenter(null);setAreaName("");setDistrict("");setQuery("");setCityFilter("");setSelectedPlace(null);setSuggestions([]);setNotice("")}
 return <main dir="rtl" className="min-h-screen bg-[#F7F5EF] px-4 pb-24 pt-32 text-[#0D3B34] md:px-8">
  <div className="mx-auto max-w-[1380px]">
   <p className="text-[11px] font-bold tracking-[.17em] text-[#B99124]">AREES LOOP · DISCOVER</p>
   <h1 className="mt-2 text-3xl font-black md:text-4xl">{title}</h1>
   <section className="mt-6 rounded-[24px] border border-[#D4AF37]/30 bg-white p-4 shadow-sm md:p-6" aria-label="الموقع والوجهات">
     {nearby&&<div role="status" className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl bg-[#EAF5EF] p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#116547]" aria-hidden="true">
         <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
        </span>
        <div className="flex-1"><p className="text-sm font-black">أنت الآن {locationLabel?"في "+locationLabel:"تستكشف من موقعك الحالي"}</p>
         <p className="mt-1 text-xs leading-6 text-[#0D3B34]/65">تظهر التجارب المنشورة ضمن {RADIUS_KM} كم من موقعك، مرتبة بالأقرب. التجارب بلا موقع محدد لا تظهر في النتائج القريبة.</p>
        </div>
     </div>}
     {chosen&&<div role="status" className="mb-5 rounded-2xl bg-[#F6EED9] p-4"><p className="text-sm font-black">وجهتك المختارة: {selectedPlace.name}</p><p className="mt-1 text-xs text-[#0D3B34]/70">{selectedPlace.address}</p><p className="mt-2 text-xs text-[#0D3B34]/70">نعرض التجارب ضمن {RADIUS_KM} كم من الوجهة المختارة، وليس موقعك الحالي.</p></div>}
     <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="relative">
       <label htmlFor="loop-destination" className="mb-2 block text-sm font-black">ابحث عن حي أو مدينة أو وجهتك القادمة</label>
       <input id="loop-destination" type="search" value={query} onChange={e=>changeSearch(e.target.value)}
        placeholder="مثلاً: المدينة المنورة، العلا، جدة، حي قباء..." autoComplete="off"
        className="w-full rounded-xl border border-[#D4AF37]/45 bg-[#F9F7F1] px-4 py-3.5 text-sm outline-none focus:border-[#B48D2C]"/>
       {searching&&<span className="absolute left-3 top-11 text-xs text-[#0D3B34]/55">بحث...</span>}
       {suggestions.length>0&&<div role="listbox" aria-label="الوجهات المطابقة" className="absolute inset-x-0 top-full z-40 mt-1 max-h-64 overflow-y-auto rounded-xl border border-[#D4AF37]/40 bg-white p-2 shadow-xl">
        {suggestions.map((place,i)=><button key={place.name+"-"+i} type="button" role="option" aria-selected={false} onClick={()=>pickPlace(place)}
          className="block w-full rounded-lg p-3 text-right hover:bg-[#F5EDD9]"><b className="block text-xs">{place.name}</b><span className="block truncate text-[11px] text-[#0D3B34]/60">{place.address}</span></button>)}
       </div>}
      </div>
      <div className="flex flex-wrap items-end gap-2">
       <button type="button" disabled={locating} onClick={()=>void detect()} className="rounded-xl bg-[#0D3B34] px-5 py-3.5 text-sm font-black text-white disabled:opacity-50">{locating?"جارٍ تحديد الموقع...":"📍 استخدم موقعي"}</button>
       <button type="button" onClick={resetAll} className="rounded-xl border border-[#D4AF37]/40 bg-white px-4 py-3.5 text-xs font-bold">كل الوجهات</button>
      </div>
     </div>
     <p className="mt-3 text-xs leading-6 text-[#0D3B34]/60">يمكنك تصفح كل المناطق دون تشغيل الموقع. اختر اقتراحاً من البحث لعرض تجارب تلك المنطقة على الخريطة الجغرافية.</p>
     {notice&&<p role="alert" className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-900">{notice}</p>}
     {!locationCenter&&cities.length>0&&<div className="mt-4 flex flex-wrap gap-2">
       <button type="button" onClick={()=>setCityFilter("")} className={`rounded-full px-4 py-2 text-xs font-bold ${!cityFilter?"bg-[#0D3B34] text-white":"bg-[#F8F3E7]"}`}>كل المدن</button>
       {cities.slice(0,18).map(city=><button key={city} type="button" onClick={()=>{setCityFilter(city);setNotice("")}}
         className={`rounded-full px-4 py-2 text-xs font-bold ${cityFilter===city?"bg-[#0D3B34] text-white":"bg-[#F8F3E7]"}`}>{city}</button>)}
     </div>}
   </section>
   {loading?<p className="mt-8 rounded-2xl bg-white p-8 text-center">جارٍ تحميل التجارب...</p>:
   loadError?<p role="alert" className="mt-8 rounded-2xl border border-amber-200 bg-white p-8 text-center">تعذر تحميل التجارب حالياً. أعد المحاولة لاحقاً.</p>:
   <section className="mt-7" aria-label="نتائج استكشاف التجارب">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-black">التجارب المتاحة</h2>
     <p className="mt-1 text-xs text-[#0D3B34]/60">{locationCenter?"تُعرض فقط التجارب المطابقة للنطاق المكاني المختار.":"يمكنك اختيار مدينة أو استخدام الموقع لفرز التجارب."}</p></div>
     <span className="rounded-full bg-[#EDE5CF] px-4 py-2 text-xs font-black">{results.length} تجربة</span>
    </div>
    {results.length===0?<div className="mt-5 rounded-3xl bg-white p-9 text-center">
     <p className="font-black">لا توجد تجارب منشورة مطابقة لهذا الموقع حالياً.</p>
     <p className="mt-2 text-sm text-[#0D3B34]/65">جرّب منطقة قريبة أو امسح البحث لاستعراض الوجهات المتاحة.</p>
     <button type="button" onClick={resetAll} className="mt-5 rounded-xl bg-[#0D3B34] px-5 py-3 text-xs font-bold text-white">عرض كل الوجهات</button>
    </div>:
    <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
     {results.map(({service,distance})=><article key={service.id} className="overflow-hidden rounded-[24px] bg-white shadow-sm">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F5EFE2]">
       <SaveExperienceButton experience={{id:service.id,name:service.nameAr,city:service.city||"",image:service.images?.[0]||null,category:service.category}}/>
       <ExperiencePhoto src={service.images?.[0]} alt={service.nameAr}/>
      </div>
      <div className="p-5"><p className="text-[11px] font-bold text-[#B99124]">{service.category}</p>
       <h3 className="mt-2 text-lg font-black">{service.nameAr}</h3>
       <p className="mt-2 text-xs text-[#0D3B34]/60">{[service.city,service.locationName].filter(Boolean).join(" · ")||"الموقع غير محدد"}</p>
       {distance!==null&&<p className="mt-2 text-xs font-bold text-[#13835B]">📍 {distance<1?Math.round(distance*1000)+" متر":distance.toFixed(1)+" كم"} من {nearby?"موقعك":"الوجهة المختارة"}</p>}
       <div className="mt-4 flex items-center justify-between gap-2"><strong>{Number(service.finalPrice).toLocaleString("ar-SA")} ر.س</strong><span className="text-[11px] font-bold text-[#9B792B]">+{service.loyaltyPoints||0} نقطة</span></div>
       <Link href={`/services/${service.id}`} className="mt-5 flex justify-center rounded-xl bg-[#0D3B34] py-3 text-xs font-black text-white">عرض التجربة</Link>
      </div>
     </article>)}
    </div>}
   </section>}
  </div>
 </main>;
}
export default function DiscoverPage(){return <Suspense fallback={<main className="min-h-screen bg-[#F7F5EF] pt-32"/>}><PageContent/></Suspense>}
