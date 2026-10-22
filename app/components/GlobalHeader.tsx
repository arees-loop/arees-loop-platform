"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type MouseEvent as ReactMouseEvent } from "react";
import PartnerIcon from "./PartnerIcon";

type HeaderUser = { firstName?: string | null; lastName?: string | null; profileImageUrl?: string | null };

export default function GlobalHeader() {
  function goToAirSea(event:ReactMouseEvent<HTMLAnchorElement>) {
    setMobileNavOpen(false);
    // Keep a real href for navigation from other pages, and scroll explicitly
    // for home-page clicks where Next's same-route hash navigation can be inert.
    if(window.location.pathname!=="/")return;
    const target=document.getElementById("travel-bookings");
    if(!target)return;
    event.preventDefault();
    document.body.style.overflowY="auto";
    window.history.replaceState(null,"", "/#travel-bookings");
    target.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
  }
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
    <header className="relative sticky top-0 z-[100] w-full border-b border-[#EAD18B]/70 bg-[linear-gradient(115deg,rgba(255,252,237,0.48),rgba(233,201,130,0.24)_48%,rgba(255,255,255,0.36))] px-4 shadow-[inset_0_2px_1px_rgba(255,255,255,0.85),inset_0_-2px_1px_rgba(170,125,40,0.22),0_8px_26px_rgba(55,37,10,0.15)] backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-inset ring-white/60 md:px-8">
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
              <Link href="/discover?type=cruise" className="block rounded-xl px-4 py-2.5 font-bold text-[#0D3B34] transition hover:bg-white/35">الكروز</Link>
            </div>
          </div>}
          {navVisible.guides !== false && (<Link href="/#tour-guides" className="transition hover:text-[#D4AF37]">المرشدون السياحيون</Link>)}
          {/* Approved navigation: air/sea has its own landing-section anchor. */}
          {navVisible.flights !== false && <a href="/#travel-bookings" onClick={goToAirSea} className="transition hover:text-[#D4AF37]">الطيران والبواخر</a>}
          <div className="group relative">
            <button type="button" className="flex items-center gap-1 py-6 font-bold transition hover:text-[#D4AF37]">
              خدمات السفر <span className="inline-block text-[10px] transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180">⌄</span>
            </button>
            <div className="invisible absolute right-1/2 top-[64px] z-50 w-56 translate-x-1/2 translate-y-2 rounded-[22px] border border-[#D4AF37]/55 bg-white/95 p-2 text-right opacity-0 shadow-[0_18px_48px_rgba(13,59,52,.18)] backdrop-blur-xl transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              {navVisible.hotels !== false && <Link href="/hotels" className="block rounded-xl px-4 py-2.5 font-bold text-[#0D3B34] transition hover:bg-[#FFF7DF]"><span aria-hidden="true" className="text-[#0B4537]">▦</span> الفنادق</Link>}
              <Link href="/visas" className="block rounded-xl px-4 py-2.5 font-bold text-[#0D3B34] transition hover:bg-[#FFF7DF]"><span aria-hidden="true" className="text-[#0B4537]">▣</span> التأشيرات</Link>
              <Link href="/international-driving-license" className="block rounded-xl px-4 py-2.5 font-bold text-[#0D3B34] transition hover:bg-[#FFF7DF]">🚘 رخصة القيادة الدولية</Link>
            </div>
          </div>
          {navVisible.partners !== false && (
            <div className="group relative">
              <Link href="/partner/select-type" className="inline-flex items-center gap-1.5 py-6 transition hover:text-[#B58C31] focus-visible:text-[#B58C31]" aria-label="للشركاء: خيارات الانضمام وتسجيل الدخول">
                <PartnerIcon kind="handshake" className="h-[19px] w-[19px] text-[#B58C31]" />
                للشركاء <span className="text-xs transition group-hover:rotate-180 group-focus-within:rotate-180" aria-hidden="true">⌄</span>
              </Link>
              <div className="invisible absolute right-0 top-[62px] z-50 w-64 translate-y-2 rounded-[22px] border border-[#D4AF37]/45 bg-white/95 p-2 text-right opacity-0 shadow-[0_18px_48px_rgba(13,59,52,.18)] backdrop-blur-xl transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <Link href="/partner/select-type" className="flex items-center gap-3 rounded-[14px] px-3 py-3 text-[#0D3B34] transition hover:bg-[#FFF7DF]">
                  <PartnerIcon kind="handshake" className="h-6 w-6 shrink-0 text-[#B58C31]" /> انضم كشريك
                </Link>
                <Link href="/partner/government" className="flex items-center gap-3 rounded-[14px] px-3 py-3 text-[#0D3B34] transition hover:bg-[#FFF7DF]">
                  <PartnerIcon kind="government" className="h-6 w-6 shrink-0 text-[#B58C31]" /> الجهات الحكومية
                </Link>
                <Link href="/partner/login" className="flex items-center gap-3 rounded-[14px] px-3 py-3 text-[#0D3B34] transition hover:bg-[#FFF7DF]">
                  <PartnerIcon kind="login" className="h-6 w-6 shrink-0 text-[#B58C31]" /> تسجيل دخول الشركاء
                </Link>
              </div>
            </div>
          )}
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
              <div className="relative" >
                <button type="button" onClick={() => setAccountOpen((value) => !value)} onKeyDown={(event) => { if (event.key === "Escape") setAccountOpen(false); }} aria-expanded={accountOpen} aria-haspopup="menu" className="flex h-11 items-center gap-2 rounded-full bg-[#0D3B34] px-4 text-xs font-black text-white shadow-[0_8px_22px_rgba(13,59,52,0.22)] transition hover:bg-[#145347]">
                  {user.profileImageUrl && <img src={user.profileImageUrl} alt="صورتي" className="h-8 w-8 rounded-full border border-white/25 object-cover" />}
                  <span className="max-w-[76px] truncate sm:max-w-none">مرحباً، {displayName}</span>
                  <span className={`text-[#D4AF37] transition-transform ${accountOpen ? "rotate-180" : ""}`}>⌄</span>
                </button>
                {accountOpen && (
                  <div dir="rtl" className="absolute left-0 top-full w-52 overflow-hidden rounded-[18px] border border-[#D4AF37]/35 bg-white/95 p-2 text-right shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                    <Link href="/notifications" onClick={() => setAccountOpen(false)} className="block rounded-xl px-4 py-2.5 text-xs font-bold text-[#0D3B34] hover:bg-[#F4EFE2]">الإشعارات</Link>
                    <Link href="/my-requests" onClick={() => setAccountOpen(false)} className="block rounded-xl px-4 py-2.5 text-xs font-bold text-[#0D3B34] hover:bg-[#F4EFE2]">طلباتي</Link>
                    <Link href="/bookings" onClick={() => setAccountOpen(false)} className="block rounded-xl px-4 py-2.5 text-xs font-bold text-[#0D3B34] hover:bg-[#F4EFE2]">حجوزاتي</Link>
                    <Link href="/favorites" onClick={() => setAccountOpen(false)} className="block rounded-xl px-4 py-2.5 text-xs font-bold text-[#0D3B34] hover:bg-[#F4EFE2]">الاهتمامات</Link>
                    <Link href="/rewards" onClick={() => setAccountOpen(false)} className="block rounded-xl px-4 py-2.5 text-xs font-bold text-[#0D3B34] hover:bg-[#F4EFE2]">المكافآت والنقاط</Link>
                    <Link href="/cart" onClick={() => setAccountOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold text-[#0D3B34] hover:bg-[#F4EFE2]"><span>السلة</span>{cartCount > 0 && <span className="rounded-full bg-[#D4AF37] px-2 py-0.5 text-[10px] font-black text-[#0D3B34]">{cartCount}</span>}</Link>
                    <Link href="/profile" onClick={() => setAccountOpen(false)} className="block rounded-xl px-4 py-2.5 text-xs font-bold text-[#0D3B34] hover:bg-[#F4EFE2]">حسابي وإعداداتي</Link>
                    <div className="my-1 h-px bg-[#0D3B34]/10" />
                    <button type="button" onClick={logout} className="block w-full rounded-xl px-4 py-2.5 text-right text-xs font-bold text-red-700 hover:bg-red-50">تسجيل الخروج</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className={`hidden rounded-full border px-4 py-2.5 text-xs font-bold sm:inline-flex ${border} ${text}`}>تسجيل الدخول</Link>
              <Link href="/login" className="rounded-full bg-[#0D3B34]/95 px-4 py-2.5 text-xs font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#145347] md:px-5">ابدأ التجربة</Link>
            </>
          )}
        </div>
      </nav>
      {mobileNavOpen && (
        <nav id="arees-mobile-navigation" aria-label="التنقل الرئيسي" dir="rtl" className="absolute inset-x-0 top-full z-[110] border-t border-[#0D3B34]/10 bg-[#F7F4EA]/[0.98] px-4 pb-4 pt-3 shadow-[0_18px_35px_rgba(13,59,52,.16)] backdrop-blur-xl lg:hidden">
          <div className="mx-auto grid max-w-xl grid-cols-2 gap-2 text-right text-sm font-bold text-[#0D3B34]">
            {navVisible.discover !== false && <Link href="/discover" onClick={() => setMobileNavOpen(false)} className="rounded-xl px-3 py-3 hover:bg-[#D4AF37]/15">اكتشف التجارب</Link>}
            {navVisible.programs !== false && (
              <section className="col-span-2">
                <button type="button" aria-expanded={mobileProgramsOpen} aria-controls="arees-mobile-program-links" onClick={() => setMobileProgramsOpen(value => !value)} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-right hover:bg-[#D4AF37]/15">
                  <span>برامج سياحية</span><span aria-hidden="true">{mobileProgramsOpen ? "−" : "+"}</span>
                </button>
                {mobileProgramsOpen && <div id="arees-mobile-program-links" className="grid grid-cols-2 gap-1 pr-3">
                  <Link href="/discover?type=domestic" onClick={() => setMobileNavOpen(false)} className="rounded-xl bg-white/60 px-3 py-3">سياحة محلية</Link>
                  <Link href="/discover?type=international" onClick={() => setMobileNavOpen(false)} className="rounded-xl bg-white/60 px-3 py-3">سياحة عالمية</Link>
                  <Link href="/discover?type=cruise" onClick={() => setMobileNavOpen(false)} className="rounded-xl bg-white/60 px-3 py-3">الكروز</Link>
                </div>}
              </section>
            )}
            {/* Mobile navigation mirrors the approved desktop IA. */}
            {navVisible.flights !== false && <a href="/#travel-bookings" onClick={goToAirSea} className="col-span-2 rounded-xl px-3 py-3 hover:bg-[#D4AF37]/15">الطيران والبواخر</a>}
            <section className="col-span-2">
              <button type="button" aria-expanded={mobileTravelServicesOpen} aria-controls="arees-mobile-travel-links" onClick={() => setMobileTravelServicesOpen(value => !value)} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-right hover:bg-[#D4AF37]/15">
                <span>خدمات السفر</span><span aria-hidden="true">{mobileTravelServicesOpen ? "−" : "+"}</span>
              </button>
              {mobileTravelServicesOpen && <div id="arees-mobile-travel-links" className="grid grid-cols-2 gap-1 pr-3">
                {navVisible.hotels !== false && <Link href="/hotels" onClick={() => setMobileNavOpen(false)} className="rounded-xl bg-white/60 px-3 py-3"><span aria-hidden="true" className="text-[#0B4537]">▦</span> الفنادق</Link>}
                <Link href="/visas" onClick={() => setMobileNavOpen(false)} className="rounded-xl bg-white/60 px-3 py-3"><span aria-hidden="true" className="text-[#0B4537]">▣</span> التأشيرات</Link>
                <Link href="/international-driving-license" onClick={() => setMobileNavOpen(false)} className="rounded-xl bg-white/60 px-3 py-3">🚘 رخصة القيادة الدولية</Link>
              </div>}
            </section>
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
