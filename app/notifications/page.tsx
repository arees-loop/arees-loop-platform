"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type NotificationType =
  | "booking"
  | "reward"
  | "experience"
  | "system";

type NotificationItem = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  href?: string;
};

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    type: "booking",
    title: "تم تأكيد حجزك",
    message:
      "تم تأكيد حجز متحف وبستان الصافية ليوم 05 سبتمبر 2026 الساعة 5:30 م.",
    time: "منذ 8 دقائق",
    unread: true,
    href: "/bookings/1",
  },
  {
    id: 2,
    type: "reward",
    title: "أضفنا 150 نقطة إلى حسابك",
    message:
      "تمت إضافة نقاط Loop بعد إتمام تجربة مؤهلة والتحقق من الزيارة.",
    time: "منذ 45 دقيقة",
    unread: true,
    href: "/rewards",
  },
  {
    id: 3,
    type: "experience",
    title: "تجربة قريبة منك الآن",
    message:
      "يوجد نشاط ثقافي قريب من موقعك ويتوافق مع اهتماماتك الحالية.",
    time: "منذ ساعتين",
    unread: true,
    href: "/discover",
  },
  {
    id: 4,
    type: "booking",
    title: "تذكير بموعد الحجز",
    message:
      "باقي أقل من 24 ساعة على موعد زيارتك. تأكد من وقت الوصول والتذكرة.",
    time: "أمس",
    unread: false,
    href: "/bookings/1",
  },
  {
    id: 5,
    type: "system",
    title: "تم تحديث إعدادات حسابك",
    message:
      "تم حفظ تفضيلات الموقع والإشعارات بنجاح ويمكنك تعديلها من حسابك.",
    time: "أمس",
    unread: false,
    href: "/profile",
  },
  {
    id: 6,
    type: "reward",
    title: "مهمة Loop جديدة",
    message:
      "اكتشف 3 معالم قريبة اليوم واحصل على 150 نقطة إضافية.",
    time: "منذ يومين",
    unread: false,
    href: "/missions",
  },
];

