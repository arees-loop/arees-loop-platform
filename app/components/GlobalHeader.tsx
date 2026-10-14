"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import PartnerIcon from "./PartnerIcon";

type HeaderUser = { firstName?: string | null; lastName?: string | null; profileImageUrl?: string | null };

export default function GlobalHeader() {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileProgramsOpen, setMobileProgramsOpen] = useState(false);
  const [mobileTravelServicesOpen, setMobileTravelServicesOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [navVisible, setNavVisible] = useState<Record<string,boolean>>({});
  useEffect(() => { let mounted=true; fetch("/api/navigation",{cache:"no-store"}).then(r=>r.json()).then(d=>{if(mounted&&d.success)setNavVisible(d.data)}).catch(()=>{});return()=>{mounted=false}; }, []);
  const text = "text-[#0D3B34]";
  const border = "border-[#0D3B34]/15";

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => response.ok ? (await response.json())?.data?.user ?? null : null)
      .then((nextUser) => { if (active) setUser(nextUser); })
      .catch(() => { if (active) setUser(null); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const onAvatar=(event:Event)=>{const url=(event as CustomEvent<{url:string}>).detail?.url;if(url)setUser(current=>current?{...current,profileImageUrl:url}:current)};
    window.addEventListener("arees:avatar-updated",onAvatar);
    return()=>window.removeEventListener("arees:avatar-updated",onAvatar);
  },[]);
  useEffect(() => {
    const syncCart = () => {
      try {
        const saved = JSON.parse(localStorage.getItem("arees-loop-cart-v1") || "[]");
        setCartCount(Array.isArray(saved) ? saved.reduce((n: number, item: {quantity?:number}) => n + (Number.isInteger(item.quantity) && Number(item.quantity)>0 ? Number(item.quantity) : 0), 0) : 0);
      } catch { setCartCount(0); }
    };
    syncCart();
    window.addEventListener("arees-cart-updated", syncCart);
    window.addEventListener("storage", syncCart);
    return () => { window.removeEventListener("arees-cart-updated", syncCart); window.removeEventListener("storage", syncCart); };
  }, []);
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "حسابي";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    window.location.href = "/";
  }

  return (
    <header className="relative sticky top-0 z-[100] w-full border-b border-[#0D3B34]/10 bg-[#F7F4EA] px-4 shadow-sm md:px-8">
      <nav className="mx-auto flex h-[76px] max-w-[1450px] items-center justify-between gap-3 px-0 md:h-[82px] md:px-6">
        <Link href="/" aria-label="Arees Loop">
          <Image src="/Logo/arees-loop-logo.png" alt="Arees Loop" width={240} height={120} priority className="h-auto w-[92px] sm:w-[120px] md:w-[154px]" />
        </Link>

        <button type="button" aria-label={mobileNavOpen ? "إغلاق قائمة التنقل" : "فتح قائمة التنقل"} aria-expanded={mobileNavOpen} aria-controls="arees-mobile-navigation" onClick={() => setMobileNavOpen(value => !value)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#0D3B34]/15 text-xl font-bold text-[#0D3B34] lg:hidden">{mobileNavOpen ? "×" : "☰"}</button>

        <div dir="rtl" className={`hidden items-center gap-5 text-[13px] font-bold lg:flex xl:gap-7 ${text}`}>
          {navVisible.discover !== false && (<Link href="/discover" className="transition hover:text-[#D4AF37]">اكتشف</Link>)}
          {navVisible.how !== false && (<Link href="/#how" className="transition hover:text-[#D4AF37]">كيف تعمل؟</Link>)}
          {navVisible.programs !== false && <div className="group relative">
            <button type="button" className="flex items-center gap-1 py-6 font-bold transition hover:text-[#D4AF37]">برامج سياحية <span className="inline-block text-[10px] transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180">⌄</span></button>
            <div className="invisible absolute right-1/2 top-[64px] w-52 translate-x-1/2 translate-y-2 rounded-[22px] border border-[#D4AF37]/55 bg-white/[0.10] p-2 text-right opacity-0 shadow-[0_18px_55px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.30)] backdrop-blur-2xl backdrop-saturate-150 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <Link href="/discover?type=domestic" className="block rounded-xl px-4 py-2.5 font-bold text-[#0D3B34] transition hover:bg-white/35">سياحة محلية</Link>
              <Link href="/discover?type=international" className="block rounded-xl px-4 py-2.5 font-bold text-[#0D3B34] transition hover:bg-white/35">سياحة عالمية</Link>
            </div>
          </div>}
          {navVisible.guides !== false && (<Link href="/#tour-guides" className="transition hover:text-[#D4AF37]">المرشدون السياحيون</Link>)}
          {(navVisible.hotels !== false || navVisible.flights !== false) && (
            <div className="group relative">
              <button type="button" className="flex items-center gap-1 py-6 font-bold transition hover:text-[#D4AF37]">
                خدمات السفر <span className="inline-block text-[10px] transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180">⌄</span>
              </button>
              <div className="invisible absolute right-1/2 top-[64px] z-50 w-56 translate-x-1/2 translate-y-2 rounded-[22px] border border-[#D4AF37]/55 bg-white/95 p-2 text-right opacity-0 shadow-[0_18px_48px_rgba(13,59,52,.18)] backdrop-blur-xl transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                {navVisible.flights !== false && <Link href="/flights" className="block rounded-xl px-4 py-2.5 font-bold text-[#0D3B34] transition hover:bg-[#FFF7DF]">✈ الطيران</Link>}
                {navVisible.flights !== false && <Link href="/ferries" className="block rounded-xl px-4 py-2.5 font-bold text-[#0D3B34] transition hover:bg-[#FFF7DF]">⚓ البواخر</Link>}
                {navVisible.programs !== false && (
              <section className="col-span-2">
                <button type="button" aria-expanded={mobileProgramsOpen} aria-controls="arees-mobile-program-links" onClick={() => setMobileProgramsOpen(value => !value)} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-right hover:bg-[#D4AF37]/15">
                  <span>برامج سياحية</span><span aria-hidden="true">{mobileProgramsOpen ? "−" : "+"}</span>
                </button>
                {mobileProgramsOpen && <div id="arees-mobile-program-links" className="grid grid-cols-2 gap-1 pr-3">
                  <Link href="/discover?type=domestic" onClick={() => setMobileNavOpen(false)} className="rounded-xl bg-white/60 px-3 py-3">سياحة محلية</Link>
                  <Link href="/discover?type=international" onClick={() => setMobileNavOpen(false)} className="rounded-xl bg-white/60 px-3 py-3">سياحة عالمية</Link>
                </div>}
              </section>
            )}
            {(navVisible.hotels !== false || navVisible.flights !== false) && (
              <section className="col-span-2">
                <button type="button" aria-expanded={mobileTravelServicesOpen} aria-controls="arees-mobile-travel-links" onClick={() => setMobileTravelServicesOpen(value => !value)} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-right hover:bg-[#D4AF37]/15">
                  <span>خدمات السفر</span><span aria-hidden="true">{mobileTravelServicesOpen ? "−" : "+"}</span>
                </button>
                {mobileTravelServicesOpen && <div id="arees-mobile-travel-links" className="grid grid-cols-2 gap-1 pr-3">
                  {navVisible.flights !== false && <Link href="/flights" onClick={() => setMobileNavOpen(false)} className="rounded-xl bg-white/60 px-3 py-3">✈ الطيران</Link>}
                  {navVisible.flights !== false && <Link href="/ferries" onClick={() => setMobileNavOpen(false)} className="rounded-xl bg-white/60 px-3 py-3">⚓ البواخر</Link>}
                  {navVisible.hotels !== false && <Link href="/hotels" onClick={() => setMobileNavOpen(false)} className="rounded-xl bg-white/60 px-3 py-3">الفنادق</Link>}
                  {navVisible.flights !== false && <Link href="/visas" onClick={() => setMobileNavOpen(false)} className="rounded-xl bg-white/60 px-3 py-3">🛂 التأشيرات</Link>}
                  {navVisible.flights !== false && <Link href="/international-driving-license" onClick={() => setMobileNavOpen(false)} className="rounded-xl bg-white/60 px-3 py-3">🚘 رخصة القيادة الدولية</Link>}
                </div>}
              </section>
            )}
            {navVisible.cruise !== false && <Link href="/discover?type=cruise" onClick={() => setMobileNavOpen(false)} className="rounded-xl px-3 py-3 hover:bg-[#D4AF37]/15">الكروز</Link>}
            {navVisible.programs !== false && <Link href="/discover?type=domestic" onClick={() => setMobileNavOpen(false)} className="rounded-xl px-3 py-3 hover:bg-[#D4AF37]/15">برامج سياحية</Link>}
            {navVisible.guides !== false && <Link href="/#tour-guides" onClick={() => setMobileNavOpen(false)} className="rounded-xl px-3 py-3 hover:bg-[#D4AF37]/15">المرشدون السياحيون</Link>}
            {navVisible.partners !== false && <Link href="/partner/select-type" onClick={() => setMobileNavOpen(false)} className="rounded-xl px-3 py-3 hover:bg-[#D4AF37]/15">انضم كشريك</Link>}
            {navVisible.partners !== false && <Link href="/partner/login" onClick={() => setMobileNavOpen(false)} className="rounded-xl px-3 py-3 hover:bg-[#D4AF37]/15">دخول الشركاء</Link>}
            {navVisible.partners !== false && <Link href="/partner/government" onClick={() => setMobileNavOpen(false)} className="rounded-xl px-3 py-3 hover:bg-[#D4AF37]/15">الجهات الحكومية</Link>}
            {user && <Link href="/bookings" onClick={() => setMobileNavOpen(false)} className="col-span-2 rounded-xl border-t border-[#0D3B34]/10 px-3 py-3 text-[#9A741D] hover:bg-[#D4AF37]/15">حجوزاتي وطلباتي</Link>}
          </div>
        </nav>
      )}
    </header>
  );
}
