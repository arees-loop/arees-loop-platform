"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type LicenseStatus =
  | "VERIFIED"
  | "EXPIRING_60"
  | "EXPIRING_30"
  | "EXPIRING_7"
  | "EXPIRED"
  | "UNDER_REVIEW";

type License = {
  id: number;
  type: string;
  issuer: string;
  number: string;
  activity: string;
  issueDate: string;
  expiryDate: string;
  status: LicenseStatus;
  fileName: string;
};

const statusConfig: Record<
  LicenseStatus,
  { label: string; className: string }
> = {
  VERIFIED: {
    label: "موثق وساري",
    className: "bg-[#E6F5EB] text-[#267247]",
  },
  EXPIRING_60: {
    label: "ينتهي خلال 60 يومًا",
    className: "bg-[#FFF7DE] text-[#8C6813]",
  },
  EXPIRING_30: {
    label: "ينتهي خلال 30 يومًا",
    className: "bg-[#FFF0C9] text-[#8C6813]",
  },
  EXPIRING_7: {
    label: "ينتهي خلال 7 أيام",
    className: "bg-[#FFE4D8] text-[#A15431]",
  },
  EXPIRED: {
    label: "منتهي",
    className: "bg-[#FFE9E7] text-[#A3443E]",
  },
  UNDER_REVIEW: {
    label: "تحت المراجعة",
    className: "bg-[#EAF0F7] text-[#3E6182]",
  },
};

const initialLicenses: License[] = [
  {
    id: 1,
    type: "ترخيص وزارة السياحة",
    issuer: "وزارة السياحة",
    number: "73104550",
    activity: "خدمات السفر والسياحة",
    issueDate: "15 يناير 2026",
    expiryDate: "14 يناير 2027",
    status: "VERIFIED",
    fileName: "tourism-license.pdf",
  },
  {
    id: 2,
    type: "السجل التجاري",
    issuer: "وزارة التجارة",
    number: "4650123456",
    activity: "أنشطة سياحية وتجارب زوار",
    issueDate: "01 مارس 2025",
    expiryDate: "01 أكتوبر 2026",
    status: "EXPIRING_30",
    fileName: "commercial-registration.pdf",
  },
  {
    id: 3,
    type: "شهادة التسجيل الضريبي",
    issuer: "هيئة الزكاة والضريبة والجمارك",
    number: "310123456700003",
    activity: "ضريبة القيمة المضافة",
    issueDate: "10 يونيو 2025",
    expiryDate: "غير محدد",
    status: "VERIFIED",
    fileName: "vat-certificate.pdf",
  },
];

