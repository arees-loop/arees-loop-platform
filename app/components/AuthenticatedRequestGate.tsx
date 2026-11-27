"use client";
import {useEffect,useRef,useState,type FormEvent,type ReactNode} from "react";
import Link from "next/link";

/** The request form is public. Authentication is required only at its final submission. */
export default function AuthenticatedRequestGate({children}:{children:ReactNode}){
 const authorized=useRef(false);
 const pending=useRef<HTMLFormElement|null>(null);
 const [open,setOpen]=useState(false);
 const [identifier,setIdentifier]=useState("");
 const [password,setPassword]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");

 useEffect(()=>{
  let active=true;
  const check=()=>fetch("/api/auth/me",{cache:"no-store",credentials:"include"})
   .then(r=>{if(active){authorized.current=r.ok;if(r.ok)setOpen(false);}})
   .catch(()=>{if(active)authorized.current=false;});
  void check();
  const reauthenticate=()=>{authorized.current=false;setError("");setOpen(true);};
  const refresh=()=>{if(document.visibilityState==="visible")void check();};
  window.addEventListener("arees-request-login",reauthenticate);
  document.addEventListener("visibilitychange",refresh);
  return()=>{active=false;window.removeEventListener("arees-request-login",reauthenticate);document.removeEventListener("visibilitychange",refresh);};
 },[]);

 function onSubmitCapture(event:FormEvent<HTMLDivElement>){
  if(authorized.current)return;
  const target=event.target;
  if(!(target instanceof HTMLFormElement))return;
  event.preventDefault();
  event.stopPropagation();
  pending.current=target;
  setError("");
  setOpen(true);
 }
 async function signIn(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(busy)return;
  setBusy(true);setError("");
  try{
   const response=await fetch("/api/auth/login",{
    method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({identifier:identifier.trim().toLowerCase(),password})
   });
   const data=await response.json().catch(()=>null);
   if(!response.ok||!data?.success){
    setError(data?.error==="RATE_LIMIT_EXCEEDED"?"تم تجاوز عدد المحاولات. حاول لاحقاً.":"تعذر تسجيل الدخول. راجع البريد الإلكتروني وكلمة المرور.");
    return;
   }
   authorized.current=true;
   setPassword("");setOpen(false);
   // Continue the already validated native form without losing React state or selected files.
   const form=pending.current;
   pending.current=null;
   if(form)window.setTimeout(()=>{if(form.isConnected)form.requestSubmit();},0);
  }catch{setError("تعذر الاتصال بالخدمة، حاول مجدداً.");}
  finally{setBusy(false);}
 }
 return <>
  <div onSubmitCapture={onSubmitCapture}>{children}</div>
  {open&&<div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#062921]/75 px-4 py-8" role="presentation">
   <section role="dialog" aria-modal="true" aria-labelledby="request-login-title" className="w-full max-w-md rounded-3xl border border-[#D4AF37]/35 bg-[#FFFCF4] p-6 text-[#0D3B34] shadow-2xl sm:p-8" dir="rtl">
    <h2 id="request-login-title" className="text-xl font-black">تسجيل الدخول لإرسال الطلب</h2>
    <p className="mt-2 text-sm leading-7">اكتملت بيانات طلبك. سجّل الدخول الآن لإرساله. ستبقى البيانات والملفات التي اخترتها محفوظة في هذه الصفحة.</p>
    <form className="mt-5 space-y-4" onSubmit={signIn}>
     <label className="block text-sm font-bold">البريد الإلكتروني
      <input type="email" autoComplete="username" required value={identifier} onChange={e=>setIdentifier(e.target.value)} className="mt-2 w-full rounded-xl border border-[#D4AF37]/40 bg-white px-4 py-3 outline-[#B69034]"/>
     </label>
     <label className="block text-sm font-bold">كلمة المرور
      <input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-[#D4AF37]/40 bg-white px-4 py-3 outline-[#B69034]"/>
     </label>
     {error&&<p role="alert" className="text-sm font-bold text-red-700">{error}</p>}
     <button type="submit" disabled={busy} className="w-full rounded-xl bg-[#0D3B34] px-5 py-3.5 font-bold text-white disabled:opacity-60">{busy?"جارٍ تسجيل الدخول...":"تسجيل الدخول وإرسال الطلب"}</button>
    </form>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
     <Link href="/onboarding?mode=new" target="_blank" rel="noopener noreferrer" className="font-bold underline">إنشاء حساب جديد في تبويب آخر</Link>
     <button type="button" onClick={()=>{setOpen(false);setPassword("");}} className="rounded-lg border border-[#D4AF37]/40 px-3 py-2 font-bold">العودة لتعديل الطلب</button>
    </div>
    <p className="mt-3 text-xs leading-6 text-[#0D3B34]/70">إذا أنشأت حساباً جديداً، ارجع لهذه الصفحة واضغط «إرسال طلب» مرة أخرى. لا تغلق الصفحة حتى لا تفقد البيانات.</p>
   </section>
  </div>}
 </>;
}
