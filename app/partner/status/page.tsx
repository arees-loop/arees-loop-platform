"use client";

import { useMemo, useState } from "react";

type StatusKey =
  | "received"
  | "review"
  | "preapproved"
  | "agreement"
  | "accepted"
  | "final"
  | "active";

type Step = {
  key: StatusKey;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    key: "received",
    title: "تم استلام الطلب",
    description: "تم استلام بيانات المنشأة والمستندات بنجاح.",
  },
  {
    key: "review",
    title: "تحت التدقيق",
    description: "يقوم فريق Arees Loop بمراجعة البيانات والتراخيص والمرفقات.",
  },
  {
    key: "preapproved",
    title: "الموافقة المبدئية",
    description: "تم اجتياز التدقيق الأولي وتحديد الشروط التجارية.",
  },
  {
    key: "agreement",
    title: "بانتظار موافقتك على الاتفاقية",
    description: "راجع النسبة والرسوم والشروط قبل الموافقة الإلكترونية.",
  },
  {
    key: "accepted",
    title: "تمت الموافقة على الشروط",
    description: "تم تسجيل موافقتك الإلكترونية على الاتفاقية.",
  },
  {
    key: "final",
    title: "بانتظار الاعتماد النهائي",
    description: "الطلب جاهز للمراجعة والاعتماد النهائي من Arees Loop.",
  },
  {
    key: "active",
    title: "معتمد ونشط",
    description: "تم اعتماد المنشأة ويمكنك الآن إدارة خدماتك وطلباتك.",
  },
];

const currentStatus: StatusKey = "review";

