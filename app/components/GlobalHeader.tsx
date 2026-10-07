"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function GlobalHeader({ overlay = false }: { overlay?: boolean }) {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const text = overlay ? "text-white" : "text-[#0D3B34]";
  const border = overlay ? "border-white/35" : "border-[#0D3B34]/15";
  const glass = overlay ? "bg-white/[0.075]" : "bg-white/72";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-2 z-[100] px-4 md:px-8">
      <nav className={`pointer-events-auto mx-auto flex h-[76px] max-w-[1450px] items-center justify-between gap-3 rounded-[24px] border ${border} ${glass} px-4 shadow-[0_12px_34px_rgba(0,0,0,0.13),inset_0_1px_0_rgba(255,255,255,0.58)] backdrop-blur-xl backdrop-saturate-150 md:h-[82px] md:px-6`}>
        <Link href="/" aria-label="Arees Loop">
          <Image src="/Logo/arees-loop-logo.png" alt="Arees Loop" width={240} height={120} priority className="h-auto w-[132px] md:w-[154px]" />
        </Link>

        <div dir="rtl" className={`hidden items-center gap-5 text-[13px] font-bold lg:flex xl:gap-7 ${text}`}>
          <Link href="/#discover" className="transition hover:text-[#D4AF37]">اكتشف</Link>
          <Link href="/#how" className="transition hover:text-[#D4AF37]">كيف تعمل؟</Link>
          <div className="group relative">
            <button type="button" className="flex items-center gap-1 py-6 font-bold transition hover:text-[#D4AF37]">برامج سياحية <span className="text-[10px]">⌄</span></button>
            <div className="invisible absolute right-1/2 top-[64px] w-52 translate-x-1/2 translate-y-2 rounded-[22px] border border-[#D4AF37]/55 bg-white/[0.10] p-2 text-right opacity-0 shadow-[0_18px_55px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.30)] backdrop-blur-2xl backdrop-saturate-150 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <Link href="/discover?type=domestic" className="block rounded-xl px-4 py-2.5 font-bold text-[#0D3B34] transition hover:bg-white/35 hover:text-[#0D3B34] hover:drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]">سياحة داخلية</Link>
              <Link href="/discover?type=international" className="block rounded-xl px-4 py-2.5 font-bold text-[#0D3B34] transition hover:bg-white/35 hover:text-[#0D3B34] hover:drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]">سياحة دولية</Link>
              <Link href="/discover?type=packages" className="block rounded-xl px-4 py-2.5 font-bold text-[#0D3B34] transition hover:bg-white/35 hover:text-[#0D3B34] hover:drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]">باقات سياحية</Link>
              <Link href="/discover?type=private" className="block rounded-xl px-4 py-2.5 font-bold text-[#0D3B34] transition hover:bg-white/35 hover:text-[#0D3B34] hover:drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]">برامج خاصة</Link>
            </div>
          </div>
          <Link href="/#experiences" className="transition hover:text-[#D4AF37]">التجارب</Link>
          <Link href="/discover?type=hotels" className="transition hover:text-[#D4AF37]">الفنادق</Link>
          <Link href="/discover?type=flights" className="transition hover:text-[#D4AF37]">الطيران</Link>
          <Link href="/discover?type=cruise" className="transition hover:text-[#D4AF37]">الكروز</Link>
          <Link href="/#partners" className="transition hover:text-[#D4AF37]">للشركاء</Link>
        </div>

        <div className="flex items-center gap-2">
          <div className={`hidden rounded-full border p-1 text-[10px] font-black sm:flex ${border} ${text}`}>
            <button type="button" onClick={() => setLanguage("ar")} className={`rounded-full px-2.5 py-1.5 ${language === "ar" ? "bg-[#0D3B34] text-white" : ""}`}>AR</button>
            <button type="button" onClick={() => setLanguage("en")} className={`rounded-full px-2.5 py-1.5 ${language === "en" ? "bg-[#0D3B34] text-white" : ""}`}>EN</button>
          </div>
          <Link href="/login" className={`hidden rounded-full border px-4 py-2.5 text-xs font-bold sm:inline-flex ${border} ${text}`}>تسجيل الدخول</Link>
          <Link href="/auth" className="rounded-full bg-[#0D3B34]/95 px-4 py-2.5 text-xs font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#145347] md:px-5">ابدأ التجربة</Link>
        </div>
      </nav>
    </header>
  );
}
