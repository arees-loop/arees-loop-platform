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

export default function BookingPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const id = params?.id ?? "1";

  const experience = useMemo(
    () => experiences.find((item) => item.id === id) ?? experiences[0],
    [id]
  );

  const guestsFromUrl = Number(searchParams.get("guests")) || 1;

  const [guests, setGuests] = useState(
    Math.max(1, Math.min(10, guestsFromUrl))
  );

  const [selectedDate, setSelectedDate] = useState("2026-09-05");
  const [selectedTime, setSelectedTime] = useState("17:30");
  const [agree, setAgree] = useState(false);

  const subtotal = experience.price * guests;
  const serviceFee = 0;
  const total = subtotal + serviceFee;
  const expectedPoints = experience.points * guests;

  const dates = [
    {
      value: "2026-09-05",
      day: "السبت",
      date: "05",
      month: "سبتمبر",
    },
    {
      value: "2026-09-06",
      day: "الأحد",
      date: "06",
      month: "سبتمبر",
    },
    {
      value: "2026-09-07",
      day: "الاثنين",
      date: "07",
      month: "سبتمبر",
    },
    {
      value: "2026-09-08",
      day: "الثلاثاء",
      date: "08",
      month: "سبتمبر",
    },
  ];

  const times = ["10:00", "12:30", "15:00", "17:30", "19:00"];

  const reviewUrl =
    `/experience/${experience.id}/booking/review` +
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
                حجز آمن ومشفّر
              </span>
            </div>

            <Link
              href="/bookings"
              className="rounded-full border border-[#0D3B34]/10 bg-white/65 px-4 py-2.5 text-[11px] font-semibold text-[#0D3B34]/70 transition hover:text-[#0D3B34]"
            >
              حجوزاتي
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1380px] px-5 pb-20 pt-7 md:px-8">
        {/* TOP */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/experience/${experience.id}`}
            className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#0D3B34]/70 transition hover:text-[#0D3B34]"
          >
            <ArrowBackIcon />
            العودة إلى التجربة
          </Link>

          <div className="flex items-center gap-2 text-[11px] font-medium text-[#0D3B34]/60">
            <span className="font-semibold text-[#0D3B34]">
              اختيار الزيارة
            </span>

            <span>•</span>
            <span>مراجعة الحجز</span>

            <span>•</span>
            <span>الدفع</span>
          </div>
        </div>

        {/* TITLE */}
        <div className="mt-8">
          <p className="text-[11px] font-bold tracking-[0.18em] text-[#B99124]">
            COMPLETE YOUR BOOKING
          </p>

          <h1
            className="mt-2 text-[34px] font-semibold leading-tight text-[#0D3B34] md:text-[42px]"
            style={{
              fontFamily: "var(--font-el-messiri), sans-serif",
            }}
          >
            أكمل حجز تجربتك
          </h1>

          <p className="mt-3 max-w-2xl text-[14px] leading-7 text-[#0D3B34]/70">
            اختر موعد الزيارة وعدد الزوار، ثم راجع تفاصيل الحجز قبل المتابعة
            إلى مرحلة الدفع.
          </p>
        </div>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_400px]">
          {/* MAIN */}
          <div className="space-y-5">
            {/* EXPERIENCE */}
            <div className="overflow-hidden rounded-[26px] border border-white/80 bg-white/70 backdrop-blur-xl">
              <div className="grid md:grid-cols-[230px_1fr]">
                <div className="relative min-h-[200px]">
                  <Image
                    src={experience.image}
                    alt={experience.title}
                    fill
                    className="object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <div className="flex flex-col justify-center p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#0D3B34]/8 px-3.5 py-1.5 text-[10px] font-semibold text-[#0D3B34]/75">
                      تجربة مؤكدة
                    </span>

                    <span className="rounded-full bg-[#D4AF37]/15 px-3.5 py-1.5 text-[10px] font-semibold text-[#856513]">
                      +{experience.points} نقطة للفرد
                    </span>
                  </div>

                  <h2
                    className="mt-4 text-[25px] font-semibold text-[#0D3B34] md:text-[28px]"
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
            </div>

            {/* DATE */}
            <BookingSection
              number="01"
              title="اختر تاريخ الزيارة"
              subtitle="المواعيد المعروضة تجريبية حاليًا وسيتم ربطها بالتوفر الفعلي لاحقًا."
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {dates.map((item) => {
                  const active = selectedDate === item.value;

                  return (
                    <button
                      type="button"
                      key={item.value}
                      onClick={() => setSelectedDate(item.value)}
                      className={`rounded-[18px] border px-3 py-4 text-center transition ${
                        active
                          ? "border-[#0D3B34] bg-[#0D3B34] text-white"
                          : "border-[#0D3B34]/10 bg-white/60 text-[#0D3B34] hover:border-[#0D3B34]/25"
                      }`}
                    >
                      <p
                        className={`text-[11px] font-medium ${
                          active
                            ? "text-white/75"
                            : "text-[#0D3B34]/65"
                        }`}
                      >
                        {item.day}
                      </p>

                      <p className="mt-1 text-[28px] font-semibold">
                        {item.date}
                      </p>

                      <p
                        className={`mt-1 text-[11px] font-semibold ${
                          active
                            ? "text-[#D4AF37]"
                            : "text-[#0D3B34]/60"
                        }`}
                      >
                        {item.month}
                      </p>
                    </button>
                  );
                })}
              </div>
            </BookingSection>

            {/* TIME */}
            <BookingSection
              number="02"
              title="اختر وقت الزيارة"
              subtitle="اختر الوقت الأنسب لك من المواعيد المتاحة."
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {times.map((time) => {
                  const active = selectedTime === time;

                  return (
                    <button
                      type="button"
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`rounded-[15px] border px-4 py-3.5 text-[13px] font-semibold transition ${
                        active
                          ? "border-[#D4AF37] bg-[#D4AF37] text-[#0D3B34]"
                          : "border-[#0D3B34]/10 bg-white/60 text-[#0D3B34]/75 hover:border-[#0D3B34]/25 hover:text-[#0D3B34]"
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </BookingSection>

            {/* GUESTS */}
            <BookingSection
              number="03"
              title="عدد الزوار"
              subtitle="حدد عدد الأشخاص المشمولين في هذا الحجز."
            >
              <div className="flex items-center justify-between rounded-[18px] border border-[#0D3B34]/10 bg-white/60 p-4">
                <div>
                  <p className="text-[13px] font-semibold text-[#0D3B34]">
                    الزوار
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-[#0D3B34]/60">
                    الحد الأقصى 10 زوار للحجز التجريبي
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setGuests((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#0D3B34]/10 bg-white text-[20px] font-semibold text-[#0D3B34]"
                  >
                    −
                  </button>

                  <span className="min-w-6 text-center text-[24px] font-semibold text-[#0D3B34]">
                    {guests}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setGuests((current) =>
                        Math.min(10, current + 1)
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D3B34] text-[20px] font-semibold text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </BookingSection>
          </div>

          {/* SUMMARY */}
          <aside className="xl:sticky xl:top-24 xl:self-start">
            <div className="rounded-[28px] border border-white/80 bg-white/75 p-6 backdrop-blur-xl">
              <p className="text-[11px] font-bold tracking-[0.17em] text-[#B99124]">
                BOOKING SUMMARY
              </p>

              <h2
                className="mt-2 text-[26px] font-semibold text-[#0D3B34]"
                style={{
                  fontFamily: "var(--font-el-messiri), sans-serif",
                }}
              >
                ملخص الحجز
              </h2>

              <div className="mt-6 space-y-4">
                <SummaryRow
                  label="التجربة"
                  value={experience.title}
                />

                <SummaryRow
                  label="التاريخ"
                  value={formatDate(selectedDate)}
                />

                <SummaryRow
                  label="الوقت"
                  value={selectedTime}
                />

                <SummaryRow
                  label="عدد الزوار"
                  value={`${guests}`}
                />
              </div>

              <div className="my-5 h-px bg-[#0D3B34]/10" />

              <div className="space-y-3">
                <PriceRow
                  label={`${experience.price} ر.س × ${guests}`}
                  value={`${subtotal} ر.س`}
                />

                <PriceRow
                  label="رسوم الخدمة"
                  value={
                    serviceFee === 0
                      ? "بدون رسوم"
                      : `${serviceFee} ر.س`
                  }
                />
              </div>

              <div className="mt-5 rounded-[18px] bg-[#0D3B34] p-5 text-white">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-semibold text-white/75">
                      الإجمالي
                    </p>

                    <p className="mt-1 text-[10px] text-white/55">
                      شامل الرسوم الموضحة
                    </p>
                  </div>

                  <p className="text-[27px] font-semibold text-[#D4AF37]">
                    {total} ر.س
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-[15px] bg-[#D4AF37]/12 px-4 py-3.5">
                <div>
                  <p className="text-[12px] font-semibold text-[#0D3B34]">
                    مكافأتك المتوقعة
                  </p>

                  <p className="mt-1 text-[10px] text-[#0D3B34]/60">
                    بعد إتمام الزيارة والتحقق
                  </p>
                </div>

                <p className="text-[15px] font-bold text-[#8B6813]">
                  +{expectedPoints} نقطة
                </p>
              </div>

              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-[15px] border border-[#0D3B34]/10 bg-white/55 p-4">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(event) =>
                    setAgree(event.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-[#0D3B34]"
                />

                <span className="text-[11px] leading-6 text-[#0D3B34]/68">
                  أوافق على شروط الحجز وسياسة الإلغاء والخصوصية، وأؤكد صحة
                  بيانات الزيارة المختارة.
                </span>
              </label>

              {agree ? (
                <Link
                  href={reviewUrl}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-[15px] bg-[#D4AF37] px-5 py-4 text-[13px] font-bold text-[#0D3B34] transition hover:bg-[#E0BE50]"
                >
                  مراجعة الحجز
                  <ArrowIcon />
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-4 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-[15px] bg-[#0D3B34]/10 px-5 py-4 text-[13px] font-bold text-[#0D3B34]/45"
                >
                  مراجعة الحجز
                  <ArrowIcon />
                </button>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-medium text-[#0D3B34]/60">
                <ShieldIcon />
                لن يتم تنفيذ أي عملية دفع في هذه المرحلة
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <TrustItem icon={<ShieldIcon />} title="حجز آمن" />
              <TrustItem icon={<LockIcon />} title="بيانات محمية" />
              <TrustItem icon={<RewardIcon />} title="نقاط Loop" />
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function BookingSection({
  number,
  title,
  subtitle,
  children,
}: {
  number: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[26px] border border-white/80 bg-white/65 p-5 backdrop-blur-xl md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0D3B34] text-[11px] font-bold text-[#D4AF37]">
          {number}
        </div>

        <div>
          <h2
            className="text-[23px] font-semibold text-[#0D3B34]"
            style={{
              fontFamily: "var(--font-el-messiri), sans-serif",
            }}
          >
            {title}
          </h2>

          <p className="mt-1.5 text-[12px] leading-6 text-[#0D3B34]/65">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="mt-5">{children}</div>
    </section>
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
    <div className="flex items-start justify-between gap-5">
      <span className="text-[11px] font-medium text-[#0D3B34]/65">
        {label}
      </span>

      <span className="max-w-[220px] text-left text-[11px] font-semibold leading-5 text-[#0D3B34]">
        {value}
      </span>
    </div>
  );
}

function PriceRow({
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

function TrustItem({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-[16px] border border-white/80 bg-white/60 px-2 py-3.5 text-[#0D3B34]/70 backdrop-blur-xl">
      <span className="text-[#B99124]">{icon}</span>

      <span className="text-center text-[10px] font-semibold">
        {title}
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
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

function RewardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 3 15 8l6 .8-4.3 4.2 1 6-5.7-2.8L6.3 19l1-6L3 8.8 9 8l3-5Z" />
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