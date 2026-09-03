"use client";

import Image from "next/image";
import Link from "next/link";

const rewardsHistory = [
  {
    id: 1,
    title: "زيارة متحف وبستان الصافية",
    date: "05 سبتمبر 2026",
    points: "+150",
    type: "earned",
  },
  {
    id: 2,
    title: "حجز المتحف الدولي للسيرة النبوية",
    date: "29 أغسطس 2026",
    points: "+200",
    type: "earned",
  },
  {
    id: 3,
    title: "استبدال خصم على تجربة سياحية",
    date: "23 أغسطس 2026",
    points: "-100",
    type: "redeemed",
  },
  {
    id: 4,
    title: "إكمال مهمة Loop",
    date: "18 أغسطس 2026",
    points: "+300",
    type: "earned",
  },
];

const rewards = [
  {
    id: 1,
    title: "خصم 10 ر.س",
    description: "استخدمه في تجربة مؤهلة داخل Arees Loop",
    points: "1,000 نقطة",
    category: "خصم",
  },
  {
    id: 2,
    title: "خصم 20 ر.س",
    description: "متاح على الحجوزات المؤهلة",
    points: "2,000 نقطة",
    category: "خصم",
  },
  {
    id: 3,
    title: "تجربة خاصة",
    description: "وصول إلى تجربة أو فعالية مختارة",
    points: "3,500 نقطة",
    category: "تجربة",
  },
];

export default function RewardsPage() {
  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#F7F5EF] text-[#0D3B34]"
      style={{ fontFamily: "var(--font-ibm-plex-arabic), sans-serif" }}
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_10%,rgba(212,175,55,0.11),transparent_25%),radial-gradient(circle_at_7%_80%,rgba(13,59,52,0.08),transparent_30%),linear-gradient(135deg,#FAF8F2_0%,#F4F1E8_52%,#F8F6F0_100%)]" />

        <div className="absolute -right-44 top-24 h-[500px] w-[500px] rounded-full bg-[#0D3B34]/[0.045] blur-[120px]" />

        <div className="absolute -left-44 bottom-0 h-[470px] w-[470px] rounded-full bg-[#D4AF37]/[0.06] blur-[130px]" />
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

              <NavLink href="/rewards" active>
                المكافآت
              </NavLink>

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
        <section>
          <p className="text-[9px] font-bold tracking-[0.2em] text-[#B99124]">
            LOOP REWARDS
          </p>

          <h1
            className="mt-2 text-[30px] font-semibold text-[#0D3B34] md:text-[38px]"
            style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
          >
            مكافآت Loop
          </h1>

          <p className="mt-2 max-w-xl text-xs leading-6 text-[#0D3B34]/65">
            اكسب نقاطًا من التجارب والزيارات والمهمات المؤهلة، واستخدمها في
            مكافآت وخصومات داخل المنصة.
          </p>
        </section>

        {/* WALLET */}
        <section className="mt-7 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#0A332C] via-[#0D3B34] to-[#154C42] p-7 text-white md:p-8">
            <div className="absolute -left-16 -top-16 h-60 w-60 rounded-full border border-white/[0.05]" />

            <div className="absolute left-12 top-14 h-44 w-44 rounded-full border border-[#D4AF37]/10" />

            <div className="absolute -bottom-24 right-[25%] h-64 w-64 rounded-full bg-[#D4AF37]/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] font-semibold tracking-[0.18em] text-[#D4AF37]">
                    LOOP WALLET
                  </p>

                  <h2
                    className="mt-2 text-2xl font-semibold"
                    style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
                  >
                    رصيدك الحالي
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-[#D4AF37]">
                  <RewardIcon />
                </div>
              </div>

              <div className="mt-10 flex items-end gap-3">
                <span className="text-5xl font-semibold text-[#E2BD4C]">
                  1,240
                </span>

                <span className="pb-1 text-xs text-white/65">نقطة</span>
              </div>

              <p className="mt-2 text-[10px] text-white/55">
                قيمة استبدال تقديرية: 12.40 ر.س
              </p>

              <div className="mt-8">
                <div className="mb-2 flex items-center justify-between text-[9px] text-white/60">
                  <span>Explorer</span>
                  <span>2,000 نقطة للمستوى التالي</span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[62%] rounded-full bg-[#D4AF37]" />
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[9px] font-semibold text-white/75">
                  +350 نقطة هذا الشهر
                </span>

                <span className="rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-2 text-[9px] font-semibold text-[#E6C25C]">
                  2 مهمة مكتملة
                </span>
              </div>
            </div>
          </div>

          {/* LEVEL */}
          <div className="rounded-[30px] border border-white/80 bg-white/65 p-6 backdrop-blur-xl">
            <p className="text-[9px] font-semibold tracking-[0.16em] text-[#B99124]">
              MEMBER LEVEL
            </p>

            <h2
              className="mt-2 text-xl font-semibold"
              style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
            >
              مستوى Explorer
            </h2>

            <p className="mt-2 text-[10px] leading-5 text-[#0D3B34]/60">
              استمر في الاكتشاف والحجز والزيارات المؤهلة للوصول إلى مستويات
              أعلى ومزايا إضافية.
            </p>

            <div className="mt-6 space-y-3">
              <LevelItem
                title="Explorer"
                text="مستواك الحالي"
                active
              />

              <LevelItem
                title="Traveller"
                text="ابتداءً من 2,000 نقطة"
              />

              <LevelItem
                title="Insider"
                text="ابتداءً من 5,000 نقطة"
              />
            </div>
          </div>
        </section>

        {/* REWARDS AVAILABLE */}
        <section className="mt-10">
          <SectionTitle
            eyebrow="REDEEM"
            title="مكافآت متاحة لك"
            description="اختر المكافأة المناسبة واستخدم نقاطك داخل المنصة."
          />

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rewards.map((reward) => (
              <RewardCard key={reward.id} reward={reward} />
            ))}
          </div>
        </section>

        {/* MISSION */}
        <section className="mt-10">
          <div className="relative overflow-hidden rounded-[28px] border border-[#D4AF37]/20 bg-[#0D3B34] p-6 text-white md:p-7">
            <div className="absolute -left-28 top-0 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />

            <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_auto]">
              <div>
                <span className="rounded-full bg-[#D4AF37]/12 px-3 py-1.5 text-[9px] font-semibold text-[#D4AF37]">
                  LOOP MISSION
                </span>

                <h2
                  className="mt-4 text-xl font-semibold"
                  style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
                >
                  اكسب 150 نقطة إضافية اليوم
                </h2>

                <p className="mt-2 max-w-xl text-[10px] leading-5 text-white/60">
                  أكمل مهمة اكتشاف ثلاثة معالم قريبة وسجّل الزيارة عند الوصول.
                </p>
              </div>

              <Link
                href="/missions"
                className="rounded-[15px] bg-[#D4AF37] px-6 py-3 text-center text-[10px] font-bold text-[#0D3B34]"
              >
                عرض المهمة
              </Link>
            </div>
          </div>
        </section>

        {/* HISTORY */}
        <section className="mt-10">
          <SectionTitle
            eyebrow="ACTIVITY"
            title="حركة النقاط"
            description="آخر عمليات الكسب والاستبدال على حسابك."
          />

          <div className="mt-5 overflow-hidden rounded-[26px] border border-white/80 bg-white/65 backdrop-blur-xl">
            {rewardsHistory.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-4 px-5 py-4 ${
                  index !== rewardsHistory.length - 1
                    ? "border-b border-[#0D3B34]/[0.07]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      item.type === "earned"
                        ? "bg-[#0D3B34] text-[#D4AF37]"
                        : "bg-[#D4AF37]/12 text-[#8A6817]"
                    }`}
                  >
                    {item.type === "earned" ? (
                      <PlusIcon />
                    ) : (
                      <MinusIcon />
                    )}
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-[#0D3B34]">
                      {item.title}
                    </p>

                    <p className="mt-1 text-[9px] text-[#0D3B34]/55">
                      {item.date}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-sm font-semibold ${
                    item.type === "earned"
                      ? "text-[#2C6B56]"
                      : "text-[#8A6817]"
                  }`}
                >
                  {item.points}
                </span>
              </div>
            ))}
          </div>
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
          icon={<RewardSmallIcon />}
          label="المكافآت"
          active
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

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-bold tracking-[0.18em] text-[#B99124]">
        {eyebrow}
      </p>

      <h2
        className="mt-1.5 text-[24px] font-semibold text-[#0D3B34]"
        style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
      >
        {title}
      </h2>

      <p className="mt-1 text-[11px] text-[#0D3B34]/60">
        {description}
      </p>
    </div>
  );
}

