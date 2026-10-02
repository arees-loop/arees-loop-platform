"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AgreementSection = {
  id: string;
  title: string;
  content: string[];
};

type AgreementData = {
  id: string;
  version: string;
  commissionRate: string | null;
  termsSnapshot: Record<string, unknown>;
  sentAt: string | null;
  acceptedAt: string | null;
  status: string;
};

type PartnerData = {
  id: string;
  status: string;
  legalNameAr: string;
  tradeNameAr: string | null;
  unifiedNumber?: string | null;
  commercialRegister?: string | null;
  mainContactName?: string | null;
  mainContactEmail?: string | null;
  mainContactPhone?: string | null;
  transferFee?: string | null;
};

const agreementSections: AgreementSection[] = [
  {
    id: "scope",
    title: "1. نطاق الاتفاقية",
    content: [
      "تتيح منصة Arees Loop للشريك عرض الخدمات والتجارب المعتمدة وحجزها من خلال المنصة وفق الأنشطة والتراخيص المعتمدة.",
      "لا يحق للشريك نشر أو بيع خدمة غير مغطاة بترخيص ساري ومعتمد لدى Arees Loop.",
      "اعتماد المنشأة لا يعني اعتماد جميع الخدمات تلقائيًا، ويخضع كل محتوى أو خدمة للمراجعة قبل النشر.",
    ],
  },
  {
    id: "commission",
    title: "2. العمولة والرسوم",
    content: [
      "تستحق Arees Loop العمولة التجارية المحددة في العرض التجاري عن كل عملية مؤهلة تتم من خلال المنصة.",
      "يتحمل الشريك رسوم معالجة الدفع الإلكتروني وفق وسيلة الدفع والتكلفة الفعلية أو النسبة المتفق عليها.",
      "تخصم رسوم التحويل البنكي من مستحقات التسوية وفق العرض التجاري المعتمد.",
      "يجوز تعديل الشروط التجارية فقط من خلال إصدار نسخة جديدة من الاتفاقية وموافقة الشريك عليها قبل سريان التعديل.",
    ],
  },
  {
    id: "settlements",
    title: "3. التسويات المالية",
    content: [
      "تتم التسويات وفق دورة التسوية المحددة في العرض التجاري بعد خصم العمولة والرسوم والاستردادات والتعديلات المستحقة.",
      "يتم التحويل إلى الحساب البنكي المعتمد والمسجل باسم المنشأة أو الحساب الذي تمت الموافقة عليه من Arees Loop.",
      "يظهر للشريك كشف تفصيلي لكل تسوية يوضح المبيعات والاستقطاعات والعمولات وصافي المبلغ المحول.",
    ],
  },
  {
    id: "invoicing",
    title: "4. الفوترة والمستندات المالية",
    content: [
      "يقر الشريك بصحة بياناته القانونية والضريبية المقدمة للمنصة ويتحمل مسؤولية تحديثها عند حدوث أي تغيير.",
      "يجوز لـ Arees Loop إصدار المستندات والفواتير إلكترونيًا نيابة عن الشريك وفق النموذج المعتمد والأنظمة المطبقة وبالبيانات الموثقة لدى المنصة.",
      "تحتفظ المنصة بسجل للعمليات والفواتير والتسويات لأغراض التشغيل والمراجعة والتدقيق.",
    ],
  },
  {
    id: "services",
    title: "5. الخدمات والحجوزات",
    content: [
      "يلتزم الشريك بتقديم الخدمة وفق الوصف والسعر والمواعيد والسياسات المنشورة والمعتمدة.",
      "يلتزم الشريك بتحديث السعة والتوفر والمواعيد ومنع قبول حجوزات لا يمكن تنفيذها.",
      "تتم معالجة الإلغاءات والاستردادات وفق سياسة الخدمة والاتفاقية التجارية المعتمدة.",
    ],
  },
  {
    id: "privacy",
    title: "6. البيانات والخصوصية",
    content: [
      "تستخدم بيانات العملاء فقط بالقدر اللازم لتنفيذ الخدمة وإدارة الحجز.",
      "يحظر استخدام بيانات العملاء للتسويق المباشر أو التواصل خارج أغراض الحجز دون أساس نظامي مناسب.",
      "يحظر على الشريك استخدام المنصة لتوجيه العملاء إلى قنوات بيع مباشرة بهدف تجاوز الحجز عبر Arees Loop.",
    ],
  },
  {
    id: "compliance",
    title: "7. الالتزام والتراخيص",
    content: [
      "يلتزم الشريك بالمحافظة على صلاحية جميع التراخيص والتصاريح اللازمة لنشاطه وخدماته.",
      "يحق لـ Arees Loop تعليق أي خدمة مرتبطة بترخيص منتهي أو غير صالح أو غير معتمد.",
      "يلتزم الشريك بإبلاغ المنصة بأي تغيير جوهري في بيانات المنشأة أو التراخيص أو البيانات المالية أو الضريبية.",
    ],
  },
  {
    id: "electronic",
    title: "8. الموافقة والتوقيع الإلكتروني",
    content: [
      "يقر المفوض بأن الموافقة الإلكترونية على هذه الاتفاقية تتم بصفته مخولًا بالتعاقد نيابة عن المنشأة.",
      "يتم تسجيل نسخة الاتفاقية وتاريخ ووقت الموافقة وهوية المستخدم وآثار التحقق الإلكتروني المرتبطة بعملية الموافقة.",
      "أي نسخة لاحقة من الاتفاقية أو الشروط التجارية تتطلب موافقة مستقلة قبل تطبيقها.",
    ],
  },
];

