"use client";
import Link from "next/link";
import {useEffect,useState,type ReactNode} from "react";

export const CUSTOMER_LOGIN_REQUIRED="يرجى تسجيل الدخول أو إنشاء حساب قبل إرسال الطلب أو الإضافة للسلة أو السداد.";

export default function CustomerActionGate({
 children,nextPath,action="متابعة الطلب"
}:{children:ReactNode;nextPath:string;action?:string}){
 const [authorized,setAuthorized]=useState<boolean|null>(null);
 const [unavailable,setUnavailable]=useState(false);
 useEffect(()=>{
  let active=true;
  const controller=new AbortController();
  void fetch("/api/auth/me",{cache:"no-store",credentials:"include",signal:controller.signal})
   .then(async res=>{
    if(res.status===401)return false;
    if(!res.ok)throw new Error("AUTH_UNAVAILABLE");
    const data=await res.json();
    return Boolean(data?.data?.user);
   })
   .then(yes=>{if(active){setAuthorized(yes);setUnavailable(false);}})
   .catch(()=>{if(active&&!controller.signal.aborted){setAuthorized(false);setUnavailable(true);}});
  return()=>{active=false;controller.abort();};
 },[]);
 if(authorized===null)return <div role="status" className="rounded-2xl border border-[#D4AF37]/30 bg-white p-5 text-sm text-[#0D3B34]">جارٍ التحقق من تسجيل الدخول...</div>;
 if(!authorized){
  const path=nextPath.startsWith("/")&&!nextPath.startsWith("//")?nextPath:"/";
  const target="/login?next="+encodeURIComponent(path);
  return <section dir="rtl" className="rounded-2xl border border-[#D4AF37]/40 bg-[#FFF9E9] p-6 text-[#0D3B34]" aria-label="تسجيل الدخول مطلوب">
   <h2 className="text-lg font-black">🔐 تسجيل الدخول مطلوب</h2>
   <p className="mt-3 text-sm leading-7">{unavailable?"تعذر التحقق من جلستك حالياً. أعد المحاولة بعد التأكد من الاتصال، أو سجّل دخولك.":CUSTOMER_LOGIN_REQUIRED}</p>
   <p className="mt-1 text-xs text-[#0D3B34]/65">يمكنك تصفح العروض دون حساب. بعد تسجيل الدخول ستعود إلى هذه الصفحة لإكمال {action}.</p>
   <div className="mt-5 flex flex-wrap gap-3">
    <Link href={target} className="rounded-xl bg-[#0D3B34] px-5 py-3 text-sm font-black text-white">تسجيل الدخول</Link>
    <Link href={"/register?next="+encodeURIComponent(path)} className="rounded-xl border border-[#D4AF37]/50 bg-white px-5 py-3 text-sm font-bold">إنشاء حساب</Link>
   </div>
  </section>;
 }
 return <>{children}</>;
}
