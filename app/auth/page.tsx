"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function AuthPage() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    setMouse({
      x: e.clientX / window.innerWidth - 0.5,
      y: e.clientY / window.innerHeight - 0.5,
    });
  }

  return (
    <main
      dir="rtl"
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden text-[#0D3B34]"
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/Image/auth/arees-auth-bg-desktop.png"
          alt="Arees Loop"
          fill
          priority
          className="object-cover object-center transition-transform duration-700 ease-out"
          style={{
            transform: `scale(1.045) translate(${mouse.x * -18}px, ${
              mouse.y * -10
            }px)`,
          }}
        />
        <div className="absolute inset-0 bg-white/[0.025]" />
      </div>

      {/* DESKTOP */}
      <section className="relative z-10 mx-auto hidden min-h-screen max-w-[1360px] px-10 lg:block">
        <div className="grid min-h-screen grid-cols-2 gap-[110px] pt-[7vh]">
          {/* RIGHT — BRAND */}
          <div className="flex justify-center">
            <div className="flex w-full max-w-[500px] flex-col items-center text-center">
              {/* Logo */}
              <Image
                src="/Logo/arees-loop-brand.png"
                alt="Arees Loop"
                width={700}
                height={700}
                priority
                className="h-auto w-[270px] xl:w-[280px]"
              />

              {/* Welcome */}
              <div className="mt-5">
                <h1
                  className="text-[34px] font-semibold leading-[1.25] xl:text-[36px]"
                  style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
                >
                  مرحبًا بك في أريس لوب
                </h1>

                <div className="mt-3 flex items-center justify-center gap-3">
                  <span className="h-px w-7 bg-[#D4AF37]" />

                  <p
                    className="text-[13px] text-[#0D3B34]/70"
                    style={{
                      fontFamily:
                        "var(--font-ibm-plex-arabic), sans-serif",
                    }}
                  >
                    اختر الطريقة المناسبة لك للبدء
                  </p>

                  <span className="h-px w-7 bg-[#D4AF37]" />
                </div>
              </div>

              {/* TRUST ITEMS */}
              <div className="mt-6 flex w-full items-center justify-center gap-3">
                <TrustItem
                  icon={<ShieldIcon />}
                  title="آمن وموثوق"
                  text="حماية بياناتك"
                />

                <TrustItem
                  icon={<SparkIcon />}
                  title="تجارب مختارة"
                  text="توصيات أفضل"
                />

                <TrustItem
                  icon={<HeadsetIcon />}
                  title="دعم مستمر"
                  text="نحن هنا لمساعدتك"
                />
              </div>
            </div>
          </div>

          {/* LEFT — ACTIONS */}
          <div className="flex justify-center">
            <div className="w-full max-w-[520px]">
              {/* Create */}
              <ActionCard
                href="/onboarding"
                type="gold"
                icon={<UserPlusIcon />}
                title="إنشاء حساب جديد"
                subtitle="ابدأ رحلتك معنا"
              />

              {/* Login */}
              <div className="mt-4">
                <ActionCard
                  href="/login"
                  icon={<LoginIcon />}
                  title="تسجيل الدخول"
                  subtitle="لديك حساب بالفعل؟"
                />
              </div>

              {/* Divider */}
              <div className="my-4 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#0D3B34]/16" />

                <span
                  className="text-[11px] font-semibold text-[#0D3B34]/55"
                  style={{
                    fontFamily:
                      "var(--font-ibm-plex-arabic), sans-serif",
                  }}
                >
                  أو
                </span>

                <div className="h-px flex-1 bg-[#0D3B34]/16" />
              </div>

              {/* Guest */}
              <ActionCard
                href="/discover"
                icon={<GuestIcon />}
                title="المتابعة كزائر"
                subtitle="تصفح المنصة بدون تسجيل دخول"
              />

              {/* Footer */}
              <div
                className="mt-5 flex items-center justify-between px-1 text-[10px] text-[#0D3B34]/55"
                style={{
                  fontFamily:
                    "var(--font-ibm-plex-arabic), sans-serif",
                }}
              >
                <span>© Arees Loop</span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="font-semibold text-[#0D3B34]"
                  >
                    العربية
                  </button>

                  <span className="opacity-40">|</span>

                  <button type="button">EN</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE */}
      <section className="relative z-10 flex min-h-screen items-center justify-center px-5 py-7 lg:hidden">
        <div className="w-full max-w-[420px]">
          <div className="flex justify-center">
            <Image
              src="/Logo/arees-loop-brand.png"
              alt="Arees Loop"
              width={600}
              height={600}
              priority
              className="h-auto w-[190px]"
            />
          </div>

          <div className="mt-5 text-center">
            <h1
              className="text-[28px] font-semibold"
              style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
            >
              مرحبًا بك في أريس لوب
            </h1>

            <p
              className="mt-2 text-xs text-[#0D3B34]/60"
              style={{
                fontFamily:
                  "var(--font-ibm-plex-arabic), sans-serif",
              }}
            >
              اختر الطريقة المناسبة لك للبدء
            </p>
          </div>

          {/* MOBILE TRUST */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <TrustItem
              icon={<ShieldIcon />}
              title="آمن وموثوق"
              text="حماية بياناتك"
            />

            <TrustItem
              icon={<SparkIcon />}
              title="تجارب مختارة"
              text="توصيات أفضل"
            />

            <TrustItem
              icon={<HeadsetIcon />}
              title="دعم مستمر"
              text="نحن هنا لمساعدتك"
            />
          </div>

          <div className="mt-6">
            <MobileAction
              href="/onboarding"
              gold
              icon={<UserPlusIcon />}
              title="إنشاء حساب جديد"
              subtitle="ابدأ رحلتك معنا"
            />

            <MobileAction
              href="/login"
              icon={<LoginIcon />}
              title="تسجيل الدخول"
              subtitle="لديك حساب بالفعل؟"
            />

            <div className="my-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#0D3B34]/15" />
              <span className="text-[11px]">أو</span>
              <div className="h-px flex-1 bg-[#0D3B34]/15" />
            </div>

            <MobileAction
              href="/discover"
              icon={<GuestIcon />}
              title="المتابعة كزائر"
              subtitle="تصفح المنصة بدون تسجيل دخول"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================
   COMPONENTS
========================= */

function ActionCard({
  href,
  icon,
  title,
  subtitle,
  type = "glass",
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  type?: "gold" | "glass";
}) {
  const gold = type === "gold";

  return (
    <Link
      href={href}
      className={`group flex h-[74px] w-full items-center gap-4 rounded-[20px] border px-5 transition-all duration-300 hover:-translate-y-[2px] ${
        gold
          ? "border-[#F2D77B]/80 bg-gradient-to-l from-[#D5AF37]/95 via-[#E6C55B]/95 to-[#F0D780]/95 shadow-[0_8px_22px_rgba(135,101,13,0.08)]"
          : "border-white/55 bg-white/[0.13] shadow-[0_8px_22px_rgba(0,0,0,0.025)] backdrop-blur-[9px] hover:bg-white/[0.19]"
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border ${
          gold
            ? "border-white/25 bg-white/12"
            : "border-white/30 bg-white/[0.08]"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1 text-right">
        <p
          className="text-[18px] font-semibold leading-none"
          style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
        >
          {title}
        </p>

        <p
          className="mt-[7px] text-[10px] text-[#0D3B34]/60"
          style={{
            fontFamily:
              "var(--font-ibm-plex-arabic), sans-serif",
          }}
        >
          {subtitle}
        </p>
      </div>

      <ArrowIcon />
    </Link>
  );
}

/* TRUST — COMPACT HORIZONTAL CARD */
function TrustItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div
      className="
        flex
        h-[64px]
        flex-1
        items-center
        justify-center
        gap-3
        rounded-[16px]
        border
        border-white/50
        bg-white/[0.20]
        px-3
        shadow-[0_8px_24px_rgba(0,0,0,0.035)]
        backdrop-blur-[9px]
      "
    >
      {/* ICON RIGHT */}
      <div
        className="
          flex
          h-[38px]
          w-[38px]
          shrink-0
          items-center
          justify-center
          rounded-[11px]
          border
          border-white/60
          bg-white/[0.22]
          text-[#C39112]
        "
      >
        {icon}
      </div>

      {/* TEXT LEFT */}
      <div className="min-w-0 text-right">
        <p
          className="whitespace-nowrap text-[11px] font-bold text-[#0D3B34]"
          style={{
            fontFamily:
              "var(--font-ibm-plex-arabic), sans-serif",
          }}
        >
          {title}
        </p>

        <p
          className="mt-[3px] whitespace-nowrap text-[9px] font-medium text-[#0D3B34]/65"
          style={{
            fontFamily:
              "var(--font-ibm-plex-arabic), sans-serif",
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

function MobileAction({
  href,
  icon,
  title,
  subtitle,
  gold = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gold?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`mt-3 flex h-[68px] items-center gap-3 rounded-[19px] border px-4 ${
        gold
          ? "border-[#E6C75D]/70 bg-[#D4AF37]/90"
          : "border-white/55 bg-white/[0.16] backdrop-blur-[10px]"
      }`}
    >
      <div className="flex h-8 w-8 items-center justify-center">
        {icon}
      </div>

      <div className="flex-1 text-right">
        <p
          className="text-[17px] font-semibold"
          style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
        >
          {title}
        </p>

        <p
          className="mt-1 text-[9px] opacity-60"
          style={{
            fontFamily:
              "var(--font-ibm-plex-arabic), sans-serif",
          }}
        >
          {subtitle}
        </p>
      </div>

      <ArrowIcon />
    </Link>
  );
}

/* =========================
   ICONS
========================= */

function UserPlusIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <path d="M19 8v6" />
      <path d="M22 11h-6" />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    </svg>
  );
}

function GuestIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21a7 7 0 0 1 14 0" />
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
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 opacity-55 transition-transform duration-300 group-hover:-translate-x-1"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 5 6v5c0 4.7 2.9 8.2 7 10 4.1-1.8 7-5.3 7-10V6l-7-3Z" />
      <path d="m9.5 12 1.7 1.7 3.6-4" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z" />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14a8 8 0 0 1 16 0" />
      <path d="M4 15v3a2 2 0 0 0 2 2h2v-7H6a2 2 0 0 0-2 2Z" />
      <path d="M20 15v3a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2Z" />
    </svg>
  );
}
