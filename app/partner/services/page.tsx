"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ServiceStatus =
  | "DRAFT"
  | "UNDER_REVIEW"
  | "PUBLISHED"
  | "SUSPENDED";

type Service = {
  id: number;
  nameAr: string;
  nameEn: string;
  category: string;
  subCategory: string;
  license: string;
  city: string;
  locationName: string;
  basePrice: number;
  vatRate: number;
  finalPrice: number;
  capacity: number;
  bookings: number;
  status: ServiceStatus;
  imageCount: number;
};

const statusConfig: Record<
  ServiceStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "مسودة",
    className: "bg-[#F0EFEB] text-[#687873]",
  },
  UNDER_REVIEW: {
    label: "تحت المراجعة",
    className: "bg-[#FFF3D4] text-[#8C6813]",
  },
  PUBLISHED: {
    label: "منشورة",
    className: "bg-[#E6F5EB] text-[#267247]",
  },
  SUSPENDED: {
    label: "موقوفة",
    className: "bg-[#FFE9E7] text-[#A3443E]",
  },
};

const initialServices: Service[] = [
  {
    id: 1,
    nameAr: "متحف وبستان الصافية",
    nameEn: "Al Safiya Museum & Garden",
    category: "وجهة أو موقع سياحي",
    subCategory: "متحف",
    license: "ترخيص وزارة السياحة - 73104550",
    city: "المدينة المنورة",
    locationName: "المنطقة المركزية",
    basePrice: 60.87,
    vatRate: 15,
    finalPrice: 70,
    capacity: 80,
    bookings: 42,
    status: "PUBLISHED",
    imageCount: 6,
  },
  {
    id: 2,
    nameAr: "جولة المدينة التاريخية",
    nameEn: "Historic Madinah Tour",
    category: "تنظيم الرحلات السياحية",
    subCategory: "جولات يومية",
    license: "ترخيص تنظيم الرحلات - TR-209844",
    city: "المدينة المنورة",
    locationName: "نقطة تجمع معتمدة",
    basePrice: 121.74,
    vatRate: 15,
    finalPrice: 140,
    capacity: 18,
    bookings: 31,
    status: "PUBLISHED",
    imageCount: 8,
  },
  {
    id: 3,
    nameAr: "تجربة طعام مدينية",
    nameEn: "Madinah Food Experience",
    category: "مزود تجربة أو نشاط",
    subCategory: "تجربة طعام",
    license: "ترخيص النشاط - ACT-55821",
    city: "المدينة المنورة",
    locationName: "قباء",
    basePrice: 82.61,
    vatRate: 15,
    finalPrice: 95,
    capacity: 14,
    bookings: 18,
    status: "UNDER_REVIEW",
    imageCount: 5,
  },
];

const categories: Record<string, string[]> = {
  "وكالات سفر وسياحة": [
    "حجوزات السفر",
    "حجوزات الطيران",
    "حجوزات الفنادق",
    "خدمات التأشيرات",
  ],
  "خدمات سفر وسياحة (عام)": [
    "خدمات حجز",
    "خدمات استقبال",
    "خدمات مساندة للمسافر",
  ],
  "تنظيم الرحلات السياحية": [
    "جولات يومية",
    "برامج سياحية",
    "رحلات داخلية",
    "رحلات جماعية",
  ],
  "حجز وحدات الضيافة": [
    "فنادق",
    "شقق مخدومة",
    "منتجعات",
    "نزل",
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
  ],
  "وجهة أو موقع سياحي": [
    "متحف",
    "مركز زوار",
    "موقع تراثي",
    "معلم سياحي",
    "وجهة ترفيهية",
  ],
  "خدمات نقل": [
    "نقل أفراد",
    "نقل مجموعات",
    "تنقل بين المدن",
    "خدمة سائق",
  ],
  "إيواء سياحي": [
    "فندق",
    "منتجع",
    "شقق مخدومة",
    "نزل",
  ],
  "مطعم أو مقهى": [
    "مطعم",
    "مقهى",
    "تجربة طعام",
  ],
  "فعاليات وترفيه": [
    "فعالية",
    "مهرجان",
    "عرض ترفيهي",
    "نشاط عائلي",
  ],
  "متجر أو نشاط للزائر": [
    "هدايا",
    "منتجات محلية",
    "تجزئة",
  ],
};

