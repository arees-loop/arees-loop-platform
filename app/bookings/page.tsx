"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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
  },
];

export default function BookingsPage() {
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === filter);

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#F7F5EF] text-[#0D3B34]"
      style={{ fontFamily: "'DIN Next Arabic', sans-serif" }}
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_10%,rgba(212,175,55,0.10),transparent_25%),radial-gradient(circle_at_8%_82%,rgba(13,59,52,0.08),transparent_30%),linear-gradient(135deg,#FAF8F2_0%,#F4F1E8_52%,#F8F6F0_100%)]" />

        <div className="absolute -right-44 top-24 h-[500px] w-[500px] rounded-full bg-[#0D3B34]/[0.045] blur-[120px]" />

        <div className="absolute -left-40 bottom-0 h-[450px] w-[450px] rounded-full bg-[#D4AF37]/[0.055] blur-[130px]" />
      </div>

      {/* HEADER */}
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

          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="hidden items-center gap-2 rounded-full border border-[#0D3B34]/[0.09] bg-white/60 px-3.5 py-2 text-[11px] font-semibold text-[#0D3B34]/70 md:flex"
            >
              <BellIcon />
              <span className="hidden xl:inline">الإشعارات</span>
            </Link>

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

              <ChevronDownIcon />
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1450px] px-5 pb-24 pt-8 md:px-8">
        {/* PAGE HEADER */}
        <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[9px] font-bold tracking-[0.2em] text-[#B99124]">
              MY BOOKINGS
            </p>

            <h1
              className="mt-2 text-[30px] font-semibold text-[#0D3B34] md:text-[38px]"
              style={{ fontFamily: "'Khebrat Musamim', sans-serif" }}
            >
              حجوزاتي
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-6 text-[#0D3B34]/65">
              تابع حجوزاتك القادمة والسابقة، واعرض تفاصيل كل تجربة وحالة
              الزيارة والمكافآت المرتبطة بها.
            </p>
          </div>

          <Link
            href="/discover"
            className="inline-flex items-center justify-center gap-2 rounded-[15px] bg-[#0D3B34] px-5 py-3 text-[11px] font-semibold text-white transition hover:bg-[#154C42]"
          >
            <CompassIcon />
            اكتشف تجربة جديدة
          </Link>
        </section>

        {/* SUMMARY */}
        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="إجمالي الحجوزات"
            value="3"
            description="كل الحجوزات"
            icon={<TicketIcon />}
          />

          <SummaryCard
            title="القادمة"
            value="1"
            description="حجز مؤكد"
            icon={<CalendarIcon />}
          />

          <SummaryCard
            title="زيارات مكتملة"
            value="1"
            description="تم التحقق منها"
            icon={<CheckIcon />}
          />

          <SummaryCard
            title="نقاط مكتسبة"
            value="350"
            description="من الحجوزات"
            icon={<RewardIcon />}
          />
        </section>

        {/* FILTER */}
        <section className="mt-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <FilterButton
              active={filter === "all"}
              onClick={() => setFilter("all")}
            >
              الكل
            </FilterButton>

            <FilterButton
              active={filter === "upcoming"}
              onClick={() => setFilter("upcoming")}
            >
              القادمة
            </FilterButton>

            <FilterButton
              active={filter === "completed"}
              onClick={() => setFilter("completed")}
            >
              مكتملة
            </FilterButton>

            <FilterButton
              active={filter === "cancelled"}
              onClick={() => setFilter("cancelled")}
            >
              ملغاة
            </FilterButton>
          </div>
        </section>

        {/* BOOKINGS */}
        <section className="mt-5 space-y-4">
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}

          {filteredBookings.length === 0 && (
            <div className="rounded-[26px] border border-white/80 bg-white/60 p-10 text-center backdrop-blur-xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#0D3B34]/7 text-[#B99124]">
                <TicketIcon />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-[#0D3B34]">
                ما عندك حجوزات في هذا القسم
              </h3>

              <p className="mt-2 text-[10px] text-[#0D3B34]/60">
                استكشف التجارب القريبة وابدأ أول حجز.
              </p>

              <Link
                href="/discover"
                className="mt-5 inline-flex rounded-[13px] bg-[#0D3B34] px-5 py-2.5 text-[10px] font-semibold text-white"
              >
                اكتشف الآن
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* MOBILE NAV */}
      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-md -translate-x-1/2 items-center justify-around rounded-[20px] border border-white/80 bg-white/90 px-2 py-2 shadow-[0_12px_40px_rgba(13,59,52,0.12)] backdrop-blur-2xl lg:hidden">
        <MobileNavItem
          href="/discover"
          icon={<CompassIcon />}
          label="اكتشف"
        />

        <MobileNavItem
          href="/bookings"
          icon={<TicketIcon />}
          label="حجوزاتي"
          active
        />

        <MobileNavItem
          href="/rewards"
          icon={<RewardSmallIcon />}
          label="المكافآت"
        />

        <MobileNavItem
          href="/profile"
          icon={<UserIcon />}
          label="حسابي"
        />
      </nav>
    </main>
  );
}

/* =========================
   COMPONENTS
========================= */

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

function SummaryCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-white/80 bg-white/60 p-5 backdrop-blur-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-medium text-[#0D3B34]/60">
            {title}
          </p>

          <p className="mt-2 text-3xl font-semibold text-[#0D3B34]">
            {value}
          </p>

          <p className="mt-1 text-[9px] text-[#0D3B34]/55">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D3B34] text-[#D4AF37]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-5 py-2.5 text-[10px] font-semibold transition ${
        active
          ? "border-[#0D3B34] bg-[#0D3B34] text-white"
          : "border-[#0D3B34]/10 bg-white/55 text-[#0D3B34]/65 hover:border-[#0D3B34]/20 hover:text-[#0D3B34]"
      }`}
    >
      {children}
    </button>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <article className="grid overflow-hidden rounded-[26px] border border-white/80 bg-white/65 backdrop-blur-xl md:grid-cols-[210px_1fr]">
      <div className="relative min-h-[190px] overflow-hidden">
        <Image
          src={booking.image}
          alt={booking.title}
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

        <div className="absolute bottom-3 right-3 rounded-full bg-black/35 px-3 py-1.5 text-[9px] font-medium text-white backdrop-blur-xl">
          {booking.reference}
        </div>
      </div>

      <div className="p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={booking.status}>
                {booking.statusLabel}
              </StatusBadge>

              {booking.points && (
                <span className="rounded-full bg-[#D4AF37]/12 px-3 py-1.5 text-[9px] font-semibold text-[#80600F]">
                  {booking.points}
                </span>
              )}
            </div>

            <h2
              className="mt-3 text-xl font-semibold text-[#0D3B34]"
              style={{ fontFamily: "'Khebrat Musamim', sans-serif" }}
            >
              {booking.title}
            </h2>

            <div className="mt-4 grid gap-3 text-[10px] text-[#0D3B34]/65 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem icon={<CalendarIcon />} label={booking.date} />

              <InfoItem icon={<ClockIcon />} label={booking.time} />

              <InfoItem
                icon={<LocationIcon />}
                label={booking.location}
              />

              <InfoItem
                icon={<UsersIcon />}
                label={`${booking.guests} زائر`}
              />
            </div>
          </div>

          <div className="min-w-[140px] lg:text-left">
            <p className="text-[9px] font-medium text-[#0D3B34]/55">
              إجمالي الحجز
            </p>

            <p className="mt-1 text-lg font-semibold text-[#0D3B34]">
              {booking.price}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#0D3B34]/[0.07] pt-4">
          <Link
            href={`/bookings/${booking.id}`}
            className="rounded-[12px] bg-[#0D3B34] px-4 py-2.5 text-[9px] font-semibold text-white"
          >
            تفاصيل الحجز
          </Link>

          {booking.status === "upcoming" && (
            <>
              <Link
                href={`/bookings/${booking.id}/ticket`}
                className="rounded-[12px] border border-[#0D3B34]/10 bg-white/70 px-4 py-2.5 text-[9px] font-semibold text-[#0D3B34]/70"
              >
                عرض التذكرة
              </Link>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${booking.title} ${booking.location}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[12px] border border-[#0D3B34]/10 bg-white/70 px-4 py-2.5 text-[9px] font-semibold text-[#0D3B34]/70"
              >
                الاتجاهات
              </a>
            </>
          )}

          {booking.status === "completed" && (
            <Link
              href={`/bookings/${booking.id}/rate`}
              className="rounded-[12px] border border-[#D4AF37]/25 bg-[#D4AF37]/9 px-4 py-2.5 text-[9px] font-semibold text-[#76580F]"
            >
              قيّم التجربة
            </Link>
          )}

          {booking.status === "cancelled" && (
            <Link
              href="/discover"
              className="rounded-[12px] border border-[#0D3B34]/10 bg-white/70 px-4 py-2.5 text-[9px] font-semibold text-[#0D3B34]/70"
            >
              احجز تجربة أخرى
            </Link>
          )}
        </div>
      </div>
    </article>
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
      ? "bg-[#0D3B34]/10 text-[#0D3B34]"
      : status === "completed"
        ? "bg-[#2F765F]/12 text-[#25614D]"
        : "bg-red-500/10 text-red-700/80";

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-[9px] font-semibold ${classes}`}
    >
      {children}
    </span>
  );
}

function InfoItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[#A77F16]">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
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

/* =========================
   ICONS
========================= */

function BellIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-2 4-4 2 2-4 4-2Z" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v8a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2V8Z" />
      <path d="M12 6v12" strokeDasharray="2 2" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c.5-4 2.4-6 6-6s5.5 2 6 6" />
      <path d="M16 5a3 3 0 0 1 0 6" />
      <path d="M17 14c2.4.5 3.7 2.5 4 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  );
}

function RewardIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M12 3 15 8l6 .8-4.3 4.2 1 6-5.7-2.8L6.3 19l1-6L3 8.8 9 8l3-5Z" />
    </svg>
  );
}

function RewardSmallIcon() {
  return <RewardIcon />;
}

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.8-4.5 3.4-7 8-7s7.2 2.5 8 7" />
    </svg>
  );
}
