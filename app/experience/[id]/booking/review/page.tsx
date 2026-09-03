"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type Experience = {
  id: string;
  title: string;
  image: string;
  location: string;
  duration: string;
  price: number;
  points: number;
};

const experiences: Experience[] = [
  {
    id: "1",
    title: "متحف وبستان الصافية",
    image: "/Image/hero/experiences/alsafiya-museum.jpg",
    location: "المدينة المنورة",
    duration: "60 - 90 دقيقة",
    price: 35,
    points: 150,
  },
  {
    id: "2",
    title: "المتحف الدولي للسيرة النبوية",
    image: "/Image/hero/experiences/seerah-museum.jpg",
    location: "المدينة المنورة",
    duration: "75 - 120 دقيقة",
    price: 45,
    points: 200,
  },
  {
    id: "3",
    title: "جولة مسجد الغمامة وما حوله",
    image: "/Image/hero/experiences/al-ghamamah-mosque.jpg",
    location: "المنطقة المركزية",
    duration: "60 دقيقة",
    price: 45,
    points: 180,
  },
];

export default function ReviewBookingPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const id = params?.id ?? "1";

  const experience = useMemo(
    () => experiences.find((item) => item.id === id) ?? experiences[0],
    [id]
  );

  const selectedDate = searchParams.get("date") ?? "2026-09-05";
  const selectedTime = searchParams.get("time") ?? "17:30";

  const guestsValue = Number(searchParams.get("guests")) || 1;
  const guests = Math.max(1, Math.min(10, guestsValue));

  const [acceptedCancellation, setAcceptedCancellation] = useState(false);

  const subtotal = experience.price * guests;
  const serviceFee = 0;
  const total = subtotal + serviceFee;
  const expectedPoints = experience.points * guests;

  const bookingUrl =
    `/experience/${experience.id}/booking` +
    `?guests=${guests}`;

  const paymentUrl =
    `/experience/${experience.id}/booking/payment` +
    `?date=${encodeURIComponent(selectedDate)}` +
    `&time=${encodeURIComponent(selectedTime)}` +
    `&guests=${guests}`;

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#F7F5EF] text-[#0D3B34]"
      style={{
        fontFamily: "var(--font-ibm-plex-arabic), sans-serif",
      }}
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(212,175,55,0.10),transparent_25%),radial-gradient(circle_at_7%_85%,rgba(13,59,52,0.07),transparent_30%),linear-gradient(135deg,#FAF8F2_0%,#F4F1E8_52%,#F8F6F0_100%)]" />

        <div className="absolute -right-40 top-20 h-[480px] w-[480px] rounded-full bg-[#D4AF37]/[0.05] blur-[120px]" />

        <div className="absolute -left-40 bottom-0 h-[450px] w-[450px] rounded-full bg-[#0D3B34]/[0.04] blur-[130px]" />
      </div>

      {/* HEADER */}
      <header className="relative z-40 border-b border-[#0D3B34]/[0.07] bg-[#F7F5EF]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between px-5 py-3.5 md:px-8">
          <Link href="/">
            <Image
              src="/Logo/arees-loop-logo.png"
              alt="Arees Loop"
              width={165}
              height={82}
              priority
              className="h-auto w-[120px] md:w-[138px]"
            />
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <div className="flex items-center gap-2 rounded-full border border-[#0D3B34]/10 bg-white/65 px-4 py-2.5">
              <ShieldIcon />

              <span className="text-[11px] font-semibold text-[#0D3B34]/70">
                مراجعة آمنة للحجز
              </span>
            </div>

            <Link
              href="/bookings"
              className="rounded-full border border-[#0D3B34]/10 bg-white/65 px-4 py-2.5 text-[11px] font-semibold text-[#0D3B34]/70"
            >
              حجوزاتي
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1380px] px-5 pb-20 pt-7 md:px-8">
        {/* PROGRESS */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={bookingUrl}
            className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#0D3B34]/70 transition hover:text-[#0D3B34]"
          >
            <ArrowBackIcon />
            تعديل الحجز
          </Link>

          <div className="flex items-center gap-2 text-[11px] font-medium text-[#0D3B34]/60">
            <span>اختيار الزيارة</span>
            <span>•</span>

            <span className="font-semibold text-[#0D3B34]">
              مراجعة الحجز
            </span>

            <span>•</span>
            <span>الدفع</span>
          </div>
        </div>

        {/* TITLE */}
        <div className="mt-8">
          <p className="text-[11px] font-bold tracking-[0.18em] text-[#B99124]">
            REVIEW YOUR BOOKING
          </p>

          <h1
            className="mt-2 text-[34px] font-semibold leading-tight text-[#0D3B34] md:text-[42px]"
            style={{
              fontFamily: "var(--font-el-messiri), sans-serif",
            }}
          >
            راجع حجزك
          </h1>

          <p className="mt-3 max-w-2xl text-[14px] leading-7 text-[#0D3B34]/70">
            تأكد من تفاصيل التجربة والموعد وعدد الزوار قبل الانتقال إلى الدفع.
          </p>
        </div>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_410px]">
          {/* MAIN */}
          <div className="space-y-5">
            {/* EXPERIENCE */}
            <section className="overflow-hidden rounded-[28px] border border-white/80 bg-white/70 backdrop-blur-xl">
              <div className="grid md:grid-cols-[250px_1fr]">
                <div className="relative min-h-[220px]">
                  <Image
                    src={experience.image}
                    alt={experience.title}
                    fill
                    className="object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <div className="flex flex-col justify-center p-6 md:p-7">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#0D3B34]/8 px-3.5 py-1.5 text-[10px] font-semibold text-[#0D3B34]/75">
                      تفاصيل التجربة
                    </span>

                    <span className="rounded-full bg-[#D4AF37]/15 px-3.5 py-1.5 text-[10px] font-semibold text-[#856513]">
                      مؤهلة لمكافآت Loop
                    </span>
                  </div>

                  <h2
                    className="mt-4 text-[26px] font-semibold text-[#0D3B34] md:text-[30px]"
                    style={{
                      fontFamily: "var(--font-el-messiri), sans-serif",
                    }}
                  >
                    {experience.title}
                  </h2>

                  <div className="mt-4 flex flex-wrap gap-5 text-[12px] font-medium text-[#0D3B34]/68">
                    <span className="flex items-center gap-2">
                      <LocationIcon />
                      {experience.location}
                    </span>

                    <span className="flex items-center gap-2">
                      <ClockIcon />
                      {experience.duration}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* BOOKING DETAILS */}
            <section className="rounded-[28px] border border-white/80 bg-white/65 p-6 backdrop-blur-xl md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.17em] text-[#B99124]">
                    VISIT DETAILS
                  </p>

                  <h2
                    className="mt-2 text-[25px] font-semibold text-[#0D3B34]"
                    style={{
                      fontFamily: "var(--font-el-messiri), sans-serif",
                    }}
                  >
                    تفاصيل الزيارة
                  </h2>
                </div>

                <Link
                  href={bookingUrl}
                  className="rounded-[13px] border border-[#0D3B34]/10 bg-white/70 px-4 py-2.5 text-[11px] font-semibold text-[#0D3B34]/70 transition hover:text-[#0D3B34]"
                >
                  تعديل
                </Link>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <DetailCard
                  icon={<CalendarIcon />}
                  label="تاريخ الزيارة"
                  value={formatDate(selectedDate)}
                />

                <DetailCard
                  icon={<ClockIcon />}
                  label="وقت الزيارة"
                  value={selectedTime}
                />

                <DetailCard
                  icon={<UsersIcon />}
                  label="عدد الزوار"
                  value={`${guests} ${
                    guests === 1 ? "زائر" : "زوار"
                  }`}
                />

                <DetailCard
                  icon={<RewardIcon />}
                  label="النقاط المتوقعة"
                  value={`+${expectedPoints} نقطة`}
                />
              </div>
            </section>

            {/* IMPORTANT INFO */}
            <section className="rounded-[28px] border border-white/80 bg-white/65 p-6 backdrop-blur-xl md:p-7">
              <p className="text-[11px] font-bold tracking-[0.17em] text-[#B99124]">
                BEFORE YOU CONTINUE
              </p>

              <h2
                className="mt-2 text-[25px] font-semibold text-[#0D3B34]"
                style={{
                  fontFamily: "var(--font-el-messiri), sans-serif",
                }}
              >
                قبل المتابعة
              </h2>

              <div className="mt-6 space-y-3">
                <InfoItem
                  icon={<TicketIcon />}
                  title="التذكرة والحجز"
                  description="بعد إتمام الدفع بنجاح، يظهر الحجز والتذكرة في قسم حجوزاتي."
                />

                <InfoItem
                  icon={<CalendarIcon />}
                  title="الموعد"
                  description="الحجز مرتبط بالتاريخ والوقت المحددين، وأي تعديل يخضع لتوفر الموعد وسياسة مزود التجربة."
                />

                <InfoItem
                  icon={<RewardIcon />}
                  title="مكافآت Loop"
                  description="النقاط لا تضاف بمجرد الدفع؛ يتم احتسابها بعد استيفاء شروط التجربة والتحقق من الزيارة المؤهلة."
                />

                <InfoItem
                  icon={<ShieldIcon />}
                  title="الدفع"
                  description="السعر والتوفر النهائيان يجب التحقق منهما من الخادم قبل إنشاء عملية الدفع الفعلية."
                />
              </div>
            </section>

            {/* POLICY */}
            <section className="rounded-[28px] border border-[#D4AF37]/25 bg-[#D4AF37]/[0.07] p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#0D3B34] text-[#D4AF37]">
                  <PolicyIcon />
                </div>

                <div>
                  <h3 className="text-[15px] font-semibold text-[#0D3B34]">
                    سياسة الإلغاء والاسترداد
                  </h3>

                  <p className="mt-2 text-[12px] leading-6 text-[#0D3B34]/68">
                    سياسة الإلغاء والاسترداد الفعلية ستعتمد على شروط مقدم
                    التجربة ونوع الحجز. قبل الإطلاق سيتم عرض السياسة المعتمدة
                    لكل تجربة بوضوح قبل الدفع.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* SUMMARY */}
          <aside className="xl:sticky xl:top-24 xl:self-start">
            <div className="rounded-[28px] border border-white/80 bg-white/75 p-6 backdrop-blur-xl">
              <p className="text-[11px] font-bold tracking-[0.17em] text-[#B99124]">
                FINAL SUMMARY
              </p>

              <h2
                className="mt-2 text-[27px] font-semibold text-[#0D3B34]"
                style={{
                  fontFamily: "var(--font-el-messiri), sans-serif",
                }}
              >
                إجمالي الحجز
              </h2>

              <div className="mt-6 space-y-4">
                <SummaryRow
                  label="سعر الفرد"
                  value={`${experience.price} ر.س`}
                />

                <SummaryRow
                  label="عدد الزوار"
                  value={`${guests}`}
                />

                <SummaryRow
                  label="قيمة التجارب"
                  value={`${subtotal} ر.س`}
                />

                <SummaryRow
                  label="رسوم الخدمة"
                  value={
                    serviceFee === 0
                      ? "بدون رسوم"
                      : `${serviceFee} ر.س`
                  }
                />
              </div>

              <div className="my-5 h-px bg-[#0D3B34]/10" />

              <div className="rounded-[19px] bg-[#0D3B34] p-5 text-white">
                <p className="text-[12px] font-semibold text-white/75">
                  المبلغ الإجمالي
                </p>

                <div className="mt-2 flex items-end justify-between gap-3">
                  <span className="text-[11px] text-white/55">
                    المستحق عند الدفع
                  </span>

                  <span className="text-[30px] font-semibold text-[#D4AF37]">
                    {total} ر.س
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-[16px] bg-[#D4AF37]/12 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-semibold text-[#0D3B34]">
                      مكافأتك المتوقعة
                    </p>

                    <p className="mt-1 text-[10px] text-[#0D3B34]/60">
                      بعد التحقق من الزيارة
                    </p>
                  </div>

                  <span className="text-[16px] font-bold text-[#896713]">
                    +{expectedPoints}
                  </span>
                </div>
              </div>

              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-[15px] border border-[#0D3B34]/10 bg-white/55 p-4">
                <input
                  type="checkbox"
                  checked={acceptedCancellation}
                  onChange={(event) =>
                    setAcceptedCancellation(event.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-[#0D3B34]"
                />

                <span className="text-[11px] leading-6 text-[#0D3B34]/70">
                  قرأت تفاصيل الحجز وسياسة الإلغاء والاسترداد وأرغب في
                  المتابعة إلى الدفع.
                </span>
              </label>

              {acceptedCancellation ? (
                <Link
                  href={paymentUrl}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-[15px] bg-[#D4AF37] px-5 py-4 text-[13px] font-bold text-[#0D3B34] transition hover:bg-[#E0BE50]"
                >
                  المتابعة للدفع
                  <ArrowIcon />
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-4 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-[15px] bg-[#0D3B34]/10 px-5 py-4 text-[13px] font-bold text-[#0D3B34]/45"
                >
                  المتابعة للدفع
                  <ArrowIcon />
                </button>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-medium text-[#0D3B34]/60">
                <LockIcon />
                لا يتم حفظ بيانات البطاقة في هذه الصفحة
              </div>
            </div>

            {/* SECURITY */}
            <div className="mt-4 rounded-[22px] border border-white/80 bg-white/60 p-5 backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0D3B34] text-[#D4AF37]">
                  <ShieldIcon />
                </div>

                <div>
                  <p className="text-[13px] font-semibold text-[#0D3B34]">
                    حماية الحجز
                  </p>

                  <p className="mt-1.5 text-[11px] leading-6 text-[#0D3B34]/65">
                    في النسخة الإنتاجية يتم التحقق من السعر والتوفر وإنشاء
                    الدفع من الخادم، وليس بالاعتماد على القيم القادمة من
                    المتصفح.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#0D3B34]/10 bg-white/60 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0D3B34] text-[#D4AF37]">
          {icon}
        </div>

        <div>
          <p className="text-[11px] font-medium text-[#0D3B34]/65">
            {label}
          </p>

          <p className="mt-1 text-[13px] font-semibold text-[#0D3B34]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[18px] border border-[#0D3B34]/10 bg-white/55 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0D3B34]/8 text-[#0D3B34]">
        {icon}
      </div>

      <div>
        <p className="text-[13px] font-semibold text-[#0D3B34]">
          {title}
        </p>

        <p className="mt-1.5 text-[11px] leading-6 text-[#0D3B34]/68">
          {description}
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <span className="text-[11px] font-medium text-[#0D3B34]/65">
        {label}
      </span>

      <span className="text-[12px] font-semibold text-[#0D3B34]">
        {value}
      </span>
    </div>
  );
}

function formatDate(date: string) {
  const values: Record<string, string> = {
    "2026-09-05": "05 سبتمبر 2026",
    "2026-09-06": "06 سبتمبر 2026",
    "2026-09-07": "07 سبتمبر 2026",
    "2026-09-08": "08 سبتمبر 2026",
  };

  return values[date] ?? date;
}

function LocationIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19c.5-4 2.5-6 6-6s5.5 2 6 6" />
      <path d="M16 6a3 3 0 0 1 0 6M17 14c2.5.5 3.7 2.2 4 5" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v8a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2V8Z" />
      <path d="M12 6v12" strokeDasharray="2 2" />
    </svg>
  );
}

function RewardIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 3 15 8l6 .8-4.3 4.2 1 6-5.7-2.8L6.3 19l1-6L3 8.8 9 8l3-5Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 3 20 6v5c0 5-3.3 8.2-8 10-4.7-1.8-8-5-8-10V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function PolicyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M6 3h9l3 3v15H6V3Z" />
      <path d="M14 3v4h4M9 11h6M9 15h6" />
    </svg>
  );
}

function ArrowBackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}