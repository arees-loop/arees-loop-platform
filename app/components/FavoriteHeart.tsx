"use client";
import {useEffect,useState} from "react";
export default function FavoriteHeart({serviceId,className=""}:{serviceId:string;className?:string}){
 const [liked,setLiked]=useState(false);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 useEffect(()=>{let active=true;fetch("/api/account/interests",{cache:"no-store"}).then(r=>r.json()).then(data=>{if(active&&data.success)setLiked((data.serviceIds||[]).includes(serviceId))}).catch(()=>{});return()=>{active=false}},[serviceId]);
 async function toggle(){if(busy)return;setBusy(true);setMessage("");try{const next=!liked;const response=await fetch("/api/account/interests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({serviceId,liked:next})});if(response.status===401){window.location.href="/login";return;}const data=await response.json();if(!response.ok)throw new Error(data.message||"تعذر تحديث الاهتمامات");setLiked(next);}catch(e){setMessage(e instanceof Error?e.message:"تعذر تحديث الاهتمامات");}finally{setBusy(false)}}
 return <span className={className}><button type="button" disabled={busy} onClick={()=>void toggle()} aria-pressed={liked} aria-label={liked?"إزالة من اهتماماتي":"إضافة إلى اهتماماتي"} className="grid h-11 w-11 place-items-center rounded-full bg-white/95 text-2xl shadow-md transition hover:scale-105 disabled:opacity-50"><span aria-hidden="true" className={liked?"text-red-600":"text-[#0D3B34]"}>{liked?"♥":"♡"}</span></button>{message&&<span role="alert" className="block max-w-44 rounded bg-white p-1 text-xs text-red-700">{message}</span>}</span>;
}
