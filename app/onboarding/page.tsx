"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type UserType = "citizen" | "resident" | "visitor" | "";

type Interest = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
};

const interests: Interest[] = [
  {
    id: "heritage",
    title: "التاريخ والتراث",
    subtitle: "المتاحف والمواقع التاريخية",
    icon: "🏛",
  },
  {
    id: "guides",
    title: "المرشدون السياحيون",
    subtitle: "مرشدون مرخصون حسب موقعك",
    icon: "◎",
  },
  {
    id: "experiences",
    title: "التجارب",
    subtitle: "أنشطة وتجارب محلية مختارة",
    icon: "✦",
  },
  {
    id: "food",
    title: "المطاعم والمقاهي",
    subtitle: "تجارب الطعام القريبة منك",
    icon: "◌",
  },
  {
    id: "shopping",
    title: "التسوق",
    subtitle: "متاجر وأسواق ومنتجات محلية",
    icon: "◇",
  },
  {
    id: "events",
    title: "الفعاليات",
    subtitle: "فعاليات تحدث حولك الآن",
    icon: "◈",
  },
];

const visaTypes = [
  "سياحية",
  "عمرة",
  "حج",
  "زيارة عائلية",
  "زيارة أعمال",
  "زيارة حكومية",
  "زيارة شخصية",
];