export default function PartnerBusinessPage() {
  const [licenses, setLicenses] =
    useState<License[]>(initialLicenses);

  const [showLicenseForm, setShowLicenseForm] =
    useState(false);

  const [bankEditing, setBankEditing] =
    useState(false);

  const [contactEditing, setContactEditing] =
    useState(false);

  const [financeEditing, setFinanceEditing] =
    useState(false);

  const [businessEditing, setBusinessEditing] =
    useState(false);

  const [licenseForm, setLicenseForm] = useState({
    type: "",
    issuer: "",
    number: "",
    activity: "",
    issueDate: "",
    expiryDate: "",
    fileName: "",
  });

  const [business, setBusiness] = useState({
    tradeNameAr: "تجارب المدينة",
    tradeNameEn: "Madinah Experiences",
    legalNameAr:
      "شركة تجارب المدينة السياحية المحدودة",
    legalNameEn:
      "Madinah Experiences Tourism Company Ltd.",
    unifiedNumber: "7037003618",
    crNumber: "4650123456",
    vatNumber: "310123456700003",
    legalAddress:
      "المدينة المنورة، المملكة العربية السعودية",
    city: "المدينة المنورة",
    country: "المملكة العربية السعودية",
    website: "",
    logoName: "",
    logoUrl: "",
  });

  const [bank, setBank] = useState({
    iban: "SA348000332608010190907",
    bankName: "مصرف الراجحي",
    swift: "RJHISARIXXX",
    beneficiary:
      "Madinah Experiences Tourism Company Ltd.",
    currency: "SAR",
    status: "موثق",
  });

  const [contact, setContact] = useState({
    name: "محمد أحمد",
    jobTitle: "مدير العمليات",
    email: "operations@example.sa",
    phone: "+966 55 123 4567",
    verified: true,
  });

  const [financeContact, setFinanceContact] =
    useState({
      name: "سارة علي",
      jobTitle: "المسؤول المالي",
      email: "finance@example.sa",
      phone: "+966 53 887 2244",
      verified: true,
    });

  const summary = useMemo(() => {
    return {
      total: licenses.length,
      verified: licenses.filter(
        (license) =>
          license.status === "VERIFIED"
      ).length,
      expiring: licenses.filter((license) =>
        [
          "EXPIRING_60",
          "EXPIRING_30",
          "EXPIRING_7",
        ].includes(license.status)
      ).length,
      expired: licenses.filter(
        (license) =>
          license.status === "EXPIRED"
      ).length,
    };
  }, [licenses]);

  const addLicense = () => {
    if (
      !licenseForm.type ||
      !licenseForm.issuer ||
      !licenseForm.number
    ) {
      return;
    }

    const newLicense: License = {
      id: Date.now(),
      type: licenseForm.type,
      issuer: licenseForm.issuer,
      number: licenseForm.number,
      activity:
        licenseForm.activity || "غير محدد",
      issueDate:
        licenseForm.issueDate || "غير محدد",
      expiryDate:
        licenseForm.expiryDate || "غير محدد",
      status: "UNDER_REVIEW",
      fileName:
        licenseForm.fileName ||
        "license-document.pdf",
    };

    setLicenses((current) => [
      newLicense,
      ...current,
    ]);

    setLicenseForm({
      type: "",
      issuer: "",
      number: "",
      activity: "",
      issueDate: "",
      expiryDate: "",
      fileName: "",
    });

    setShowLicenseForm(false);
  };

  const handleLogoChange = (
    file: File | undefined
  ) => {
    if (!file) return;

    if (business.logoUrl) {
      URL.revokeObjectURL(business.logoUrl);
    }

    const previewUrl =
      URL.createObjectURL(file);

    setBusiness((current) => ({
      ...current,
      logoName: file.name,
      logoUrl: previewUrl,
    }));
  };

  const removeLogo = () => {
    if (business.logoUrl) {
      URL.revokeObjectURL(business.logoUrl);
    }

    setBusiness((current) => ({
      ...current,
      logoName: "",
      logoUrl: "",
    }));
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F7F4EA] text-[#0D3B34]"
      style={{
        fontFamily:
          "var(--font-ibm-plex-arabic), sans-serif",
      }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-[#0D3B34]/6 blur-[120px]" />
        <div className="absolute -left-40 top-[42%] h-[450px] w-[450px] rounded-full bg-[#D4AF37]/9 blur-[125px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-[270px] shrink-0 border-l border-[#0D3B34]/8 bg-[#F9F7F0]/92 px-4 py-5 backdrop-blur-xl xl:block">
          <div className="mb-7 px-3">
            <p className="text-[10px] font-bold tracking-[0.22em] text-[#B99124]">
              AREES LOOP PARTNER
            </p>

            <h2
              className="mt-2 text-xl font-bold"
              style={{
                fontFamily:
                  "var(--font-el-messiri), serif",
              }}
            >
              لوحة الشريك
            </h2>
          </div>

          <nav className="space-y-2">
            <NavItem href="/partner/dashboard" label="الرئيسية" icon="⌂" />
            <NavItem href="/partner/bookings" label="الحجوزات" icon="▣" />
            <NavItem href="/partner/services" label="الخدمات" icon="◈" />
            <NavItem href="/partner/settlements" label="التسويات" icon="﷼" />
            <NavItem href="/partner/invoices" label="الفواتير" icon="▤" />
            <NavItem href="/partner/reports" label="التقارير" icon="◫" />
            <NavItem href="/partner/team" label="الموظفون والصلاحيات" icon="◎" />

            <NavItem
              href="/partner/business"
              label="المنشأة والتراخيص"
              icon="◇"
              active
            />

            <NavItem
              href="/partner/agreement"
              label="الاتفاقية والإعدادات"
              icon="✓"
            />
          </nav>

          <div className="mt-8 rounded-[24px] bg-[#0D3B34] p-5 text-white">
            <p className="text-[10px] font-bold tracking-[0.16em] text-[#E6C24D]">
              COMPLIANCE STATUS
            </p>

            <p className="mt-2 text-sm font-bold">
              حساب موثق
            </p>

            <p className="mt-2 text-xs leading-6 text-white/50">
              راقب صلاحية التراخيص والبيانات القانونية والبنكية باستمرار.
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-[#0D3B34]/8 bg-[#F9F7F0]/90 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-8">
              <div>
                <p className="text-[10px] text-[#0D3B34]/45">
                  تجارب المدينة
                </p>

                <p className="mt-1 text-sm font-bold">
                  المنشأة والتراخيص
                </p>
              </div>

              <Link
                href="/partner/dashboard"
                className="rounded-full border border-[#0D3B34]/10 bg-white px-4 py-2.5 text-xs font-semibold text-[#0D3B34]/65"
              >
                لوحة التحكم
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-[1550px] px-5 py-8 md:px-8">
            <section className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-[0.22em] text-[#B99124]">
                  BUSINESS & COMPLIANCE
                </p>

                <h1
                  className="mt-2 text-3xl font-bold md:text-[42px]"
                  style={{
                    fontFamily:
                      "var(--font-el-messiri), serif",
                  }}
                >
                  المنشأة والتراخيص
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#0D3B34]/60">
                  إدارة البيانات القانونية والضريبية والتراخيص والحساب البنكي ومسؤولي التواصل المعتمدين.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowLicenseForm(true)
                }
                className="rounded-2xl bg-[#0D3B34] px-6 py-3.5 text-sm font-bold text-white"
              >
                + إضافة ترخيص
              </button>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="إجمالي المستندات"
                value={String(summary.total)}
              />

              <SummaryCard
                label="سارية وموثقة"
                value={String(summary.verified)}
                success
              />

              <SummaryCard
                label="قريبة الانتهاء"
                value={String(summary.expiring)}
                highlight
              />

              <SummaryCard
                label="منتهية"
                value={String(summary.expired)}
                danger
              />
            </section>

            {summary.expiring > 0 && (
              <section className="mt-6 rounded-[24px] border border-[#D4AF37]/25 bg-[#FFF8E4] p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/20 font-bold text-[#8C6813]">
                    !
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      يوجد ترخيص قريب من الانتهاء
                    </p>

                    <p className="mt-2 text-xs leading-6 text-[#0D3B34]/60">
                      تبدأ التنبيهات قبل الانتهاء بـ 60 يومًا ثم 30 يومًا ثم 7 أيام. عند انتهاء الترخيص يتم تعليق الخدمات المرتبطة به حتى تحديثه.
                    </p>
                  </div>
                </div>
              </section>
            )}

            <section className="mt-7 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[30px] border border-white/80 bg-white/72 p-6 backdrop-blur-xl md:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
                      LEGAL ENTITY
                    </p>

                    <h2
                      className="mt-2 text-2xl font-bold"
                      style={{
                        fontFamily:
                          "var(--font-el-messiri), serif",
                      }}
                    >
                      بيانات المنشأة
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setBusinessEditing(
                        !businessEditing
                      )
                    }
                    className="rounded-xl border border-[#0D3B34]/10 bg-white px-3 py-2 text-[10px] font-bold"
                  >
                    {businessEditing
                      ? "إنهاء التعديل"
                      : "تعديل"}
                  </button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <EditableField
                    label="الاسم التجاري بالعربية"
                    value={business.tradeNameAr}
                    editing={businessEditing}
                    onChange={(value) =>
                      setBusiness((current) => ({
                        ...current,
                        tradeNameAr: value,
                      }))
                    }
                  />

                  <EditableField
                    label="Trade Name"
                    value={business.tradeNameEn}
                    editing={businessEditing}
                    dir="ltr"
                    onChange={(value) =>
                      setBusiness((current) => ({
                        ...current,
                        tradeNameEn: value,
                      }))
                    }
                  />

                  <EditableField
                    label="الاسم القانوني"
                    value={business.legalNameAr}
                    editing={businessEditing}
                    onChange={(value) =>
                      setBusiness((current) => ({
                        ...current,
                        legalNameAr: value,
                      }))
                    }
                  />

                  <EditableField
                    label="Legal Name"
                    value={business.legalNameEn}
                    editing={businessEditing}
                    dir="ltr"
                    onChange={(value) =>
                      setBusiness((current) => ({
                        ...current,
                        legalNameEn: value,
                      }))
                    }
                  />

                  <VerifiedField
                    label="الرقم الموحد"
                    value={business.unifiedNumber}
                  />

                  <VerifiedField
                    label="السجل التجاري"
                    value={business.crNumber}
                  />

                  <VerifiedField
                    label="الرقم الضريبي"
                    value={business.vatNumber}
                  />

                  <EditableField
                    label="المدينة"
                    value={business.city}
                    editing={businessEditing}
                    onChange={(value) =>
                      setBusiness((current) => ({
                        ...current,
                        city: value,
                      }))
                    }
                  />
                </div>

                <div className="mt-4">
                  <EditableField
                    label="العنوان القانوني"
                    value={
                      business.legalAddress
                    }
                    editing={businessEditing}
                    onChange={(value) =>
                      setBusiness((current) => ({
                        ...current,
                        legalAddress: value,
                      }))
                    }
                  />
                </div>

                <div className="mt-4">
                  <EditableField
                    label="الموقع الإلكتروني - اختياري"
                    value={business.website}
                    editing={businessEditing}
                    dir="ltr"
                    onChange={(value) =>
                      setBusiness((current) => ({
                        ...current,
                        website: value,
                      }))
                    }
                  />
                </div>

                <div className="mt-5 rounded-[20px] border border-[#0D3B34]/8 bg-[#EEF3F0] p-4">
                  <p className="text-xs font-bold">
                    البيانات الرسمية
                  </p>

                  <p className="mt-2 text-xs leading-6 text-[#0D3B34]/55">
                    عند توفر التكامل الحكومي، البيانات المسترجعة من المصدر الرسمي تظهر للقراءة فقط ولا يتم تعديلها يدويًا.
                  </p>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/80 bg-white/72 p-6 backdrop-blur-xl">
                <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
                  BRAND PROFILE
                </p>

                <h2
                  className="mt-2 text-xl font-bold"
                  style={{
                    fontFamily:
                      "var(--font-el-messiri), serif",
                  }}
                >
                  شعار المنشأة
                </h2>

                <div className="mt-6 flex min-h-[220px] items-center justify-center overflow-hidden rounded-[24px] border border-dashed border-[#0D3B34]/15 bg-[#FAF9F5] p-6">
                  {business.logoUrl ? (
                    <div className="text-center">
                      <div className="mx-auto flex h-[140px] w-[220px] items-center justify-center overflow-hidden rounded-[20px] bg-white p-4">
                        <img
                          src={business.logoUrl}
                          alt={business.tradeNameAr}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      <p className="mt-4 text-xs font-bold">
                        {business.tradeNameAr}
                      </p>

                      <p
                        className="mt-1 max-w-[260px] truncate text-[10px] text-[#0D3B34]/40"
                        dir="ltr"
                      >
                        {business.logoName}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#0D3B34] text-xl font-bold text-[#D4AF37]">
                        {business.tradeNameAr
                          .trim()
                          .slice(0, 1) || "م"}
                      </div>

                      <p className="mt-3 text-xs font-bold">
                        {business.tradeNameAr}
                      </p>

                      <p className="mt-1 text-[10px] text-[#0D3B34]/40">
                        لم يتم رفع شعار
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <label className="cursor-pointer rounded-2xl bg-[#0D3B34] px-5 py-3 text-center text-xs font-bold text-white">
                    {business.logoUrl
                      ? "تغيير الشعار"
                      : "رفع الشعار"}

                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp"
                      className="hidden"
                      onChange={(event) =>
                        handleLogoChange(
                          event.target
                            .files?.[0]
                        )
                      }
                    />
                  </label>

                  <button
                    type="button"
                    disabled={!business.logoUrl}
                    onClick={removeLogo}
                    className="rounded-2xl border border-[#A3443E]/15 bg-[#FFE9E7] px-5 py-3 text-xs font-bold text-[#A3443E] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    حذف الشعار
                  </button>
                </div>

                <p className="mt-3 text-center text-[10px] text-[#0D3B34]/40">
                  PNG / JPG / WebP — يفضل خلفية شفافة
                </p>
              </div>
            </section>

            <section className="mt-7 overflow-hidden rounded-[30px] border border-white/80 bg-white/72 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-[#0D3B34]/7 px-6 py-5">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
                    LICENSES & DOCUMENTS
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    التراخيص والمستندات
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowLicenseForm(true)
                  }
                  className="rounded-xl bg-[#0D3B34] px-4 py-2.5 text-[10px] font-bold text-white"
                >
                  + إضافة
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-right">
                  <thead>
                    <tr className="border-b border-[#0D3B34]/8 bg-[#FAF9F5] text-[10px] text-[#0D3B34]/45">
                      <th className="px-6 py-4 font-semibold">الترخيص</th>
                      <th className="px-4 py-4 font-semibold">جهة الإصدار</th>
                      <th className="px-4 py-4 font-semibold">الرقم</th>
                      <th className="px-4 py-4 font-semibold">النشاط</th>
                      <th className="px-4 py-4 font-semibold">الإصدار</th>
                      <th className="px-4 py-4 font-semibold">الانتهاء</th>
                      <th className="px-4 py-4 font-semibold">الحالة</th>
                      <th className="px-6 py-4 font-semibold">المستند</th>
                    </tr>
                  </thead>

                  <tbody>
                    {licenses.map((license) => {
                      const status =
                        statusConfig[
                          license.status
                        ];

                      return (
                        <tr
                          key={license.id}
                          className="border-b border-[#0D3B34]/6 last:border-0"
                        >
                          <td className="px-6 py-5 text-xs font-bold">
                            {license.type}
                          </td>

                          <td className="px-4 py-5 text-xs text-[#0D3B34]/60">
                            {license.issuer}
                          </td>

                          <td className="px-4 py-5 text-xs font-semibold">
                            {license.number}
                          </td>

                          <td className="px-4 py-5 text-xs text-[#0D3B34]/60">
                            {license.activity}
                          </td>

                          <td className="px-4 py-5 text-xs">
                            {license.issueDate}
                          </td>

                          <td className="px-4 py-5 text-xs">
                            {license.expiryDate}
                          </td>

                          <td className="px-4 py-5">
                            <span
                              className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <button
                              type="button"
                              className="rounded-xl border border-[#0D3B34]/10 bg-white px-3 py-2 text-[10px] font-bold text-[#0D3B34]/65"
                            >
                              {license.fileName}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-7 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[30px] bg-[#0D3B34] p-6 text-white md:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#E6C24D]">
                      SETTLEMENT ACCOUNT
                    </p>

                    <h2
                      className="mt-2 text-2xl font-bold"
                      style={{
                        fontFamily:
                          "var(--font-el-messiri), serif",
                      }}
                    >
                      الحساب البنكي
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setBankEditing(
                        !bankEditing
                      )
                    }
                    className="rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-[10px] font-bold"
                  >
                    {bankEditing
                      ? "إنهاء"
                      : "تعديل"}
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  <BankField
                    label="IBAN"
                    value={bank.iban}
                    editing={bankEditing}
                    dir="ltr"
                    onChange={(value) =>
                      setBank((current) => ({
                        ...current,
                        iban: value,
                      }))
                    }
                  />

                  <BankField
                    label="اسم البنك"
                    value={bank.bankName}
                    editing={bankEditing}
                    onChange={(value) =>
                      setBank((current) => ({
                        ...current,
                        bankName: value,
                      }))
                    }
                  />

                  <BankField
                    label="SWIFT"
                    value={bank.swift}
                    editing={bankEditing}
                    dir="ltr"
                    onChange={(value) =>
                      setBank((current) => ({
                        ...current,
                        swift: value,
                      }))
                    }
                  />

                  <BankField
                    label="اسم المستفيد"
                    value={bank.beneficiary}
                    editing={bankEditing}
                    dir="ltr"
                    onChange={(value) =>
                      setBank((current) => ({
                        ...current,
                        beneficiary: value,
                      }))
                    }
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <DarkInfo
                      label="العملة"
                      value={bank.currency}
                    />

                    <DarkInfo
                      label="حالة الحساب"
                      value={bank.status}
                    />
                  </div>
                </div>

                <div className="mt-6 rounded-[18px] border border-white/10 bg-white/6 p-4">
                  <p className="text-xs leading-6 text-white/55">
                    في الإنتاج يتم التحقق من IBAN وربطه باسم المنشأة قبل اعتماد الحساب للتسويات.
                  </p>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/80 bg-white/72 p-6 backdrop-blur-xl">
                <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
                  BANK VERIFICATION
                </p>

                <h2
                  className="mt-2 text-xl font-bold"
                  style={{
                    fontFamily:
                      "var(--font-el-messiri), serif",
                  }}
                >
                  حالة التحقق البنكي
                </h2>

                <div className="mt-6 flex items-center gap-3 rounded-[20px] bg-[#EAF5EE] p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#267247] font-bold text-white">
                    ✓
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#267247]">
                      الحساب البنكي موثق
                    </p>

                    <p className="mt-1 text-xs text-[#267247]/65">
                      مطابق لبيانات المنشأة.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <Checklist text="IBAN صالح" />
                  <Checklist text="اسم المستفيد مطابق" />
                  <Checklist text="البنك معروف" />
                  <Checklist text="الحساب مؤهل للتسوية" />
                </div>
              </div>
            </section>

            <section className="mt-7 grid gap-6 xl:grid-cols-2">
              <ContactCard
                eyebrow="PRIMARY CONTACT"
                title="مسؤول التواصل"
                data={contact}
                editing={contactEditing}
                onEdit={() =>
                  setContactEditing(
                    !contactEditing
                  )
                }
                onChange={(field, value) =>
                  setContact((current) => ({
                    ...current,
                    [field]: value,
                  }))
                }
              />

              <ContactCard
                eyebrow="FINANCE CONTACT"
                title="المسؤول المالي"
                data={financeContact}
                editing={financeEditing}
                onEdit={() =>
                  setFinanceEditing(
                    !financeEditing
                  )
                }
                onChange={(field, value) =>
                  setFinanceContact(
                    (current) => ({
                      ...current,
                      [field]: value,
                    })
                  )
                }
              />
            </section>

            <section className="mt-7 rounded-[30px] border border-[#D4AF37]/20 bg-[#FFF9E8] p-6 md:p-7">
              <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
                COMPLIANCE AUTOMATION
              </p>

              <h2
                className="mt-2 text-xl font-bold"
                style={{
                  fontFamily:
                    "var(--font-el-messiri), serif",
                }}
              >
                دورة التحقق والتنبيه
              </h2>

              <div className="mt-6 grid gap-3 md:grid-cols-4">
                <AutomationCard number="60" title="قبل 60 يومًا" text="تنبيه مبكر" />
                <AutomationCard number="30" title="قبل 30 يومًا" text="تنبيه مهم" />
                <AutomationCard number="7" title="قبل 7 أيام" text="تنبيه عاجل" />
                <AutomationCard
                  number="0"
                  title="عند الانتهاء"
                  text="تعليق الخدمات المرتبطة"
                  danger
                />
              </div>
            </section>
          </div>
        </div>
      </div>

      {showLicenseForm && (
        <div className="fixed inset-0 z-[100] bg-[#071E1A]/45 backdrop-blur-sm">
          <div className="absolute inset-y-0 left-0 w-full max-w-[700px] overflow-y-auto bg-[#F8F5ED]">
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#0D3B34]/8 bg-[#F8F5ED]/95 px-6 py-5 backdrop-blur-xl">
              <div>
                <p className="text-[10px] font-bold tracking-[0.17em] text-[#B99124]">
                  NEW LICENSE
                </p>

                <h2
                  className="mt-1 text-2xl font-bold"
                  style={{
                    fontFamily:
                      "var(--font-el-messiri), serif",
                  }}
                >
                  إضافة ترخيص
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowLicenseForm(false)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0D3B34]/10 bg-white text-lg"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 p-6">
              <Field label="نوع الترخيص / المستند">
                <select
                  value={licenseForm.type}
                  onChange={(event) =>
                    setLicenseForm(
                      (current) => ({
                        ...current,
                        type: event.target.value,
                      })
                    )
                  }
                  className={inputClass}
                >
                  <option value="">اختر</option>
                  <option>السجل التجاري</option>
                  <option>وثيقة عمل حر</option>
                  <option>ترخيص وزارة السياحة</option>
                  <option>ترخيص مهني</option>
                  <option>شهادة التسجيل الضريبي</option>
                  <option>ترخيص آخر</option>
                </select>
              </Field>

              <Field label="جهة الإصدار">
                <select
                  value={licenseForm.issuer}
                  onChange={(event) =>
                    setLicenseForm(
                      (current) => ({
                        ...current,
                        issuer:
                          event.target.value,
                      })
                    )
                  }
                  className={inputClass}
                >
                  <option value="">اختر</option>
                  <option>وزارة التجارة</option>
                  <option>وزارة السياحة</option>
                  <option>هيئة الزكاة والضريبة والجمارك</option>
                  <option>وزارة الموارد البشرية والتنمية الاجتماعية</option>
                  <option>أخرى</option>
                </select>
              </Field>

              <Field label="رقم الترخيص">
                <input
                  value={licenseForm.number}
                  onChange={(event) =>
                    setLicenseForm(
                      (current) => ({
                        ...current,
                        number:
                          event.target.value,
                      })
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="النشاط المغطى">
                <input
                  value={licenseForm.activity}
                  onChange={(event) =>
                    setLicenseForm(
                      (current) => ({
                        ...current,
                        activity:
                          event.target.value,
                      })
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="تاريخ الإصدار">
                  <input
                    type="date"
                    value={licenseForm.issueDate}
                    onChange={(event) =>
                      setLicenseForm(
                        (current) => ({
                          ...current,
                          issueDate:
                            event.target.value,
                        })
                      )
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="تاريخ الانتهاء">
                  <input
                    type="date"
                    value={licenseForm.expiryDate}
                    onChange={(event) =>
                      setLicenseForm(
                        (current) => ({
                          ...current,
                          expiryDate:
                            event.target.value,
                        })
                      )
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="المستند PDF">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(event) =>
                    setLicenseForm(
                      (current) => ({
                        ...current,
                        fileName:
                          event.target
                            .files?.[0]?.name ||
                          "",
                      })
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <div className="rounded-[20px] border border-[#D4AF37]/20 bg-[#FFF9E8] p-4">
                <p className="text-xs leading-6 text-[#0D3B34]/60">
                  الترخيص الجديد يدخل بحالة «تحت المراجعة» حتى يتم التحقق منه واعتماده.
                </p>
              </div>

              <button
                type="button"
                onClick={addLicense}
                className="w-full rounded-2xl bg-[#0D3B34] px-6 py-4 text-sm font-bold text-white"
              >
                إرسال الترخيص للمراجعة
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-[560px] -translate-x-1/2 items-center justify-around rounded-[22px] border border-white/80 bg-[#F9F7F0]/94 px-2 py-2 backdrop-blur-xl xl:hidden">
        <MobileNav href="/partner/dashboard" label="الرئيسية" />
        <MobileNav href="/partner/bookings" label="الحجوزات" />
        <MobileNav href="/partner/services" label="الخدمات" />
        <MobileNav href="/partner/team" label="الفريق" />
        <MobileNav href="/partner/business" label="المنشأة" active />
      </nav>
    </main>
  );
}

const inputClass =
  "h-14 w-full rounded-2xl border border-[#0D3B34]/10 bg-[#FAF9F5] px-4 text-sm text-[#0D3B34] outline-none transition placeholder:text-[#0D3B34]/30 focus:border-[#D4AF37]/60 focus:bg-white";

function NavItem({
  href,
  label,
  icon,
  active = false,
}: {
  href: string;
  label: string;
  icon: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
        active
          ? "bg-[#0D3B34] text-white"
          : "text-[#0D3B34]/62 hover:bg-white/70"
      }`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-xl ${
          active
            ? "bg-white/10 text-[#D4AF37]"
            : "bg-[#0D3B34]/6"
        }`}
      >
        {icon}
      </span>

      {label}
    </Link>
  );
}

function SummaryCard({
  label,
  value,
  success = false,
  highlight = false,
  danger = false,
}: {
  label: string;
  value: string;
  success?: boolean;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-[26px] border p-5 ${
        success
          ? "border-[#267247]/15 bg-[#EAF5EE]"
          : highlight
          ? "border-[#D4AF37]/25 bg-[#FFF8E4]"
          : danger
          ? "border-[#A3443E]/15 bg-[#FFE9E7]"
          : "border-white/80 bg-white/72"
      }`}
    >
      <p className="text-xs text-[#0D3B34]/45">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-bold ${
          success
            ? "text-[#267247]"
            : highlight
            ? "text-[#A67B11]"
            : danger
            ? "text-[#A3443E]"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function EditableField({
  label,
  value,
  editing,
  onChange,
  dir = "rtl",
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  dir?: "rtl" | "ltr";
}) {
  return (
    <div className="rounded-[18px] border border-[#0D3B34]/7 bg-[#FAF9F5] p-4">
      <p className="text-[10px] text-[#0D3B34]/40">
        {label}
      </p>

      {editing ? (
        <input
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          dir={dir}
          className="mt-2 h-10 w-full rounded-xl border border-[#0D3B34]/10 bg-white px-3 text-xs outline-none"
        />
      ) : (
        <p
          className="mt-2 break-words text-xs font-bold text-[#0D3B34]/75"
          dir={dir}
        >
          {value || "غير مضاف"}
        </p>
      )}
    </div>
  );
}

function VerifiedField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#267247]/12 bg-[#EAF5EE] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] text-[#267247]/65">
          {label}
        </p>

        <span className="text-[10px] font-bold text-[#267247]">
          ✓ موثق
        </span>
      </div>

      <p className="mt-2 text-xs font-bold text-[#0D3B34]">
        {value}
      </p>
    </div>
  );
}

function BankField({
  label,
  value,
  editing,
  onChange,
  dir = "rtl",
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  dir?: "rtl" | "ltr";
}) {
  return (
    <div>
      <p className="text-[10px] text-white/40">
        {label}
      </p>

      {editing ? (
        <input
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          dir={dir}
          className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white outline-none"
        />
      ) : (
        <p
          className="mt-1 break-words text-sm font-bold text-white/80"
          dir={dir}
        >
          {value}
        </p>
      )}
    </div>
  );
}

function ContactCard({
  eyebrow,
  title,
  data,
  editing,
  onEdit,
  onChange,
}: {
  eyebrow: string;
  title: string;
  data: {
    name: string;
    jobTitle: string;
    email: string;
    phone: string;
    verified: boolean;
  };
  editing: boolean;
  onEdit: () => void;
  onChange: (
    field:
      | "name"
      | "jobTitle"
      | "email"
      | "phone",
    value: string
  ) => void;
}) {
  return (
    <div className="rounded-[30px] border border-white/80 bg-white/72 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
            {eyebrow}
          </p>

          <h2
            className="mt-2 text-xl font-bold"
            style={{
              fontFamily:
                "var(--font-el-messiri), serif",
            }}
          >
            {title}
          </h2>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="rounded-xl border border-[#0D3B34]/10 bg-white px-3 py-2 text-[10px] font-bold"
        >
          {editing ? "إنهاء" : "تعديل"}
        </button>
      </div>

      <div className="mt-6 grid gap-4">
        <EditableField
          label="الاسم"
          value={data.name}
          editing={editing}
          onChange={(value) =>
            onChange("name", value)
          }
        />

        <EditableField
          label="المسمى الوظيفي"
          value={data.jobTitle}
          editing={editing}
          onChange={(value) =>
            onChange("jobTitle", value)
          }
        />

        <EditableField
          label="البريد الإلكتروني"
          value={data.email}
          editing={editing}
          dir="ltr"
          onChange={(value) =>
            onChange("email", value)
          }
        />

        <EditableField
          label="رقم الجوال"
          value={data.phone}
          editing={editing}
          dir="ltr"
          onChange={(value) =>
            onChange("phone", value)
          }
        />
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-[18px] bg-[#EAF5EE] p-4">
        <span className="text-[#267247]">✓</span>
        <p className="text-xs font-bold text-[#267247]">
          الجوال والبريد موثقان
        </p>
      </div>
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
      <span className="mb-2 block text-xs font-semibold text-[#0D3B34]/65">
        {label}
      </span>

      {children}
    </label>
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
    <div className="rounded-2xl bg-white/7 p-4">
      <p className="text-[10px] text-white/40">
        {label}
      </p>

      <p className="mt-1 text-xs font-bold text-white/80">
        {value}
      </p>
    </div>
  );
}

function Checklist({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-[#0D3B34]/7 bg-[#FAF9F5] px-4 py-3">
      <span className="text-[#267247]">✓</span>

      <span className="text-xs font-semibold text-[#0D3B34]/65">
        {text}
      </span>
    </div>
  );
}

function AutomationCard({
  number,
  title,
  text,
  danger = false,
}: {
  number: string;
  title: string;
  text: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border p-4 ${
        danger
          ? "border-[#A3443E]/15 bg-[#FFE9E7]"
          : "border-[#D4AF37]/15 bg-white/65"
      }`}
    >
      <p
        className={`text-2xl font-bold ${
          danger
            ? "text-[#A3443E]"
            : "text-[#B99124]"
        }`}
      >
        {number}
      </p>

      <p className="mt-2 text-xs font-bold">
        {title}
      </p>

      <p className="mt-1 text-[10px] text-[#0D3B34]/45">
        {text}
      </p>
    </div>
  );
}

function MobileNav({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl px-3 py-2 text-[10px] font-bold ${
        active
          ? "bg-[#0D3B34] text-white"
          : "text-[#0D3B34]/55"
      }`}
    >
      {label}
    </Link>
  );
}