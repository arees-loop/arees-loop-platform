"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

type Experience = {
  id: string;
  title: string;
  image: string;
  category: string;
  location: string;
  distance: string;
  rating: string;
  reviews: string;
  duration: string;
  price: number;
  description: string;
  points: number;
  highlights: string[];
};

const experiences: Experience[] = [
  {
    id: "1",
    title: "متحف وبستان الصافية",
    image: "/Image/hero/experiences/alsafiya-museum.jpg",
    category: "تراث وثقافة",
    location: "المدينة المنورة",
    distance: "1.2 كم",
    rating: "4.9",
    reviews: "328 تقييم",
    duration: "60 - 90 دقيقة",
    price: 35,
    description:
      "تجربة ثقافية تجمع بين التاريخ والمكان والطبيعة في قلب المدينة المنورة، مع محتوى بصري وتعريفي يساعدك على استكشاف الموقع بصورة أعمق.",
    points: 150,
    highlights: [
      "تجربة مناسبة للأفراد والعائلات",
      "موقع قريب من المنطقة المركزية",
      "محتوى ثقافي وتاريخي",
      "زيارة مؤهلة لنقاط Loop",
    ],
  },
  {
    id: "2",
    title: "المتحف الدولي للسيرة النبوية",
    image: "/Image/hero/experiences/seerah-museum.jpg",
    category: "متاحف",
    location: "المدينة المنورة",
    distance: "850 م",
    rating: "4.8",
    reviews: "512 تقييم",
    duration: "75 - 120 دقيقة",
    price: 45,
    description:
      "رحلة معرفية وتفاعلية للتعرف على السيرة النبوية من خلال محتوى متحفي منظم وتجربة حديثة تناسب الزائر الفردي والعائلات.",
    points: 200,
    highlights: [
      "تجربة معرفية تفاعلية",
      "قريب من المنطقة المركزية",
      "مناسب للعائلات",
      "مؤهل لكسب نقاط Loop",
    ],
  },
  {
    id: "3",
    title: "جولة مسجد الغمامة وما حوله",
    image: "/Image/hero/experiences/al-ghamamah-mosque.jpg",
    category: "جولة ثقافية",
    location: "المنطقة المركزية",
    distance: "600 م",
    rating: "4.9",
    reviews: "214 تقييم",
    duration: "60 دقيقة",
    price: 45,
    description:
      "جولة قصيرة ومركزة حول مسجد الغمامة والمعالم القريبة منه، تساعد الزائر على فهم السياق التاريخي للمكان بصورة مبسطة وممتعة.",
    points: 180,
    highlights: [
      "جولة قصيرة وسهلة",
      "مناسبة للزوار لأول مرة",
      "قريبة من المسجد النبوي",
      "يمكن ربطها بمرشد سياحي",
    ],
  },
];

