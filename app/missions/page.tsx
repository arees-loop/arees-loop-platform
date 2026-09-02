"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type MissionStatus = "active" | "completed" | "locked";

type Mission = {
  id: number;
  title: string;
  description: string;
  reward: number;
  progress: number;
  target: number;
  status: MissionStatus;
  timeLeft?: string;
  category: string;
};

const missions: Mission[] = [
  {
    id: 1,
    title: "اكتشف 3 معالم قريبة",
    description:
      "زر ثلاثة معالم موثقة قريبة منك وسجّل وصولك لإكمال المهمة.",
    reward: 150,
    progress: 1,
    target: 3,
    status: "active",
    timeLeft: "ينتهي اليوم",
    category: "استكشاف",
  },
  {
    id: 2,
    title: "رحلة في السيرة",
    description:
      "أكمل زيارتين من التجارب المرتبطة بالسيرة النبوية في المدينة المنورة.",
    reward: 250,
    progress: 1,
    target: 2,
    status: "active",
    timeLeft: "متبقي 4 أيام",
    category: "ثقافة",
  },
  {
    id: 3,
    title: "أسبوع الاكتشاف",
    description:
      "أكمل خمس تجارب مؤهلة خلال سبعة أيام واكسب مكافأة إضافية.",
    reward: 500,
    progress: 5,
    target: 5,
    status: "completed",
    category: "تحدي",
  },
  {
    id: 4,
    title: "Explorer المتقدم",
    description:
      "أكمل ثلاث مهام Loop للوصول إلى هذا التحدي الخاص.",
    reward: 750,
    progress: 1,
    target: 3,
    status: "locked",
    category: "مستوى",
  },
];

