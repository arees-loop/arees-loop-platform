"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type StatusKey =
  | "received"
  | "review"
  | "agreement"
  | "accepted"
  | "final"
  | "active";

type Step = {
  key: StatusKey;
  title: string;
  description: string;
};

type PartnerApplication = {
  id: string;
  status: string;
  legalNameAr: string;
  tradeNameAr: string | null;
  partnerType: string | null;
  submittedAt: string | null;
  updatedAt: string;
  completionNotes?: string | null;
  categories?: Array<{ id: string; name: string }>;
  licenses?: Array<{
    id: string;
    type: string;
    issuer: string;
    licenseNumber: string;
  }>;
};

const steps: Step[] = [
  {
    key: "received",
    title: "تم استلام الطلب",
    description: "تم حفظ بيانات طلب الشراكة والمستندات المرفوعة.",
  },
  {
    key: "review",
    title: "مراجعة الطلب",
    description: "يقوم فريق أريس بمراجعة بيانات الطلب والمستندات المرفقة، وسيتم إشعارك عند وجود أي تحديث أو استكمال مطلوب.",
  },
  {
    key: "agreement",
    title: "الاتفاقية الإلكترونية",
    description: "راجع العمولة والرسوم والشروط التجارية ثم وافق على الاتفاقية إلكترونياً.",
  },
  {
    key: "accepted",
    title: "تم قبول الاتفاقية",
    description: "تم تسجيل قبول الشريك للشروط والاتفاقية.",
  },
  {
    key: "final",
    title: "الاعتماد النهائي",
    description: "يتم استكمال قرار الاعتماد النهائي قبل تفعيل حساب الشريك.",
  },
  {
    key: "active",
    title: "معتمد ونشط",
    description: "تم اعتماد المنشأة ويمكنك الآن إدارة خدماتك وطلباتك.",
  },
];

