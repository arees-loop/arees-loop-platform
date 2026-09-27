"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Step = 1 | 2 | 3;
type UserType = "citizen" | "resident" | "visitor" | "";

type InterestCode =
  | "HERITAGE"
  | "ADVENTURE"
  | "FOOD"
  | "EVENTS"
  | "SHOPPING"
  | "GUIDES"
  | "STAYS"
  | "NATURE"
  | "FAMILY"
  | "SPORTS"
  | "TECHNOLOGY"
  | "SEASONAL";

type Interest = {
  id: InterestCode;
  title: string;
  subtitle: string;
  icon: string;
};

const interests: Interest[] = [
  { id: "HERITAGE", title: "التاريخ والتراث", subtitle: "المتاحف والمعالم والمواقع التاريخية", icon: "🏛" },
  { id: "ADVENTURE", title: "التجارب والمغامرات", subtitle: "أنشطة وتجارب محلية ومغامرات مختارة", icon: "✦" },
  { id: "FOOD", title: "الطعام والمقاهي", subtitle: "مطاعم ومقاهٍ وتجارب طعام محلية", icon: "◌" },
  { id: "EVENTS", title: "الفعاليات والترفيه", subtitle: "فعاليات وأنشطة ترفيهية تحدث حولك", icon: "◈" },
  { id: "SHOPPING", title: "التسوق والأسواق", subtitle: "أسواق ومتاجر ومنتجات محلية", icon: "◇" },
  { id: "GUIDES", title: "الجولات والمرشدون", subtitle: "جولات ومرشدون وتجارب إرشادية", icon: "◎" },
  { id: "STAYS", title: "الفنادق والإقامة", subtitle: "فنادق ومنتجعات وخيارات إقامة مناسبة", icon: "▣" },
  { id: "NATURE", title: "الطبيعة والاستجمام", subtitle: "طبيعة ومواقع مفتوحة وتجارب للاسترخاء", icon: "⌁" },
  { id: "FAMILY", title: "العائلة والأطفال", subtitle: "تجارب وأنشطة مناسبة للعائلات والأطفال", icon: "☆" },
  { id: "SPORTS", title: "الرياضة واللياقة", subtitle: "أنشطة رياضية وتجارب للحركة واللياقة", icon: "▲" },
  { id: "TECHNOLOGY", title: "التقنية والابتكار", subtitle: "تجارب رقمية وتفاعلية ومبتكرة", icon: "⌘" },
  { id: "SEASONAL", title: "التجارب الموسمية", subtitle: "تجارب مرتبطة بالمواسم والمناسبات", icon: "◉" },
];

