"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type BookingStatus = "completed";

type Booking = {
  id: string;
  experienceId: string;
  title: string;
  image: string;
  date: string;
  location: string;
  reference: string;
  status: BookingStatus;
};

type SavedRating = {
  bookingId: string;
  experienceId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const bookings: Booking[] = [
  {
    id: "2",
    experienceId: "2",
    title: "المتحف الدولي للسيرة النبوية",
    image: "/Image/hero/experiences/seerah-museum.jpg",
    date: "29 أغسطس 2026",
    location: "المدينة المنورة",
    reference: "AL-240862",
    status: "completed",
  },
];

const RATING_STORAGE_KEY = "arees_loop_demo_ratings";

export default function RateBookingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";

  const booking = useMemo(
    () => bookings.find((item) => item.id === id),
    [id]
  );

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!booking) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#F7F5EF] px-5 text-[#0D3B34]"
        style={{ fontFamily: "var(--font-ibm-plex-arabic), sans-serif" }}
      >
        <div className="max-w-md text-center">
          <p className="text-[10px] font-bold tracking-[0.18em] text-[#B99124]">
            RATING NOT AVAILABLE
          </p>

          <h1
            className="mt-3 text-3xl font-semibold"
            style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
          >
            التقييم غير متاح
          </h1>

          <p className="mt-3 text-[11px] leading-6 text-[#0D3B34]/60">
            التقييم متاح فقط للحجوزات المكتملة في النسخة التجريبية الحالية.
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

  function saveRating() {
    if (!booking || rating < 1) return;

    const entry: SavedRating = {
      bookingId: booking.id,
      experienceId: booking.experienceId,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const raw = window.localStorage.getItem(RATING_STORAGE_KEY);
      const existing = raw ? (JSON.parse(raw) as SavedRating[]) : [];
      const filtered = existing.filter(
        (item) => item.bookingId !== booking.id
      );

      window.localStorage.setItem(
        RATING_STORAGE_KEY,
        JSON.stringify([...filtered, entry])
      );
    } catch {
      // The MVP demo should still allow the UI to complete even if storage
      // is unavailable in a restricted browser context.
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main
        dir="rtl"
        className="relative min-h-screen overflow-hidden bg-[#F7F5EF] text-[#0D3B34]"
        style={{ fontFamily: "var(--font-ibm-plex-arabic), sans-serif" }}
      >
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_85%_12%,rgba(212,175,55,0.12),transparent_28%),radial-gradient(circle_at_10%_85%,rgba(13,59,52,0.08),transparent_30%),linear-gradient(135deg,#FAF8F2_0%,#F4F1E8_52%,#F8F6F0_100%)]" />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
          <div className="w-full max-w-lg rounded-[30px] border border-white/80 bg-white/75 p-8 text-center shadow-[0_30px_80px_rgba(13,59,52,0.10)] backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0D3B34] text-[#D4AF37]">
              <CheckIcon />
            </div>

            <p className="mt-5 text-[9px] font-bold tracking-[0.18em] text-[#B99124]">
              RATING SAVED
            </p>

            <h1
              className="mt-2 text-3xl font-semibold"
              style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
            >
              شكرًا لتقييمك
            </h1>

            <p className="mt-3 text-[11px] leading-6 text-[#0D3B34]/60">
              تم حفظ تقييمك محليًا ضمن نسخة الـMVP التجريبية. عند ربط قاعدة
              البيانات سيتم حفظ التقييمات وإدارتها من الخادم.
            </p>

            <div className="mt-5 flex items-center justify-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <StarIcon key={index} filled={index < rating} />
              ))}
            </div>

            <button
              type="button"
              onClick={() => router.push(`/bookings/${booking.id}`)}
              className="mt-7 w-full rounded-[15px] bg-[#0D3B34] px-5 py-3.5 text-[11px] font-bold text-white transition hover:bg-[#164F45]"
            >
              العودة إلى تفاصيل الحجز
            </button>
          </div>
        </div>
      </main>
    );
  }

  const displayedRating = hoveredRating || rating;

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
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-5 px-5 py-3.5 md:px-8">
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
        <div className="text-center">
          <p className="text-[9px] font-bold tracking-[0.18em] text-[#B99124]">
            SHARE YOUR EXPERIENCE
          </p>

          <h1
            className="mt-2 text-3xl font-semibold md:text-4xl"
            style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
          >
            قيّم تجربتك
          </h1>

          <p className="mt-2 text-[10px] leading-6 text-[#0D3B34]/55">
            رأيك يساعدنا في تحسين التجارب وقياس جودة الشركاء.
          </p>
        </div>

        <section className="mt-7 overflow-hidden rounded-[30px] border border-white/80 bg-white/75 shadow-[0_30px_80px_rgba(13,59,52,0.08)] backdrop-blur-xl">
          <div className="grid md:grid-cols-[260px_1fr]">
            <div className="relative min-h-[250px] md:min-h-full">
              <Image
                src={booking.image}
                alt={booking.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 260px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D3B34]/60 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-[8px] text-[#D4AF37]">
                  {booking.reference}
                </p>
                <p className="mt-1 text-[9px] text-white/70">{booking.date}</p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <span className="inline-flex rounded-full bg-[#2F765F]/10 px-3 py-1.5 text-[9px] font-semibold text-[#25614D]">
                زيارة مكتملة
              </span>

              <h2
                className="mt-4 text-2xl font-semibold"
                style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
              >
                {booking.title}
              </h2>

              <p className="mt-2 text-[10px] text-[#0D3B34]/50">
                {booking.location}
              </p>

              <div className="mt-7 border-t border-[#0D3B34]/8 pt-6">
                <p className="text-[11px] font-semibold text-[#0D3B34]">
                  كيف كانت تجربتك؟
                </p>

                <div
                  className="mt-4 flex items-center gap-2"
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = index + 1;

                    return (
                      <button
                        key={value}
                        type="button"
                        aria-label={`تقييم ${value} من 5`}
                        onClick={() => setRating(value)}
                        onMouseEnter={() => setHoveredRating(value)}
                        className="rounded-lg p-1 transition hover:scale-110"
                      >
                        <StarIcon filled={value <= displayedRating} large />
                      </button>
                    );
                  })}
                </div>

                <p className="mt-2 min-h-5 text-[9px] font-medium text-[#B99124]">
                  {displayedRating === 1 && "ضعيفة"}
                  {displayedRating === 2 && "مقبولة"}
                  {displayedRating === 3 && "جيدة"}
                  {displayedRating === 4 && "جيدة جدًا"}
                  {displayedRating === 5 && "ممتازة"}
                </p>

                <label className="mt-6 block">
                  <span className="text-[10px] font-semibold text-[#0D3B34]">
                    أضف ملاحظة
                    <span className="mr-1 font-normal text-[#0D3B34]/40">
                      (اختياري)
                    </span>
                  </span>

                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    maxLength={500}
                    rows={5}
                    placeholder="اكتب ملاحظتك عن التجربة..."
                    className="mt-3 w-full resize-none rounded-[16px] border border-[#0D3B34]/10 bg-[#FAF8F2] px-4 py-3 text-[10px] leading-6 text-[#0D3B34] outline-none transition placeholder:text-[#0D3B34]/30 focus:border-[#B99124]/50"
                  />

                  <span className="mt-1 block text-left text-[8px] text-[#0D3B34]/35">
                    {comment.length}/500
                  </span>
                </label>

                <button
                  type="button"
                  disabled={rating < 1}
                  onClick={saveRating}
                  className={`mt-5 w-full rounded-[15px] px-5 py-3.5 text-[11px] font-bold transition ${
                    rating < 1
                      ? "cursor-not-allowed bg-[#0D3B34]/10 text-[#0D3B34]/35"
                      : "bg-[#D4AF37] text-[#0D3B34] hover:bg-[#E0BE50]"
                  }`}
                >
                  إرسال التقييم
                </button>

                <p className="mt-4 text-center text-[8px] leading-4 text-[#0D3B34]/40">
                  في نسخة الـMVP الحالية يتم حفظ التقييم محليًا على هذا الجهاز
                  فقط إلى حين ربط قاعدة البيانات.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StarIcon({
  filled,
  large = false,
}: {
  filled: boolean;
  large?: boolean;
}) {
  return (
    <svg
      width={large ? "32" : "22"}
      height={large ? "32" : "22"}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      className={filled ? "text-[#D4AF37]" : "text-[#0D3B34]/25"}
    >
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
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
