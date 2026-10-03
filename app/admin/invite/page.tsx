"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export default function AdminInvitePage(){
 const [token,setToken]=useState("");
 useEffect(()=>{setToken(new URLSearchParams(window.location.search).get("token")||"");},[]);
 const [password,setPassword]=useState("");
 const [confirm,setConfirm]=useState("");
 const [loading,setLoading]=useState(false);
 const [message,setMessage]=useState("");
 const [success,setSuccess]=useState(false);

 async function submit(e:FormEvent){
  e.preventDefault(); setMessage("");
  if(!token){setMessage("رابط الدعوة غير صالح.");return;}
  if(password!==confirm){setMessage("كلمتا المرور غير متطابقتين.");return;}
  setLoading(true);
  try{
   const r=await fetch("/api/admin/users/invite/accept",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,password})});
   const d=await r.json(); setMessage(d.message||"تعذر تفعيل الحساب."); setSuccess(Boolean(r.ok&&d.success));
  }catch{setMessage("تعذر الاتصال بالخادم.");}
  finally{setLoading(false);}
 }

 return <main dir="rtl" className="min-h-screen bg-[#FBF8F0] px-5 py-14 text-[#123F38]">
  <div className="mx-auto max-w-md rounded-[30px] border border-[#D8C79D]/55 bg-white/90 p-8 shadow-[0_24px_70px_rgba(72,55,22,.12)]">
   <div className="mb-8 text-center">
    <div className="mb-3 text-[11px] font-black tracking-[.28em] text-[#B88918]">AREES LOOP · ADMIN ACCESS</div>
    <h1 className="text-2xl font-black">تفعيل حساب الإدارة</h1>
    <p className="mt-2 text-sm text-black/50">أنشئ كلمة المرور الخاصة بحسابك لإكمال التفعيل.</p>
   </div>
   {success?<div className="text-center">
    <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-sm font-bold text-emerald-800">{message}</div>
    <Link href="/admin/login" className="arees-primary-action mt-6 inline-flex rounded-xl bg-[#C99A19] px-6 py-3 text-sm font-black text-[#103F38]">الدخول إلى لوحة الإدارة</Link>
   </div>:<form onSubmit={submit} className="space-y-4">
    <label className="block text-sm font-bold">كلمة المرور
     <input type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-[#D8C79D]/60 bg-white px-4 py-3 outline-none focus:border-[#B88918]" placeholder="8 أحرف على الأقل، حروف وأرقام" required/>
    </label>
    <label className="block text-sm font-bold">تأكيد كلمة المرور
     <input type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="mt-2 w-full rounded-xl border border-[#D8C79D]/60 bg-white px-4 py-3 outline-none focus:border-[#B88918]" required/>
    </label>
    {message&&<div className="rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{message}</div>}
    <button disabled={loading||!token} className="arees-primary-action w-full rounded-xl bg-[#C99A19] px-5 py-3 font-black text-[#103F38] disabled:cursor-not-allowed disabled:opacity-50">{loading?"جاري التفعيل...":"تفعيل الحساب"}</button>
   </form>}
  </div>
 </main>;
}