const inputClass =
  "w-full rounded-[18px] border border-[#0D3B34]/10 bg-white/60 px-4 py-3.5 text-sm text-[#0D3B34] outline-none transition placeholder:text-[#0D3B34]/30 focus:border-[#D4AF37]/60 focus:bg-white focus:ring-4 focus:ring-[#D4AF37]/8 disabled:opacity-60";

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [userType, setUserType] = useState<UserType>("");
  const [selectedInterests, setSelectedInterests] = useState<InterestCode[]>([]);

  const [authLoading, setAuthLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const allInterestsSelected = selectedInterests.length === interests.length;

  const progress = useMemo(() => ((step - 1) / 2) * 100, [step]);

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "new") {
      setStep(1);
      return () => {
        cancelled = true;
      };
    }

    async function resumeOnboarding() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        if (!response.ok) return;

        const result = await response.json().catch(() => null);
        const user = result?.data?.user;

        if (cancelled || !result?.success || !user) return;

        if (user.email) setEmail(user.email);
        if (user.phone) setPhone(user.phone);

        const savedName = [user.firstName, user.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();

        if (savedName) setFullName(savedName);

        if (user.status !== "ACTIVE" || !user.emailVerifiedAt) {
          setStep(2);
          return;
        }

        const visitorTypeMap: Record<string, UserType> = {
          CITIZEN: "citizen",
          RESIDENT: "resident",
          VISITOR: "visitor",
        };

        const savedUserType = user.visitorType
          ? visitorTypeMap[user.visitorType] || ""
          : "";

        if (savedUserType) setUserType(savedUserType);

        const validInterestCodes = new Set<InterestCode>(
          interests.map((item) => item.id),
        );

        const savedInterests: InterestCode[] = Array.isArray(user.interests)
          ? user.interests.filter(
              (item: unknown): item is InterestCode =>
                typeof item === "string" &&
                validInterestCodes.has(item as InterestCode),
            )
          : [];

        if (savedInterests.length) setSelectedInterests(savedInterests);

        if (savedUserType && savedInterests.length > 0) {
          window.location.replace("/discover");
          return;
        }

        setStep(3);
      } catch {
        // No usable session: keep the normal registration flow.
      }
    }

    void resumeOnboarding();

    return () => {
      cancelled = true;
    };
  }, []);

  function toggleInterest(id: InterestCode) {
    setSelectedInterests((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
    setProfileError("");
  }

  function toggleAllInterests() {
    setSelectedInterests(
      allInterestsSelected ? [] : interests.map((item) => item.id),
    );
    setProfileError("");
  }

  async function continueFromAccount() {
    if (authLoading) return;

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanPassword = password;

    if (!cleanName) {
      setAuthError("يرجى كتابة الاسم.");
      return;
    }

    if (!cleanEmail) {
      setAuthError("يرجى كتابة البريد الإلكتروني.");
      return;
    }

    if (!cleanPhone) {
      setAuthError("يرجى كتابة رقم الجوال.");
      return;
    }

    if (
      cleanPassword.length < 8 ||
      !/[A-Za-z]/.test(cleanPassword) ||
      !/[0-9]/.test(cleanPassword)
    ) {
      setAuthError(
        "كلمة المرور يجب أن تكون 8 أحرف على الأقل، وتحتوي على حرف ورقم.",
      );
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      const nameParts = cleanName.split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName =
        nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined;

      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
          phone: cleanPhone,
          firstName,
          lastName,
          role: "CUSTOMER",
        }),
      });

      const registerData = await registerResponse.json().catch(() => null);

      if (!registerResponse.ok) {
        const errorCode = registerData?.error;

        const messages: Record<string, string> = {
          EMAIL_ALREADY_EXISTS: "يوجد حساب مسجل بهذا البريد الإلكتروني.",
          PHONE_ALREADY_EXISTS: "رقم الجوال مستخدم في حساب آخر.",
          INVALID_EMAIL: "يرجى إدخال بريد إلكتروني صحيح.",
          WEAK_PASSWORD:
            "كلمة المرور يجب أن تكون 8 أحرف على الأقل، وتحتوي على حرف ورقم.",
          RATE_LIMIT_EXCEEDED:
            "تمت محاولات كثيرة خلال وقت قصير. يرجى المحاولة بعد قليل.",
          DATABASE_NOT_CONFIGURED:
            "الخدمة غير متاحة حاليًا. يرجى المحاولة لاحقًا.",
        };

        setAuthError(
          messages[errorCode] ||
            "تعذر إنشاء الحساب حاليًا. يرجى المحاولة مرة أخرى.",
        );
        return;
      }

      const verificationResponse = await fetch(
        "/api/auth/verify-email/request",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail }),
        },
      );

      const verificationData = await verificationResponse
        .json()
        .catch(() => null);

      if (!verificationResponse.ok) {
        if (verificationData?.error === "RATE_LIMIT_EXCEEDED") {
          setAuthError(
            "تمت محاولات كثيرة لإرسال رمز التحقق. يرجى المحاولة بعد قليل.",
          );
        } else {
          setAuthError(
            "تم إنشاء الحساب، لكن تعذر إرسال رمز التحقق. يرجى المحاولة مرة أخرى.",
          );
        }
        return;
      }

      setOtp("");
      setOtpSent(true);
      setStep(2);
    } catch {
      setAuthError(
        "تعذر الاتصال بالخدمة حاليًا. تحقق من الاتصال ثم حاول مرة أخرى.",
      );
    } finally {
      setAuthLoading(false);
    }
  }

  async function continueFromOtp() {
    if (authLoading) return;

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      setAuthError("يرجى إدخال رمز التحقق المكوّن من 6 أرقام.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      const response = await fetch("/api/auth/verify-email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          code: cleanOtp,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const messages: Record<string, string> = {
          INVALID_CODE:
            "رمز التحقق غير صحيح. تأكد من الرمز وحاول مرة أخرى.",
          TOKEN_EXPIRED: "انتهت صلاحية رمز التحقق. اطلب رمزًا جديدًا.",
          MAX_ATTEMPTS_REACHED:
            "تم تجاوز عدد محاولات التحقق المسموح بها. اطلب رمزًا جديدًا.",
          RATE_LIMIT_EXCEEDED:
            "تمت محاولات كثيرة خلال وقت قصير. يرجى المحاولة بعد قليل.",
        };

        setAuthError(
          messages[data?.error] ||
            "تعذر التحقق من الرمز. تأكد منه وحاول مرة أخرى.",
        );
        return;
      }

      setAuthError("");
      setStep(3);
    } catch {
      setAuthError(
        "تعذر الاتصال بالخدمة حاليًا. تحقق من الاتصال ثم حاول مرة أخرى.",
      );
    } finally {
      setAuthLoading(false);
    }
  }

  async function resendEmailOtp() {
    if (authLoading) return;

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setAuthError("يرجى إدخال البريد الإلكتروني أولًا.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      const response = await fetch("/api/auth/verify-email/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (data?.error === "RATE_LIMIT_EXCEEDED") {
          setAuthError(
            "تمت محاولات كثيرة لإرسال رمز التحقق. يرجى المحاولة بعد قليل.",
          );
        } else if (data?.error === "EMAIL_ALREADY_VERIFIED") {
          setAuthError("تم التحقق من هذا البريد الإلكتروني مسبقًا.");
        } else {
          setAuthError("تعذر إرسال رمز التحقق. يرجى المحاولة مرة أخرى.");
        }
        return;
      }

      setOtp("");
      setOtpSent(true);
    } catch {
      setAuthError(
        "تعذر الاتصال بالخدمة حاليًا. تحقق من الاتصال ثم حاول مرة أخرى.",
      );
    } finally {
      setAuthLoading(false);
    }
  }

  async function completeProfile() {
    if (profileLoading) return;

    if (!userType) {
      setProfileError("اختر صفتك للمتابعة.");
      return;
    }

    if (selectedInterests.length === 0) {
      setProfileError("اختر اهتمامًا واحدًا على الأقل.");
      return;
    }

    setProfileLoading(true);
    setProfileError("");

    const visitorTypeMap: Record<
      Exclude<UserType, "">,
      "CITIZEN" | "RESIDENT" | "VISITOR"
    > = {
      citizen: "CITIZEN",
      resident: "RESIDENT",
      visitor: "VISITOR",
    };

    try {
      const identityResponse = await fetch("/api/onboarding/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          visitorType: visitorTypeMap[userType],
        }),
      });

      const identityData = await identityResponse.json().catch(() => null);

      if (!identityResponse.ok) {
        if (identityData?.error === "UNAUTHORIZED") {
          setProfileError(
            "انتهت جلسة تسجيل الدخول. يرجى تسجيل الدخول ثم المحاولة مرة أخرى.",
          );
        } else {
          setProfileError("تعذر حفظ بيانات الحساب حاليًا. حاول مرة أخرى.");
        }
        return;
      }

      const interestsResponse = await fetch("/api/onboarding/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          interests: selectedInterests,
        }),
      });

      const interestsData = await interestsResponse.json().catch(() => null);

      if (!interestsResponse.ok) {
        if (interestsData?.error === "UNAUTHORIZED") {
          setProfileError(
            "انتهت جلسة تسجيل الدخول. يرجى تسجيل الدخول ثم المحاولة مرة أخرى.",
          );
        } else if (interestsData?.error === "INVALID_INTERESTS") {
          setProfileError("يرجى اختيار اهتمامات صحيحة ثم المحاولة مرة أخرى.");
        } else {
          setProfileError("تعذر حفظ الاهتمامات حاليًا. حاول مرة أخرى.");
        }
        return;
      }

      window.location.replace("/discover");
    } catch {
      setProfileError(
        "تعذر الاتصال بالخدمة حاليًا. تحقق من الاتصال ثم حاول مرة أخرى.",
      );
    } finally {
      setProfileLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#F7F5EF] text-[#0D3B34]"
      style={{ fontFamily: "var(--font-ibm-plex-arabic), sans-serif" }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_12%,rgba(212,175,55,0.12),transparent_26%),radial-gradient(circle_at_8%_82%,rgba(13,59,52,0.11),transparent_30%),linear-gradient(135deg,#FAF8F2_0%,#F4F1E8_48%,#F8F6F0_100%)]" />
        <div className="absolute -right-[180px] top-[70px] h-[540px] w-[540px] rounded-full bg-[#0D3B34]/[0.07] blur-[125px]" />
        <div className="absolute -left-[170px] -top-[150px] h-[500px] w-[500px] rounded-full bg-[#D4AF37]/[0.09] blur-[135px]" />
      </div>

      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Link href="/">
          <Image
            src="/Logo/arees-loop-logo.png"
            alt="Arees Loop"
            width={180}
            height={90}
            priority
            className="h-auto w-[130px] md:w-[150px]"
          />
        </Link>

        <div className="rounded-full border border-white/70 bg-white/45 px-4 py-2 text-xs font-medium text-[#0D3B34]/65 backdrop-blur-xl">
          تسجيل سريع وآمن
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-7 px-5 pb-12 pt-3 md:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-9 lg:pt-7">
        <aside className="relative hidden min-h-[680px] overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#082E28] via-[#0D3B34] to-[#123F37] p-8 text-white shadow-[0_24px_65px_rgba(8,47,41,0.13)] lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full border border-white/[0.07]" />
          <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-3xl" />

          <div className="relative z-10">
            <p className="mb-4 text-[10px] font-semibold tracking-[0.24em] text-[#D4AF37]">
              AREES LOOP
            </p>
            <h1
              className="max-w-md text-[34px] font-semibold leading-[1.35]"
              style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
            >
              دخول أسرع.
              <br />
              تجربة أقرب ليك.
            </h1>
            <p className="mt-5 max-w-sm text-xs leading-7 text-white/55">
              نطلب فقط البيانات اللازمة لإنشاء حسابك، ثم نستخدم صفتك واهتماماتك
              لترتيب التجارب بصورة أنسب لك.
            </p>
          </div>

          <div className="relative z-10 space-y-3 text-sm">
            <Feature number="01" title="حساب بسيط" text="اسمك وبريدك وكلمة المرور فقط." />
            <Feature number="02" title="تحقق آمن" text="رمز تحقق يصل إلى بريدك الإلكتروني." />
            <Feature number="03" title="تخصيص سريع" text="صفتك واهتماماتك في صفحة واحدة." />
          </div>
        </aside>

        <div className="overflow-hidden rounded-[32px] border border-white/80 bg-white/[0.72] shadow-[0_22px_65px_rgba(13,59,52,0.07)] backdrop-blur-2xl">
          <div className="border-b border-[#0D3B34]/[0.06] px-5 py-5 md:px-8">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#B99124]">إعداد حسابك</p>
                <h2
                  className="mt-1 text-lg font-semibold"
                  style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
                >
                  مرحبًا بك في Arees Loop
                </h2>
              </div>

              <span className="whitespace-nowrap rounded-full bg-[#0D3B34]/5 px-3 py-1.5 text-[11px] font-semibold text-[#0D3B34]/55">
                الخطوة {step} من 3
              </span>
            </div>

            <div className="h-1 overflow-hidden rounded-full bg-[#0D3B34]/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-l from-[#0D3B34] to-[#1A5B4F] transition-all duration-500"
                style={{ width: `${Math.max(progress, 4)}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px]">
              {["الحساب", "التحقق", "اهتماماتك"].map((label, index) => {
                const number = (index + 1) as Step;
                return (
                  <div
                    key={label}
                    className={
                      step === number
                        ? "font-semibold text-[#0D3B34]"
                        : step > number
                          ? "text-[#0D3B34]/65"
                          : "text-[#0D3B34]/30"
                    }
                  >
                    {step > number ? "✓ " : ""}
                    {label}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="min-h-[555px] p-5 md:p-9">
            {step === 1 && (
              <div className="mx-auto max-w-xl">
                <SectionHeading
                  eyebrow="01 / ACCOUNT"
                  title="خلينا نبدأ بالتعارف"
                  description="بيانات أساسية فقط لإنشاء حسابك، وبعدها نرسل رمز التحقق إلى بريدك."
                />

                <div className="mt-7 space-y-5">
                  <Field label="الاسم">
                    <input
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setAuthError("");
                      }}
                      placeholder="اكتب اسمك"
                      autoComplete="name"
                      className={inputClass}
                      disabled={authLoading}
                    />
                  </Field>

                  <Field label="البريد الإلكتروني">
                    <input
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setAuthError("");
                      }}
                      placeholder="name@example.com"
                      type="email"
                      dir="ltr"
                      autoComplete="email"
                      className={inputClass}
                      disabled={authLoading}
                    />
                  </Field>

                  <Field label="رقم الجوال">
                    <input
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setAuthError("");
                      }}
                      placeholder="05XXXXXXXX"
                      type="tel"
                      dir="ltr"
                      inputMode="tel"
                      autoComplete="tel"
                      className={inputClass}
                      disabled={authLoading}
                    />
                  </Field>

                  <Field label="كلمة المرور">
                    <input
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setAuthError("");
                      }}
                      placeholder="8 أحرف على الأقل، تتضمن حرفًا ورقمًا"
                      type="password"
                      dir="ltr"
                      autoComplete="new-password"
                      className={inputClass}
                      disabled={authLoading}
                    />
                  </Field>

                  {authError && <ErrorMessage>{authError}</ErrorMessage>}
                </div>

                <PrimaryButton
                  disabled={
                    authLoading ||
                    !fullName.trim() ||
                    !email.trim() ||
                    !phone.trim() ||
                    password.length < 8
                  }
                  onClick={continueFromAccount}
                >
                  {authLoading ? "جاري إنشاء الحساب..." : "إنشاء الحساب والمتابعة"}
                </PrimaryButton>

                <p className="mt-4 text-center text-[11px] leading-6 text-[#0D3B34]/45">
                  رقم الجوال مطلوب للتواصل معك، ولا يتطلب تحققًا حاليًا. لن نطلب رقم هوية أو إقامة أو جواز لإنشاء حسابك.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="mx-auto max-w-xl">
                <SectionHeading
                  eyebrow="02 / VERIFY"
                  title="تحقق من بريدك الإلكتروني"
                  description={`أدخل رمز التحقق المكوّن من 6 أرقام المرسل إلى ${email.trim().toLowerCase()}.`}
                />

                <div className="mt-9">
                  <input
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setAuthError("");
                    }}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="• • • • • •"
                    dir="ltr"
                    autoComplete="one-time-code"
                    disabled={authLoading}
                    className="w-full rounded-[20px] border border-[#0D3B34]/10 bg-white/55 px-6 py-5 text-center text-2xl font-semibold tracking-[0.65em] text-[#0D3B34] outline-none transition focus:border-[#D4AF37]/60 focus:bg-white focus:ring-4 focus:ring-[#D4AF37]/8 disabled:opacity-60"
                  />

                  <div className="mt-4 flex items-center justify-between gap-4 text-xs">
                    <button
                      type="button"
                      onClick={resendEmailOtp}
                      disabled={authLoading}
                      className="font-semibold text-[#0D3B34] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {authLoading ? "جاري الإرسال..." : "إعادة إرسال الرمز"}
                    </button>
                    <span className="text-[#0D3B34]/40">رمز صالح لفترة محدودة</span>
                  </div>
                </div>

                {otpSent && (
                  <div className="mt-5 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/7 px-4 py-3 text-xs leading-6 text-[#0D3B34]/70">
                    تم إرسال رمز التحقق إلى بريدك الإلكتروني.
                  </div>
                )}

                {authError && <div className="mt-4"><ErrorMessage>{authError}</ErrorMessage></div>}

                <PrimaryButton
                  disabled={authLoading || otp.length !== 6}
                  onClick={continueFromOtp}
                >
                  {authLoading ? "جاري التحقق..." : "تأكيد ومتابعة"}
                </PrimaryButton>

                <BackButton
                  onClick={() => {
                    setAuthError("");
                    setOtp("");
                    setStep(1);
                  }}
                />
              </div>
            )}

            {step === 3 && (
              <div className="mx-auto max-w-2xl">
                <SectionHeading
                  eyebrow="03 / PERSONALIZE"
                  title="خلينا نرتب التجربة ليك"
                  description="اختيار سريع يساعدنا في التقارير وترتيب التجارب المناسبة لك. لا نطلب أي أرقام هوية."
                />

                <div className="mt-7">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">صفتك</p>
                      <p className="mt-1 text-[11px] text-[#0D3B34]/45">
                        اختر خيارًا واحدًا
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-[#B99124]">مطلوب</span>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <Choice
                      active={userType === "citizen"}
                      title="مواطن سعودي"
                      subtitle="مواطن"
                      onClick={() => {
                        setUserType("citizen");
                        setProfileError("");
                      }}
                    />
                    <Choice
                      active={userType === "resident"}
                      title="مقيم"
                      subtitle="مقيم في المملكة"
                      onClick={() => {
                        setUserType("resident");
                        setProfileError("");
                      }}
                    />
                    <Choice
                      active={userType === "visitor"}
                      title="زائر"
                      subtitle="زائر للمملكة"
                      onClick={() => {
                        setUserType("visitor");
                        setProfileError("");
                      }}
                    />
                  </div>
                </div>

                <div className="mt-8 border-t border-[#0D3B34]/[0.06] pt-7">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">اهتماماتك</p>
                      <p className="mt-1 text-[11px] text-[#0D3B34]/45">
                        اختر ما يهمك، وسنرتب التجارب بناءً عليه
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={toggleAllInterests}
                      className="shrink-0 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/8 px-4 py-2 text-[11px] font-semibold text-[#7C6117] transition hover:bg-[#D4AF37]/14"
                    >
                      {allInterestsSelected ? "إلغاء تحديد الكل" : "تحديد الكل"}
                    </button>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {interests.map((item) => {
                      const active = selectedInterests.includes(item.id);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleInterest(item.id)}
                          className={`group flex items-center gap-4 rounded-[20px] border p-4 text-right transition-all duration-300 ${
                            active
                              ? "border-[#D4AF37]/50 bg-[#D4AF37]/8"
                              : "border-[#0D3B34]/8 bg-white/40 hover:border-[#0D3B34]/18 hover:bg-white/70"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base ${
                              active
                                ? "bg-[#0D3B34] text-[#D4AF37]"
                                : "bg-[#0D3B34]/5 text-[#0D3B34]"
                            }`}
                          >
                            {item.icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{item.title}</p>
                            <p className="mt-1 text-[11px] text-[#0D3B34]/45">
                              {item.subtitle}
                            </p>
                          </div>

                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                              active
                                ? "border-[#0D3B34] bg-[#0D3B34] text-white"
                                : "border-[#0D3B34]/20"
                            }`}
                          >
                            {active ? "✓" : ""}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {profileError && <div className="mt-5"><ErrorMessage>{profileError}</ErrorMessage></div>}

                <PrimaryButton
                  disabled={
                    profileLoading ||
                    !userType ||
                    selectedInterests.length === 0
                  }
                  onClick={completeProfile}
                >
                  {profileLoading
                    ? "جاري حفظ اختياراتك..."
                    : `ابدأ تجربتك (${selectedInterests.length} اهتمام)`}
                </PrimaryButton>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({
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
      <p className="text-[10px] font-semibold tracking-[0.18em] text-[#B99124]">
        {eyebrow}
      </p>
      <h3
        className="mt-2 text-2xl font-semibold"
        style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
      >
        {title}
      </h3>
      <p className="mt-3 max-w-2xl text-xs leading-7 text-[#0D3B34]/50">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-[#0D3B34]/75">
        {label}
      </span>
      {children}
    </label>
  );
}

function PrimaryButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-7 w-full rounded-[17px] bg-[#0D3B34] px-5 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(13,59,52,0.13)] transition hover:bg-[#154C42] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 w-full py-2 text-xs font-semibold text-[#0D3B34]/45 transition hover:text-[#0D3B34]"
    >
      رجوع
    </button>
  );
}

function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
      role="alert"
    >
      {children}
    </div>
  );
}

function Choice({
  active,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[20px] border p-4 text-right transition ${
        active
          ? "border-[#D4AF37]/55 bg-[#D4AF37]/10 shadow-[0_8px_24px_rgba(212,175,55,0.08)]"
          : "border-[#0D3B34]/8 bg-white/45 hover:border-[#0D3B34]/18 hover:bg-white/70"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-[10px] text-[#0D3B34]/45">{subtitle}</p>
        </div>
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
            active
              ? "border-[#0D3B34] bg-[#0D3B34] text-white"
              : "border-[#0D3B34]/20"
          }`}
        >
          {active ? "✓" : ""}
        </div>
      </div>
    </button>
  );
}

function Feature({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
      <div className="flex gap-3">
        <span className="text-[10px] font-semibold text-[#D4AF37]">{number}</span>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-xs leading-6 text-white/45">{text}</p>
        </div>
      </div>
    </div>
  );
}
