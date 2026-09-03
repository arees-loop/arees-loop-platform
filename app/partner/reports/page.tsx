"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type PeriodKey = "7D" | "30D" | "90D" | "YEAR";

type ReportRow = {
  label: string;
  bookings: number;
  sales: number;
  refunds: number;
  net: number;
};

const periodLabels: Record<PeriodKey, string> = {
  "7D": "آخر 7 أيام",
  "30D": "آخر 30 يوم",
  "90D": "آخر 90 يوم",
  YEAR: "هذا العام",
};

const servicePerformance: ReportRow[] = [
  {
    label: "متحف وبستان الصافية",
    bookings: 42,
    sales: 2940,
    refunds: 0,
    net: 2626.4,
  },
  {
    label: "جولة المدينة التاريخية",
    bookings: 31,
    sales: 4340,
    refunds: 140,
    net: 3754.6,
  },
  {
    label: "تجربة طعام مدينية",
    bookings: 18,
    sales: 1710,
    refunds: 190,
    net: 1327.1,
  },
];

const dailySales = [
  { day: "28 أغسطس", value: 3200 },
  { day: "29 أغسطس", value: 4100 },
  { day: "30 أغسطس", value: 3650 },
  { day: "31 أغسطس", value: 5200 },
  { day: "1 سبتمبر", value: 4800 },
  { day: "2 سبتمبر", value: 6100 },
  { day: "3 سبتمبر", value: 7190 },
];

