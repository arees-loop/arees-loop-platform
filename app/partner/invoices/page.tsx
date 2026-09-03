"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type InvoiceStatus =
  | "ISSUED"
  | "REFUNDED"
  | "PARTIAL_REFUND"
  | "CANCELLED";

type Invoice = {
  id: string;
  bookingId: string;
  settlementId?: string;

  issueDate: string;
  supplyDate: string;

  customerName: string;
  customerPhone: string;

  serviceAr: string;
  serviceEn: string;

  quantity: number;

  unitPriceBeforeVat: number;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;

  paymentMethod: string;
  paymentReference: string;

  status: InvoiceStatus;
};

const invoices: Invoice[] = [
  {
    id: "INV-2026-000124",
    bookingId: "AL-B-240915",
    settlementId: "SET-260903",

    issueDate: "03 سبتمبر 2026 - 02:16 م",
    supplyDate: "05 سبتمبر 2026",

    customerName: "محمد عبدالله",
    customerPhone: "+966 55 821 4480",

    serviceAr: "متحف وبستان الصافية",
    serviceEn: "Al Safiya Museum & Garden",

    quantity: 2,

    unitPriceBeforeVat: 60.87,
    subtotal: 121.74,
    vatRate: 15,
    vatAmount: 18.26,
    total: 140,

    paymentMethod: "بطاقة مدى",
    paymentReference: "PAY-8791442",

    status: "ISSUED",
  },

  {
    id: "INV-2026-000123",
    bookingId: "AL-B-240914",
    settlementId: "SET-260903",

    issueDate: "03 سبتمبر 2026 - 12:41 م",
    supplyDate: "06 سبتمبر 2026",

    customerName: "سارة أحمد",
    customerPhone: "+966 53 442 8177",

    serviceAr: "جولة المدينة التاريخية",
    serviceEn: "Historic Madinah Tour",

    quantity: 2,

    unitPriceBeforeVat: 121.74,
    subtotal: 243.48,
    vatRate: 15,
    vatAmount: 36.52,
    total: 280,

    paymentMethod: "Visa",
    paymentReference: "PAY-8791388",

    status: "ISSUED",
  },

  {
    id: "INV-2026-000118",
    bookingId: "AL-B-240902",
    settlementId: "SET-260903",

    issueDate: "01 سبتمبر 2026 - 09:13 م",
    supplyDate: "02 سبتمبر 2026",

    customerName: "عبدالعزيز علي",
    customerPhone: "+966 50 281 2299",

    serviceAr: "تجربة طعام مدينية",
    serviceEn: "Madinah Food Experience",

    quantity: 2,

    unitPriceBeforeVat: 82.61,
    subtotal: 165.22,
    vatRate: 15,
    vatAmount: 24.78,
    total: 190,

    paymentMethod: "Apple Pay",
    paymentReference: "PAY-8789021",

    status: "ISSUED",
  },

  {
    id: "INV-2026-000107",
    bookingId: "AL-B-240866",

    issueDate: "27 أغسطس 2026 - 03:19 م",
    supplyDate: "28 أغسطس 2026",

    customerName: "مها إبراهيم",
    customerPhone: "+966 55 991 1002",

    serviceAr: "تجربة طعام مدينية",
    serviceEn: "Madinah Food Experience",

    quantity: 2,

    unitPriceBeforeVat: 82.61,
    subtotal: 165.22,
    vatRate: 15,
    vatAmount: 24.78,
    total: 190,

    paymentMethod: "Mastercard",
    paymentReference: "PAY-8785110",

    status: "REFUNDED",
  },
];

const statusConfig: Record<
  InvoiceStatus,
  {
    label: string;
    className: string;
  }
> = {
  ISSUED: {
    label: "صادرة",
    className: "bg-[#E6F5EB] text-[#267247]",
  },

  REFUNDED: {
    label: "مستردة",
    className: "bg-[#FFE9E7] text-[#A3443E]",
  },

  PARTIAL_REFUND: {
    label: "استرداد جزئي",
    className: "bg-[#FFF0E8] text-[#9A5B31]",
  },

  CANCELLED: {
    label: "ملغاة",
    className: "bg-[#F0EFEB] text-[#687873]",
  },
};

