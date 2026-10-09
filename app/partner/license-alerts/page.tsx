"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
type Alert={id:string;kind:string;title:string;message:string;readAt:string|null;createdAt:string};
export default function LicenseAlertInbox(){
 const [alerts,setAlerts]=useState<Alert[]>([]),[error,setError]=useState("");
 useEffect(()=>{fetch("/api/partner/license-alerts",{cache:"no-store"}).then(r=>r.json()).then(d=>{if(d.success)setAlerts(d.alerts||[]);else setError(d.message||"تعذر تحميل التنبيهات")}).catch(()=>setError("تعذر تحميل التنبيهات"))},[]);
 async function read(id:string){const r=await fetch("/api/partner/license-alerts",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});if(r.ok)setAlerts(x=>x.map(a=>a.id===id?{...a,readAt:new Date().toISOString()}:a))}
 return <main dir="rtl" className="mx-auto min-h-screen max-w-4xl px-5 pt-36 text-[#0D3B34]"><h1 className="text-3xl font-black">تنبيهات التراخيص</h1><p className="mt-3 text-sm">تُحدّث حالة التراخيص عند فتح هذه الصفحة، وتُسجل رسالة واحدة لكل ترخيص في اليوم.</p>{error&&<p role="alert">{error}</p>}{alerts.map(a=><article key={a.id} className="mt-4 rounded-xl border bg-white p-5"><div className="flex items-center gap-3"><span className={"h-3 w-3 rounded-full "+(a.kind==="LICENSE_EXPIRED"?"bg-red-600":"bg-amber-500")}/><h2 className="font-bold">{a.title}</h2>{!a.readAt&&<span className="text-xs text-amber-700">جديد</span>}</div><p className="mt-2 text-sm">{a.message}</p><p className="mt-2 text-xs opacity-60">{new Date(a.createdAt).toLocaleString("ar-SA")}</p><div className="mt-3 flex gap-4"><Link href="/partner/business" className="underline">تجديد الترخيص</Link>{!a.readAt&&<button onClick={()=>void read(a.id)} className="underline">تحديد كمقروء</button>}</div></article>)}</main>;
}