export default function MissionsPage() {
  const [activeFilter, setActiveFilter] = useState<
    "all" | MissionStatus
  >("all");

  const [startedMissions, setStartedMissions] = useState<number[]>([1, 2]);

  const filteredMissions =
    activeFilter === "all"
      ? missions
      : missions.filter(
          (mission) => mission.status === activeFilter
        );

  function startMission(id: number) {
    if (!startedMissions.includes(id)) {
      setStartedMissions((current) => [...current, id]);
    }
  }

  const activeCount = missions.filter(
    (mission) => mission.status === "active"
  ).length;

  const completedCount = missions.filter(
    (mission) => mission.status === "completed"
  ).length;

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#F7F5EF] text-[#0D3B34]"
      style={{
        fontFamily: "'DIN Next Arabic', sans-serif",
      }}
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
              <NavLink href="/discover">
                اكتشف
              </NavLink>

              <NavLink href="/bookings">
                حجوزاتي
              </NavLink>

              <NavLink href="/rewards">
                المكافآت
              </NavLink>

              <NavLink href="/favorites">
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
              LOOP MISSIONS
            </p>

            <h1
              className="mt-2 text-[30px] font-semibold text-[#0D3B34] md:text-[38px]"
              style={{
                fontFamily:
                  "'Khebrat Musamim', sans-serif",
              }}
            >
              مهام Loop
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-6 text-[#0D3B34]/65">
              حوّل اكتشافك للوجهة إلى تحديات ممتعة،
              أكمل الزيارات المؤهلة واكسب نقاط Loop.
            </p>
          </div>

          <Link
            href="/discover"
            className="inline-flex items-center justify-center gap-2 rounded-[15px] bg-[#0D3B34] px-5 py-3 text-[11px] font-semibold text-white transition hover:bg-[#154C42]"
          >
            <CompassIcon />
            اكتشف حولك
          </Link>
        </section>

        {/* HERO MISSION */}
        <section className="mt-7">
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#092F29] via-[#0D3B34] to-[#174E44] p-7 text-white md:p-9">
            <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full border border-white/[0.05]" />

            <div className="absolute left-8 top-10 h-56 w-56 rounded-full border border-[#D4AF37]/10" />

            <div className="absolute -bottom-28 right-[28%] h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />

            <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_0.45fr]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#D4AF37] px-3 py-1.5 text-[9px] font-bold text-[#0D3B34]">
                    مهمة اليوم
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[9px] font-semibold text-white/75">
                    استكشاف
                  </span>
                </div>

                <h2
                  className="mt-5 text-2xl font-semibold md:text-3xl"
                  style={{
                    fontFamily:
                      "'Khebrat Musamim', sans-serif",
                  }}
                >
                  اكتشف 3 معالم قريبة
                </h2>

                <p className="mt-3 max-w-2xl text-[11px] leading-6 text-white/70">
                  زر ثلاثة معالم موثقة قريبة منك
                  وسجّل وصولك لإكمال المهمة والحصول
                  على المكافأة.
                </p>

                <div className="mt-7 max-w-xl">
                  <div className="mb-2 flex items-center justify-between text-[9px] text-white/70">
                    <span>تمت زيارة 1 من 3</span>
                    <span>33%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-1/3 rounded-full bg-[#D4AF37]" />
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => startMission(1)}
                    className="rounded-[14px] bg-[#D4AF37] px-6 py-3 text-[10px] font-bold text-[#0D3B34] transition hover:bg-[#E0BE50]"
                  >
                    متابعة المهمة
                  </button>

                  <span className="flex items-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.06] px-4 py-3 text-[9px] text-white/75">
                    <ClockIcon />
                    تنتهي اليوم
                  </span>
                </div>
              </div>

              {/* REWARD */}
              <div className="rounded-[26px] border border-white/10 bg-white/[0.065] p-6 backdrop-blur-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#D4AF37] text-[#0D3B34]">
                  <RewardIcon />
                </div>

                <p className="mt-5 text-[9px] font-semibold tracking-[0.16em] text-white/65">
                  MISSION REWARD
                </p>

                <div className="mt-2 flex items-end gap-2">
                  <span className="text-4xl font-semibold text-[#E1BD4E]">
                    150
                  </span>

                  <span className="pb-1 text-[10px] text-white/65">
                    نقطة
                  </span>
                </div>

                <p className="mt-3 text-[9px] leading-5 text-white/60">
                  تضاف النقاط بعد إكمال شروط المهمة
                  والتحقق من الزيارات المؤهلة.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SUMMARY */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="المهام النشطة"
            value={activeCount.toString()}
            description="يمكنك إكمالها الآن"
            icon={<MissionIcon />}
          />

          <SummaryCard
            title="مهام مكتملة"
            value={completedCount.toString()}
            description="هذا الشهر"
            icon={<CheckIcon />}
          />

          <SummaryCard
            title="نقاط المهام"
            value="650"
            description="إجمالي ما كسبته"
            icon={<RewardIcon />}
          />

          <SummaryCard
            title="سلسلة الاستكشاف"
            value="4"
            description="أيام متتالية"
            icon={<FireIcon />}
          />
        </section>

        {/* FILTER */}
        <section className="mt-9">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <FilterButton
              active={activeFilter === "all"}
              onClick={() => setActiveFilter("all")}
            >
              كل المهام
            </FilterButton>

            <FilterButton
              active={activeFilter === "active"}
              onClick={() => setActiveFilter("active")}
            >
              نشطة
            </FilterButton>

            <FilterButton
              active={activeFilter === "completed"}
              onClick={() =>
                setActiveFilter("completed")
              }
            >
              مكتملة
            </FilterButton>

            <FilterButton
              active={activeFilter === "locked"}
              onClick={() => setActiveFilter("locked")}
            >
              مقفلة
            </FilterButton>
          </div>
        </section>

        {/* MISSIONS GRID */}
        <section className="mt-5">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                started={startedMissions.includes(
                  mission.id
                )}
                onStart={() =>
                  startMission(mission.id)
                }
              />
            ))}
          </div>
        </section>

        {/* HOW VERIFICATION WORKS */}
        <section className="mt-10">
          <div className="rounded-[30px] border border-white/80 bg-white/65 p-6 backdrop-blur-xl md:p-7">
            <div>
              <p className="text-[9px] font-bold tracking-[0.18em] text-[#B99124]">
                VERIFIED EXPERIENCE
              </p>

              <h2
                className="mt-2 text-[24px] font-semibold text-[#0D3B34]"
                style={{
                  fontFamily:
                    "'Khebrat Musamim', sans-serif",
                }}
              >
                كيف تكتمل المهمة؟
              </h2>

              <p className="mt-2 max-w-xl text-[10px] leading-5 text-[#0D3B34]/60">
                يتم احتساب التقدم بعد التحقق من
                النشاط أو الزيارة المؤهلة داخل
                Arees Loop.
              </p>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <StepCard
                number="01"
                title="اكتشف"
                description="اختر تجربة أو معلمًا مؤهلًا ضمن المهمة."
                icon={<CompassIcon />}
              />

              <StepCard
                number="02"
                title="عِش التجربة"
                description="قم بالزيارة أو أكمل النشاط وفق شروط المهمة."
                icon={<LocationIcon />}
              />

              <StepCard
                number="03"
                title="اكسب المكافأة"
                description="بعد التحقق، تضاف نقاط Loop إلى حسابك."
                icon={<RewardIcon />}
              />
            </div>
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

