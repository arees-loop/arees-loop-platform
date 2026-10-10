"use client";
import {useState} from "react";
import {useSearchParams} from "next/navigation";

export default function InvitationAcceptance(){
 const params=useSearchParams();
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [success,setSuccess]=useState(false);
 const accept=async()=>{
  const token=params.get("token");
  if(!token){setMessage("رابط الدعوة غير مكتمل.");return;}
  setBusy(true);setMessage("");
  try{
   const response=await fetch("/api/partner/team/invitations/accept",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({token})});
   const data=await response.json();
   setSuccess(response.ok&&data.success);
   setMessage(data.message||"تعذر قبول الدعوة.");
  }catch{setMessage("تعذر الاتصال بالخادم. حاول مرة أخرى.");}
  finally{setBusy(false);}
 };
 return <main dir="rtl" className="min-h-screen bg-[#F7F4EA] px-5 py-16 text-[#0D3B34]"><section className="mx-auto max-w-lg rounded-3xl bg-white p-8 shadow-sm"><p className="font-bold text-[#B99124]">AREES LOOP</p><h1 className="mt-4 text-2xl font-bold">قبول دعوة فريق العمل</h1><p className="mt-3 text-sm leading-7">سجل الدخول أولاً بالحساب الذي وصله البريد، وتأكد من توثيق بريدك الإلكتروني قبل قبول الدعوة.</p><button type="button" onClick={accept} disabled={busy||success} className="mt-6 rounded-xl bg-[#0D3B34] px-6 py-3 text-white disabled:opacity-50">{busy?"جاري التحقق...":success?"تم القبول":"قبول الدعوة"}</button>{message&&<p role="status" className="mt-4 text-sm">{message}</p>}</section></main>;
}