const money = (value: number) =>
  new Intl.NumberFormat("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function PartnerReportsPage() {
  const [period, setPeriod] = useState<PeriodKey>("30D");

  const summary = useMemo(() => {
    const sales = 38240;
    const bookings = 126;
    const refunds = 330;
    const deductions = 4206.4;
    const net = sales - refunds - deductions;

    return {
      sales,
      bookings,
      refunds,
      deductions,
      net,
      average: sales / bookings,
    };
  }, [period]);

  const maxDaily = Math.max(...dailySales.map((item) => item.value));

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F7F4EA] text-[#0D3B34]"
      style={{
        fontFamily: "var(--font-ibm-plex-arabic), sans-serif",
      }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-[#0D3B34]/6 blur-[120px]" />
        <div className="absolute -left-40 top-[42%] h-[450px] w-[450px] rounded-full bg-[#D4AF37]/9 blur-[125px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
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
            <NavItem href="/partner/dashboard" label="الرئيسية" icon="⌂" />
            <NavItem href="/partner/bookings" label="الحجوزات" icon="▣" />
            <NavItem href="/partner/services" label="الخدمات" icon="◈" />
            <NavItem href="/partner/settlements" label="التسويات" icon="﷼" />
            <NavItem href="/partner/invoices" label="الفواتير" icon="▤" />

            <NavItem
              href="/partner/reports"
              label="التقارير"
              icon="◫"
              active
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
              REPORTING
            </p>

            <p className="mt-2 text-sm font-bold">تقارير الأداء</p>

            <p className="mt-2 text-xs leading-6 text-white/50">
              تابع المبيعات والحجوزات والاستردادات وصافي المستحق حسب الفترة.
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-[#0D3B34]/8 bg-[#F9F7F0]/90 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-8">
              <div>
                <p className="text-[10px] text-[#0D3B34]/45">
                  تجارب المدينة
                </p>

                <p className="mt-1 text-sm font-bold">التقارير</p>
              </div>

              <Link
                href="/partner/dashboard"
                className="rounded-full border border-[#0D3B34]/10 bg-white px-4 py-2.5 text-xs font-semibold text-[#0D3B34]/65"
              >
                لوحة التحكم
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-[1550px] px-5 py-8 md:px-8">
            <section className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-[0.22em] text-[#B99124]">
                  BUSINESS ANALYTICS
                </p>

                <h1
                  className="mt-2 text-3xl font-bold md:text-[42px]"
                  style={{
                    fontFamily: "var(--font-el-messiri), serif",
                  }}
                >
                  التقارير
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#0D3B34]/60">
                  قياس أداء المبيعات والحجوزات والخدمات وصافي المستحقات خلال
                  الفترة المحددة.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  value={period}
                  onChange={(e) =>
                    setPeriod(e.target.value as PeriodKey)
                  }
                  className="h-12 rounded-2xl border border-[#0D3B34]/10 bg-white px-4 text-xs font-semibold outline-none"
                >
                  {Object.entries(periodLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="rounded-2xl border border-[#0D3B34]/10 bg-white px-5 py-3 text-xs font-bold text-[#0D3B34]/65"
                >
                  تصدير التقرير
                </button>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <SummaryCard
                label="إجمالي المبيعات"
                value={`${money(summary.sales)} ر.س`}
                highlight
              />

              <SummaryCard
                label="إجمالي الحجوزات"
                value={String(summary.bookings)}
              />

              <SummaryCard
                label="متوسط قيمة الحجز"
                value={`${money(summary.average)} ر.س`}
              />

              <SummaryCard
                label="الاستردادات"
                value={`${money(summary.refunds)} ر.س`}
                warning
              />

              <SummaryCard
                label="صافي المستحق"
                value={`${money(summary.net)} ر.س`}
                success
              />
            </section>

            <section className="mt-7 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-[30px] border border-white/80 bg-white/72 p-6 backdrop-blur-xl md:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
                      SALES TREND
                    </p>

                    <h2
                      className="mt-2 text-2xl font-bold"
                      style={{
                        fontFamily: "var(--font-el-messiri), serif",
                      }}
                    >
                      اتجاه المبيعات
                    </h2>
                  </div>

                  <span className="rounded-full bg-[#EEF3F0] px-3 py-1.5 text-xs font-bold text-[#0D3B34]/60">
                    {periodLabels[period]}
                  </span>
                </div>

                <div className="mt-8 h-[320px] rounded-[24px] border border-[#0D3B34]/7 bg-[#F8F7F2] p-5">
                  <div className="flex h-full items-end gap-3">
                    {dailySales.map((item) => {
                      const height = Math.max(
                        8,
                        Math.round((item.value / maxDaily) * 100)
                      );

                      return (
                        <div
                          key={item.day}
                          className="flex flex-1 flex-col items-center justify-end gap-3"
                        >
                          <p className="text-[9px] font-bold text-[#0D3B34]/45">
                            {money(item.value)}
                          </p>

                          <div
                            className="w-full rounded-t-2xl bg-gradient-to-t from-[#0D3B34] to-[#D4AF37]"
                            style={{
                              height: `${height}%`,
                            }}
                          />

                          <p className="text-[9px] text-[#0D3B34]/40">
                            {item.day}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] bg-[#0D3B34] p-6 text-white md:p-7">
                <p className="text-[10px] font-bold tracking-[0.16em] text-[#E6C24D]">
                  FINANCIAL SUMMARY
                </p>

                <h2
                  className="mt-2 text-2xl font-bold"
                  style={{
                    fontFamily: "var(--font-el-messiri), serif",
                  }}
                >
                  الملخص المالي
                </h2>

                <div className="mt-7 space-y-5">
                  <DarkMetric
                    label="إجمالي المبيعات"
                    value={`${money(summary.sales)} ر.س`}
                  />

                  <DarkMetric
                    label="الاستردادات"
                    value={`- ${money(summary.refunds)} ر.س`}
                  />

                  <DarkMetric
                    label="العمولات والرسوم"
                    value={`- ${money(summary.deductions)} ر.س`}
                  />

                  <div className="border-t border-white/10 pt-5">
                    <p className="text-xs text-white/45">صافي المورد</p>

                    <p className="mt-2 text-3xl font-bold text-[#F1C94C]">
                      {money(summary.net)} ر.س
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-7 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="overflow-hidden rounded-[30px] border border-white/80 bg-white/72 backdrop-blur-xl">
                <div className="border-b border-[#0D3B34]/7 px-6 py-5">
                  <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
                    SERVICE PERFORMANCE
                  </p>

                  <h2
                    className="mt-2 text-xl font-bold"
                    style={{
                      fontFamily: "var(--font-el-messiri), serif",
                    }}
                  >
                    أداء الخدمات
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-right">
                    <thead>
                      <tr className="border-b border-[#0D3B34]/8 bg-[#FAF9F5] text-[10px] text-[#0D3B34]/45">
                        <th className="px-6 py-4 font-semibold">الخدمة</th>
                        <th className="px-4 py-4 font-semibold">الحجوزات</th>
                        <th className="px-4 py-4 font-semibold">المبيعات</th>
                        <th className="px-4 py-4 font-semibold">الاستردادات</th>
                        <th className="px-6 py-4 font-semibold">الصافي</th>
                      </tr>
                    </thead>

                    <tbody>
                      {servicePerformance.map((row) => (
                        <tr
                          key={row.label}
                          className="border-b border-[#0D3B34]/6 last:border-0"
                        >
                          <td className="px-6 py-5 text-xs font-bold">
                            {row.label}
                          </td>

                          <td className="px-4 py-5 text-xs font-semibold">
                            {row.bookings}
                          </td>

                          <td className="px-4 py-5 text-xs font-semibold">
                            {money(row.sales)} ر.س
                          </td>

                          <td className="px-4 py-5 text-xs font-semibold text-[#A05C42]">
                            {money(row.refunds)} ر.س
                          </td>

                          <td className="px-6 py-5 text-xs font-bold text-[#267247]">
                            {money(row.net)} ر.س
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-5">
                <ReportCard
                  eyebrow="TOP SERVICE"
                  title="الأعلى مبيعًا"
                  value="جولة المدينة التاريخية"
                  note="31 حجز خلال الفترة"
                />

                <ReportCard
                  eyebrow="BOOKING CONVERSION"
                  title="معدل التحويل"
                  value="18.4%"
                  note="من مشاهدة الخدمة إلى الحجز"
                />

                <ReportCard
                  eyebrow="REFUND RATE"
                  title="معدل الاسترداد"
                  value="0.86%"
                  note="من إجمالي قيمة المبيعات"
                />
              </div>
            </section>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-[560px] -translate-x-1/2 items-center justify-around rounded-[22px] border border-white/80 bg-[#F9F7F0]/94 px-2 py-2 backdrop-blur-xl xl:hidden">
        <MobileNav href="/partner/dashboard" label="الرئيسية" />
        <MobileNav href="/partner/bookings" label="الحجوزات" />
        <MobileNav href="/partner/services" label="الخدمات" />
        <MobileNav href="/partner/settlements" label="التسويات" />
        <MobileNav href="/partner/reports" label="التقارير" active />
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
          active ? "bg-white/10 text-[#D4AF37]" : "bg-[#0D3B34]/6"
        }`}
      >
        {icon}
      </span>

      {label}
    </Link>
  );
}

function SummaryCard({
  label,
  value,
  highlight = false,
  success = false,
  warning = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  success?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className={`rounded-[26px] border p-5 ${
        highlight
          ? "border-[#0D3B34] bg-[#0D3B34] text-white"
          : success
          ? "border-[#267247]/15 bg-[#EAF5EE]"
          : warning
          ? "border-[#A05C42]/15 bg-[#FFF3EC]"
          : "border-white/80 bg-white/72"
      }`}
    >
      <p
        className={`text-xs ${
          highlight ? "text-white/45" : "text-[#0D3B34]/45"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-bold ${
          highlight
            ? "text-[#F1C94C]"
            : success
            ? "text-[#267247]"
            : warning
            ? "text-[#A05C42]"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DarkMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
      <span className="text-xs text-white/45">{label}</span>

      <span className="text-sm font-bold text-white/80">{value}</span>
    </div>
  );
}

function ReportCard({
  eyebrow,
  title,
  value,
  note,
}: {
  eyebrow: string;
  title: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/80 bg-white/72 p-6 backdrop-blur-xl">
      <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
        {eyebrow}
      </p>

      <h3 className="mt-2 text-lg font-bold">{title}</h3>

      <p className="mt-4 text-2xl font-bold text-[#0D3B34]">{value}</p>

      <p className="mt-2 text-xs leading-6 text-[#0D3B34]/50">{note}</p>
    </div>
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