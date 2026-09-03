"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type BookingStatus =
  | "NEW"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

type ServiceStatus =
  | "PUBLISHED"
  | "UNDER_REVIEW"
  | "DRAFT"
  | "SUSPENDED";

type SettlementStatus =
  | "UPCOMING"
  | "PROCESSING"
  | "PAID";

type Booking = {
  id: string;
  customer: string;
  service: string;
  date: string;
  amount: number;
  status: BookingStatus;
};

type Service = {
  id: number;
  name: string;
  category: string;
  price: number;
  bookings: number;
  status: ServiceStatus;
};

type Settlement = {
  id: string;
  period: string;
  gross: number;
  deductions: number;
  net: number;
  date: string;
  status: SettlementStatus;
};

const bookings: Booking[] = [
  {
    id: "AL-B-240915",
    customer: "محمد عبدالله",
    service: "متحف وبستان الصافية",
    date: "03 سبتمبر 2026 - 02:15 م",
    amount: 140,
    status: "NEW",
  },
  {
    id: "AL-B-240914",
    customer: "سارة أحمد",
    service: "جولة المدينة التاريخية",
    date: "03 سبتمبر 2026 - 12:40 م",
    amount: 280,
    status: "CONFIRMED",
  },
  {
    id: "AL-B-240902",
    customer: "عبدالعزيز علي",
    service: "تجربة طعام مدينية",
    date: "02 سبتمبر 2026 - 08:30 م",
    amount: 190,
    status: "COMPLETED",
  },
];

const services: Service[] = [
  {
    id: 1,
    name: "متحف وبستان الصافية",
    category: "وجهة أو موقع سياحي",
    price: 70,
    bookings: 42,
    status: "PUBLISHED",
  },
  {
    id: 2,
    name: "جولة المدينة التاريخية",
    category: "تنظيم الرحلات السياحية",
    price: 140,
    bookings: 31,
    status: "PUBLISHED",
  },
  {
    id: 3,
    name: "تجربة طعام مدينية",
    category: "مزود تجربة أو نشاط",
    price: 95,
    bookings: 18,
    status: "UNDER_REVIEW",
  },
];

const settlements: Settlement[] = [
  {
    id: "SET-260903",
    period: "01 - 07 سبتمبر 2026",
    gross: 22660.97,
    deductions: 2493.7,
    net: 20167.27,
    date: "07 سبتمبر 2026",
    status: "UPCOMING",
  },
  {
    id: "SET-260827",
    period: "24 - 30 أغسطس 2026",
    gross: 11340,
    deductions: 1209.31,
    net: 10130.69,
    date: "31 أغسطس 2026",
    status: "PAID",
  },
  {
    id: "SET-260820",
    period: "17 - 23 أغسطس 2026",
    gross: 7624,
    deductions: 626.66,
    net: 6997.34,
    date: "24 أغسطس 2026",
    status: "PAID",
  },
];

const bookingStatus: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  NEW: {
    label: "جديد",
    className: "bg-[#FFF3D4] text-[#8C6813]",
  },
  CONFIRMED: {
    label: "مؤكد",
    className: "bg-[#E8F3EF] text-[#2A6D58]",
  },
  COMPLETED: {
    label: "مكتمل",
    className: "bg-[#E6F5EB] text-[#267247]",
  },
  CANCELLED: {
    label: "ملغي",
    className: "bg-[#FFE9E7] text-[#A3443E]",
  },
};

const serviceStatus: Record<
  ServiceStatus,
  { label: string; className: string }
> = {
  PUBLISHED: {
    label: "منشورة",
    className: "bg-[#E6F5EB] text-[#267247]",
  },
  UNDER_REVIEW: {
    label: "تحت المراجعة",
    className: "bg-[#FFF3D4] text-[#8C6813]",
  },
  DRAFT: {
    label: "مسودة",
    className: "bg-[#F0EFEB] text-[#6D7A76]",
  },
  SUSPENDED: {
    label: "موقوفة",
    className: "bg-[#FFE9E7] text-[#A3443E]",
  },
};

