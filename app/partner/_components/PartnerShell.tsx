"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type IconName = "home" | "bookings" | "services" | "coupon" | "riyal" | "invoice" | "report" | "team" | "license" | "contract";

const items: ReadonlyArray<readonly [string, IconName, string]> = [
  ["/partner/dashboard", "home", "الرئيسية"],
  ["/partner/bookings", "bookings", "الحجوزات"],
  ["/partner/services", "services", "الخدمات"],
  ["/partner/coupons", "coupon", "الكوبونات"],
  ["/partner/settlements", "riyal", "التسويات"],
  ["/partner/invoices", "invoice", "الفواتير"],
  ["/partner/reports", "report", "التقارير"],
  ["/partner/team", "team", "الموظفون والصلاحيات"],
  ["/partner/business", "license", "المنشأة والتراخيص"],
  ["/partner/contracts/current", "contract", "الاتفاقيات والعقود"],
];

function NavIcon({ name }: { name: IconName }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "riyal") return <span className="text-[18px] font-bold leading-none">﷼</span>;
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" {...common}>
      {name === "home" && <><path d="M3.5 10.5 12 3.8l8.5 6.7"/><path d="M5.5 9.2V20h13V9.2"/><path d="M9.5 20v-6h5v6"/></>}
      {name === "bookings" && <><rect x="4" y="5.5" width="16" height="14" rx="2.5"/><path d="M8 3.5v4M16 3.5v4M4 9.5h16"/><path d="m8 14 2 2 5-5"/></>}
      {name === "services" && <><path d="M12 3.5 20.5 8 12 12.5 3.5 8 12 3.5Z"/><path d="m5.5 11.5 6.5 3.5 6.5-3.5M5.5 15.5 12 19l6.5-3.5"/></>}
      {name === "coupon" && <><path d="M4 7.5A2.5 2.5 0 0 0 6.5 5h11A2.5 2.5 0 0 0 20 7.5v2a2.5 2.5 0 0 0 0 5v2A2.5 2.5 0 0 0 17.5 19h-11A2.5 2.5 0 0 0 4 16.5v-2a2.5 2.5 0 0 0 0-5Z"/><path d="m9 15 6-6M9.5 9.5h.01M14.5 14.5h.01"/></>}
      {name === "invoice" && <><path d="M6 3.5h12v17l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4v-17Z"/><path d="M9 8h6M9 12h6M9 16h4"/></>}
      {name === "report" && <><path d="M5 3.5h10l4 4V20H5Z"/><path d="M15 3.5V8h4M8 12h5M8 15.5h4"/><path d="m14.5 17.5 4-4 1.5 1.5-4 4-2 .5Z"/></>}
      {name === "team" && <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.3"/><path d="M3.5 19c.5-3.5 2.4-5.5 5.5-5.5s5 2 5.5 5.5M14 14c3.3-.6 5.5 1.1 6 4"/></>}
      {name === "license" && <><path d="M6 3.5h9l3 3V20H6Z"/><path d="M15 3.5V7h3M9 10h6M9 13h4"/><circle cx="14.5" cy="16.5" r="2.2"/><path d="m13.2 18.2-.4 2 1.7-1 1.7 1-.4-2"/></>}
      {name === "contract" && <><path d="M6 3.5h12V20H6Z"/><path d="M9 8h6M9 11.5h6"/><path d="m9 16 1.5 1.5 4-4"/></>}
    </svg>
  );
}

type PartnerInfo = {
  tradeName: string;
  email: string;
  status: string;
};

function SidebarToggleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="4"
        width="17"
        height="16"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M9 4.5V19.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export default function PartnerShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const [partner, setPartner] = useState<PartnerInfo>({
    tradeName: "جاري تحميل بيانات الشريك...",
    email: "",
    status: "",
  });

  useEffect(() => {
    let alive = true;

    fetch("/api/partner/application", {
      credentials: "include",
      cache: "no-store",
    })
      .then((response) => response.json())
      .then((data) => {
        if (!alive) return;

        const application = data?.application;
        if (!application) return;

        setPartner({
          tradeName:
            application.tradeNameAr ||
            application.legalNameAr ||
            application.publicName ||
            "شريك Arees Loop",

          email:
            application.businessEmail ||
            application.mainContactEmail ||
            "",

          status: application.status || "",
        });
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  const partnerInitial =
    partner.tradeName &&
    partner.tradeName !== "جاري تحميل بيانات الشريك..."
      ? partner.tradeName.trim().charAt(0)
      : "ش";

  const accountStatus =
    partner.status === "ACTIVE"
      ? "معتمد ونشط"
      : partner.status || "حساب الشريك";

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#F7F4EA] text-[#0D3B34]"
      style={{
        fontFamily: "var(--font-ibm-plex-arabic), sans-serif",
      }}
    >
      <div className="flex min-h-screen">

        {/* =========================
            PARTNER SIDEBAR
        ========================== */}
        <aside
          className={`
            hidden min-h-screen shrink-0 border-l border-[#0D3B34]/10
            bg-[#F9F7F0] transition-all duration-300 xl:flex xl:flex-col
            ${sidebarOpen ? "w-[260px] p-4" : "w-[76px] p-3"}
          `}
        >
          {/* Header */}
          <div className="mb-4 pt-2">
            {sidebarOpen ? (
              <>
                <div className="flex items-start justify-between gap-3 px-2">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.18em] text-[#B99124]">
                      AREES LOOP PARTNER
                    </p>

                    <h2 className="mt-2 text-lg font-bold">
                      لوحة الشريك
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="
                      flex h-8 w-8 shrink-0 items-center justify-center
                      rounded-lg text-[#0D3B34]/65 transition
                      hover:bg-[#0D3B34]/5 hover:text-[#0D3B34]
                    "
                    title="طي القائمة"
                    aria-label="طي القائمة"
                  >
                    <SidebarToggleIcon />
                  </button>
                </div>

                {/* Partner identity directly under title */}
                <div className="relative mt-4">
                  <button
                    type="button"
                    onClick={() =>
                      setAccountMenuOpen((current) => !current)
                    }
                    className="
                      flex w-full items-center gap-3 rounded-2xl
                      border border-[#0D3B34]/10 bg-white
                      p-3 text-right transition
                      hover:border-[#D4AF37]/55 hover:shadow-sm
                    "
                  >
                    <span
                      className="
                        flex h-10 w-10 shrink-0 items-center
                        justify-center rounded-full bg-[#0D3B34]
                        text-sm font-bold text-[#D4AF37]
                      "
                    >
                      {partnerInitial}
                    </span>

                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-xs font-bold">
                        {partner.tradeName}
                      </strong>

                      <small className="mt-0.5 block truncate text-[10px] text-[#0D3B34]/50">
                        {partner.email || "حساب الشريك"}
                      </small>
                    </span>

                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className={`
                        h-4 w-4 shrink-0 text-[#0D3B34]/45
                        transition-transform duration-200
                        ${accountMenuOpen ? "rotate-180" : ""}
                      `}
                      aria-hidden="true"
                    >
                      <path
                        d="M5.5 7.5L10 12L14.5 7.5"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {accountMenuOpen && (
                    <div
                      className="
                        absolute right-0 top-full z-[100]
                        mt-2 w-full rounded-2xl border
                        border-[#0D3B34]/10 bg-white p-2
                        shadow-[0_16px_45px_rgba(13,59,52,0.15)]
                      "
                    >
                      <div className="border-b border-[#0D3B34]/8 px-3 py-2">
                        <p className="truncate text-xs font-bold">
                          {partner.tradeName}
                        </p>

                        {partner.email && (
                          <p className="mt-1 truncate text-[10px] text-[#0D3B34]/45">
                            {partner.email}
                          </p>
                        )}
                      </div>

                      <Link
                        href="/partner/business"
                        onClick={() => setAccountMenuOpen(false)}
                        className="
                          mt-1 block rounded-xl px-3 py-2.5
                          text-xs font-bold transition
                          hover:bg-[#F7F4EA]
                        "
                      >
                        بيانات المنشأة
                      </Link>

                      <Link
                        href="/"
                        onClick={() => setAccountMenuOpen(false)}
                        className="
                          block rounded-xl px-3 py-2.5
                          text-xs font-bold transition
                          hover:bg-[#F7F4EA]
                        "
                      >
                        العودة للمنصة
                      </Link>

                      <Link
                        href="/partner/logout"
                        onClick={() => setAccountMenuOpen(false)}
                        className="
                          block rounded-xl px-3 py-2.5
                          text-xs font-bold text-red-700 transition
                          hover:bg-red-50
                        "
                      >
                        تسجيل الخروج
                      </Link>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="
                    flex h-9 w-9 items-center justify-center
                    rounded-lg text-[#0D3B34]/65 transition
                    hover:bg-[#0D3B34]/5 hover:text-[#0D3B34]
                  "
                  title="فتح القائمة"
                  aria-label="فتح القائمة"
                >
                  <SidebarToggleIcon />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setAccountMenuOpen((current) => !current)
                  }
                  className="
                    flex h-10 w-10 items-center justify-center
                    rounded-full bg-[#0D3B34] text-sm
                    font-bold text-[#D4AF37]
                  "
                  title={partner.tradeName}
                >
                  {partnerInitial}
                </button>

                {accountMenuOpen && (
                  <div
                    className="
                      absolute right-[68px] top-[60px] z-[100]
                      w-52 rounded-2xl border border-[#0D3B34]/10
                      bg-white p-2 shadow-xl
                    "
                  >
                    <div className="border-b border-[#0D3B34]/8 px-3 py-2">
                      <p className="truncate text-xs font-bold">
                        {partner.tradeName}
                      </p>

                      {partner.email && (
                        <p className="mt-1 truncate text-[10px] text-[#0D3B34]/45">
                          {partner.email}
                        </p>
                      )}
                    </div>

                    <Link
                      href="/partner/business"
                      onClick={() => setAccountMenuOpen(false)}
                      className="mt-1 block rounded-xl px-3 py-2.5 text-xs font-bold hover:bg-[#F7F4EA]"
                    >
                      بيانات المنشأة
                    </Link>

                    <Link
                      href="/"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block rounded-xl px-3 py-2.5 text-xs font-bold hover:bg-[#F7F4EA]"
                    >
                      العودة للمنصة
                    </Link>

                    <Link
                      href="/partner/logout"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block rounded-xl px-3 py-2.5 text-xs font-bold text-red-700 hover:bg-red-50"
                    >
                      تسجيل الخروج
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="mt-2 space-y-2">
            {items.map(([href, icon, label]) => {
              const active =
                pathname === href ||
                pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  title={!sidebarOpen ? label : undefined}
                  className={`
                    flex items-center rounded-2xl py-3
                    text-sm font-bold transition
                    ${
                      sidebarOpen
                        ? "gap-3 px-4"
                        : "justify-center px-2"
                    }
                    ${
                      active
                        ? "bg-[#0D3B34] text-white shadow-sm"
                        : "text-[#0D3B34]/65 hover:bg-white hover:text-[#0D3B34]"
                    }
                  `}
                >
                  <span
                    className={`
                      shrink-0 text-base
                      ${active ? "text-[#E6C24D]" : ""}
                    `}
                  >
                    <NavIcon name={icon} />
                  </span>

                  {sidebarOpen && <span>{label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Account status stays at bottom */}
          <div className="mt-auto pt-6">
            {sidebarOpen ? (
              <div className="rounded-[22px] bg-[#0D3B34] p-4 text-white">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[9px] font-bold tracking-[0.14em] text-[#E6C24D]">
                    ACCOUNT STATUS
                  </p>

                  <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
                </div>

                <p className="mt-2 text-sm font-bold">
                  {accountStatus}
                </p>

                <p className="mt-2 text-[11px] leading-5 text-white/50">
                  الخدمات الجديدة تخضع للمراجعة قبل النشر.
                </p>
              </div>
            ) : (
              <div
                className="mx-auto h-2.5 w-2.5 rounded-full bg-[#D4AF37]"
                title={accountStatus}
              />
            )}
          </div>
        </aside>

        {/* =========================
            PARTNER CONTENT
        ========================== */}
        <div className="min-w-0 flex-1">
          <div className="partner-shell-content min-w-0">
            {children}
          </div>

          <style jsx global>{`
            .partner-shell-content
              > main
              > .relative.z-10.flex.min-h-screen
              > aside {
              display: none !important;
            }

            .partner-shell-content
              > main
              > .relative.z-10.flex.min-h-screen {
              display: block !important;
              min-height: auto !important;
            }

            .partner-shell-content
              > main
              > .relative.z-10.flex.min-h-screen
              > .min-w-0.flex-1
              > header {
              display: none !important;
            }

            .partner-shell-content > main {
              min-height: 100vh !important;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}