const verifiedLicenses = [
  "ترخيص وزارة السياحة - 73104550",
  "ترخيص تنظيم الرحلات - TR-209844",
  "ترخيص النشاط - ACT-55821",
];

const money = (value: number) =>
  new Intl.NumberFormat("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function PartnerServicesPage() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | ServiceStatus
  >("ALL");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    nameAr: "",
    nameEn: "",
    category: "",
    subCategory: "",
    license: "",
    city: "",
    locationName: "",
    basePrice: "",
    vatRate: "15",
    capacity: "",
    descriptionAr: "",
    descriptionEn: "",
    cancellationPolicy: "",
    meetingInstructions: "",
    images: [] as string[],
  });

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const searchable =
        `${service.nameAr} ${service.nameEn} ${service.category} ${service.subCategory}`.toLowerCase();

      const matchesSearch = searchable.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || service.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [services, search, statusFilter]);

  const summary = useMemo(
    () => ({
      total: services.length,
      published: services.filter(
        (service) => service.status === "PUBLISHED"
      ).length,
      review: services.filter(
        (service) => service.status === "UNDER_REVIEW"
      ).length,
      draft: services.filter(
        (service) => service.status === "DRAFT"
      ).length,
    }),
    [services]
  );

  const calculatedFinalPrice = useMemo(() => {
    const base = Number(form.basePrice) || 0;
    const vat = Number(form.vatRate) || 0;

    return base + base * (vat / 100);
  }, [form.basePrice, form.vatRate]);

  const resetForm = () => {
    setForm({
      nameAr: "",
      nameEn: "",
      category: "",
      subCategory: "",
      license: "",
      city: "",
      locationName: "",
      basePrice: "",
      vatRate: "15",
      capacity: "",
      descriptionAr: "",
      descriptionEn: "",
      cancellationPolicy: "",
      meetingInstructions: "",
      images: [],
    });
  };

  const saveDraft = () => {
    const newService: Service = {
      id: Date.now(),
      nameAr: form.nameAr || "خدمة جديدة",
      nameEn: form.nameEn || "New Service",
      category: form.category || "غير محدد",
      subCategory: form.subCategory || "غير محدد",
      license: form.license || "غير مرتبط",
      city: form.city || "غير محدد",
      locationName: form.locationName || "غير محدد",
      basePrice: Number(form.basePrice) || 0,
      vatRate: Number(form.vatRate) || 0,
      finalPrice: calculatedFinalPrice,
      capacity: Number(form.capacity) || 0,
      bookings: 0,
      status: "DRAFT",
      imageCount: form.images.length,
    };

    setServices((current) => [newService, ...current]);
    resetForm();
    setShowForm(false);
  };

  const submitForReview = () => {
    const newService: Service = {
      id: Date.now(),
      nameAr: form.nameAr || "خدمة جديدة",
      nameEn: form.nameEn || "New Service",
      category: form.category || "غير محدد",
      subCategory: form.subCategory || "غير محدد",
      license: form.license || "غير مرتبط",
      city: form.city || "غير محدد",
      locationName: form.locationName || "غير محدد",
      basePrice: Number(form.basePrice) || 0,
      vatRate: Number(form.vatRate) || 0,
      finalPrice: calculatedFinalPrice,
      capacity: Number(form.capacity) || 0,
      bookings: 0,
      status: "UNDER_REVIEW",
      imageCount: form.images.length,
    };

    setServices((current) => [newService, ...current]);
    resetForm();
    setShowForm(false);
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F7F4EA] text-[#0D3B34]"
      style={{
        fontFamily: "var(--font-ibm-plex-arabic), sans-serif",
      }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-[#0D3B34]/6 blur-[120px]" />
        <div className="absolute -left-40 top-[40%] h-[450px] w-[450px] rounded-full bg-[#D4AF37]/10 blur-[125px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden w-[270px] shrink-0 border-l border-[#0D3B34]/8 bg-[#F9F7F0]/92 px-4 py-5 backdrop-blur-xl xl:block">
          <div className="mb-7 px-3">
            <p className="text-[10px] font-bold tracking-[0.22em] text-[#B99124]">
              AREES LOOP PARTNER
            </p>

            <h2
              className="mt-2 text-xl font-bold"
              style={{
                fontFamily: "var(--font-el-messiri), serif",
              }}
            >
              لوحة الشريك
            </h2>
          </div>

          <nav className="space-y-2">
            <NavItem href="/partner/dashboard" label="الرئيسية" icon="⌂" />

            <NavItem href="/partner/bookings" label="الحجوزات" icon="▣" />

            <NavItem
              href="/partner/services"
              label="الخدمات"
              icon="◈"
              active
            />

            <NavItem
              href="/partner/settlements"
              label="التسويات"
              icon="﷼"
            />

            <NavItem href="/partner/invoices" label="الفواتير" icon="▤" />

            <NavItem href="/partner/reports" label="التقارير" icon="◫" />

            <NavItem
              href="/partner/team"
              label="الموظفون والصلاحيات"
              icon="◎"
            />

            <NavItem
              href="/partner/business"
              label="المنشأة والتراخيص"
              icon="◇"
            />

            <NavItem
              href="/partner/agreement"
              label="الاتفاقية والإعدادات"
              icon="✓"
            />
          </nav>

          <div className="mt-8 rounded-[24px] bg-[#0D3B34] p-5 text-white">
            <p className="text-[10px] font-bold tracking-[0.16em] text-[#E6C24D]">
              SERVICE GOVERNANCE
            </p>

            <p className="mt-2 text-sm font-bold">
              {summary.published} خدمات منشورة
            </p>

            <p className="mt-2 text-xs leading-6 text-white/50">
              أي خدمة جديدة تحتاج مراجعة قبل ظهورها للزائر.
            </p>
          </div>
        </aside>

        {/* CONTENT */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-[#0D3B34]/8 bg-[#F9F7F0]/90 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-8">
              <div>
                <p className="text-[10px] text-[#0D3B34]/45">
                  تجارب المدينة
                </p>

                <p className="mt-1 text-sm font-bold">
                  إدارة الخدمات
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
            {/* TITLE */}
            <section className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-[0.22em] text-[#B99124]">
                  SERVICES & EXPERIENCES
                </p>

                <h1
                  className="mt-2 text-3xl font-bold md:text-[42px]"
                  style={{
                    fontFamily: "var(--font-el-messiri), serif",
                  }}
                >
                  الخدمات والتجارب
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#0D3B34]/60">
                  أضف خدماتك وأسعارك وصورها واربط كل خدمة بالترخيص
                  المعتمد قبل إرسالها للمراجعة.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="rounded-2xl bg-[#0D3B34] px-6 py-3.5 text-sm font-bold text-white"
              >
                + إضافة خدمة جديدة
              </button>
            </section>

            {/* SUMMARY */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="إجمالي الخدمات"
                value={String(summary.total)}
              />

              <SummaryCard
                label="منشورة"
                value={String(summary.published)}
                success
              />

              <SummaryCard
                label="تحت المراجعة"
                value={String(summary.review)}
                highlight
              />

              <SummaryCard
                label="مسودات"
                value={String(summary.draft)}
              />
            </section>

            {/* FILTERS */}
            <section className="mt-7 rounded-[28px] border border-white/80 bg-white/72 p-5 backdrop-blur-xl">
              <div className="grid gap-3 lg:grid-cols-[1fr_200px_auto]">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث باسم الخدمة أو النشاط..."
                  className={inputClass}
                />

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as "ALL" | ServiceStatus
                    )
                  }
                  className={inputClass}
                >
                  <option value="ALL">كل الحالات</option>
                  <option value="PUBLISHED">منشورة</option>
                  <option value="UNDER_REVIEW">تحت المراجعة</option>
                  <option value="DRAFT">مسودة</option>
                  <option value="SUSPENDED">موقوفة</option>
                </select>

                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="h-14 rounded-2xl border border-[#D4AF37]/35 bg-[#FFF8E4] px-5 text-xs font-bold text-[#8B6812]"
                >
                  إضافة خدمة
                </button>
              </div>
            </section>

            {/* SERVICES GRID */}
            <section className="mt-6 grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
              {filteredServices.map((service) => {
                const status = statusConfig[service.status];

                return (
                  <div
                    key={service.id}
                    className="overflow-hidden rounded-[28px] border border-white/80 bg-white/72 backdrop-blur-xl"
                  >
                    {/* IMAGE PLACEHOLDER */}
                    <div className="relative flex h-[180px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#D9E5DF] via-[#F1E8D1] to-[#E8DFC3]">
                      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-[#0D3B34]/10" />
                      <div className="absolute bottom-[-40px] left-5 h-32 w-32 rounded-full border border-[#D4AF37]/25" />

                      <div className="relative text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0D3B34] text-xl text-[#D4AF37]">
                          ◈
                        </div>

                        <p className="mt-3 text-xs font-bold text-[#0D3B34]/55">
                          {service.imageCount} صور
                        </p>
                      </div>

                      <span
                        className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-bold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="p-5">
                      <p className="text-[10px] font-semibold text-[#B99124]">
                        {service.category}
                      </p>

                      <h2 className="mt-2 text-lg font-bold">
                        {service.nameAr}
                      </h2>

                      <p className="mt-1 text-xs text-[#0D3B34]/42">
                        {service.nameEn}
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <InfoBox
                          label="السعر"
                          value={`${money(service.finalPrice)} ر.س`}
                        />

                        <InfoBox
                          label="الحجوزات"
                          value={String(service.bookings)}
                        />

                        <InfoBox
                          label="السعة"
                          value={`${service.capacity} زائر`}
                        />

                        <InfoBox
                          label="الضريبة"
                          value={`${service.vatRate}%`}
                        />
                      </div>

                      <div className="mt-4 rounded-2xl bg-[#F7F6F1] p-4">
                        <p className="text-[10px] text-[#0D3B34]/40">
                          الترخيص المرتبط
                        </p>

                        <p className="mt-1 text-xs font-semibold text-[#0D3B34]/70">
                          {service.license}
                        </p>
                      </div>

                      <div className="mt-5 flex gap-2">
                        <button
                          type="button"
                          className="flex-1 rounded-2xl bg-[#0D3B34] px-4 py-3 text-xs font-bold text-white"
                        >
                          تعديل الخدمة
                        </button>

                        <button
                          type="button"
                          className="rounded-2xl border border-[#0D3B34]/10 bg-white px-4 py-3 text-xs font-bold text-[#0D3B34]/60"
                        >
                          معاينة
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {filteredServices.length === 0 && (
              <div className="mt-6 rounded-[28px] border border-white/80 bg-white/70 px-6 py-16 text-center">
                <p className="font-bold">لا توجد خدمات مطابقة</p>

                <p className="mt-2 text-xs text-[#0D3B34]/45">
                  غيّر البحث أو حالة الخدمة.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADD SERVICE DRAWER */}
      {showForm && (
        <div className="fixed inset-0 z-[100] bg-[#071E1A]/45 backdrop-blur-sm">
          <div className="absolute inset-y-0 left-0 w-full max-w-[820px] overflow-y-auto bg-[#F8F5ED] shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-[#0D3B34]/8 bg-[#F8F5ED]/95 px-6 py-5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.18em] text-[#B99124]">
                    NEW SERVICE
                  </p>

                  <h2
                    className="mt-1 text-2xl font-bold"
                    style={{
                      fontFamily: "var(--font-el-messiri), serif",
                    }}
                  >
                    إضافة خدمة جديدة
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0D3B34]/10 bg-white text-lg"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {/* BASIC INFO */}
              <FormSection
                eyebrow="BASIC INFORMATION"
                title="معلومات الخدمة"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="اسم الخدمة بالعربية">
                    <input
                      value={form.nameAr}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          nameAr: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Service Name">
                    <input
                      value={form.nameEn}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          nameEn: e.target.value,
                        }))
                      }
                      className={inputClass}
                      dir="ltr"
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="النشاط">
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          category: e.target.value,
                          subCategory: "",
                        }))
                      }
                      className={inputClass}
                    >
                      <option value="">اختر النشاط</option>

                      {Object.keys(categories).map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="التصنيف الفرعي">
                    <select
                      value={form.subCategory}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          subCategory: e.target.value,
                        }))
                      }
                      className={inputClass}
                    >
                      <option value="">اختر</option>

                      {(categories[form.category] || []).map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="الترخيص المرتبط بالخدمة">
                  <select
                    value={form.license}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        license: e.target.value,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="">
                      اختر ترخيصًا معتمدًا
                    </option>

                    {verifiedLicenses.map((license) => (
                      <option key={license}>{license}</option>
                    ))}
                  </select>
                </Field>

                <div className="rounded-[18px] border border-[#D4AF37]/20 bg-[#FFF9E8] p-4 text-xs leading-6 text-[#0D3B34]/65">
                  في الإنتاج، ستظهر هنا فقط التراخيص المعتمدة التي تغطي
                  النشاط المختار.
                </div>
              </FormSection>

              {/* DESCRIPTION */}
              <FormSection
                eyebrow="CONTENT"
                title="وصف الخدمة"
              >
                <Field label="الوصف بالعربية">
                  <textarea
                    value={form.descriptionAr}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        descriptionAr: e.target.value,
                      }))
                    }
                    rows={5}
                    className={`${inputClass} h-auto min-h-[140px] py-4`}
                  />
                </Field>

                <Field label="Description in English">
                  <textarea
                    value={form.descriptionEn}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        descriptionEn: e.target.value,
                      }))
                    }
                    rows={5}
                    dir="ltr"
                    className={`${inputClass} h-auto min-h-[140px] py-4`}
                  />
                </Field>
              </FormSection>

              {/* LOCATION */}
              <FormSection
                eyebrow="LOCATION"
                title="الموقع والتنفيذ"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="المدينة">
                    <input
                      value={form.city}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          city: e.target.value,
                        }))
                      }
                      placeholder="المدينة المنورة"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="اسم الموقع / نقطة التجمع">
                    <input
                      value={form.locationName}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          locationName: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="تعليمات الوصول بعد الحجز">
                  <textarea
                    value={form.meetingInstructions}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        meetingInstructions: e.target.value,
                      }))
                    }
                    rows={3}
                    className={`${inputClass} h-auto py-4`}
                    placeholder="المعلومات التشغيلية التي تظهر للعميل بعد الحجز..."
                  />
                </Field>

                <div className="rounded-[18px] bg-[#EEF3F0] p-4 text-xs leading-6 text-[#0D3B34]/65">
                  بيانات التواصل المباشر للمورد لا تظهر في صفحة الخدمة.
                  العميل يحصل فقط على معلومات التنفيذ اللازمة للحجز.
                </div>
              </FormSection>

              {/* PRICING */}
              <FormSection
                eyebrow="PRICING & VAT"
                title="السعر والضريبة"
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="السعر قبل الضريبة">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.basePrice}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          basePrice: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="VAT">
                    <select
                      value={form.vatRate}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          vatRate: e.target.value,
                        }))
                      }
                      className={inputClass}
                    >
                      <option value="15">15%</option>
                      <option value="0">0%</option>
                    </select>
                  </Field>

                  <div>
                    <p className="mb-2 text-xs font-semibold text-[#0D3B34]/65">
                      السعر النهائي
                    </p>

                    <div className="flex h-14 items-center rounded-2xl bg-[#0D3B34] px-4 text-lg font-bold text-[#F1C94C]">
                      {money(calculatedFinalPrice)} ر.س
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <InfoBox
                    label="قيمة الضريبة"
                    value={`${money(
                      calculatedFinalPrice -
                        (Number(form.basePrice) || 0)
                    )} ر.س`}
                  />

                  <InfoBox
                    label="السعر الظاهر للعميل"
                    value={`${money(calculatedFinalPrice)} ر.س`}
                  />
                </div>

                <div className="rounded-[18px] border border-[#0D3B34]/8 bg-white p-4 text-xs leading-6 text-[#0D3B34]/60">
                  المورد يدخل السعر قبل الضريبة فقط، والمنصة تحسب VAT
                  والسعر النهائي تلقائيًا لمنع اختلاف الأرقام.
                </div>
              </FormSection>

              {/* CAPACITY */}
              <FormSection
                eyebrow="AVAILABILITY"
                title="السعة والتوفر"
              >
                <Field label="السعة القصوى المتاحة">
                  <input
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        capacity: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </Field>

                <div className="grid gap-3 md:grid-cols-3">
                  <AvailabilityBox title="الأيام" value="يحدد لاحقًا" />
                  <AvailabilityBox title="المواعيد" value="يحدد لاحقًا" />
                  <AvailabilityBox title="المخزون" value="حسب السعة" />
                </div>
              </FormSection>

              {/* IMAGES */}
              <FormSection
                eyebrow="MEDIA"
                title="صور الخدمة"
              >
                <Field label="رفع الصور">
                  <input
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        images: Array.from(e.target.files || []).map(
                          (file) => file.name
                        ),
                      }))
                    }
                    className={inputClass}
                  />
                </Field>

                {form.images.length > 0 && (
                  <div className="rounded-[18px] bg-[#EEF3F0] p-4">
                    <p className="text-xs font-bold">
                      تم اختيار {form.images.length} صور
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {form.images.map((image) => (
                        <span
                          key={image}
                          className="rounded-full bg-white px-3 py-1.5 text-[10px] text-[#0D3B34]/60"
                        >
                          {image}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </FormSection>

              {/* POLICY */}
              <FormSection
                eyebrow="POLICIES"
                title="سياسة الإلغاء"
              >
                <textarea
                  value={form.cancellationPolicy}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      cancellationPolicy: e.target.value,
                    }))
                  }
                  rows={4}
                  className={`${inputClass} h-auto py-4`}
                  placeholder="مثال: استرداد كامل قبل 24 ساعة..."
                />
              </FormSection>

              {/* SUBMIT */}
              <div className="rounded-[28px] bg-[#0D3B34] p-6 text-white">
                <p className="text-[10px] font-bold tracking-[0.17em] text-[#E6C24D]">
                  PUBLISHING WORKFLOW
                </p>

                <h3 className="mt-2 text-lg font-bold">
                  حفظ أو إرسال للمراجعة
                </h3>

                <p className="mt-2 text-xs leading-6 text-white/50">
                  الحفظ كمسودة لا ينشر الخدمة. إرسالها للمراجعة يحولها
                  إلى «تحت المراجعة» حتى تعتمدها إدارة Arees Loop.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={saveDraft}
                    className="rounded-2xl border border-white/15 bg-white/8 px-5 py-3.5 text-sm font-bold text-white"
                  >
                    حفظ كمسودة
                  </button>

                  <button
                    type="button"
                    onClick={submitForReview}
                    className="rounded-2xl bg-[#D4AF37] px-5 py-3.5 text-sm font-bold text-[#0D3B34]"
                  >
                    إرسال للمراجعة
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE NAV */}
      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-[560px] -translate-x-1/2 items-center justify-around rounded-[22px] border border-white/80 bg-[#F9F7F0]/94 px-2 py-2 backdrop-blur-xl xl:hidden">
        <MobileNav href="/partner/dashboard" label="الرئيسية" />
        <MobileNav href="/partner/bookings" label="الحجوزات" />
        <MobileNav href="/partner/services" label="الخدمات" active />
        <MobileNav href="/partner/settlements" label="التسويات" />
        <MobileNav href="/partner/business" label="المنشأة" />
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
  highlight = false,
  success = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  success?: boolean;
}) {
  return (
    <div
      className={`rounded-[26px] border p-5 ${
        highlight
          ? "border-[#D4AF37]/25 bg-[#FFF8E4]"
          : success
          ? "border-[#267247]/15 bg-[#EAF5EE]"
          : "border-white/80 bg-white/72"
      }`}
    >
      <p className="text-xs text-[#0D3B34]/45">{label}</p>

      <p
        className={`mt-3 text-2xl font-bold ${
          success
            ? "text-[#267247]"
            : highlight
            ? "text-[#A67B11]"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#0D3B34]/7 bg-white px-4 py-3">
      <p className="text-[10px] text-[#0D3B34]/40">{label}</p>

      <p className="mt-1 text-xs font-bold text-[#0D3B34]/75">
        {value}
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
      <span className="mb-2 block text-xs font-semibold text-[#0D3B34]/65">
        {label}
      </span>

      {children}
    </label>
  );
}

function FormSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[26px] border border-white/80 bg-white/70 p-5 backdrop-blur-xl">
      <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
        {eyebrow}
      </p>

      <h3
        className="mt-1 text-xl font-bold"
        style={{
          fontFamily: "var(--font-el-messiri), serif",
        }}
      >
        {title}
      </h3>

      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function AvailabilityBox({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#0D3B34]/7 bg-[#F8F7F2] p-4">
      <p className="text-[10px] text-[#0D3B34]/40">{title}</p>

      <p className="mt-2 text-xs font-bold">{value}</p>
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