"use client";
import {useEffect,useState} from "react";
import {readCustomerClaims} from "@/lib/customer-request-claims";

type Ticket={id:string;name:string;size:number|null;createdAt:string};
export default function CustomerTicket({reference}:{reference:string}){
 const [tickets,setTickets]=useState<Ticket[]>([]);
 const [error,setError]=useState(""),[busy,setBusy]=useState(false);
 const [preview,setPreview]=useState<string|null>(null);
 const claimHeaders=()=>{
  const claim=readCustomerClaims().find(c=>c.reference===reference);
  return claim?{"x-arees-request-token":claim.token}:{};
 };
 useEffect(()=>{
  let active=true;
  const load=async()=>{
   try{
    const r=await fetch("/api/customer/ticket?reference="+encodeURIComponent(reference),{headers:claimHeaders(),cache:"no-store"});
    const d=await r.json();
    if(!r.ok||!d.success)throw Error(d.message||"تعذر تحميل التذكرة.");
    if(active){setTickets(d.tickets||[]);setError("");}
   }catch(e){if(active)setError(e instanceof Error?e.message:"تعذر تحميل التذكرة.");}
  };
  void load();return()=>{active=false};
 },[reference]);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview)},[preview]);
 async function fileAction(id:string,mode:"preview"|"download"){
  if(busy)return;
  setBusy(true);setError("");
  try{
   const r=await fetch("/api/customer/ticket?reference="+encodeURIComponent(reference)+"&file="+encodeURIComponent(id),{headers:claimHeaders(),cache:"no-store"});
   if(!r.ok){const d=await r.json().catch(()=>({message:"تعذر تنزيل التذكرة."}));throw Error(d.message||"تعذر تنزيل التذكرة.");}
   const blob=await r.blob();
   if(!blob.type.includes("pdf"))throw Error("صيغة التذكرة غير صحيحة.");
   const url=URL.createObjectURL(blob);
   if(mode==="preview"){setPreview(old=>{if(old)URL.revokeObjectURL(old);return url;});}
   else{
     const a=document.createElement("a");a.href=url;a.download="Arees-Ticket-"+reference+".pdf";
     document.body.appendChild(a);a.click();a.remove();
     window.setTimeout(()=>URL.revokeObjectURL(url),30000);
   }
  }catch(e){setError(e instanceof Error?e.message:"تعذر فتح ملف التذكرة.");}
  finally{setBusy(false);}
 }
 if(tickets.length===0&&!error)return null;
 return <section className="mt-4 rounded-2xl border border-[#B7D8BF] bg-[#EFFAF3] p-4 text-[#165D3C]" dir="rtl">
  <h4 className="font-black">🎫 التذكرة الإلكترونية</h4>
  {tickets.map(t=><div key={t.id} className="mt-3 rounded-xl border border-[#B4DBBF] bg-white p-3">
   <p className="break-words text-xs font-bold">{t.name}</p>
   <p className="mt-1 text-[11px]">متاحة بتاريخ {new Date(t.createdAt).toLocaleString("ar-SA")} · محفوظة لك بشكل خاص</p>
   <div className="mt-3 flex flex-wrap gap-2">
    <button type="button" disabled={busy} className="rounded-lg border border-[#8BB7A2] px-4 py-2 text-xs font-bold disabled:opacity-40" onClick={()=>void fileAction(t.id,"preview")}>معاينة التذكرة</button>
    <button type="button" disabled={busy} className="rounded-lg bg-[#155F42] px-4 py-2 text-xs font-bold text-white disabled:opacity-40" onClick={()=>void fileAction(t.id,"download")}>تنزيل PDF</button>
   </div>
  </div>)}
  {preview&&<div className="mt-3"><button onClick={()=>setPreview(null)} className="mb-2 text-xs underline">إغلاق المعاينة</button><iframe src={preview} title="معاينة التذكرة الإلكترونية" className="h-[430px] w-full rounded-xl border bg-white"/></div>}
  {error&&<p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-800">{error}</p>}
 </section>;
}
