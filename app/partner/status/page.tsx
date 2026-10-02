"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type StatusKey =
  | "received"
  | "ai"
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
    key: "ai",
    title: "المراجعة الآلية",
    description: "يقوم الذكاء الاصطناعي بفحص اكتمال البيانات واتساق المستندات وإعداد تقرير المراجعة.",
  },
  {
    key: "review",
    title: "مراجعة أريس",
    description: "يراجع فريق Arees Loop تقرير الذكاء الاصطناعي والبيانات قبل الانتقال للاتفاقية.",
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
      return "ai";
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
    SUBMITTED: "المراجعة الآلية",
    UNDER_REVIEW: "لدى مراجعة أريس",
    NEEDS_COMPLETION: "مطلوب استكمال",
    PRE_APPROVED: "لدى مراجعة أريس",
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
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D463D] text-lg font-bold text-[#D4A72C]">∞</div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] text-[#B88716]">AREES LOOP PARTNER</p>
              <h1 className="mt-1 text-sm font-semibold text-[#0D463D]">بوابة الشركاء</h1>
            </div>
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
              <h3 className="mt-2 text-lg font-bold">مراجعة أريس ثم الاتفاقية</h3>
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
