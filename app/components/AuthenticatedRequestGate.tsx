"use client";
import {useEffect,useState,type ReactNode} from "react";
import Link from "next/link";
export default function AuthenticatedRequestGate({children}:{children:ReactNode}){
 const [state,setState]=useState<"loading"|"authorized"|"guest">("loading");
 useEffect(()=>{let active=true;fetch("/api/auth/me",{cache:"no-store"}).then(r=>{if(active)setState(r.ok?"authorized":"guest")}).catch(()=>{if(active)setState("guest")});return()=>{active=false}},[]);
 if(state==="authorized")return <>{children}</>;
 if(state==="loading")return <div role="status" className="rounded-2xl border border-[#D4AF37]/30 bg-white p-6 text-center text-sm text-[#0D3B34]">جارٍ التحقق من تسجيل الدخول...</div>;
 return <div className="rounded-2xl border border-[#D4AF37]/40 bg-white p-7 text-center text-[#0D3B34]"><h2 className="text-xl font-bold">سجّل الدخول أولاً لإرسال الطلب</h2><p className="mt-3 text-sm">بعد تسجيل الدخول ستعود لنفس الخدمة لإكمال بيانات الطلب ومتابعته من «طلباتي».</p><Link href={"/login?next="+encodeURIComponent(typeof window!=="undefined"?window.location.pathname+window.location.search:"/")} className="mt-5 inline-block rounded-xl bg-[#0D3B34] px-6 py-3 font-bold text-white">تسجيل الدخول أو إنشاء حساب</Link></div>;
}
