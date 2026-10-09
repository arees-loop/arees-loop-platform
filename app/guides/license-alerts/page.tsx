"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
type Alert={id:string;title:string;message:string;kind:string;readAt:string|null;createdAt:string};
export default function GuideLicenseAlertsPage(){
 const [items,setItems]=useState<Alert[]>([]),[error,setError]=useState("");
 useEffect(()=>{fetch("/api/guides/license-alerts",{cache:"no-store"}).then(r=>r.json()).then(d=>{if(d.success)setItems(d.alerts||[]);else setError(d.message||"تعذر تحميل التنبيهات")}).catch(()=>setError("تعذر تحميل التنبيهات"))},[]);
 async function markRead(id:string){const r=await fetch("/api/guides/license-alerts",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});if(r.ok)setItems(x=>x.map(a=>a.id===id?{...a,readAt:new Date().toISOString()}:a))}
 return <main dir="rtl" className="mx-auto min-h-screen max-w-4xl px-5 pt-36 text-[#0D3B34]"><h1 className="text-3xl font-black">إشعارات صلاحية ترخيص المرشد</h1><p className="mt-3 text-sm">تُحدّث التنبيهات عند فتح الصفحة، ويُحفظ إشعار واحد لكل ترخيص يومياً.</p>{error&&<p role="alert">{error}</p>}{items.map(a=><article key={a.id} className="mt-4 rounded-xl border bg-white p-5"><div className="flex items-center gap-3"><span className={"h-3 w-3 rounded-full "+(a.kind==="GUIDE_LICENSE_EXPIRED"?"bg-red-600":"bg-amber-500")}/><b>{a.title}</b>{!a.readAt&&<span className="text-xs text-amber-700">جديد</span>}</div><p className="mt-2 text-sm">{a.message}</p><p className="mt-2 text-xs opacity-60">{new Date(a.createdAt).toLocaleString("ar-SA")}</p><div className="mt-3 flex gap-4"><Link href="/guides/applications" className="underline">متابعة الترخيص</Link>{!a.readAt&&<button onClick={()=>void markRead(a.id)} className="underline">تحديد كمقروء</button>}</div></article>)}</main>;
}
