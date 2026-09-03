"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type StepId =
  | "email"
  | "phone"
  | "account"
  | "business"
  | "category"
  | "sales"
  | "legal"
  | "licenses"
  | "tax"
  | "bank"
  | "contacts"
  | "brand"
  | "review"
  | "done";

type License = {
  id: number;
  type: string;
  issuer: string;
  customIssuer: string;
  number: string;
  issueDate: string;
  expiryDate: string;
  coveredActivities: string[];
  fileName: string;
};

type FormData = {
  email: string;
  emailOtp: string;
  phone: string;
  phoneOtp: string;

  firstName: string;
  lastName: string;
  jobTitle: string;

  tradeName: string;
  entityType: string;
  proofType: string;

  categories: string[];
  subCategories: string[];

  sellsOnline: boolean;
  hasPhysicalLocation: boolean;
  branches: string;
  website: string;
  socialAccount: string;
  city: string;
  serviceArea: string;

  unifiedNumber: string;
  crNumber: string;
  legalNameAr: string;
  legalNameEn: string;
  legalAddress: string;

  vatRegistered: boolean;
  vatNumber: string;
  vatCertificate: string;

  iban: string;
  bankName: string;
  swift: string;
  beneficiaryName: string;
  currency: string;
  ibanCertificate: string;

  financeName: string;
  financeTitle: string;
  financeEmail: string;
  financePhone: string;

  operationsName: string;
  operationsTitle: string;
  operationsEmail: string;
  operationsPhone: string;

  publicName: string;
  logoFile: string;

  declaration: boolean;
  termsAccepted: boolean;
};

const steps: { id: StepId; title: string }[] = [
  { id: "email", title: "تحقق البريد الإلكتروني" },
  { id: "phone", title: "تحقق رقم الجوال" },
  { id: "account", title: "بيانات صاحب الحساب" },
  { id: "business", title: "أساسيات المنشأة" },
  { id: "category", title: "الأنشطة والتصنيفات" },
  { id: "sales", title: "طريقة تقديم الخدمة" },
  { id: "legal", title: "البيانات القانونية" },
  { id: "licenses", title: "التراخيص وربط الأنشطة" },
  { id: "tax", title: "البيانات الضريبية" },
  { id: "bank", title: "التفاصيل البنكية" },
  { id: "contacts", title: "جهات التواصل" },
  { id: "brand", title: "هوية الظهور" },
  { id: "review", title: "مراجعة الطلب" },
];

const categories: Record<string, string[]> = {
  "وكالات سفر وسياحة": [
    "حجوزات السفر",
    "حجوزات الطيران",
    "حجوزات الفنادق",
    "خدمات التأشيرات",
    "خدمات سياحية متنوعة",
  ],

  "خدمات سفر وسياحة (عام)": [
    "خدمات حجز",
    "خدمات استقبال",
    "خدمات مساندة للمسافر",
    "خدمات سياحية عامة",
  ],

  "تنظيم الرحلات السياحية": [
    "جولات يومية",
    "برامج سياحية",
    "رحلات داخلية",
    "رحلات جماعية",
    "برامج خاصة",
  ],

  "حجز وحدات الضيافة": [
    "فنادق",
    "شقق مخدومة",
    "منتجعات",
    "نزل",
    "وحدات ضيافة أخرى",
  ],

  "مرشد سياحي": [
    "مرشد موقع",
    "مرشد مسار",
    "مرشد متخصص",
  ],

  "مزود تجربة أو نشاط": [
    "تجربة ثقافية",
    "تجربة تراثية",
    "تجربة مغامرات",
    "نشاط ترفيهي",
    "تجربة طعام",
    "تجربة تعليمية",
  ],

  "وجهة أو موقع سياحي": [
    "متحف",
    "مركز زوار",
    "موقع تراثي",
    "معلم سياحي",
    "وجهة ترفيهية",
    "موقع طبيعي",
  ],

  "خدمات نقل": [
    "نقل أفراد",
    "نقل مجموعات",
    "تنقل بين المدن",
    "نقل سياحي",
    "خدمة سائق",
  ],

  "إيواء سياحي": [
    "فندق",
    "منتجع",
    "شقق مخدومة",
    "نزل",
    "مخيم سياحي",
  ],

  "مطعم أو مقهى": [
    "مطعم",
    "مقهى",
    "تجربة طعام",
    "مأكولات محلية",
  ],

  "فعاليات وترفيه": [
    "فعالية",
    "مهرجان",
    "عرض ترفيهي",
    "نشاط عائلي",
    "نشاط موسمي",
  ],

  "متجر أو نشاط للزائر": [
    "هدايا",
    "منتجات محلية",
    "تجزئة",
    "منتجات تراثية",
  ],
};

const initialData: FormData = {
  email: "",
  emailOtp: "",
  phone: "",
  phoneOtp: "",

  firstName: "",
  lastName: "",
  jobTitle: "",

  tradeName: "",
  entityType: "",
  proofType: "",

  categories: [],
  subCategories: [],

  sellsOnline: false,
  hasPhysicalLocation: true,
  branches: "1",
  website: "",
  socialAccount: "",
  city: "",
  serviceArea: "",

  unifiedNumber: "",
  crNumber: "",
  legalNameAr: "",
  legalNameEn: "",
  legalAddress: "",

  vatRegistered: false,
  vatNumber: "",
  vatCertificate: "",

  iban: "",
  bankName: "",
  swift: "",
  beneficiaryName: "",
  currency: "SAR",
  ibanCertificate: "",

  financeName: "",
  financeTitle: "",
  financeEmail: "",
  financePhone: "",

  operationsName: "",
  operationsTitle: "",
  operationsEmail: "",
  operationsPhone: "",

  publicName: "",
  logoFile: "",

  declaration: false,
  termsAccepted: false,
};

