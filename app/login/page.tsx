"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    setMouse({
      x: e.clientX / window.innerWidth - 0.5,
      y: e.clientY / window.innerHeight - 0.5,
    });
  }

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!identifier.trim()) {
      setError("أدخل رقم الجوال أو البريد الإلكتروني");
      return;
    }

    if (!password.trim()) {
      setError("أدخل كلمة المرور");
      return;
    }

    setError("");

    // تسجيل الدخول حاليًا تجريبي Frontend فقط.
    window.location.href = "/discover";
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
      <section className="relative z-10 hidden min-h-screen lg:block">
        <div className="mx-auto flex min-h-screen w-full max-w-[1380px] items-start px-10 pt-[4vh]">
          <div className="grid w-full grid-cols-2 items-start gap-[100px]">
            {/* RIGHT — BRAND */}
            <div className="flex justify-center">
              <div className="flex w-full max-w-[500px] flex-col items-center text-center">
                <Image
                  src="/Logo/arees-loop-brand.png"
                  alt="Arees Loop"
                  width={700}
                  height={700}
                  priority
                  className="h-auto w-[245px] xl:w-[255px]"
                />

                <div className="mt-4">
                  <h1
                    className="text-[31px] font-semibold leading-[1.25] xl:text-[33px]"
                    style={{
                      fontFamily:
                        "var(--font-el-messiri), sans-serif",
                    }}
                  >
                    أهلاً بعودتك
                  </h1>

                  <div className="mt-2.5 flex items-center justify-center gap-3">
                    <span className="h-px w-7 bg-[#D4AF37]" />

                    <p
                      className="text-[12px] font-medium text-[#0D3B34]/68"
                      style={{
                        fontFamily:
                          "var(--font-ibm-plex-arabic), sans-serif",
                      }}
                    >
                      سجّل الدخول لمتابعة رحلتك
                    </p>

                    <span className="h-px w-7 bg-[#D4AF37]" />
                  </div>
                </div>

                <div className="mt-5 flex w-full items-center justify-center gap-2.5">
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

            {/* LEFT — LOGIN */}
            <div className="flex justify-center">
              <div className="w-full max-w-[500px]">
                <div className="rounded-[28px] border border-white/55 bg-white/[0.16] p-6 backdrop-blur-[10px]">
                  <div>
                    <p
                      className="text-[10px] font-bold tracking-[0.18em] text-[#B99124]"
                      style={{
                        fontFamily:
                          "var(--font-ibm-plex-arabic), sans-serif",
                      }}
                    >
                      LOGIN
                    </p>

                    <h2
                      className="mt-2 text-[28px] font-semibold"
                      style={{
                        fontFamily:
                          "var(--font-el-messiri), sans-serif",
                      }}
                    >
                      تسجيل الدخول
                    </h2>

                    <p
                      className="mt-2 text-[11px] text-[#0D3B34]/60"
                      style={{
                        fontFamily:
                          "var(--font-ibm-plex-arabic), sans-serif",
                      }}
                    >
                      استخدم رقم الجوال أو البريد الإلكتروني المسجل
                    </p>
                  </div>

                  <form
                    onSubmit={handleLogin}
                    className="mt-6 space-y-4"
                  >
                    <Field label="رقم الجوال أو البريد الإلكتروني">
                      <div className="relative">
                        <input
                          value={identifier}
                          onChange={(e) =>
                            setIdentifier(e.target.value)
                          }
                          placeholder="05xxxxxxxx أو name@example.com"
                          className={inputClass}
                          dir="ltr"
                        />

                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#0D3B34]/40">
                          <UserIcon />
                        </div>
                      </div>
                    </Field>

                    <Field label="كلمة المرور">
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) =>
                            setPassword(e.target.value)
                          }
                          placeholder="أدخل كلمة المرور"
                          className={inputClass}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(!showPassword)
                          }
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0D3B34]/45 transition hover:text-[#0D3B34]"
                          aria-label="إظهار أو إخفاء كلمة المرور"
                        >
                          <EyeIcon open={showPassword} />
                        </button>
                      </div>
                    </Field>

                    <div className="flex items-center justify-between gap-4">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={remember}
                          onChange={(e) =>
                            setRemember(e.target.checked)
                          }
                          className="h-4 w-4 accent-[#0D3B34]"
                        />

                        <span
                          className="text-[10px] font-medium text-[#0D3B34]/65"
                          style={{
                            fontFamily:
                              "var(--font-ibm-plex-arabic), sans-serif",
                          }}
                        >
                          تذكرني
                        </span>
                      </label>

                      <Link
                        href="/forgot-password"
                        className="text-[10px] font-semibold text-[#0D3B34] transition hover:text-[#B99124]"
                        style={{
                          fontFamily:
                            "var(--font-ibm-plex-arabic), sans-serif",
                        }}
                      >
                        نسيت كلمة المرور؟
                      </Link>
                    </div>

                    {error && (
                      <div className="rounded-[15px] border border-[#A3443E]/15 bg-[#FFE9E7] px-4 py-3">
                        <p
                          className="text-[10px] font-semibold text-[#A3443E]"
                          style={{
                            fontFamily:
                              "var(--font-ibm-plex-arabic), sans-serif",
                          }}
                        >
                          {error}
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="flex h-[58px] w-full items-center justify-center gap-3 rounded-[18px] bg-[#0D3B34] text-sm font-bold text-white transition hover:bg-[#124B42]"
                      style={{
                        fontFamily:
                          "var(--font-ibm-plex-arabic), sans-serif",
                      }}
                    >
                      تسجيل الدخول
                      <LoginIcon />
                    </button>
                  </form>

                  <div className="my-5 flex items-center gap-4">
                    <div className="h-px flex-1 bg-[#0D3B34]/12" />

                    <span
                      className="text-[10px] text-[#0D3B34]/45"
                      style={{
                        fontFamily:
                          "var(--font-ibm-plex-arabic), sans-serif",
                      }}
                    >
                      ليس لديك حساب؟
                    </span>

                    <div className="h-px flex-1 bg-[#0D3B34]/12" />
                  </div>

                  <Link
                    href="/onboarding"
                    className="flex h-[54px] w-full items-center justify-center gap-2 rounded-[18px] border border-[#D4AF37]/35 bg-[#FFF7DE]/70 text-xs font-bold text-[#0D3B34] transition hover:bg-[#FFF1BE]"
                    style={{
                      fontFamily:
                        "var(--font-ibm-plex-arabic), sans-serif",
                    }}
                  >
                    إنشاء حساب جديد
                    <UserPlusIcon />
                  </Link>

                  <div className="mt-5 flex items-center justify-between text-[10px] text-[#0D3B34]/55">
                    <Link
                      href="/auth"
                      className="font-semibold text-[#0D3B34]"
                    >
                      العودة
                    </Link>

                    <span>© Arees Loop</span>
                  </div>
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
              className="h-auto w-[175px]"
            />
          </div>

          <div className="mt-4 rounded-[26px] border border-white/55 bg-white/[0.18] p-5 backdrop-blur-[10px]">
            <div className="text-center">
              <h1
                className="text-[26px] font-semibold"
                style={{
                  fontFamily:
                    "var(--font-el-messiri), sans-serif",
                }}
              >
                تسجيل الدخول
              </h1>

              <p
                className="mt-2 text-[11px] text-[#0D3B34]/60"
                style={{
                  fontFamily:
                    "var(--font-ibm-plex-arabic), sans-serif",
                }}
              >
                أهلاً بعودتك إلى أريس لوب
              </p>
            </div>

            <form
              onSubmit={handleLogin}
              className="mt-5 space-y-4"
            >
              <Field label="رقم الجوال أو البريد الإلكتروني">
                <input
                  value={identifier}
                  onChange={(e) =>
                    setIdentifier(e.target.value)
                  }
                  placeholder="05xxxxxxxx أو name@example.com"
                  className={inputClass}
                  dir="ltr"
                />
              </Field>

              <Field label="كلمة المرور">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="أدخل كلمة المرور"
                    className={inputClass}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0D3B34]/45"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </Field>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) =>
                      setRemember(e.target.checked)
                    }
                    className="h-4 w-4 accent-[#0D3B34]"
                  />

                  <span className="text-[10px]">
                    تذكرني
                  </span>
                </label>

                <Link
                  href="/forgot-password"
                  className="text-[10px] font-semibold"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>

              {error && (
                <div className="rounded-[14px] bg-[#FFE9E7] px-4 py-3 text-[10px] font-semibold text-[#A3443E]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="h-[56px] w-full rounded-[18px] bg-[#0D3B34] text-sm font-bold text-white"
              >
                تسجيل الدخول
              </button>
            </form>

            <Link
              href="/onboarding"
              className="mt-4 flex h-[52px] items-center justify-center rounded-[17px] border border-[#D4AF37]/30 bg-[#FFF7DE]/75 text-xs font-bold"
            >
              إنشاء حساب جديد
            </Link>

            <Link
              href="/auth"
              className="mt-4 block text-center text-[10px] font-semibold"
            >
              العودة
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const inputClass =
  "h-[56px] w-full rounded-[17px] border border-white/55 bg-white/[0.26] px-4 text-[12px] font-medium text-[#0D3B34] outline-none backdrop-blur-[7px] transition placeholder:text-[#0D3B34]/35 focus:border-[#D4AF37]/70 focus:bg-white/[0.34]";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span
        className="mb-2 block text-[10px] font-semibold text-[#0D3B34]/70"
        style={{
          fontFamily:
            "var(--font-ibm-plex-arabic), sans-serif",
        }}
      >
        {label}
      </span>

      {children}
    </label>
  );
}

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
    <div className="flex h-[54px] min-w-0 flex-1 items-center justify-start gap-2.5 rounded-[14px] border border-white/45 bg-white/[0.13] px-2.5 backdrop-blur-[6px]">
      <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[9px] border border-white/45 bg-white/[0.12] text-[#B88916]">
        {icon}
      </div>

      <div className="min-w-0 text-right">
        <p
          className="whitespace-nowrap text-[10px] font-bold"
          style={{
            fontFamily:
              "var(--font-ibm-plex-arabic), sans-serif",
          }}
        >
          {title}
        </p>

        <p
          className="mt-[2px] whitespace-nowrap text-[8px] font-medium text-[#0D3B34]/65"
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

function UserIcon() {
  return (
    <svg
      width="16"
      height="16"
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

function UserPlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8.5" cy="7" r="4" />
      <path d="M2 21v-2a4 4 0 0 1 4-4h5" />
      <path d="M19 8v6" />
      <path d="M22 11h-6" />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg
      width="16"
      height="16"
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

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
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
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

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
      <path d="m3 3 18 18" />
      <path d="M10.6 6.2A10.8 10.8 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-2.2 3" />
      <path d="M6.7 6.7C3.7 8.6 2 12 2 12s3.5 6 10 6a10.8 10.8 0 0 0 4.1-.8" />
      <path d="M9.9 9.9A3 3 0 0 0 14.1 14.1" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
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
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
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
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14a8 8 0 0 1 16 0" />
      <path d="M4 15v3a2 2 0 0 0 2 2h2v-7H6a2 2 0 0 0-2 2Z" />
      <path d="M20 15v3a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2Z" />
    </svg>
  );
}