"use client";



import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";



type PartnerStatus =

  | "SUBMITTED"

  | "UNDER_REVIEW"

  | "NEEDS_INFO"

  | "AWAITING_PARTNER_ACCEPTANCE"

  | "PARTNER_ACCEPTED"

  | "ACTIVE"

  | "REJECTED";



type Partner = {

  id: string;

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

  completionRequest?: string;

};



type ApiPartner = {
  id: string;
  legalNameAr?: string | null;
  legalNameEn?: string | null;
  tradeNameAr?: string | null;
  tradeNameEn?: string | null;
  publicName?: string | null;
  partnerType?: string | null;
  commercialRegister?: string | null;
  unifiedNumber?: string | null;
  vatRegistered?: boolean;
  vatNumber?: string | null;
  city?: string | null;
  iban?: string | null;
  bankName?: string | null;
  financeContactName?: string | null;
  financeContactPhone?: string | null;
  financeContactEmail?: string | null;
  mainContactName?: string | null;
  mainContactPhone?: string | null;
  mainContactEmail?: string | null;
  websiteUrl?: string | null;
  submittedAt?: string | null;
  status?: string | null;
  commissionRate?: number | null;
  transferFee?: string | number | null;
  completionNotes?: string | null;
  categories?: Array<{ name?: string | null }>;
  licenses?: Array<{
    type?: string | null;
    issuer?: string | null;
    licenseNumber?: string | null;
    expiryDate?: string | null;
  }>;
};

type AdminPartnersResponse = {
  success: boolean;
  data?: ApiPartner[];
  message?: string;
};

const EMPTY_VALUE = "غير مدخل";

function normalizeStatus(status?: string | null): PartnerStatus {
  switch (status) {
    case "SUBMITTED":
    case "UNDER_REVIEW":
    case "ACTIVE":
    case "REJECTED":
      return status;
    case "NEEDS_COMPLETION":
    case "NEEDS_INFO":
      return "NEEDS_INFO";
    case "PRE_APPROVED":
      return "UNDER_REVIEW";
    case "WAITING_AGREEMENT":
    case "AWAITING_PARTNER_ACCEPTANCE":
      return "AWAITING_PARTNER_ACCEPTANCE";
    case "AGREEMENT_ACCEPTED":
    case "PARTNER_ACCEPTED":
      return "PARTNER_ACCEPTED";
    default:
      return "SUBMITTED";
  }
}

