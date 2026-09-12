"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

type TicketBooking = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  guests: number;
  reference: string;
  price: string;
  image: string;
};

const bookings: TicketBooking[] = [
  {
    id: "1",
    title: "متحف وبستان الصافية",
    date: "05 سبتمبر 2026",
    time: "5:30 م",
    location: "المدينة المنورة",
    guests: 2,
    reference: "AL-240915",
    price: "70 ر.س",
    image: "/Image/hero/experiences/alsafiya-museum.jpg",
  },
];

export default function BookingTicketPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const booking = useMemo(
    () => bookings.find((item) => item.id === id),
    [id]
  );

  if (!booking) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#F7F5EF] px-5 text-[#0D3B34]"
        style={{ fontFamily: "var(--font-ibm-plex-arabic), sans-serif" }}
      >
        <div className="max-w-md text-center">
          <p className="text-[10px] font-bold tracking-[0.18em] text-[#B99124]">
            TICKET NOT AVAILABLE
          </p>

          <h1
            className="mt-3 text-3xl font-semibold"
            style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
          >
            التذكرة غير متاحة
          </h1>

          <p className="mt-3 text-[11px] leading-6 text-[#0D3B34]/60">
            لا توجد تذكرة صالحة لهذا الحجز في النسخة التجريبية الحالية.
          </p>

          <Link
            href="/bookings"
            className="mt-6 inline-flex rounded-[14px] bg-[#0D3B34] px-6 py-3 text-[10px] font-semibold text-white"
          >
            العودة إلى حجوزاتي
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#F7F5EF] text-[#0D3B34]"
      style={{ fontFamily: "var(--font-ibm-plex-arabic), sans-serif" }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_10%,rgba(212,175,55,0.10),transparent_25%),radial-gradient(circle_at_8%_82%,rgba(13,59,52,0.08),transparent_30%),linear-gradient(135deg,#FAF8F2_0%,#F4F1E8_52%,#F8F6F0_100%)]" />
        <div className="absolute -right-44 top-24 h-[500px] w-[500px] rounded-full bg-[#0D3B34]/[0.045] blur-[120px]" />
        <div className="absolute -left-40 bottom-0 h-[450px] w-[450px] rounded-full bg-[#D4AF37]/[0.055] blur-[130px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-[#0D3B34]/[0.06] bg-[#F7F5EF]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-5 px-5 py-3.5 md:px-8">
          <Link href="/">
            <Image
              src="/Logo/arees-loop-logo.png"
              alt="Arees Loop"
              width={170}
              height={85}
              priority
              className="h-auto w-[120px] md:w-[140px]"
            />
          </Link>

          <Link
            href={`/bookings/${booking.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-[#0D3B34]/10 bg-white/70 px-4 py-2 text-[10px] font-semibold text-[#0D3B34]"
          >
            <ArrowBackIcon />
            تفاصيل الحجز
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[900px] px-5 pb-16 pt-8 md:px-8">
        <div className="mb-5 text-center">
          <p className="text-[9px] font-bold tracking-[0.18em] text-[#B99124]">
            AREES LOOP DIGITAL TICKET
          </p>

          <h1
            className="mt-2 text-3xl font-semibold md:text-4xl"
            style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
          >
            تذكرتك الرقمية
          </h1>

          <p className="mt-2 text-[10px] text-[#0D3B34]/55">
            أبرز هذه التذكرة عند الوصول إلى موقع التجربة
          </p>
        </div>

        <section className="overflow-hidden rounded-[32px] border border-white/90 bg-white/80 shadow-[0_30px_80px_rgba(13,59,52,0.10)] backdrop-blur-xl">
          <div className="relative h-[260px] md:h-[330px]">
            <Image
              src={booking.image}
              alt={booking.title}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 900px"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0D3B34]/85 via-[#0D3B34]/15 to-transparent" />

            <div className="absolute right-5 top-5 rounded-full bg-[#D4AF37] px-3 py-1.5 text-[9px] font-bold text-[#0D3B34]">
              تذكرة فعالة
            </div>

            <div className="absolute bottom-5 left-5 right-5 text-white">
              <p className="text-[9px] font-semibold tracking-[0.14em] text-[#D4AF37]">
                BOOKING {booking.reference}
              </p>

              <h2
                className="mt-2 text-3xl font-semibold"
                style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
              >
                {booking.title}
              </h2>
            </div>
          </div>

          <div className="grid gap-0 md:grid-cols-[1fr_260px]">
            <div className="p-6 md:p-8">
              <div className="grid gap-3 sm:grid-cols-2">
                <TicketDetail label="التاريخ" value={booking.date} />
                <TicketDetail label="الوقت" value={booking.time} />
                <TicketDetail label="الموقع" value={booking.location} />
                <TicketDetail label="عدد الزوار" value={`${booking.guests} زائر`} />
              </div>

              <div className="mt-5 rounded-[18px] bg-[#0D3B34] p-5 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[8px] text-white/50">رقم الحجز</p>
                    <p className="mt-1 text-[14px] font-semibold tracking-[0.08em] text-[#D4AF37]">
                      {booking.reference}
                    </p>
                  </div>

                  <div className="text-left">
                    <p className="text-[8px] text-white/50">القيمة</p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {booking.price}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[16px] border border-[#D4AF37]/20 bg-[#D4AF37]/[0.06] p-4">
                <p className="text-[9px] font-semibold text-[#8A6D14]">
                  تعليمات الاستخدام
                </p>
                <p className="mt-1 text-[9px] leading-5 text-[#0D3B34]/55">
                  احتفظ بالتذكرة على جهازك، واعرض رمز التحقق عند الوصول. بيانات
                  هذه التذكرة تجريبية ضمن نسخة الـMVP إلى حين ربط نظام الحجوزات
                  الحقيقي بقاعدة البيانات.
                </p>
              </div>
            </div>

            <div className="relative border-t border-dashed border-[#0D3B34]/15 bg-[#FAF8F2] p-6 md:border-r md:border-t-0">
              <div className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 rounded-full bg-[#F7F5EF] md:block" />
              <div className="absolute -left-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 rounded-full bg-[#F7F5EF] md:block" />

              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="grid h-[170px] w-[170px] grid-cols-9 gap-[3px] rounded-[18px] border border-[#0D3B34]/10 bg-white p-4 shadow-sm">
                  {Array.from({ length: 81 }).map((_, index) => {
                    const active =
                      [
                        0, 1, 2, 3, 9, 12, 18, 20, 21, 22, 24, 26, 27, 30, 31,
                        34, 35, 36, 38, 39, 41, 43, 44, 45, 47, 48, 50, 52, 53,
                        54, 58, 59, 60, 61, 62, 63, 65, 67, 69, 71, 72, 73, 74,
                        76, 77, 78, 79, 80,
                      ].includes(index);

                    return (
                      <span
                        key={index}
                        className={`rounded-[1px] ${
                          active ? "bg-[#0D3B34]" : "bg-transparent"
                        }`}
                      />
                    );
                  })}
                </div>

                <p className="mt-4 text-[9px] font-semibold text-[#0D3B34]">
                  رمز التحقق التجريبي
                </p>

                <p className="mt-1 text-[8px] leading-4 text-[#0D3B34]/45">
                  سيُستبدل لاحقًا برمز QR حقيقي مرتبط بالحجز والتحقق.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function TicketDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[15px] border border-[#0D3B34]/8 bg-[#FAF8F2]/80 px-4 py-3.5">
      <p className="text-[8px] text-[#0D3B34]/45">{label}</p>
      <p className="mt-1 text-[10px] font-semibold text-[#0D3B34]">{value}</p>
    </div>
  );
}

function ArrowBackIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
