"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type SettlementStatus = "UPCOMING" | "PROCESSING" | "PAID";

type Settlement = {
  id: string;
  period: string;
  sales: number;
  areesCommission: number;
  paymentFees: number;
  transferFee: number;
  refunds: number;
  adjustments: number;
  net: number;
  settlementDate: string;
  status: SettlementStatus;
};

const settlements: Settlement[] = [
  {
    id: "SET-260903",
    period: "01 - 07 سبتمبر 2026",
    sales: 22660.97,
    areesCommission: 2266.1,
    paymentFees: 225.6,
    transferFee: 1,
    refunds: 0,
    adjustments: 0,
    net: 20168.27,
    settlementDate: "07 سبتمبر 2026",
    status: "UPCOMING",
  },
  {
    id: "SET-260827",
    period: "24 - 30 أغسطس 2026",
    sales: 11340,
    areesCommission: 1134,
    paymentFees: 74.31,
    transferFee: 1,
    refunds: 0,
    adjustments: 0,
    net: 10130.69,
    settlementDate: "31 أغسطس 2026",
    status: "PAID",
  },
  {
    id: "SET-260820",
    period: "17 - 23 أغسطس 2026",
    sales: 7624,
    areesCommission: 610,
    paymentFees: 15.66,
    transferFee: 1,
    refunds: 0,
    adjustments: 0,
    net: 6997.34,
    settlementDate: "24 أغسطس 2026",
    status: "PAID",
  },
  {
    id: "SET-260813",
    period: "10 - 16 أغسطس 2026",
    sales: 6053,
    areesCommission: 605.3,
    paymentFees: 43.8,
    transferFee: 1,
    refunds: 0,
    adjustments: 0,
    net: 5402.9,
    settlementDate: "17 أغسطس 2026",
    status: "PAID",
  },
];

const statusConfig: Record<
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