const settlementStatus: Record<
  SettlementStatus,
  { label: string; className: string }
> = {
  UPCOMING: {
    label: "قادمة",
    className: "bg-[#FFF3D4] text-[#8C6813]",
  },
  PROCESSING: {
    label: "قيد المعالجة",
    className: "bg-[#EAF0F7] text-[#3E6182]",
  },
  PAID: {
    label: "تم التحويل",
    className: "bg-[#E6F5EB] text-[#267247]",
  },
};

const money = (value: number) =>
  new Intl.NumberFormat("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function PartnerDashboardPage() {
  const [period, setPeriod] = useState("7d");

  const partner = {
    tradeName: "تجارب المدينة",
    legalName: "شركة تجارب المدينة السياحية المحدودة",
    status: "معتمد ونشط",
    commissionRate: 10,
    settlementCycle: "كل 7 أيام",
    points: 0,
  };

  const stats = useMemo(() => {
    const grossSales = 38240;
    const bookingCount = 126;
    const avgBooking = grossSales / bookingCount;
    const upcomingSettlement = settlements[0]?.net ?? 0;

    return {
      grossSales,
      bookingCount,
      avgBooking,
      upcomingSettlement,
    };
  }, []);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F7F4EA] text-[#0D3B34]"
      style={{
        fontFamily: "var(--font-ibm-plex-arabic), sans-serif",
      }}
    >
      {/* SMART BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 top-20 h-[520px] w-[520px] rounded-full bg-[#0D3B34]/6 blur-[120px]" />
        <div className="absolute -left-32 top-[38%] h-[420px] w-[420px] rounded-full bg-[#D4AF37]/10 blur-[120px]" />
        <div className="absolute bottom-[-150px] right-[30%] h-[420px] w-[420px] rounded-full bg-[#B99124]/6 blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden w-[270px] shrink-0 border-l border-[#0D3B34]/8 bg-[#F9F7F0]/92 px-4 py-5 backdrop-blur-xl xl:block">
          <div className="mb-7 px-3">
            <p className="text-[10px] font-bold tracking-[0.22em] text-[#B99124]">
              AREES LOOP PARTNER
            </p>

            <h2
              className="mt-2 text-xl font-bold"
              style={{
                fontFamily: "var(--font-el-messiri), serif",
              }}
            >
              لوحة الشريك
            </h2>
          </div>

          <nav className="space-y-2">
            <NavItem
              href="/partner/dashboard"
              label="الرئيسية"
              icon="⌂"
              active
            />

            <NavItem
              href="/partner/bookings"
              label="الحجوزات"
              icon="▣"
            />

            <NavItem
              href="/partner/services"
              label="الخدمات"
              icon="◈"
            />

            <NavItem
              href="/partner/settlements"
              label="التسويات"
              icon="﷼"
            />

            <NavItem
              href="/partner/invoices"
              label="الفواتير"
              icon="▤"
            />

            <NavItem
              href="/partner/reports"
              label="التقارير"
              icon="◫"
            />

            <NavItem
              href="/partner/team"
              label="الموظفون والصلاحيات"
              icon="◎"
            />

            <NavItem
              href="/partner/business"
              label="المنشأة والتراخيص"
              icon="◇"
            />

            <NavItem
              href="/partner/agreement"
              label="الاتفاقية والإعدادات"
              icon="✓"
            />
          </nav>

          <div className="mt-8 rounded-[24px] bg-[#0D3B34] p-5 text-white">
            <p className="text-[10px] font-bold tracking-[0.16em] text-[#E6C24D]">
              ACCOUNT STATUS
            </p>

            <p className="mt-2 text-sm font-bold">
              {partner.status}
            </p>

            <p className="mt-2 text-xs leading-6 text-white/50">
              جميع الخدمات الجديدة تخضع للمراجعة قبل النشر.
            </p>
          </div>
        </aside>

        {/* MAIN */}
        <div className="min-w-0 flex-1">
          {/* HEADER */}
          <header className="sticky top-0 z-40 border-b border-[#0D3B34]/8 bg-[#F9F7F0]/88 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-8">
              <div>
                <p className="text-[10px] font-semibold text-[#0D3B34]/45">
                  مرحبًا بك
                </p>

                <p className="mt-1 text-sm font-bold">
                  {partner.tradeName}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="rounded-full border border-[#0D3B34]/10 bg-white px-4 py-2.5 text-xs font-semibold text-[#0D3B34]/65"
                >
                  عرض المنصة
                </Link>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D3B34] text-sm font-bold text-[#D4AF37]">
                  ت
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1550px] px-5 py-8 md:px-8">
            {/* TITLE */}
            <section className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-[0.22em] text-[#B99124]">
                  PARTNER OVERVIEW
                </p>

                <h1
                  className="mt-2 text-3xl font-bold md:text-[42px]"
                  style={{
                    fontFamily: "var(--font-el-messiri), serif",
                  }}
                >
                  لوحة التحكم
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#0D3B34]/58">
                  تابع المبيعات والحجوزات والخدمات والتسويات من مكان واحد.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/partner/services"
                  className="rounded-2xl bg-[#0D3B34] px-5 py-3 text-sm font-bold text-white"
                >
                  + إضافة خدمة
                </Link>

                <Link
                  href="/partner/settlements"
                  className="rounded-2xl border border-[#0D3B34]/10 bg-white px-5 py-3 text-sm font-bold text-[#0D3B34]/70"
                >
                  عرض التسويات
                </Link>
              </div>
            </section>

            {/* FILTER */}
            <section className="mb-5 flex justify-end">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="h-11 rounded-2xl border border-[#0D3B34]/10 bg-white px-4 text-xs font-semibold outline-none"
              >
                <option value="7d">آخر 7 أيام</option>
                <option value="30d">آخر 30 يوم</option>
                <option value="90d">آخر 90 يوم</option>
                <option value="year">هذا العام</option>
              </select>
            </section>

            {/* STATS */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="إجمالي المبيعات"
                value={`${money(stats.grossSales)} ر.س`}
                note="قيمة الحجوزات قبل الاستقطاعات"
                highlight
              />

              <StatCard
                label="إجمالي الحجوزات"
                value={String(stats.bookingCount)}
                note="جميع الحجوزات خلال الفترة"
              />

              <StatCard
                label="متوسط قيمة الحجز"
                value={`${money(stats.avgBooking)} ر.س`}
                note="متوسط قيمة العملية الواحدة"
              />

              <StatCard
                label="التسوية القادمة"
                value={`${money(stats.upcomingSettlement)} ر.س`}
                note={`دورة التسوية: ${partner.settlementCycle}`}
              />
            </section>

            {/* MAIN GRID */}
            <section className="mt-7 grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
              {/* SALES OVERVIEW */}
              <div className="rounded-[30px] border border-white/80 bg-white/70 p-6 backdrop-blur-xl md:p-7">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
                      SALES PERFORMANCE
                    </p>

                    <h2
                      className="mt-2 text-2xl font-bold"
                      style={{
                        fontFamily: "var(--font-el-messiri), serif",
                      }}
                    >
                      أداء المبيعات
                    </h2>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#0D3B34]/50">
                    <span>العمولة الحالية</span>
                    <span className="rounded-full bg-[#FFF2CF] px-3 py-1.5 font-bold text-[#8B6812]">
                      {partner.commissionRate}%
                    </span>
                  </div>
                </div>

                <div className="mt-7 grid gap-4 md:grid-cols-3">
                  <MiniMetric
                    label="المبيعات"
                    value="38,240.00 ر.س"
                  />

                  <MiniMetric
                    label="العمولات والرسوم"
                    value="4,206.40 ر.س"
                  />

                  <MiniMetric
                    label="صافي مستحق المورد"
                    value="34,033.60 ر.س"
                    positive
                  />
                </div>

                <div className="mt-8 h-[240px] rounded-[24px] border border-[#0D3B34]/7 bg-[#F8F7F2] p-5">
                  <div className="flex h-full items-end gap-3">
                    {[46, 68, 52, 85, 74, 91, 78].map(
                      (height, index) => (
                        <div
                          key={index}
                          className="flex flex-1 flex-col items-center justify-end gap-2"
                        >
                          <div
                            className="w-full rounded-t-xl bg-gradient-to-t from-[#0D3B34] to-[#D4AF37]"
                            style={{ height: `${height}%` }}
                          />

                          <span className="text-[9px] text-[#0D3B34]/40">
                            {index + 28}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* NEXT SETTLEMENT */}
              <div className="rounded-[30px] bg-[#0D3B34] p-6 text-white md:p-7">
                <p className="text-[10px] font-bold tracking-[0.16em] text-[#E5BF45]">
                  NEXT SETTLEMENT
                </p>

                <h2
                  className="mt-2 text-2xl font-bold"
                  style={{
                    fontFamily: "var(--font-el-messiri), serif",
                  }}
                >
                  التسوية القادمة
                </h2>

                <div className="mt-7">
                  <p className="text-xs text-white/45">
                    صافي المبلغ المتوقع
                  </p>

                  <p className="mt-2 text-4xl font-bold text-[#F1CC57]">
                    {money(settlements[0].net)}
                  </p>

                  <p className="mt-1 text-xs text-white/45">
                    ريال سعودي
                  </p>
                </div>

                <div className="mt-7 space-y-4 border-t border-white/10 pt-5">
                  <DarkRow
                    label="إجمالي المبيعات"
                    value={`${money(settlements[0].gross)} ر.س`}
                  />

                  <DarkRow
                    label="الاستقطاعات"
                    value={`- ${money(
                      settlements[0].deductions
                    )} ر.س`}
                  />

                  <DarkRow
                    label="تاريخ التسوية"
                    value={settlements[0].date}
                  />
                </div>

                <Link
                  href="/partner/settlements"
                  className="mt-7 inline-flex w-full justify-center rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-[#0D3B34]"
                >
                  تفاصيل التسوية
                </Link>
              </div>
            </section>

            {/* BOOKINGS + SERVICES */}
            <section className="mt-7 grid gap-6 xl:grid-cols-2">
              {/* BOOKINGS */}
              <div className="rounded-[30px] border border-white/80 bg-white/70 p-6 backdrop-blur-xl md:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
                      RECENT BOOKINGS
                    </p>

                    <h2
                      className="mt-2 text-xl font-bold"
                      style={{
                        fontFamily: "var(--font-el-messiri), serif",
                      }}
                    >
                      أحدث الحجوزات
                    </h2>
                  </div>

                  <Link
                    href="/partner/bookings"
                    className="text-xs font-bold text-[#0D3B34]/60"
                  >
                    عرض الكل
                  </Link>
                </div>

                <div className="mt-6 space-y-3">
                  {bookings.map((booking) => {
                    const status =
                      bookingStatus[booking.status];

                    return (
                      <Link
                        key={booking.id}
                        href={`/partner/bookings/${booking.id}`}
                        className="block rounded-[20px] border border-[#0D3B34]/7 bg-[#FAF9F5] p-4 transition hover:border-[#D4AF37]/40"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold">
                              {booking.service}
                            </p>

                            <p className="mt-1 text-xs text-[#0D3B34]/50">
                              {booking.customer}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div className="mt-4 flex items-end justify-between gap-4">
                          <div>
                            <p className="text-[10px] text-[#0D3B34]/38">
                              {booking.id}
                            </p>

                            <p className="mt-1 text-[10px] text-[#0D3B34]/40">
                              {booking.date}
                            </p>
                          </div>

                          <p className="text-sm font-bold">
                            {money(booking.amount)} ر.س
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* SERVICES */}
              <div className="rounded-[30px] border border-white/80 bg-white/70 p-6 backdrop-blur-xl md:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
                      SERVICES
                    </p>

                    <h2
                      className="mt-2 text-xl font-bold"
                      style={{
                        fontFamily: "var(--font-el-messiri), serif",
                      }}
                    >
                      الخدمات والتجارب
                    </h2>
                  </div>

                  <Link
                    href="/partner/services"
                    className="text-xs font-bold text-[#0D3B34]/60"
                  >
                    إدارة الخدمات
                  </Link>
                </div>

                <div className="mt-6 space-y-3">
                  {services.map((service) => {
                    const status =
                      serviceStatus[service.status];

                    return (
                      <div
                        key={service.id}
                        className="rounded-[20px] border border-[#0D3B34]/7 bg-[#FAF9F5] p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold">
                              {service.name}
                            </p>

                            <p className="mt-1 text-xs text-[#0D3B34]/45">
                              {service.category}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-white px-3 py-2">
                            <p className="text-[9px] text-[#0D3B34]/38">
                              السعر
                            </p>

                            <p className="mt-1 text-xs font-bold">
                              {money(service.price)} ر.س
                            </p>
                          </div>

                          <div className="rounded-xl bg-white px-3 py-2">
                            <p className="text-[9px] text-[#0D3B34]/38">
                              الحجوزات
                            </p>

                            <p className="mt-1 text-xs font-bold">
                              {service.bookings}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ALERTS + SETTLEMENT HISTORY */}
            <section className="mt-7 grid gap-6 xl:grid-cols-[0.65fr_1.35fr]">
              {/* COMPLIANCE */}
              <div className="space-y-4">
                <div className="rounded-[28px] border border-[#E7D6A7] bg-[#FFF9E8] p-6">
                  <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
                    COMPLIANCE
                  </p>

                  <h3 className="mt-2 text-lg font-bold">
                    تنبيه ترخيص
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-[#0D3B34]/58">
                    يوجد ترخيص ينتهي خلال 42 يومًا. حدّث المستند قبل
                    انتهاء الصلاحية لتجنب تعليق الخدمات المرتبطة به.
                  </p>

                  <Link
                    href="/partner/business"
                    className="mt-5 inline-flex rounded-2xl bg-[#0D3B34] px-4 py-3 text-xs font-bold text-white"
                  >
                    إدارة التراخيص
                  </Link>
                </div>

                <div className="rounded-[28px] border border-[#0D3B34]/8 bg-white/70 p-6">
                  <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
                    QUICK ACTIONS
                  </p>

                  <div className="mt-4 grid gap-2">
                    <QuickLink
                      href="/partner/services"
                      label="إضافة خدمة جديدة"
                    />

                    <QuickLink
                      href="/partner/bookings"
                      label="إدارة الحجوزات"
                    />

                    <QuickLink
                      href="/partner/invoices"
                      label="عرض الفواتير"
                    />

                    <QuickLink
                      href="/partner/team"
                      label="إدارة الموظفين"
                    />
                  </div>
                </div>
              </div>

              {/* SETTLEMENT HISTORY */}
              <div className="rounded-[30px] border border-white/80 bg-white/70 p-6 backdrop-blur-xl md:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
                      SETTLEMENT HISTORY
                    </p>

                    <h2
                      className="mt-2 text-xl font-bold"
                      style={{
                        fontFamily: "var(--font-el-messiri), serif",
                      }}
                    >
                      آخر التسويات
                    </h2>
                  </div>

                  <Link
                    href="/partner/settlements"
                    className="text-xs font-bold text-[#0D3B34]/60"
                  >
                    عرض الكل
                  </Link>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[720px] text-right">
                    <thead>
                      <tr className="border-b border-[#0D3B34]/8 text-[10px] text-[#0D3B34]/42">
                        <th className="pb-3 font-semibold">
                          التسوية
                        </th>

                        <th className="pb-3 font-semibold">
                          الفترة
                        </th>

                        <th className="pb-3 font-semibold">
                          المبيعات
                        </th>

                        <th className="pb-3 font-semibold">
                          الاستقطاعات
                        </th>

                        <th className="pb-3 font-semibold">
                          الصافي
                        </th>

                        <th className="pb-3 font-semibold">
                          الحالة
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {settlements.map((settlement) => {
                        const status =
                          settlementStatus[settlement.status];

                        return (
                          <tr
                            key={settlement.id}
                            className="border-b border-[#0D3B34]/6 last:border-0"
                          >
                            <td className="py-4 text-xs font-bold">
                              {settlement.id}
                            </td>

                            <td className="py-4 text-xs text-[#0D3B34]/58">
                              {settlement.period}
                            </td>

                            <td className="py-4 text-xs font-semibold">
                              {money(settlement.gross)}
                            </td>

                            <td className="py-4 text-xs text-[#9A5C40]">
                              - {money(settlement.deductions)}
                            </td>

                            <td className="py-4 text-xs font-bold text-[#267247]">
                              {money(settlement.net)}
                            </td>

                            <td className="py-4">
                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
                              >
                                {status.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* MOBILE NAV */}
      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-[560px] -translate-x-1/2 items-center justify-around rounded-[22px] border border-white/80 bg-[#F9F7F0]/92 px-2 py-2 backdrop-blur-xl xl:hidden">
        <MobileNav
          href="/partner/dashboard"
          label="الرئيسية"
          active
        />

        <MobileNav
          href="/partner/bookings"
          label="الحجوزات"
        />

        <MobileNav
          href="/partner/services"
          label="الخدمات"
        />

        <MobileNav
          href="/partner/settlements"
          label="التسويات"
        />

        <MobileNav
          href="/partner/business"
          label="المنشأة"
        />
      </nav>
    </main>
  );
}

function NavItem({
  href,
  label,
  icon,
  active = false,
}: {
  href: string;
  label: string;
  icon: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
        active
          ? "bg-[#0D3B34] text-white"
          : "text-[#0D3B34]/62 hover:bg-white/70"
      }`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-xl ${
          active
            ? "bg-white/10 text-[#D4AF37]"
            : "bg-[#0D3B34]/6"
        }`}
      >
        {icon}
      </span>

      <span>{label}</span>
    </Link>
  );
}

function StatCard({
  label,
  value,
  note,
  highlight = false,
}: {
  label: string;
  value: string;
  note: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[26px] border p-5 ${
        highlight
          ? "border-[#0D3B34] bg-[#0D3B34] text-white"
          : "border-white/80 bg-white/72"
      }`}
    >
      <p
        className={`text-xs ${
          highlight
            ? "text-white/48"
            : "text-[#0D3B34]/45"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-bold md:text-[28px] ${
          highlight ? "text-[#F1C94C]" : ""
        }`}
      >
        {value}
      </p>

      <p
        className={`mt-2 text-[10px] ${
          highlight
            ? "text-white/38"
            : "text-[#0D3B34]/40"
        }`}
      >
        {note}
      </p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-[20px] border border-[#0D3B34]/7 bg-[#FAF9F5] p-4">
      <p className="text-[10px] text-[#0D3B34]/40">
        {label}
      </p>

      <p
        className={`mt-2 text-lg font-bold ${
          positive ? "text-[#267247]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DarkRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-white/45">
        {label}
      </span>

      <span className="text-xs font-bold text-white/78">
        {value}
      </span>
    </div>
  );
}

function QuickLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-[#0D3B34]/7 bg-[#FAF9F5] px-4 py-3 text-xs font-bold text-[#0D3B34]/70"
    >
      <span>{label}</span>
      <span className="text-[#B99124]">←</span>
    </Link>
  );
}

function MobileNav({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl px-3 py-2 text-[10px] font-bold ${
        active
          ? "bg-[#0D3B34] text-white"
          : "text-[#0D3B34]/55"
      }`}
    >
      {label}
    </Link>
  );
}