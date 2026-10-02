"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/admin/dashboard", label: "الرئيسية", icon: "⌂" },
  { href: "/admin/partners", label: "طلبات الشركاء", icon: "▣" },
  { href: "/admin/partners?view=active", label: "الشركاء المعتمدون", icon: "♙" },
  { href: "/admin/dashboard?section=users", label: "المستخدمون والصلاحيات", icon: "♧" },
  { href: "/admin/dashboard?section=content", label: "المحتوى والتجارب", icon: "◇" },
  { href: "/admin/dashboard?section=bookings", label: "الحجوزات", icon: "□" },
  { href: "/admin/dashboard?section=settlements", label: "المدفوعات والتسويات", icon: "▤" },
  { href: "/admin/dashboard?section=reports", label: "التقارير والإحصائيات", icon: "▥" },
  { href: "/admin/dashboard?section=settings", label: "إعدادات المنصة", icon: "⚙" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div dir="rtl" className="min-h-screen bg-[#F7F3E9] text-[#171717]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[270px] shrink-0 border-l border-[#C7A33A]/15 bg-[#FFFDF8] xl:flex xl:flex-col">
          <div className="flex h-[92px] items-center px-7">
            <Image src="/Logo/arees-loop-logo.png" alt="Arees Loop" width={92} height={52} className="h-[50px] w-auto object-contain" priority />
          </div>
          <nav className="flex-1 space-y-1.5 px-4 py-4">
            {nav.map((item) => {
              const active = item.href.split("?")[0] === pathname && (!item.href.includes("?") || pathname === "/admin/dashboard");
              return (
                <Link key={item.label} href={item.href} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-[#EAD9A4]/55 text-[#171717]" : "text-[#171717]/65 hover:bg-[#F3ECDD]"}`}>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${active ? "bg-[#B38B25] text-white" : "text-[#171717]/65"}`}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-[#171717]/8 p-4">
            <Link href="/" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[#171717]/60 hover:bg-[#F3ECDD]">↗ <span>عرض المنصة</span></Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-[80] border-b border-[#C7A33A]/15 bg-[#FFFDF8]/95 backdrop-blur-xl">
            <div className="flex h-[82px] items-center justify-between gap-4 px-5 md:px-8">
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#B38B25]">AREES LOOP ADMIN</p>
                <p className="mt-1 text-sm font-bold text-[#171717]">لوحة إدارة Arees Loop</p>
              </div>
              <div className="relative">
                <button type="button" onClick={() => setMenuOpen(v => !v)} className="flex items-center gap-3 rounded-2xl border border-[#C7A33A]/20 bg-white px-3 py-2 shadow-sm">
                  <div className="hidden text-left sm:block"><p className="text-xs font-bold">Arees Admin</p><p className="text-[10px] text-[#171717]/40">admin@areesloop.com</p></div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B38B25] font-bold text-white">A</div>
                  <span className="text-[#B38B25]">⌄</span>
                </button>
                {menuOpen && <div className="absolute left-0 mt-2 w-52 rounded-2xl border border-[#C7A33A]/20 bg-[#FFFDF8] p-2 shadow-xl">
                  <button type="button" onClick={async()=>{await fetch("/api/auth/logout",{method:"POST",credentials:"include"});window.location.href="/admin/login";}} className="w-full rounded-xl px-3 py-2.5 text-right text-xs font-bold text-red-700 hover:bg-red-50">تسجيل الخروج</button>
                </div>}
              </div>
            </div>
          </header>
          <div className="min-h-[calc(100vh-82px)]">{children}</div>
        </div>
      </div>
    </div>
  );
}