export default function PartnerAgreementPage() {
  const [partner, setPartner] =
    useState<PartnerData | null>(null);
  const [agreement, setAgreement] =
    useState<AgreementData | null>(null);
  const [agreementAccepted, setAgreementAccepted] =
    useState(false);
  const [authorityConfirmed, setAuthorityConfirmed] =
    useState(false);
  const [openSections, setOpenSections] =
    useState<string[]>(["scope", "commission"]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAgreement() {
      try {
        const response = await fetch(
          "/api/partner/agreement",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(
            payload.message ||
              "تعذر تحميل اتفاقية الشريك."
          );
        }

        if (!active) return;

        setPartner(payload.partner ?? null);
        setAgreement(payload.agreement ?? null);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "تعذر تحميل اتفاقية الشريك."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAgreement();

    return () => {
      active = false;
    };
  }, []);

  const toggleSection = (id: string) => {
    setOpenSections((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const acceptAgreement = async () => {
    if (
      !agreementAccepted ||
      !authorityConfirmed ||
      accepting
    ) {
      return;
    }

    setAccepting(true);
    setError("");

    try {
      const response = await fetch(
        "/api/partner/agreement",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            acceptedTerms: true,
            authorityConfirmed: true,
          }),
        }
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload.message ||
            "تعذر تسجيل قبول الاتفاقية."
        );
      }

      setPartner((current) =>
        current
          ? {
              ...current,
              status:
                payload.partner?.status ||
                "AGREEMENT_ACCEPTED",
            }
          : current
      );

      setAgreement((current) =>
        current
          ? {
              ...current,
              status:
                payload.agreement?.status ||
                "ACCEPTED",
              acceptedAt:
                payload.agreement?.acceptedAt ||
                new Date().toISOString(),
            }
          : current
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "تعذر تسجيل قبول الاتفاقية."
      );
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#F7F4EA] px-5 text-[#0D3B34]"
      >
        <p className="text-sm font-semibold">
          جاري تحميل الاتفاقية...
        </p>
      </main>
    );
  }

  if (error && !agreement) {
    return (
      <StateCard
        title="تعذر تحميل الاتفاقية"
        description={error}
      />
    );
  }

  if (!partner || !agreement) {
    return (
      <StateCard
        title="الاتفاقية غير جاهزة بعد"
        description="عند اكتمال مراجعة أريس وإرسال الاتفاقية ستظهر هنا تلقائياً."
      />
    );
  }

  const accepted =
    agreement.status === "ACCEPTED" ||
    partner.status === "AGREEMENT_ACCEPTED" ||
    partner.status === "APPROVED" ||
    partner.status === "ACTIVE";

  if (accepted) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#F7F4EA] px-5 py-12 text-[#0D3B34]"
        style={{
          fontFamily:
            "var(--font-ibm-plex-arabic), sans-serif",
        }}
      >
        <div className="mx-auto max-w-[760px]">
          <div className="rounded-[34px] border border-white/80 bg-white/80 p-8 text-center shadow-sm md:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F4EE] text-3xl font-bold text-[#267247]">
              ✓
            </div>

            <p className="mt-7 text-[10px] font-bold tracking-[0.22em] text-[#B99124]">
              AGREEMENT ACCEPTED
            </p>

            <h1 className="mt-3 text-3xl font-bold md:text-[40px]">
              تم قبول الاتفاقية إلكترونياً
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-8 text-[#0D3B34]/65">
              تم تسجيل قبول الشريك للاتفاقية والشروط
              التجارية. الطلب الآن بانتظار الاعتماد
              النهائي من Arees Loop.
            </p>

            <div className="mt-8 rounded-[24px] bg-[#F5F2E9] p-5 text-right">
              <InfoRow
                label="المنشأة"
                value={
                  partner.tradeNameAr ||
                  partner.legalNameAr
                }
              />
              <InfoRow
                label="نسخة الاتفاقية"
                value={agreement.version}
              />
              <InfoRow
                label="العمولة"
                value={
                  agreement.commissionRate
                    ? `${agreement.commissionRate}%`
                    : "—"
                }
              />
              <InfoRow
                label="الحالة"
                value={
                  partner.status === "ACTIVE"
                    ? "معتمد ونشط"
                    : "بانتظار الاعتماد النهائي"
                }
              />
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/partner/status"
                className="rounded-2xl bg-[#0D3B34] px-6 py-3.5 text-sm font-bold text-white"
              >
                متابعة حالة الطلب
              </Link>
              {partner.status === "ACTIVE" && (
                <Link
                  href="/partner/dashboard"
                  className="rounded-2xl border border-[#0D3B34]/10 bg-white px-6 py-3.5 text-sm font-bold"
                >
                  لوحة الشريك
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (
    partner.status !== "WAITING_AGREEMENT" ||
    agreement.status !== "SENT"
  ) {
    return (
      <StateCard
        title="الاتفاقية ليست بانتظار قبولك"
        description="تابع حالة طلب الشراكة لمعرفة المرحلة الحالية."
      />
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F7F4EA] text-[#0D3B34]"
      style={{
        fontFamily:
          "var(--font-ibm-plex-arabic), sans-serif",
      }}
    >
      <header className="border-b border-[#0D3B34]/8 bg-[#FAF8F1]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-[#B99124]">
              AREES LOOP PARTNER AGREEMENT
            </p>
            <h1 className="mt-1 text-lg font-bold">
              اتفاقية الشريك الإلكترونية
            </h1>
          </div>
          <Link
            href="/partner/status"
            className="rounded-full border border-[#0D3B34]/10 bg-white px-4 py-2 text-xs font-semibold"
          >
            حالة الطلب
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
        <section className="rounded-[32px] bg-[#0D3B34] p-6 text-white md:p-8">
          <p className="text-xs font-semibold text-[#E6C45D]">
            الاتفاقية المرسلة من Arees Loop
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            {partner.tradeNameAr ||
              partner.legalNameAr}
          </h2>
          <p className="mt-3 text-sm text-white/60">
            رقم الطلب:{" "}
            <span dir="ltr">{partner.id}</span>
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <TermCard
              label="نسخة الاتفاقية"
              value={agreement.version}
            />
            <TermCard
              label="عمولة المنصة"
              value={
                agreement.commissionRate
                  ? `${agreement.commissionRate}%`
                  : "—"
              }
            />
            <TermCard
              label="رسوم التحويل"
              value={
                partner.transferFee
                  ? `${partner.transferFee} ر.س`
                  : "حسب الاتفاقية"
              }
            />
          </div>
        </section>

        <div className="mt-7 grid gap-7 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="space-y-4">
            {agreementSections.map((section) => {
              const open =
                openSections.includes(section.id);

              return (
                <article
                  key={section.id}
                  className="overflow-hidden rounded-[26px] border border-[#DDD9CC] bg-white"
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleSection(section.id)
                    }
                    className="flex w-full items-center justify-between gap-4 p-5 text-right"
                  >
                    <span className="font-bold">
                      {section.title}
                    </span>
                    <span className="text-xl">
                      {open ? "−" : "+"}
                    </span>
                  </button>

                  {open && (
                    <div className="border-t border-[#0D3B34]/7 px-5 py-5">
                      <ul className="space-y-3 text-sm leading-7 text-[#5F7771]">
                        {section.content.map(
                          (paragraph) => (
                            <li
                              key={paragraph}
                              className="flex gap-3"
                            >
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B99124]" />
                              <span>
                                {paragraph}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </article>
              );
            })}
          </section>

          <aside className="h-fit rounded-[30px] border border-[#DDD9CC] bg-white p-6 lg:sticky lg:top-6">
            <p className="text-xs font-bold tracking-[0.18em] text-[#B99124]">
              ELECTRONIC ACCEPTANCE
            </p>
            <h3 className="mt-2 text-xl font-bold">
              القبول الإلكتروني
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#6D827D]">
              يتم تسجيل هوية المستخدم ووقت القبول
              وبيانات الجلسة في سجل التدقيق. لا يتم
              إرسال رسالة SMS إضافية لهذه الخطوة.
            </p>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-[#F7F5EE] p-4">
              <input
                type="checkbox"
                checked={agreementAccepted}
                onChange={(event) =>
                  setAgreementAccepted(
                    event.target.checked
                  )
                }
                className="mt-1"
              />
              <span className="text-sm leading-6">
                قرأت الاتفاقية والشروط التجارية
                وأوافق عليها.
              </span>
            </label>

            <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-2xl bg-[#F7F5EE] p-4">
              <input
                type="checkbox"
                checked={authorityConfirmed}
                onChange={(event) =>
                  setAuthorityConfirmed(
                    event.target.checked
                  )
                }
                className="mt-1"
              />
              <span className="text-sm leading-6">
                أؤكد أنني مخول بقبول الاتفاقية نيابة
                عن الشريك.
              </span>
            </label>

            {error && (
              <p className="mt-4 rounded-2xl bg-[#FFF0EE] p-3 text-xs font-semibold text-[#A33A32]">
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={
                !agreementAccepted ||
                !authorityConfirmed ||
                accepting
              }
              onClick={acceptAgreement}
              className="mt-5 w-full rounded-2xl bg-[#D4AF37] px-5 py-4 text-sm font-bold text-[#0D3B34] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {accepting
                ? "جارٍ تسجيل القبول..."
                : "قبول الاتفاقية إلكترونياً"}
            </button>

            <p className="mt-4 text-[11px] leading-6 text-[#7B8D89]">
              لن يتم تفعيل حساب الشريك بمجرد القبول؛
              يلزم الاعتماد النهائي من Arees Loop.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

function StateCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-[#F7F4EA] px-5 text-[#0D3B34]"
    >
      <div className="w-full max-w-xl rounded-[32px] border border-[#DDD9CC] bg-white p-8 text-center">
        <h1 className="text-2xl font-bold">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#71837E]">
          {description}
        </p>
        <Link
          href="/partner/status"
          className="mt-6 inline-flex rounded-2xl bg-[#0D3B34] px-5 py-3 text-sm font-bold text-white"
        >
          متابعة حالة الطلب
        </Link>
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
    <div className="border-b border-[#0D3B34]/8 py-3 first:pt-0 last:border-0 last:pb-0">
      <p className="text-xs text-[#84938F]">
        {label}
      </p>
      <p className="mt-1 font-semibold">
        {value}
      </p>
    </div>
  );
}

function TermCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/8 p-4">
      <p className="text-[11px] text-white/50">
        {label}
      </p>
      <p className="mt-1 font-bold text-[#F0D16F]">
        {value}
      </p>
    </div>
  );
}
