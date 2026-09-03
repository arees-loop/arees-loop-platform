"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type BookingStatus =
  | "NEW"
  | "PAID"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "SETTLEMENT_ELIGIBLE"
  | "SETTLED"
  | "CANCELLED"
  | "PARTIAL_REFUND"
  | "REFUNDED"
  | "DISPUTED";

type Booking = {
  id: string;
  customer: string;
  phone: string;
  service: string;
  serviceDate: string;
  bookedAt: string;
  guests: number;
  subtotal: number;
  vat: number;
  total: number;
  paymentMethod: string;
  paymentReference: string;
  status: BookingStatus;
};

const bookings: Booking[] = [
  {
    id: "AL-B-240915",
    customer: "محمد عبدالله",
    phone: "+966 55 821 4480",
    service: "متحف وبستان الصافية",
    serviceDate: "05 سبتمبر 2026 - 05:30 م",
    bookedAt: "03 سبتمبر 2026 - 02:15 م",
    guests: 2,
    subtotal: 121.74,
    vat: 18.26,
    total: 140,
    paymentMethod: "بطاقة مدى",
    paymentReference: "PAY-8791442",
    status: "NEW",
  },
  {
    id: "AL-B-240914",
    customer: "سارة أحمد",
    phone: "+966 53 442 8177",
    service: "جولة المدينة التاريخية",
    serviceDate: "06 سبتمبر 2026 - 04:00 م",
    bookedAt: "03 سبتمبر 2026 - 12:40 م",
    guests: 2,
    subtotal: 243.48,
    vat: 36.52,
    total: 280,
    paymentMethod: "Visa",
    paymentReference: "PAY-8791388",
    status: "CONFIRMED",
  },
  {
    id: "AL-B-240902",
    customer: "عبدالعزيز علي",
    phone: "+966 50 281 2299",
    service: "تجربة طعام مدينية",
    serviceDate: "02 سبتمبر 2026 - 08:30 م",
    bookedAt: "01 سبتمبر 2026 - 09:12 م",
    guests: 2,
    subtotal: 165.22,
    vat: 24.78,
    total: 190,
    paymentMethod: "Apple Pay",
    paymentReference: "PAY-8789021",
    status: "COMPLETED",
  },
  {
    id: "AL-B-240897",
    customer: "نورة صالح",
    phone: "+966 56 102 4471",
    service: "متحف وبستان الصافية",
    serviceDate: "01 سبتمبر 2026 - 07:00 م",
    bookedAt: "30 أغسطس 2026 - 06:44 م",
    guests: 3,
    subtotal: 182.61,
    vat: 27.39,
    total: 210,
    paymentMethod: "بطاقة مدى",
    paymentReference: "PAY-8787440",
    status: "SETTLEMENT_ELIGIBLE",
  },
  {
    id: "AL-B-240881",
    customer: "خالد حسن",
    phone: "+966 54 019 7100",
    service: "جولة المدينة التاريخية",
    serviceDate: "29 أغسطس 2026 - 05:00 م",
    bookedAt: "28 أغسطس 2026 - 11:25 ص",
    guests: 1,
    subtotal: 121.74,
    vat: 18.26,
    total: 140,
    paymentMethod: "Visa",
    paymentReference: "PAY-8786014",
    status: "SETTLED",
  },
  {
    id: "AL-B-240866",
    customer: "مها إبراهيم",
    phone: "+966 55 991 1002",
    service: "تجربة طعام مدينية",
    serviceDate: "28 أغسطس 2026 - 08:00 م",
    bookedAt: "27 أغسطس 2026 - 03:18 م",
    guests: 2,
    subtotal: 165.22,
    vat: 24.78,
    total: 190,
    paymentMethod: "Mastercard",
    paymentReference: "PAY-8785110",
    status: "REFUNDED",
  },
];

