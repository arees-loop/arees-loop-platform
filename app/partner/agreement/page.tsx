"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type AgreementStatus =
  | "READY"
  | "OTP_SENT"
  | "SIGNED"
  | "PENDING_FINAL_APPROVAL";

type AgreementSection = {
  id: string;
  title: string;
  content: string[];
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
  const [status, setStatus] = useState<AgreementStatus>("READY");
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [authorityConfirmed, setAuthorityConfirmed] = useState(false);
  const [otp, setOtp] = useState("");
  const [openSections, setOpenSections] = useState<string[]>([
    "scope",
    "commission",
  ]);

  const partner = {
    applicationNumber: "AL-P-00001",
    tradeName: "تجارب المدينة",
    legalName: "شركة تجارب المدينة السياحية المحدودة",
    unifiedNumber: "7037003618",
    crNumber: "4650123456",
    representative: "محمد أحمد",
    representativePhone: "+966 55 123 4567",
    representativeEmail: "admin@example.sa",
  };

  const commercialTerms = {
    commissionRate: 10,
    paymentProcessing: "يتحملها الشريك حسب التكلفة الفعلية",
    settlementFee: 1,
    settlementCycle: "كل 7 أيام",
    currency: "SAR",
    agreementVersion: "AL-PA-v1.0",
    effectiveDate: "بعد الاعتماد النهائي",
  };

  const canSign = agreementAccepted && authorityConfirmed;

  const progress = useMemo(() => {
    if (status === "READY") return 50;
    if (status === "OTP_SENT") return 75;
    if (
      status === "SIGNED" ||
      status === "PENDING_FINAL_APPROVAL"
    )
      return 100;

    return 50;
  }, [status]);

  const toggleSection = (id: string) => {
    setOpenSections((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const sendOtp = () => {
    if (!canSign) return;

    setStatus("OTP_SENT");
  };

  const signAgreement = () => {
    if (otp.length !== 6) return;

    setStatus("PENDING_FINAL_APPROVAL");
  };

  if (status === "PENDING_FINAL_APPROVAL") {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#F7F4EA] px-5 py-12 text-[#0D3B34]"
        style={{
          fontFamily: "var(--font-ibm-plex-arabic), sans-serif",
        }}
      >
        <div className="mx-auto max-w-[760px]">
          <div className="rounded-[34px] border border-white/80 bg-white/75 p-8 text-center backdrop-blur-xl md:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F4EE] text-3xl font-bold text-[#267247]">
              ✓
            </div>

            <p className="mt-7 text-[10px] font-bold tracking-[0.22em] text-[#B99124]">
              AGREEMENT ACCEPTED
            </p>

            <h1
              className="mt-3 text-3xl font-bold md:text-[40px]"
              style={{
                fontFamily: "var(--font-el-messiri), serif",
              }}
            >
              تمت الموافقة على الشروط
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-8 text-[#0D3B34]/65">
              تم تسجيل موافقتك الإلكترونية على اتفاقية الشريك والشروط
              التجارية بنجاح. طلبك الآن بانتظار الاعتماد النهائي من
              Arees Loop.
            </p>

            <div className="mt-8 rounded-[24px] bg-[#F5F2E9] p-5 text-right">
              <InfoRow
                label="المنشأة"
                value={partner.legalName}
              />

              <InfoRow
                label="نسخة الاتفاقية"
                value={commercialTerms.agreementVersion}
              />

              <InfoRow
                label="العمولة المعتمدة"
                value={`${commercialTerms.commissionRate}%`}
              />

              <InfoRow
                label="الحالة"
                value="بانتظار الاعتماد النهائي"
              />
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <StatusCard
                number="01"
                label="التدقيق"
                completed
              />

              <StatusCard
                number="02"
                label="الاتفاقية"
                completed
              />

              <StatusCard
                number="03"
                label="الاعتماد النهائي"
                active
              />
            </div>

            <Link
              href="/partner/status"
              className="mt-8 inline-flex rounded-2xl bg-[#0D3B34] px-6 py-3.5 text-sm font-bold text-white"
            >
              متابعة حالة الطلب
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F7F4EA] text-[#0D3B34]"
      style={{
        fontFamily: "var(--font-ibm-plex-arabic), sans-serif",
      }}
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-[#0D3B34]/6 blur-[120px]" />
        <div className="absolute -left-32 top-[42%] h-[430px] w-[430px] rounded-full bg-[#D4AF37]/10 blur-[115px]" />
      </div>

      {/* HEADER */}
      <header className="relative z-40 border-b border-[#0D3B34]/8 bg-[#F9F6EF]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between px-5 py-5 md:px-8">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-[#B99124]">
              AREES LOOP PARTNER
            </p>

            <p className="mt-1 text-sm font-bold">
              الاتفاقية الإلكترونية
            </p>
          </div>

          <Link
            href="/partner/status"
            className="rounded-full border border-[#0D3B34]/10 bg-white px-4 py-2.5 text-xs font-semibold text-[#0D3B34]/70"
          >
            حالة الطلب
          </Link>
        </div>
      </header>

      {/* PROGRESS */}
      <div className="relative z-20 border-b border-[#0D3B34]/6 bg-white/30">
        <div className="mx-auto max-w-[1100px] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#0D3B34]/45">
                مرحلة الاتفاقية
              </p>

              <p className="mt-1 text-sm font-bold">
                مراجعة الشروط والتوقيع الإلكتروني
              </p>
            </div>

            <span className="text-lg font-bold text-[#B99124]">
              {progress}%
            </span>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#0D3B34]/8">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[#D4AF37] to-[#0D3B34] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
        {/* PAGE TITLE */}
        <section className="mb-8">
          <p className="text-[10px] font-bold tracking-[0.22em] text-[#B99124]">
            PARTNER AGREEMENT
          </p>

          <h1
            className="mt-2 text-3xl font-bold md:text-[46px]"
            style={{
              fontFamily: "var(--font-el-messiri), serif",
            }}
          >
            العرض التجاري واتفاقية الشريك
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-8 text-[#0D3B34]/60">
            راجع الشروط التجارية والاتفاقية بعناية قبل تسجيل موافقتك
            الإلكترونية. لا يتم تفعيل حساب الشريك إلا بعد الاعتماد
            النهائي من Arees Loop.
          </p>
        </section>

        <div className="grid gap-7 xl:grid-cols-[1fr_0.42fr]">
          {/* AGREEMENT */}
          <section className="space-y-6">
            {/* COMMERCIAL TERMS */}
            <div className="rounded-[30px] border border-[#D4AF37]/25 bg-gradient-to-br from-[#FFFDF7] to-[#F6EFDC] p-6 md:p-8">
              <div className="mb-6">
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#B99124]">
                  COMMERCIAL TERMS
                </p>

                <h2
                  className="mt-2 text-2xl font-bold"
                  style={{
                    fontFamily: "var(--font-el-messiri), serif",
                  }}
                >
                  الشروط التجارية المعتمدة
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <CommercialCard
                  label="عمولة Arees Loop"
                  value={`${commercialTerms.commissionRate}%`}
                  important
                />

                <CommercialCard
                  label="رسوم التحويل"
                  value={`${commercialTerms.settlementFee} ريال`}
                />

                <CommercialCard
                  label="دورة التسوية"
                  value={commercialTerms.settlementCycle}
                />

                <CommercialCard
                  label="العملة"
                  value={commercialTerms.currency}
                />
              </div>

              <div className="mt-5 rounded-[20px] border border-[#0D3B34]/8 bg-white/70 p-4">
                <p className="text-[10px] font-semibold text-[#0D3B34]/45">
                  رسوم معالجة الدفع
                </p>

                <p className="mt-2 text-sm font-bold text-[#0D3B34]/75">
                  {commercialTerms.paymentProcessing}
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <MiniInfo
                  label="نسخة الاتفاقية"
                  value={commercialTerms.agreementVersion}
                />

                <MiniInfo
                  label="تاريخ السريان"
                  value={commercialTerms.effectiveDate}
                />
              </div>
            </div>

            {/* AGREEMENT TEXT */}
            <div className="rounded-[30px] border border-[#0D3B34]/8 bg-white/72 p-6 backdrop-blur-xl md:p-8">
              <div className="mb-6">
                <p className="text-[10px] font-bold tracking-[0.18em] text-[#B99124]">
                  AGREEMENT TERMS
                </p>

                <h2
                  className="mt-2 text-2xl font-bold"
                  style={{
                    fontFamily: "var(--font-el-messiri), serif",
                  }}
                >
                  بنود اتفاقية الشريك
                </h2>

                <p className="mt-3 text-sm leading-7 text-[#0D3B34]/55">
                  نسخة تشغيلية أولية للمنصة. الصياغة القانونية النهائية
                  يتم اعتمادها قبل الإطلاق التجاري.
                </p>
              </div>

              <div className="space-y-3">
                {agreementSections.map((section) => {
                  const open = openSections.includes(section.id);

                  return (
                    <div
                      key={section.id}
                      className="overflow-hidden rounded-[22px] border border-[#0D3B34]/8 bg-[#FAF9F5]"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right"
                      >
                        <span className="font-bold">
                          {section.title}
                        </span>

                        <span
                          className={`text-[#B99124] transition ${
                            open ? "rotate-180" : ""
                          }`}
                        >
                          ⌄
                        </span>
                      </button>

                      {open && (
                        <div className="border-t border-[#0D3B34]/7 px-5 py-5">
                          <div className="space-y-3">
                            {section.content.map((paragraph) => (
                              <div
                                key={paragraph}
                                className="flex items-start gap-3 text-sm leading-7 text-[#0D3B34]/65"
                              >
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4AF37]" />

                                <p>{paragraph}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ACCEPTANCE */}
            <div className="rounded-[30px] border border-[#0D3B34]/8 bg-white/75 p-6 backdrop-blur-xl md:p-8">
              <p className="text-[10px] font-bold tracking-[0.18em] text-[#B99124]">
                ELECTRONIC ACCEPTANCE
              </p>

              <h2
                className="mt-2 text-2xl font-bold"
                style={{
                  fontFamily: "var(--font-el-messiri), serif",
                }}
              >
                الموافقة والتوقيع الإلكتروني
              </h2>

              <div className="mt-6 space-y-4">
                <AgreementCheck
                  checked={agreementAccepted}
                  onChange={setAgreementAccepted}
                  text="قرأت وفهمت اتفاقية الشريك والشروط التجارية الموضحة أعلاه، وأوافق عليها بالنسخة الحالية."
                />

                <AgreementCheck
                  checked={authorityConfirmed}
                  onChange={setAuthorityConfirmed}
                  text="أؤكد أن لدي الصلاحية النظامية للموافقة على هذه الاتفاقية والتعاقد نيابةً عن المنشأة."
                />
              </div>

              {status === "READY" && (
                <button
                  type="button"
                  disabled={!canSign}
                  onClick={sendOtp}
                  className="mt-6 w-full rounded-2xl bg-[#0D3B34] px-6 py-4 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-35"
                >
                  متابعة للتوقيع الإلكتروني
                </button>
              )}

              {status === "OTP_SENT" && (
                <div className="mt-6 rounded-[24px] border border-[#D4AF37]/25 bg-[#FFF9EA] p-5">
                  <p className="text-sm font-bold">
                    تحقق من هوية المفوض
                  </p>

                  <p className="mt-2 text-xs leading-6 text-[#0D3B34]/55">
                    تم إرسال رمز تحقق تجريبي إلى رقم الجوال الموثق:
                  </p>

                  <p
                    className="mt-1 text-sm font-bold"
                    dir="ltr"
                  >
                    {partner.representativePhone}
                  </p>

                  <div className="mt-5">
                    <label className="text-xs font-semibold text-[#0D3B34]/65">
                      رمز التحقق
                    </label>

                    <input
                      value={otp}
                      onChange={(event) =>
                        setOtp(
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6)
                        )
                      }
                      placeholder="••••••"
                      dir="ltr"
                      className="mt-2 h-14 w-full rounded-2xl border border-[#0D3B34]/10 bg-white px-4 text-center text-xl font-bold tracking-[0.35em] outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={otp.length !== 6}
                    onClick={signAgreement}
                    className="mt-4 w-full rounded-2xl bg-[#D4AF37] px-6 py-4 text-sm font-bold text-[#0D3B34] transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    أوافق وأوقّع إلكترونيًا
                  </button>

                  <p className="mt-3 text-center text-[10px] text-[#0D3B34]/40">
                    النموذج الحالي تجريبي — استخدم أي 6 أرقام.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* SIDEBAR */}
          <aside className="space-y-5">
            <div className="rounded-[28px] border border-[#0D3B34]/8 bg-white/72 p-6 backdrop-blur-xl">
              <p className="text-[10px] font-bold tracking-[0.18em] text-[#B99124]">
                PARTNER
              </p>

              <h3 className="mt-2 text-xl font-bold">
                {partner.tradeName}
              </h3>

              <p className="mt-1 text-xs leading-6 text-[#0D3B34]/50">
                {partner.legalName}
              </p>

              <div className="mt-6 space-y-4">
                <InfoRow
                  label="رقم الطلب"
                  value={partner.applicationNumber}
                />

                <InfoRow
                  label="الرقم الموحد"
                  value={partner.unifiedNumber}
                />

                <InfoRow
                  label="السجل التجاري"
                  value={partner.crNumber}
                />

                <InfoRow
                  label="المفوض"
                  value={partner.representative}
                />
              </div>
            </div>

            <div className="rounded-[28px] bg-[#0D3B34] p-6 text-white">
              <p className="text-[10px] font-bold tracking-[0.18em] text-[#E7C24B]">
                AGREEMENT RECORD
              </p>

              <h3 className="mt-2 text-lg font-bold">
                سجل الموافقة
              </h3>

              <div className="mt-5 space-y-4">
                <DarkInfo
                  label="نسخة الاتفاقية"
                  value={commercialTerms.agreementVersion}
                />

                <DarkInfo
                  label="البريد الموثق"
                  value={partner.representativeEmail}
                />

                <DarkInfo
                  label="الجوال الموثق"
                  value={partner.representativePhone}
                />

                <DarkInfo
                  label="حالة التوقيع"
                  value={
                    status === "OTP_SENT"
                      ? "بانتظار رمز التحقق"
                      : "لم يتم التوقيع بعد"
                  }
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-[#D4AF37]/22 bg-[#FFF9E8] p-6">
              <p className="text-sm font-bold">
                بعد توقيع الاتفاقية
              </p>

              <p className="mt-2 text-xs leading-6 text-[#0D3B34]/58">
                تنتقل حالة الطلب إلى «بانتظار الاعتماد النهائي». بعد
                اعتماد Arees Loop يتم فتح لوحة الشريك وإتاحة إضافة
                الخدمات والتجارب.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function CommercialCard({
  label,
  value,
  important = false,
}: {
  label: string;
  value: string;
  important?: boolean;
}) {
  return (
    <div
      className={`rounded-[22px] border p-5 ${
        important
          ? "border-[#D4AF37]/35 bg-[#0D3B34] text-white"
          : "border-[#0D3B34]/8 bg-white/75"
      }`}
    >
      <p
        className={`text-[10px] ${
          important
            ? "text-white/50"
            : "text-[#0D3B34]/45"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-bold ${
          important ? "text-[#F1C94C]" : "text-[#0D3B34]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MiniInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#0D3B34]/7 bg-white/60 px-4 py-3">
      <p className="text-[10px] text-[#0D3B34]/40">
        {label}
      </p>

      <p className="mt-1 text-xs font-bold">
        {value}
      </p>
    </div>
  );
}

function AgreementCheck({
  checked,
  onChange,
  text,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  text: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-[22px] border border-[#0D3B34]/8 bg-[#FAF9F5] p-5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="mt-1 h-4 w-4 accent-[#0D3B34]"
      />

      <span className="text-sm leading-7 text-[#0D3B34]/70">
        {text}
      </span>
    </label>
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
    <div className="border-b border-[#0D3B34]/7 pb-4 last:border-0 last:pb-0">
      <p className="text-[10px] text-[#0D3B34]/42">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-[#0D3B34]/75">
        {value}
      </p>
    </div>
  );
}

function DarkInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
      <p className="text-[10px] text-white/40">
        {label}
      </p>

      <p className="mt-1 break-words text-xs font-semibold text-white/75">
        {value}
      </p>
    </div>
  );
}

function StatusCard({
  number,
  label,
  completed = false,
  active = false,
}: {
  number: string;
  label: string;
  completed?: boolean;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border p-4 ${
        completed
          ? "border-[#267247]/20 bg-[#EAF5EE]"
          : active
          ? "border-[#D4AF37]/35 bg-[#FFF8E4]"
          : "border-[#0D3B34]/7 bg-[#F8F7F3]"
      }`}
    >
      <p
        className={`text-[10px] font-bold ${
          completed
            ? "text-[#267247]"
            : active
            ? "text-[#B99124]"
            : "text-[#0D3B34]/35"
        }`}
      >
        {completed ? "✓" : number}
      </p>

      <p className="mt-2 text-xs font-bold">
        {label}
      </p>
    </div>
  );
}