function statusToStep(status: string): StatusKey {
  switch (status) {
    case "DRAFT":
      return "received";
    case "SUBMITTED":
    case "UNDER_REVIEW":
    case "NEEDS_COMPLETION":
    case "PRE_APPROVED":
      return "review";
    case "WAITING_AGREEMENT":
      return "agreement";
    case "AGREEMENT_ACCEPTED":
      return "accepted";
    case "APPROVED":
      return "final";
    case "ACTIVE":
      return "active";
    default:
      return "review";
  }
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "مسودة",
    SUBMITTED: "مراجعة الطلب",
    UNDER_REVIEW: "قيد مراجعة أريس",
    NEEDS_COMPLETION: "مطلوب استكمال",
    PRE_APPROVED: "قيد مراجعة أريس",
    WAITING_AGREEMENT: "بانتظار موافقتك على الاتفاقية",
    AGREEMENT_ACCEPTED: "تمت الموافقة على الشروط",
    APPROVED: "بانتظار التفعيل",
    ACTIVE: "معتمد ونشط",
    SUSPENDED: "موقوف",
    REJECTED: "غير معتمد",
  };
  return labels[status] ?? status;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function PartnerStatusPage() {
  const [showDetails, setShowDetails] = useState(false);
  const [application, setApplication] = useState<PartnerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [user, setUser] = useState<{ firstName?: string | null; lastName?: string | null; email?: string | null; profileImageUrl?: string | null } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadApplication() {
      try {
        const response = await fetch("/api/partner/application", {
          method: "GET",
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "تعذر تحميل حالة الطلب.");
        }

        if (active) setApplication(result.application ?? null);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "تعذر تحميل حالة الطلب.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => {
        if (active && result?.success) setUser(result.data?.user ?? null);
      })
      .catch(() => null);

    loadApplication();
    return () => {
      active = false;
    };
  }, []);

  const currentStatus = application ? statusToStep(application.status) : "received";
  const currentIndex = useMemo(
    () => steps.findIndex((step) => step.key === currentStatus),
    [currentStatus]
  );

  if (loading) {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-[#F7F4EA] text-[#0D463D]">
        <p className="text-sm font-semibold">جاري تحميل حالة الطلب...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-[#F7F4EA] px-5 text-[#0D463D]">
        <div className="max-w-lg rounded-[30px] border border-[#DDD9CC] bg-white p-8 text-center">
          <h1 className="text-xl font-bold">تعذر تحميل حالة الطلب</h1>
          <p className="mt-3 text-sm text-[#71837E]">{error}</p>
        </div>
      </main>
    );
  }

  if (!application) {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-[#F7F4EA] px-5 text-[#0D463D]">
        <div className="max-w-lg rounded-[30px] border border-[#DDD9CC] bg-white p-8 text-center">
          <h1 className="text-xl font-bold">لا يوجد طلب شراكة</h1>
          <p className="mt-3 text-sm text-[#71837E]">لم نجد طلب شراكة مرتبطاً بحسابك الحالي.</p>
        </div>
      </main>
    );
  }

  const category = application.categories?.map((item) => item.name).join("، ") || "—";
  const license =
    application.licenses?.length
      ? application.licenses.map((item) => item.type).join("، ")
      : "—";

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F7F4EA] text-[#0D463D]"
      style={{ fontFamily: "var(--font-ibm-plex-arabic), sans-serif" }}
    >
      <header className="border-b border-[#0D463D]/10 bg-[#FAF8F1]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <div className="relative">
            <button
              type="button"
              onClick={() => setAccountOpen((value) => !value)}
              className="flex cursor-pointer items-center gap-3 rounded-2xl px-2 py-1.5 text-right transition hover:bg-[#0D463D]/5"
            >
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="" className="h-12 w-12 rounded-2xl object-cover ring-1 ring-[#D4A72C]/35" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D463D] text-lg font-bold text-[#D4A72C]">∞</div>
              )}
              <div className="hidden sm:block">
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#B88716]">AREES LOOP PARTNER</p>
                <p className="mt-0.5 text-sm font-bold text-[#0D463D]">
                  {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "حساب الشريك"}
                </p>
                <p className="max-w-[220px] truncate text-[11px] text-[#71837E]" dir="ltr">{user?.email || ""}</p>
              </div>
              <span className={`text-xs text-[#8B9A96] transition-transform ${accountOpen ? "rotate-180" : ""}`}>▼</span>
            </button>

            {accountOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-2xl border border-[#DDD9CC] bg-white p-2 shadow-[0_18px_50px_rgba(13,70,61,.16)]">
                <div className="border-b border-[#0D463D]/8 px-3 py-3">
                  <p className="font-bold text-[#0D463D]">{[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "حساب الشريك"}</p>
                  <p className="mt-1 truncate text-xs text-[#71837E]" dir="ltr">{user?.email || ""}</p>
                </div>
                <Link href="/profile" className="mt-1 flex cursor-pointer items-center justify-between rounded-xl px-3 py-3 text-sm font-bold text-[#0D463D] transition hover:bg-[#F5F1E5]">
                  <span>الملف الشخصي</span><span>←</span>
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    window.location.href = "/partner/login";
                  }}
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-3 text-sm font-bold text-[#A3443E] transition hover:bg-[#FFF0ED]"
                >
                  <span>تسجيل الخروج</span><span>←</span>
                </button>
              </div>
            )}
          </div>
          <div className="rounded-full border border-[#0D463D]/10 bg-white px-4 py-2 text-xs">
            رقم الطلب:{" "}
            <span className="font-bold" dir="ltr">{application.id}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <section className="mb-8">
          <p className="mb-2 text-xs font-bold tracking-[0.22em] text-[#B88716]">APPLICATION STATUS</p>
          <h2 className="text-3xl font-bold md:text-5xl">تابع حالة طلب الشراكة</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#66827C] md:text-base">
            يمكنك متابعة مراحل مراجعة واعتماد منشأتك، ومعرفة أي إجراء مطلوب منك حتى تفعيل حساب الشريك.
          </p>
        </section>

        <section className="mb-7 overflow-hidden rounded-[30px] border border-[#D9D6C9] bg-[#0D463D] p-6 text-white shadow-sm md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="mb-3 inline-flex rounded-full bg-[#D4A72C]/15 px-3 py-1 text-xs font-semibold text-[#F3CC63]">الحالة الحالية</div>
              <h3 className="text-3xl font-bold">{statusLabel(application.status)}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
                {application.status === "NEEDS_COMPLETION"
                  ? application.completionNotes || "يرجى استكمال البيانات أو المستندات المطلوبة."
                  : "طلبك حاليًا لدى فريق Arees Loop ضمن مسار المراجعة والاعتماد."}
              </p>
            </div>
            <div className="min-w-[210px] rounded-3xl bg-white/7 p-5">
              <p className="text-xs text-white/50">آخر تحديث</p>
              <p className="mt-2 text-sm font-semibold">{formatDateTime(application.updatedAt)}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-7 lg:grid-cols-[1.5fr_0.8fr]">
          <section className="rounded-[30px] border border-[#DDD9CC] bg-[#FCFBF7] p-6 md:p-8">
            <div className="mb-8">
              <p className="text-xs font-bold tracking-[0.2em] text-[#B88716]">APPROVAL JOURNEY</p>
              <h3 className="mt-2 text-2xl font-bold">مراحل اعتماد الشريك</h3>
            </div>

            <div>
              {steps.map((step, index) => {
                const completed = index < currentIndex;
                const current = index === currentIndex;
                const pending = index > currentIndex;

                return (
                  <div key={step.key} className="relative flex gap-4 pb-8">
                    {index !== steps.length - 1 && (
                      <div className={`absolute right-[19px] top-10 h-full w-[2px] ${completed ? "bg-[#B88716]" : "bg-[#DFDDD5]"}`} />
                    )}
                    <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                      completed
                        ? "border-[#B88716] bg-[#B88716] text-white"
                        : current
                        ? "border-[#0D463D] bg-[#0D463D] text-[#F1C34E]"
                        : "border-[#DDDAD0] bg-[#F5F3EC] text-[#9BAAA6]"
                    }`}>
                      {completed ? "✓" : index + 1}
                    </div>

                    <div className={`flex-1 rounded-2xl ${current ? "border border-[#0D463D]/10 bg-[#F1F5F2] p-4" : ""}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className={`font-bold ${pending ? "text-[#93A19E]" : "text-[#0D463D]"}`}>{step.title}</h4>
                        {current && (
                          <span className="rounded-full bg-[#E8D59A]/40 px-2.5 py-1 text-[10px] font-bold text-[#98700E]">المرحلة الحالية</span>
                        )}
                      </div>
                      <p className={`mt-1 text-sm leading-6 ${pending ? "text-[#ADB7B4]" : "text-[#728985]"}`}>{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="space-y-7">
            <section className="rounded-[30px] border border-[#DDD9CC] bg-[#FCFBF7] p-6">
              <p className="text-xs font-bold tracking-[0.18em] text-[#B88716]">APPLICATION</p>
              <h3 className="mt-2 text-xl font-bold">بيانات الطلب</h3>

              <div className="mt-6 space-y-5">
                <InfoRow label="اسم المنشأة" value={application.tradeNameAr || application.legalNameAr} />
                <InfoRow label="الاسم القانوني" value={application.legalNameAr} />
                <InfoRow label="التصنيف" value={category} />
                <InfoRow label="نوع الترخيص" value={license} />
                <InfoRow label="تاريخ التقديم" value={formatDate(application.submittedAt)} />
              </div>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-6 w-full rounded-2xl border border-[#0D463D]/15 px-4 py-3 text-sm font-bold transition hover:bg-[#F1F4EF]"
              >
                {showDetails ? "إخفاء التفاصيل" : "عرض تفاصيل الطلب"}
              </button>

              {showDetails && (
                <div className="mt-4 rounded-2xl bg-[#F2F1EA] p-4 text-sm leading-7 text-[#657D78]">
                  تم استلام بيانات الطلب وربط هذه الصفحة مباشرة ببيانات طلب الشراكة المحفوظة في Arees Loop.
                </div>
              )}
            </section>

            <section className="rounded-[30px] border border-[#E4D5A7] bg-[#FFF9E9] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4A72C]/15 font-bold text-[#A67B11]">!</div>
              <h3 className="mt-4 text-lg font-bold text-[#0D463D]">
                {application.status === "NEEDS_COMPLETION"
                  ? "مطلوب منك استكمال الطلب"
                  : "لا يوجد إجراء مطلوب منك الآن"}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[#71837E]">
                {application.status === "NEEDS_COMPLETION"
                  ? application.completionNotes ||
                    "راجع الملاحظات واستكمل البيانات المطلوبة."
                  : "سيظهر هنا أي مستند ناقص أو إجراء يحتاج إلى استكماله."}
              </p>

              {application.status === "NEEDS_COMPLETION" && (
                <Link
                  href="/partner/onboarding?resume=1"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-[#0D463D] px-4 py-3 text-sm font-bold text-white"
                >
                  استكمال الطلب الآن
                </Link>
              )}
            </section>

            <section className="rounded-[30px] bg-[#ECE9DE] p-6">
              <p className="text-xs font-semibold text-[#7D8D89]">الخطوة التالية</p>
              <h3 className="mt-2 text-lg font-bold">مراجعة الطلب ثم الاتفاقية</h3>
              <p className="mt-2 text-sm leading-7 text-[#71837E]">
                بعد اكتمال المراجعة الإدارية، تنتقل للاتفاقية الإلكترونية التي توضح العمولة والرسوم والشروط التجارية قبل قبول الشريك.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#0D463D]/8 pb-4 last:border-0 last:pb-0">
      <p className="text-xs text-[#8B9A96]">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-[#0D463D]">{value}</p>
    </div>
  );
}
