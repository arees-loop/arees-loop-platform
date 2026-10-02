"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          identifier: identifier.trim().toLowerCase(),
          password,
          portal: "admin",
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        if (data?.error === "ADMIN_ACCOUNT_REQUIRED") {
          setError("هذا الحساب غير مخول بالدخول إلى إدارة أريس لوب.");
        } else if (data?.error === "INVALID_CREDENTIALS") {
          setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
        } else if (data?.error === "RATE_LIMIT_EXCEEDED") {
          setError("تم تجاوز عدد محاولات الدخول. حاول لاحقاً.");
        } else {
          setError("تعذر تسجيل الدخول إلى الإدارة.");
        }
        return;
      }

      window.location.href = "/admin/partners";
    } catch {
      setError("تعذر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#F3EFE4] px-5 py-10 text-[#0D3B34]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[980px] items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[34px] border border-[#D9D2C2] bg-white shadow-[0_28px_80px_rgba(29,45,39,.12)] md:grid-cols-2">
          <section className="bg-[#0D463D] p-8 text-white md:p-12">
            <div className="flex h-full min-h-[360px] flex-col justify-between">
              <div>
                <span className="inline-flex rounded-full border border-[#D4AF37]/35 bg-white/5 px-4 py-2 text-[11px] font-bold tracking-[.18em] text-[#E6C55A]">
                  AREES LOOP · ADMIN
                </span>
                <h1 className="mt-8 text-4xl font-extrabold leading-tight">إدارة أريس لوب</h1>
                <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
                  بوابتك لإدارة أريس لوب. راجع، قرّر، وأنجز — وخلي الباقي علينا 😄
                </p>
              </div>
              <div className="mt-10"><p className="text-sm font-bold text-[#E6C55A]">يوم إداري جميل يبدأ من هنا ✨</p><p className="mt-2 text-xs text-white/50">ركّز على القرار... أريس لوب يرتّب لك التفاصيل.</p></div>
            </div>
          </section>

          <section className="p-7 md:p-12">
            <p className="text-xs font-bold tracking-[.16em] text-[#B88716]">ADMIN ACCESS</p>
            <h2 className="mt-3 text-3xl font-extrabold">تسجيل دخول الإدارة</h2>
            <p className="mt-2 text-sm text-[#607873]">استخدم حساب الإدارة المعتمد لدى Arees Loop.</p>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-bold">البريد الإلكتروني</span>
                <input type="email" required autoComplete="email" dir="ltr" value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#0D463D]/15 bg-[#FAF9F5] px-4 text-sm outline-none focus:border-[#B88716]" />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold">كلمة المرور</span>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required autoComplete="current-password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-[#0D463D]/15 bg-[#FAF9F5] px-4 pl-16 text-sm outline-none focus:border-[#B88716]" />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#607873]">
                    {showPassword ? "إخفاء" : "إظهار"}
                  </button>
                </div>
              </label>

              {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{error}</div>}

              <button type="submit" disabled={loading}
                className="mx-auto flex h-14 w-full max-w-[320px] items-center justify-center rounded-2xl bg-[#0D463D] text-sm font-bold text-white transition hover:bg-[#123F38] disabled:opacity-60">
                {loading ? "جاري الدخول..." : "دخول لوحة الإدارة"}
              </button>
            </form>

            <div className="mt-7 border-t border-[#0D463D]/10 pt-5 text-xs text-[#718681]">
              <Link href="/" className="font-bold hover:text-[#B88716]">العودة إلى Arees Loop</Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
