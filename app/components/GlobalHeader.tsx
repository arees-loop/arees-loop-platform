"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type HeaderUser = { firstName?: string | null; lastName?: string | null };

export default function GlobalHeader({ overlay = false }: { overlay?: boolean }) {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartCount] = useState(0);
  const text = "text-[#0D3B34]";
  const border = overlay ? "border-white/35" : "border-[#0D3B34]/15";
  const glass = "bg-white/90";

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => response.ok ? (await response.json())?.data?.user ?? null : null)
      .then((nextUser) => { if (active) setUser(nextUser); })
      .catch(() => { if (active) setUser(null); });
    return () => { active = false; };
  }, []);

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "حسابي";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    window.location.href = "/";
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-2 z-[100] px-4 md:px-8">
      <nav className={`pointer-events-auto mx-auto flex h-[76px] max-w-[1450px] items-center justify-between gap-3 rounded-[24px] border ${border} ${glass} px-4 shadow-[0_12px_34px_rgba(0,0,0,0.13),inset_0_1px_0_rgba(255,255,255,0.58)] backdrop-blur-xl backdrop-saturate-150 md:h-[82px] md:px-6`}>
        <Link href="/" aria-label="Arees Loop">
          <Image src="/Logo/arees-loop-logo.png" alt="Arees Loop" width={240} height={120} priority className="h-auto w-[132px] md:w-[154px]" />
        </Link>

        <div dir="rtl" className={`hidden items-center gap-5 text-[13px] font-bold lg:flex xl:gap-7 ${text}`}>
          <Link href="/discover" className="transition hover:text-[#D4AF37]">اكتشف</Link>
          <Link href="/#how" className="transition hover:text-[#D4AF37]">كيف تعمل؟</Link>
          <div className="group relative">
            <button type="button" className="flex items-center gap-1 py-6 font-bold transition hover:text-[#D4AF37]">برامج سياحية <span className="text-[10px]">⌄</span></button>
            <div className="invisible absolute right-1/2 top-[64px] w-52 translate-x-1/2 translate-y-2 rounded-[22px] border border-[#D4AF37]/55 bg-white/[0.10] p-2 text-right opacity-0 shadow-[0_18px_55px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.30)] backdrop-blur-2xl backdrop-saturate-150 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <Link href="/discover?type=domestic" className="block rounded-xl px-4 py-2.5 font-bold text-[#0D3B34] transition hover:bg-white/35">سياحة محلية</Link>
              <Link href="/discover?type=international" className="block rounded-xl px-4 py-2.5 font-bold text-[#0D3B34] transition hover:bg-white/35">سياحة عالمية</Link>
            </div>
          </div>
          <Link href="/discover?type=experiences" className="transition hover:text-[#D4AF37]">التجارب</Link>
          <Link href="/guides" className="transition hover:text-[#D4AF37]">المرشدون السياحيون</Link>
          <Link href="/hotels" className="transition hover:text-[#D4AF37]">الفنادق</Link>
          <Link href="/flights" className="transition hover:text-[#D4AF37]">الطيران</Link>
          <Link href="/discover?type=cruise" className="transition hover:text-[#D4AF37]">الكروز</Link>
          <Link href="/#partners" className="transition hover:text-[#D4AF37]">للشركاء</Link>
        </div>

        <div className="flex items-center gap-2">
          <div className={`hidden rounded-full border p-1 text-[10px] font-black sm:flex ${border} ${text}`}>
            <button type="button" onClick={() => setLanguage("ar")} className={`rounded-full px-2.5 py-1.5 ${language === "ar" ? "bg-[#0D3B34] text-white" : ""}`}>AR</button>
            <button type="button" onClick={() => setLanguage("en")} className={`rounded-full px-2.5 py-1.5 ${language === "en" ? "bg-[#0D3B34] text-white" : ""}`}>EN</button>
          </div>

          {user ? (
            <>
              <Link href="/cart" aria-label="السلة" className="relative grid h-11 w-11 place-items-center rounded-full bg-[#0D3B34] text-white shadow-[0_8px_22px_rgba(13,59,52,0.28)] transition hover:-translate-y-0.5 hover:bg-[#145347]">
                <span className="text-[20px] leading-none">🛒</span>
                {cartCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-[#D4AF37] px-1 text-[10px] font-black text-[#0D3B34]">{cartCount > 99 ? "99+" : cartCount}</span>}
              </Link>
              <div className="relative">
                <button type="button" onClick={() => setAccountOpen((value) => !value)} className="flex h-11 items-center gap-2 rounded-full bg-[#0D3B34] px-4 text-xs font-black text-white shadow-[0_8px_22px_rgba(13,59,52,0.22)] transition hover:bg-[#145347]">
                  <span>مرحباً، {displayName}</span>
                  <span className={`text-[#D4AF37] transition-transform ${accountOpen ? "rotate-180" : ""}`}>⌄</span>
                </button>
                {accountOpen && (
                  <div dir="rtl" className="absolute left-0 top-[52px] w-52 overflow-hidden rounded-[18px] border border-[#D4AF37]/35 bg-white/95 p-2 text-right shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                    <Link href="/profile" className="block rounded-xl px-4 py-2.5 text-xs font-bold text-[#0D3B34] hover:bg-[#F4EFE2]">الملف الشخصي</Link>
                    <Link href="/bookings" className="block rounded-xl px-4 py-2.5 text-xs font-bold text-[#0D3B34] hover:bg-[#F4EFE2]">حجوزاتي</Link>
                    <Link href="/rewards" className="block rounded-xl px-4 py-2.5 text-xs font-bold text-[#0D3B34] hover:bg-[#F4EFE2]">نقاطي ومكافآتي</Link>
                    <div className="my-1 h-px bg-[#0D3B34]/10" />
                    <button type="button" onClick={logout} className="block w-full rounded-xl px-4 py-2.5 text-right text-xs font-bold text-red-700 hover:bg-red-50">تسجيل الخروج</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className={`hidden rounded-full border px-4 py-2.5 text-xs font-bold sm:inline-flex ${border} ${text}`}>تسجيل الدخول</Link>
              <Link href="/auth" className="rounded-full bg-[#0D3B34]/95 px-4 py-2.5 text-xs font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#145347] md:px-5">ابدأ التجربة</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
