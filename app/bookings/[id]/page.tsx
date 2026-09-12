"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

type BookingStatus = "upcoming" | "completed" | "cancelled";

type Booking = {
  id: string;
  title: string;
  image: string;
  date: string;
  time: string;
  location: string;
  guests: number;
  price: string;
  status: BookingStatus;
  statusLabel: string;
  reference: string;
  points?: string;
  description: string;
};

const bookings: Booking[] = [
  {
    id: "1",
    title: "متحف وبستان الصافية",
    image: "/Image/hero/experiences/alsafiya-museum.jpg",
    date: "05 سبتمبر 2026",
    time: "5:30 م",
    location: "المدينة المنورة",
    guests: 2,
    price: "70 ر.س",
    status: "upcoming",
    statusLabel: "حجز قادم",
    reference: "AL-240915",
    points: "+150 نقطة",
    description:
      "زيارة ثقافية لمتحف وبستان الصافية ضمن تجربة AREES Loop، مع تفاصيل الحجز والزيارة في مكان واحد.",
  },
  {
    id: "2",
    title: "المتحف الدولي للسيرة النبوية",
    image: "/Image/hero/experiences/seerah-museum.jpg",
    date: "29 أغسطس 2026",
    time: "7:00 م",
    location: "المدينة المنورة",
    guests: 1,
    price: "45 ر.س",
    status: "completed",
    statusLabel: "تمت الزيارة",
    reference: "AL-240862",
    points: "+200 نقطة",
    description:
      "زيارة معرفية للمتحف الدولي للسيرة النبوية، وتم تسجيلها كزيارة مكتملة ضمن النسخة التجريبية.",
  },
  {
    id: "3",
    title: "جولة مسجد الغمامة وما حوله",
    image: "/Image/hero/experiences/al-ghamamah-mosque.jpg",
    date: "21 أغسطس 2026",
    time: "4:45 م",
    location: "المنطقة المركزية",
    guests: 3,
    price: "135 ر.س",
    status: "cancelled",
    statusLabel: "ملغي",
    reference: "AL-240811",
    description:
      "جولة ثقافية قصيرة حول مسجد الغمامة والمعالم القريبة منه. هذا الحجز ظاهر كبيانات تجريبية ملغاة.",
  },
];