const statusConfig: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  NEW: {
    label: "طلب جديد",
    className: "bg-[#FFF3D4] text-[#8C6813]",
  },
  PAID: {
    label: "مدفوع",
    className: "bg-[#E7F1FF] text-[#315D8A]",
  },
  CONFIRMED: {
    label: "مؤكد",
    className: "bg-[#E8F3EF] text-[#2A6D58]",
  },
  IN_PROGRESS: {
    label: "قيد التنفيذ",
    className: "bg-[#EDEBFF] text-[#60539B]",
  },
  COMPLETED: {
    label: "مكتمل",
    className: "bg-[#E6F5EB] text-[#267247]",
  },
  SETTLEMENT_ELIGIBLE: {
    label: "مستحق للتسوية",
    className: "bg-[#FFF0C6] text-[#8B6812]",
  },
  SETTLED: {
    label: "تمت التسوية",
    className: "bg-[#DFF4E7] text-[#17643B]",
  },
  CANCELLED: {
    label: "ملغي",
    className: "bg-[#FFE9E7] text-[#A3443E]",
  },
  PARTIAL_REFUND: {
    label: "استرداد جزئي",
    className: "bg-[#FFF0E8] text-[#9A5B31]",
  },
  REFUNDED: {
    label: "مسترد كليًا",
    className: "bg-[#FFE7E5] text-[#A43D38]",
  },
  DISPUTED: {
    label: "نزاع",
    className: "bg-[#F6E8FF] text-[#7A4A91]",
  },
};

