"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

type BookingStatus =
  | "NEW"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

type SupportType =
  | "CUSTOMER"
  | "PAYMENT"
  | "SERVICE"
  | "SCHEDULE"
  | "REFUND"
  | "OTHER";

const statusMap: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  NEW: {
    label: "طلب جديد",
    className: "bg-[#FFF3D4] text-[#8A6512]",
  },
  CONFIRMED: {
    label: "تم التأكيد",
    className: "bg-[#E8F1FF] text-[#315D91]",
  },
  IN_PROGRESS: {
    label: "قيد التنفيذ",
    className: "bg-[#EEE9FF] text-[#5C4B9B]",
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

const supportTypeLabels: Record<SupportType, string> = {
  CUSTOMER: "مشكلة مرتبطة بالعميل",
  PAYMENT: "الدفع أو الفاتورة",
  SERVICE: "تنفيذ الخدمة",
  SCHEDULE: "التاريخ أو الموعد",
  REFUND: "إلغاء أو استرداد",
  OTHER: "أخرى",
};

export default function BookingDetailsPage() {
  const params = useParams();

  const bookingId =
    typeof params.id === "string"
      ? params.id
      : "AL-BK-260901";

  const [status, setStatus] =
    useState<BookingStatus>("NEW");

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [showSupport, setShowSupport] =
    useState(false);

  const [supportSent, setSupportSent] =
    useState(false);

  const [supportForm, setSupportForm] =
    useState({
      type: "CUSTOMER" as SupportType,
      subject: "",
      description: "",
      phone: "+966 55 123 4567",
    });

  const booking = {
    id: bookingId,

    createdAt: "03 سبتمبر 2026 - 04:42 م",

    service: {
      name: "جولة معالم المدينة المنورة",
      category: "تنظيم الرحلات السياحية",
      date: "05 سبتمبر 2026",
      time: "04:30 م",
      guests: 3,
      reference: "SRV-MED-1024",
    },

    customer: {
      name: "محمد أحمد علي",
      phone: "+966 55 123 4567",
      email: "customer@example.com",
    },

    payment: {
      status: "مدفوع",
      method: "بطاقة مدى",
      subtotal: 300,
      vat: 45,
      total: 345,
      currency: "SAR",
      transaction: "PAY-8849321",
    },

    invoice: {
      number: "INV-2026-00431",
      status: "صادرة",
    },

    settlement: {
      status: "بانتظار اكتمال الخدمة",
      expectedDate: "08 سبتمبر 2026",
      partnerNet: 310.5,
    },
  };

  const currentStatus = statusMap[status];

  const confirmBooking = () => {
    setStatus("CONFIRMED");
    setShowConfirm(false);
  };

  const startService = () => {
    setStatus("IN_PROGRESS");
  };

  const completeService = () => {
    setStatus("COMPLETED");
  };

  const printBooking = () => {
    window.print();
  };

  const submitSupportRequest = () => {
    if (
      !supportForm.subject.trim() ||
      !supportForm.description.trim()
    ) {
      return;
    }

    setSupportSent(true);
  };

  const closeSupportDrawer = () => {
    setShowSupport(false);

    setTimeout(() => {
      setSupportSent(false);

      setSupportForm({
        type: "CUSTOMER",
        subject: "",
        description: "",
        phone: "+966 55 123 4567",
      });
    }, 200);
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F7F4EA] text-[#0D3B34] print:bg-white"
      style={{
        fontFamily:
          "var(--font-ibm-plex-arabic), sans-serif",
      }}
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden print:hidden">
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-[#0D3B34]/6 blur-[120px]" />

        <div className="absolute -left-40 top-[45%] h-[450px] w-[450px] rounded-full bg-[#D4AF37]/9 blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden w-[270px] shrink-0 border-l border-[#0D3B34]/8 bg-[#F9F7F0]/92 px-4 py-5 backdrop-blur-xl xl:block print:hidden">
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
              active
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
        </aside>

        {/* CONTENT */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-[#0D3B34]/8 bg-[#F9F7F0]/90 backdrop-blur-xl print:static print:border-0 print:bg-white">
            <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-8">
              <div>
                <p className="text-[10px] text-[#0D3B34]/45">
                  الحجوزات
                </p>

                <p
                  className="mt-1 text-sm font-bold"
                  dir="ltr"
                >
                  {booking.id}
                </p>
              </div>

              <Link
                href="/partner/bookings"
                className="rounded-full border border-[#0D3B34]/10 bg-white px-4 py-2.5 text-xs font-bold print:hidden"
              >
                ← العودة للحجوزات
              </Link>
            </div>
          </header>

          <div
            id="booking-print-area"
            className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 print:max-w-none print:px-0 print:py-0"
          >
            {/* PRINT HEADER */}
            <section className="mb-6 hidden border-b border-[#0D3B34]/15 pb-5 print:block">
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#B99124]">
                AREES LOOP PARTNER
              </p>

              <div className="mt-2 flex items-end justify-between gap-6">
                <div>
                  <h1
                    className="text-3xl font-bold"
                    style={{
                      fontFamily:
                        "var(--font-el-messiri), serif",
                    }}
                  >
                    تفاصيل الحجز
                  </h1>

                  <p className="mt-2 text-xs text-[#0D3B34]/55">
                    Booking Details
                  </p>
                </div>

                <div className="text-left">
                  <p
                    className="text-sm font-bold"
                    dir="ltr"
                  >
                    {booking.id}
                  </p>

                  <p className="mt-1 text-[10px] text-[#0D3B34]/45">
                    {booking.createdAt}
                  </p>
                </div>
              </div>
            </section>

            {/* TITLE */}
            <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between print:hidden">
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#B99124]">
                  BOOKING DETAILS
                </p>

                <h1
                  className="mt-2 text-3xl font-bold md:text-[40px]"
                  style={{
                    fontFamily:
                      "var(--font-el-messiri), serif",
                  }}
                >
                  تفاصيل الحجز
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-4 py-2 text-xs font-bold ${currentStatus.className}`}
                  >
                    {currentStatus.label}
                  </span>

                  <span
                    className="text-xs text-[#0D3B34]/45"
                    dir="ltr"
                  >
                    {booking.id}
                  </span>

                  <span className="text-xs text-[#0D3B34]/45">
                    {booking.createdAt}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {status === "NEW" && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirm(true)
                    }
                    className="rounded-2xl bg-[#0D3B34] px-6 py-3 text-xs font-bold text-white"
                  >
                    تأكيد الحجز
                  </button>
                )}

                {status === "CONFIRMED" && (
                  <button
                    type="button"
                    onClick={startService}
                    className="rounded-2xl bg-[#0D3B34] px-6 py-3 text-xs font-bold text-white"
                  >
                    بدء تنفيذ الخدمة
                  </button>
                )}

                {status === "IN_PROGRESS" && (
                  <button
                    type="button"
                    onClick={completeService}
                    className="rounded-2xl bg-[#267247] px-6 py-3 text-xs font-bold text-white"
                  >
                    إتمام الخدمة
                  </button>
                )}
              </div>
            </section>

            {/* TOP SUMMARY */}
            <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 print:grid-cols-4">
              <SummaryCard
                label="قيمة الحجز"
                value={`${booking.payment.total.toFixed(
                  2
                )} ر.س`}
              />

              <SummaryCard
                label="حالة الدفع"
                value={booking.payment.status}
                success
              />

              <SummaryCard
                label="عدد الضيوف"
                value={`${booking.service.guests}`}
              />

              <SummaryCard
                label="التسوية"
                value={
                  status === "COMPLETED"
                    ? "مؤهل للتسوية"
                    : "بانتظار التنفيذ"
                }
                gold
              />
            </section>

            <div className="mt-7 grid gap-6 xl:grid-cols-[1.25fr_0.75fr] print:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                {/* SERVICE */}
                <Card
                  eyebrow="SERVICE"
                  title="تفاصيل الخدمة"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Info
                      label="الخدمة"
                      value={booking.service.name}
                    />

                    <Info
                      label="التصنيف"
                      value={
                        booking.service.category
                      }
                    />

                    <Info
                      label="تاريخ الخدمة"
                      value={booking.service.date}
                    />

                    <Info
                      label="الوقت"
                      value={booking.service.time}
                    />

                    <Info
                      label="عدد الضيوف"
                      value={`${booking.service.guests} أشخاص`}
                    />

                    <Info
                      label="مرجع الخدمة"
                      value={
                        booking.service.reference
                      }
                      ltr
                    />
                  </div>
                </Card>

                {/* CUSTOMER */}
                <Card
                  eyebrow="CUSTOMER"
                  title="بيانات العميل"
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    <Info
                      label="اسم العميل"
                      value={booking.customer.name}
                    />

                    <Info
                      label="رقم الجوال"
                      value={booking.customer.phone}
                      ltr
                    />

                    <Info
                      label="البريد الإلكتروني"
                      value={booking.customer.email}
                      ltr
                    />
                  </div>

                  <div className="mt-4 rounded-[18px] bg-[#EEF3F0] p-4 print:border print:border-[#0D3B34]/10 print:bg-white">
                    <p className="text-xs leading-6 text-[#0D3B34]/55">
                      بيانات العميل متاحة للمورد لغرض تنفيذ هذا الحجز فقط ولا يجوز استخدامها لأغراض تسويقية أو التواصل خارج نطاق الخدمة.
                    </p>
                  </div>
                </Card>

                {/* PAYMENT */}
                <Card
                  eyebrow="PAYMENT"
                  title="الدفع والفاتورة"
                >
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Info
                      label="المبلغ قبل الضريبة"
                      value={`${booking.payment.subtotal.toFixed(
                        2
                      )} ر.س`}
                    />

                    <Info
                      label="ضريبة القيمة المضافة"
                      value={`${booking.payment.vat.toFixed(
                        2
                      )} ر.س`}
                    />

                    <Info
                      label="إجمالي العملية"
                      value={`${booking.payment.total.toFixed(
                        2
                      )} ر.س`}
                      strong
                    />

                    <Info
                      label="طريقة الدفع"
                      value={
                        booking.payment.method
                      }
                    />

                    <Info
                      label="مرجع الدفع"
                      value={
                        booking.payment.transaction
                      }
                      ltr
                    />

                    <Info
                      label="رقم الفاتورة"
                      value={
                        booking.invoice.number
                      }
                      ltr
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 print:hidden">
                    <Link
                      href="/partner/invoices"
                      className="rounded-xl bg-[#0D3B34] px-4 py-3 text-xs font-bold text-white"
                    >
                      عرض الفاتورة
                    </Link>

                    
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                {/* JOURNEY */}
                <Card
                  eyebrow="BOOKING JOURNEY"
                  title="مسار الحجز"
                >
                  <TimelineItem
                    title="تم إنشاء الحجز"
                    text="تم استلام الطلب والدفع بنجاح."
                    completed
                  />

                  <TimelineItem
                    title="تأكيد المورد"
                    text={
                      status === "NEW"
                        ? "بانتظار تأكيد الحجز."
                        : "تم تأكيد الحجز."
                    }
                    completed={status !== "NEW"}
                  />

                  <TimelineItem
                    title="تنفيذ الخدمة"
                    text={
                      status === "IN_PROGRESS"
                        ? "الخدمة قيد التنفيذ."
                        : status === "COMPLETED"
                        ? "تم تنفيذ الخدمة."
                        : "لم تبدأ الخدمة بعد."
                    }
                    completed={
                      status === "IN_PROGRESS" ||
                      status === "COMPLETED"
                    }
                  />

                  <TimelineItem
                    title="إتمام الخدمة"
                    text={
                      status === "COMPLETED"
                        ? "تم إغلاق الحجز بنجاح."
                        : "بانتظار إتمام الخدمة."
                    }
                    completed={
                      status === "COMPLETED"
                    }
                    last
                  />
                </Card>

                {/* SETTLEMENT */}
                <div className="rounded-[30px] bg-[#0D3B34] p-6 text-white print:border print:border-[#0D3B34]/20">
                  <p className="text-[10px] font-bold tracking-[0.16em] text-[#E6C24D]">
                    SETTLEMENT
                  </p>

                  <h2
                    className="mt-2 text-xl font-bold"
                    style={{
                      fontFamily:
                        "var(--font-el-messiri), serif",
                    }}
                  >
                    التسوية المالية
                  </h2>

                  <div className="mt-6 space-y-5">
                    <DarkInfo
                      label="حالة التسوية"
                      value={
                        status === "COMPLETED"
                          ? "مؤهل للتسوية"
                          : booking.settlement.status
                      }
                    />

                    <DarkInfo
                      label="صافي المورد المتوقع"
                      value={`${booking.settlement.partnerNet.toFixed(
                        2
                      )} ر.س`}
                    />

                    <DarkInfo
                      label="التاريخ المتوقع"
                      value={
                        booking.settlement
                          .expectedDate
                      }
                    />
                  </div>

                  <Link
                    href="/partner/settlements"
                    className="mt-6 block rounded-2xl bg-white/10 px-4 py-3 text-center text-xs font-bold text-white print:hidden"
                  >
                    فتح صفحة التسويات
                  </Link>
                </div>

                {/* SUPPORT */}
                <Card
                  eyebrow="SUPPORT"
                  title="مشكلة في الحجز؟"
                >
                  <p className="text-xs leading-6 text-[#0D3B34]/55">
                    إذا تعذر تنفيذ الخدمة أو كانت هناك مشكلة مرتبطة بالعميل أو تفاصيل الحجز، افتح طلب دعم قبل تغيير حالة الحجز.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setShowSupport(true)
                    }
                    className="mt-4 w-full rounded-2xl border border-[#0D3B34]/10 bg-[#FAF9F5] px-4 py-3 text-xs font-bold print:hidden"
                  >
                    طلب مساعدة
                  </button>
                </Card>
              </div>
            </div>

            <section className="mt-8 hidden border-t border-[#0D3B34]/10 pt-5 print:block">
              <div className="flex justify-between gap-5 text-[10px] text-[#0D3B34]/50">
                <p>
                  Arees Loop — Smart Visitor Experience Platform
                </p>

                <p dir="ltr">
                  {booking.id}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* CONFIRM BOOKING */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071E1A]/45 p-5 backdrop-blur-sm print:hidden">
          <div className="w-full max-w-[480px] rounded-[30px] bg-[#F9F7F0] p-6">
            <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
              CONFIRM BOOKING
            </p>

            <h2
              className="mt-2 text-2xl font-bold"
              style={{
                fontFamily:
                  "var(--font-el-messiri), serif",
              }}
            >
              تأكيد الحجز
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#0D3B34]/60">
              بتأكيد الحجز، أنت تؤكد توفر الخدمة في التاريخ والوقت المحددين والتزام المنشأة بتنفيذها للعميل.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={confirmBooking}
                className="flex-1 rounded-2xl bg-[#0D3B34] px-4 py-3 text-xs font-bold text-white"
              >
                نعم، تأكيد الحجز
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowConfirm(false)
                }
                className="rounded-2xl border border-[#0D3B34]/10 bg-white px-5 py-3 text-xs font-bold"
              >
                رجوع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT DRAWER */}
      {showSupport && (
        <div className="fixed inset-0 z-[110] bg-[#071E1A]/45 backdrop-blur-sm print:hidden">
          <div className="absolute inset-y-0 left-0 w-full max-w-[620px] overflow-y-auto bg-[#F8F5ED]">
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#0D3B34]/8 bg-[#F8F5ED]/95 px-6 py-5 backdrop-blur-xl">
              <div>
                <p className="text-[10px] font-bold tracking-[0.17em] text-[#B99124]">
                  PARTNER SUPPORT
                </p>

                <h2
                  className="mt-1 text-2xl font-bold"
                  style={{
                    fontFamily:
                      "var(--font-el-messiri), serif",
                  }}
                >
                  طلب مساعدة
                </h2>
              </div>

              <button
                type="button"
                onClick={closeSupportDrawer}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0D3B34]/10 bg-white text-lg"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 p-6">
              {!supportSent ? (
                <>
                  <div className="rounded-[24px] bg-[#0D3B34] p-5 text-white">
                    <p className="text-[10px] text-white/40">
                      رقم الحجز
                    </p>

                    <p
                      className="mt-1 text-sm font-bold"
                      dir="ltr"
                    >
                      {booking.id}
                    </p>

                    <p className="mt-4 text-[10px] text-white/40">
                      الخدمة
                    </p>

                    <p className="mt-1 text-sm font-bold">
                      {booking.service.name}
                    </p>
                  </div>

                  <Field label="نوع المشكلة">
                    <select
                      value={supportForm.type}
                      onChange={(event) =>
                        setSupportForm(
                          (current) => ({
                            ...current,
                            type: event.target
                              .value as SupportType,
                          })
                        )
                      }
                      className={inputClass}
                    >
                      {Object.entries(
                        supportTypeLabels
                      ).map(([key, label]) => (
                        <option
                          key={key}
                          value={key}
                        >
                          {label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="عنوان الطلب">
                    <input
                      value={supportForm.subject}
                      onChange={(event) =>
                        setSupportForm(
                          (current) => ({
                            ...current,
                            subject:
                              event.target.value,
                          })
                        )
                      }
                      placeholder="مثال: العميل لم يحضر في الموعد"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="تفاصيل المشكلة">
                    <textarea
                      value={
                        supportForm.description
                      }
                      onChange={(event) =>
                        setSupportForm(
                          (current) => ({
                            ...current,
                            description:
                              event.target.value,
                          })
                        )
                      }
                      placeholder="اكتب تفاصيل المشكلة والإجراء المطلوب..."
                      rows={6}
                      className="w-full rounded-[18px] border border-[#0D3B34]/10 bg-[#FAF9F5] px-4 py-4 text-sm text-[#0D3B34] outline-none placeholder:text-[#0D3B34]/30 focus:border-[#D4AF37]/60"
                    />
                  </Field>

                  <Field label="رقم التواصل">
                    <input
                      value={supportForm.phone}
                      onChange={(event) =>
                        setSupportForm(
                          (current) => ({
                            ...current,
                            phone:
                              event.target.value,
                          })
                        )
                      }
                      className={inputClass}
                      dir="ltr"
                    />
                  </Field>

                  <div className="rounded-[20px] border border-[#D4AF37]/20 bg-[#FFF9E8] p-4">
                    <p className="text-xs leading-6 text-[#0D3B34]/60">
                      رقم الحجز وبيانات العملية سيتم ربطها تلقائيًا بطلب الدعم. لا تحتاج لإعادة إدخال بيانات العميل أو الدفع.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      submitSupportRequest
                    }
                    className="w-full rounded-2xl bg-[#0D3B34] px-6 py-4 text-sm font-bold text-white"
                  >
                    إرسال طلب الدعم
                  </button>
                </>
              ) : (
                <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E6F5EB] text-3xl font-bold text-[#267247]">
                    ✓
                  </div>

                  <p className="mt-6 text-[10px] font-bold tracking-[0.17em] text-[#B99124]">
                    SUPPORT REQUEST CREATED
                  </p>

                  <h3
                    className="mt-2 text-2xl font-bold"
                    style={{
                      fontFamily:
                        "var(--font-el-messiri), serif",
                    }}
                  >
                    تم إرسال طلب المساعدة
                  </h3>

                  <p className="mt-3 max-w-[380px] text-sm leading-7 text-[#0D3B34]/55">
                    تم تسجيل الطلب وربطه بالحجز{" "}
                    <span
                      className="font-bold"
                      dir="ltr"
                    >
                      {booking.id}
                    </span>
                    .
                  </p>

                  <div className="mt-6 rounded-[20px] border border-[#0D3B34]/8 bg-white px-6 py-4">
                    <p className="text-[10px] text-[#0D3B34]/40">
                      رقم طلب الدعم
                    </p>

                    <p
                      className="mt-1 text-sm font-bold"
                      dir="ltr"
                    >
                      SUP-{Date.now()
                        .toString()
                        .slice(-6)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeSupportDrawer}
                    className="mt-7 rounded-2xl bg-[#0D3B34] px-7 py-3.5 text-xs font-bold text-white"
                  >
                    إغلاق
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          html,
          body {
            background: white !important;
          }

          body * {
            visibility: hidden;
          }

          #booking-print-area,
          #booking-print-area * {
            visibility: visible;
          }

          #booking-print-area {
            position: absolute;
            inset: 0;
            width: 100%;
            background: white !important;
          }

          #booking-print-area section,
          #booking-print-area div {
            break-inside: avoid;
          }
        }
      `}</style>
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
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ${
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
  gold = false,
}: {
  label: string;
  value: string;
  success?: boolean;
  gold?: boolean;
}) {
  return (
    <div
      className={`rounded-[24px] border p-5 ${
        success
          ? "border-[#267247]/15 bg-[#EAF5EE]"
          : gold
          ? "border-[#D4AF37]/20 bg-[#FFF8E4]"
          : "border-white/80 bg-white/72"
      }`}
    >
      <p className="text-xs text-[#0D3B34]/45">
        {label}
      </p>

      <p
        className={`mt-3 text-lg font-bold ${
          success
            ? "text-[#267247]"
            : gold
            ? "text-[#9B7516]"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Card({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[30px] border border-white/80 bg-white/72 p-6 backdrop-blur-xl print:border-[#0D3B34]/10 print:bg-white">
      <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
        {eyebrow}
      </p>

      <h2
        className="mt-2 text-xl font-bold"
        style={{
          fontFamily:
            "var(--font-el-messiri), serif",
        }}
      >
        {title}
      </h2>

      <div className="mt-6">
        {children}
      </div>
    </section>
  );
}

function Info({
  label,
  value,
  ltr = false,
  strong = false,
}: {
  label: string;
  value: string;
  ltr?: boolean;
  strong?: boolean;
}) {
  return (
    <div
      className={`rounded-[18px] border p-4 ${
        strong
          ? "border-[#D4AF37]/20 bg-[#FFF9E8]"
          : "border-[#0D3B34]/7 bg-[#FAF9F5]"
      }`}
    >
      <p className="text-[10px] text-[#0D3B34]/40">
        {label}
      </p>

      <p
        dir={ltr ? "ltr" : "rtl"}
        className={`mt-2 break-words text-xs ${
          strong
            ? "font-bold text-[#9B7516]"
            : "font-bold text-[#0D3B34]/75"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function TimelineItem({
  title,
  text,
  completed = false,
  last = false,
}: {
  title: string;
  text: string;
  completed?: boolean;
  last?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            completed
              ? "bg-[#267247] text-white"
              : "bg-[#E8E8E2] text-[#0D3B34]/35"
          }`}
        >
          {completed ? "✓" : "•"}
        </div>

        {!last && (
          <div
            className={`h-14 w-px ${
              completed
                ? "bg-[#267247]/30"
                : "bg-[#0D3B34]/10"
            }`}
          />
        )}
      </div>

      <div className="pt-1">
        <p className="text-xs font-bold">
          {title}
        </p>

        <p className="mt-1 text-[11px] leading-5 text-[#0D3B34]/45">
          {text}
        </p>
      </div>
    </div>
  );
}

function DarkInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] text-white/40">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-white/85">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-[#0D3B34]/65">
        {label}
      </span>

      {children}
    </label>
  );
}