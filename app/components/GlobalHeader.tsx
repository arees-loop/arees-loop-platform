"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type HeaderUser = { firstName?: string | null; lastName?: string | null; profileImageUrl?: string | null };

type MenuIconName="bell"|"orders"|"clock"|"heart"|"wallet"|"star"|"user"|"settings"|"logout";
function MenuIcon({name}:{name:MenuIconName}){
 const paths={
 bell:<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
 orders:<><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
 clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
 heart:<path d="M20.8 8.7c0 4.6-8.8 10.1-8.8 10.1S3.2 13.3 3.2 8.7a4.7 4.7 0 0 1 8.8-2.2 4.7 4.7 0 0 1 8.8 2.2Z"/>,
 wallet:<><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M6 6V4h12"/><path d="M16 15h2"/></>,
 star:<path d="m12 2 3 6.2 6.8 1-4.9 4.8 1.2 6.8L12 17.6l-6.1 3.2 1.2-6.8-4.9-4.8 6.8-1Z"/>,
 user:<><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7"/></>,
 settings:<><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9 7 7m10 10 2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></>,
 logout:<><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/><path d="M14 8l4 4-4 4m4-4H8"/></>
 };
 return <svg aria-hidden="true" viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function GlobalHeader({ overlay = false }: { overlay?: boolean }) {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => { if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setAccountOpen(false); };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", escape); };
  }, []);
  const [cartCount, setCartCount] = useState(0);
  const [unreadInterests, setUnreadInterests] = useState(0);
  const [navVisible, setNavVisible] = useState<Record<string,boolean>>({});
  useEffect(() => { let mounted=true; fetch("/api/navigation",{cache:"no-store"}).then(r=>r.json()).then(d=>{if(mounted&&d.success)setNavVisible(d.data)}).catch(()=>{});return()=>{mounted=false}; }, []);
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
  useEffect(() => {
    if (!user) { setUnreadInterests(0); return; }
    let active = true;
    const refresh = () => fetch("/api/account/interest-suggestions", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (active && data?.success) setUnreadInterests(data.unreadCount || 0); })
      .catch(() => {});
    void refresh();
    const onFocus = () => { void refresh(); };
    window.addEventListener("focus", onFocus);
    window.addEventListener("arees:interest-notifications-updated", onFocus);
    return () => { active = false; window.removeEventListener("focus", onFocus); window.removeEventListener("arees:interest-notifications-updated", onFocus); };
  }, [user]);
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
          {navVisible.discover !== false && (<Link href="/discover" className="transition hover:text-[#D4AF37]">اكتشف</Link>)}
          {navVisible.how !== false && (<Link href="/#how" className="transition hover:text-[#D4AF37]">كيف تعمل؟</Link>)}
          {navVisible.programs !== false && <div className="group relative">
            <button type="button" className="flex items-center gap-1 py-6 font-bold transition hover:text-[#D4AF37]">برامج سياحية <span className="inline-block text-[10px] transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180">⌄</span></button>
            <div className="invisible absolute right-1/2 top-[64px] w-52 translate-x-1/2 translate-y-2 rounded-[22px] border border-[#D4AF37]/55 bg-white/[0.10] p-2 text-right opacity-0 shadow-[0_18px_55px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.30)] backdrop-blur-2xl backdrop-saturate-150 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <Link href="/discover?type=domestic" className="block rounded-xl px-4 py-2.5 font-bold text-[#0D3B34] transition hover:bg-white/35">سياحة محلية</Link>
              <Link href="/discover?type=international" className="block rounded-xl px-4 py-2.5 font-bold text-[#0D3B34] transition hover:bg-white/35">سياحة عالمية</Link>
            </div>
          </div>}
          {navVisible.guides !== false && (<Link href="/guides" className="transition hover:text-[#D4AF37]">المرشدون السياحيون</Link>)}
          {navVisible.hotels !== false && (<Link href="/hotels" className="transition hover:text-[#D4AF37]">الفنادق</Link>)}
          {navVisible.flights !== false && (<Link href="/flights" className="transition hover:text-[#D4AF37]">الطيران</Link>)}
          {navVisible.cruise !== false && (<Link href="/discover?type=cruise" className="transition hover:text-[#D4AF37]">الكروز</Link>)}
          {navVisible.partners !== false && (<Link href="/#partners" className="transition hover:text-[#D4AF37]">للشركاء</Link>)}
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
              <Link href="/notifications" aria-label={`الإشعارات: ${unreadInterests} غير مقروءة`} className="relative grid h-11 w-11 place-items-center rounded-full border border-[#0D3B34]/15 bg-white text-[#0D3B34]"><span aria-hidden="true" className="text-xl"><MenuIcon name="bell"/></span>{unreadInterests>0&&<span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">{unreadInterests>99?"99+":unreadInterests}</span>}</Link>
              <div className="relative" ref={accountRef}>
                <button type="button" aria-expanded={accountOpen} aria-haspopup="menu" aria-label="فتح قائمة حسابي" onClick={() => setAccountOpen((value) => !value)} className="flex h-11 max-w-[140px] items-center gap-2 rounded-full bg-[#0D3B34] px-3 sm:max-w-none sm:px-4 text-xs font-black text-white shadow-[0_8px_22px_rgba(13,59,52,0.22)] transition hover:bg-[#145347]">
                  {user.profileImageUrl && <img src={user.profileImageUrl} alt="صورتي" className="h-8 w-8 rounded-full border border-white/25 object-cover" />}
                  <span className="hidden truncate sm:inline">مرحباً، {displayName}</span><span className="sm:hidden">حسابي</span>
                  <span className={`text-[#D4AF37] transition-transform ${accountOpen ? "rotate-180" : ""}`}>⌄</span>
                </button>
                {accountOpen && (
                  <div dir="rtl" role="menu" aria-label="قائمة حساب العميل" className="absolute right-0 top-full z-[120] mt-2 w-[260px] overflow-hidden rounded-[20px] border border-[#D4AF37]/30 bg-white p-2 text-right shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                    {([
                      {href:"/notifications",label:"الإشعارات",icon:"bell"},
                      {href:"/bookings",label:"الطلبات",icon:"orders"},
                      {href:"/bookings?payment=pending",label:"طلبات بانتظار الدفع",icon:"clock"},
                      {href:"/interests",label:"اهتماماتي",icon:"heart"},
                      {href:"/wallet",label:"محفظتي",icon:"wallet"},
                      {href:"/rewards",label:"نقاط الولاء",icon:"star"},
                      {href:"/profile",label:"حسابي",icon:"user"},
                      {href:"/account/settings",label:"الإعدادات",icon:"settings"},
                    ]).map(({href,label,icon})=><Link key={href} role="menuitem" href={href} onClick={()=>setAccountOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#0D3B34] transition hover:bg-[#F6F0E2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B99124]"><span aria-hidden="true" className="grid h-6 w-6 place-items-center text-lg font-normal text-[#B99124]"><MenuIcon name={icon as MenuIconName}/></span><span>{label}</span></Link>)}
                    <div className="my-1 h-px bg-[#0D3B34]/10"/>
                    <button role="menuitem" type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right text-sm font-semibold text-red-700 hover:bg-red-50"><span aria-hidden="true" className="grid h-6 w-6 place-items-center text-red-700"><MenuIcon name="logout"/></span><span>تسجيل الخروج</span></button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className={`hidden rounded-full border px-4 py-2.5 text-xs font-bold sm:inline-flex ${border} ${text}`}>تسجيل الدخول</Link>
              <Link href="/discover" className="rounded-full bg-[#0D3B34]/95 px-4 py-2.5 text-xs font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#145347] md:px-5">ابدأ التجربة</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
