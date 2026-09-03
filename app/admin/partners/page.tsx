"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type PartnerStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "NEEDS_INFO"
  | "PRE_APPROVED"
  | "AWAITING_PARTNER_ACCEPTANCE"
  | "PARTNER_ACCEPTED"
  | "ACTIVE"
  | "REJECTED";

type Partner = {
  id: number;
  legalName: string;
  tradeName: string;
  category: string;
  city: string;
  crNumber: string;
  unifiedNumber: string;
  taxNumber: string;
  licenseType: string;
  licenseIssuer: string;
  licenseNumber: string;
  licenseExpiry: string;
  iban: string;
  bankName: string;
  financeContact: string;
  financePhone: string;
  financeEmail: string;
  operationsContact: string;
  operationsPhone: string;
  website: string;
  submittedAt: string;
  status: PartnerStatus;
  commission: number;
  paymentFeeRule: string;
  settlementFee: number;
  settlementCycle: string;
  agreementVersion: string;
};

const initialPartners: Partner[] = [
  {
    id: 1,
    legalName: "شركة تجارب المدينة السياحية المحدودة",
    tradeName: "تجارب المدينة",
    category: "مزود تجربة سياحية",
    city: "المدينة المنورة",
    crNumber: "4650123456",
    unifiedNumber: "7037003618",
    taxNumber: "310123456700003",
    licenseType: "ترخيص خدمات سياحية",
    licenseIssuer: "وزارة السياحة",
    licenseNumber: "73104550",
    licenseExpiry: "2027/05/18",
    iban: "SA0380000000608010167519",
    bankName: "مصرف الراجحي",
    financeContact: "محمد أحمد",
    financePhone: "+966 55 123 4567",
    financeEmail: "finance@example.sa",
    operationsContact: "خالد عبدالله",
    operationsPhone: "+966 54 222 1111",
    website: "https://example.sa",
    submittedAt: "03 سبتمبر 2026 - 11:42 ص",
    status: "UNDER_REVIEW",
    commission: 10,
    paymentFeeRule: "على المورد حسب التكلفة الفعلية",
    settlementFee: 1,
    settlementCycle: "كل 7 أيام",
    agreementVersion: "v1.0",
  },
  {
    id: 2,
    legalName: "مؤسسة مسارات العلا للرحلات",
    tradeName: "مسارات العلا",
    category: "منظم رحلات وتجارب",
    city: "العلا",
    crNumber: "4650987432",
    unifiedNumber: "7041008271",
    taxNumber: "310987654300003",
    licenseType: "ترخيص تنظيم الرحلات",
    licenseIssuer: "وزارة السياحة",
    licenseNumber: "TR-209844",
    licenseExpiry: "2027/01/10",
    iban: "SA1505000068200000000000",
    bankName: "مصرف الإنماء",
    financeContact: "سارة محمد",
    financePhone: "+966 56 330 2121",
    financeEmail: "accounts@example.sa",
    operationsContact: "فهد سالم",
    operationsPhone: "+966 50 890 4431",
    website: "https://example2.sa",
    submittedAt: "02 سبتمبر 2026 - 04:15 م",
    status: "AWAITING_PARTNER_ACCEPTANCE",
    commission: 12,
    paymentFeeRule: "على المورد حسب التكلفة الفعلية",
    settlementFee: 1,
    settlementCycle: "كل 7 أيام",
    agreementVersion: "v1.0",
  },
  {
    id: 3,
    legalName: "مؤسسة ذوق المدينة للمأكولات",
    tradeName: "ذوق المدينة",
    category: "مطعم / تجربة طعام",
    city: "المدينة المنورة",
    crNumber: "4650441990",
    unifiedNumber: "7039448120",
    taxNumber: "310456789100003",
    licenseType: "سجل تجاري",
    licenseIssuer: "وزارة التجارة",
    licenseNumber: "4650441990",
    licenseExpiry: "2027/09/01",
    iban: "SA4420000001234567891234",
    bankName: "بنك الرياض",
    financeContact: "أحمد علي",
    financePhone: "+966 55 981 6610",
    financeEmail: "finance@example3.sa",
    operationsContact: "عمر صالح",
    operationsPhone: "+966 53 331 2440",
    website: "https://example3.sa",
    submittedAt: "01 سبتمبر 2026 - 09:20 ص",
    status: "PARTNER_ACCEPTED",
    commission: 8,
    paymentFeeRule: "على المورد حسب التكلفة الفعلية",
    settlementFee: 1,
    settlementCycle: "كل 14 يوم",
    agreementVersion: "v1.0",
  },
];