function formatDate(value?: string | null) {
  if (!value) return EMPTY_VALUE;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE;
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function mapApiPartner(partner: ApiPartner): Partner {
  const license = partner.licenses?.[0];
  const categoryNames = (partner.categories ?? [])
    .map((item) => item.name?.trim())
    .filter((value): value is string => Boolean(value));

  return {
    id: partner.id,
    legalName:
      partner.legalNameAr?.trim() || partner.legalNameEn?.trim() || EMPTY_VALUE,
    tradeName:
      partner.tradeNameAr?.trim() ||
      partner.publicName?.trim() ||
      partner.tradeNameEn?.trim() ||
      partner.legalNameAr?.trim() ||
      partner.legalNameEn?.trim() ||
      EMPTY_VALUE,
    category:
      categoryNames.join("، ") || partner.partnerType?.trim() || EMPTY_VALUE,
    city: partner.city?.trim() || EMPTY_VALUE,
    crNumber: partner.commercialRegister?.trim() || EMPTY_VALUE,
    unifiedNumber: partner.unifiedNumber?.trim() || EMPTY_VALUE,
    taxNumber:
      (partner.vatRegistered ? partner.vatNumber?.trim() : "غير مسجل") || EMPTY_VALUE,
    licenseType: license?.type?.trim() || EMPTY_VALUE,
    licenseIssuer: license?.issuer?.trim() || EMPTY_VALUE,
    licenseNumber: license?.licenseNumber?.trim() || EMPTY_VALUE,
    licenseExpiry: formatDate(license?.expiryDate),
    iban: partner.iban?.trim() || EMPTY_VALUE,
    bankName: partner.bankName?.trim() || EMPTY_VALUE,
    financeContact: partner.financeContactName?.trim() || EMPTY_VALUE,
    financePhone: partner.financeContactPhone?.trim() || EMPTY_VALUE,
    financeEmail: partner.financeContactEmail?.trim() || EMPTY_VALUE,
    operationsContact: partner.mainContactName?.trim() || EMPTY_VALUE,
    operationsPhone: partner.mainContactPhone?.trim() || EMPTY_VALUE,
    website: partner.websiteUrl?.trim() || EMPTY_VALUE,
    submittedAt: formatDate(partner.submittedAt),
    status: normalizeStatus(partner.status),
    commission: Number(partner.commissionRate ?? 0),
    paymentFeeRule: "على المورد حسب التكلفة الفعلية",
    settlementFee: Number(partner.transferFee ?? 1) || 0,
    settlementCycle: "كل 7 أيام",
    agreementVersion: "v1.0",
    completionRequest: partner.completionNotes?.trim() || undefined,
  };
}


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

  const searchParams = useSearchParams();
  const activeView = searchParams.get("view") === "active";

  const [partners, setPartners] = useState<Partner[]>([]);

  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4200);
  };

  const [search, setSearch] = useState("");

  const [viewMode, setViewMode] = useState<"CARDS" | "LIST">("CARDS");

  const [statusFilter, setStatusFilter] = useState<"ALL" | PartnerStatus>(

    "ALL"

  );

  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const [showAgreementPreview, setShowAgreementPreview] = useState(false);

  const [completionNote, setCompletionNote] = useState("");

  const [showManualPartnerModal, setShowManualPartnerModal] = useState(false);

  const [manualPartner, setManualPartner] = useState({

    legalName: "", tradeName: "", category: "", city: "", crNumber: "",

    unifiedNumber: "", taxNumber: "", licenseType: "", licenseIssuer: "",

    licenseNumber: "", licenseExpiry: "", financeContact: "", financePhone: "",

    financeEmail: "", operationsContact: "", operationsPhone: "", website: "",

  });



  useEffect(() => {
    let cancelled = false;

    async function loadPartners() {
      setLoading(true);
      setLoadError("");

      try {
        const response = await fetch("/api/admin/partners", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });
        const payload = (await response.json()) as AdminPartnersResponse;

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "تعذر تحميل طلبات الشركاء.");
        }

        const mapped = (payload.data ?? []).map(mapApiPartner);
        if (cancelled) return;

        setPartners(mapped);
        setSelectedId((current) => current && mapped.some((partner) => partner.id === current) ? current : "");
      } catch (error) {
        if (cancelled) return;
        setLoadError(
          error instanceof Error ? error.message : "تعذر تحميل طلبات الشركاء."
        );
        setPartners([]);
        setSelectedId("");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPartners();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedPartner = partners.find((partner) => partner.id === selectedId);



  const visiblePartners = useMemo(() => activeView
    ? partners.filter((partner) => partner.status === "ACTIVE")
    : partners.filter((partner) => partner.status !== "ACTIVE" && partner.status !== "REJECTED"), [partners, activeView]);

  const filteredPartners = useMemo(() => {

    return visiblePartners.filter((partner) => {

      const text =

        `${partner.legalName} ${partner.tradeName} ${partner.crNumber} ${partner.category}`.toLowerCase();



      const matchesSearch = text.includes(search.toLowerCase());

      const matchesStatus =

        statusFilter === "ALL" || partner.status === statusFilter;



      return matchesSearch && matchesStatus;

    });

  }, [visiblePartners, search, statusFilter]);



  const stats = useMemo(

    () => ({

      total: visiblePartners.length,

      review: partners.filter((p) => p.status === "UNDER_REVIEW").length,

      waiting: partners.filter(

        (p) => p.status === "AWAITING_PARTNER_ACCEPTANCE"

      ).length,

      final: partners.filter((p) => p.status === "PARTNER_ACCEPTED").length,

      active: partners.filter((p) => p.status === "ACTIVE").length,

    }),

    [visiblePartners, partners]

  );



  const updateSelected = (patch: Partial<Partner>) => {

    if (!selectedPartner) return;

    setPartners((current) =>

      current.map((partner) =>

        partner.id === selectedPartner.id

          ? { ...partner, ...patch }

          : partner

      )

    );

  };



  const runAdminDecision = async (
    action:
      | "REQUEST_COMPLETION"
      | "SEND_AGREEMENT"
      | "REJECT"
      | "ACTIVATE",
    options?: {
      notes?: string;
      commissionRate?: number;
    }
  ) => {
    if (!selectedPartner || adminActionLoading) return;

    setAdminActionLoading(true);

    try {
      const response = await fetch(
        `/api/admin/partners/${selectedPartner.id}/decision`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            notes: options?.notes,
            commissionRate:
              options?.commissionRate,
          }),
        }
      );

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.message || "تعذر تنفيذ الإجراء."
        );
      }

      const mappedStatus = normalizeStatus(
        payload.data?.status
      );

      updateSelected({
        status: mappedStatus,
        completionRequest:
          payload.data?.completionNotes || undefined,
        commission:
          Number(payload.data?.commissionRate) ||
          selectedPartner.commission,
      });

      const successMessages = {
        REQUEST_COMPLETION: "تم إرسال طلب الاستكمال للشريك بنجاح.",
        SEND_AGREEMENT: "تم إرسال الاتفاقية للشريك بنجاح.",
        REJECT: "تم رفض طلب الشريك وتسجيل القرار بنجاح.",
        ACTIVATE: "تم اعتماد وتفعيل الشريك بنجاح.",
      } as const;
      showToast("success", successMessages[action]);

      return payload;
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "تعذر تنفيذ الإجراء. حاول مرة أخرى."
      );
      return null;
    } finally {
      setAdminActionLoading(false);
    }
  };

  const sendCommercialTerms = async () => {
    const result = await runAdminDecision("SEND_AGREEMENT", {
      commissionRate:
        selectedPartner?.commission || 10,
    });
    if (result) setShowAgreementPreview(false);
  };

  const requestMoreInfo = () => {

    if (!selectedPartner) return;

    setCompletionNote(selectedPartner.completionRequest ?? "");

    setShowCompletionModal(true);

  };



  const confirmRequestMoreInfo = async () => {

    const note = completionNote.trim();

    if (!note) return;

    const result = await runAdminDecision(
      "REQUEST_COMPLETION",
      { notes: note }
    );

    if (!result) return;

    setShowCompletionModal(false);

    setCompletionNote("");

  };



  const addManualPartner = () => {

    if (!manualPartner.legalName.trim() || !manualPartner.tradeName.trim() ||

        !manualPartner.category.trim() || !manualPartner.city.trim()) return;

    const nextId = `manual-${Date.now()}`;

    const value = (v: string) => v.trim() || "غير مدخل";

    const newPartner: Partner = {

      id: nextId,

      legalName: value(manualPartner.legalName),

      tradeName: value(manualPartner.tradeName),

      category: value(manualPartner.category),

      city: value(manualPartner.city),

      crNumber: value(manualPartner.crNumber),

      unifiedNumber: value(manualPartner.unifiedNumber),

      taxNumber: value(manualPartner.taxNumber),

      licenseType: value(manualPartner.licenseType),

      licenseIssuer: value(manualPartner.licenseIssuer),

      licenseNumber: value(manualPartner.licenseNumber),

      licenseExpiry: value(manualPartner.licenseExpiry),

      iban: "غير مدخل", bankName: "غير مدخل",

      financeContact: value(manualPartner.financeContact),

      financePhone: value(manualPartner.financePhone),

      financeEmail: value(manualPartner.financeEmail),

      operationsContact: value(manualPartner.operationsContact),

      operationsPhone: value(manualPartner.operationsPhone),

      website: value(manualPartner.website),

      submittedAt: new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(new Date()),

      status: "UNDER_REVIEW", commission: 10,

      paymentFeeRule: "على المورد حسب التكلفة الفعلية",

      settlementFee: 1, settlementCycle: "كل 7 أيام", agreementVersion: "v1.0",

    };

    setPartners((current) => [newPartner, ...current]);

    setSelectedId(nextId);

    setShowManualPartnerModal(false);

    setManualPartner({

      legalName: "", tradeName: "", category: "", city: "", crNumber: "",

      unifiedNumber: "", taxNumber: "", licenseType: "", licenseIssuer: "",

      licenseNumber: "", licenseExpiry: "", financeContact: "", financePhone: "",

      financeEmail: "", operationsContact: "", operationsPhone: "", website: "",

    });

  };



  const rejectPartner = async () => {
    if (!selectedPartner) return;

    const reason = window.prompt(
      "اكتب سبب رفض طلب الشريك:"
    )?.trim();

    if (!reason) return;

    await runAdminDecision("REJECT", {
      notes: reason,
    });
  };

  const finalApprove = async () => {
    await runAdminDecision("ACTIVATE");
  };



  if (loading) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#F5F1E8] p-8 text-[#0D3B34]">
        <div className="mx-auto max-w-[1580px] rounded-[28px] border border-white/80 bg-white/70 p-8 text-center">
          جاري تحميل طلبات الشركاء...
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#F5F1E8] p-8 text-[#0D3B34]">
        <div className="mx-auto max-w-[1580px] rounded-[28px] border border-red-200 bg-white/80 p-8 text-center">
          <p className="font-bold">تعذر تحميل طلبات الشركاء</p>
          <p className="mt-2 text-sm text-[#0D3B34]/60">{loadError}</p>
        </div>
      </main>
    );
  }

  return (

    <main

      dir="rtl"

      className="min-h-screen overflow-x-hidden bg-[#F5F1E8] text-[#0D3B34]"

      style={{

        fontFamily: "var(--font-ibm-plex-arabic), sans-serif",

      }}

    >

      {toast && (
        <div className="pointer-events-none fixed left-1/2 top-6 z-[100] -translate-x-1/2 px-4">
          <div role="status" className={`flex min-w-[290px] items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold shadow-[0_16px_45px_rgba(13,59,52,.18)] backdrop-blur-xl ${toast.type === "success" ? "border-[#B99124]/35 bg-[#0D3B34] text-white" : "border-red-200 bg-[#FFF4F2] text-[#A3443E]"}`}>
            <span>{toast.type === "success" ? "✓" : "✕"}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* SMART BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -right-40 top-24 h-[520px] w-[520px] rounded-full bg-[#0D3B34]/7 blur-[110px]" />

        <div className="absolute -left-32 top-[420px] h-[420px] w-[420px] rounded-full bg-[#D4AF37]/10 blur-[110px]" />

        <div className="absolute bottom-[-160px] right-[30%] h-[420px] w-[420px] rounded-full bg-[#B99124]/7 blur-[120px]" />

      </div>



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

              {activeView ? "الشركاء المعتمدون" : "طلبات الشركاء"}

            </h1>



            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#0D3B34]/60">

              {activeView ? "عرض وإدارة الشركاء المعتمدين والنشطين في المنصة." : "مراجعة بيانات المنشآت، التحقق من التراخيص، تحديد الشروط التجارية، إرسال الاتفاقيات واعتماد الشريك قبل تفعيل خدماته."}

            </p>

          </div>



          <button

            type="button"

            onClick={() => setShowManualPartnerModal(true)}

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



        <div className={selectedPartner ? "grid gap-6" : "grid gap-6"}>

          {/* PARTNERS LIST */}

          <section className={`${selectedPartner ? "hidden" : "block"} rounded-[28px] border border-white/80 bg-white/68 p-5 backdrop-blur-xl md:p-6`}>

            <div className="mb-5 flex items-center justify-between gap-3">

              <div>

                <h2

                  className="text-xl font-bold"

                  style={{

                    fontFamily: "var(--font-el-messiri), serif",

                  }}

                >

                  {activeView ? "قائمة الشركاء المعتمدين" : "قائمة الطلبات"}

                </h2>

                <p className="mt-1 text-xs text-[#0D3B34]/50">

                  {activeView ? "اختر شريكاً لعرض ملفه." : "اختر منشأة لعرض ملف التدقيق."}

                </p>

              </div>



              <span className="rounded-full bg-[#0D3B34]/7 px-3 py-1 text-xs font-semibold">

                {filteredPartners.length}

              </span>

            <div className="flex rounded-xl bg-[#0D3B34]/5 p-1"><button type="button" onClick={() => setViewMode("CARDS")} className={`rounded-lg px-3 py-2 text-xs font-bold ${viewMode === "CARDS" ? "bg-white shadow-sm" : ""}`}>بطاقات</button><button type="button" onClick={() => setViewMode("LIST")} className={`rounded-lg px-3 py-2 text-xs font-bold ${viewMode === "LIST" ? "bg-white shadow-sm" : ""}`}>قائمة</button></div></div>

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

                <option value="AWAITING_PARTNER_ACCEPTANCE">

                  بانتظار موافقة الشريك

                </option>

                <option value="PARTNER_ACCEPTED">وافق على الشروط</option>

                <option value="ACTIVE">نشط</option>

              </select>

            </div>



            <div className={viewMode === "CARDS" ? "grid gap-3 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>

              {filteredPartners.length === 0 && <div className="col-span-full rounded-2xl bg-[#F9F7F2] p-8 text-center text-sm text-[#0D3B34]/55">{activeView ? "لا يوجد شركاء معتمدون حالياً." : "لا توجد طلبات شركاء معلقة حالياً."}</div>}
              {filteredPartners.map((partner) => {

                const active = partner.id === selectedId;

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

          {selectedPartner && <section className="overflow-hidden rounded-[30px] border border-white/80 bg-white/72 backdrop-blur-xl">

            {/* PROFILE HEADER */}

            <div className="border-b border-[#0D3B34]/7 p-6 md:p-8"><button type="button" onClick={() => setSelectedId("")} className="mb-5 rounded-xl border border-[#0D3B34]/10 bg-white px-4 py-2 text-xs font-bold">← العودة لطلبات الشركاء</button>

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

                    المقابل التجاري الحالي

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



              {/* ADMIN REVIEW ASSISTANT */}
              <div className="rounded-[26px] border border-[#D4AF37]/25 bg-[#FFFDF8] p-5 shadow-sm md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.18em] text-[#B99124]">INTERNAL REVIEW ASSISTANT</p>
                    <h3 className="mt-1 text-xl font-bold text-[#171717]">مساعد المراجعة</h3>
                    <p className="mt-2 text-xs leading-6 text-[#171717]/55">مساحة داخلية للإدارة فقط. لا تظهر هذه الملاحظات أو نتيجة المراجعة للشريك.</p>
                  </div>
                  <span className="w-fit rounded-full bg-[#171717] px-3 py-1.5 text-[10px] font-bold text-[#D4AF37]">داخلي فقط</span>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-[#171717]/8 bg-[#F5F1E8] p-4">
                    <p className="text-xs font-bold text-[#171717]">ملاحظات المراجعة</p>
                    <p className="mt-3 text-xs leading-7 text-[#171717]/55">
                      تظهر هنا نتيجة الفحص الداخلي للمستندات والبيانات، والنواقص أو التعارضات التي تحتاج مراجعة الإدارة.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#D4AF37]/20 bg-white p-4">
                    <p className="text-xs font-bold text-[#171717]">الرد المقترح للشريك</p>
                    <textarea
                      rows={5}
                      defaultValue={selectedPartner.completionRequest ?? ""}
                      placeholder="سيظهر هنا النص المقترح، ويمكن للإدارة تعديله قبل الإرسال..."
                      className="mt-3 w-full resize-none rounded-xl border border-[#171717]/10 bg-[#FFFDF8] px-3 py-3 text-xs leading-6 text-[#171717] outline-none focus:border-[#D4AF37]/60"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" className="rounded-xl border border-[#171717]/10 bg-white px-3 py-2 text-[11px] font-bold text-[#171717]">اعتماد النص كما هو</button>
                      <button type="button" onClick={requestMoreInfo} className="rounded-xl bg-[#171717] px-3 py-2 text-[11px] font-bold text-[#D4AF37]">تعديل وإرسال للشريك</button>
                    </div>
                  </div>
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

                  <Field label="المقابل التجاري لأريس">

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

                      وفق النموذج المالي المعتمد لدى أريس

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

                  قرارات الإدارة مرتبطة مباشرة بقاعدة البيانات وإشعارات الشريك. تقرير AI يساعد في التدقيق ولا يتخذ قرار الاعتماد النهائي.

                </p>



                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

                  <ActionButton

                    onClick={requestMoreInfo}

                    label="طلب استكمال"

                    secondary

                  />



                  <ActionButton

                    onClick={() => setShowAgreementPreview(true)}

                    label="مراجعة وإرسال الاتفاقية"

                    gold

                  />



                  <ActionButton

                    onClick={rejectPartner}

                    label="رفض الطلب"

                    secondary

                  />



                  <ActionButton

                    onClick={finalApprove}

                    label="اعتماد وتفعيل"

                  />

                </div>

                {adminActionLoading && (
                  <p className="mt-3 text-xs text-white/55">
                    جارٍ تنفيذ الإجراء وتحديث الطلب...
                  </p>
                )}



                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-5">

                  <span className="text-xs text-white/45">

                    الحالة الحالية:

                  </span>



                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#F1D263]">

                    {statusConfig[selectedPartner.status].label}

                  </span>

                </div>

                {selectedPartner.completionRequest && (

                  <div className="mt-4 rounded-2xl border border-[#E5BE45]/20 bg-white/[0.06] p-4">

                    <p className="text-[10px] font-bold text-[#E5BE45]">ملاحظة طلب الاستكمال</p>

                    <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-white/75">

                      {selectedPartner.completionRequest}

                    </p>

                  </div>

                )}

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

                    title={`المقابل التجاري الحالي ${selectedPartner.commission}%`}

                    meta="Commercial Terms"

                  />

                </div>

              </div>

            </div>

          </section>}

        </div>

      </div>



      {showAgreementPreview && selectedPartner && (
        <ModalShell
          title="مراجعة الاتفاقية قبل الإرسال"
          subtitle={selectedPartner.tradeName}
          onClose={() => setShowAgreementPreview(false)}
        >
          <div className="rounded-[24px] bg-[#0D3B34] p-5 text-white">
            <p className="text-[10px] font-bold tracking-[0.18em] text-[#E5BE45]">COMMERCIAL TERMS</p>
            <h4 className="mt-2 text-xl font-bold">الشروط التجارية المعتمدة لهذا الشريك</h4>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-[11px] text-white/55">المقابل التجاري لأريس</p>
                <p className="mt-1 text-2xl font-bold text-[#F1D263]">{selectedPartner.commission}%</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-[11px] text-white/55">دورة التسوية</p>
                <p className="mt-1 font-bold">{selectedPartner.settlementCycle}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-[11px] text-white/55">رسوم الدفع الإلكتروني</p>
                <p className="mt-1 text-sm font-bold">{selectedPartner.paymentFeeRule}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-[11px] text-white/55">رسوم التحويل لكل تسوية</p>
                <p className="mt-1 font-bold">{money(selectedPartner.settlementFee)} ريال</p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[22px] border border-[#D4AF37]/20 bg-[#FFF9EA] p-5 text-xs leading-7 text-[#0D3B34]/75">
            <p className="font-bold text-[#0D3B34]">قبل الإرسال</p>
            <p className="mt-2">سيتم تثبيت نسبة المقابل التجاري داخل نسخة الاتفاقية المرسلة للشريك. أما اختيار أن يكون السعر شاملاً لمقابل أريس أو يضاف إليه فيتم لكل تجربة عند إنشائها.</p>
            <p className="mt-2">الشريك هو الجهة المنظمة أو المنفذة الفعلية للتجربة أو البرنامج، وتظهر هويته وبيانات ترخيصه للعميل. أريس تقوم بالتسويق والحجز ضمن نطاق ترخيصها.</p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => setShowAgreementPreview(false)} className="rounded-2xl border border-[#0D3B34]/10 bg-white px-4 py-3 text-xs font-bold">رجوع وتعديل</button>
            <button type="button" onClick={sendCommercialTerms} disabled={adminActionLoading} className="rounded-2xl bg-[#D4AF37] px-4 py-3 text-xs font-bold text-[#0D3B34] disabled:opacity-40">
              {adminActionLoading ? "جارٍ الإرسال..." : "إرسال للتوقيع الإلكتروني"}
            </button>
          </div>
        </ModalShell>
      )}

      {showCompletionModal && selectedPartner && (

        <ModalShell title="طلب استكمال من الشريك" subtitle={`الطلب: ${selectedPartner.tradeName}`} onClose={() => setShowCompletionModal(false)}>

          <label className="block">

            <span className="mb-2 block text-xs font-semibold text-[#0D3B34]/70">ما المطلوب من الشريك؟</span>

            <textarea value={completionNote} onChange={(e) => setCompletionNote(e.target.value)} rows={6}

              placeholder="مثال: يرجى إرفاق نسخة محدثة من الترخيص وتصحيح رقم السجل التجاري..."

              className="w-full resize-none rounded-2xl border border-[#0D3B34]/10 bg-[#FAF9F5] px-4 py-3 text-sm leading-7 outline-none focus:border-[#B99124]/55" />

          </label>

          <p className="mt-4 rounded-2xl border border-[#D4AF37]/20 bg-[#FFF9EA] p-4 text-xs leading-6 text-[#0D3B34]/65">

            هذا الإجراء ما زال محليًا في الواجهة ولن يُحفظ في قاعدة البيانات حتى ربط مسار التحديث الإداري.

          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">

            <button type="button" onClick={() => setShowCompletionModal(false)} className="rounded-2xl border border-[#0D3B34]/10 bg-white px-4 py-3 text-xs font-bold">إلغاء</button>

            <button type="button" onClick={confirmRequestMoreInfo} disabled={!completionNote.trim()} className="rounded-2xl bg-[#0D3B34] px-4 py-3 text-xs font-bold text-white disabled:opacity-40">إرسال طلب الاستكمال</button>

          </div>

        </ModalShell>

      )}



      {showManualPartnerModal && (

        <ModalShell title="إضافة شريك يدويًا" subtitle="إنشاء طلب شريك من لوحة الإدارة — Frontend Demo" onClose={() => setShowManualPartnerModal(false)} wide>

          <div className="grid gap-4 md:grid-cols-2">

            {[

              ["legalName","الاسم القانوني *"],["tradeName","الاسم التجاري *"],["category","النشاط *"],["city","المدينة *"],

              ["crNumber","السجل التجاري"],["unifiedNumber","الرقم الموحد"],["taxNumber","الرقم الضريبي"],

              ["licenseType","نوع الترخيص"],["licenseIssuer","جهة إصدار الترخيص"],["licenseNumber","رقم الترخيص"],

              ["licenseExpiry","تاريخ انتهاء الترخيص"],["financeContact","المسؤول المالي"],["financePhone","جوال المسؤول المالي"],

              ["financeEmail","بريد المسؤول المالي"],["operationsContact","مسؤول التشغيل"],["operationsPhone","جوال مسؤول التشغيل"],["website","الموقع الإلكتروني"]

            ].map(([key,label]) => (

              <AdminInput key={key} label={label} value={manualPartner[key as keyof typeof manualPartner]}

                onChange={(value) => setManualPartner((current) => ({ ...current, [key]: value }))} />

            ))}

          </div>

          <p className="mt-5 rounded-2xl border border-[#D4AF37]/20 bg-[#FFF9EA] p-4 text-xs leading-6 text-[#0D3B34]/65">

            الحقول المعلّمة بنجمة مطلوبة. الحفظ الحالي داخل الصفحة فقط إلى حين ربط قاعدة البيانات.

          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">

            <button type="button" onClick={() => setShowManualPartnerModal(false)} className="rounded-2xl border border-[#0D3B34]/10 bg-white px-4 py-3 text-xs font-bold">إلغاء</button>

            <button type="button" onClick={addManualPartner}

              disabled={!manualPartner.legalName.trim() || !manualPartner.tradeName.trim() || !manualPartner.category.trim() || !manualPartner.city.trim()}

              className="rounded-2xl bg-[#0D3B34] px-4 py-3 text-xs font-bold text-white disabled:opacity-40">إضافة الشريك</button>

          </div>

        </ModalShell>

      )}

    </main>

  );

}



function ModalShell({ title, subtitle, onClose, children, wide = false }: {

  title: string; subtitle: string; onClose: () => void; children: React.ReactNode; wide?: boolean;

}) {

  return (

    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#082D27]/45 p-4 backdrop-blur-sm"

      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      <div className={`max-h-[88vh] w-full overflow-y-auto rounded-[28px] border border-white/80 bg-[#F8F5EE] p-6 shadow-2xl ${wide ? "max-w-4xl" : "max-w-xl"}`}>

        <div className="mb-6 flex items-start justify-between gap-4">

          <div><p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">AREES LOOP ADMIN</p>

            <h3 className="mt-1 text-xl font-bold">{title}</h3><p className="mt-1 text-xs text-[#0D3B34]/50">{subtitle}</p></div>

          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#0D3B34]/10 bg-white text-lg">×</button>

        </div>

        {children}

      </div>

    </div>

  );

}



function AdminInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void; }) {

  return (

    <label className="block">

      <span className="mb-2 block text-xs font-semibold text-[#0D3B34]/65">{label}</span>

      <input value={value} onChange={(e) => onChange(e.target.value)}

        className="h-12 w-full rounded-2xl border border-[#0D3B34]/10 bg-white px-4 text-sm outline-none focus:border-[#B99124]/55" />

    </label>

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