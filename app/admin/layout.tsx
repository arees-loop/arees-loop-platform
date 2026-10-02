"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/admin/dashboard", label: "الرئيسية", icon: "⌂" },
  { href: "/admin/partners", label: "طلبات الشركاء", icon: "▣", badge: "1" },
  { href: "/admin/partners?view=active", label: "الشركاء المعتمدون", icon: "♧" },
  { href: "/admin/users", label: "المستخدمين", icon: "♙" },
  { href: "/admin/dashboard?section=content", label: "المحتوى والتجارب", icon: "▤" },
  { href: "/admin/dashboard?section=bookings", label: "الحجوزات", icon: "▦" },
  { href: "/admin/dashboard?section=settlements", label: "المدفوعات والتسويات", icon: "▣" },
  { href: "/admin/dashboard?section=reports", label: "التقارير والإحصائيات", icon: "▥" },
  { href: "/admin/dashboard?section=settings", label: "إعدادات المنصة", icon: "⚙" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#F8F5ED] text-[#171717]"
      style={{ fontFamily: "var(--font-ibm-plex-arabic), sans-serif" }}
    >
      {/* خلفية هادئة */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 top-[-100px] h-[500px] w-[500px] rounded-full bg-[#D4AF37]/[0.055] blur-[120px]" />
        <div className="absolute -left-40 top-[35%] h-[480px] w-[480px] rounded-full bg-[#0D3B34]/[0.035] blur-[130px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-row">

        {/* =========================
            SIDEBAR
        ========================== */}
        <aside
          className="
            hidden w-[265px] shrink-0
            border-l border-white/60
            bg-white/55
            shadow-[-8px_0_35px_rgba(70,60,40,.055)]
            backdrop-blur-[24px]
            lg:flex lg:flex-col
          "
        >
          {/* Logo */}
          <div className="flex h-[108px] items-center justify-center">
            <Image
              src="/Logo/arees-loop-logo.png"
              alt="Arees Loop"
              width={120}
              height={65}
              className="h-[62px] w-auto object-contain"
              priority
            />
          </div>

          {/* فاصل ناعم */}
          <div className="mx-6 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/25 to-transparent" />

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 px-4 py-5">
            {nav.map((item) => {
              const base = item.href.split("?")[0];
              const active =
                pathname === base && !item.href.includes("?");

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`
                    group flex items-center gap-3
                    rounded-[14px]
                    px-3 py-3
                    text-[14px] font-semibold
                    transition-all duration-200
                    ${
                      active
                        ? "bg-[#F3E5BD]/75 text-[#171717] shadow-[0_5px_16px_rgba(181,138,37,.09)]"
                        : "text-[#171717]/72 hover:bg-[#D4AF37]/10 hover:text-[#171717] hover:shadow-[0_7px_20px_rgba(181,138,37,.13)]"
                    }
                  `}
                >
                  <span
                    className={`
                      flex h-8 w-8 items-center justify-center
                      rounded-[10px] text-lg
                      transition-all duration-200
                      ${
                        active
                          ? "bg-[#B68A21] text-white shadow-[0_4px_12px_rgba(182,138,33,.22)]"
                          : "text-[#171717] group-hover:bg-white/65 group-hover:text-[#B68A21]"
                      }
                    `}
                  >
                    {item.icon}
                  </span>

                  <span className="flex-1">{item.label}</span>

                  {item.badge && (
                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#D39B16] px-1.5 text-[12px] font-extrabold text-white shadow-[0_3px_8px_rgba(211,155,22,.28)]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Platform Link */}
          <div className="mx-5 mb-4">
            <div className="mb-3 h-px bg-gradient-to-r from-transparent via-[#171717]/10 to-transparent" />

            <Link
              href="/"
              className="
                flex items-center gap-3
                rounded-[14px]
                px-3 py-3
                text-sm font-semibold text-[#171717]/65
                transition-all duration-200
                hover:bg-[#D4AF37]/10
                hover:text-[#171717]
                hover:shadow-[0_7px_20px_rgba(181,138,37,.12)]
              "
            >
              <span className="text-xl text-[#B68A21]">↗</span>
              عرض المنصة
            </Link>
          </div>
        </aside>

        {/* =========================
            MAIN
        ========================== */}
        <div className="min-w-0 flex-1">

          {/* =========================
              GLASS HEADER
          ========================== */}
          <header className="sticky top-0 z-[90] px-4 pt-3 md:px-6">

            <div
              className="
                relative mx-auto
                flex h-[74px] w-full
                items-center justify-between
                gap-4 overflow-visible
                rounded-[22px]
                border border-white/70
                bg-white/58
                px-4 md:px-6
                shadow-[0_10px_35px_rgba(70,60,40,.07)]
                backdrop-blur-[24px]
                transition-all duration-300
                hover:border-[#D4AF37]/35
                hover:shadow-[0_12px_38px_rgba(181,138,37,.11)]
              "
            >
              {/* لمعة زجاجية علوية */}
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

              {/* =====================
                  RIGHT - ADMIN
              ====================== */}
              <div className="relative z-20">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="
                    group flex items-center gap-3
                    rounded-[15px]
                    px-2.5 py-2
                    transition-all duration-200
                    hover:bg-white/55
                    hover:shadow-[0_6px_20px_rgba(181,138,37,.12)]
                  "
                >
                  <div
                    className="
                      flex h-9 w-9 shrink-0
                      items-center justify-center
                      rounded-full
                      bg-gradient-to-br from-[#C69A31] to-[#9D7318]
                      text-sm font-bold text-white
                      shadow-[0_5px_14px_rgba(181,138,37,.25)]
                    "
                  >
                    A
                  </div>

                  <div className="hidden text-right sm:block">
                    <p className="text-[12px] font-bold text-[#171717]">
                      Arees Admin
                    </p>

                    <p className="mt-0.5 text-[10px] text-[#171717]/45">
                      admin@areesloop.com
                    </p>
                  </div>

                  <span className="mr-1 text-[12px] text-[#171717]/50 transition group-hover:text-[#B68A21]">
                    ⌄
                  </span>
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div
                    className="
                      absolute right-0 mt-3 w-52
                      overflow-hidden
                      rounded-[16px]
                      border border-white/80
                      bg-white/90
                      py-1.5
                      shadow-[0_18px_45px_rgba(50,40,20,.13)]
                      backdrop-blur-2xl
                    "
                  >
                    <button className="w-full px-4 py-3 text-right text-xs font-semibold transition hover:bg-[#D4AF37]/10">
                      ♙ &nbsp; الملف الشخصي
                    </button>

                    <button className="w-full px-4 py-3 text-right text-xs font-semibold transition hover:bg-[#D4AF37]/10">
                      ⚙ &nbsp; إعدادات الحساب
                    </button>

                    <div className="mx-3 border-t border-[#171717]/8" />

                    <button
                      onClick={async () => {
                        await fetch("/api/auth/logout", {
                          method: "POST",
                          credentials: "include",
                        });
                        window.location.href = "/admin/login";
                      }}
                      className="w-full px-4 py-3 text-right text-xs font-bold text-red-500 transition hover:bg-red-50"
                    >
                      ↪ &nbsp; تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>

              {/* =====================
                  CENTER
              ====================== */}
              <div
                className="
                  absolute left-1/2 top-1/2
                  hidden -translate-x-1/2 -translate-y-1/2
                  items-center gap-3
                  rounded-full
                  border border-[#D4AF37]/15
                  bg-[#0D3B34]/95
                  px-5 py-2.5
                  shadow-[0_7px_22px_rgba(13,59,52,.12)]
                  transition-all duration-200
                  hover:shadow-[0_8px_28px_rgba(212,175,55,.18)]
                  lg:flex
                "
              >
                <span className="text-[9px] font-bold tracking-[.17em] text-[#E6C24D]">
                  AREES LOOP
                </span>

                <span className="h-3.5 w-px bg-white/20" />

                <span className="whitespace-nowrap text-[10px] font-semibold text-white/85">
                  إصدار تجريبي
                </span>

                <span className="h-1.5 w-1.5 rounded-full bg-[#E6C24D] shadow-[0_0_9px_rgba(230,194,77,.75)]" />
              </div>

              {/* =====================
                  LEFT - ADMIN TITLE
              ====================== */}
              <div className="flex items-center gap-4">

                {/* Notification */}
                <button
                  className="
                    relative flex h-10 w-10
                    items-center justify-center
                    rounded-[13px]
                    bg-white/40
                    text-lg
                    transition-all duration-200
                    hover:bg-[#D4AF37]/10
                    hover:text-[#B68A21]
                    hover:shadow-[0_6px_20px_rgba(181,138,37,.13)]
                  "
                >
                  ♧

                  <span className="absolute right-[8px] top-[8px] h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </button>

                <div className="hidden text-left md:block">
                  <p className="text-[9px] font-bold tracking-[.18em] text-[#B68A21]">
                    AREES LOOP ADMIN
                  </p>

                  <p className="mt-1 text-xs font-bold text-[#171717]">
                    لوحة الإدارة
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* =========================
              PAGE CONTENT
          ========================== */}
          <div
            className="
              min-h-[calc(100vh-90px)]
              bg-[radial-gradient(circle_at_70%_10%,rgba(216,176,75,.035),transparent_32%)]
            "
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}