export default function PartnerOnboardingPage() {
  const [currentStep, setCurrentStep] = useState<StepId>("email");
  const [data, setData] = useState<FormData>(initialData);

  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);

  const [licenses, setLicenses] = useState<License[]>([
    {
      id: 1,
      type: "",
      issuer: "",
      customIssuer: "",
      number: "",
      issueDate: "",
      expiryDate: "",
      coveredActivities: [],
      fileName: "",
    },
  ]);

  const activeIndex = useMemo(
    () => steps.findIndex((step) => step.id === currentStep),
    [currentStep]
  );

  const progress = useMemo(() => {
    if (currentStep === "done") return 100;

    return Math.max(
      5,
      Math.round(((activeIndex + 1) / steps.length) * 100)
    );
  }, [activeIndex, currentStep]);

  const availableSubCategories = useMemo(() => {
    return Array.from(
      new Set(
        data.categories.flatMap((category) => categories[category] || [])
      )
    );
  }, [data.categories]);

  const update = <K extends keyof FormData>(
    key: K,
    value: FormData[K]
  ) => {
    setData((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const toggleCategory = (category: string) => {
    setData((current) => {
      const selected = current.categories.includes(category);

      const nextCategories = selected
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category];

      const allowedSubCategories = new Set(
        nextCategories.flatMap((item) => categories[item] || [])
      );

      setLicenses((currentLicenses) =>
        currentLicenses.map((license) => ({
          ...license,
          coveredActivities: license.coveredActivities.filter((item) =>
            nextCategories.includes(item)
          ),
        }))
      );

      return {
        ...current,
        categories: nextCategories,
        subCategories: current.subCategories.filter((item) =>
          allowedSubCategories.has(item)
        ),
      };
    });
  };

  const toggleSubCategory = (subCategory: string) => {
    setData((current) => ({
      ...current,
      subCategories: current.subCategories.includes(subCategory)
        ? current.subCategories.filter((item) => item !== subCategory)
        : [...current.subCategories, subCategory],
    }));
  };

  const next = () => {
    const index = steps.findIndex((step) => step.id === currentStep);

    if (index >= 0 && index < steps.length - 1) {
      setCurrentStep(steps[index + 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const back = () => {
    const index = steps.findIndex((step) => step.id === currentStep);

    if (index > 0) {
      setCurrentStep(steps[index - 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const addLicense = () => {
    setLicenses((current) => [
      ...current,
      {
        id: Date.now(),
        type: "",
        issuer: "",
        customIssuer: "",
        number: "",
        issueDate: "",
        expiryDate: "",
        coveredActivities: [],
        fileName: "",
      },
    ]);
  };

  const updateLicense = (
    id: number,
    key: keyof License,
    value: string
  ) => {
    setLicenses((current) =>
      current.map((license) =>
        license.id === id
          ? {
              ...license,
              [key]: value,
            }
          : license
      )
    );
  };

  const toggleLicenseActivity = (
    licenseId: number,
    activity: string
  ) => {
    setLicenses((current) =>
      current.map((license) => {
        if (license.id !== licenseId) return license;

        const selected =
          license.coveredActivities.includes(activity);

        return {
          ...license,
          coveredActivities: selected
            ? license.coveredActivities.filter(
                (item) => item !== activity
              )
            : [...license.coveredActivities, activity],
        };
      })
    );
  };

  const removeLicense = (id: number) => {
    if (licenses.length === 1) return;

    setLicenses((current) =>
      current.filter((license) => license.id !== id)
    );
  };

  const simulateBusinessLookup = () => {
    if (!data.unifiedNumber && !data.crNumber) return;

    update(
      "legalNameAr",
      data.tradeName || "اسم المنشأة وفق السجل التجاري"
    );

    update(
      "legalNameEn",
      data.tradeName
        ? `${data.tradeName} Company`
        : "Verified Legal Business Name"
    );

    update(
      "legalAddress",
      "المدينة المنورة - المملكة العربية السعودية"
    );
  };

  const simulateIbanLookup = () => {
    const clean = data.iban.replace(/\s+/g, "").toUpperCase();

    if (clean.startsWith("SA80")) {
      update("bankName", "مصرف الراجحي");
      update("swift", "RJHISARIXXX");
    } else if (clean.startsWith("SA")) {
      update("bankName", "تم التعرف على البنك");
      update("swift", "BANKSARIXXX");
    }
  };

  const submitApplication = () => {
    if (!data.declaration || !data.termsAccepted) return;

    setCurrentStep("done");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[#F5F1E8] text-[#0D3B34]"
      style={{
        fontFamily: "var(--font-ibm-plex-arabic), sans-serif",
      }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 top-16 h-[560px] w-[560px] rounded-full bg-[#0D3B34]/6 blur-[120px]" />
        <div className="absolute -left-40 top-[38%] h-[480px] w-[480px] rounded-full bg-[#D4AF37]/10 blur-[120px]" />
        <div className="absolute bottom-[-180px] right-[25%] h-[520px] w-[520px] rounded-full bg-[#B99124]/6 blur-[130px]" />
      </div>

      <header className="relative z-40 border-b border-[#0D3B34]/7 bg-[#F9F6EF]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1420px] items-center justify-between px-5 py-4 md:px-8">
          <Link href="/">
            <Image
              src="/Logo/arees-loop-logo.png"
              alt="Arees Loop"
              width={120}
              height={60}
              className="h-auto w-[105px] object-contain"
              priority
            />
          </Link>

          <div className="hidden text-center md:block">
            <p className="text-[9px] font-bold tracking-[0.22em] text-[#B99124]">
              AREES LOOP PARTNERS
            </p>

            <p className="mt-1 text-xs font-semibold text-[#0D3B34]/60">
              بوابة تسجيل الشركاء ومزودي الخدمات
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full border border-[#0D3B34]/10 bg-white/65 px-4 py-2.5 text-xs font-semibold text-[#0D3B34]/70"
          >
            العودة للمنصة
          </Link>
        </div>
      </header>

      {currentStep !== "done" && (
        <div className="relative z-20 border-b border-[#0D3B34]/5 bg-white/28">
          <div className="mx-auto max-w-[1050px] px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-[#0D3B34]/45">
                  تقدم طلب الانضمام
                </p>

                <p className="mt-1 text-sm font-bold">
                  {steps[activeIndex]?.title}
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
      )}

      <div className="relative z-10 mx-auto max-w-[980px] px-5 py-10 md:px-8 md:py-14">
        {currentStep === "email" && (
          <StepCard
            eyebrow="STEP 01"
            title="ابدأ ببريدك الإلكتروني"
            description="سنستخدم البريد لإنشاء حساب الشريك وإرسال الإشعارات المتعلقة بطلب الانضمام."
          >
            <Field label="البريد الإلكتروني">
              <input
                type="email"
                value={data.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="name@company.com"
                className={inputClass}
                dir="ltr"
              />
            </Field>

            {!emailOtpSent ? (
              <PrimaryButton
                label="إرسال رمز التحقق"
                onClick={() => {
                  if (data.email.trim()) setEmailOtpSent(true);
                }}
              />
            ) : (
              <>
                <InfoBox>
                  تم إرسال رمز تحقق تجريبي إلى{" "}
                  <strong>{data.email}</strong>. استخدم أي 6 أرقام.
                </InfoBox>

                <Field label="رمز التحقق">
                  <input
                    value={data.emailOtp}
                    onChange={(e) =>
                      update(
                        "emailOtp",
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    className={`${inputClass} text-center text-xl tracking-[0.35em]`}
                    dir="ltr"
                  />
                </Field>

                <PrimaryButton
                  label="تحقق ومتابعة"
                  onClick={() => {
                    if (data.emailOtp.length === 6) {
                      setCurrentStep("phone");
                    }
                  }}
                />
              </>
            )}
          </StepCard>
        )}

        {currentStep === "phone" && (
          <StepCard
            eyebrow="STEP 02"
            title="تحقق من رقم الجوال"
            description="رقم الجوال الموثق يستخدم للتنبيهات المهمة والتوقيع الإلكتروني لاحقًا."
          >
            <Field label="رقم الجوال">
              <div className="flex gap-3" dir="ltr">
                <div className="flex h-14 w-[82px] items-center justify-center rounded-2xl border border-[#0D3B34]/10 bg-[#F5F2EB] text-sm font-bold">
                  +966
                </div>

                <input
                  value={data.phone}
                  onChange={(e) =>
                    update(
                      "phone",
                      e.target.value.replace(/\D/g, "").slice(0, 9)
                    )
                  }
                  placeholder="5XXXXXXXX"
                  className={inputClass}
                />
              </div>
            </Field>

            {!phoneOtpSent ? (
              <PrimaryButton
                label="إرسال رمز التحقق"
                onClick={() => {
                  if (data.phone.length >= 9) setPhoneOtpSent(true);
                }}
              />
            ) : (
              <>
                <InfoBox>
                  تم إرسال رمز تحقق تجريبي إلى +966 {data.phone}. استخدم أي
                  6 أرقام.
                </InfoBox>

                <Field label="رمز التحقق">
                  <input
                    value={data.phoneOtp}
                    onChange={(e) =>
                      update(
                        "phoneOtp",
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    className={`${inputClass} text-center text-xl tracking-[0.35em]`}
                    dir="ltr"
                  />
                </Field>

                <PrimaryButton
                  label="تحقق ومتابعة"
                  onClick={() => {
                    if (data.phoneOtp.length === 6) {
                      setCurrentStep("account");
                    }
                  }}
                />
              </>
            )}

            <StepActions onBack={back} hideNext />
          </StepCard>
        )}

        {currentStep === "account" && (
          <StepCard
            eyebrow="ACCOUNT OWNER"
            title="من يدير هذا الحساب؟"
            description="بيانات الشخص المفوض بمتابعة طلب الشريك وإدارة الحساب الأساسي."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="الاسم الأول">
                <input
                  value={data.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="اسم العائلة">
                <input
                  value={data.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="المسمى الوظيفي">
              <input
                value={data.jobTitle}
                onChange={(e) => update("jobTitle", e.target.value)}
                className={inputClass}
              />
            </Field>

            <VerifiedSummary
              email={data.email}
              phone={`+966 ${data.phone}`}
            />

            <StepActions onBack={back} onNext={next} />
          </StepCard>
        )}

        {currentStep === "business" && (
          <StepCard
            eyebrow="BUSINESS BASICS"
            title="أساسيات المنشأة"
            description="بيانات المنشأة أو النشاط الراغب في الانضمام إلى Arees Loop."
          >
            <Field label="الاسم التجاري">
              <input
                value={data.tradeName}
                onChange={(e) => {
                  update("tradeName", e.target.value);

                  if (!data.publicName) {
                    update("publicName", e.target.value);
                  }
                }}
                className={inputClass}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="نوع الكيان">
                <select
                  value={data.entityType}
                  onChange={(e) => update("entityType", e.target.value)}
                  className={inputClass}
                >
                  <option value="">اختر</option>
                  <option>شركة</option>
                  <option>مؤسسة</option>
                  <option>فرد مرخص</option>
                  <option>جهة غير ربحية</option>
                  <option>أخرى</option>
                </select>
              </Field>

              <Field label="نوع الإثبات القانوني">
                <select
                  value={data.proofType}
                  onChange={(e) => update("proofType", e.target.value)}
                  className={inputClass}
                >
                  <option value="">اختر</option>
                  <option>سجل تجاري</option>
                  <option>وثيقة عمل حر</option>
                  <option>ترخيص مهني</option>
                  <option>وثيقة نظامية أخرى</option>
                </select>
              </Field>
            </div>

            <InfoBox>
              السجل أو الوثيقة يثبت الكيان، أما تراخيص مزاولة النشاط فيتم
              إضافتها بصورة مستقلة لاحقًا.
            </InfoBox>

            <StepActions onBack={back} onNext={next} />
          </StepCard>
        )}

        {currentStep === "category" && (
          <StepCard
            eyebrow="PARTNER ACTIVITIES"
            title="ما الخدمات التي تقدمها؟"
            description="يمكنك اختيار أكثر من نشاط. سنراجع التراخيص المطلوبة لكل نشاط قبل تفعيله."
          >
            <div className="grid gap-3 md:grid-cols-2">
              {Object.keys(categories).map((category) => {
                const active = data.categories.includes(category);

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`relative min-h-[104px] rounded-[22px] border p-5 text-right transition ${
                      active
                        ? "border-[#D4AF37] bg-[#0D3B34] text-white"
                        : "border-[#0D3B34]/10 bg-[#FAF8F3] hover:border-[#D4AF37]/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold">{category}</p>

                        <p
                          className={`mt-2 text-xs ${
                            active
                              ? "text-white/55"
                              : "text-[#0D3B34]/45"
                          }`}
                        >
                          اضغط للاختيار
                        </p>
                      </div>

                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          active
                            ? "bg-[#D4AF37] text-[#0D3B34]"
                            : "bg-[#0D3B34]/6 text-transparent"
                        }`}
                      >
                        ✓
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {data.categories.length > 0 && (
              <>
                <div className="rounded-[22px] bg-[#EEF3F0] p-4">
                  <p className="text-xs font-semibold text-[#0D3B34]/55">
                    الأنشطة المختارة
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {data.categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className="rounded-full bg-[#0D3B34] px-3 py-2 text-xs font-semibold text-white"
                      >
                        {category} ×
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[26px] border border-[#0D3B34]/8 bg-[#FAF9F5] p-5">
                  <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
                    SUBCATEGORIES
                  </p>

                  <h3
                    className="mt-1 text-xl font-bold"
                    style={{
                      fontFamily: "var(--font-el-messiri), serif",
                    }}
                  >
                    حدد الخدمات الفرعية
                  </h3>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {availableSubCategories.map((subCategory) => {
                      const active =
                        data.subCategories.includes(subCategory);

                      return (
                        <button
                          key={subCategory}
                          type="button"
                          onClick={() =>
                            toggleSubCategory(subCategory)
                          }
                          className={`rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                            active
                              ? "border-[#0D3B34] bg-[#0D3B34] text-white"
                              : "border-[#0D3B34]/10 bg-white text-[#0D3B34]/65"
                          }`}
                        >
                          {active && "✓ "}
                          {subCategory}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <StepActions onBack={back} onNext={next} />
          </StepCard>
        )}

        {currentStep === "sales" && (
          <StepCard
            eyebrow="SERVICE CHANNELS"
            title="كيف تقدم خدماتك؟"
            description="بيانات التشغيل والمواقع تستخدم داخليًا ولا تعرض وسائل التواصل المباشر للزائر."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ChoiceCard
                title="عبر الإنترنت"
                description="موقع إلكتروني، متجر أو قناة رقمية."
                checked={data.sellsOnline}
                onClick={() =>
                  update("sellsOnline", !data.sellsOnline)
                }
              />

              <ChoiceCard
                title="موقع أو فرع فعلي"
                description="وجهة، متحف، فندق، مطعم، مكتب أو نقطة تجمع."
                checked={data.hasPhysicalLocation}
                onClick={() =>
                  update(
                    "hasPhysicalLocation",
                    !data.hasPhysicalLocation
                  )
                }
              />
            </div>

            {data.hasPhysicalLocation && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="المدينة الرئيسية">
                  <input
                    value={data.city}
                    onChange={(e) => update("city", e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="عدد الفروع / المواقع">
                  <input
                    type="number"
                    min="1"
                    value={data.branches}
                    onChange={(e) => update("branches", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
            )}

            <Field label="نطاق تقديم الخدمة">
              <input
                value={data.serviceArea}
                onChange={(e) => update("serviceArea", e.target.value)}
                className={inputClass}
              />
            </Field>

            {data.sellsOnline && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="الموقع الإلكتروني / المتجر">
                  <input
                    value={data.website}
                    onChange={(e) => update("website", e.target.value)}
                    className={inputClass}
                    dir="ltr"
                  />
                </Field>

                <Field label="حساب التواصل الاجتماعي">
                  <input
                    value={data.socialAccount}
                    onChange={(e) =>
                      update("socialAccount", e.target.value)
                    }
                    className={inputClass}
                    dir="ltr"
                  />
                </Field>
              </div>
            )}

            <InfoBox>
              الموقع الإلكتروني وحسابات التواصل تبقى داخلية ولا تظهر
              للعميل.
            </InfoBox>

            <StepActions onBack={back} onNext={next} />
          </StepCard>
        )}

        {currentStep === "legal" && (
          <StepCard
            eyebrow="LEGAL VERIFICATION"
            title="البيانات القانونية"
            description="التحقق حاليًا تجريبي، ولاحقًا يتم ربطه بمصادر التحقق الرسمية."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="الرقم الموحد">
                <input
                  value={data.unifiedNumber}
                  onChange={(e) =>
                    update(
                      "unifiedNumber",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  className={inputClass}
                  dir="ltr"
                />
              </Field>

              <Field label="رقم السجل / الوثيقة">
                <input
                  value={data.crNumber}
                  onChange={(e) =>
                    update("crNumber", e.target.value)
                  }
                  className={inputClass}
                  dir="ltr"
                />
              </Field>
            </div>

            <button
              type="button"
              onClick={simulateBusinessLookup}
              className="rounded-2xl border border-[#D4AF37]/35 bg-[#FFF9E8] px-5 py-3 text-sm font-bold text-[#8B6812]"
            >
              تحقق من البيانات — نموذج تجريبي
            </button>

            {(data.legalNameAr || data.legalNameEn) && (
              <div className="rounded-[24px] border border-[#0D3B34]/8 bg-[#F5F7F4] p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <ReadOnlyValue
                    label="الاسم القانوني بالعربية"
                    value={data.legalNameAr}
                  />

                  <ReadOnlyValue
                    label="Legal Name"
                    value={data.legalNameEn}
                  />
                </div>

                <div className="mt-4">
                  <ReadOnlyValue
                    label="العنوان القانوني"
                    value={data.legalAddress}
                  />
                </div>
              </div>
            )}

            <StepActions onBack={back} onNext={next} />
          </StepCard>
        )}

        {currentStep === "licenses" && (
          <StepCard
            eyebrow="LICENSES & COMPLIANCE"
            title="التراخيص وربط الأنشطة"
            description="حدد الأنشطة التي يغطيها كل ترخيص. لاحقًا لن يسمح النظام بنشر خدمة بدون ترخيص ساري ومعتمد يغطي نشاطها."
          >
            {data.categories.length === 0 && (
              <InfoBox>
                لم يتم اختيار أي نشاط. ارجع إلى مرحلة الأنشطة وحدد نشاطًا
                واحدًا على الأقل.
              </InfoBox>
            )}

            <div className="space-y-5">
              {licenses.map((license, index) => (
                <div
                  key={license.id}
                  className="rounded-[26px] border border-[#0D3B34]/9 bg-[#FAF9F5] p-5"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-[#B99124]">
                        LICENSE {String(index + 1).padStart(2, "0")}
                      </p>

                      <h3 className="mt-1 font-bold">
                        الترخيص رقم {index + 1}
                      </h3>
                    </div>

                    {licenses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLicense(license.id)}
                        className="rounded-full bg-[#A43131]/8 px-3 py-1.5 text-xs font-semibold text-[#A43131]"
                      >
                        حذف
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="نوع الترخيص">
                      <input
                        value={license.type}
                        onChange={(e) =>
                          updateLicense(
                            license.id,
                            "type",
                            e.target.value
                          )
                        }
                        placeholder="مثال: ترخيص خدمات سفر وسياحة"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="جهة الإصدار">
                      <select
                        value={license.issuer}
                        onChange={(e) =>
                          updateLicense(
                            license.id,
                            "issuer",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      >
                        <option value="">اختر</option>
                        <option>وزارة السياحة</option>
                        <option>وزارة التجارة</option>
                        <option>وزارة الموارد البشرية</option>
                        <option>وزارة البلديات والإسكان</option>
                        <option>أخرى</option>
                      </select>
                    </Field>

                    {license.issuer === "أخرى" && (
                      <Field label="اسم جهة الإصدار">
                        <input
                          value={license.customIssuer}
                          onChange={(e) =>
                            updateLicense(
                              license.id,
                              "customIssuer",
                              e.target.value
                            )
                          }
                          className={inputClass}
                        />
                      </Field>
                    )}

                    <Field label="رقم الترخيص">
                      <input
                        value={license.number}
                        onChange={(e) =>
                          updateLicense(
                            license.id,
                            "number",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label="تاريخ الإصدار">
                      <input
                        type="date"
                        value={license.issueDate}
                        onChange={(e) =>
                          updateLicense(
                            license.id,
                            "issueDate",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label="تاريخ الانتهاء">
                      <input
                        type="date"
                        value={license.expiryDate}
                        onChange={(e) =>
                          updateLicense(
                            license.id,
                            "expiryDate",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <div className="mt-5 rounded-[22px] border border-[#0D3B34]/8 bg-white p-4">
                    <p className="text-xs font-bold">
                      الأنشطة التي يغطيها هذا الترخيص
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-[#0D3B34]/45">
                      اختر من الأنشطة التي حددتها للمنشأة.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {data.categories.map((activity) => {
                        const active =
                          license.coveredActivities.includes(activity);

                        return (
                          <button
                            key={activity}
                            type="button"
                            onClick={() =>
                              toggleLicenseActivity(
                                license.id,
                                activity
                              )
                            }
                            className={`rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                              active
                                ? "border-[#D4AF37] bg-[#0D3B34] text-white"
                                : "border-[#0D3B34]/10 bg-[#F8F7F3] text-[#0D3B34]/65"
                            }`}
                          >
                            {active && "✓ "}
                            {activity}
                          </button>
                        );
                      })}
                    </div>

                    {license.coveredActivities.length > 0 && (
                      <div className="mt-4 rounded-xl bg-[#EAF4EF] px-3 py-2 text-[11px] font-semibold text-[#267247]">
                        يغطي {license.coveredActivities.length} نشاط
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <Field label="مرفق الترخيص PDF">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) =>
                          updateLicense(
                            license.id,
                            "fileName",
                            e.target.files?.[0]?.name || ""
                          )
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addLicense}
              className="w-full rounded-2xl border border-dashed border-[#B99124]/45 bg-[#FFF9EA]/70 py-4 text-sm font-bold text-[#8B6812]"
            >
              + إضافة ترخيص آخر
            </button>

            <InfoBox>
              مثال: إذا كانت المنشأة تقدم «وكالات سفر وسياحة» و«تنظيم
              الرحلات السياحية»، يمكن لترخيص واحد أن يغطي النشاطين أو
              يكون لكل نشاط ترخيص مستقل.
            </InfoBox>

            <StepActions onBack={back} onNext={next} />
          </StepCard>
        )}

        {currentStep === "tax" && (
          <StepCard
            eyebrow="TAX PROFILE"
            title="البيانات الضريبية"
            description="تستخدم البيانات الضريبية في الفوترة والحسابات والتسويات."
          >
            <ChoiceCard
              title="المنشأة مسجلة في ضريبة القيمة المضافة"
              description="فعّل الخيار إذا كانت المنشأة تحمل رقم تسجيل ضريبي."
              checked={data.vatRegistered}
              onClick={() =>
                update("vatRegistered", !data.vatRegistered)
              }
            />

            {data.vatRegistered && (
              <>
                <Field label="رقم التسجيل الضريبي">
                  <input
                    value={data.vatNumber}
                    onChange={(e) =>
                      update(
                        "vatNumber",
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    className={inputClass}
                    dir="ltr"
                  />
                </Field>

                <Field label="شهادة التسجيل الضريبي PDF">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) =>
                      update(
                        "vatCertificate",
                        e.target.files?.[0]?.name || ""
                      )
                    }
                    className={inputClass}
                  />
                </Field>
              </>
            )}

            <StepActions onBack={back} onNext={next} />
          </StepCard>
        )}

        {currentStep === "bank" && (
          <StepCard
            eyebrow="SETTLEMENT ACCOUNT"
            title="التفاصيل البنكية"
            description="الحساب الذي يتم تحويل مستحقات الشريك إليه."
          >
            <InfoBox>
              يجب أن يكون الحساب البنكي باسم المنشأة أو يخضع للمراجعة قبل
              الاعتماد.
            </InfoBox>

            <Field label="IBAN">
              <div className="flex gap-3">
                <input
                  value={data.iban}
                  onChange={(e) =>
                    update(
                      "iban",
                      e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "")
                        .slice(0, 24)
                    )
                  }
                  onBlur={simulateIbanLookup}
                  className={inputClass}
                  dir="ltr"
                />

                <button
                  type="button"
                  onClick={simulateIbanLookup}
                  className="shrink-0 rounded-2xl bg-[#0D3B34] px-4 text-xs font-bold text-white"
                >
                  تحقق
                </button>
              </div>
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <ReadOnlyValue
                label="اسم البنك"
                value={data.bankName || "سيظهر بعد التحقق"}
              />

              <ReadOnlyValue
                label="SWIFT"
                value={data.swift || "سيظهر بعد التحقق"}
              />
            </div>

            <Field label="اسم المستفيد">
              <input
                value={data.beneficiaryName}
                onChange={(e) =>
                  update("beneficiaryName", e.target.value)
                }
                className={inputClass}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="العملة">
                <select
                  value={data.currency}
                  onChange={(e) => update("currency", e.target.value)}
                  className={inputClass}
                >
                  <option>SAR</option>
                </select>
              </Field>

              <Field label="شهادة IBAN / خطاب البنك">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) =>
                    update(
                      "ibanCertificate",
                      e.target.files?.[0]?.name || ""
                    )
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <StepActions onBack={back} onNext={next} />
          </StepCard>
        )}

        {currentStep === "contacts" && (
          <StepCard
            eyebrow="PARTNER CONTACTS"
            title="جهات التواصل"
            description="حدد المسؤول المالي ومسؤول الحجوزات والتشغيل."
          >
            <ContactSection
              title="المسؤول المالي"
              name={data.financeName}
              titleValue={data.financeTitle}
              email={data.financeEmail}
              phone={data.financePhone}
              onName={(value) => update("financeName", value)}
              onTitle={(value) => update("financeTitle", value)}
              onEmail={(value) => update("financeEmail", value)}
              onPhone={(value) => update("financePhone", value)}
            />

            <ContactSection
              title="مسؤول الحجوزات والتشغيل"
              name={data.operationsName}
              titleValue={data.operationsTitle}
              email={data.operationsEmail}
              phone={data.operationsPhone}
              onName={(value) => update("operationsName", value)}
              onTitle={(value) => update("operationsTitle", value)}
              onEmail={(value) => update("operationsEmail", value)}
              onPhone={(value) => update("operationsPhone", value)}
            />

            <StepActions onBack={back} onNext={next} />
          </StepCard>
        )}

        {currentStep === "brand" && (
          <StepCard
            eyebrow="PUBLIC PROFILE"
            title="هوية الشريك داخل Arees Loop"
            description="حدد الاسم والشعار المستخدمين عند عرض الخدمات داخل المنصة."
          >
            <Field label="اسم العرض">
              <input
                value={data.publicName}
                onChange={(e) => update("publicName", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="شعار المنشأة">
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={(e) =>
                  update(
                    "logoFile",
                    e.target.files?.[0]?.name || ""
                  )
                }
                className={inputClass}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <DataVisibilityCard
                title="يمكن عرضه للزائر"
                items={[
                  "اسم العرض",
                  "الشعار",
                  "الخدمات والصور",
                  "السعر النهائي",
                  "موقع تنفيذ الخدمة عند الحاجة",
                ]}
                positive
              />

              <DataVisibilityCard
                title="بيانات داخلية"
                items={[
                  "الجوال",
                  "البريد",
                  "الموقع الإلكتروني",
                  "حسابات التواصل",
                  "البيانات البنكية",
                ]}
              />
            </div>

            <StepActions onBack={back} onNext={next} />
          </StepCard>
        )}

        {currentStep === "review" && (
          <StepCard
            eyebrow="FINAL REVIEW"
            title="راجع طلب الانضمام"
            description="تحقق من البيانات قبل إرسال الطلب إلى Arees Loop."
          >
            <ReviewSection
              title="صاحب الحساب"
              items={[
                ["الاسم", `${data.firstName} ${data.lastName}`],
                ["البريد", data.email],
                ["الجوال", `+966 ${data.phone}`],
                ["المسمى", data.jobTitle],
              ]}
            />

            <ReviewSection
              title="المنشأة والأنشطة"
              items={[
                ["الاسم التجاري", data.tradeName],
                ["نوع الكيان", data.entityType],
                ["الإثبات", data.proofType],
                [
                  "الأنشطة",
                  data.categories.length
                    ? data.categories.join("، ")
                    : "—",
                ],
                [
                  "الخدمات الفرعية",
                  data.subCategories.length
                    ? data.subCategories.join("، ")
                    : "—",
                ],
              ]}
            />

            <ReviewSection
              title="المعلومات القانونية"
              items={[
                ["الرقم الموحد", data.unifiedNumber],
                ["رقم السجل / الوثيقة", data.crNumber],
                ["الاسم القانوني", data.legalNameAr],
                [
                  "الرقم الضريبي",
                  data.vatRegistered ? data.vatNumber : "غير مسجل",
                ],
                ["عدد التراخيص", String(licenses.length)],
              ]}
            />

            <div className="rounded-[22px] border border-[#0D3B34]/8 bg-[#FAF9F5] p-5">
              <p className="font-bold">
                تغطية الأنشطة بالتراخيص
              </p>

              <div className="mt-4 space-y-3">
                {licenses.map((license, index) => (
                  <div
                    key={license.id}
                    className="rounded-2xl bg-white p-4"
                  >
                    <p className="text-xs font-bold">
                      {license.type || `الترخيص ${index + 1}`}
                    </p>

                    <p className="mt-2 text-[11px] leading-6 text-[#0D3B34]/55">
                      {license.coveredActivities.length
                        ? license.coveredActivities.join("، ")
                        : "لم يتم تحديد الأنشطة المغطاة"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <ReviewSection
              title="البيانات البنكية"
              items={[
                ["IBAN", data.iban],
                ["البنك", data.bankName],
                ["SWIFT", data.swift],
                ["المستفيد", data.beneficiaryName],
              ]}
            />

            <ReviewSection
              title="جهات التواصل"
              items={[
                ["المسؤول المالي", data.financeName],
                ["جوال المالية", data.financePhone],
                ["مسؤول التشغيل", data.operationsName],
                ["جوال التشغيل", data.operationsPhone],
              ]}
            />

            <div className="rounded-[24px] border border-[#D4AF37]/22 bg-[#FFF9E8] p-5">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={data.declaration}
                  onChange={(e) =>
                    update("declaration", e.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-[#0D3B34]"
                />

                <span className="text-sm leading-7 text-[#0D3B34]/75">
                  أؤكد أن لدي الصلاحية النظامية لتقديم هذا الطلب نيابةً
                  عن المنشأة، وأن جميع البيانات والمعلومات والمستندات
                  المقدمة صحيحة ودقيقة وكاملة حسب علمي. كما أتعهد بتحديث
                  منصة Arees Loop بأي تغيير يطرأ على بيانات المنشأة أو
                  التراخيص أو المعلومات الضريبية أو البنكية أو بيانات
                  التواصل، وأوافق على التحقق من البيانات والمستندات
                  المقدمة من الجهات والمصادر المعتمدة وفق الأنظمة
                  والسياسات ذات الصلة.
                </span>
              </label>
            </div>

            <div className="rounded-[24px] border border-[#0D3B34]/9 bg-[#F7F8F5] p-5">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={data.termsAccepted}
                  onChange={(e) =>
                    update("termsAccepted", e.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-[#0D3B34]"
                />

                <span className="text-sm leading-7 text-[#0D3B34]/75">
                  أوافق على شروط استخدام منصة Arees Loop وسياسة
                  الخصوصية، وأقر بأن إرسال الطلب لا يعني تفعيل حساب
                  الشريك أو اعتماد خدماته إلا بعد استكمال إجراءات
                  التحقق والمراجعة والموافقة النهائية.
                </span>
              </label>
            </div>

            <div className="rounded-[22px] bg-[#0D3B34] p-5 text-white">
              <p className="text-xs font-bold text-[#E5BE45]">
                ماذا يحدث بعد الإرسال؟
              </p>

              <p className="mt-2 text-sm leading-7 text-white/65">
                ينتقل الطلب إلى التدقيق. بعد الموافقة المبدئية تحدد
                Arees Loop العمولة والرسوم التجارية وترسل الاتفاقية
                الإلكترونية للشريك قبل الاعتماد النهائي.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <SecondaryButton label="العودة" onClick={back} />

              <button
                type="button"
                disabled={!data.declaration || !data.termsAccepted}
                onClick={submitApplication}
                className="rounded-2xl bg-[#D4AF37] px-7 py-4 text-sm font-bold text-[#0D3B34] transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                إرسال الطلب
              </button>
            </div>
          </StepCard>
        )}

        {currentStep === "done" && (
          <div className="mx-auto max-w-[720px] rounded-[34px] border border-white/80 bg-white/74 p-8 text-center backdrop-blur-xl md:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F4EE] text-3xl">
              ✓
            </div>

            <p className="mt-7 text-[10px] font-bold tracking-[0.22em] text-[#B99124]">
              APPLICATION SUBMITTED
            </p>

            <h1
              className="mt-3 text-3xl font-bold md:text-[40px]"
              style={{
                fontFamily: "var(--font-el-messiri), serif",
              }}
            >
              تم استلام طلبك
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-8 text-[#0D3B34]/60">
              تم إرسال طلب انضمام{" "}
              <strong>{data.tradeName || data.publicName}</strong> إلى
              Arees Loop للمراجعة والتدقيق.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <StatusCard
                number="01"
                label="تم استلام الطلب"
                active
              />

              <StatusCard
                number="02"
                label="التدقيق والمراجعة"
              />

              <StatusCard
                number="03"
                label="العرض والاتفاقية"
              />
            </div>

            <div className="mt-8 rounded-[22px] bg-[#F6F3EC] p-5">
              <p className="text-xs text-[#0D3B34]/45">
                رقم الطلب التجريبي
              </p>

              <p className="mt-2 font-bold tracking-[0.12em]" dir="ltr">
                AL-P-2026-00001
              </p>
            </div>

            <Link
              href="/"
              className="mt-7 inline-flex rounded-2xl bg-[#0D3B34] px-6 py-3.5 text-sm font-bold text-white"
            >
              العودة إلى Arees Loop
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

const inputClass =
  "h-14 w-full rounded-2xl border border-[#0D3B34]/10 bg-[#F9F8F4] px-4 text-sm text-[#0D3B34] outline-none transition placeholder:text-[#0D3B34]/30 focus:border-[#D4AF37]/65 focus:bg-white";

function StepCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[34px] border border-white/80 bg-white/72 p-6 backdrop-blur-xl md:p-9">
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[0.2em] text-[#B99124]">
          {eyebrow}
        </p>

        <h1
          className="mt-2 text-3xl font-bold md:text-[38px]"
          style={{
            fontFamily: "var(--font-el-messiri), serif",
          }}
        >
          {title}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#0D3B34]/58">
          {description}
        </p>
      </div>

      <div className="space-y-5">{children}</div>
    </section>
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
      <span className="mb-2 block text-xs font-semibold text-[#0D3B34]/65">
        {label}
      </span>

      {children}
    </label>
  );
}

function PrimaryButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl bg-[#0D3B34] px-6 py-4 text-sm font-bold text-white"
    >
      {label}
    </button>
  );
}

function SecondaryButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-[#0D3B34]/10 bg-white px-6 py-3.5 text-sm font-bold text-[#0D3B34]/70"
    >
      {label}
    </button>
  );
}

function StepActions({
  onBack,
  onNext,
  hideNext = false,
}: {
  onBack: () => void;
  onNext?: () => void;
  hideNext?: boolean;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-[#0D3B34]/7 pt-5 sm:flex-row sm:justify-between">
      <SecondaryButton label="العودة" onClick={onBack} />

      {!hideNext && onNext && (
        <button
          type="button"
          onClick={onNext}
          className="rounded-2xl bg-[#0D3B34] px-7 py-3.5 text-sm font-bold text-white"
        >
          متابعة
        </button>
      )}
    </div>
  );
}

function InfoBox({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-[#D4AF37]/20 bg-[#FFF9E9] px-4 py-3 text-xs leading-6 text-[#0D3B34]/68">
      {children}
    </div>
  );
}

function VerifiedSummary({
  email,
  phone,
}: {
  email: string;
  phone: string;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-2xl bg-[#EDF5F1] p-4">
        <p className="text-[10px] text-[#0D3B34]/45">
          البريد الموثق
        </p>

        <p className="mt-1 break-all text-sm font-semibold">
          {email}
        </p>
      </div>

      <div className="rounded-2xl bg-[#EDF5F1] p-4">
        <p className="text-[10px] text-[#0D3B34]/45">
          الجوال الموثق
        </p>

        <p className="mt-1 text-sm font-semibold" dir="ltr">
          {phone}
        </p>
      </div>
    </div>
  );
}

function ChoiceCard({
  title,
  description,
  checked,
  onClick,
}: {
  title: string;
  description: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-4 rounded-[22px] border p-5 text-right transition ${
        checked
          ? "border-[#0D3B34] bg-[#F0F5F2]"
          : "border-[#0D3B34]/10 bg-[#FAF9F5]"
      }`}
    >
      <div>
        <p className="font-bold">{title}</p>

        <p className="mt-1 text-xs leading-6 text-[#0D3B34]/48">
          {description}
        </p>
      </div>

      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
          checked
            ? "bg-[#0D3B34] text-white"
            : "bg-[#0D3B34]/7 text-transparent"
        }`}
      >
        ✓
      </div>
    </button>
  );
}

function ReadOnlyValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#0D3B34]/7 bg-white px-4 py-3">
      <p className="text-[10px] text-[#0D3B34]/42">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-[#0D3B34]/75">
        {value}
      </p>
    </div>
  );
}

function ContactSection({
  title,
  name,
  titleValue,
  email,
  phone,
  onName,
  onTitle,
  onEmail,
  onPhone,
}: {
  title: string;
  name: string;
  titleValue: string;
  email: string;
  phone: string;
  onName: (value: string) => void;
  onTitle: (value: string) => void;
  onEmail: (value: string) => void;
  onPhone: (value: string) => void;
}) {
  return (
    <div className="rounded-[26px] border border-[#0D3B34]/8 bg-[#FAF9F5] p-5">
      <h3 className="mb-5 text-base font-bold">
        {title}
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="الاسم">
          <input
            value={name}
            onChange={(e) => onName(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="المسمى الوظيفي">
          <input
            value={titleValue}
            onChange={(e) => onTitle(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="البريد الإلكتروني">
          <input
            type="email"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            className={inputClass}
            dir="ltr"
          />
        </Field>

        <Field label="رقم الجوال">
          <input
            value={phone}
            onChange={(e) => onPhone(e.target.value)}
            className={inputClass}
            dir="ltr"
          />
        </Field>
      </div>
    </div>
  );
}

function DataVisibilityCard({
  title,
  items,
  positive = false,
}: {
  title: string;
  items: string[];
  positive?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border p-4 ${
        positive
          ? "border-[#267247]/12 bg-[#EAF5EE]"
          : "border-[#A16628]/12 bg-[#FFF6E8]"
      }`}
    >
      <p
        className={`text-sm font-bold ${
          positive ? "text-[#267247]" : "text-[#8A5F25]"
        }`}
      >
        {title}
      </p>

      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-2 text-xs"
          >
            <span>{positive ? "✓" : "•"}</span>
            <span className="text-[#0D3B34]/65">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  items,
}: {
  title: string;
  items: [string, string][];
}) {
  return (
    <details
      open
      className="rounded-[22px] border border-[#0D3B34]/8 bg-[#FAF9F5]"
    >
      <summary className="cursor-pointer list-none px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="font-bold">{title}</span>
          <span className="text-[#B99124]">⌄</span>
        </div>
      </summary>

      <div className="grid gap-3 border-t border-[#0D3B34]/7 px-5 py-4 md:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label}>
            <p className="text-[10px] text-[#0D3B34]/42">
              {label}
            </p>

            <p className="mt-1 break-words text-sm font-semibold text-[#0D3B34]/75">
              {value || "—"}
            </p>
          </div>
        ))}
      </div>
    </details>
  );
}

function StatusCard({
  number,
  label,
  active = false,
}: {
  number: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border p-4 ${
        active
          ? "border-[#D4AF37]/35 bg-[#FFF8E4]"
          : "border-[#0D3B34]/7 bg-[#F8F7F3]"
      }`}
    >
      <p
        className={`text-[10px] font-bold ${
          active
            ? "text-[#B99124]"
            : "text-[#0D3B34]/35"
        }`}
      >
        {number}
      </p>

      <p className="mt-2 text-xs font-bold">
        {label}
      </p>
    </div>
  );
}