const steps = [
  { number: 1, label: "الحساب" },
  { number: 2, label: "التحقق" },
  { number: 3, label: "الهوية" },
  { number: 4, label: "الاهتمامات" },
  { number: 5, label: "الموقع" },
  { number: 6, label: "الإشعارات" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);

  useEffect(() => {
    let cancelled = false;

    async function resumeVerifiedSession() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        if (!response.ok) return;

        const result = await response.json().catch(() => null);
        const user = result?.data?.user;

        if (!cancelled && result?.success && user?.status === "ACTIVE") {
          setStep(3);
        }
      } catch {
        // No active session: keep the normal onboarding flow at step 1.
      }
    }

    void resumeVerifiedSession();

    return () => {
      cancelled = true;
    };
  }, []);

 const [fullName, setFullName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [password, setPassword] = useState("");
const [otp, setOtp] = useState("");

const [authLoading, setAuthLoading] = useState(false);
const [authError, setAuthError] = useState("");
const [identityLoading, setIdentityLoading] = useState(false);
const [identityError, setIdentityError] = useState("");
const [otpSent, setOtpSent] = useState(false);

  const [userType, setUserType] = useState<UserType>("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [visaType, setVisaType] = useState("");
  const [visaNumber, setVisaNumber] = useState("");
  const [visaIssueDate, setVisaIssueDate] = useState("");

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "granted" | "denied" | "skipped"
  >("idle");

  const [notificationStatus, setNotificationStatus] = useState<
    "idle" | "granted" | "denied" | "skipped"
  >("idle");

  const progress = useMemo(() => {
    if (step === 7) return 100;
    return ((step - 1) / 5) * 100;
  }, [step]);

  const identityComplete = useMemo(() => {
    return userType !== "";
  }, [userType]);

  function toggleInterest(id: string) {
    setSelectedInterests((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
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

  if (
    cleanPassword.length < 8 ||
    !/[A-Za-z]/.test(cleanPassword) ||
    !/[0-9]/.test(cleanPassword)
  ) {
    setAuthError(
      "كلمة المرور يجب أن تكون 8 أحرف على الأقل، وتحتوي على حرف ورقم."
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: cleanEmail,
        password: cleanPassword,
        phone: cleanPhone || undefined,
        firstName,
        lastName,
        role: "CUSTOMER",
      }),
    });

    const registerData = await registerResponse.json();

    if (!registerResponse.ok) {
      const errorCode = registerData?.error;

      const messages: Record<string, string> = {
        EMAIL_ALREADY_EXISTS:
          "يوجد حساب مسجل بهذا البريد الإلكتروني.",
        PHONE_ALREADY_EXISTS:
          "رقم الجوال مستخدم في حساب آخر.",
        INVALID_EMAIL:
          "يرجى إدخال بريد إلكتروني صحيح.",
        WEAK_PASSWORD:
          "كلمة المرور يجب أن تكون 8 أحرف على الأقل، وتحتوي على حرف ورقم.",
        RATE_LIMIT_EXCEEDED:
          "تمت محاولات كثيرة خلال وقت قصير. يرجى المحاولة بعد قليل.",
        DATABASE_NOT_CONFIGURED:
          "الخدمة غير متاحة حاليًا. يرجى المحاولة لاحقًا.",
      };

      setAuthError(
        messages[errorCode] ||
          "تعذر إنشاء الحساب حاليًا. يرجى المحاولة مرة أخرى."
      );
      return;
    }

    const verificationResponse = await fetch(
      "/api/auth/verify-email/request",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
        }),
      }
    );

    const verificationData = await verificationResponse.json();

    if (!verificationResponse.ok) {
      const errorCode = verificationData?.error;

      if (errorCode === "RATE_LIMIT_EXCEEDED") {
        setAuthError(
          "تمت محاولات كثيرة لإرسال رمز التحقق. يرجى المحاولة بعد قليل."
        );
      } else {
        setAuthError(
          "تم إنشاء الحساب، لكن تعذر إرسال رمز التحقق. يرجى المحاولة مرة أخرى."
        );
      }

      return;
    }

    setOtp("");
    setOtpSent(true);
    setStep(2);
  } catch {
    setAuthError(
      "تعذر الاتصال بالخدمة حاليًا. تحقق من الاتصال ثم حاول مرة أخرى."
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: cleanEmail,
        code: cleanOtp,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorCode = data?.error;

      const messages: Record<string, string> = {
        INVALID_CODE:
          "رمز التحقق غير صحيح. تأكد من الرمز وحاول مرة أخرى.",
        TOKEN_EXPIRED:
          "انتهت صلاحية رمز التحقق. اطلب رمزًا جديدًا.",
        MAX_ATTEMPTS_REACHED:
          "تم تجاوز عدد محاولات التحقق المسموح بها. اطلب رمزًا جديدًا.",
        RATE_LIMIT_EXCEEDED:
          "تمت محاولات كثيرة خلال وقت قصير. يرجى المحاولة بعد قليل.",
      };

      setAuthError(
        messages[errorCode] ||
          "تعذر التحقق من الرمز. تأكد منه وحاول مرة أخرى."
      );
      return;
    }

    setAuthError("");
    setStep(3);
  } catch {
    setAuthError(
      "تعذر الاتصال بالخدمة حاليًا. تحقق من الاتصال ثم حاول مرة أخرى."
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

      const data = await response.json();

      if (!response.ok) {
        if (data?.error === "RATE_LIMIT_EXCEEDED") {
          setAuthError(
            "تمت محاولات كثيرة لإرسال رمز التحقق. يرجى المحاولة بعد قليل."
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
        "تعذر الاتصال بالخدمة حاليًا. تحقق من الاتصال ثم حاول مرة أخرى."
      );
    } finally {
      setAuthLoading(false);
    }
  }

  function selectUserType(type: UserType) {
    setUserType(type);
    setIdentityNumber("");
    setBirthDate("");
    setVisaType("");
    setVisaNumber("");
    setVisaIssueDate("");
    setIdentityError("");
  }

  async function continueFromIdentity() {
    if (identityLoading || !identityComplete) return;

    const visitorTypeMap: Record<Exclude<UserType, "">, "CITIZEN" | "RESIDENT" | "VISITOR"> = {
      citizen: "CITIZEN",
      resident: "RESIDENT",
      visitor: "VISITOR",
    };

    if (!userType) return;

    setIdentityLoading(true);
    setIdentityError("");

    try {
      const response = await fetch("/api/onboarding/identity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visitorType: visitorTypeMap[userType],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.error === "UNAUTHORIZED") {
          setIdentityError("انتهت جلسة تسجيل الدخول. يرجى تسجيل الدخول ثم المحاولة مرة أخرى.");
        } else if (data?.error === "INVALID_VISITOR_TYPE") {
          setIdentityError("يرجى اختيار صفة المستخدم بصورة صحيحة.");
        } else {
          setIdentityError("تعذر حفظ بيانات الهوية حاليًا. يرجى المحاولة مرة أخرى.");
        }
        return;
      }

      setStep(4);
    } catch {
      setIdentityError("تعذر الاتصال بالخدمة حاليًا. تحقق من الاتصال ثم حاول مرة أخرى.");
    } finally {
      setIdentityLoading(false);
    }
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }

    setLocationStatus("loading");

    navigator.geolocation.getCurrentPosition(
      () => setLocationStatus("granted"),
      () => setLocationStatus("denied"),
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }

  async function requestNotifications() {
    if (!("Notification" in window)) {
      setNotificationStatus("denied");
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        setNotificationStatus("granted");
      } else {
        setNotificationStatus("denied");
      }
    } catch {
      setNotificationStatus("denied");
    }
  }

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#F7F5EF] text-[#0D3B34]"
      style={{ fontFamily: "var(--font-ibm-plex-arabic), sans-serif" }}
    >
      {/* PREMIUM AMBIENT BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_12%,rgba(212,175,55,0.12),transparent_26%),radial-gradient(circle_at_8%_82%,rgba(13,59,52,0.11),transparent_30%),linear-gradient(135deg,#FAF8F2_0%,#F4F1E8_48%,#F8F6F0_100%)]" />

        <div className="absolute -right-[180px] top-[70px] h-[540px] w-[540px] rounded-full bg-[#0D3B34]/[0.07] blur-[125px]" />

        <div className="absolute -left-[170px] -top-[150px] h-[500px] w-[500px] rounded-full bg-[#D4AF37]/[0.09] blur-[135px]" />

        <div className="absolute bottom-[-250px] left-[30%] h-[450px] w-[650px] rounded-full bg-[#D4AF37]/[0.055] blur-[145px]" />

        {/* Loop watermark */}
        <div className="absolute right-[2%] top-[15%] h-[330px] w-[330px] rotate-[-15deg] opacity-[0.045]">
          <div className="absolute left-[16px] top-[92px] h-[125px] w-[195px] rotate-[28deg] rounded-[999px] border-[2px] border-[#0D3B34]" />
          <div className="absolute right-[16px] top-[92px] h-[125px] w-[195px] rotate-[-28deg] rounded-[999px] border-[2px] border-[#D4AF37]" />
        </div>

        <div className="absolute -bottom-[100px] -left-[90px] h-[380px] w-[380px] rotate-[18deg] opacity-[0.035]">
          <div className="absolute left-[20px] top-[100px] h-[145px] w-[215px] rotate-[28deg] rounded-[999px] border-[2px] border-[#D4AF37]" />
          <div className="absolute right-[20px] top-[100px] h-[145px] w-[215px] rotate-[-28deg] rounded-[999px] border-[2px] border-[#0D3B34]" />
        </div>

        {/* Fine texture */}
        <div
          className="absolute inset-0 opacity-[0.014]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(13,59,52,0.9) 0.6px, transparent 0.7px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="absolute left-1/2 top-[45%] h-[650px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30 blur-[120px]" />
      </div>

      {/* HEADER */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Link href="/auth">
          <Image
            src="/Logo/arees-loop-logo.png"
            alt="Arees Loop"
            width={180}
            height={90}
            priority
            className="h-auto w-[130px] md:w-[150px]"
          />
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/45 px-4 py-2 text-xs font-medium text-[#0D3B34]/65 backdrop-blur-xl">
          <ShieldIcon />
          تجربة آمنة وموثوقة
        </div>
      </header>

      {/* PAGE */}
      <section className="relative z-10 mx-auto grid max-w-7xl gap-7 px-5 pb-12 pt-3 md:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-9 lg:pt-7">
        {/* SIDE PANEL */}
        <aside className="relative hidden min-h-[700px] overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#082E28] via-[#0D3B34] to-[#123F37] p-8 text-white shadow-[0_24px_65px_rgba(8,47,41,0.13)] lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full border border-white/[0.07]" />
          <div className="absolute -left-8 top-36 h-44 w-44 rounded-full border border-[#D4AF37]/15" />
          <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-10 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07]">
              <LoopIcon />
            </div>

            <p className="mb-4 text-[10px] font-semibold tracking-[0.24em] text-[#D4AF37]">
              SMART VISITOR EXPERIENCE
            </p>

            <h1
              className="max-w-md text-[34px] font-semibold leading-[1.35]"
              style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
            >
              تجربة تبدأ منك
              <br />
              وتتغير مع رحلتك.
            </h1>

            <p className="mt-5 max-w-sm text-xs leading-7 text-white/55">
              نبني تجربتك حسب هويتك السياحية واهتماماتك وموقعك، مع إبقاء
              التحكم في بياناتك وصلاحياتك بيدك.
            </p>
          </div>

          <div className="relative z-10 space-y-3">
            <FeatureLine
              number="01"
              title="هوية موثوقة"
              text="تصميم جاهز للتكامل مع قنوات التحقق الرسمية عند اعتمادها."
            />

            <FeatureLine
              number="02"
              title="خصوصية من البداية"
              text="نجمع البيانات اللازمة للخدمة فقط وبحسب الغرض."
            />

            <FeatureLine
              number="03"
              title="أنت المتحكم"
              text="الموقع والإشعارات لا تُفعّل إلا باختيارك."
            />
          </div>
        </aside>

        {/* MAIN CARD */}
        <div className="overflow-hidden rounded-[32px] border border-white/80 bg-white/[0.72] shadow-[0_22px_65px_rgba(13,59,52,0.07)] backdrop-blur-2xl">
          {/* PROGRESS */}
          <div className="border-b border-[#0D3B34]/[0.06] px-5 py-5 md:px-8">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#B99124]">
                  إعداد حسابك
                </p>

                <h2
                  className="mt-1 text-lg font-semibold"
                  style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
                >
                  مرحبًا بك في Arees Loop
                </h2>
              </div>

              {step < 7 && (
                <span className="whitespace-nowrap rounded-full bg-[#0D3B34]/5 px-3 py-1.5 text-[11px] font-semibold text-[#0D3B34]/55">
                  الخطوة {step} من 6
                </span>
              )}
            </div>

            {step < 7 && (
              <>
                <div className="mb-4 h-1 overflow-hidden rounded-full bg-[#0D3B34]/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-[#0D3B34] to-[#1A5B4F] transition-all duration-500"
                    style={{ width: `${Math.max(progress, 4)}%` }}
                  />
                </div>

                <div className="grid grid-cols-6 gap-1">
                  {steps.map((item) => (
                    <div key={item.number} className="text-center">
                      <div
                        className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold transition ${
                          step > item.number
                            ? "bg-[#0D3B34] text-white"
                            : step === item.number
                              ? "border border-[#D4AF37]/60 bg-[#D4AF37]/10 text-[#0D3B34]"
                              : "bg-[#0D3B34]/5 text-[#0D3B34]/30"
                        }`}
                      >
                        {step > item.number ? "✓" : item.number}
                      </div>

                      <p
                        className={`mt-2 hidden text-[9px] sm:block ${
                          step === item.number
                            ? "font-semibold text-[#0D3B34]"
                            : "text-[#0D3B34]/30"
                        }`}
                      >
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="min-h-[555px] p-5 md:p-9">
        {/* STEP 1 — ACCOUNT */}
{step === 1 && (
  <div className="mx-auto max-w-xl">
    <SectionHeading
      eyebrow="01 / ACCOUNT"
      title="خلينا نبدأ بالتعارف"
      description="أنشئ حسابك للبدء في اكتشاف التجارب المناسبة لك. سيتم التحقق من بريدك الإلكتروني لحماية حسابك."
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

      <Field label="رقم الجوال (اختياري)">
        <input
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setAuthError("");
          }}
          placeholder="05XXXXXXXX"
          type="tel"
          dir="ltr"
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

      {authError && (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
          role="alert"
        >
          {authError}
        </div>
      )}
    </div>

    <PrimaryButton
      disabled={
        authLoading ||
        !fullName.trim() ||
        !email.trim() ||
        password.length < 8
      }
      onClick={continueFromAccount}
    >
      {authLoading ? "جاري إنشاء الحساب..." : "إنشاء الحساب والمتابعة"}
    </PrimaryButton>

    <PrivacyNote>
      نستخدم بيانات الحساب لتشغيل الخدمة وتأمين حسابك. رقم الجوال اختياري
      حاليًا، وسيتم التحقق من البريد الإلكتروني قبل متابعة إنشاء الملف
      الشخصي.
    </PrivacyNote>
  </div>
)}

            {/* STEP 2 — OTP */}
            {step === 2 && (
              <div className="mx-auto max-w-xl">
                <SectionHeading
                  eyebrow="02 / VERIFY"
                  title="تحقق من بريدك الإلكتروني"
                  description={`أدخل رمز التحقق المكوّن من 6 أرقام الخاص بالبريد ${email.trim().toLowerCase()}.`}
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

                    <span className="text-[#0D3B34]/40">
                      رمز صالح لفترة محدودة
                    </span>
                  </div>
                </div>

                {otpSent && (
                  <StatusMessage>
                    تم طلب رمز التحقق لبريدك الإلكتروني. في بيئة التطوير المحلية
                    يظهر الرمز في سجل الخادم إلى أن يتم ربط مزود البريد.
                  </StatusMessage>
                )}

                {authError && (
                  <div
                    className="mt-4 rounded-[15px] border border-red-200 bg-red-50 px-4 py-3 text-xs leading-6 text-red-700"
                    role="alert"
                  >
                    {authError}
                  </div>
                )}

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

            {/* STEP 3 — IDENTITY */}
            {step === 3 && (
              <div className="mx-auto max-w-2xl">
                <SectionHeading
                  eyebrow="03 / IDENTITY"
                  title="عرّفنا بصفة زيارتك"
                  description="نطلب الحد الأدنى من البيانات اللازمة لتخصيص التجربة. التكامل مع أنظمة التحقق الرسمية سيتم فقط بعد الاعتماد والتصريح المناسب."
                />

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <IdentityChoice
                    active={userType === "citizen"}
                    onClick={() => selectUserType("citizen")}
                    icon="◆"
                    title="مواطن"
                    subtitle="هوية وطنية"
                  />

                  <IdentityChoice
                    active={userType === "resident"}
                    onClick={() => selectUserType("resident")}
                    icon="◉"
                    title="مقيم"
                    subtitle="هوية مقيم"
                  />

                  <IdentityChoice
                    active={userType === "visitor"}
                    onClick={() => selectUserType("visitor")}
                    icon="✦"
                    title="زائر"
                    subtitle="تأشيرة زيارة"
                  />
                </div>

                {(userType === "citizen" || userType === "resident") && (
                  <div className="mt-7 rounded-[24px] border border-[#0D3B34]/8 bg-white/45 p-5">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">
                          {userType === "citizen"
                            ? "بيانات الهوية الوطنية"
                            : "بيانات الإقامة"}
                        </p>

                        <p className="mt-1 text-[11px] text-[#0D3B34]/45">
                          سيتم لاحقًا استبدال الإدخال اليدوي بمسار تحقق رسمي
                          حيثما يكون متاحًا ومعتمدًا.
                        </p>
                      </div>

                      <span className="rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/8 px-3 py-1 text-[9px] font-semibold text-[#8A6B13]">
                        تكامل مستقبلي
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label={
                          userType === "citizen"
                            ? "رقم الهوية"
                            : "رقم الإقامة"
                        }
                      >
                        <input
                          value={identityNumber}
                          onChange={(e) =>
                            setIdentityNumber(
                              e.target.value.replace(/\D/g, "").slice(0, 10)
                            )
                          }
                          inputMode="numeric"
                          dir="ltr"
                          placeholder="XXXXXXXXXX"
                          className={inputClass}
                        />
                      </Field>

                      <Field label="تاريخ الميلاد">
                        <input
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          type="date"
                          dir="ltr"
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <PrivacyNote>
                      لا يتم إرسال هذه البيانات إلى نفاذ أو أي جهة حكومية في
                      النموذج الحالي. الربط الرسمي سيضاف لاحقًا من الخادم
                      Server-to-Server بعد الحصول على الصلاحيات اللازمة.
                    </PrivacyNote>
                  </div>
                )}

                {userType === "visitor" && (
                  <div className="mt-7 rounded-[24px] border border-[#0D3B34]/8 bg-white/45 p-5">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">
                          بيانات تأشيرة الزيارة
                        </p>

                        <p className="mt-1 text-[11px] text-[#0D3B34]/45">
                          تساعدنا صفة الزيارة على تقديم تجربة أكثر ملاءمة
                          للزائر.
                        </p>
                      </div>

                      <span className="rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/8 px-3 py-1 text-[9px] font-semibold text-[#8A6B13]">
                        تحقق رسمي لاحقًا
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="نوع التأشيرة">
                        <select
                          value={visaType}
                          onChange={(e) => setVisaType(e.target.value)}
                          className={inputClass}
                        >
                          <option value="">اختر نوع التأشيرة</option>

                          {visaTypes.map((visa) => (
                            <option key={visa} value={visa}>
                              {visa}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="رقم التأشيرة">
                        <input
                          value={visaNumber}
                          onChange={(e) =>
                            setVisaNumber(
                              e.target.value.replace(/\D/g, "").slice(0, 20)
                            )
                          }
                          inputMode="numeric"
                          dir="ltr"
                          placeholder="رقم التأشيرة"
                          className={inputClass}
                        />
                      </Field>

                      <Field label="تاريخ إصدار التأشيرة">
                        <input
                          value={visaIssueDate}
                          onChange={(e) => setVisaIssueDate(e.target.value)}
                          type="date"
                          dir="ltr"
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <PrivacyNote>
                      في النسخة التشغيلية سنحدد بدقة البيانات المطلوبة من
                      التأشيرة ونحتفظ فقط بما يلزم لتقديم الخدمة وفق الغرض
                      المعلن وسياسة الخصوصية.
                    </PrivacyNote>
                  </div>
                )}

                {identityError && (
                  <div
                    className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                    role="alert"
                  >
                    {identityError}
                  </div>
                )}

                <PrimaryButton
                  disabled={!identityComplete || identityLoading}
                  onClick={continueFromIdentity}
                >
                  {identityLoading ? "جاري حفظ البيانات..." : "حفظ ومتابعة"}
                </PrimaryButton>

                <BackButton onClick={() => setStep(2)} />
              </div>
            )}

            {/* STEP 4 — INTERESTS */}
            {step === 4 && (
              <div className="mx-auto max-w-2xl">
                <SectionHeading
                  eyebrow="04 / INTERESTS"
                  title="شنو البهمك في رحلتك؟"
                  description="اختياراتك تساعد Arees Loop على ترتيب التجارب المناسبة لك بدل عرض كل شيء بصورة عشوائية."
                />

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
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

                <PrimaryButton
                  disabled={selectedInterests.length === 0}
                  onClick={() => setStep(5)}
                >
                  حفظ الاهتمامات
                </PrimaryButton>

                <BackButton onClick={() => setStep(3)} />
              </div>
            )}

            {/* STEP 5 — LOCATION */}
            {step === 5 && (
              <div className="mx-auto max-w-xl">
                <SectionHeading
                  eyebrow="05 / LOCATION"
                  title="اكتشف ما حولك"
                  description="الموقع يساعد Arees Loop على اقتراح التجارب والمرشدين والوجهات المناسبة لمكانك الحالي، ولن نطلب الصلاحية قبل اختيارك."
                />

                <div className="mt-8 rounded-[26px] border border-white/10 bg-gradient-to-br from-[#0B342D] to-[#154C42] p-6 text-white">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                      <LocationIcon />
                    </div>

                    <div>
                      <p className="font-semibold">
                        استخدام الموقع أثناء استخدام الخدمة
                      </p>

                      <p className="mt-2 text-xs leading-6 text-white/55">
                        نستخدم موقعك لتقديم الخدمات المعتمدة على القرب. التصميم
                        لا يتطلب إنشاء سجل دائم لتحركاتك لمجرد عرض ما حولك.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={
                        locationStatus === "loading" ||
                        locationStatus === "granted"
                      }
                      onClick={requestLocation}
                      className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0D3B34] transition hover:bg-[#F5F1E7] disabled:opacity-60"
                    >
                      {locationStatus === "loading"
                        ? "جاري طلب الإذن..."
                        : locationStatus === "granted"
                          ? "تم السماح بالموقع ✓"
                          : "السماح بالموقع"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setLocationStatus("skipped")}
                      className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/10"
                    >
                      تخطي الآن
                    </button>
                  </div>
                </div>

                {locationStatus === "denied" && (
                  <StatusMessage>
                    لم يتم منح صلاحية الموقع. تقدر تكمل وتفعّلها لاحقًا من
                    الإعدادات.
                  </StatusMessage>
                )}

                {(locationStatus === "granted" ||
                  locationStatus === "skipped" ||
                  locationStatus === "denied") && (
                  <PrimaryButton onClick={() => setStep(6)}>
                    متابعة
                  </PrimaryButton>
                )}

                <BackButton onClick={() => setStep(4)} />
              </div>
            )}

            {/* STEP 6 — NOTIFICATIONS */}
            {step === 6 && (
              <div className="mx-auto max-w-xl">
                <SectionHeading
                  eyebrow="06 / NOTIFICATIONS"
                  title="خليك قريب من التجربة"
                  description="يمكن لـ Arees Loop تنبيهك بتحديثات الحجوزات والتجارب المناسبة، ويمكنك التحكم في الإشعارات في أي وقت."
                />

                <div className="mt-8 rounded-[24px] border border-[#0D3B34]/8 bg-white/45 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/12">
                      <BellIcon />
                    </div>

                    <div>
                      <p className="font-semibold">
                        إشعارات مرتبطة بما يهمك
                      </p>

                      <p className="mt-2 text-xs leading-6 text-[#0D3B34]/50">
                        للحجوزات والتجارب والسياق المناسب، ويمكنك إيقافها لاحقًا
                        من إعدادات حسابك.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={notificationStatus === "granted"}
                      onClick={requestNotifications}
                      className="rounded-xl bg-[#0D3B34] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#154C42] disabled:opacity-60"
                    >
                      {notificationStatus === "granted"
                        ? "تم تفعيل الإشعارات ✓"
                        : "تفعيل الإشعارات"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setNotificationStatus("skipped")}
                      className="rounded-xl border border-[#0D3B34]/10 bg-white/60 px-4 py-3 text-sm font-semibold text-[#0D3B34]/60 transition hover:border-[#0D3B34]/20"
                    >
                      ليس الآن
                    </button>
                  </div>
                </div>

                {(notificationStatus === "granted" ||
                  notificationStatus === "skipped" ||
                  notificationStatus === "denied") && (
                  <PrimaryButton onClick={() => setStep(7)}>
                    إكمال إنشاء الحساب
                  </PrimaryButton>
                )}

                <BackButton onClick={() => setStep(5)} />
              </div>
            )}

            {/* STEP 7 — COMPLETE */}
            {step === 7 && (
              <div className="mx-auto flex max-w-xl flex-col items-center py-7 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full bg-[#D4AF37]/20 blur-2xl" />

                  <div className="relative flex h-18 w-18 items-center justify-center rounded-[24px] bg-[#0D3B34] p-5 text-2xl text-[#D4AF37]">
                    ✓
                  </div>
                </div>

                <p className="text-[10px] font-semibold tracking-[0.2em] text-[#B99124]">
                  YOU&apos;RE READY
                </p>

                <h2
                  className="mt-3 text-3xl font-semibold"
                  style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
                >
                  حسابك جاهز للرحلة
                </h2>

                <p className="mt-4 max-w-md text-sm leading-7 text-[#0D3B34]/50">
                  تم إنشاء حسابك والتحقق من بريدك الإلكتروني، وأصبحت تفضيلاتك
                  الأولية جاهزة لبدء تجربة Arees Loop.
                </p>

                <div className="mt-7 grid w-full gap-3 sm:grid-cols-3">
                  <SummaryCard
                    title="صفة المستخدم"
                    value={
                      userType === "citizen"
                        ? "مواطن"
                        : userType === "resident"
                          ? "مقيم"
                          : "زائر"
                    }
                  />

                  <SummaryCard
                    title="الاهتمامات"
                    value={`${selectedInterests.length} محددة`}
                  />

                  <SummaryCard
                    title="الموقع"
                    value={
                      locationStatus === "granted" ? "مفعّل" : "لاحقًا"
                    }
                  />
                </div>

                <Link
                  href="/discover"
                  className="mt-8 w-full rounded-[18px] bg-[#0D3B34] px-6 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#154C42]"
                >
                  اكتشف ما حولك
                </Link>

                <p className="mt-4 text-[10px] text-[#0D3B34]/35">
                  الانتقال إلى تجربة Discover
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 pb-7 text-[10px] text-[#0D3B34]/35 md:px-8">
        <span>© Arees Loop</span>
        <span>Privacy by Design • Secure by Design</span>
      </footer>
    </main>
  );
}

/* ================= COMPONENTS ================= */

const inputClass =
  "w-full rounded-[16px] border border-[#0D3B34]/10 bg-white/55 px-4 py-3.5 text-sm text-[#0D3B34] outline-none transition placeholder:text-[#0D3B34]/25 focus:border-[#D4AF37]/60 focus:bg-white focus:ring-4 focus:ring-[#D4AF37]/8";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-[#0D3B34]/65">
        {label}
      </label>
      {children}
    </div>
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
      <p className="text-[9px] font-bold tracking-[0.22em] text-[#B99124]">
        {eyebrow}
      </p>

      <h2
        className="mt-2 text-2xl font-semibold md:text-[28px]"
        style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
      >
        {title}
      </h2>

      <p className="mt-3 max-w-xl text-xs leading-6 text-[#0D3B34]/48">
        {description}
      </p>
    </div>
  );
}

function ChoiceButton({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[16px] border p-4 text-right transition ${
        active
          ? "border-[#D4AF37]/55 bg-[#D4AF37]/8"
          : "border-[#0D3B34]/8 bg-white/45 hover:border-[#0D3B34]/18"
      }`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-[10px] text-[#0D3B34]/40">{subtitle}</p>
    </button>
  );
}

function IdentityChoice({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[20px] border p-5 text-center transition-all ${
        active
          ? "border-[#D4AF37]/60 bg-[#D4AF37]/10 shadow-[0_8px_24px_rgba(212,175,55,0.06)]"
          : "border-[#0D3B34]/8 bg-white/40 hover:border-[#0D3B34]/18 hover:bg-white/65"
      }`}
    >
      <div
        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${
          active
            ? "bg-[#0D3B34] text-[#D4AF37]"
            : "bg-[#0D3B34]/5 text-[#0D3B34]"
        }`}
      >
        {icon}
      </div>

      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-[10px] text-[#0D3B34]/40">{subtitle}</p>
    </button>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-7 w-full rounded-[17px] bg-[#0D3B34] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(13,59,52,0.10)] transition hover:-translate-y-0.5 hover:bg-[#154C42] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
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
      className="mt-3 w-full py-2 text-xs font-semibold text-[#0D3B34]/42 transition hover:text-[#0D3B34]"
    >
      رجوع
    </button>
  );
}

function PrivacyNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 flex items-start gap-2 rounded-[15px] border border-[#0D3B34]/[0.04] bg-[#0D3B34]/[0.035] px-4 py-3 text-[10px] leading-5 text-[#0D3B34]/48">
      <ShieldIcon />
      <p>{children}</p>
    </div>
  );
}

function StatusMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-[15px] border border-[#D4AF37]/20 bg-[#D4AF37]/7 px-4 py-3 text-[10px] leading-5 text-[#0D3B34]/60">
      {children}
    </div>
  );
}

function FeatureLine({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-[18px] border border-white/[0.07] bg-white/[0.035] p-4">
      <span className="pt-0.5 text-[9px] font-semibold text-[#D4AF37]">
        {number}
      </span>

      <div>
        <p className="text-xs font-semibold">{title}</p>
        <p className="mt-1 text-[10px] leading-5 text-white/45">{text}</p>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#0D3B34]/8 bg-white/45 p-4">
      <p className="text-[9px] text-[#0D3B34]/35">{title}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

/* ================= ICONS ================= */

function ShieldIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M12 3 5 6v5c0 4.7 2.9 8.2 7 10 4.1-1.8 7-5.3 7-10V6l-7-3Z" />
      <path d="m9.5 12 1.7 1.7 3.6-4" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function LoopIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 8.5 6 11a3.5 3.5 0 0 0 5 5l2.5-2.5" />
      <path d="m15.5 15.5 2.5-2.5a3.5 3.5 0 0 0-5-5l-2.5 2.5" />
    </svg>
  );
}