const money = (value: number) =>
  new Intl.NumberFormat("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function PartnerInvoicesPage() {
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "ALL" | InvoiceStatus
  >("ALL");

  const [selectedInvoice, setSelectedInvoice] =
    useState<Invoice | null>(null);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const searchable =
        `${invoice.id} ${invoice.bookingId} ${invoice.customerName} ${invoice.customerPhone} ${invoice.serviceAr} ${invoice.serviceEn} ${invoice.paymentReference}`.toLowerCase();

      const matchesSearch = searchable.includes(
        search.toLowerCase()
      );

      const matchesStatus =
        statusFilter === "ALL" ||
        invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const summary = useMemo(() => {
    const issued = invoices.filter(
      (invoice) => invoice.status === "ISSUED"
    );

    const issuedTotal = issued.reduce(
      (sum, invoice) => sum + invoice.total,
      0
    );

    const vatTotal = issued.reduce(
      (sum, invoice) => sum + invoice.vatAmount,
      0
    );

    return {
      total: invoices.length,
      issued: issued.length,
      issuedTotal,
      vatTotal,
    };
  }, []);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F7F4EA] text-[#0D3B34]"
      style={{
        fontFamily:
          "var(--font-ibm-plex-arabic), sans-serif",
      }}
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-[#0D3B34]/6 blur-[120px]" />

        <div className="absolute -left-40 top-[42%] h-[450px] w-[450px] rounded-full bg-[#D4AF37]/9 blur-[125px]" />
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
                fontFamily:
                  "var(--font-el-messiri), serif",
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
              active
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
              TAX INVOICING
            </p>

            <p className="mt-2 text-sm font-bold">
              الفوترة الإلكترونية
            </p>

            <p className="mt-2 text-xs leading-6 text-white/50">
              تعرض الفاتورة بيانات المورد والضريبة والحجز
              والمبالغ المرتبطة بالعملية.
            </p>
          </div>
        </aside>

        {/* CONTENT */}
        <div className="min-w-0 flex-1">
          {/* HEADER */}
          <header className="sticky top-0 z-40 border-b border-[#0D3B34]/8 bg-[#F9F7F0]/90 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-8">
              <div>
                <p className="text-[10px] text-[#0D3B34]/45">
                  تجارب المدينة
                </p>

                <p className="mt-1 text-sm font-bold">
                  الفواتير
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
                  TAX INVOICES
                </p>

                <h1
                  className="mt-2 text-3xl font-bold md:text-[42px]"
                  style={{
                    fontFamily:
                      "var(--font-el-messiri), serif",
                  }}
                >
                  الفواتير
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#0D3B34]/60">
                  استعرض الفواتير المرتبطة بحجوزات العملاء
                  والمبيعات والتسويات، مع تفاصيل ضريبة القيمة
                  المضافة.
                </p>
              </div>

              <button
                type="button"
                className="rounded-2xl border border-[#0D3B34]/10 bg-white px-5 py-3 text-xs font-bold text-[#0D3B34]/65"
              >
                تصدير سجل الفواتير
              </button>
            </section>

            {/* SUMMARY */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="إجمالي الفواتير"
                value={String(summary.total)}
              />

              <SummaryCard
                label="الفواتير الصادرة"
                value={String(summary.issued)}
                success
              />

              <SummaryCard
                label="قيمة الفواتير الصادرة"
                value={`${money(
                  summary.issuedTotal
                )} ر.س`}
              />

              <SummaryCard
                label="إجمالي VAT"
                value={`${money(summary.vatTotal)} ر.س`}
                highlight
              />
            </section>

            {/* FILTERS */}
            <section className="mt-7 rounded-[28px] border border-white/80 bg-white/72 p-5 backdrop-blur-xl">
              <div className="grid gap-3 lg:grid-cols-[1fr_210px]">
                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="ابحث برقم الفاتورة، الحجز، العميل، الخدمة أو مرجع الدفع..."
                  className={inputClass}
                />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as
                        | "ALL"
                        | InvoiceStatus
                    )
                  }
                  className={inputClass}
                >
                  <option value="ALL">
                    كل الحالات
                  </option>

                  <option value="ISSUED">
                    صادرة
                  </option>

                  <option value="REFUNDED">
                    مستردة
                  </option>

                  <option value="PARTIAL_REFUND">
                    استرداد جزئي
                  </option>

                  <option value="CANCELLED">
                    ملغاة
                  </option>
                </select>
              </div>
            </section>

            {/* TABLE */}
            <section className="mt-6 overflow-hidden rounded-[30px] border border-white/80 bg-white/72 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-[#0D3B34]/7 px-6 py-5">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.17em] text-[#B99124]">
                    INVOICE REGISTER
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    سجل الفواتير
                  </h2>
                </div>

                <span className="rounded-full bg-[#0D3B34]/6 px-3 py-1.5 text-xs font-bold">
                  {filteredInvoices.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1150px] text-right">
                  <thead>
                    <tr className="border-b border-[#0D3B34]/8 bg-[#FAF9F5] text-[10px] text-[#0D3B34]/45">
                      <th className="px-6 py-4 font-semibold">
                        الفاتورة
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        الحجز
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        العميل
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        الخدمة
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        قبل الضريبة
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        VAT
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        الإجمالي
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
                    {filteredInvoices.map(
                      (invoice) => {
                        const status =
                          statusConfig[
                            invoice.status
                          ];

                        return (
                          <tr
                            key={invoice.id}
                            className="border-b border-[#0D3B34]/6 last:border-0 hover:bg-[#FBFAF7]"
                          >
                            <td className="px-6 py-5">
                              <p className="text-xs font-bold">
                                {invoice.id}
                              </p>

                              <p className="mt-1 text-[10px] text-[#0D3B34]/45">
                                {invoice.issueDate}
                              </p>
                            </td>

                            <td className="px-4 py-5">
                              <p className="text-xs font-semibold">
                                {invoice.bookingId}
                              </p>

                              {invoice.settlementId && (
                                <p className="mt-1 text-[10px] text-[#0D3B34]/40">
                                  {
                                    invoice.settlementId
                                  }
                                </p>
                              )}
                            </td>

                            <td className="px-4 py-5">
                              <p className="text-xs font-bold">
                                {
                                  invoice.customerName
                                }
                              </p>

                              <p
                                className="mt-1 text-[10px] text-[#0D3B34]/45"
                                dir="ltr"
                              >
                                {
                                  invoice.customerPhone
                                }
                              </p>
                            </td>

                            <td className="px-4 py-5">
                              <p className="text-xs font-semibold">
                                {
                                  invoice.serviceAr
                                }
                              </p>

                              <p
                                className="mt-1 text-[10px] text-[#0D3B34]/40"
                                dir="ltr"
                              >
                                {
                                  invoice.serviceEn
                                }
                              </p>
                            </td>

                            <td className="px-4 py-5 text-xs font-semibold">
                              {money(
                                invoice.subtotal
                              )}{" "}
                              ر.س
                            </td>

                            <td className="px-4 py-5">
                              <p className="text-xs font-semibold">
                                {money(
                                  invoice.vatAmount
                                )}{" "}
                                ر.س
                              </p>

                              <p className="mt-1 text-[10px] text-[#0D3B34]/40">
                                {
                                  invoice.vatRate
                                }
                                %
                              </p>
                            </td>

                            <td className="px-4 py-5 text-sm font-bold">
                              {money(
                                invoice.total
                              )}{" "}
                              ر.س
                            </td>

                            <td className="px-4 py-5">
                              <span
                                className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${status.className}`}
                              >
                                {
                                  status.label
                                }
                              </span>
                            </td>

                            <td className="px-6 py-5">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedInvoice(
                                    invoice
                                  )
                                }
                                className="rounded-xl border border-[#0D3B34]/10 bg-white px-3 py-2 text-[10px] font-bold text-[#0D3B34]/65"
                              >
                                عرض الفاتورة
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {filteredInvoices.length ===
                0 && (
                <div className="px-6 py-16 text-center">
                  <p className="text-sm font-bold">
                    لا توجد فواتير مطابقة
                  </p>

                  <p className="mt-2 text-xs text-[#0D3B34]/45">
                    جرّب تغيير البحث أو حالة
                    الفاتورة.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* INVOICE DRAWER */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[100] bg-[#071E1A]/45 backdrop-blur-sm print:bg-white">
          <div className="absolute inset-y-0 left-0 w-full max-w-[760px] overflow-y-auto bg-[#F5F1E8] print:relative print:inset-auto print:max-w-none print:overflow-visible print:bg-white">
            {/* DRAWER HEADER */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#0D3B34]/8 bg-[#F8F5ED]/95 px-6 py-5 backdrop-blur-xl print:hidden">
              <div>
                <p className="text-[10px] font-bold tracking-[0.17em] text-[#B99124]">
                  TAX INVOICE
                </p>

                <h2
                  className="mt-1 text-2xl font-bold"
                  style={{
                    fontFamily:
                      "var(--font-el-messiri), serif",
                  }}
                >
                  الفاتورة الضريبية
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedInvoice(null)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0D3B34]/10 bg-white text-lg"
              >
                ×
              </button>
            </div>

            <div className="p-5 md:p-7 print:p-0">
              <InvoiceDocument
                invoice={selectedInvoice}
              />

              <div className="mt-5 grid gap-3 sm:grid-cols-2 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-2xl bg-[#0D3B34] px-5 py-3.5 text-xs font-bold text-white"
                >
                  طباعة / حفظ PDF
                </button>

                <button
                  type="button"
                  className="rounded-2xl border border-[#0D3B34]/10 bg-white px-5 py-3.5 text-xs font-bold text-[#0D3B34]/65"
                >
                  إرسال للعميل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE NAV */}
      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-[560px] -translate-x-1/2 items-center justify-around rounded-[22px] border border-white/80 bg-[#F9F7F0]/94 px-2 py-2 backdrop-blur-xl xl:hidden print:hidden">
        <MobileNav
          href="/partner/dashboard"
          label="الرئيسية"
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
          href="/partner/invoices"
          label="الفواتير"
          active
        />
      </nav>
    </main>
  );
}

/* ========================================================
   TAX INVOICE DOCUMENT
======================================================== */

function InvoiceDocument({
  invoice,
}: {
  invoice: Invoice;
}) {
  const supplier = {
    nameAr:
      "شركة تجارب المدينة السياحية المحدودة",
    nameEn:
      "Madinah Experiences Tourism Company Ltd.",

    tradeNameAr: "تجارب المدينة",
    tradeNameEn: "Madinah Experiences",

    vatNumber: "310123456700003",
    crNumber: "4650123456",
    unifiedNumber: "7037003618",

    addressAr:
      "المدينة المنورة، المملكة العربية السعودية",

    addressEn:
      "Madinah, Kingdom of Saudi Arabia",
  };

  return (
    <article
      id="tax-invoice"
      className="overflow-hidden rounded-[30px] border border-[#0D3B34]/10 bg-white print:rounded-none print:border-0"
    >
      {/* TOP */}
      <div className="bg-[#0D3B34] p-6 text-white md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-[#E7C34D]">
              TAX INVOICE
            </p>

            <h1
              className="mt-2 text-3xl font-bold"
              style={{
                fontFamily:
                  "var(--font-el-messiri), serif",
              }}
            >
              فاتورة ضريبية
            </h1>

            <p className="mt-2 text-sm font-bold text-white/75">
              Tax Invoice
            </p>
          </div>

          <div className="rounded-[20px] bg-white/8 px-5 py-4">
            <p className="text-[10px] text-white/45">
              رقم الفاتورة
            </p>

            <p
              className="mt-1 text-sm font-bold"
              dir="ltr"
            >
              {invoice.id}
            </p>
          </div>
        </div>
      </div>

      {/* SUPPLIER */}
      <div className="grid border-b border-[#0D3B34]/8 md:grid-cols-2">
        <div className="p-6 md:p-7">
          <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
            SUPPLIER / SERVICE PROVIDER
          </p>

          <h2 className="mt-3 text-lg font-bold">
            {supplier.nameAr}
          </h2>

          <p
            className="mt-1 text-xs font-semibold text-[#0D3B34]/60"
            dir="ltr"
          >
            {supplier.nameEn}
          </p>

          <div className="mt-5 space-y-3">
            <InvoiceInfo
              ar="الاسم التجاري"
              en="Trade Name"
              value={`${supplier.tradeNameAr} / ${supplier.tradeNameEn}`}
            />

            <InvoiceInfo
              ar="السجل التجاري"
              en="Commercial Registration"
              value={supplier.crNumber}
            />

            <InvoiceInfo
              ar="الرقم الموحد"
              en="Unified Number"
              value={supplier.unifiedNumber}
            />

            <InvoiceInfo
              ar="الرقم الضريبي"
              en="VAT Registration Number"
              value={supplier.vatNumber}
            />
          </div>
        </div>

        <div className="border-t border-[#0D3B34]/8 p-6 md:border-r md:border-t-0 md:p-7">
          <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
            INVOICE DETAILS
          </p>

          <div className="mt-5 space-y-3">
            <InvoiceInfo
              ar="تاريخ إصدار الفاتورة"
              en="Invoice Issue Date"
              value={invoice.issueDate}
            />

            <InvoiceInfo
              ar="تاريخ تقديم الخدمة"
              en="Date of Supply"
              value={invoice.supplyDate}
            />

            <InvoiceInfo
              ar="رقم الحجز"
              en="Booking Reference"
              value={invoice.bookingId}
            />

            <InvoiceInfo
              ar="مرجع الدفع"
              en="Payment Reference"
              value={invoice.paymentReference}
            />
          </div>
        </div>
      </div>

      {/* CUSTOMER */}
      <div className="border-b border-[#0D3B34]/8 bg-[#FAF9F5] p-6 md:p-7">
        <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
          CUSTOMER
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <InvoiceInfo
            ar="اسم العميل"
            en="Customer Name"
            value={invoice.customerName}
          />

          <InvoiceInfo
            ar="رقم التواصل"
            en="Contact Number"
            value={invoice.customerPhone}
          />
        </div>
      </div>

      {/* ITEMS */}
      <div className="p-6 md:p-7">
        <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
          INVOICE ITEMS
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[650px] text-right">
            <thead>
              <tr className="border-b border-[#0D3B34]/10 text-[10px] text-[#0D3B34]/50">
                <th className="pb-3 font-semibold">
                  الخدمة / Service
                </th>

                <th className="pb-3 font-semibold">
                  الكمية / Qty
                </th>

                <th className="pb-3 font-semibold">
                  سعر الوحدة قبل الضريبة
                </th>

                <th className="pb-3 font-semibold">
                  VAT
                </th>

                <th className="pb-3 font-semibold">
                  الإجمالي
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="py-5">
                  <p className="text-sm font-bold">
                    {invoice.serviceAr}
                  </p>

                  <p
                    className="mt-1 text-[11px] text-[#0D3B34]/50"
                    dir="ltr"
                  >
                    {invoice.serviceEn}
                  </p>
                </td>

                <td className="py-5 text-sm font-semibold">
                  {invoice.quantity}
                </td>

                <td className="py-5 text-sm font-semibold">
                  {money(
                    invoice.unitPriceBeforeVat
                  )}{" "}
                  ر.س
                </td>

                <td className="py-5 text-sm font-semibold">
                  {invoice.vatRate}%
                </td>

                <td className="py-5 text-sm font-bold">
                  {money(invoice.total)} ر.س
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* TOTAL + QR */}
      <div className="grid border-t border-[#0D3B34]/8 md:grid-cols-[1fr_220px]">
        <div className="p-6 md:p-7">
          <div className="space-y-4">
            <TotalRow
              labelAr="الإجمالي قبل الضريبة"
              labelEn="Subtotal excluding VAT"
              value={invoice.subtotal}
            />

            <TotalRow
              labelAr={`ضريبة القيمة المضافة ${invoice.vatRate}%`}
              labelEn={`VAT ${invoice.vatRate}%`}
              value={invoice.vatAmount}
            />

            <div className="flex items-center justify-between gap-5 border-t border-[#0D3B34]/10 pt-5">
              <div>
                <p className="text-sm font-bold">
                  الإجمالي شامل الضريبة
                </p>

                <p className="mt-1 text-[10px] text-[#0D3B34]/45">
                  Total Including VAT
                </p>
              </div>

              <p className="text-2xl font-bold text-[#267247]">
                {money(invoice.total)} ر.س
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center border-t border-[#0D3B34]/8 bg-[#F8F7F2] p-6 md:border-r md:border-t-0">
          <PrototypeQr />

          <p className="mt-3 text-center text-[10px] font-bold text-[#0D3B34]/55">
            رمز الاستجابة السريعة
          </p>

          <p className="mt-1 text-center text-[9px] text-[#0D3B34]/40">
            QR Code
          </p>
        </div>
      </div>

      {/* PAYMENT */}
      <div className="border-t border-[#0D3B34]/8 bg-[#FAF9F5] p-6 md:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <InvoiceInfo
            ar="وسيلة الدفع"
            en="Payment Method"
            value={invoice.paymentMethod}
          />

          <InvoiceInfo
            ar="حالة الدفع"
            en="Payment Status"
            value={
              invoice.status === "REFUNDED"
                ? "مسترد / Refunded"
                : "مدفوع / Paid"
            }
          />
        </div>
      </div>

      {/* PLATFORM NOTE */}
      <div className="border-t border-[#0D3B34]/8 p-6 md:p-7">
        <div className="rounded-[20px] border border-[#D4AF37]/20 bg-[#FFF9E8] p-4">
          <p className="text-[10px] font-bold tracking-[0.15em] text-[#B99124]">
            PLATFORM NOTE
          </p>

          <p className="mt-2 text-xs leading-6 text-[#0D3B34]/65">
            تم إنشاء هذه الفاتورة إلكترونيًا من خلال
            Arees Loop لصالح مقدم الخدمة الموضح أعلاه،
            استنادًا إلى بيانات المنشأة والحجز المسجلة
            في المنصة.
          </p>

          <p
            className="mt-2 text-[10px] leading-5 text-[#0D3B34]/45"
            dir="ltr"
          >
            This invoice was electronically generated
            through Arees Loop for the service provider
            identified above.
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col gap-2 border-t border-[#0D3B34]/8 bg-[#0D3B34] px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] text-white/50">
          Arees Loop — Smart Visitor Experience Platform
        </p>

        <p className="text-[10px] font-bold text-[#E6C24D]">
          ELECTRONIC TAX INVOICE
        </p>
      </div>
    </article>
  );
}

function PrototypeQr() {
  const pattern = [
    1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1,
    1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1,
    1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1,
    1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1,
    0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0,
    1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1,
    0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0,
    1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1,
    1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1,
    1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1,
  ];

  return (
    <div className="rounded-lg bg-white p-2">
      <div className="grid h-[112px] w-[112px] grid-cols-12">
        {pattern.map((cell, index) => (
          <div
            key={index}
            className={
              cell
                ? "bg-[#111111]"
                : "bg-white"
            }
          />
        ))}
      </div>
    </div>
  );
}

function InvoiceInfo({
  ar,
  en,
  value,
}: {
  ar: string;
  en: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-2">
        <p className="text-[10px] text-[#0D3B34]/45">
          {ar}
        </p>

        <span className="text-[8px] text-[#0D3B34]/25">
          /
        </span>

        <p
          className="text-[9px] text-[#0D3B34]/35"
          dir="ltr"
        >
          {en}
        </p>
      </div>

      <p className="mt-1 break-words text-xs font-bold text-[#0D3B34]/75">
        {value}
      </p>
    </div>
  );
}

function TotalRow({
  labelAr,
  labelEn,
  value,
}: {
  labelAr: string;
  labelEn: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <div>
        <p className="text-xs font-semibold text-[#0D3B34]/65">
          {labelAr}
        </p>

        <p
          className="mt-1 text-[9px] text-[#0D3B34]/35"
          dir="ltr"
        >
          {labelEn}
        </p>
      </div>

      <p className="text-sm font-bold">
        {money(value)} ر.س
      </p>
    </div>
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
          ? "border-[#D4AF37]/25 bg-[#FFF8E4]"
          : "border-white/80 bg-white/72"
      }`}
    >
      <p className="text-xs text-[#0D3B34]/45">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-bold ${
          success
            ? "text-[#267247]"
            : highlight
            ? "text-[#A67B11]"
            : ""
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

const inputClass =
  "h-14 w-full rounded-2xl border border-[#0D3B34]/10 bg-[#FAF9F5] px-4 text-sm text-[#0D3B34] outline-none transition placeholder:text-[#0D3B34]/30 focus:border-[#D4AF37]/60 focus:bg-white";