const money = (value: number) =>
  new Intl.NumberFormat("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function PartnerBookingsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | BookingStatus>("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");

  const services = useMemo(
    () => Array.from(new Set(bookings.map((booking) => booking.service))),
    []
  );

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const searchable =
        `${booking.id} ${booking.customer} ${booking.phone} ${booking.service} ${booking.paymentReference}`.toLowerCase();

      const matchesSearch = searchable.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || booking.status === statusFilter;

      const matchesService =
        serviceFilter === "ALL" || booking.service === serviceFilter;

      return matchesSearch && matchesStatus && matchesService;
    });
  }, [search, statusFilter, serviceFilter]);

  const summary = useMemo(() => {
    const totalValue = bookings.reduce((sum, booking) => sum + booking.total, 0);

    return {
      count: bookings.length,
      totalValue,
      newCount: bookings.filter((booking) => booking.status === "NEW").length,
      settlementEligible: bookings
        .filter((booking) => booking.status === "SETTLEMENT_ELIGIBLE")
        .reduce((sum, booking) => sum + booking.total, 0),
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
        <div className="absolute -left-32 top-[45%] h-[420px] w-[420px] rounded-full bg-[#D4AF37]/9 blur-[120px]" />
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

            <NavItem
              href="/partner/bookings"
              label="الحجوزات"
              icon="▣"
              active
            />

            <NavItem href="/partner/services" label="الخدمات" icon="◈" />

            <NavItem href="/partner/settlements" label="التسويات" icon="﷼" />

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
              BOOKINGS
            </p>

            <p className="mt-2 text-sm font-bold">
              {summary.newCount} طلب جديد
            </p>

            <p className="mt-2 text-xs leading-6 text-white/50">
              راجع الطلبات الجديدة وأكد إمكانية تنفيذ الخدمة.
            </p>
          </div>
        </aside>

        {/* CONTENT */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-[#0D3B34]/8 bg-[#F9F7F0]/90 backdrop-blur-xl">
            <div className="flex items-center justify-between px-5 py-4 md:px-8">
              <div>
                <p className="text-[10px] text-[#0D3B34]/45">تجارب المدينة</p>
                <p className="mt-1 text-sm font-bold">إدارة الحجوزات</p>
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
            <section className="mb-7">
              <p className="text-[10px] font-bold tracking-[0.22em] text-[#B99124]">
                BOOKINGS MANAGEMENT
              </p>

              <h1
                className="mt-2 text-3xl font-bold md:text-[42px]"
                style={{
                  fontFamily: "var(--font-el-messiri), serif",
                }}
              >
                الحجوزات
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#0D3B34]/60">
                تابع طلبات العملاء وحالة الدفع والتنفيذ والتسوية لكل حجز.
              </p>
            </section>

            {/* SUMMARY */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard label="إجمالي الحجوزات" value={String(summary.count)} />

              <SummaryCard
                label="قيمة الحجوزات"
                value={`${money(summary.totalValue)} ر.س`}
              />

              <SummaryCard
                label="طلبات جديدة"
                value={String(summary.newCount)}
                highlight
              />

              <SummaryCard
                label="مستحق للتسوية"
                value={`${money(summary.settlementEligible)} ر.س`}
              />
            </section>

            {/* FILTERS */}
            <section className="mt-7 rounded-[28px] border border-white/80 bg-white/72 p-5 backdrop-blur-xl">
              <div className="grid gap-3 lg:grid-cols-[1fr_190px_220px_auto]">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث برقم الحجز، العميل، الجوال أو مرجع الدفع..."
                  className="h-12 rounded-2xl border border-[#0D3B34]/10 bg-[#FAF9F5] px-4 text-sm outline-none focus:border-[#D4AF37]/60"
                />

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as "ALL" | BookingStatus)
                  }
                  className="h-12 rounded-2xl border border-[#0D3B34]/10 bg-[#FAF9F5] px-4 text-sm outline-none"
                >
                  <option value="ALL">كل الحالات</option>
                  <option value="NEW">طلب جديد</option>
                  <option value="PAID">مدفوع</option>
                  <option value="CONFIRMED">مؤكد</option>
                  <option value="IN_PROGRESS">قيد التنفيذ</option>
                  <option value="COMPLETED">مكتمل</option>
                  <option value="SETTLEMENT_ELIGIBLE">مستحق للتسوية</option>
                  <option value="SETTLED">تمت التسوية</option>
                  <option value="CANCELLED">ملغي</option>
                  <option value="PARTIAL_REFUND">استرداد جزئي</option>
                  <option value="REFUNDED">مسترد كليًا</option>
                  <option value="DISPUTED">نزاع</option>
                </select>

                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="h-12 rounded-2xl border border-[#0D3B34]/10 bg-[#FAF9F5] px-4 text-sm outline-none"
                >
                  <option value="ALL">كل الخدمات</option>

                  {services.map((service) => (
                    <option key={service}>{service}</option>
                  ))}
                </select>

                <button
                  type="button"
                  className="h-12 rounded-2xl border border-[#0D3B34]/10 bg-white px-5 text-xs font-bold text-[#0D3B34]/65"
                >
                  تصدير CSV
                </button>
              </div>
            </section>

            {/* BOOKINGS TABLE */}
            <section className="mt-6 overflow-hidden rounded-[30px] border border-white/80 bg-white/72 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-[#0D3B34]/7 px-6 py-5">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
                    ORDERS
                  </p>

                  <h2 className="mt-1 text-xl font-bold">قائمة الحجوزات</h2>
                </div>

                <span className="rounded-full bg-[#0D3B34]/6 px-3 py-1.5 text-xs font-bold">
                  {filteredBookings.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-right">
                  <thead>
                    <tr className="border-b border-[#0D3B34]/8 bg-[#FAF9F5] text-[10px] text-[#0D3B34]/45">
                      <th className="px-6 py-4 font-semibold">الحجز</th>
                      <th className="px-4 py-4 font-semibold">العميل</th>
                      <th className="px-4 py-4 font-semibold">الخدمة</th>
                      <th className="px-4 py-4 font-semibold">تاريخ الخدمة</th>
                      <th className="px-4 py-4 font-semibold">الدفع</th>
                      <th className="px-4 py-4 font-semibold">الإجمالي</th>
                      <th className="px-4 py-4 font-semibold">الحالة</th>
                      <th className="px-6 py-4 font-semibold">التفاصيل</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredBookings.map((booking) => {
                      const status = statusConfig[booking.status];

                      return (
                        <tr
                          key={booking.id}
                          className="border-b border-[#0D3B34]/6 last:border-0 hover:bg-[#FBFAF7]"
                        >
                          <td className="px-6 py-5">
                            <p className="text-xs font-bold">{booking.id}</p>

                            <p className="mt-1 text-[10px] text-[#0D3B34]/40">
                              {booking.bookedAt}
                            </p>
                          </td>

                          <td className="px-4 py-5">
                            <p className="text-xs font-bold">
                              {booking.customer}
                            </p>

                            <p className="mt-1 text-[10px] text-[#0D3B34]/45" dir="ltr">
                              {booking.phone}
                            </p>
                          </td>

                          <td className="px-4 py-5">
                            <p className="text-xs font-semibold">
                              {booking.service}
                            </p>

                            <p className="mt-1 text-[10px] text-[#0D3B34]/40">
                              {booking.guests} زائر
                            </p>
                          </td>

                          <td className="px-4 py-5 text-xs text-[#0D3B34]/65">
                            {booking.serviceDate}
                          </td>

                          <td className="px-4 py-5">
                            <p className="text-xs font-semibold">
                              {booking.paymentMethod}
                            </p>

                            <p className="mt-1 text-[10px] text-[#0D3B34]/40">
                              {booking.paymentReference}
                            </p>
                          </td>

                          <td className="px-4 py-5">
                            <p className="text-sm font-bold">
                              {money(booking.total)} ر.س
                            </p>

                            <p className="mt-1 text-[10px] text-[#0D3B34]/40">
                              شامل الضريبة
                            </p>
                          </td>

                          <td className="px-4 py-5">
                            <span
                              className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <Link
                              href={`/partner/bookings/${booking.id}`}
                              className="inline-flex rounded-xl border border-[#0D3B34]/10 bg-white px-3 py-2 text-[10px] font-bold text-[#0D3B34]/65"
                            >
                              عرض الحجز
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredBookings.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <p className="text-sm font-bold">لا توجد حجوزات مطابقة</p>

                  <p className="mt-2 text-xs text-[#0D3B34]/45">
                    جرّب تغيير خيارات البحث أو التصفية.
                  </p>
                </div>
              )}
            </section>

            {/* FLOW */}
            <section className="mt-7 rounded-[30px] bg-[#0D3B34] p-6 text-white md:p-8">
              <p className="text-[10px] font-bold tracking-[0.18em] text-[#E5BF45]">
                BOOKING LIFECYCLE
              </p>

              <h2
                className="mt-2 text-2xl font-bold"
                style={{
                  fontFamily: "var(--font-el-messiri), serif",
                }}
              >
                دورة الحجز
              </h2>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                {[
                  ["01", "تم الدفع"],
                  ["02", "تأكيد المورد"],
                  ["03", "قيد التنفيذ"],
                  ["04", "مكتمل"],
                  ["05", "تحقق الزيارة"],
                  ["06", "مستحق للتسوية"],
                  ["07", "تمت التسوية"],
                ].map(([number, label]) => (
                  <div
                    key={number}
                    className="rounded-[18px] border border-white/10 bg-white/6 p-4"
                  >
                    <p className="text-[10px] font-bold text-[#E6C24D]">
                      {number}
                    </p>

                    <p className="mt-2 text-xs font-bold">{label}</p>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-xs leading-6 text-white/45">
                حالات الإلغاء والاسترداد والنزاع تعمل كمسارات استثنائية
                منفصلة وتؤثر مباشرة على الفواتير والتسويات.
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* MOBILE NAV */}
      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-[560px] -translate-x-1/2 items-center justify-around rounded-[22px] border border-white/80 bg-[#F9F7F0]/94 px-2 py-2 backdrop-blur-xl xl:hidden">
        <MobileNav href="/partner/dashboard" label="الرئيسية" />
        <MobileNav href="/partner/bookings" label="الحجوزات" active />
        <MobileNav href="/partner/services" label="الخدمات" />
        <MobileNav href="/partner/settlements" label="التسويات" />
        <MobileNav href="/partner/business" label="المنشأة" />
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

      {label}
    </Link>
  );
}

function SummaryCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
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
          highlight ? "text-white/48" : "text-[#0D3B34]/45"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-bold ${
          highlight ? "text-[#F1C94C]" : ""
        }`}
      >
        {value}
      </p>
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