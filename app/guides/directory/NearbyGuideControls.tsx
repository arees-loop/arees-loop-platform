"use client";
import { useState } from "react";
import Link from "next/link";
export default function NearbyGuideControls({active}:{active:boolean}){
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 function locate(){
  if(!navigator.geolocation){setError("المتصفح لا يدعم تحديد الموقع. اختر المدينة من القائمة.");return;}
  setBusy(true);setError("");
  navigator.geolocation.getCurrentPosition(
   ({coords})=>{window.location.href="/guides/directory?lat="+encodeURIComponent(coords.latitude.toFixed(6))+"&lng="+encodeURIComponent(coords.longitude.toFixed(6));},
   ()=>{setBusy(false);setError("تعذر تحديد موقعك أو لم تمنح الإذن. يمكنك البحث بالمدينة يدوياً.");},
   {enableHighAccuracy:false,timeout:12000,maximumAge:300000}
  );
 }
 return <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-center">
  <button type="button" disabled={busy} onClick={locate} className="rounded-full bg-[#0D3B34] px-6 py-3 text-sm font-bold text-white disabled:opacity-60">{busy?"جارٍ تحديد موقعك…":"📍 مرشدون قريبون مني"}</button>
  <Link href="/guides/directory" className="rounded-full border border-[#D4AF37] bg-white px-6 py-3 text-sm font-bold text-[#0D3B34]">جميع المرشدين</Link>
  {active&&<p className="w-full text-sm font-bold text-[#0D3B34]">المرشدون الأقرب إلى موقعك حسب بيانات المواقع المسجلة لديهم</p>}
  {error&&<p role="alert" className="w-full text-sm text-red-700">{error}</p>}
 </div>;
}
