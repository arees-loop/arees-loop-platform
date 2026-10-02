"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/admin/dashboard", label: "الرئيسية", icon: "⌂" },
  { href: "/admin/partners", label: "طلبات الشركاء", icon: "▣", badge: "1" },
  { href: "/admin/partners?view=active", label: "الشركاء المعتمدون", icon: "♧" },
  { href: "/admin/dashboard?section=users", label: "المستخدمون", icon: "♙" },
  { href: "/admin/dashboard?section=content", label: "المحتوى والتجارب", icon: "▤" },
  { href: "/admin/dashboard?section=bookings", label: "الحجوزات", icon: "▦" },
  { href: "/admin/dashboard?section=settlements", label: "المدفوعات والتسويات", icon: "▣" },
  { href: "/admin/dashboard?section=reports", label: "التقارير والإحصائيات", icon: "▥" },
  { href: "/admin/dashboard?section=settings", label: "إعدادات المنصة", icon: "⚙" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div dir="rtl" className="min-h-screen bg-[#FCFAF5] text-[#171717]" style={{fontFamily:"var(--font-ibm-plex-arabic), sans-serif"}}>
      <div className="flex min-h-screen flex-row">
        <aside className="hidden w-[265px] shrink-0 border-r border-white/65 bg-[#FFFDF8]/72 shadow-[10px_0_34px_rgba(91,70,32,.12)] backdrop-blur-xl lg:flex lg:flex-col">
          <div className="flex h-[108px] items-center justify-center border-b border-[#171717]/5">
            <Image src="/Logo/arees-loop-logo.png" alt="Arees Loop" width={120} height={65} className="h-[62px] w-auto object-contain" priority />
          </div>
          <nav className="flex-1 space-y-1 px-4 py-5">
            {nav.map((item) => {
              const base=item.href.split("?")[0];
              const active = pathname === base && !item.href.includes("?");
              return <Link key={item.label} href={item.href} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-semibold transition ${active?"bg-[#F5E5B8] text-[#171717]":"text-[#171717]/75 hover:bg-[#E9D39A]/55 hover:shadow-[0_6px_16px_rgba(170,125,25,.10)]"}`}>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg ${active?"bg-[#B68A21] text-white":"text-[#171717]"}`}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#D39B16] px-1.5 text-[12px] font-extrabold text-white shadow-[0_3px_8px_rgba(211,155,22,.28)] ring-1 ring-[#C68E0C]/20">{item.badge}</span>}
              </Link>
            })}
          </nav>
          <div className="mx-5 border-t border-[#171717]/10 py-5">
            <Link href="/" className="flex items-center gap-3 px-2 py-2 text-sm font-semibold text-[#171717]/65"><span className="text-xl">↗</span>عرض المنصة</Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-[90] border-b border-[#171717]/8 bg-[#FFFEFA]/92 backdrop-blur-xl">
            <div className="flex h-[78px] items-center justify-between px-5 md:px-8">
              <div className="relative">
                <button onClick={()=>setMenuOpen(v=>!v)} className="flex items-center gap-3 rounded-2xl border border-[#D9C99F]/45 bg-white/55 px-3 py-2 shadow-[0_6px_20px_rgba(80,62,30,.07)] backdrop-blur-xl">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B58A25] font-bold text-white">A</div>
                  <div className="hidden text-right sm:block"><p className="text-xs font-bold">Arees Admin</p><p className="text-[10px] text-[#171717]/45">admin@areesloop.com</p></div>
                  <span className="text-sm">⌄</span>
                </button>
                {menuOpen && <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-[#171717]/10 bg-white py-1 shadow-xl">
                  <button className="w-full px-4 py-3 text-right text-xs font-semibold hover:bg-[#FBF6E9]">♙ &nbsp; الملف الشخصي</button>
                  <button className="w-full px-4 py-3 text-right text-xs font-semibold hover:bg-[#FBF6E9]">⚙ &nbsp; إعدادات الحساب</button>
                  <div className="border-t border-[#171717]/8"/>
                  <button onClick={async()=>{await fetch("/api/auth/logout",{method:"POST",credentials:"include"});window.location.href="/admin/login";}} className="w-full px-4 py-3 text-right text-xs font-bold text-red-500 hover:bg-red-50">↪ &nbsp; تسجيل الخروج</button>
                </div>}
              </div>
              <div className="flex items-center gap-5">
                <button className="relative text-xl">♧<span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500"/></button>
                <div className="hidden md:block text-left"><p className="text-[9px] font-bold tracking-[.18em] text-[#B68A21]">AREES LOOP ADMIN</p><p className="mt-1 text-xs font-bold">لوحة الإدارة</p></div>
              </div>
            </div>
          </header>
          <div className="min-h-[calc(100vh-78px)] bg-[radial-gradient(circle_at_70%_10%,rgba(216,176,75,.035),transparent_32%)]">{children}</div>
        </div>
      </div>
    </div>
  );
}