export default function ExperienceDetailsPage() {
  const params = useParams();
  const id = String(params.id || "1");

  const experience = useMemo(
    () => experiences.find((item) => item.id === id) || experiences[0],
    [id]
  );

  const [favorite, setFavorite] = useState(false);
  const [guests, setGuests] = useState(1);

  const total = experience.price * guests;

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
              <NavLink href="/bookings">حجوزاتي</NavLink>
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

      <div className="relative z-10 mx-auto max-w-[1450px] px-5 pb-24 pt-6 md:px-8">
        {/* BACK */}
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 text-[10px] font-semibold text-[#0D3B34]/65 transition hover:text-[#0D3B34]"
        >
          <ArrowBackIcon />
          العودة إلى الاكتشاف
        </Link>

        {/* HERO */}
        <section className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="relative min-h-[380px] overflow-hidden rounded-[30px] md:min-h-[500px]">
            <Image
              src={experience.image}
              alt={experience.title}
              fill
              priority
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

            <div className="absolute right-5 top-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-semibold text-[#0D3B34] backdrop-blur-xl">
                {experience.category}
              </span>

              <span className="rounded-full bg-[#D4AF37] px-3 py-1.5 text-[9px] font-bold text-[#0D3B34]">
                +{experience.points} نقطة
              </span>
            </div>

            <button
              type="button"
              onClick={() => setFavorite((current) => !current)}
              className={`absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-xl transition ${
                favorite
                  ? "bg-[#D4AF37] text-[#0D3B34]"
                  : "bg-white/90 text-[#0D3B34]"
              }`}
              aria-label="المفضلة"
            >
              <HeartIcon filled={favorite} />
            </button>

            <div className="absolute bottom-6 right-6 left-6 text-white">
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-white/75">
                <span className="flex items-center gap-1.5">
                  <LocationIcon />
                  {experience.location}
                </span>

                <span className="flex items-center gap-1.5">
                  <DistanceIcon />
                  {experience.distance}
                </span>

                <span className="flex items-center gap-1.5">
                  <StarIcon />
                  {experience.rating} • {experience.reviews}
                </span>
              </div>

              <h1
                className="mt-3 max-w-3xl text-3xl font-semibold md:text-4xl"
                style={{ fontFamily: "'Khebrat Musamim', sans-serif" }}
              >
                {experience.title}
              </h1>
            </div>
          </div>

          {/* BOOKING CARD */}
          <div className="rounded-[30px] border border-white/80 bg-white/70 p-6 backdrop-blur-xl md:p-7">
            <p className="text-[9px] font-bold tracking-[0.18em] text-[#B99124]">
              BOOK EXPERIENCE
            </p>

            <h2
              className="mt-2 text-2xl font-semibold text-[#0D3B34]"
              style={{ fontFamily: "'Khebrat Musamim', sans-serif" }}
            >
              احجز تجربتك
            </h2>

            <p className="mt-2 text-[10px] leading-5 text-[#0D3B34]/60">
              اختر عدد الزوار، وسيتم احتساب إجمالي الحجز بشكل مباشر.
            </p>

            <div className="mt-6 rounded-[18px] border border-[#0D3B34]/8 bg-white/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-medium text-[#0D3B34]/55">
                    السعر للفرد
                  </p>

                  <p className="mt-1 text-xl font-semibold text-[#0D3B34]">
                    {experience.price} ر.س
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D3B34] text-[#D4AF37]">
                  <TicketIcon />
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[18px] border border-[#0D3B34]/8 bg-white/60 p-4">
              <p className="text-[9px] font-medium text-[#0D3B34]/55">
                عدد الزوار
              </p>

              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setGuests((current) => Math.max(1, current - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#0D3B34]/10 bg-white text-[#0D3B34]"
                >
                  -
                </button>

                <span className="text-xl font-semibold text-[#0D3B34]">
                  {guests}
                </span>

                <button
                  type="button"
                  onClick={() => setGuests((current) => current + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D3B34] text-white"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-[18px] bg-[#0D3B34] p-4 text-white">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/70">
                  الإجمالي
                </span>

                <span className="text-2xl font-semibold text-[#D4AF37]">
                  {total} ر.س
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-[9px] text-white/60">
                <span>المكافأة المتوقعة</span>
                <span>+{experience.points * guests} نقطة</span>
              </div>
            </div>

            <Link
              href={`/experience/${experience.id}/booking?guests=${guests}`}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-[15px] bg-[#D4AF37] px-5 py-3.5 text-[11px] font-bold text-[#0D3B34] transition hover:bg-[#E0BE50]"
            >
              متابعة الحجز
              <ArrowIcon />
            </Link>

            <p className="mt-3 text-center text-[8px] leading-4 text-[#0D3B34]/55">
              الحجز والدفع الفعلي سيتم ربطهما لاحقًا بمزود الدفع ونظام التوفر.
            </p>
          </div>
        </section>

        {/* INFO */}
        <section className="mt-7 grid gap-5 xl:grid-cols-[1fr_0.65fr]">
          <div className="rounded-[28px] border border-white/80 bg-white/65 p-6 backdrop-blur-xl md:p-7">
            <p className="text-[9px] font-bold tracking-[0.18em] text-[#B99124]">
              ABOUT EXPERIENCE
            </p>

            <h2
              className="mt-2 text-[24px] font-semibold text-[#0D3B34]"
              style={{ fontFamily: "'Khebrat Musamim', sans-serif" }}
            >
              عن التجربة
            </h2>

            <p className="mt-4 max-w-3xl text-[11px] leading-7 text-[#0D3B34]/65">
              {experience.description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {experience.highlights.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 rounded-[15px] border border-[#0D3B34]/8 bg-white/55 px-4 py-3"
                >
                  <CheckIcon />
                  <span className="text-[10px] leading-5 text-[#0D3B34]/65">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* DETAILS */}
          <div className="rounded-[28px] border border-white/80 bg-white/65 p-6 backdrop-blur-xl">
            <p className="text-[9px] font-bold tracking-[0.18em] text-[#B99124]">
              EXPERIENCE DETAILS
            </p>

            <h2
              className="mt-2 text-xl font-semibold text-[#0D3B34]"
              style={{ fontFamily: "'Khebrat Musamim', sans-serif" }}
            >
              معلومات الزيارة
            </h2>

            <div className="mt-6 space-y-3">
              <DetailRow
                icon={<ClockIcon />}
                label="المدة"
                value={experience.duration}
              />

              <DetailRow
                icon={<LocationIcon />}
                label="الموقع"
                value={experience.location}
              />

              <DetailRow
                icon={<DistanceIcon />}
                label="المسافة"
                value={experience.distance}
              />

              <DetailRow
                icon={<RewardIcon />}
                label="مكافأة Loop"
                value={`+${experience.points} نقطة`}
              />
            </div>

            <button
              type="button"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#0D3B34]/10 bg-white/70 px-5 py-3 text-[10px] font-semibold text-[#0D3B34]/70"
            >
              <MapIcon />
              عرض الاتجاهات
            </button>
          </div>
        </section>

        {/* VERIFY */}
        <section className="mt-7">
          <div className="relative overflow-hidden rounded-[28px] bg-[#0D3B34] p-6 text-white md:p-7">
            <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-[#D4AF37]/10 blur-3xl" />

            <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-[9px] font-semibold tracking-[0.18em] text-[#D4AF37]">
                  VERIFIED VISIT
                </p>

                <h2
                  className="mt-2 text-xl font-semibold"
                  style={{ fontFamily: "'Khebrat Musamim', sans-serif" }}
                >
                  زيارتك المؤهلة تتحول إلى مكافأة
                </h2>

                <p className="mt-2 max-w-2xl text-[10px] leading-5 text-white/65">
                  بعد إكمال التجربة والتحقق من الزيارة عبر آلية التحقق المعتمدة
                  لاحقًا، يتم احتساب المهمة والنقاط المؤهلة في حسابك.
                </p>
              </div>

              <Link
                href="/missions"
                className="rounded-[14px] bg-[#D4AF37] px-6 py-3 text-center text-[10px] font-bold text-[#0D3B34]"
              >
                عرض مهام Loop
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* MOBILE NAV */}
      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-md -translate-x-1/2 items-center justify-around rounded-[20px] border border-white/80 bg-white/90 px-2 py-2 shadow-[0_12px_40px_rgba(13,59,52,0.12)] backdrop-blur-2xl lg:hidden">
        <MobileNavItem href="/discover" icon={<CompassIcon />} label="اكتشف" />
        <MobileNavItem href="/bookings" icon={<TicketIcon />} label="حجوزاتي" />
        <MobileNavItem href="/rewards" icon={<RewardIcon />} label="المكافآت" />
        <MobileNavItem href="/profile" icon={<UserIcon />} label="حسابي" />
      </nav>
    </main>
  );
}

/* ================= COMPONENTS ================= */

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-full px-5 py-2 text-[10px] font-semibold text-[#0D3B34]/65 transition hover:bg-[#0D3B34]/6 hover:text-[#0D3B34]"
    >
      {children}
    </Link>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[15px] border border-[#0D3B34]/8 bg-white/55 px-4 py-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0D3B34]/7 text-[#0D3B34]">
        {icon}
      </div>

      <div className="flex-1">
        <p className="text-[8px] font-medium text-[#0D3B34]/55">
          {label}
        </p>

        <p className="mt-1 text-[10px] font-semibold text-[#0D3B34]">
          {value}
        </p>
      </div>
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
      <span className="text-[8px] font-semibold">{label}</span>
    </Link>
  );
}

/* ================= ICONS ================= */

function BellIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
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

function DistanceIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="5" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
      <path d="M7 12h10" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#D4AF37" stroke="#D4AF37" strokeWidth="1.5">
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3l-5.5 2.9 1-6.2L3 9.6l6.2-.9L12 3Z" />
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

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
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

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B99124" strokeWidth="1.8">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
      <path d="M9 3v15M15 6v15" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
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

function CompassIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-2 4-4 2 2-4 4-2Z" />
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