export default function PartnerStatusPage() {
  const [showDetails, setShowDetails] = useState(false);

  const currentIndex = useMemo(
    () => steps.findIndex((step) => step.key === currentStatus),
    []
  );

  const application = {
    number: "AL-P-00001",
    businessName: "تجارب المدينة",
    legalName: "شركة تجارب المدينة السياحية المحدودة",
    submittedAt: "03 سبتمبر 2026",
    lastUpdate: "03 سبتمبر 2026 - 11:42 ص",
    category: "مزود تجربة أو نشاط",
    license: "ترخيص وزارة السياحة",
    status: "تحت التدقيق",
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F7F4EA] text-[#0D463D]"
      style={{ fontFamily: "var(--font-ibm-plex-arabic), sans-serif" }}
    >
      {/* HEADER */}
      <header className="border-b border-[#0D463D]/10 bg-[#FAF8F1]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D463D] text-lg font-bold text-[#D4A72C]">
              ∞
            </div>

            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] text-[#B88716]">
                AREES LOOP PARTNER
              </p>
              <h1 className="mt-1 text-sm font-semibold text-[#0D463D]">
                بوابة الشركاء
              </h1>
            </div>
          </div>

          <div className="rounded-full border border-[#0D463D]/10 bg-white px-4 py-2 text-xs">
            رقم الطلب:{" "}
            <span className="font-bold" dir="ltr">
              {application.number}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        {/* TITLE */}
        <section className="mb-8">
          <p className="mb-2 text-xs font-bold tracking-[0.22em] text-[#B88716]">
            APPLICATION STATUS
          </p>

          <h2 className="text-3xl font-bold md:text-5xl">
            تابع حالة طلب الشراكة
          </h2>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#66827C] md:text-base">
            يمكنك متابعة مراحل مراجعة واعتماد منشأتك، ومعرفة أي إجراء مطلوب
            منك حتى تفعيل حساب الشريك.
          </p>
        </section>

        {/* CURRENT STATUS */}
        <section className="mb-7 overflow-hidden rounded-[30px] border border-[#D9D6C9] bg-[#0D463D] p-6 text-white shadow-sm md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="mb-3 inline-flex rounded-full bg-[#D4A72C]/15 px-3 py-1 text-xs font-semibold text-[#F3CC63]">
                الحالة الحالية
              </div>

              <h3 className="text-3xl font-bold">{application.status}</h3>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
                طلبك حاليًا لدى فريق Arees Loop لمراجعة بيانات المنشأة،
                الترخيص، البيانات القانونية والبنكية والمستندات المرفقة.
              </p>
            </div>

            <div className="min-w-[210px] rounded-3xl bg-white/7 p-5">
              <p className="text-xs text-white/50">آخر تحديث</p>
              <p className="mt-2 text-sm font-semibold">
                {application.lastUpdate}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-7 lg:grid-cols-[1.5fr_0.8fr]">
          {/* TIMELINE */}
          <section className="rounded-[30px] border border-[#DDD9CC] bg-[#FCFBF7] p-6 md:p-8">
            <div className="mb-8">
              <p className="text-xs font-bold tracking-[0.2em] text-[#B88716]">
                APPROVAL JOURNEY
              </p>
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
                      <div
                        className={`absolute right-[19px] top-10 h-full w-[2px] ${
                          completed ? "bg-[#B88716]" : "bg-[#DFDDD5]"
                        }`}
                      />
                    )}

                    <div
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                        completed
                          ? "border-[#B88716] bg-[#B88716] text-white"
                          : current
                          ? "border-[#0D463D] bg-[#0D463D] text-[#F1C34E]"
                          : "border-[#DDDAD0] bg-[#F5F3EC] text-[#9BAAA6]"
                      }`}
                    >
                      {completed ? "✓" : index + 1}
                    </div>

                    <div
                      className={`flex-1 rounded-2xl ${
                        current
                          ? "border border-[#0D463D]/10 bg-[#F1F5F2] p-4"
                          : ""
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className={`font-bold ${
                            pending ? "text-[#93A19E]" : "text-[#0D463D]"
                          }`}
                        >
                          {step.title}
                        </h4>

                        {current && (
                          <span className="rounded-full bg-[#E8D59A]/40 px-2.5 py-1 text-[10px] font-bold text-[#98700E]">
                            المرحلة الحالية
                          </span>
                        )}
                      </div>

                      <p
                        className={`mt-1 text-sm leading-6 ${
                          pending ? "text-[#ADB7B4]" : "text-[#728985]"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* APPLICATION SUMMARY */}
          <aside className="space-y-7">
            <section className="rounded-[30px] border border-[#DDD9CC] bg-[#FCFBF7] p-6">
              <p className="text-xs font-bold tracking-[0.18em] text-[#B88716]">
                APPLICATION
              </p>
              <h3 className="mt-2 text-xl font-bold">بيانات الطلب</h3>

              <div className="mt-6 space-y-5">
                <InfoRow label="اسم المنشأة" value={application.businessName} />
                <InfoRow label="الاسم القانوني" value={application.legalName} />
                <InfoRow label="التصنيف" value={application.category} />
                <InfoRow label="نوع الترخيص" value={application.license} />
                <InfoRow
                  label="تاريخ التقديم"
                  value={application.submittedAt}
                />
              </div>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-6 w-full rounded-2xl border border-[#0D463D]/15 px-4 py-3 text-sm font-bold transition hover:bg-[#F1F4EF]"
              >
                {showDetails ? "إخفاء التفاصيل" : "عرض تفاصيل الطلب"}
              </button>

              {showDetails && (
                <div className="mt-4 rounded-2xl bg-[#F2F1EA] p-4 text-sm leading-7 text-[#657D78]">
                  تم استلام البيانات الأساسية، بيانات المنشأة، الترخيص،
                  المعلومات القانونية، معلومات التواصل، البيانات البنكية
                  والمستندات المطلوبة.
                </div>
              )}
            </section>

            {/* REQUIRED ACTION */}
            <section className="rounded-[30px] border border-[#E4D5A7] bg-[#FFF9E9] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4A72C]/15 font-bold text-[#A67B11]">
                !
              </div>

              <h3 className="mt-4 text-lg font-bold text-[#0D463D]">
                لا يوجد إجراء مطلوب منك الآن
              </h3>

              <p className="mt-2 text-sm leading-7 text-[#71837E]">
                الطلب تحت التدقيق. سنظهر هنا أي مستند ناقص أو إجراء يحتاج
                إلى استكماله.
              </p>
            </section>

            {/* NEXT STAGE */}
            <section className="rounded-[30px] bg-[#ECE9DE] p-6">
              <p className="text-xs font-semibold text-[#7D8D89]">
                الخطوة التالية
              </p>

              <h3 className="mt-2 text-lg font-bold">
                الموافقة المبدئية والشروط التجارية
              </h3>

              <p className="mt-2 text-sm leading-7 text-[#71837E]">
                بعد اكتمال التدقيق ستظهر لك النسبة المتفق عليها، الرسوم
                والشروط التجارية والاتفاقية الإلكترونية للمراجعة والموافقة.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-[#0D463D]/8 pb-4 last:border-0 last:pb-0">
      <p className="text-xs text-[#8B9A96]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#0D463D]">{value}</p>
    </div>
  );
}