"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import NotificationBell from "@/app/components/NotificationBell";
import AdminIcon, {type AdminIconName} from "./AdminIcon";

type AdminIdentity = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  adminPermissions: unknown;
  profileImageUrl: string | null;
};

type NavItem = { href:string; label:string; icon:AdminIconName; permission:string|null; superOnly?:boolean };
const requestsNav:NavItem[]=[
 {href:"/admin/transport/flights?view=requests",label:"الطيران",icon:"plane",permission:"TRANSPORT_FLIGHTS"},
 {href:"/admin/transport/ferries?view=requests",label:"البواخر",icon:"ship",permission:"TRANSPORT_FERRIES"},
 {href:"/admin/hotels?view=requests",label:"الفنادق",icon:"hotel",permission:"HOTEL_REQUESTS"},
 {href:"/admin/transport/visas?view=requests",label:"التأشيرات",icon:"globe",permission:"TRANSPORT_VISAS"},
 {href:"/admin/transport/driving-licenses?view=requests",label:"الرخص الدولية",icon:"car",permission:"TRANSPORT_DRIVING_LICENSE"},
 {href:"/admin/bank-transfers",label:"مراجعة التحويلات",icon:"credit",superOnly:true,permission:null},
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<>{children}</>}><AdminLayoutShell>{children}</AdminLayoutShell></Suspense>;
}

function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [requestsMenuOpen, setRequestsMenuOpen] = useState(false);
  const [admin, setAdmin] = useState<AdminIdentity | null>(null);
  const [pendingServiceCount, setPendingServiceCount] = useState(0);

  useEffect(() => {
    if (pathname === "/admin/login" || pathname === "/admin/invite") return;
    void fetch("/api/admin/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setAdmin(d.data); })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    if (requestsNav.some((item) => pathname === item.href.split("?")[0])) setRequestsMenuOpen(true);
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/admin/login" || pathname === "/admin/invite") return;
    void fetch("/api/admin/services", { cache: "no-store", credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setPendingServiceCount(d.data.filter((service: { status?: string }) => service.status === "UNDER_REVIEW").length);
        }
      })
      .catch(() => {});
  }, [pathname]);

  if (pathname === "/admin/login" || pathname === "/admin/invite") return <>{children}</>;

  const isSuperAdmin = admin?.role === "SUPER_ADMIN";
  const grantedPermissions = Array.isArray(admin?.adminPermissions)
    ? admin.adminPermissions.map(String)
    : [];
  const hasNavAccess = (item: NavItem) =>
    isSuperAdmin || (!item.superOnly && (!item.permission || grantedPermissions.includes(item.permission)));
  const visibleRequests=requestsNav.filter(hasNavAccess);
  const requestsMenuActive=visibleRequests.some(item=>pathname===item.href.split("?")[0]);
  const platformMenuActive=pathname==="/admin/settings"||pathname.startsWith("/admin/settings/")||
    ["/admin/partners","/admin/users","/admin/services","/admin/success-partners","/admin/navigation","/admin/rewards"].some(p=>pathname===p);
  const fullName = [admin?.firstName, admin?.lastName].filter(Boolean).join(" ") || (isSuperAdmin ? "Arees Admin" : "Admin");
  const initials = fullName.split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "A";

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

          {/* Three clear primary destinations; operational sections are grouped rather than duplicated. */}
          <nav className="flex-1 space-y-2 px-4 py-5" aria-label="تنقل الإدارة الرئيسي">
            <Link href="/admin/dashboard" className={`flex items-center gap-3 rounded-2xl px-3 py-3.5 text-sm font-bold transition ${pathname==="/admin/dashboard"?"bg-[#0D3B34] text-white":"text-[#0D3B34] hover:bg-[#F5EDD9]"}`}>
              <AdminIcon name="dashboard" size={23}/> الرئيسية
            </Link>
            {visibleRequests.length>0&&<div>
              <button type="button" aria-expanded={requestsMenuOpen} onClick={()=>setRequestsMenuOpen(v=>!v)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-right text-sm font-bold transition ${requestsMenuActive?"bg-[#F2E5BF] text-[#0D3B34]":"text-[#0D3B34] hover:bg-[#F5EDD9]"}`}>
                <AdminIcon name="requests" size={23}/><span className="flex-1">إدارة الطلبات والعروض</span>
                <span aria-hidden="true">{requestsMenuOpen?"⌃":"⌄"}</span>
              </button>
              {requestsMenuOpen&&<div className="mr-5 mt-1 space-y-1 border-r border-[#D4AF37]/40 pr-3">
                {visibleRequests.map(item=><Link key={item.href} href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition ${pathname===item.href.split("?")[0]?"bg-[#EEDDB4] text-[#0D3B34]":"text-[#0D3B34]/75 hover:bg-[#F5EDD9]"}`}>
                    <AdminIcon name={item.icon} size={19}/>{item.label}
                </Link>)}
              </div>}
            </div>}
            <Link href="/admin/settings" className={`flex items-center gap-3 rounded-2xl px-3 py-3.5 text-sm font-bold transition ${platformMenuActive?"bg-[#0D3B34] text-white":"text-[#0D3B34] hover:bg-[#F5EDD9]"}`}>
              <AdminIcon name="settings" size={23}/> إدارة المنصة
              {pendingServiceCount>0&&<span className="mr-auto rounded-full bg-[#D4AF37] px-2 py-0.5 text-[10px] font-bold text-[#0D3B34]">{pendingServiceCount}</span>}
            </Link>
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
                    {admin?.profileImageUrl ? (
                      <img src={admin.profileImageUrl} alt={fullName} className="h-full w-full rounded-full object-cover" />
                    ) : initials}
                  </div>

                  <div className="hidden text-right sm:block">
                    <p className="text-[12px] font-bold text-[#171717]">
                      {fullName}
                    </p>

                    <p className="mt-0.5 text-[10px] text-[#171717]/45">
                      {admin?.email || ""}
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
                  LEFT - ADMIN TITLE
              ====================== */}
              <div className="flex items-center gap-4">

                {admin?.id&&<NotificationBell role="admin" userId={admin.id}/>}
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