const statusConfig: Record<
  PartnerStatus,
  { label: string; className: string }
> = {
  SUBMITTED: {
    label: "تم استلام الطلب",
    className: "bg-[#EAF1EF] text-[#0D3B34]",
  },
  UNDER_REVIEW: {
    label: "تحت التدقيق",
    className: "bg-[#FFF3D2] text-[#8A6510]",
  },
  NEEDS_INFO: {
    label: "مطلوب استكمال",
    className: "bg-[#FFF0E8] text-[#9A4B1F]",
  },
  PRE_APPROVED: {
    label: "موافقة مبدئية",
    className: "bg-[#E8F2FF] text-[#265D91]",
  },
  AWAITING_PARTNER_ACCEPTANCE: {
    label: "بانتظار موافقة الشريك",
    className: "bg-[#F2ECFF] text-[#6942A1]",
  },
  PARTNER_ACCEPTED: {
    label: "وافق على الشروط",
    className: "bg-[#E8F7ED] text-[#227548]",
  },
  ACTIVE: {
    label: "معتمد ونشط",
    className: "bg-[#DDF5E6] text-[#17643B]",
  },
  REJECTED: {
    label: "مرفوض",
    className: "bg-[#FFE5E5] text-[#A43131]",
  },
};

const money = (value: number) =>
  new Intl.NumberFormat("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | PartnerStatus>(
    "ALL"
  );

  const selectedPartner =
    partners.find((partner) => partner.id === selectedId) ?? partners[0];

  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      const text =
        `${partner.legalName} ${partner.tradeName} ${partner.crNumber} ${partner.category}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || partner.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [partners, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: partners.length,
      review: partners.filter((p) => p.status === "UNDER_REVIEW").length,
      waiting: partners.filter(
        (p) => p.status === "AWAITING_PARTNER_ACCEPTANCE"
      ).length,
      final: partners.filter((p) => p.status === "PARTNER_ACCEPTED").length,
      active: partners.filter((p) => p.status === "ACTIVE").length,
    }),
    [partners]
  );

  const updateSelected = (patch: Partial<Partner>) => {
    setPartners((current) =>
      current.map((partner) =>
        partner.id === selectedPartner.id
          ? { ...partner, ...patch }
          : partner
      )
    );
  };

  const sendCommercialTerms = () => {
    updateSelected({
      status: "AWAITING_PARTNER_ACCEPTANCE",
    });
  };

  const requestMoreInfo = () => {
    updateSelected({
      status: "NEEDS_INFO",
    });
  };

  const preApprove = () => {
    updateSelected({
      status: "PRE_APPROVED",
    });
  };

  const finalApprove = () => {
    updateSelected({
      status: "ACTIVE",
    });
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[#F5F1E8] text-[#0D3B34]"
      style={{
        fontFamily: "var(--font-ibm-plex-arabic), sans-serif",
      }}
    >
      {/* SMART BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 top-24 h-[520px] w-[520px] rounded-full bg-[#0D3B34]/7 blur-[110px]" />
        <div className="absolute -left-32 top-[420px] h-[420px] w-[420px] rounded-full bg-[#D4AF37]/10 blur-[110px]" />
        <div className="absolute bottom-[-160px] right-[30%] h-[420px] w-[420px] rounded-full bg-[#B99124]/7 blur-[120px]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#0D3B34]/8 bg-[#F8F5EE]/88 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1580px] items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-4">
            <Image
              src="/Logo/arees-loop-logo.png"
              alt="Arees Loop"
              width={116}
              height={54}
              className="h-auto w-[105px] object-contain"
              priority
            />

            <div className="hidden h-9 w-px bg-[#0D3B34]/10 md:block" />

            <div className="hidden md:block">
              <p className="text-[10px] font-bold tracking-[0.18em] text-[#B99124]">
                AREES LOOP ADMIN
              </p>
              <p className="mt-1 text-sm font-semibold text-[#0D3B34]/70">
                إدارة واعتماد الشركاء
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-[#0D3B34]/10 bg-white/70 px-4 py-2.5 text-xs font-semibold text-[#0D3B34]/70 transition hover:bg-white"
            >
              عرض المنصة
            </Link>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D3B34] text-sm font-bold text-[#D4AF37]">
              م
            </div>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-[1580px] px-5 py-8 lg:px-10">
        {/* TITLE */}
        <section className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-bold tracking-[0.22em] text-[#B99124]">
              PARTNER GOVERNANCE
            </p>

            <h1
              className="text-3xl font-bold tracking-tight md:text-[38px]"
              style={{
                fontFamily: "var(--font-el-messiri), serif",
              }}
            >
              طلبات الشركاء
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#0D3B34]/60">
              مراجعة بيانات المنشآت، التحقق من التراخيص، تحديد الشروط
              التجارية، إرسال الاتفاقيات واعتماد الشريك قبل تفعيل خدماته.
            </p>
          </div>

          <button
            type="button"
            className="rounded-2xl bg-[#0D3B34] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            + إضافة شريك يدويًا
          </button>
        </section>

        {/* STATS */}
        <section className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            ["إجمالي الطلبات", stats.total],
            ["تحت التدقيق", stats.review],
            ["بانتظار الشريك", stats.waiting],
            ["بانتظار الاعتماد النهائي", stats.final],
            ["نشط", stats.active],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-[22px] border border-white/80 bg-white/65 p-5 backdrop-blur-xl"
            >
              <p className="text-xs font-medium text-[#0D3B34]/55">{label}</p>
              <p className="mt-3 text-3xl font-bold text-[#0D3B34]">{value}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
          {/* PARTNERS LIST */}
          <section className="rounded-[28px] border border-white/80 bg-white/68 p-5 backdrop-blur-xl md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "var(--font-el-messiri), serif",
                  }}
                >
                  قائمة الطلبات
                </h2>
                <p className="mt-1 text-xs text-[#0D3B34]/50">
                  اختر منشأة لعرض ملف التدقيق.
                </p>
              </div>

              <span className="rounded-full bg-[#0D3B34]/7 px-3 py-1 text-xs font-semibold">
                {filteredPartners.length}
              </span>
            </div>

            <div className="mb-5 grid gap-3 md:grid-cols-[1fr_170px]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث بالاسم أو السجل أو النشاط..."
                className="h-12 rounded-2xl border border-[#0D3B34]/10 bg-[#F9F7F2] px-4 text-sm outline-none transition focus:border-[#B99124]/50"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as "ALL" | PartnerStatus
                  )
                }
                className="h-12 rounded-2xl border border-[#0D3B34]/10 bg-[#F9F7F2] px-4 text-sm outline-none"
              >
                <option value="ALL">كل الحالات</option>
                <option value="SUBMITTED">تم استلام الطلب</option>
                <option value="UNDER_REVIEW">تحت التدقيق</option>
                <option value="NEEDS_INFO">مطلوب استكمال</option>
                <option value="PRE_APPROVED">موافقة مبدئية</option>
                <option value="AWAITING_PARTNER_ACCEPTANCE">
                  بانتظار موافقة الشريك
                </option>
                <option value="PARTNER_ACCEPTED">وافق على الشروط</option>
                <option value="ACTIVE">نشط</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredPartners.map((partner) => {
                const active = partner.id === selectedPartner.id;
                const status = statusConfig[partner.status];

                return (
                  <button
                    key={partner.id}
                    type="button"
                    onClick={() => setSelectedId(partner.id)}
                    className={`w-full rounded-[22px] border p-4 text-right transition ${
                      active
                        ? "border-[#D4AF37]/45 bg-[#0D3B34] text-white"
                        : "border-[#0D3B34]/8 bg-[#FAF9F5] hover:border-[#D4AF37]/35"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold">
                          {partner.tradeName}
                        </h3>

                        <p
                          className={`mt-1 truncate text-xs ${
                            active ? "text-white/60" : "text-[#0D3B34]/50"
                          }`}
                        >
                          {partner.legalName}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          active
                            ? "bg-white/12 text-[#F2D56B]"
                            : status.className
                        }`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div
                      className={`mt-4 flex items-center justify-between text-[11px] ${
                        active ? "text-white/65" : "text-[#0D3B34]/50"
                      }`}
                    >
                      <span>{partner.category}</span>
                      <span>{partner.city}</span>
                    </div>

                    <div
                      className={`mt-3 border-t pt-3 text-[10px] ${
                        active
                          ? "border-white/10 text-white/45"
                          : "border-[#0D3B34]/7 text-[#0D3B34]/40"
                      }`}
                    >
                      {partner.submittedAt}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* REVIEW PANEL */}
          <section className="overflow-hidden rounded-[30px] border border-white/80 bg-white/72 backdrop-blur-xl">
            {/* PROFILE HEADER */}
            <div className="border-b border-[#0D3B34]/7 p-6 md:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        statusConfig[selectedPartner.status].className
                      }`}
                    >
                      {statusConfig[selectedPartner.status].label}
                    </span>

                    <span className="rounded-full bg-[#0D3B34]/6 px-3 py-1 text-[11px] font-medium text-[#0D3B34]/65">
                      طلب #{String(selectedPartner.id).padStart(5, "0")}
                    </span>
                  </div>

                  <h2
                    className="text-2xl font-bold md:text-[30px]"
                    style={{
                      fontFamily: "var(--font-el-messiri), serif",
                    }}
                  >
                    {selectedPartner.tradeName}
                  </h2>

                  <p className="mt-2 text-sm text-[#0D3B34]/55">
                    {selectedPartner.legalName}
                  </p>
                </div>

                <div className="rounded-[20px] bg-[#F4F1E9] px-4 py-3 text-left">
                  <p className="text-[10px] font-semibold text-[#0D3B34]/45">
                    العمولة الحالية
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#B99124]">
                    {selectedPartner.commission}%
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6 md:p-8">
              {/* LEGAL */}
              <ReviewCard
                title="البيانات القانونية"
                badge="LEGAL"
                items={[
                  ["الرقم الموحد", selectedPartner.unifiedNumber],
                  ["السجل التجاري", selectedPartner.crNumber],
                  ["الرقم الضريبي", selectedPartner.taxNumber],
                  ["النشاط", selectedPartner.category],
                ]}
              />

              {/* LICENSE */}
              <ReviewCard
                title="الترخيص"
                badge="LICENSE"
                items={[
                  ["نوع الترخيص", selectedPartner.licenseType],
                  ["جهة الإصدار", selectedPartner.licenseIssuer],
                  ["رقم الترخيص", selectedPartner.licenseNumber],
                  ["تاريخ الانتهاء", selectedPartner.licenseExpiry],
                ]}
              />

              {/* BANK */}
              <ReviewCard
                title="البيانات البنكية"
                badge="FINANCE"
                items={[
                  ["البنك", selectedPartner.bankName],
                  ["IBAN", selectedPartner.iban],
                  ["العملة", "SAR"],
                  ["حالة التحقق", "جاهز للمراجعة"],
                ]}
              />

              {/* CONTACTS */}
              <div className="rounded-[24px] border border-[#0D3B34]/8 bg-[#FAF9F6] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
                      CONTACTS
                    </p>
                    <h3 className="mt-1 text-base font-bold">
                      جهات التواصل
                    </h3>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <ContactCard
                    title="المسؤول المالي"
                    name={selectedPartner.financeContact}
                    phone={selectedPartner.financePhone}
                    email={selectedPartner.financeEmail}
                  />

                  <ContactCard
                    title="مسؤول التشغيل"
                    name={selectedPartner.operationsContact}
                    phone={selectedPartner.operationsPhone}
                    email="operations@partner.sa"
                  />
                </div>

                <div className="mt-4 rounded-2xl border border-[#D4AF37]/18 bg-[#FFF9EA] px-4 py-3 text-xs leading-6 text-[#0D3B34]/65">
                  الموقع الإلكتروني وحسابات التواصل محفوظة لأغراض التحقق
                  والتشغيل فقط، ولا تظهر للزائر في Arees Loop.
                </div>
              </div>

              {/* COMMERCIAL TERMS */}
              <div className="rounded-[26px] border border-[#D4AF37]/22 bg-gradient-to-br from-[#FFFDF7] to-[#F8F2DF] p-5 md:p-6">
                <div className="mb-5">
                  <p className="text-[10px] font-bold tracking-[0.18em] text-[#B99124]">
                    COMMERCIAL TERMS
                  </p>
                  <h3
                    className="mt-1 text-xl font-bold"
                    style={{
                      fontFamily: "var(--font-el-messiri), serif",
                    }}
                  >
                    العرض التجاري والاتفاقية
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="عمولة Arees Loop">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={selectedPartner.commission}
                        onChange={(event) =>
                          updateSelected({
                            commission: Number(event.target.value),
                          })
                        }
                        className="h-12 w-full rounded-2xl border border-[#0D3B34]/10 bg-white px-4 pl-12 text-sm font-semibold outline-none focus:border-[#D4AF37]/60"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#B99124]">
                        %
                      </span>
                    </div>
                  </Field>

                  <Field label="رسوم التحويل لكل تسوية">
                    <div className="relative">
                      <input
                        type="number"
                        value={selectedPartner.settlementFee}
                        onChange={(event) =>
                          updateSelected({
                            settlementFee: Number(event.target.value),
                          })
                        }
                        className="h-12 w-full rounded-2xl border border-[#0D3B34]/10 bg-white px-4 pl-16 text-sm font-semibold outline-none focus:border-[#D4AF37]/60"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#0D3B34]/50">
                        ريال
                      </span>
                    </div>
                  </Field>

                  <Field label="دورة التسوية">
                    <select
                      value={selectedPartner.settlementCycle}
                      onChange={(event) =>
                        updateSelected({
                          settlementCycle: event.target.value,
                        })
                      }
                      className="h-12 w-full rounded-2xl border border-[#0D3B34]/10 bg-white px-4 text-sm outline-none"
                    >
                      <option>كل 3 أيام</option>
                      <option>كل 7 أيام</option>
                      <option>كل 14 يوم</option>
                      <option>شهريًا</option>
                    </select>
                  </Field>

                  <Field label="رسوم الدفع الإلكتروني">
                    <select
                      value={selectedPartner.paymentFeeRule}
                      onChange={(event) =>
                        updateSelected({
                          paymentFeeRule: event.target.value,
                        })
                      }
                      className="h-12 w-full rounded-2xl border border-[#0D3B34]/10 bg-white px-4 text-sm outline-none"
                    >
                      <option>على المورد حسب التكلفة الفعلية</option>
                      <option>تتحملها Arees Loop</option>
                      <option>نسبة متفق عليها</option>
                    </select>
                  </Field>
                </div>

                <div className="mt-5 grid gap-3 rounded-[20px] border border-[#0D3B34]/7 bg-white/80 p-4 text-xs md:grid-cols-3">
                  <div>
                    <p className="text-[#0D3B34]/45">نسخة الاتفاقية</p>
                    <p className="mt-1 font-bold">
                      {selectedPartner.agreementVersion}
                    </p>
                  </div>

                  <div>
                    <p className="text-[#0D3B34]/45">
                      رسوم التحويل
                    </p>
                    <p className="mt-1 font-bold">
                      {money(selectedPartner.settlementFee)} ريال
                    </p>
                  </div>

                  <div>
                    <p className="text-[#0D3B34]/45">الفوترة</p>
                    <p className="mt-1 font-bold">
                      إصدار نيابة عن المورد
                    </p>
                  </div>
                </div>
              </div>

              {/* WORKFLOW */}
              <div className="rounded-[26px] bg-[#0D3B34] p-5 text-white md:p-6">
                <p className="text-[10px] font-bold tracking-[0.18em] text-[#E5BE45]">
                  APPROVAL WORKFLOW
                </p>

                <h3
                  className="mt-2 text-xl font-bold"
                  style={{
                    fontFamily: "var(--font-el-messiri), serif",
                  }}
                >
                  قرار الإدارة
                </h3>

                <p className="mt-2 text-xs leading-6 text-white/55">
                  جميع إجراءات الاعتماد الحالية Frontend Demo فقط. لاحقًا
                  ترتبط بسجل تدقيق وصلاحيات إدارية وقاعدة بيانات حقيقية.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <ActionButton
                    onClick={requestMoreInfo}
                    label="طلب استكمال"
                    secondary
                  />

                  <ActionButton
                    onClick={preApprove}
                    label="موافقة مبدئية"
                    secondary
                  />

                  <ActionButton
                    onClick={sendCommercialTerms}
                    label="إرسال الشروط والعقد"
                    gold
                  />

                  <ActionButton
                    onClick={finalApprove}
                    label="اعتماد وتفعيل"
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-5">
                  <span className="text-xs text-white/45">
                    الحالة الحالية:
                  </span>

                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#F1D263]">
                    {statusConfig[selectedPartner.status].label}
                  </span>
                </div>
              </div>

              {/* AUDIT */}
              <div className="rounded-[22px] border border-[#0D3B34]/8 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
                      AUDIT TRAIL
                    </p>
                    <h3 className="mt-1 text-sm font-bold">
                      سجل التدقيق
                    </h3>
                  </div>

                  <span className="rounded-full bg-[#0D3B34]/5 px-3 py-1 text-[10px] font-semibold text-[#0D3B34]/50">
                    Prototype
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <AuditRow
                    title="تم استلام طلب الشريك"
                    meta={selectedPartner.submittedAt}
                  />
                  <AuditRow
                    title="تم فتح ملف التدقيق"
                    meta="بواسطة إدارة Arees Loop"
                  />
                  <AuditRow
                    title={`العمولة الحالية ${selectedPartner.commission}%`}
                    meta="Commercial Terms"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function ReviewCard({
  title,
  badge,
  items,
}: {
  title: string;
  badge: string;
  items: [string, string][];
}) {
  return (
    <div className="rounded-[24px] border border-[#0D3B34]/8 bg-[#FAF9F6] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
            {badge}
          </p>
          <h3 className="mt-1 text-base font-bold">{title}</h3>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F0ED] text-sm text-[#0D3B34]">
          ✓
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-[#0D3B34]/6 bg-white px-4 py-3"
          >
            <p className="text-[10px] font-medium text-[#0D3B34]/42">
              {label}
            </p>
            <p className="mt-1 break-words text-xs font-semibold text-[#0D3B34]/75">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactCard({
  title,
  name,
  phone,
  email,
}: {
  title: string;
  name: string;
  phone: string;
  email: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#0D3B34]/7 bg-white p-4">
      <p className="text-[10px] font-semibold text-[#B99124]">{title}</p>
      <p className="mt-2 text-sm font-bold">{name}</p>
      <p className="mt-2 text-xs text-[#0D3B34]/55">{phone}</p>
      <p className="mt-1 break-all text-xs text-[#0D3B34]/55">{email}</p>
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

function ActionButton({
  label,
  onClick,
  secondary = false,
  gold = false,
}: {
  label: string;
  onClick: () => void;
  secondary?: boolean;
  gold?: boolean;
}) {
  let style =
    "bg-white text-[#0D3B34] hover:bg-[#F7F3E9]";

  if (secondary) {
    style =
      "border border-white/15 bg-white/7 text-white hover:bg-white/12";
  }

  if (gold) {
    style =
      "bg-[#D4AF37] text-[#0D3B34] hover:bg-[#E2BE4C]";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 text-xs font-bold transition hover:-translate-y-0.5 ${style}`}
    >
      {label}
    </button>
  );
}

function AuditRow({
  title,
  meta,
}: {
  title: string;
  meta: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#D4AF37]" />

      <div>
        <p className="font-semibold text-[#0D3B34]/75">{title}</p>
        <p className="mt-1 text-[10px] text-[#0D3B34]/40">{meta}</p>
      </div>
    </div>
  );
}