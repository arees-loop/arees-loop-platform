"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CustomerLoginModal() {
  const [nextPath, setNextPath] = useState<string | null>(null);
  useEffect(() => {
    const handle = (event: Event) => {
      const path = (event as CustomEvent<{ nextPath?: string }>).detail?.nextPath;
      setNextPath(path?.startsWith("/") && !path.startsWith("//") ? path : "/");
    };
    window.addEventListener("arees:login-required", handle);
    return () => window.removeEventListener("arees:login-required", handle);
  }, []);
  useEffect(() => {
    if (!nextPath) return;
    const keyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setNextPath(null); };
    window.addEventListener("keydown", keyDown);
    return () => window.removeEventListener("keydown", keyDown);
  }, [nextPath]);
  if (!nextPath) return null;
  return <div role="presentation" className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#001D19]/65 p-5 backdrop-blur-sm" onMouseDown={event => {if(event.target===event.currentTarget)setNextPath(null);}}>
    <section dir="rtl" role="dialog" aria-modal="true" aria-labelledby="arees-login-title" className="w-full max-w-md rounded-3xl border border-[#D4AF37]/50 bg-[#FFF9E9] p-7 text-[#0D3B34] shadow-2xl">
      <button type="button" autoFocus onClick={()=>setNextPath(null)} aria-label="إغلاق" className="float-left rounded-lg border px-3 py-1">✕</button>
      <h2 id="arees-login-title" className="text-xl font-black">🔐 تسجيل الدخول لإكمال الطلب</h2>
      <p className="mt-4 text-sm leading-7">تقدر تتصفح المنصة وتشوف التفاصيل بدون حساب. التسجيل مطلوب فقط لإضافة الخدمة للسلة أو إرسال الطلب أو السداد.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={"/login?next="+encodeURIComponent(nextPath)} className="rounded-xl bg-[#0D3B34] px-5 py-3 text-sm font-black text-white">تسجيل الدخول</Link>
        <Link href={"/onboarding?mode=new&next="+encodeURIComponent(nextPath)} className="rounded-xl border border-[#D4AF37] bg-white px-5 py-3 text-sm font-bold">إنشاء حساب</Link>
      </div>
    </section>
  </div>;
}
