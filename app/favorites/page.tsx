"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type FavoriteItem = {
  id: number;
  title: string;
  image: string;
  category: string;
  location: string;
  distance: string;
  rating: string;
  price: string;
  badge?: string;
};

const initialFavorites: FavoriteItem[] = [
  {
    id: 1,
    title: "متحف وبستان الصافية",
    image: "/Image/hero/experiences/alsafiya-museum.jpg",
    category: "تراث وثقافة",
    location: "المدينة المنورة",
    distance: "1.2 كم",
    rating: "4.9",
    price: "ابتداءً من 35 ر.س",
    badge: "قريب منك",
  },
  {
    id: 2,
    title: "المتحف الدولي للسيرة النبوية",
    image: "/Image/hero/experiences/seerah-museum.jpg",
    category: "متاحف",
    location: "المدينة المنورة",
    distance: "850 م",
    rating: "4.8",
    price: "احجز الآن",
    badge: "موصى به",
  },
  {
    id: 3,
    title: "جولة مسجد الغمامة وما حوله",
    image: "/Image/hero/experiences/al-ghamamah-mosque.jpg",
    category: "جولة ثقافية",
    location: "المنطقة المركزية",
    distance: "600 م",
    rating: "4.9",
    price: "من 45 ر.س",
    badge: "الأقرب",
  },
];

export default function FavoritesPage() {
  const [favorites, setFavorites] =
    useState<FavoriteItem[]>(initialFavorites);

  function removeFavorite(id: number) {
    setFavorites((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#F7F5EF] text-[#0D3B34]"
      style={{ "var(--font-ibm-plex-arabic), sans-serif" }}
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

              <NavLink href="/bookings">حجوزاتي</NavLink>

              <NavLink href="/rewards">المكافآت</NavLink>

              <NavLink href="/favorites" active>
                المفضلة
              </NavLink>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="hidden items-center gap-2 rounded-full border border-[#0D3B34]/[0.09] bg-white/60 px-3.5 py-2 text-[11px] font-semibold text-[#0D3B34]/70 md:flex"
            >
              <BellIcon />
              <span className="hidden xl:inline">
                الإشعارات
              </span>
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

                <p className="text-[8px] text-[#0D3B34]/55">
                  حسابي
                </p>
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
              SAVED PLACES
            </p>

            <h1
              className="mt-2 text-[30px] font-semibold text-[#0D3B34] md:text-[38px]"
              style={{
                fontFamily:
                  "var(--font-el-messiri), sans-serif",
              }}
            >
              المفضلة
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-6 text-[#0D3B34]/65">
              احتفظ بالتجارب والوجهات التي لفتت اهتمامك
              وارجع لها في أي وقت.
            </p>
          </div>

          <Link
            href="/discover"
            className="inline-flex items-center justify-center gap-2 rounded-[15px] bg-[#0D3B34] px-5 py-3 text-[11px] font-semibold text-white transition hover:bg-[#154C42]"
          >
            <CompassIcon />
            اكتشف المزيد
          </Link>
        </section>

        {/* SUMMARY */}
        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            title="العناصر المحفوظة"
            value={favorites.length.toString()}
            description="في قائمتك الآن"
            icon={<HeartIcon filled />}
          />

          <SummaryCard
            title="الأقرب إليك"
            value="600 م"
            description="مسجد الغمامة"
            icon={<LocationIcon />}
          />

          <SummaryCard
            title="أعلى تقييم"
            value="4.9"
            description="من العناصر المحفوظة"
            icon={<StarIcon />}
          />
        </section>

        {/* FAVORITES */}
        <section className="mt-9">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-bold tracking-[0.18em] text-[#B99124]">
                YOUR COLLECTION
              </p>

              <h2
                className="mt-1.5 text-[24px] font-semibold"
                style={{
                  fontFamily:
                    "var(--font-el-messiri), sans-serif",
                }}
              >
                محفوظاتك
              </h2>
            </div>
          </div>

          {favorites.length > 0 ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {favorites.map((item) => (
                <FavoriteCard
                  key={item.id}
                  item={item}
                  onRemove={() =>
                    removeFavorite(item.id)
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState />
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
        />

        <MobileNavItem
          href="/rewards"
          icon={<RewardIcon />}
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

/* ================= COMPONENTS ================= */

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

function FavoriteCard({
  item,
  onRemove,
}: {
  item: FavoriteItem;
  onRemove: () => void;
}) {
  return (
    <article className="group overflow-hidden rounded-[24px] border border-white/80 bg-white/65 backdrop-blur-xl transition duration-300 hover:-translate-y-1">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        {item.badge && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-semibold text-[#0D3B34] backdrop-blur-xl">
            {item.badge}
          </span>
        )}

        <button
          type="button"
          onClick={onRemove}
          title="إزالة من المفضلة"
          className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF37] text-[#0D3B34] shadow-sm backdrop-blur-xl transition hover:scale-105"
        >
          <HeartIcon filled />
        </button>

        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1.5 text-[9px] font-medium text-white backdrop-blur-xl">
          <LocationSmallIcon />
          {item.distance}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[9px] font-semibold text-[#9A741B]">
            {item.category}
          </span>

          <div className="flex items-center gap-1 text-[10px] font-semibold text-[#0D3B34]/75">
            <StarIcon />
            {item.rating}
          </div>
        </div>

        <h3
          className="mt-2 text-lg font-semibold text-[#0D3B34]"
          style={{
            fontFamily:
              "var(--font-el-messiri), sans-serif",
          }}
        >
          {item.title}
        </h3>

        <p className="mt-1.5 text-[10px] font-medium text-[#0D3B34]/60">
          {item.location}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-[#0D3B34]/[0.07] pt-4">
          <span className="text-[11px] font-semibold text-[#0D3B34]">
            {item.price}
          </span>

          <Link
            href={`/experience/${item.id}`}
            className="flex items-center gap-1 text-[10px] font-semibold text-[#0D3B34]/70 transition hover:text-[#0D3B34]"
          >
            عرض التفاصيل
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="mt-5 rounded-[28px] border border-white/80 bg-white/60 px-6 py-16 text-center backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#0D3B34] text-[#D4AF37]">
        <HeartIcon filled={false} />
      </div>

      <h3
        className="mt-5 text-xl font-semibold text-[#0D3B34]"
        style={{
          fontFamily:
            "var(--font-el-messiri), sans-serif",
        }}
      >
        قائمة المفضلة فارغة
      </h3>

      <p className="mx-auto mt-2 max-w-md text-[10px] leading-5 text-[#0D3B34]/60">
        اضغط على علامة القلب في أي تجربة تعجبك،
        وسنحتفظ بها هنا لتصل إليها بسهولة.
      </p>

      <Link
        href="/discover"
        className="mt-6 inline-flex rounded-[14px] bg-[#0D3B34] px-6 py-3 text-[10px] font-semibold text-white"
      >
        اكتشف التجارب
      </Link>
    </div>
  );
}

function MobileNavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-[60px] flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[#0D3B34]/55"
    >
      {icon}
      <span className="text-[8px] font-semibold">
        {label}
      </span>
    </Link>
  );
}

/* ================= ICONS ================= */

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

function HeartIcon({
  filled,
}: {
  filled: boolean;
}) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function LocationSmallIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      width="18"
      height="18"
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

function StarIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="#D4AF37"
      stroke="#D4AF37"
      strokeWidth="1.5"
    >
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3l-5.5 2.9 1-6.2L3 9.6l6.2-.9L12 3Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
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