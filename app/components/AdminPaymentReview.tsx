"use client";
import {useEffect,useState} from "react";
type E={action:string;createdAt:string;details?:{fileId?:string}};
export default function AdminPaymentReview({reference}:{reference:string}){
 const [events,setEvents]=useState<E[]>([]),[busy,setBusy]=useState(false),[notice,setNotice]=useState("");
 const load=async()=>{const r=await fetch("/api/customer/request-payment?reference="+encodeURIComponent(reference),{cache:"no-store"});if(r.ok){const d=await r.json();setEvents(d.events||[])}};
 useEffect(()=>{void load()},[reference]);
 const accepted=events.some(e=>e.action==="CUSTOMER_OFFER_ACCEPTED");
 const last=events.find(e=>["CUSTOMER_TRANSFER_SUBMITTED","ADMIN_PAYMENT_VERIFIED","ADMIN_PAYMENT_REJECTED"].includes(e.action));
 const pending=last?.action==="CUSTOMER_TRANSFER_SUBMITTED";
 async function decide(action:"VERIFY_TRANSFER"|"REJECT_TRANSFER"){if(action==="VERIFY_TRANSFER"&&!window.confirm("هل تأكدت فعلياً من وصول المبلغ إلى كشف الحساب البنكي الرسمي ومطابقته مع الطلب؟"))return;setBusy(true);try{const r=await fetch("/api/customer/request-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reference,action,confirmed:action==="VERIFY_TRANSFER"})});const d=await r.json();setNotice(d.success?action==="VERIFY_TRANSFER"?"تم اعتماد السداد بعد التأكيد البنكي.":"تم رفض الإيصال.":d.message);await load()}catch{setNotice("تعذر تنفيذ الإجراء")}finally{setBusy(false)}}
 return <section className="mt-4 rounded-xl border border-[#D4AF37]/35 bg-[#FFFAEF] p-4"><h3 className="font-black">القبول وإثبات التحويل</h3><p className="mt-2 text-xs">قبول العرض: {accepted?"تم":"بانتظار العميل"}</p>{pending&&<><p className="mt-2 text-xs font-bold">إيصال تحويل بانتظار مراجعة كشف الحساب.</p><a className="mt-2 block text-xs underline" href={"/api/customer/request-attachments?reference="+encodeURIComponent(reference)+"&file="+encodeURIComponent(String(last?.details?.fileId||""))}>تنزيل الإيصال الخاص</a><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={()=>void decide("VERIFY_TRANSFER")} className="rounded-lg bg-[#0D3B34] px-4 py-2 text-xs text-white">تأكيد وصول المبلغ</button><button type="button" disabled={busy} onClick={()=>void decide("REJECT_TRANSFER")} className="rounded-lg border px-4 py-2 text-xs">رفض الإيصال</button></div></>}{last?.action==="ADMIN_PAYMENT_VERIFIED"&&<p className="mt-2 text-xs font-bold text-green-800">تم اعتماد السداد</p>}{notice&&<p role="status" className="mt-2 text-xs">{notice}</p>}</section>;
}