export default function PartnerSettlementsPage() {
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | SettlementStatus
  >("ALL");

  const [search, setSearch] = useState("");
  const [selectedSettlement, setSelectedSettlement] =
    useState<Settlement | null>(settlements[0]);

  const filteredSettlements = useMemo(() => {
    return settlements.filter((settlement) => {
      const searchable =
        `${settlement.id} ${settlement.period} ${settlement.settlementDate}`.toLowerCase();

      const matchesSearch = searchable.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || settlement.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const summary = useMemo(() => {
    const totalSales = settlements.reduce(
      (sum, settlement) => sum + settlement.sales,
      0
    );

    const totalNet = settlements.reduce(
      (sum, settlement) => sum + settlement.net,
      0
    );

    const totalDeductions = settlements.reduce(
      (sum, settlement) =>
        sum +
        settlement.areesCommission +
        settlement.paymentFees +
        settlement.transferFee +
        settlement.refunds +
        settlement.adjustments,
      0
    );

    return {
      totalSales,
      totalNet,
      totalDeductions,
      nextNet: settlements[0]?.net || 0,
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
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-[#0D3B34]/6 blur-[120px]" />
        <div className="absolute -left-40 top-[42%] h-[440px] w-[440px] rounded-full bg-[#D4AF37]/9 blur-[125px]" />
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
            <NavItem href="/partner/dashboard" label="الرئيسية" icon="⌂" />

            <NavItem href="/partner/bookings" label="الحجوزات" icon="▣" />

            <NavItem href="/partner/services" label="الخدمات" icon="◈" />

            <NavItem
              href="/partner/settlements"
              label="التسويات"
              icon="﷼"
              active
            />

            <NavItem href="/partner/invoices" label="الفواتير" icon="▤" />

            <NavItem href="/partner/reports" label="التقارير" icon="◫" />

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
              SETTLEMENT ACCOUNT
            </p>

            <p className="mt-2 text-sm font-bold">
              دورة التسوية: كل 7 أيام
            </p>

            <p className="mt-2 text-xs leading-6 text-white/50">
              يتم التحويل إلى الحساب البنكي المعتمد بعد خصم الرسوم
              والاستردادات.
            </p>
          </div>
        </aside>

        {/* CONTENT */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-[#0D3B34]/8 bg-[#F9F7F0]/90 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-8">
              <div>
                <p className="text-[10px] text-[#0D3B34]/45">
                  تجارب المدينة
                </p>

                <p className="mt-1 text-sm font-bold">
                  التسويات المالية
                </p>
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
            {/* TITLE */}
            <section className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-[0.22em] text-[#B99124]">
                  SETTLEMENTS
                </p>

                <h1
                  className="mt-2 text-3xl font-bold md:text-[42px]"
                  style={{
                    fontFamily: "var(--font-el-messiri), serif",
                  }}
                >
                  التسويات
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#0D3B34]/60">
                  تابع مبيعات كل دورة، الاستقطاعات، عمولة Arees Loop،
                  رسوم الدفع، الاستردادات وصافي المبلغ المحول.
                </p>
              </div>

              <button
                type="button"
                className="rounded-2xl border border-[#0D3B34]/10 bg-white px-5 py-3 text-xs font-bold text-[#0D3B34]/65"
              >
                تصدير كشف CSV
              </button>
            </section>

            {/* SUMMARY */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="إجمالي المبيعات"
                value={`${money(summary.totalSales)} ر.س`}
              />

              <SummaryCard
                label="إجمالي الاستقطاعات"
                value={`${money(summary.totalDeductions)} ر.س`}
              />

              <SummaryCard
                label="إجمالي صافي التسويات"
                value={`${money(summary.totalNet)} ر.س`}
                success
              />

              <SummaryCard
                label="التسوية القادمة"
                value={`${money(summary.nextNet)} ر.س`}
                highlight
              />
            </section>

            {/* NEXT SETTLEMENT */}
            <section className="mt-7 grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
              <div className="rounded-[30px] bg-[#0D3B34] p-6 text-white md:p-7">
                <p className="text-[10px] font-bold tracking-[0.17em] text-[#E6C24D]">
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

                  <p className="mt-2 text-4xl font-bold text-[#F1C94C]">
                    {money(settlements[0].net)}
                  </p>

                  <p className="mt-1 text-xs text-white/45">
                    ريال سعودي
                  </p>
                </div>

                <div className="mt-7 space-y-4 border-t border-white/10 pt-5">
                  <DarkRow
                    label="إجمالي المبيعات"
                    value={`${money(settlements[0].sales)} ر.س`}
                  />

                  <DarkRow
                    label="عمولة Arees Loop"
                    value={`- ${money(
                      settlements[0].areesCommission
                    )} ر.س`}
                  />

                  <DarkRow
                    label="رسوم الدفع"
                    value={`- ${money(
                      settlements[0].paymentFees
                    )} ر.س`}
                  />

                  <DarkRow
                    label="رسوم التحويل"
                    value={`- ${money(
                      settlements[0].transferFee
                    )} ر.س`}
                  />

                  <DarkRow
                    label="موعد التحويل"
                    value={settlements[0].settlementDate}
                  />
                </div>
              </div>

              {/* BREAKDOWN */}
              <div className="rounded-[30px] border border-white/80 bg-white/72 p-6 backdrop-blur-xl md:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.17em] text-[#B99124]">
                      BREAKDOWN
                    </p>

                    <h2
                      className="mt-2 text-2xl font-bold"
                      style={{
                        fontFamily: "var(--font-el-messiri), serif",
                      }}
                    >
                      تفاصيل الاستقطاعات
                    </h2>
                  </div>

                  <span className="rounded-full bg-[#FFF2CF] px-3 py-1.5 text-xs font-bold text-[#8B6812]">
                    عمولة 10%
                  </span>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <BreakdownCard
                    label="المبيعات"
                    value={settlements[0].sales}
                    positive
                  />

                  <BreakdownCard
                    label="عمولة Arees Loop"
                    value={settlements[0].areesCommission}
                  />

                  <BreakdownCard
                    label="رسوم بوابة الدفع"
                    value={settlements[0].paymentFees}
                  />

                  <BreakdownCard
                    label="رسوم التحويل البنكي"
                    value={settlements[0].transferFee}
                  />

                  <BreakdownCard
                    label="الاستردادات"
                    value={settlements[0].refunds}
                  />

                  <BreakdownCard
                    label="تعديلات أخرى"
                    value={settlements[0].adjustments}
                  />
                </div>

                <div className="mt-5 flex items-center justify-between rounded-[22px] bg-[#EAF5EE] p-5">
                  <div>
                    <p className="text-[10px] text-[#267247]/70">
                      صافي مستحق المورد
                    </p>

                    <p className="mt-1 text-2xl font-bold text-[#267247]">
                      {money(settlements[0].net)} ر.س
                    </p>
                  </div>

                  <span className="text-2xl text-[#267247]">✓</span>
                </div>
              </div>
            </section>

            {/* FILTERS */}
            <section className="mt-7 rounded-[28px] border border-white/80 bg-white/72 p-5 backdrop-blur-xl">
              <div className="grid gap-3 lg:grid-cols-[1fr_200px]">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث برقم التسوية أو الفترة..."
                  className={inputClass}
                />

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as "ALL" | SettlementStatus
                    )
                  }
                  className={inputClass}
                >
                  <option value="ALL">كل الحالات</option>
                  <option value="UPCOMING">قادمة</option>
                  <option value="PROCESSING">قيد المعالجة</option>
                  <option value="PAID">تم التحويل</option>
                </select>
              </div>
            </section>

            {/* TABLE */}
            <section className="mt-6 overflow-hidden rounded-[30px] border border-white/80 bg-white/72 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-[#0D3B34]/7 px-6 py-5">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.17em] text-[#B99124]">
                    SETTLEMENT HISTORY
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    سجل التسويات
                  </h2>
                </div>

                <span className="rounded-full bg-[#0D3B34]/6 px-3 py-1.5 text-xs font-bold">
                  {filteredSettlements.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-right">
                  <thead>
                    <tr className="border-b border-[#0D3B34]/8 bg-[#FAF9F5] text-[10px] text-[#0D3B34]/45">
                      <th className="px-6 py-4 font-semibold">
                        التسوية
                      </th>
                      <th className="px-4 py-4 font-semibold">
                        الفترة
                      </th>
                      <th className="px-4 py-4 font-semibold">
                        المبيعات
                      </th>
                      <th className="px-4 py-4 font-semibold">
                        الاستقطاعات
                      </th>
                      <th className="px-4 py-4 font-semibold">
                        الصافي
                      </th>
                      <th className="px-4 py-4 font-semibold">
                        التاريخ
                      </th>
                      <th className="px-4 py-4 font-semibold">
                        الحالة
                      </th>
                      <th className="px-6 py-4 font-semibold">
                        التفاصيل
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSettlements.map((settlement) => {
                      const totalDeductions =
                        settlement.areesCommission +
                        settlement.paymentFees +
                        settlement.transferFee +
                        settlement.refunds +
                        settlement.adjustments;

                      const status = statusConfig[settlement.status];

                      return (
                        <tr
                          key={settlement.id}
                          className="border-b border-[#0D3B34]/6 last:border-0 hover:bg-[#FBFAF7]"
                        >
                          <td className="px-6 py-5 text-xs font-bold">
                            {settlement.id}
                          </td>

                          <td className="px-4 py-5 text-xs text-[#0D3B34]/60">
                            {settlement.period}
                          </td>

                          <td className="px-4 py-5 text-xs font-semibold">
                            {money(settlement.sales)} ر.س
                          </td>

                          <td className="px-4 py-5 text-xs font-semibold text-[#A05C42]">
                            - {money(totalDeductions)} ر.س
                          </td>

                          <td className="px-4 py-5 text-xs font-bold text-[#267247]">
                            {money(settlement.net)} ر.س
                          </td>

                          <td className="px-4 py-5 text-xs text-[#0D3B34]/55">
                            {settlement.settlementDate}
                          </td>

                          <td className="px-4 py-5">
                            <span
                              className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedSettlement(settlement)
                              }
                              className="rounded-xl border border-[#0D3B34]/10 bg-white px-3 py-2 text-[10px] font-bold text-[#0D3B34]/65"
                            >
                              عرض الكشف
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* SETTLEMENT DETAILS DRAWER */}
      {selectedSettlement && (
        <div className="fixed inset-0 z-[100] bg-[#071E1A]/45 backdrop-blur-sm">
          <div className="absolute inset-y-0 left-0 w-full max-w-[620px] overflow-y-auto bg-[#F8F5ED]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#0D3B34]/8 bg-[#F8F5ED]/95 px-6 py-5 backdrop-blur-xl">
              <div>
                <p className="text-[10px] font-bold tracking-[0.17em] text-[#B99124]">
                  SETTLEMENT STATEMENT
                </p>

                <h2
                  className="mt-1 text-2xl font-bold"
                  style={{
                    fontFamily: "var(--font-el-messiri), serif",
                  }}
                >
                  كشف التسوية
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSettlement(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0D3B34]/10 bg-white text-lg"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-[26px] bg-[#0D3B34] p-6 text-white">
                <p className="text-[10px] text-white/45">
                  صافي التسوية
                </p>

                <p className="mt-2 text-4xl font-bold text-[#F1C94C]">
                  {money(selectedSettlement.net)}
                </p>

                <p className="mt-1 text-xs text-white/45">
                  ريال سعودي
                </p>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <DarkRow
                    label="رقم التسوية"
                    value={selectedSettlement.id}
                  />

                  <div className="mt-3">
                    <DarkRow
                      label="الفترة"
                      value={selectedSettlement.period}
                    />
                  </div>

                  <div className="mt-3">
                    <DarkRow
                      label="موعد التحويل"
                      value={selectedSettlement.settlementDate}
                    />
                  </div>
                </div>
              </div>

              <StatementRow
                label="إجمالي المبيعات"
                value={selectedSettlement.sales}
                positive
              />

              <StatementRow
                label="عمولة Arees Loop"
                value={selectedSettlement.areesCommission}
              />

              <StatementRow
                label="رسوم معالجة الدفع"
                value={selectedSettlement.paymentFees}
              />

              <StatementRow
                label="رسوم التحويل"
                value={selectedSettlement.transferFee}
              />

              <StatementRow
                label="الاستردادات"
                value={selectedSettlement.refunds}
              />

              <StatementRow
                label="التعديلات"
                value={selectedSettlement.adjustments}
              />

              <div className="rounded-[22px] border border-[#267247]/15 bg-[#EAF5EE] p-5">
                <p className="text-xs text-[#267247]/70">
                  صافي مستحق المورد
                </p>

                <p className="mt-2 text-2xl font-bold text-[#267247]">
                  {money(selectedSettlement.net)} ر.س
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="rounded-2xl border border-[#0D3B34]/10 bg-white px-5 py-3.5 text-xs font-bold text-[#0D3B34]/65"
                >
                  تصدير CSV
                </button>

                <button
                  type="button"
                  className="rounded-2xl bg-[#0D3B34] px-5 py-3.5 text-xs font-bold text-white"
                >
                  تنزيل كشف PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE NAV */}
      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-[560px] -translate-x-1/2 items-center justify-around rounded-[22px] border border-white/80 bg-[#F9F7F0]/94 px-2 py-2 backdrop-blur-xl xl:hidden">
        <MobileNav href="/partner/dashboard" label="الرئيسية" />
        <MobileNav href="/partner/bookings" label="الحجوزات" />
        <MobileNav href="/partner/services" label="الخدمات" />
        <MobileNav
          href="/partner/settlements"
          label="التسويات"
          active
        />
        <MobileNav href="/partner/business" label="المنشأة" />
      </nav>
    </main>
  );
}

const inputClass =
  "h-14 w-full rounded-2xl border border-[#0D3B34]/10 bg-[#FAF9F5] px-4 text-sm text-[#0D3B34] outline-none transition placeholder:text-[#0D3B34]/30 focus:border-[#D4AF37]/60 focus:bg-white";

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

      {label}
    </Link>
  );
}

function SummaryCard({
  label,
  value,
  success = false,
  highlight = false,
}: {
  label: string;
  value: string;
  success?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[26px] border p-5 ${
        success
          ? "border-[#267247]/15 bg-[#EAF5EE]"
          : highlight
          ? "border-[#0D3B34] bg-[#0D3B34] text-white"
          : "border-white/80 bg-white/72"
      }`}
    >
      <p
        className={`text-xs ${
          highlight
            ? "text-white/45"
            : "text-[#0D3B34]/45"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-bold ${
          success
            ? "text-[#267247]"
            : highlight
            ? "text-[#F1C94C]"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function BreakdownCard({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: number;
  positive?: boolean;
}) {
  return (
    <div className="rounded-[20px] border border-[#0D3B34]/7 bg-[#FAF9F5] p-4">
      <p className="text-[10px] text-[#0D3B34]/40">
        {label}
      </p>

      <p
        className={`mt-2 text-lg font-bold ${
          positive ? "text-[#267247]" : "text-[#A05C42]"
        }`}
      >
        {positive ? "" : "- "}
        {money(value)} ر.س
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

function StatementRow({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: number;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-[20px] border border-[#0D3B34]/7 bg-white p-4">
      <span className="text-xs font-semibold text-[#0D3B34]/65">
        {label}
      </span>

      <span
        className={`text-sm font-bold ${
          positive ? "text-[#267247]" : "text-[#A05C42]"
        }`}
      >
        {positive ? "" : "- "}
        {money(value)} ر.س
      </span>
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