export default function BookingDetailsPage() {
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
            BOOKING NOT FOUND
          </p>

          <h1
            className="mt-3 text-3xl font-semibold"
            style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
          >
            الحجز غير موجود
          </h1>

          <p className="mt-3 text-[11px] leading-6 text-[#0D3B34]/60">
            رقم الحجز غير صحيح أو أن الحجز لم يعد متاحًا.
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
        <div className="mx-auto flex max-w-[1450px] items-center justify-between gap-5 px-5 py-3.5 md:px-8">
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

          <div className="hidden flex-1 justify-center lg:flex">
            <div className="flex items-center gap-1 rounded-full border border-[#0D3B34]/[0.09] bg-white/60 p-1 backdrop-blur-xl">
              <NavLink href="/discover">اكتشف</NavLink>
              <NavLink href="/bookings" active>
                حجوزاتي
              </NavLink>
              <NavLink href="/rewards">المكافآت</NavLink>
              <NavLink href="/favorites">المفضلة</NavLink>
            </div>
          </div>

          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-full border border-[#0D3B34]/[0.09] bg-white/70 py-1.5 pl-3 pr-1.5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0D3B34] text-[11px] font-bold text-[#D4AF37]">
              م
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-[10px] font-semibold text-[#0D3B34]">
                مرحبًا معتز
              </p>
              <p className="text-[8px] text-[#0D3B34]/55">حسابي</p>
            </div>
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1450px] px-5 pb-24 pt-7 md:px-8">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-2 text-[10px] font-semibold text-[#0D3B34]/60 transition hover:text-[#0D3B34]"
        >
          <ArrowBackIcon />
          العودة إلى حجوزاتي
        </Link>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-[380px] overflow-hidden rounded-[30px] md:min-h-[520px]">
            <Image
              src={booking.image}
              alt={booking.title}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 60vw"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

            <div className="absolute right-5 top-5 flex flex-wrap gap-2">
              <StatusBadge status={booking.status}>
                {booking.statusLabel}
              </StatusBadge>

              {booking.points && (
                <span className="rounded-full bg-[#D4AF37] px-3 py-1.5 text-[9px] font-bold text-[#0D3B34]">
                  {booking.points}
                </span>
              )}
            </div>

            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="text-[9px] font-semibold tracking-[0.15em] text-[#D4AF37]">
                BOOKING {booking.reference}
              </p>

              <h1
                className="mt-2 text-3xl font-semibold md:text-4xl"
                style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
              >
                {booking.title}
              </h1>

              <p className="mt-3 max-w-2xl text-[10px] leading-6 text-white/70">
                {booking.description}
              </p>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/80 bg-white/70 p-6 backdrop-blur-xl md:p-7">
            <p className="text-[9px] font-bold tracking-[0.18em] text-[#B99124]">
              BOOKING DETAILS
            </p>

            <h2
              className="mt-2 text-2xl font-semibold"
              style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
            >
              تفاصيل الحجز
            </h2>

            <div className="mt-6 space-y-3">
              <DetailRow
                label="رقم الحجز"
                value={booking.reference}
                icon={<TicketIcon />}
              />
              <DetailRow
                label="التاريخ"
                value={booking.date}
                icon={<CalendarIcon />}
              />
              <DetailRow
                label="الوقت"
                value={booking.time}
                icon={<ClockIcon />}
              />
              <DetailRow
                label="الموقع"
                value={booking.location}
                icon={<LocationIcon />}
              />
              <DetailRow
                label="عدد الزوار"
                value={`${booking.guests} زائر`}
                icon={<UsersIcon />}
              />
            </div>

            <div className="mt-5 rounded-[18px] bg-[#0D3B34] p-4 text-white">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/65">إجمالي الحجز</span>
                <span className="text-2xl font-semibold text-[#D4AF37]">
                  {booking.price}
                </span>
              </div>

              {booking.points && (
                <div className="mt-2 flex items-center justify-between text-[9px] text-white/55">
                  <span>مكافأة Loop</span>
                  <span>{booking.points}</span>
                </div>
              )}
            </div>

            {booking.status === "upcoming" && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  href={`/bookings/${booking.id}/ticket`}
                  className="flex items-center justify-center rounded-[14px] bg-[#D4AF37] px-5 py-3 text-[10px] font-bold text-[#0D3B34] transition hover:brightness-95"
                >
                  عرض التذكرة
                </Link>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${booking.title} ${booking.location}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-[14px] border border-[#0D3B34]/10 bg-white/70 px-5 py-3 text-[10px] font-semibold text-[#0D3B34]/70 transition hover:bg-white"
                >
                  الاتجاهات
                </a>
              </div>
            )}

            {booking.status === "completed" && (
              <div className="mt-5 rounded-[16px] border border-[#2F765F]/15 bg-[#2F765F]/[0.06] p-4">
                <p className="text-[10px] font-semibold text-[#25614D]">
                  تمت الزيارة بنجاح
                </p>
                <p className="mt-1 text-[9px] leading-5 text-[#0D3B34]/55">
                  يمكنك تقييم التجربة ومراجعة النقاط المرتبطة بها.
                </p>
              </div>
            )}

            {booking.status === "cancelled" && (
              <div className="mt-5 rounded-[16px] border border-red-500/10 bg-red-500/[0.04] p-4">
                <p className="text-[10px] font-semibold text-red-700/80">
                  هذا الحجز ملغي
                </p>
                <p className="mt-1 text-[9px] leading-5 text-[#0D3B34]/55">
                  يمكنك الرجوع إلى الاكتشاف واختيار تجربة أخرى.
                </p>
              </div>
            )}

            <p className="mt-5 text-[8px] leading-4 text-[#0D3B34]/45">
              بيانات هذه الصفحة تجريبية ضمن نسخة الـMVP، وسيتم ربط تفاصيل
              الحجوزات الحقيقية بقاعدة البيانات بعد تفعيل Cloud SQL.
            </p>
          </div>
        </section>
      </div>

      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-md -translate-x-1/2 items-center justify-around rounded-[20px] border border-white/80 bg-white/90 px-2 py-2 shadow-[0_12px_40px_rgba(13,59,52,0.12)] backdrop-blur-2xl lg:hidden">
        <MobileNavItem href="/discover" icon={<CompassIcon />} label="اكتشف" />
        <MobileNavItem href="/bookings" icon={<TicketIcon />} label="حجوزاتي" active />
        <MobileNavItem href="/rewards" icon={<RewardIcon />} label="المكافآت" />
        <MobileNavItem href="/profile" icon={<UserIcon />} label="حسابي" />
      </nav>
    </main>
  );
}

function NavLink({
  href,
  children,
  active = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-5 py-2 text-[10px] font-semibold transition ${
        active
          ? "bg-[#0D3B34] text-white"
          : "text-[#0D3B34]/65 hover:bg-[#0D3B34]/6 hover:text-[#0D3B34]"
      }`}
    >
      {children}
    </Link>
  );
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[15px] border border-[#0D3B34]/8 bg-white/60 px-4 py-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0D3B34]/7 text-[#B99124]">
        {icon}
      </div>

      <div className="flex-1">
        <p className="text-[8px] text-[#0D3B34]/50">{label}</p>
        <p className="mt-1 text-[10px] font-semibold text-[#0D3B34]">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  children,
}: {
  status: BookingStatus;
  children: React.ReactNode;
}) {
  const classes =
    status === "upcoming"
      ? "bg-white/90 text-[#0D3B34]"
      : status === "completed"
        ? "bg-[#2F765F] text-white"
        : "bg-red-600/85 text-white";

  return (
    <span className={`rounded-full px-3 py-1.5 text-[9px] font-semibold ${classes}`}>
      {children}
    </span>
  );
}

function MobileNavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-w-[60px] flex-col items-center gap-1 rounded-xl px-3 py-1.5 ${
        active ? "text-[#0D3B34]" : "text-[#0D3B34]/55"
      }`}
    >
      <div className={active ? "text-[#B99124]" : ""}>{icon}</div>
      <span className="text-[8px] font-semibold">{label}</span>
    </Link>
  );
}

function ArrowBackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v8a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2V8Z" />
      <path d="M12 6v12" strokeDasharray="2 2" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c.5-4 2.4-6 6-6s5.5 2 6 6" />
      <path d="M16 5a3 3 0 0 1 0 6" />
      <path d="M17 14c2.4.5 3.7 2.5 4 6" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-2 4-4 2 2-4 4-2Z" />
    </svg>
  );
}

function RewardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3 15 8l6 .8-4.3 4.2 1 6-5.7-2.8L6.3 19l1-6L3 8.8 9 8l3-5Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.8-4.5 3.4-7 8-7s7.2 2.5 8 7" />
    </svg>
  );
}
