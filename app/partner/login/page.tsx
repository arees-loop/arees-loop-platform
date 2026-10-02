"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function PartnerLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = identifier.trim().toLowerCase();

    if (!email) {
      setError("أدخل البريد الإلكتروني.");
      return;
    }
    if (!password.trim()) {
      setError("أدخل كلمة المرور.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          identifier: email,
          password,
          portal: "partner",
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        if (data?.error === "PARTNER_ACCOUNT_REQUIRED") {
          setError("هذا الحساب غير مسجل كشريك في Arees Loop.");
        } else if (data?.error === "INVALID_CREDENTIALS") {
          setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
        } else if (data?.error === "ACCOUNT_SUSPENDED") {
          setError("هذا الحساب موقوف حالياً.");
        } else if (data?.error === "ACCOUNT_DISABLED") {
          setError("هذا الحساب غير مفعّل.");
        } else if (data?.error === "RATE_LIMIT_EXCEEDED") {
          setError("تم تجاوز عدد محاولات الدخول. حاول مرة أخرى لاحقاً.");
        } else {
          setError("تعذر تسجيل الدخول. حاول مرة أخرى.");
        }
        return;
      }

      window.location.href = "/partner/status";
    } catch {
      setError("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-[#F5F0E3] text-[#0D3B34]">
      <div className="absolute inset-0">
        <Image
          src="/Image/auth/arees-auth-bg-desktop.png"
          alt=""
          fill
          priority
          className="object-cover object-center opacity-42"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#F7F2E7]/72 via-[#F7F2E7]/68 to-[#F7F2E7]/90" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1360px] items-center gap-12 px-6 py-14 md:grid-cols-[1fr_1.08fr] md:px-10 lg:gap-24 lg:px-14">
        <section className="order-2 md:order-2">
          <div className="mx-auto max-w-[500px] rounded-[30px] border border-white/80 bg-white/72 p-6 shadow-[0_28px_80px_rgba(13,59,52,.10)] backdrop-blur-xl sm:p-8">
            <div className="mb-6">
              <span className="inline-flex rounded-full border border-[#D4AF37]/35 bg-[#FFF8E4]/80 px-4 py-2 text-[11px] font-bold text-[#9A7415]">
                بوابة شركاء Arees Loop
              </span>
              <h2 className="mt-4 text-3xl font-bold">تسجيل الدخول كشريك</h2>
              <p className="mt-2 text-sm text-[#0D3B34]/60">
                ادخل إلى حساب شريكك لمتابعة الطلب وإدارة أعمالك على المنصة.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-bold">البريد الإلكتروني</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com"
                  dir="ltr"
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold">كلمة المرور</span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#0D3B34]/55"
                  >
                    {showPassword ? "إخفاء" : "إظهار"}
                  </button>
                </div>
              </label>

              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-xs font-bold hover:text-[#B99124]">
                  نسيت كلمة المرور؟
                </Link>
              </div>

              {error && (
                <div className="rounded-2xl border border-[#A3443E]/15 bg-[#FFE9E7] px-4 py-3 text-xs font-bold text-[#A3443E]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="h-14 w-full rounded-[18px] bg-[#0D3B34] text-sm font-bold text-white transition hover:bg-[#124B42] disabled:opacity-60"
              >
                {loading ? "جاري تسجيل الدخول..." : "دخول بوابة الشركاء"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-[#0D3B34]/10" />
              <span className="text-[11px] text-[#0D3B34]/50">شريك جديد؟</span>
              <span className="h-px flex-1 bg-[#0D3B34]/10" />
            </div>

            <Link
              href="/partner/onboarding"
              className="flex h-14 items-center justify-center rounded-[18px] border border-[#D4AF37]/45 bg-[#FFF7DE]/85 text-sm font-bold transition hover:bg-[#FFF0B9]"
            >
              إنشاء حساب شريك جديد
            </Link>

            <div className="mt-6 flex items-center justify-between text-[11px] text-[#0D3B34]/55">
              <Link href="/login" className="font-bold">دخول العملاء</Link>
              <span>© Arees Loop</span>
            </div>
          </div>
        </section>

        <section className="order-1 flex justify-center md:order-1">
          <div className="max-w-[590px] text-center md:text-right">
            <Image
              src="/Logo/arees-loop-brand.png"
              alt="Arees Loop"
              width={420}
              height={420}
              priority
              className="mx-auto h-auto w-[145px] md:mr-0 md:ml-auto md:w-[165px] lg:w-[175px]"
            />

            <p className="mt-4 text-[11px] font-extrabold tracking-[.20em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,.75)]">
              PARTNER PORTAL
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-white drop-shadow-[0_3px_12px_rgba(0,0,0,.80)] md:text-4xl lg:text-[42px]">
              مرحباً بك، شريك أريس
            </h1>
            <p className="mt-4 max-w-[560px] text-[15px] font-bold leading-7 text-white drop-shadow-[0_2px_9px_rgba(0,0,0,.78)] lg:text-base">
              سوّق تجاربك وخدماتك لآلاف العملاء المهتمين، واستهدف العملاء الحقيقيين
              الباحثين عنها في الوقت والمكان المناسبين.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Value title="وصول أذكى" text="للعملاء المهتمين" />
              <Value title="إدارة أسهل" text="للتجارب والحجوزات" />
              <Value title="نمو مستمر" text="مع منظومة Arees Loop" />
            </div>

            <p className="mt-6 text-sm font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,.78)]">
              تجربتك تستحق أن تصل لمن يبحث عنها.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

const inputClass =
  "h-14 w-full rounded-[17px] border border-[#0D3B34]/12 bg-white/70 px-4 text-sm font-medium outline-none transition placeholder:text-[#0D3B34]/30 focus:border-[#D4AF37]/70 focus:ring-4 focus:ring-[#D4AF37]/10";

function Value({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[18px] border border-white/35 bg-[#0D3B34]/38 px-3 py-4 shadow-[0_8px_24px_rgba(0,0,0,.18)] backdrop-blur-md">
      <p className="text-sm font-extrabold text-white drop-shadow-[0_1px_5px_rgba(0,0,0,.65)]">{title}</p>
      <p className="mt-1 text-[11px] font-semibold text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,.55)]">{text}</p>
    </div>
  );
}