function MissionCard({
  mission,
  started,
  onStart,
}: {
  mission: Mission;
  started: boolean;
  onStart: () => void;
}) {
  const percentage = Math.min(
    100,
    Math.round(
      (mission.progress / mission.target) * 100
    )
  );

  const locked = mission.status === "locked";
  const completed = mission.status === "completed";

  return (
    <article
      className={`relative overflow-hidden rounded-[25px] border bg-white/65 p-5 backdrop-blur-xl ${
        locked
          ? "border-[#0D3B34]/7 opacity-75"
          : completed
            ? "border-[#D4AF37]/25"
            : "border-white/80"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${
            completed
              ? "bg-[#D4AF37] text-[#0D3B34]"
              : locked
                ? "bg-[#0D3B34]/8 text-[#0D3B34]/55"
                : "bg-[#0D3B34] text-[#D4AF37]"
          }`}
        >
          {locked ? (
            <LockIcon />
          ) : completed ? (
            <CheckIcon />
          ) : (
            <MissionIcon />
          )}
        </div>

        <span className="rounded-full bg-[#D4AF37]/10 px-3 py-1.5 text-[8px] font-semibold text-[#76580F]">
          {mission.category}
        </span>
      </div>

      <h3
        className="mt-5 text-lg font-semibold text-[#0D3B34]"
        style={{
          fontFamily:
            "'Khebrat Musamim', sans-serif",
        }}
      >
        {mission.title}
      </h3>

      <p className="mt-2 min-h-[42px] text-[10px] leading-5 text-[#0D3B34]/62">
        {mission.description}
      </p>

      <div className="mt-5">
        <div className="flex items-center justify-between text-[9px] font-medium text-[#0D3B34]/60">
          <span>
            {mission.progress} من {mission.target}
          </span>

          <span>{percentage}%</span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#0D3B34]/8">
          <div
            className={`h-full rounded-full ${
              completed
                ? "bg-[#D4AF37]"
                : "bg-[#0D3B34]"
            }`}
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[#0D3B34]/[0.07] pt-4">
        <div>
          <p className="text-[8px] font-medium text-[#0D3B34]/55">
            المكافأة
          </p>

          <p className="mt-1 text-[12px] font-semibold text-[#0D3B34]">
            +{mission.reward} نقطة
          </p>
        </div>

        {completed ? (
          <span className="rounded-[12px] bg-[#D4AF37]/12 px-4 py-2.5 text-[9px] font-semibold text-[#76580F]">
            مكتملة
          </span>
        ) : locked ? (
          <span className="rounded-[12px] bg-[#0D3B34]/7 px-4 py-2.5 text-[9px] font-semibold text-[#0D3B34]/55">
            مقفلة
          </span>
        ) : (
          <button
            type="button"
            onClick={onStart}
            className={`rounded-[12px] px-4 py-2.5 text-[9px] font-semibold transition ${
              started
                ? "border border-[#0D3B34]/10 bg-white/70 text-[#0D3B34]/70"
                : "bg-[#0D3B34] text-white"
            }`}
          >
            {started ? "متابعة" : "ابدأ المهمة"}
          </button>
        )}
      </div>

      {mission.timeLeft && !completed && !locked && (
        <div className="mt-3 flex items-center gap-1.5 text-[8px] font-medium text-[#0D3B34]/55">
          <ClockIcon />
          {mission.timeLeft}
        </div>
      )}
    </article>
  );
}

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-[#0D3B34]/8 bg-white/55 p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D3B34] text-[#D4AF37]">
          {icon}
        </div>

        <span className="text-[10px] font-bold text-[#D4AF37]">
          {number}
        </span>
      </div>

      <h3 className="mt-4 text-[12px] font-semibold text-[#0D3B34]">
        {title}
      </h3>

      <p className="mt-2 text-[9px] leading-5 text-[#0D3B34]/60">
        {description}
      </p>
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
      <path
        d="M12 6v12"
        strokeDasharray="2 2"
      />
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

function MissionIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4V2M20 12h2" />
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

function FireIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M12 22c4 0 7-2.8 7-7 0-3-1.8-5.7-4.7-8.7.1 2-1 3.5-2.3 4.4.1-3.8-1.8-6.7-4.1-8.7.2 3-2.9 5.3-2.9 9.3C5 17.6 7.9 22 12 22Z" />
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

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
      />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
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