const filters: {
  id: "all" | NotificationType;
  label: string;
}[] = [
  { id: "all", label: "الكل" },
  { id: "booking", label: "الحجوزات" },
  { id: "reward", label: "المكافآت" },
  { id: "experience", label: "التجارب" },
  { id: "system", label: "النظام" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState(initialNotifications);

  const [filter, setFilter] = useState<
    "all" | NotificationType
  >("all");

  const filteredNotifications = useMemo(() => {
    if (filter === "all") return notifications;

    return notifications.filter(
      (notification) => notification.type === filter
    );
  }, [filter, notifications]);

  const unreadCount = notifications.filter(
    (item) => item.unread
  ).length;

  function markAsRead(id: number) {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, unread: false }
          : item
      )
    );
  }

  function markAllAsRead() {
    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        unread: false,
      }))
    );
  }

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
              className="hidden items-center gap-2 rounded-full bg-[#0D3B34] px-3.5 py-2 text-[11px] font-semibold text-white md:flex"
            >
              <BellIcon />

              <span className="hidden xl:inline">
                الإشعارات
              </span>

              {unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[8px] font-bold text-[#0D3B34]">
                  {unreadCount}
                </span>
              )}
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
              NOTIFICATIONS
            </p>

            <h1
              className="mt-2 text-[30px] font-semibold text-[#0D3B34] md:text-[38px]"
              style={{
                fontFamily:
                  "var(--font-el-messiri), sans-serif",
              }}
            >
              الإشعارات
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-6 text-[#0D3B34]/65">
              تحديثات الحجوزات والمكافآت والتجارب المهمة
              في مكان واحد.
            </p>
          </div>

          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center justify-center gap-2 rounded-[15px] border border-[#0D3B34]/10 bg-white/65 px-5 py-3 text-[10px] font-semibold text-[#0D3B34]/70 transition hover:border-[#0D3B34]/20 hover:text-[#0D3B34] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckIcon />
            تعليم الكل كمقروء
          </button>
        </section>

        {/* SUMMARY */}
        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            title="كل الإشعارات"
            value={notifications.length.toString()}
            description="إجمالي التحديثات"
            icon={<BellIconLarge />}
          />

          <SummaryCard
            title="غير مقروءة"
            value={unreadCount.toString()}
            description="تحتاج انتباهك"
            icon={<UnreadIcon />}
          />

          <SummaryCard
            title="اليوم"
            value="3"
            description="تحديثات جديدة"
            icon={<ClockIcon />}
          />
        </section>

        {/* FILTERS */}
        <section className="mt-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`shrink-0 rounded-full border px-5 py-2.5 text-[10px] font-semibold transition ${
                  filter === item.id
                    ? "border-[#0D3B34] bg-[#0D3B34] text-white"
                    : "border-[#0D3B34]/10 bg-white/55 text-[#0D3B34]/65 hover:border-[#0D3B34]/20 hover:text-[#0D3B34]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* LIST */}
        <section className="mt-5">
          <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/65 backdrop-blur-xl">
            {filteredNotifications.map(
              (notification, index) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onRead={() =>
                    markAsRead(notification.id)
                  }
                  border={
                    index !==
                    filteredNotifications.length - 1
                  }
                />
              )
            )}

            {filteredNotifications.length === 0 && (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#0D3B34] text-[#D4AF37]">
                  <BellIconLarge />
                </div>

                <h3
                  className="mt-5 text-lg font-semibold text-[#0D3B34]"
                  style={{
                    fontFamily:
                      "var(--font-el-messiri), sans-serif",
                  }}
                >
                  لا توجد إشعارات هنا
                </h3>

                <p className="mt-2 text-[10px] text-[#0D3B34]/60">
                  أي تحديث جديد سيظهر في هذا القسم.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* SETTINGS CTA */}
        <section className="mt-8">
          <div className="flex flex-col gap-5 rounded-[26px] border border-[#D4AF37]/20 bg-[#0D3B34] p-6 text-white md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[9px] font-semibold tracking-[0.18em] text-[#D4AF37]">
                NOTIFICATION SETTINGS
              </p>

              <h2
                className="mt-2 text-xl font-semibold"
                style={{
                  fontFamily:
                    "var(--font-el-messiri), sans-serif",
                }}
              >
                أنت تتحكم فيما يصلك
              </h2>

              <p className="mt-2 max-w-xl text-[10px] leading-5 text-white/65">
                عدّل إشعارات الحجوزات والمكافآت
                والتوصيات والموقع من إعدادات حسابك.
              </p>
            </div>

            <Link
              href="/profile"
              className="rounded-[14px] bg-[#D4AF37] px-6 py-3 text-center text-[10px] font-bold text-[#0D3B34]"
            >
              إدارة الإعدادات
            </Link>
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

function NotificationRow({
  notification,
  onRead,
  border,
}: {
  notification: NotificationItem;
  onRead: () => void;
  border: boolean;
}) {
  const content = (
    <div
      className={`group relative flex gap-4 px-5 py-5 transition hover:bg-[#0D3B34]/[0.025] ${
        border
          ? "border-b border-[#0D3B34]/[0.07]"
          : ""
      }`}
    >
      {notification.unread && (
        <span className="absolute right-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#D4AF37]" />
      )}

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${
          notification.unread
            ? "bg-[#0D3B34] text-[#D4AF37]"
            : "bg-[#0D3B34]/7 text-[#0D3B34]/70"
        }`}
      >
        <NotificationTypeIcon
          type={notification.type}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h3
            className={`text-[11px] ${
              notification.unread
                ? "font-bold text-[#0D3B34]"
                : "font-semibold text-[#0D3B34]/80"
            }`}
          >
            {notification.title}
          </h3>

          <span className="text-[9px] font-medium text-[#0D3B34]/55">
            {notification.time}
          </span>
        </div>

        <p className="mt-2 max-w-3xl text-[10px] leading-5 text-[#0D3B34]/65">
          {notification.message}
        </p>

        {notification.unread && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              onRead();
            }}
            className="mt-3 text-[9px] font-semibold text-[#8A6817] transition hover:text-[#0D3B34]"
          >
            تعليم كمقروء
          </button>
        )}
      </div>

      {notification.href && (
        <div className="hidden items-center text-[#0D3B34]/45 sm:flex">
          <ArrowIcon />
        </div>
      )}
    </div>
  );

  if (!notification.href) {
    return content;
  }

  return (
    <Link href={notification.href}>
      {content}
    </Link>
  );
}

function NotificationTypeIcon({
  type,
}: {
  type: NotificationType;
}) {
  if (type === "booking") {
    return <TicketIcon />;
  }

  if (type === "reward") {
    return <RewardIcon />;
  }

  if (type === "experience") {
    return <CompassIcon />;
  }

  return <ShieldIcon />;
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

function BellIconLarge() {
  return (
    <svg
      width="19"
      height="19"
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

function UnreadIcon() {
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
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function ClockIcon() {
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
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
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

function ShieldIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M12 3 5 6v5c0 4.7 2.9 8.2 7 10 4.1-1.8 7-5.3 7-10V6l-7-3Z" />
      <path d="m9.5 12 1.7 1.7 3.6-4" />
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