function LevelItem({
  title,
  text,
  active = false,
}: {
  title: string;
  text: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-[16px] border px-4 py-3 ${
        active
          ? "border-[#D4AF37]/30 bg-[#D4AF37]/8"
          : "border-[#0D3B34]/8 bg-white/55"
      }`}
    >
      <div>
        <p className="text-[11px] font-semibold text-[#0D3B34]">
          {title}
        </p>

        <p className="mt-1 text-[9px] text-[#0D3B34]/55">{text}</p>
      </div>

      {active && (
        <span className="rounded-full bg-[#0D3B34] px-3 py-1 text-[8px] font-semibold text-white">
          الحالي
        </span>
      )}
    </div>
  );
}

function RewardCard({
  reward,
}: {
  reward: {
    id: number;
    title: string;
    description: string;
    points: string;
    category: string;
  };
}) {
  return (
    <article className="rounded-[24px] border border-white/80 bg-white/65 p-5 backdrop-blur-xl">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D3B34] text-[#D4AF37]">
          <RewardIcon />
        </div>

        <span className="rounded-full bg-[#D4AF37]/10 px-3 py-1.5 text-[8px] font-semibold text-[#80600F]">
          {reward.category}
        </span>
      </div>

      <h3 className="mt-5 text-base font-semibold text-[#0D3B34]">
        {reward.title}
      </h3>

      <p className="mt-2 min-h-[40px] text-[10px] leading-5 text-[#0D3B34]/60">
        {reward.description}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-[#0D3B34]/[0.07] pt-4">
        <span className="text-[11px] font-semibold text-[#0D3B34]">
          {reward.points}
        </span>

        <button
          type="button"
          className="rounded-[12px] bg-[#0D3B34] px-4 py-2.5 text-[9px] font-semibold text-white"
        >
          استبدال
        </button>
      </div>
    </article>
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

function RewardIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M12 3 15 8l6 .8-4.3 4.2 1 6-5.7-2.8L6.3 19l1-6L3 8.8 9 8l3-5Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M5 12h14" />
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