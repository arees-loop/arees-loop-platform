"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
type StepId =
  | "account"
  | "business"
  | "categories"
  | "documents"
  | "operations"
  | "review"
  | "done";

type PartnerType = "" | "individual" | "business" | "government";
type ApplicantRole = "" | "owner" | "representative";

type DocumentItem = {
  id: number;
  type: string;
  number: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  fileName: string;
  coveredCategories: string[];
};

type AiReviewClientResult = {
  outcome: "READY" | "NEEDS_COMPLETION" | "MANUAL_REVIEW";
  summary: string;
  partnerMessage: string;
  issues: Array<{
    field: string;
    severity: "ERROR" | "WARNING";
    message: string;
    requestedAction: string;
  }>;
};

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;

  partnerType: PartnerType;
  applicantRole: ApplicantRole;
  jobTitle: string;
  authorizationFile: string;

  tradeName: string;
  legalName: string;
  unifiedNumber: string;
  registrationNumber: string;
  proofType: string;
  description: string;

  country: string;
  city: string;
  district: string;
  street: string;
  shortNationalAddress: string;
  nationalAddressFile: string;
  website: string;
  businessPhone: string;
  businessEmail: string;

  categories: string[];

  vatRegistered: boolean;
  vatNumber: string;
  vatCertificate: string;

  receivesPayments: boolean;
  iban: string;
  beneficiaryName: string;
  ibanCertificate: string;

  contactName: string;
  contactPhone: string;
  contactEmail: string;

  operates24h: boolean;
  operatingHours: string;

  publicName: string;
  logoFile: string;

  declaration: boolean;
  termsAccepted: boolean;
};

const steps: {
  id: Exclude<StepId, "done">;
  title: string;
  short: string;
}[] = [
  {
    id: "account",
    title: "الحساب وصفة مقدم الخدمة",
    short: "الحساب",
  },
  {
    id: "business",
    title: "بيانات النشاط والموقع",
    short: "النشاط",
  },
  {
    id: "categories",
    title: "نوع الخدمات",
    short: "الخدمات",
  },
  {
    id: "documents",
    title: "التراخيص والوثائق",
    short: "الوثائق",
  },
  {
    id: "operations",
    title: "التشغيل والتسوية",
    short: "التشغيل",
  },
  {
    id: "review",
    title: "المراجعة والإرسال",
    short: "المراجعة",
  },
];

const categoryOptions = [
  {
    name: "تجارب وجولات",
    description:
      "جولات يومية، تجارب ثقافية وتراثية ومغامرات وتجارب متخصصة.",
  },
  {
    name: "فعاليات",
    description:
      "فعاليات ومهرجانات وعروض وأنشطة موسمية وترفيهية.",
  },
  {
    name: "مرشدون",
    description:
      "خدمات الإرشاد السياحي والإرشاد المتخصص.",
  },
  {
    name: "نقل",
    description:
      "نقل الزوار والمجموعات والتنقل بين المواقع والمدن.",
  },
  {
    name: "ضيافة",
    description:
      "فنادق وشقق مخدومة ومنتجعات ومرافق الضيافة.",
  },
  {
    name: "مطاعم ومقاهي",
    description:
      "مطاعم ومقاهٍ وتجارب الطعام والمأكولات المحلية.",
  },
  {
    name: "حرف ومنتجات محلية",
    description:
      "الحرف والهدايا والمنتجات التراثية والمحلية.",
  },
  {
    name: "أسر منتجة",
    description:
      "منتجات وخدمات وتجارب مقدمة من الأسر المنتجة.",
  },
  {
    name: "خدمات زوار",
    description:
      "الخدمات المساندة والإثرائية المقدمة للزائر.",
  },
  {
    name: "خدمات أخرى",
    description:
      "الخدمات التي لا تندرج ضمن التصنيفات السابقة.",
  },
];

const normalizeSaudiMobileForCheck = (
  value: string
) => {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (/^05\d{8}$/.test(digits)) {
    return `966${digits.slice(1)}`;
  }

  if (/^5\d{8}$/.test(digits)) {
    return `966${digits}`;
  }

  if (/^9665\d{8}$/.test(digits)) {
    return digits;
  }

  return "";
};

const initialData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",

  partnerType: "",
  applicantRole: "",
  jobTitle: "",
  authorizationFile: "",

  tradeName: "",
  legalName: "",
  unifiedNumber: "",
  registrationNumber: "",
  proofType: "",
  description: "",

  country: "المملكة العربية السعودية",
  city: "",
  district: "",
  street: "",
  shortNationalAddress: "",
  nationalAddressFile: "",
  website: "",
  businessPhone: "",
  businessEmail: "",

  categories: [],

  vatRegistered: false,
  vatNumber: "",
  vatCertificate: "",

  receivesPayments: false,
  iban: "",
  beneficiaryName: "",
  ibanCertificate: "",

  contactName: "",
  contactPhone: "",
  contactEmail: "",

  operates24h: false,
  operatingHours: "",

  publicName: "",
  logoFile: "",

  declaration: false,
  termsAccepted: false,
};

export default function PartnerOnboardingPage() {
  const [currentStep, setCurrentStep] =
    useState<StepId>("account");

  const [data, setData] =
    useState<FormData>(initialData);

  const [uploadedFiles, setUploadedFiles] = useState<{
    authorization: File | null;
    nationalAddress: File | null;
    ibanCertificate: File | null;
    vatCertificate: File | null;
    documents: Record<number, File>;
  }>({
    authorization: null,
    nationalAddress: null,
    ibanCertificate: null,
    vatCertificate: null,
    documents: {},
  });

  const [documents, setDocuments] =
    useState<DocumentItem[]>([
      {
        id: 1,
        type: "",
        number: "",
        issuer: "",
        issueDate: "",
        expiryDate: "",
        fileName: "",
        coveredCategories: [],
      },
    ]);

  const [draftSaved, setDraftSaved] =
    useState(false);

  const [validationErrors, setValidationErrors] =
    useState<Record<string, string>>({});

  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState("");

  const [smsVerificationEnabled, setSmsVerificationEnabled] =
    useState<boolean | null>(null);
  const [contactPhoneOtp, setContactPhoneOtp] = useState("");
  const [contactPhoneOtpSent, setContactPhoneOtpSent] = useState(false);
  const [contactPhoneVerified, setContactPhoneVerified] = useState(false);
  const [contactPhoneVerifiedValue, setContactPhoneVerifiedValue] =
    useState("");
  const [contactPhoneOtpLoading, setContactPhoneOtpLoading] =
    useState(false);
  const [contactPhoneOtpError, setContactPhoneOtpError] = useState("");
  const [aiReviewResult, setAiReviewResult] =
    useState<AiReviewClientResult | null>(null);
  const [applicationId, setApplicationId] = useState("");
  const [applicationStatus, setApplicationStatus] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadExistingApplication() {
      try {
        const response = await fetch(
          "/api/partner/application",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const payload = await response.json();
        const application = payload?.application;

        if (!application || cancelled) return;

        setApplicationId(String(application.id || ""));
        setApplicationStatus(
          String(application.status || "")
        );

        const existingDocuments = Array.isArray(
          application.documents
        )
          ? application.documents
          : [];

        const existingCategories = Array.isArray(
          application.categories
        )
          ? application.categories
              .map((item: { name?: string }) =>
                String(item?.name || "").trim()
              )
              .filter(Boolean)
          : [];

        const addressParts = String(
          application.address || ""
        )
          .split(" - ")
          .map((item) => item.trim());

        const existingFileName = (
          type: string
        ) =>
          String(
            existingDocuments.find(
              (item: { type?: string }) =>
                item?.type === type
            )?.fileName || ""
          );

        const mappedPartnerType: PartnerType =
          application.partnerType === "BUSINESS"
            ? "business"
            : application.partnerType === "GOVERNMENT_NONPROFIT"
              ? "government"
              : application.partnerType === "INDIVIDUAL"
                ? "individual"
                : "";

        const mappedApplicantRole: ApplicantRole =
          application.applicantRole === "OWNER"
            ? "owner"
            : application.applicantRole === "REPRESENTATIVE"
              ? "representative"
              : "";

        setData((current) => ({
          ...current,
          partnerType: mappedPartnerType,
          applicantRole: mappedApplicantRole,
          jobTitle:
            String(application.applicantJobTitle || ""),
          authorizationFile:
            existingFileName("AUTHORIZATION"),

          tradeName:
            String(application.tradeNameAr || ""),
          legalName:
            String(application.legalNameAr || ""),
          unifiedNumber:
            String(application.unifiedNumber || ""),
          registrationNumber:
            String(application.commercialRegister || ""),
          proofType:
            String(application.proofType || ""),
          description:
            String(application.descriptionAr || ""),

          country:
            String(
              application.country ||
                "المملكة العربية السعودية"
            ),
          city: String(application.city || ""),
          district: addressParts[0] || "",
          street: addressParts[1] || "",
          shortNationalAddress:
            addressParts.find((item) =>
              /^[A-Z]{4}\d{4}$/i.test(item)
            ) || "",
          nationalAddressFile:
            existingFileName("BUSINESS_PROOF"),
          website:
            String(application.websiteUrl || ""),
          businessPhone:
            String(application.businessPhone || ""),
          businessEmail:
            String(application.businessEmail || ""),

          categories: existingCategories,

          vatRegistered:
            Boolean(application.vatRegistered),
          vatNumber:
            String(application.vatNumber || ""),
          vatCertificate:
            existingFileName("VAT_CERTIFICATE"),

          receivesPayments:
            Boolean(application.receivesPayments),
          iban: String(application.iban || ""),
          beneficiaryName:
            String(application.beneficiaryName || ""),
          ibanCertificate:
            existingFileName("IBAN_CERTIFICATE"),

          contactName:
            String(application.mainContactName || ""),
          contactPhone:
            String(application.mainContactPhone || ""),
          contactEmail:
            String(application.mainContactEmail || ""),

          operates24h:
            Boolean(application.operates24h),
          operatingHours:
            String(application.operatingHours || ""),

          publicName:
            String(application.publicName || ""),
          declaration: false,
          termsAccepted: false,
        }));

        if (
          Array.isArray(application.licenses) &&
          application.licenses.length > 0
        ) {
          setDocuments(
            application.licenses.map(
              (
                license: {
                  type?: string;
                  issuer?: string;
                  licenseNumber?: string;
                  issueDate?: string | null;
                  expiryDate?: string | null;
                },
                index: number
              ) => ({
                id: index + 1,
                type: String(license.type || ""),
                number: String(
                  license.licenseNumber || ""
                ),
                issuer: String(license.issuer || ""),
                issueDate: license.issueDate
                  ? String(license.issueDate).slice(0, 10)
                  : "",
                expiryDate: license.expiryDate
                  ? String(license.expiryDate).slice(0, 10)
                  : "",
                fileName:
                  existingDocuments.length > 0
                    ? "مرفوع مسبقاً"
                    : "",
                coveredCategories: [],
              })
            )
          );
        }

        const normalizedExistingContact =
          normalizeSaudiMobileForCheck(
            String(application.mainContactPhone || "")
          );

        if (
          application.mainContactPhoneVerifiedAt &&
          normalizedExistingContact
        ) {
          setContactPhoneVerified(true);
          setContactPhoneVerifiedValue(
            normalizedExistingContact
          );
        }

        if (
          application.status === "NEEDS_COMPLETION" &&
          application.completionNotes
        ) {
          setAiReviewResult({
            outcome: "NEEDS_COMPLETION",
            summary: "يوجد استكمال مطلوب على الطلب.",
            partnerMessage:
              String(application.completionNotes),
            issues: [],
          });
        } else if (
          typeof application.reviewNotes === "string" &&
          application.reviewNotes.trim()
        ) {
          try {
            const parsed = JSON.parse(
              application.reviewNotes
            ) as AiReviewClientResult;

            if (
              parsed &&
              (parsed.outcome === "READY" ||
                parsed.outcome === "NEEDS_COMPLETION" ||
                parsed.outcome === "MANUAL_REVIEW")
            ) {
              setAiReviewResult(parsed);
            }
          } catch {
            // reviewNotes may contain an admin note rather than an AI JSON report.
          }
        }

        setCurrentStep("done");
      } catch (error) {
        console.error(
          "Unable to load existing partner application:",
          error
        );
      }
    }

    void loadExistingApplication();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeIndex = useMemo(
    () =>
      steps.findIndex(
        (step) => step.id === currentStep
      ),
    [currentStep]
  );

  const progress =
    currentStep === "done"
      ? 100
      : Math.round(
          ((Math.max(activeIndex, 0) + 1) /
            steps.length) *
            100
        );

  const update = <K extends keyof FormData>(
    key: K,
    value: FormData[K]
  ) => {
    setData((current) => ({
      ...current,
      [key]: value,
    }));

    setDraftSaved(false);

    if (key === "email") {
      setEmailVerified(false);
      setEmailOtpSent(false);
      setEmailOtp("");
      setEmailOtpError("");
    }

    if (key === "contactPhone") {
      setContactPhoneVerified(false);
      setContactPhoneVerifiedValue("");
      setContactPhoneOtpSent(false);
      setContactPhoneOtp("");
      setContactPhoneOtpError("");
    }

    setValidationErrors((current) => {
      if (!current[String(key)]) return current;
      const next = { ...current };
      delete next[String(key)];
      return next;
    });
  };

  const toggleCategory = (
    category: string
  ) => {
    setData((current) => ({
      ...current,
      categories:
        current.categories.includes(category)
          ? current.categories.filter(
              (item) => item !== category
            )
          : [
              ...current.categories,
              category,
            ],
    }));

    setDraftSaved(false);
    setValidationErrors((current) => {
      if (!current.categories) return current;
      const next = { ...current };
      delete next.categories;
      return next;
    });
  };

  const updateDocument = <
    K extends keyof DocumentItem
  >(
    id: number,
    key: K,
    value: DocumentItem[K]
  ) => {
    setDocuments((current) =>
      current.map((document) =>
        document.id === id
          ? {
              ...document,
              [key]: value,
            }
          : document
      )
    );

    setDraftSaved(false);
    setValidationErrors((current) => {
      if (!current.documents) return current;
      const next = { ...current };
      delete next.documents;
      return next;
    });
  };

  const addDocument = () => {
    setDocuments((current) => [
      ...current,
      {
        id: Date.now(),
        type: "",
        number: "",
        issuer: "",
        issueDate: "",
        expiryDate: "",
        fileName: "",
        coveredCategories: [],
      },
    ]);
  };

  const removeDocument = (
    id: number
  ) => {
    setDocuments((current) =>
      current.filter(
        (document) =>
          document.id !== id
      )
    );
  };

  const toggleDocumentCategory = (
    id: number,
    category: string
  ) => {
    const document =
      documents.find(
        (item) => item.id === id
      );

    if (!document) return;

    updateDocument(
      id,
      "coveredCategories",
      document.coveredCategories.includes(
        category
      )
        ? document.coveredCategories.filter(
            (item) =>
              item !== category
          )
        : [
            ...document.coveredCategories,
            category,
          ]
    );
  };

  const requestPartnerEmailOtp = async () => {
    if (emailOtpLoading) return;

    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone.trim();
    const cleanPassword = data.password;

    if (!data.firstName.trim()) {
      setValidationErrors((current) => ({
        ...current,
        firstName: "الاسم الأول مطلوب.",
      }));
      return;
    }

    if (!data.lastName.trim()) {
      setValidationErrors((current) => ({
        ...current,
        lastName: "اسم العائلة مطلوب.",
      }));
      return;
    }

    if (!cleanEmail) {
      setValidationErrors((current) => ({
        ...current,
        email: "البريد الإلكتروني مطلوب.",
      }));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setValidationErrors((current) => ({
        ...current,
        email: "أدخل بريداً إلكترونياً صحيحاً.",
      }));
      return;
    }

    if (!cleanPhone) {
      setValidationErrors((current) => ({
        ...current,
        phone: "رقم الجوال مطلوب.",
      }));
      return;
    }

    if (cleanPassword.length < 8) {
      setValidationErrors((current) => ({
        ...current,
        password: "كلمة المرور يجب ألا تقل عن 8 أحرف.",
      }));
      return;
    }

    setEmailOtpLoading(true);
    setEmailOtpError("");

    try {
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
          phone: cleanPhone,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          role: "PARTNER_OWNER",
        }),
      });

      const registerResult = await registerResponse.json().catch(() => null);

      if (
        !registerResponse.ok &&
        registerResult?.error !== "EMAIL_ALREADY_EXISTS"
      ) {
        if (registerResult?.error === "PHONE_ALREADY_EXISTS") {
          setEmailOtpError("رقم الجوال مستخدم في حساب آخر.");
        } else if (registerResult?.error === "WEAK_PASSWORD") {
          setEmailOtpError(
            "كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حروف وأرقام."
          );
        } else if (registerResult?.error === "RATE_LIMIT_EXCEEDED") {
          setEmailOtpError("تمت محاولات كثيرة. يرجى المحاولة بعد قليل.");
        } else {
          setEmailOtpError(
            registerResult?.message || "تعذر إنشاء حساب الشريك."
          );
        }
        return;
      }

      const response = await fetch("/api/auth/verify-email/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        if (result?.error === "RATE_LIMIT_EXCEEDED") {
          setEmailOtpError(
            "تمت محاولات كثيرة لإرسال رمز التحقق. يرجى المحاولة بعد قليل."
          );
        } else if (result?.error === "EMAIL_ALREADY_VERIFIED") {
          setEmailVerified(true);
          setEmailOtpSent(false);
          setEmailOtpError("");
        } else {
          setEmailOtpError(
            result?.message || "تعذر إرسال رمز التحقق. حاول مرة أخرى."
          );
        }
        return;
      }

      setEmailOtp("");
      setEmailOtpSent(true);
      setEmailVerified(false);
    } catch {
      setEmailOtpError(
        "تعذر الاتصال بخدمة التحقق حالياً. حاول مرة أخرى."
      );
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const confirmPartnerEmailOtp = async () => {
    if (emailOtpLoading) return;

    const cleanEmail = data.email.trim().toLowerCase();
    const cleanOtp = emailOtp.trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      setEmailOtpError("أدخل رمز التحقق المكوّن من 6 أرقام.");
      return;
    }

    setEmailOtpLoading(true);
    setEmailOtpError("");

    try {
      const response = await fetch("/api/auth/verify-email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          code: cleanOtp,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        const messages: Record<string, string> = {
          INVALID_CODE: "رمز التحقق غير صحيح. تأكد من الرمز وحاول مرة أخرى.",
          TOKEN_EXPIRED: "انتهت صلاحية رمز التحقق. اطلب رمزاً جديداً.",
          MAX_ATTEMPTS_REACHED:
            "تم تجاوز عدد محاولات التحقق المسموح بها. اطلب رمزاً جديداً.",
          RATE_LIMIT_EXCEEDED:
            "تمت محاولات كثيرة خلال وقت قصير. يرجى المحاولة بعد قليل.",
        };

        setEmailOtpError(
          messages[result?.error] ||
            "تعذر التحقق من الرمز. تأكد منه وحاول مرة أخرى."
        );
        return;
      }

      setEmailVerified(true);
      setEmailOtpSent(false);
      setEmailOtp("");
      setEmailOtpError("");
      setValidationErrors((current) => {
        if (!current.emailVerification) return current;
        const next = { ...current };
        delete next.emailVerification;
        return next;
      });
    } catch {
      setEmailOtpError(
        "تعذر الاتصال بخدمة التحقق حالياً. حاول مرة أخرى."
      );
    } finally {
      setEmailOtpLoading(false);
    }
  };

  useEffect(() => {
    if (
      currentStep !== "operations" ||
      !emailVerified
    ) {
      return;
    }

    let cancelled = false;

    const loadSmsVerificationStatus = async () => {
      try {
        const response = await fetch(
          "/api/partner/contact-phone/status",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result =
          await response.json().catch(() => null);

        if (cancelled) return;

        setSmsVerificationEnabled(
          Boolean(result?.enabled)
        );

        const verifiedPhone =
          typeof result?.verification?.phone === "string"
            ? result.verification.phone
            : "";

        if (
          result?.verification?.verifiedAt &&
          verifiedPhone
        ) {
          setContactPhoneVerifiedValue(
            verifiedPhone
          );

          setContactPhoneVerified(
            normalizeSaudiMobileForCheck(
              data.contactPhone
            ) === verifiedPhone
          );
        }
      } catch {
        if (!cancelled) {
          setSmsVerificationEnabled(false);
        }
      }
    };

    void loadSmsVerificationStatus();

    return () => {
      cancelled = true;
    };
  }, [
    currentStep,
    emailVerified,
    data.contactPhone,
  ]);

  const requestPartnerContactPhoneOtp = async () => {
    if (
      contactPhoneOtpLoading ||
      smsVerificationEnabled !== true
    ) {
      return;
    }

    const phone =
      normalizeSaudiMobileForCheck(
        data.contactPhone
      );

    if (!phone) {
      setContactPhoneOtpError(
        "أدخل رقم جوال سعودي صحيحاً."
      );
      return;
    }

    setContactPhoneOtpLoading(true);
    setContactPhoneOtpError("");

    try {
      const response = await fetch(
        "/api/partner/contact-phone/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: data.contactPhone,
          }),
        }
      );

      const result =
        await response.json().catch(() => null);

      if (!response.ok) {
        setContactPhoneOtpError(
          result?.message ||
            "تعذر إرسال رمز التحقق."
        );
        return;
      }

      if (result?.alreadyVerified) {
        setContactPhoneVerified(true);
        setContactPhoneVerifiedValue(
          phone
        );
        setContactPhoneOtpSent(false);
        setContactPhoneOtp("");
        return;
      }

      setContactPhoneOtpSent(true);
      setContactPhoneVerified(false);
      setContactPhoneVerifiedValue("");
      setContactPhoneOtp("");
    } catch {
      setContactPhoneOtpError(
        "تعذر الاتصال بخدمة الرسائل حالياً."
      );
    } finally {
      setContactPhoneOtpLoading(false);
    }
  };

  const confirmPartnerContactPhoneOtp = async () => {
    if (
      contactPhoneOtpLoading ||
      smsVerificationEnabled !== true
    ) {
      return;
    }

    const phone =
      normalizeSaudiMobileForCheck(
        data.contactPhone
      );

    if (!phone) {
      setContactPhoneOtpError(
        "أدخل رقم جوال سعودي صحيحاً."
      );
      return;
    }

    if (!/^\d{6}$/.test(
      contactPhoneOtp.trim()
    )) {
      setContactPhoneOtpError(
        "أدخل رمز التحقق المكوّن من 6 أرقام."
      );
      return;
    }

    setContactPhoneOtpLoading(true);
    setContactPhoneOtpError("");

    try {
      const response = await fetch(
        "/api/partner/contact-phone/confirm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: data.contactPhone,
            code:
              contactPhoneOtp.trim(),
          }),
        }
      );

      const result =
        await response.json().catch(() => null);

      if (!response.ok) {
        setContactPhoneOtpError(
          result?.message ||
            "تعذر التحقق من الرمز."
        );
        return;
      }

      setContactPhoneVerified(true);
      setContactPhoneVerifiedValue(
        phone
      );
      setContactPhoneOtpSent(false);
      setContactPhoneOtp("");
      setContactPhoneOtpError("");

      setValidationErrors((current) => {
        if (
          !current.contactPhoneVerification
        ) {
          return current;
        }

        const next = { ...current };
        delete next.contactPhoneVerification;
        return next;
      });
    } catch {
      setContactPhoneOtpError(
        "تعذر الاتصال بخدمة التحقق حالياً."
      );
    } finally {
      setContactPhoneOtpLoading(false);
    }
  };

  const validateCurrentStep = () => {
    const errors: Record<string, string> = {};

    if (currentStep === "account") {
      if (!data.firstName.trim()) errors.firstName = "الاسم الأول مطلوب.";
      if (!data.lastName.trim()) errors.lastName = "اسم العائلة مطلوب.";
      if (!data.email.trim()) {
        errors.email = "البريد الإلكتروني مطلوب.";  
           } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
        errors.email = "أدخل بريداً إلكترونياً صحيحاً.";
      }
      if (!emailVerified) {
        errors.emailVerification = "يجب التحقق من البريد الإلكتروني قبل المتابعة.";
      }
      if (!data.phone.trim()) errors.phone = "رقم الجوال مطلوب.";
      if (!data.password.trim()) {
        errors.password = "كلمة المرور مطلوبة.";
      } else if (data.password.length < 8) {
        errors.password = "كلمة المرور يجب ألا تقل عن 8 أحرف.";
      }
      if (!data.partnerType) errors.partnerType = "اختر نوع مقدم الخدمة.";

      if (data.partnerType === "business") {
        if (!data.applicantRole) {
          errors.applicantRole = "حدد صفتك لدى المنشأة.";
        }
        if (data.applicantRole === "representative") {
          if (!data.jobTitle.trim()) errors.jobTitle = "المسمى الوظيفي مطلوب.";
          if (!data.authorizationFile) {
            errors.authorizationFile =
              "يلزم إرفاق تفويض ساري ومصدّق من الغرفة التجارية.";
          }
        }
      }
    }

    if (currentStep === "business") {
      if (!data.tradeName.trim()) errors.tradeName = "الاسم التجاري / اسم النشاط مطلوب.";
      if (!data.city.trim()) errors.city = "المدينة مطلوبة.";
      if (!data.district.trim()) errors.district = "الحي مطلوب.";
      if (!data.street.trim()) errors.street = "الشارع مطلوب.";
      if (!data.shortNationalAddress.trim()) {
        errors.shortNationalAddress = "العنوان الوطني المختصر مطلوب.";
      } else if (!/^[A-Z]{4}\d{4}$/.test(data.shortNationalAddress.trim().toUpperCase())) {
        errors.shortNationalAddress = "أدخل عنواناً وطنياً مختصراً صحيحاً: 4 أحرف ثم 4 أرقام، مثال ABCD1234.";
      }
      if (!data.nationalAddressFile) {
        errors.nationalAddressFile = "أرفق مستند العنوان الوطني للمنشأة.";
      }
    }

    if (currentStep === "categories") {
      if (data.categories.length === 0) {
        errors.categories = "اختر نوع خدمة واحداً على الأقل.";
      }
    }

    if (currentStep === "documents") {
      const hasDocument = documents.some(
        (document) => document.fileName || document.number.trim()
      );
      if (!hasDocument) {
        errors.documents = "أضف مستنداً أو ترخيصاً واحداً على الأقل.";
      }
    }

    if (currentStep === "operations") {
      if (smsVerificationEnabled === true) {
        if (
          !normalizeSaudiMobileForCheck(
            data.contactPhone
          )
        ) {
          errors.contactPhone =
            "أدخل رقم جوال سعودي صحيح لمسؤول التواصل.";
        } else if (
          !contactPhoneVerified ||
          contactPhoneVerifiedValue !==
            normalizeSaudiMobileForCheck(
              data.contactPhone
            )
        ) {
          errors.contactPhoneVerification =
            "يجب التحقق من رقم جوال مسؤول التواصل قبل المتابعة.";
        }
      }

      if (data.receivesPayments) {
        if (!data.iban.trim()) {
          errors.iban =
            "رقم IBAN مطلوب لاستقبال التسويات.";
        }

        if (!data.beneficiaryName.trim()) {
          errors.beneficiaryName =
            "اسم المستفيد مطلوب لاستقبال التسويات.";
        }
      }
    }

    setValidationErrors(errors);

    const firstError = Object.keys(errors)[0];
    if (firstError) {
      requestAnimationFrame(() => {
        document
          .querySelector(`[data-validation="${firstError}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return false;
    }

    return true;
  };

  const goNext = () => {
    if (!validateCurrentStep()) return;

    const index =
      steps.findIndex(
        (step) =>
          step.id === currentStep
      );

    if (
      index >= 0 &&
      index < steps.length - 1
    ) {
      setValidationErrors({});
      setCurrentStep(
        steps[index + 1].id
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const goBack = () => {
    const index =
      steps.findIndex(
        (step) =>
          step.id === currentStep
      );

    if (index > 0) {
      setCurrentStep(
        steps[index - 1].id
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };
    const saveDraft = () => {
    try {
      localStorage.setItem(
        "arees-loop-partner-onboarding-draft",
        JSON.stringify({
          data,
          documents,
          savedAt: new Date().toISOString(),
        })
      );

      setDraftSaved(true);
    } catch {
      setDraftSaved(true);
    }
  };

  const aiChecks = useMemo(() => {
    const checks: {
      label: string;
      state: "ok" | "warn";
      note: string;
    }[] = [];

    const accountOk =
      applicationStatus === "NEEDS_COMPLETION" ||
      Boolean(
        data.firstName.trim() &&
          data.lastName.trim() &&
          data.email.trim() &&
          data.phone.trim() &&
          data.password.trim() &&
          emailVerified &&
          data.partnerType
      );

    checks.push({
      label: "بيانات الحساب",
      state: accountOk
        ? "ok"
        : "warn",
      note: accountOk
        ? "البيانات الأساسية مكتملة."
        : "توجد بيانات أساسية ناقصة.",
    });

    const roleOk =
      data.partnerType !== "business" ||
      Boolean(data.applicantRole);

    checks.push({
      label: "صفة مقدم الطلب",
      state: roleOk
        ? "ok"
        : "warn",
      note: roleOk
        ? "صفة مقدم الطلب محددة."
        : "حدد هل مقدم الطلب مالك المنشأة أم ممثلاً مفوضاً.",
    });

    const authorizationOk =
      data.partnerType !== "business" ||
      data.applicantRole !==
        "representative" ||
      Boolean(
        data.authorizationFile
      );

    checks.push({
      label: "صلاحية الممثل",
      state: authorizationOk
        ? "ok"
        : "warn",
      note:
        data.partnerType ===
          "business" &&
        data.applicantRole ===
          "representative"
          ? authorizationOk
            ? "تم إرفاق التفويض للمراجعة."
            : "يلزم إرفاق تفويض ساري ومصدق من الغرفة التجارية."
          : "لا يوجد متطلب تفويض إضافي حسب الاختيار الحالي.",
    });

    const businessOk = Boolean(
      data.tradeName.trim() &&
        data.country.trim() &&
        data.city.trim() &&
        data.district.trim() &&
        data.street.trim() &&
        /^[A-Z]{4}\d{4}$/.test(data.shortNationalAddress.trim().toUpperCase()) &&
        Boolean(data.nationalAddressFile)
    );

    checks.push({
      label: "بيانات النشاط",
      state: businessOk
        ? "ok"
        : "warn",
      note: businessOk
        ? "بيانات النشاط الأساسية مكتملة."
        : "أكمل اسم النشاط والمدينة والحي والشارع والعنوان الوطني ومرفقه.",
    });

    checks.push({
      label: "نوع الخدمات",
      state:
        data.categories.length > 0
          ? "ok"
          : "warn",
      note:
        data.categories.length > 0
          ? `تم اختيار ${data.categories.length} تصنيف.`
          : "اختر تصنيف خدمة واحداً على الأقل.",
    });

    const documentsOk =
      documents.some(
        (document) =>
          document.fileName ||
          document.number
      );

    checks.push({
      label: "الوثائق والتراخيص",
      state: documentsOk
        ? "ok"
        : "warn",
      note: documentsOk
        ? "توجد مستندات جاهزة للتدقيق."
        : "لم تتم إضافة مستند أو ترخيص بعد.",
    });

    const settlementOk =
      !data.receivesPayments ||
      Boolean(
        data.iban.trim() &&
          data.beneficiaryName.trim()
      );

    checks.push({
      label: "بيانات التسوية",
      state: settlementOk
        ? "ok"
        : "warn",
      note: settlementOk
        ? data.receivesPayments
          ? "بيانات التسوية الأساسية مكتملة."
          : "التسوية عبر Arees Loop غير مفعلة."
        : "أكمل IBAN واسم المستفيد.",
    });

    const contactPhoneOk =
      smsVerificationEnabled !== true ||
      Boolean(
        contactPhoneVerified &&
          contactPhoneVerifiedValue ===
            normalizeSaudiMobileForCheck(
              data.contactPhone
            )
      );

    checks.push({
      label: "جوال مسؤول التواصل",
      state: contactPhoneOk
        ? "ok"
        : "warn",
      note:
        smsVerificationEnabled !== true
          ? "التحقق عبر الرسائل غير مفعّل حالياً."
          : contactPhoneOk
            ? "تم توثيق رقم مسؤول التواصل."
            : "يلزم توثيق رقم مسؤول التواصل عبر SMS.",
    });

    return checks;
  }, [
    data,
    documents,
    emailVerified,
    smsVerificationEnabled,
    contactPhoneVerified,
    contactPhoneVerifiedValue,
    applicationStatus,
  ]);

  const canSubmit =
    data.declaration &&
    data.termsAccepted &&
    !aiChecks.some(
      (item) =>
        item.state === "warn"
    );

  const submitApplication = async () => {
  if (!canSubmit) return;

  try {
    const response = await fetch("/api/partner/application", {
      method:
        applicationStatus === "NEEDS_COMPLETION"
          ? "PATCH"
          : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        legalNameAr: data.legalName,
        tradeNameAr: data.tradeName,

        partnerType: data.partnerType,
        applicantRole: data.applicantRole,
        applicantJobTitle: data.jobTitle,

        unifiedNumber: data.unifiedNumber,
        commercialRegister: data.registrationNumber,
        proofType: data.proofType,
        descriptionAr: data.description,

        vatRegistered: data.vatRegistered,
        vatNumber: data.vatNumber,

        websiteUrl: data.website,

        country: data.country,
        city: data.city,
        address: [
          data.district,
          data.street,
          data.shortNationalAddress,
        ]
          .filter(Boolean)
          .join(" - "),

        businessPhone: data.businessPhone,
        businessEmail: data.businessEmail,

        mainContactName: data.contactName,
        mainContactEmail: data.contactEmail,
        mainContactPhone: data.contactPhone,
        mainContactJobTitle: data.jobTitle,

        operates24h: data.operates24h,
        operatingHours: data.operatingHours,

        receivesPayments: data.receivesPayments,
        iban: data.iban,
        beneficiaryName: data.beneficiaryName,

        publicName: data.publicName,

        categories: data.categories,

        licenses: documents.map((document) => ({
          type: document.type,
          issuer: document.issuer,
          licenseNumber: document.number,
          issueDate: document.issueDate || null,
          expiryDate: document.expiryDate || null,
        })),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      window.alert(
        result.message || "تعذر إرسال طلب الشراكة."
      );
      return;
    }

    if (result?.application?.id) {
      setApplicationId(String(result.application.id));
    }

    if (result?.application?.status) {
      setApplicationStatus(
        String(result.application.status)
      );
    }

    const filesToUpload: Array<{
      file: File;
      type: string;
      label: string;
    }> = [];

    if (uploadedFiles.authorization) {
      filesToUpload.push({
        file: uploadedFiles.authorization,
        type: "AUTHORIZATION",
        label: "تفويض ممثل المنشأة",
      });
    }

    if (uploadedFiles.nationalAddress) {
      filesToUpload.push({
        file: uploadedFiles.nationalAddress,
        type: "BUSINESS_PROOF",
        label: "إثبات العنوان الوطني",
      });
    }

    if (uploadedFiles.ibanCertificate) {
      filesToUpload.push({
        file: uploadedFiles.ibanCertificate,
        type: "IBAN_CERTIFICATE",
        label: "شهادة IBAN / خطاب البنك",
      });
    }

    if (uploadedFiles.vatCertificate) {
      filesToUpload.push({
        file: uploadedFiles.vatCertificate,
        type: "VAT_CERTIFICATE",
        label: "شهادة التسجيل الضريبي",
      });
    }

    for (const document of documents) {
      const file = uploadedFiles.documents[document.id];

      if (file) {
        const documentLabel = document.type.trim();
        const normalizedLabel = documentLabel.toLowerCase();

        let uploadType = "OTHER";

        if (
          normalizedLabel.includes("سجل تجاري") ||
          normalizedLabel.includes("السجل التجاري") ||
          normalizedLabel.includes("commercial register") ||
          normalizedLabel.includes("commercial registration")
        ) {
          uploadType = "COMMERCIAL_REGISTER";
        } else if (
          normalizedLabel.includes("إثبات منشأة") ||
          normalizedLabel.includes("وثيقة المنشأة")
        ) {
          uploadType = "BUSINESS_PROOF";
        }

        filesToUpload.push({
          file,
          type: uploadType,
          label: documentLabel || "مستند / ترخيص",
        });
      }
    }

    for (const item of filesToUpload) {
      const uploadData = new FormData();

      uploadData.append("file", item.file);
      uploadData.append("type", item.type);
      uploadData.append("label", item.label);

      const uploadResponse = await fetch(
        "/api/partner/documents/upload",
        {
          method: "POST",
          body: uploadData,
        }
      );

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        console.error(
          "Partner document upload failed:",
          uploadResult
        );

        window.alert(
          uploadResult.message ||
            "تم إنشاء طلب الشراكة، لكن تعذر رفع أحد المستندات."
        );

        return;
      }
    }

    const reviewResponse = await fetch(
      "/api/partner/application/review",
      {
        method: "POST",
      }
    );

    const reviewPayload = await reviewResponse.json();

    if (reviewPayload?.review) {
      setAiReviewResult(
        reviewPayload.review as AiReviewClientResult
      );
    }

    if (reviewPayload?.application?.status) {
      setApplicationStatus(
        String(reviewPayload.application.status)
      );
    }

    if (!reviewResponse.ok) {
      console.error(
        "Partner AI review failed:",
        reviewPayload
      );
    }

    setCurrentStep("done");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  } catch (error) {
    console.error(
      "Partner application submission failed:",
      error
    );

    window.alert(
      "تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى."
    );
  }
};

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[#F5F1E8] text-[#0D3B34]"
      style={{
        fontFamily:
          "var(--font-ibm-plex-arabic), sans-serif",
      }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 top-10 h-[560px] w-[560px] rounded-full bg-[#0D3B34]/6 blur-[120px]" />

        <div className="absolute -left-40 top-[40%] h-[500px] w-[500px] rounded-full bg-[#D4AF37]/10 blur-[120px]" />
      </div>

      <header className="relative z-40 border-b border-[#0D3B34]/7 bg-[#F9F6EF]/90 backdrop-blur-xl">
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
              بوابة انضمام واعتماد الشركاء
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full border border-[#0D3B34]/10 bg-white/70 px-4 py-2.5 text-xs font-semibold text-[#0D3B34]/70"
          >
            العودة للمنصة
          </Link>
        </div>
      </header>

      {currentStep !== "done" && (
        <>
          <div className="relative z-20 border-b border-[#0D3B34]/5 bg-white/30">
            <div className="mx-auto max-w-[1100px] px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold text-[#0D3B34]/45">
                    طلب اعتماد شريك
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {
                      steps[
                        activeIndex
                      ]?.title
                    }
                  </p>
                </div>

                <span className="text-lg font-bold text-[#B99124]">
                  {progress}%
                </span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#0D3B34]/8">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-[#D4AF37] to-[#0D3B34] transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="relative z-20 hidden border-b border-[#0D3B34]/5 bg-[#F9F6EF]/55 md:block">
            <div className="mx-auto grid max-w-[1100px] grid-cols-6 gap-2 px-5 py-3">
              {steps.map(
                (step, index) => (
                  <div
                    key={step.id}
                    className={`rounded-xl px-2 py-2 text-center text-[10px] font-bold ${
                      index ===
                      activeIndex
                        ? "bg-[#0D3B34] text-white"
                        : index <
                            activeIndex
                          ? "bg-[#E9F3EE] text-[#267247]"
                          : "text-[#0D3B34]/35"
                    }`}
                  >
                    {index <
                    activeIndex
                      ? "✓ "
                      : ""}
                    {step.short}
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}

      <div className="relative z-10 mx-auto max-w-[980px] px-5 py-10 md:px-8 md:py-14">
        {currentStep ===
          "account" && (
          <StepCard
            eyebrow="STEP 01 / 06"
            title="الحساب وصفة مقدم الخدمة"
            description="أنشئ حساب الشريك وحدد صفتك والجهة التي تمثلها."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div data-validation="firstName"><Field label="الاسم الأول *">
                <input
                  value={
                    data.firstName
                  }
                  onChange={(e) =>
                    update(
                      "firstName",
                      e.target.value
                    )
                  }
                  className={`${inputClass} ${validationErrors.firstName ? errorInputClass : ""}`}
                />
              </Field><ValidationError message={validationErrors.firstName} /></div>

              <div data-validation="lastName"><Field label="اسم العائلة *">
                <input
                  value={
                    data.lastName
                  }
                  onChange={(e) =>
                    update(
                      "lastName",
                      e.target.value
                    )
                  }
                  className={`${inputClass} ${validationErrors.lastName ? errorInputClass : ""}`}
                />
              </Field><ValidationError message={validationErrors.lastName} /></div>

              <div data-validation="email"><Field label="البريد الإلكتروني *">
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) =>
                    update(
                      "email",
                      e.target.value
                    )
                  }
                  placeholder="name@company.com"
                  className={`${inputClass} ${validationErrors.email ? errorInputClass : ""}`}
                  dir="ltr"
                />
              </Field><ValidationError message={validationErrors.email} /></div>

              <div
                data-validation="emailVerification"
                className="md:col-span-2 rounded-[22px] border border-[#0D3B34]/8 bg-[#FAF9F5] p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#0D3B34]">
                      التحقق من البريد الإلكتروني *
                    </p>
                    <p className="mt-1 text-xs leading-6 text-[#0D3B34]/55">
                      نرسل رمزاً من 6 أرقام إلى البريد المسجل للتأكد من ملكيته.
                    </p>
                  </div>

                  {emailVerified ? (
                    <span className="rounded-full bg-[#E8F5EC] px-4 py-2 text-xs font-bold text-[#267247]">
                      ✓ تم التحقق
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={requestPartnerEmailOtp}
                      disabled={emailOtpLoading || !data.email.trim()}
                      className="rounded-2xl bg-[#0D3B34] px-5 py-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {emailOtpLoading
                        ? "جاري الإرسال..."
                        : emailOtpSent
                          ? "إعادة إرسال الرمز"
                          : "إرسال رمز التحقق"}
                    </button>
                  )}
                </div>

                {emailOtpSent && !emailVerified && (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                      value={emailOtp}
                      onChange={(e) => {
                        setEmailOtp(
                          e.target.value.replace(/\D/g, "").slice(0, 6)
                        );
                        setEmailOtpError("");
                      }}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="000000"
                      dir="ltr"
                      className={`${inputClass} text-center text-lg font-bold tracking-[0.35em]`}
                    />
                    <button
                      type="button"
                      onClick={confirmPartnerEmailOtp}
                      disabled={emailOtpLoading || emailOtp.length !== 6}
                      className="rounded-2xl bg-[#D4AF37] px-6 py-3 text-xs font-bold text-[#0D3B34] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {emailOtpLoading ? "جاري التحقق..." : "تأكيد الرمز"}
                    </button>
                  </div>
                )}

                {emailOtpError && (
                  <p className="mt-3 text-xs font-semibold text-[#B42318]">
                    {emailOtpError}
                  </p>
                )}

                <ValidationError
                  message={validationErrors.emailVerification}
                />
              </div>

              <div data-validation="phone"><Field label="رقم الجوال *">
                <input
                  value={data.phone}
                  onChange={(e) =>
                    update(
                      "phone",
                      e.target.value.replace(
                        /[^\d+]/g,
                        ""
                      )
                    )
                  }
                  placeholder="+966 5XXXXXXXX"
                  className={`${inputClass} ${validationErrors.phone ? errorInputClass : ""}`}
                  dir="ltr"
                />
              </Field><ValidationError message={validationErrors.phone} /></div>
            </div>

            <div data-validation="password"><Field label="كلمة المرور *">
              <input
                type="password"
                value={data.password}
                onChange={(e) =>
                  update(
                    "password",
                    e.target.value
                  )
                }
                className={`${inputClass} ${validationErrors.password ? errorInputClass : ""}`}
                dir="ltr"
              />
            </Field><ValidationError message={validationErrors.password} /></div>

            <div data-validation="partnerType">
              <Field label="نوع مقدم الخدمة *">
              <div className={`grid gap-3 rounded-[22px] ${
                validationErrors.partnerType ? "border border-[#C83B3B] bg-[#FFF8F8] p-2" : ""
              } md:grid-cols-3`}>
                <SelectCard
                  title="فرد"
                  description="مقدم خدمة فردي أو مهني"
                  active={
                    data.partnerType ===
                    "individual"
                  }
                  onClick={() => {
                    update(
                      "partnerType",
                      "individual"
                    );

                    update(
                      "applicantRole",
                      ""
                    );
                  }}
                />

                <SelectCard
                  title="مؤسسة أو شركة"
                  description="منشأة تجارية مسجلة"
                  active={
                    data.partnerType ===
                    "business"
                  }
                  onClick={() =>
                    update(
                      "partnerType",
                      "business"
                    )
                  }
                />

                <SelectCard
                  title="جهة حكومية أو غير ربحية"
                  description="جهة مؤسسية أو مجتمعية"
                  active={
                    data.partnerType ===
                    "government"
                  }
                  onClick={() => {
                    update(
                      "partnerType",
                      "government"
                    );

                    update(
                      "applicantRole",
                      ""
                    );
                  }}
                />
              </div>
            </Field>
            <ValidationError message={validationErrors.partnerType} />
            </div>

            {data.partnerType ===
              "business" && (
              <div className="rounded-[24px] border border-[#0D3B34]/8 bg-[#FAF9F5] p-5">
                <div data-validation="applicantRole">
                <Field label="صفتك لدى المنشأة *">
                  <div className={`grid gap-3 rounded-[22px] ${
                    validationErrors.applicantRole ? "border border-[#C83B3B] bg-[#FFF8F8] p-2" : ""
                  } md:grid-cols-2`}>
                    <SelectCard
                      title="مالك المنشأة"
                      description="صاحب المنشأة أو المالك المخول"
                      active={
                        data.applicantRole ===
                        "owner"
                      }
                      onClick={() => {
                        update(
                          "applicantRole",
                          "owner"
                        );

                        update(
                          "authorizationFile",
                          ""
                        );
                      }}
                    />

                    <SelectCard
                      title="ممثل مفوض"
                      description="ممثل مفوض بالتسجيل والتعاقد"
                      active={
                        data.applicantRole ===
                        "representative"
                      }
                      onClick={() =>
                        update(
                          "applicantRole",
                          "representative"
                        )
                      }
                    />
                  </div>
                </Field>
                <ValidationError message={validationErrors.applicantRole} />
                </div>

                {data.applicantRole ===
                  "representative" && (
                  <div className="mt-5 space-y-4">
                    <div data-validation="jobTitle"><Field label="المسمى الوظيفي *">
                      <input
                        value={
                          data.jobTitle
                        }
                        onChange={(
                          e
                        ) =>
                          update(
                            "jobTitle",
                            e.target
                              .value
                          )
                        }
                        className={`${inputClass} ${validationErrors.jobTitle ? errorInputClass : ""}`}
                      />
                    </Field><ValidationError message={validationErrors.jobTitle} /></div>

                    <div className="rounded-[20px] border border-[#D4AF37]/25 bg-[#FFF9E8] p-4">
                      <p className="text-sm font-bold text-[#8B6812]">
                        تفويض الممثل
                      </p>

                      <p className="mt-2 text-xs leading-7 text-[#0D3B34]/65">
                        في حال التسجيل
                        كممثل عن المنشأة،
                        يلزم إرفاق تفويض
                        ساري ومصدّق من
                        الغرفة التجارية
                        يثبت صلاحية الممثل
                        في التسجيل
                        والتعاقد نيابةً عن
                        المنشأة.
                      </p>
                    </div>

                    <div data-validation="authorizationFile"><Field label="التفويض المصدق من الغرفة التجارية *">
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(
                          e
                        ) =>
                          {
                            const file = e.target.files?.[0] ?? null;
                            update("authorizationFile", file?.name || "");
                            setUploadedFiles((current) => ({
                              ...current,
                              authorization: file,
                            }));
                          }
                        }
                        className={`${inputClass} ${validationErrors.authorizationFile ? errorInputClass : ""}`}
                      />
                    </Field><ValidationError message={validationErrors.authorizationFile} /></div>

                    <AiHint
                      title="فحص المستند بالذكاء الاصطناعي"
                      text="سيتم فحص وضوح المستند واسم المنشأة واسم الممثل وفترة الصلاحية مبدئياً. الاعتماد النهائي يتم بواسطة فريق أريس."
                    />
                  </div>
                )}
              </div>
            )}

            <Actions
              onBack={goBack}
              onNext={goNext}
              onSave={saveDraft}
              saved={draftSaved}
              first
            />
          </StepCard>
        )}
                {currentStep === "business" && (
          <StepCard
            eyebrow="STEP 02 / 06"
            title="بيانات النشاط والمقر"
            description="أدخل بيانات النشاط ومقره الرئيسي باستخدام العنوان الوطني المختصر. موقع كل خدمة أو فعالية يحدد بصورة مستقلة عند إضافتها لاحقاً."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div data-validation="tradeName"><Field label="الاسم التجاري / اسم النشاط *">
                <input
                  value={data.tradeName}
                  onChange={(e) => {
                    update(
                      "tradeName",
                      e.target.value
                    );

                    if (!data.publicName) {
                      update(
                        "publicName",
                        e.target.value
                      );
                    }
                  }}
                  className={`${inputClass} ${validationErrors.tradeName ? errorInputClass : ""}`}
                />
              </Field><ValidationError message={validationErrors.tradeName} /></div>

              <Field label="الاسم القانوني">
                <input
                  value={data.legalName}
                  onChange={(e) =>
                    update(
                      "legalName",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="نوع الإثبات">
                <select
                  value={data.proofType}
                  onChange={(e) =>
                    update(
                      "proofType",
                      e.target.value
                    )
                  }
                  className={inputClass}
                >
                  <option value="">
                    اختر حسب نوع مقدم الخدمة
                  </option>
                  <option>
                    سجل تجاري
                  </option>
                  <option>
                    وثيقة عمل حر
                  </option>
                  <option>
                    ترخيص مهني
                  </option>
                  <option>
                    وثيقة أسر منتجة
                  </option>
                  <option>
                    وثيقة جهة حكومية أو غير ربحية
                  </option>
                  <option>
                    وثيقة نظامية أخرى
                  </option>
                </select>
              </Field>

              <Field label="رقم السجل / الوثيقة">
                <input
                  value={
                    data.registrationNumber
                  }
                  onChange={(e) =>
                    update(
                      "registrationNumber",
                      e.target.value
                    )
                  }
                  className={inputClass}
                  dir="ltr"
                />
              </Field>

              {data.partnerType ===
                "business" && (
                <Field label="الرقم الموحد">
                  <input
                    value={
                      data.unifiedNumber
                    }
                    onChange={(e) =>
                      update(
                        "unifiedNumber",
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    className={inputClass}
                    dir="ltr"
                  />
                </Field>
              )}

              <Field label="الدولة">
                <input
                  value="المملكة العربية السعودية"
                  readOnly
                  className={`${inputClass} cursor-not-allowed bg-[#F1EFE8] font-semibold`}
                />
              </Field>

              <div data-validation="city"><Field label="المدينة *">
                <input
                  value={data.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="مثال: المدينة المنورة"
                  className={`${inputClass} ${validationErrors.city ? errorInputClass : ""}`}
                />
              </Field><ValidationError message={validationErrors.city} /></div>

              <div data-validation="district"><Field label="الحي *">
                <input
                  value={data.district}
                  onChange={(e) => update("district", e.target.value)}
                  placeholder="اسم الحي"
                  className={`${inputClass} ${validationErrors.district ? errorInputClass : ""}`}
                />
              </Field><ValidationError message={validationErrors.district} /></div>

              <div data-validation="street"><Field label="الشارع *">
                <input
                  value={data.street}
                  onChange={(e) => update("street", e.target.value)}
                  placeholder="اسم الشارع"
                  className={`${inputClass} ${validationErrors.street ? errorInputClass : ""}`}
                />
              </Field><ValidationError message={validationErrors.street} /></div>

              <div data-validation="shortNationalAddress">
                <Field label="العنوان الوطني المختصر *">
                  <input
                    value={data.shortNationalAddress}
                    onChange={(e) =>
                      update(
                        "shortNationalAddress",
                        e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)
                      )
                    }
                    placeholder="مثال: ABCD1234"
                    maxLength={8}
                    dir="ltr"
                    className={`${inputClass} ${validationErrors.shortNationalAddress ? errorInputClass : ""}`}
                  />
                </Field>
                <ValidationError message={validationErrors.shortNationalAddress} />
              </div>

              <div data-validation="nationalAddressFile" className="md:col-span-2">
                <Field label="مرفق العنوان الوطني للمنشأة *">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      update("nationalAddressFile", file?.name || "");
                      setUploadedFiles((current) => ({
                        ...current,
                        nationalAddress: file,
                      }));
                    }}
                    className={`${inputClass} ${validationErrors.nationalAddressFile ? errorInputClass : ""}`}
                  />
                </Field>
                <ValidationError message={validationErrors.nationalAddressFile} />
                <p className="mt-2 text-xs leading-6 text-[#0D3B34]/50">
                  أرفق نسخة من إثبات العنوان الوطني الخاص بمقر المنشأة بصيغة PDF أو صورة.
                </p>
              </div>
            </div>

            <Field label="نبذة عن النشاط">
              <textarea
                value={data.description}
                onChange={(e) =>
                  update(
                    "description",
                    e.target.value
                  )
                }
                rows={4}
                className={`${inputClass} h-auto py-4`}
                placeholder="اكتب وصفاً مختصراً للنشاط والخدمات..."
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="البريد التجاري">
                <input
                  type="email"
                  value={
                    data.businessEmail
                  }
                  onChange={(e) =>
                    update(
                      "businessEmail",
                      e.target.value
                    )
                  }
                  className={inputClass}
                  dir="ltr"
                />
              </Field>

              <Field label="جوال / هاتف النشاط">
                <input
                  value={
                    data.businessPhone
                  }
                  onChange={(e) =>
                    update(
                      "businessPhone",
                      e.target.value
                    )
                  }
                  className={inputClass}
                  dir="ltr"
                />
              </Field>
            </div>

            <Field label="الموقع الإلكتروني — اختياري">
              <input
                value={data.website}
                onChange={(e) =>
                  update(
                    "website",
                    e.target.value
                  )
                }
                placeholder="https://"
                className={inputClass}
                dir="ltr"
              />
            </Field>

            <InfoBox>
              بيانات التواصل والمعلومات
              الداخلية لا تظهر تلقائياً
              للزائر. بيانات صفحة الشريك
              العامة يتم التحكم فيها بعد
              تفعيل الحساب.
            </InfoBox>

            <Actions
              onBack={goBack}
              onNext={goNext}
              onSave={saveDraft}
              saved={draftSaved}
            />
          </StepCard>
        )}

        {currentStep ===
          "categories" && (
          <StepCard
            eyebrow="STEP 03 / 06"
            title="ما الخدمات التي ستقدمها؟"
            description="يمكن اختيار أكثر من تصنيف. هذه الاختيارات تحدد أنواع الخدمات التي يمكن إضافتها بعد تفعيل حساب الشريك."
          >
            <div data-validation="categories">
            <div className={`grid gap-3 rounded-[22px] ${
              validationErrors.categories ? "border border-[#C83B3B] bg-[#FFF8F8] p-2" : ""
            } md:grid-cols-2`}>
              {categoryOptions.map(
                (category) => (
                  <SelectCard
                    key={category.name}
                    title={
                      category.name
                    }
                    description={
                      category.description
                    }
                    active={data.categories.includes(
                      category.name
                    )}
                    onClick={() =>
                      toggleCategory(
                        category.name
                      )
                    }
                  />
                )
              )}
            </div>
            <ValidationError message={validationErrors.categories} />
            </div>

            {data.categories.length >
              0 && (
              <div className="rounded-[22px] bg-[#EEF3F0] p-4">
                <p className="text-xs font-semibold text-[#0D3B34]/55">
                  التصنيفات المختارة
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {data.categories.map(
                    (category) => (
                      <button
                        key={
                          category
                        }
                        type="button"
                        onClick={() =>
                          toggleCategory(
                            category
                          )
                        }
                        className="rounded-full bg-[#0D3B34] px-3 py-2 text-xs font-semibold text-white"
                      >
                        {category} ×
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            <AiHint
              title="متطلبات ذكية حسب نوع الخدمة"
              text="لن نفرض نفس المستندات على الجميع. المرحلة التالية تعرض متطلبات الوثائق والتراخيص بحسب نوع مقدم الخدمة والتصنيفات التي اخترتها."
            />

            <Actions
              onBack={goBack}
              onNext={goNext}
              onSave={saveDraft}
              saved={draftSaved}
            />
          </StepCard>
        )}

        {currentStep ===
          "documents" && (
          <StepCard
            eyebrow="STEP 04 / 06"
            title="التراخيص والوثائق"
            description="أرفق الوثائق المناسبة لطبيعة الجهة والخدمات المختارة. المتطلبات تختلف بين المنشآت والأفراد والجهات المؤسسية."
          >
            <AiHint
              title="مساعد الامتثال الذكي"
              text="يفحص النظام اكتمال البيانات والمستندات ويعرض الملاحظات قبل الإرسال. التحقق الآلي مساعد، أما اعتماد الشريك والمستندات فيتم بواسطة أريس."
            />

            {data.partnerType ===
              "business" && (
              <Requirement
                title="إثبات المنشأة"
                text="السجل التجاري أو الوثيقة النظامية المناسبة للمنشأة."
              />
            )}

            {data.partnerType ===
              "individual" && (
              <Requirement
                title="إثبات مقدم الخدمة"
                text="الوثيقة المهنية أو الترخيص أو الإثبات المناسب لطبيعة الخدمة."
              />
            )}

            {data.partnerType ===
              "government" && (
              <Requirement
                title="إثبات الجهة"
                text="المستند أو التعريف الرسمي المناسب للجهة الحكومية أو غير الربحية."
              />
            )}

            {data.applicantRole ===
              "representative" && (
              <Requirement
                title="تفويض الممثل"
                text="تفويض ساري ومصدق من الغرفة التجارية يثبت صلاحية التسجيل والتعاقد نيابةً عن المنشأة."
                important
              />
            )}

            <div data-validation="documents">
              <ValidationError message={validationErrors.documents} />
            <div className={`space-y-4 rounded-[22px] ${
              validationErrors.documents ? "border border-[#C83B3B] bg-[#FFF8F8] p-2" : ""
            }`}>
              {documents.map(
                (
                  document,
                  index
                ) => (
                  <div
                    key={
                      document.id
                    }
                    className="rounded-[26px] border border-[#0D3B34]/8 bg-[#FAF9F5] p-5"
                  >
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-[#B99124]">
                          DOCUMENT{" "}
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </p>

                        <h3 className="mt-1 font-bold">
                          مستند /
                          ترخيص{" "}
                          {index + 1}
                        </h3>
                      </div>

                      {documents.length >
                        1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeDocument(
                              document.id
                            )
                          }
                          className="rounded-full bg-[#A43131]/8 px-3 py-1.5 text-xs font-semibold text-[#A43131]"
                        >
                          حذف
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="نوع المستند / الترخيص">
                        <input
                          value={
                            document.type
                          }
                          onChange={(
                            e
                          ) =>
                            updateDocument(
                              document.id,
                              "type",
                              e.target
                                .value
                            )
                          }
                          placeholder="مثال: ترخيص مرشد سياحي"
                          className={
                            inputClass
                          }
                        />
                      </Field>

                      <Field label="جهة الإصدار">
                        <input
                          value={
                            document.issuer
                          }
                          onChange={(
                            e
                          ) =>
                            updateDocument(
                              document.id,
                              "issuer",
                              e.target
                                .value
                            )
                          }
                          className={
                            inputClass
                          }
                        />
                      </Field>

                      <Field label="رقم المستند">
                        <input
                          value={
                            document.number
                          }
                          onChange={(
                            e
                          ) =>
                            updateDocument(
                              document.id,
                              "number",
                              e.target
                                .value
                            )
                          }
                          className={
                            inputClass
                          }
                          dir="ltr"
                        />
                      </Field>

                      <Field label="تاريخ الإصدار">
                        <input
                          type="date"
                          value={
                            document.issueDate
                          }
                          onChange={(
                            e
                          ) =>
                            updateDocument(
                              document.id,
                              "issueDate",
                              e.target
                                .value
                            )
                          }
                          className={
                            inputClass
                          }
                        />
                      </Field>

                      <Field label="تاريخ الانتهاء — إن وجد">
                        <input
                          type="date"
                          value={
                            document.expiryDate
                          }
                          onChange={(
                            e
                          ) =>
                            updateDocument(
                              document.id,
                              "expiryDate",
                              e.target
                                .value
                            )
                          }
                          className={
                            inputClass
                          }
                        />
                      </Field>

                      <Field label="رفع المستند">
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(
                            e
                          ) =>
                            {
                              const file = e.target.files?.[0] ?? null;
                              updateDocument(
                                document.id,
                                "fileName",
                                file?.name || ""
                              );
                              setUploadedFiles((current) => {
                                const nextDocuments = {
                                  ...current.documents,
                                };

                                if (file) {
                                  nextDocuments[document.id] = file;
                                } else {
                                  delete nextDocuments[document.id];
                                }

                                return {
                                  ...current,
                                  documents: nextDocuments,
                                };
                              });
                            }
                          }
                          className={
                            inputClass
                          }
                        />
                      </Field>
                    </div>

                    {data.categories
                      .length >
                      0 && (
                      <div className="mt-5">
                        <p className="text-xs font-bold">
                          الخدمات التي
                          يغطيها هذا
                          الترخيص
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {data.categories.map(
                            (
                              category
                            ) => {
                              const active =
                                document.coveredCategories.includes(
                                  category
                                );

                              return (
                                <button
                                  key={
                                    category
                                  }
                                  type="button"
                                  onClick={() =>
                                    toggleDocumentCategory(
                                      document.id,
                                      category
                                    )
                                  }
                                  className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                                    active
                                      ? "border-[#D4AF37] bg-[#0D3B34] text-white"
                                      : "border-[#0D3B34]/10 bg-white text-[#0D3B34]/60"
                                  }`}
                                >
                                  {active
                                    ? "✓ "
                                    : ""}
                                  {
                                    category
                                  }
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
            </div>

            <button
              type="button"
              onClick={addDocument}
              className="w-full rounded-2xl border border-dashed border-[#B99124]/45 bg-[#FFF9EA]/70 py-4 text-sm font-bold text-[#8B6812]"
            >
              + إضافة مستند أو ترخيص آخر
            </button>

            <Actions
              onBack={goBack}
              onNext={goNext}
              onSave={saveDraft}
              saved={draftSaved}
            />
          </StepCard>
        )}
                {currentStep === "operations" && (
          <StepCard
            eyebrow="STEP 05 / 06"
            title="بيانات التشغيل والتسوية"
            description="أدخل بيانات التواصل والتشغيل. بيانات التسوية المالية مطلوبة فقط إذا كانت المدفوعات ستتم عبر Arees Loop."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="مسؤول التواصل">
                <input
                  value={data.contactName}
                  onChange={(e) =>
                    update(
                      "contactName",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <div data-validation="contactPhone">
                <Field label="جوال مسؤول التواصل">
                  <input
                    value={data.contactPhone}
                    onChange={(e) =>
                      update(
                        "contactPhone",
                        e.target.value
                      )
                    }
                    placeholder="05xxxxxxxx"
                    className={`${inputClass} ${
                      validationErrors.contactPhone
                        ? errorInputClass
                        : ""
                    }`}
                    dir="ltr"
                  />

                  {smsVerificationEnabled === null ? (
                    <p className="mt-2 text-[11px] text-[#0D3B34]/45">
                      جاري التحقق من حالة خدمة الرسائل...
                    </p>
                  ) : smsVerificationEnabled === false ? (
                    <div className="mt-2 rounded-xl border border-[#0D3B34]/8 bg-[#0D3B34]/[0.035] px-3 py-2 text-[11px] leading-5 text-[#0D3B34]/55">
                      التحقق عبر SMS جاهز تقنياً وغير مفعّل حالياً. لن يتم إرسال أي رسالة أو احتساب تكلفة.
                    </div>
                  ) : contactPhoneVerified ? (
                    <div className="mt-2 flex items-center gap-2 text-xs font-bold text-emerald-700">
                      <span>✓</span>
                      <span>تم التحقق من الرقم</span>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-3">
                      <button
                        type="button"
                        onClick={
                          requestPartnerContactPhoneOtp
                        }
                        disabled={
                          contactPhoneOtpLoading
                        }
                        className="rounded-xl border border-[#B99124]/35 bg-[#FFF9EA] px-4 py-2.5 text-xs font-bold text-[#8B6812] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {contactPhoneOtpLoading
                          ? "جاري الإرسال..."
                          : contactPhoneOtpSent
                            ? "إعادة إرسال الرمز"
                            : "تحقق من الرقم"}
                      </button>

                      {contactPhoneOtpSent && (
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            value={
                              contactPhoneOtp
                            }
                            onChange={(e) =>
                              setContactPhoneOtp(
                                e.target.value
                                  .replace(
                                    /\D/g,
                                    ""
                                  )
                                  .slice(0, 6)
                              )
                            }
                            placeholder="رمز التحقق"
                            inputMode="numeric"
                            className={inputClass}
                            dir="ltr"
                          />

                          <button
                            type="button"
                            onClick={
                              confirmPartnerContactPhoneOtp
                            }
                            disabled={
                              contactPhoneOtpLoading
                            }
                            className="shrink-0 rounded-xl bg-[#0D3B34] px-5 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            تأكيد الرمز
                          </button>
                        </div>
                      )}

                      {contactPhoneOtpError && (
                        <p className="text-xs font-semibold text-red-600">
                          {
                            contactPhoneOtpError
                          }
                        </p>
                      )}
                    </div>
                  )}
                </Field>

                <ValidationError
                  message={
                    validationErrors.contactPhone
                  }
                />

                <div data-validation="contactPhoneVerification">
                  <ValidationError
                    message={
                      validationErrors.contactPhoneVerification
                    }
                  />
                </div>
              </div>
            </div>

            <Field label="البريد التشغيلي">
              <input
                type="email"
                value={data.contactEmail}
                onChange={(e) =>
                  update(
                    "contactEmail",
                    e.target.value
                  )
                }
                className={inputClass}
                dir="ltr"
              />
            </Field>

            <SelectCard
              title="الخدمة متاحة على مدار 24 ساعة"
              description="فعّل الخيار إذا كانت الجهة تستقبل الطلبات أو تقدم الخدمة طوال اليوم."
              active={data.operates24h}
              onClick={() =>
                update(
                  "operates24h",
                  !data.operates24h
                )
              }
            />

            {!data.operates24h && (
              <Field label="ساعات وأيام العمل">
                <input
                  value={
                    data.operatingHours
                  }
                  onChange={(e) =>
                    update(
                      "operatingHours",
                      e.target.value
                    )
                  }
                  placeholder="مثال: الأحد–الخميس، 9 ص – 6 م"
                  className={inputClass}
                />
              </Field>
            )}

            <div className="rounded-[26px] border border-[#0D3B34]/8 bg-[#FAF9F5] p-5">
              <SelectCard
                title="استقبال المدفوعات والتسويات عبر Arees Loop"
                description="فعّل هذا الخيار إذا كانت مستحقات الحجوزات ستتم تسويتها للشريك عبر المنصة."
                active={
                  data.receivesPayments
                }
                onClick={() =>
                  update(
                    "receivesPayments",
                    !data.receivesPayments
                  )
                }
              />

              {data.receivesPayments && (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div data-validation="iban"><Field label="IBAN *">
                    <input
                      value={data.iban}
                      onChange={(e) =>
                        update(
                          "iban",
                          e.target.value
                            .toUpperCase()
                            .replace(
                              /[^A-Z0-9]/g,
                              ""
                            )
                            .slice(0, 24)
                        )
                      }
                      placeholder="SA..."
                      className={`${inputClass} ${validationErrors.iban ? errorInputClass : ""}`}
                      dir="ltr"
                    />
                  </Field><ValidationError message={validationErrors.iban} /></div>

                  <div data-validation="beneficiaryName"><Field label="اسم المستفيد *">
                    <input
                      value={
                        data.beneficiaryName
                      }
                      onChange={(e) =>
                        update(
                          "beneficiaryName",
                          e.target.value
                        )
                      }
                      className={`${inputClass} ${validationErrors.beneficiaryName ? errorInputClass : ""}`}
                    />
                  </Field><ValidationError message={validationErrors.beneficiaryName} /></div>

                  <Field label="شهادة IBAN / خطاب البنك">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) =>
                        {
                          const file = e.target.files?.[0] ?? null;
                          update("ibanCertificate", file?.name || "");
                          setUploadedFiles((current) => ({
                            ...current,
                            ibanCertificate: file,
                          }));
                        }
                      }
                      className={
                        inputClass
                      }
                    />
                  </Field>
                </div>
              )}
            </div>

            <SelectCard
              title="مسجل في ضريبة القيمة المضافة"
              description="فعّل الخيار إذا كان مقدم الخدمة مسجلاً في ضريبة القيمة المضافة."
              active={
                data.vatRegistered
              }
              onClick={() =>
                update(
                  "vatRegistered",
                  !data.vatRegistered
                )
              }
            />

            {data.vatRegistered && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="رقم التسجيل الضريبي">
                  <input
                    value={
                      data.vatNumber
                    }
                    onChange={(e) =>
                      update(
                        "vatNumber",
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    className={
                      inputClass
                    }
                    dir="ltr"
                  />
                </Field>

                <Field label="شهادة التسجيل الضريبي">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) =>
                      {
                        const file = e.target.files?.[0] ?? null;
                        update("vatCertificate", file?.name || "");
                        setUploadedFiles((current) => ({
                          ...current,
                          vatCertificate: file,
                        }));
                      }
                    }
                    className={
                      inputClass
                    }
                  />
                </Field>
              </div>
            )}

            <div className="rounded-[26px] border border-[#0D3B34]/8 bg-[#FAF9F5] p-5">
              <div className="mb-5">
                <h3 className="font-bold">
                  هوية الظهور داخل المنصة
                </h3>

                <p className="mt-1 text-xs leading-6 text-[#0D3B34]/50">
                  الاسم والشعار اللذان
                  سيظهران للزوار بعد
                  اعتماد وتفعيل حساب
                  الشريك.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="اسم العرض">
                  <input
                    value={
                      data.publicName
                    }
                    onChange={(e) =>
                      update(
                        "publicName",
                        e.target.value
                      )
                    }
                    className={
                      inputClass
                    }
                  />
                </Field>

                <Field label="شعار الجهة">
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={(e) =>
                      update(
                        "logoFile",
                        e.target
                          .files?.[0]
                          ?.name || ""
                      )
                    }
                    className={
                      inputClass
                    }
                  />
                </Field>
              </div>
            </div>

            <Actions
              onBack={goBack}
              onNext={goNext}
              onSave={saveDraft}
              saved={draftSaved}
            />
          </StepCard>
        )}

        {currentStep === "review" && (
          <StepCard
            eyebrow="STEP 06 / 06"
            title="المراجعة والإرسال"
            description="راجع البيانات. مساعد الامتثال يفحص اكتمال الطلب قبل إرساله إلى فريق أريس للمراجعة النهائية."
          >
            <div className="rounded-[26px] bg-[#0D3B34] p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.16em] text-[#E5BE45]">
                    AI COMPLIANCE CHECK
                  </p>

                  <h3 className="mt-1 text-lg font-bold">
                    الفحص المبدئي للطلب
                  </h3>
                </div>

                <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold">
                  مساعد امتثال
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {aiChecks.map(
                  (check) => (
                    <div
                      key={
                        check.label
                      }
                      className="flex items-start gap-3 rounded-2xl bg-white/7 p-4"
                    >
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          check.state ===
                          "ok"
                            ? "bg-[#DFF2E7] text-[#267247]"
                            : "bg-[#FFF1D5] text-[#9A6B10]"
                        }`}
                      >
                        {check.state ===
                        "ok"
                          ? "✓"
                          : "!"}
                      </span>

                      <div>
                        <p className="text-sm font-bold">
                          {
                            check.label
                          }
                        </p>

                        <p className="mt-1 text-xs leading-6 text-white/55">
                          {
                            check.note
                          }
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>

              <p className="mt-4 text-[11px] leading-6 text-white/45">
                هذا فحص مساعد ولا يمثل
                اعتماداً نهائياً للشريك
                أو للمستندات.
              </p>
            </div>

            <ReviewSection
              title="الحساب والصفة"
              items={[
                [
                  "الاسم",
                  `${data.firstName} ${data.lastName}`,
                ],
                [
                  "البريد",
                  data.email,
                ],
                [
                  "الجوال",
                  data.phone,
                ],
                [
                  "نوع مقدم الخدمة",
                  partnerTypeLabel(
                    data.partnerType
                  ),
                ],
                [
                  "صفة مقدم الطلب",
                  data.applicantRole ===
                  "owner"
                    ? "مالك المنشأة"
                    : data.applicantRole ===
                        "representative"
                      ? "ممثل مفوض"
                      : "—",
                ],
              ]}
            />

            <ReviewSection
              title="النشاط والخدمات"
              items={[
                [
                  "الاسم التجاري",
                  data.tradeName,
                ],
                [
                  "المدينة",
                  data.city,
                ],
                [
                  "الحي",
                  data.district,
                ],
                [
                  "الشارع",
                  data.street,
                ],
                [
                  "العنوان الوطني المختصر",
                  data.shortNationalAddress,
                ],
                [
                  "مرفق العنوان الوطني",
                  data.nationalAddressFile || "غير مرفق",
                ],
                [
                  "رقم السجل / الوثيقة",
                  data.registrationNumber,
                ],
                [
                  "الخدمات",
                  data.categories.join(
                    "، "
                  ),
                ],
              ]}
            />

            <ReviewSection
              title="الوثائق والتشغيل"
              items={[
                [
                  "عدد المستندات",
                  String(
                    documents.length
                  ),
                ],
                [
                  "التفويض",
                  data.applicantRole ===
                  "representative"
                    ? data.authorizationFile ||
                      "غير مرفق"
                    : "غير مطلوب",
                ],
                [
                  "التسوية عبر المنصة",
                  data.receivesPayments
                    ? "نعم"
                    : "لا",
                ],
                [
                  "التسجيل الضريبي",
                  data.vatRegistered
                    ? "نعم"
                    : "لا",
                ],
              ]}
            />

            <div className="rounded-[24px] border border-[#D4AF37]/22 bg-[#FFF9E8] p-5">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={
                    data.declaration
                  }
                  onChange={(e) =>
                    update(
                      "declaration",
                      e.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4 accent-[#0D3B34]"
                />

                <span className="text-sm leading-7 text-[#0D3B34]/75">
                  أقر بصحة ودقة
                  البيانات والمستندات
                  المقدمة وبأن لدي
                  الصلاحية اللازمة
                  لتقديم طلب الانضمام،
                  وأتعهد بتحديث البيانات
                  عند حدوث أي تغيير
                  جوهري.
                </span>
              </label>
            </div>

            <div className="rounded-[24px] border border-[#0D3B34]/9 bg-[#F7F8F5] p-5">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={
                    data.termsAccepted
                  }
                  onChange={(e) =>
                    update(
                      "termsAccepted",
                      e.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4 accent-[#0D3B34]"
                />

                <span className="text-sm leading-7 text-[#0D3B34]/75">
                  أوافق على شروط
                  استخدام Arees Loop
                  وسياسة الخصوصية،
                  وأفهم أن إرسال الطلب
                  لا يعني اعتماد الشريك
                  أو السماح بنشر الخدمات
                  قبل استكمال المراجعة
                  والتعاقد والتفعيل.
                </span>
              </label>
            </div>

            <div className="rounded-[24px] border border-[#0D3B34]/8 bg-[#EEF3F0] p-5">
              <p className="font-bold">
                ماذا يحدث بعد الإرسال؟
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <MiniStatus
                  number="01"
                  label="تحت مراجعة أريس"
                />

                <MiniStatus
                  number="02"
                  label="مؤهل للتعاقد"
                />

                <MiniStatus
                  number="03"
                  label="العقد الإلكتروني"
                />

                <MiniStatus
                  number="04"
                  label="تفعيل الشريك"
                />
              </div>

              <p className="mt-4 text-xs leading-6 text-[#0D3B34]/55">
                إذا احتاج الطلب إلى
                تعديل، ستظهر الحالة
                «مطلوب استكمال» مع
                الملاحظات المطلوبة.
                بعد اجتياز المراجعة
                ينتقل الشريك إلى العقد
                الإلكتروني، ولا تفتح
                صلاحيات إضافة ونشر
                الخدمات قبل التفعيل.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <SecondaryButton
                label="العودة"
                onClick={goBack}
              />

              <div className="flex flex-col gap-3 sm:flex-row">
                <SecondaryButton
                  label={
                    draftSaved
                      ? "تم حفظ المسودة ✓"
                      : "حفظ ومتابعة لاحقاً"
                  }
                  onClick={
                    saveDraft
                  }
                />

                <button
                  type="button"
                  disabled={
                    !canSubmit
                  }
                  onClick={
                    submitApplication
                  }
                  className="rounded-2xl bg-[#D4AF37] px-7 py-4 text-sm font-bold text-[#0D3B34] transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  إرسال طلب الاعتماد
                </button>
              </div>
            </div>
          </StepCard>
        )}
                {currentStep === "done" && (
          <div className="mx-auto max-w-[760px] rounded-[34px] border border-white/80 bg-white/75 p-8 text-center shadow-[0_20px_70px_rgba(13,59,52,0.05)] backdrop-blur-xl md:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F4EE] text-3xl font-bold text-[#267247]">
              ✓
            </div>

            <p className="mt-7 text-[10px] font-bold tracking-[0.22em] text-[#B99124]">
              AI REVIEW COMPLETED
            </p>

            <h1
              className="mt-3 text-3xl font-bold md:text-[40px]"
              style={{
                fontFamily:
                  "var(--font-el-messiri), serif",
              }}
            >
              {aiReviewResult?.outcome === "NEEDS_COMPLETION"
                ? "تمت المراجعة ويحتاج الطلب استكمال"
                : aiReviewResult?.outcome === "MANUAL_REVIEW"
                  ? "تم تحويل الطلب للمراجعة الإدارية"
                  : aiReviewResult?.outcome === "READY"
                    ? "اكتملت المراجعة الآلية"
                    : "تم استلام طلب الاعتماد"}
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-8 text-[#0D3B34]/60">
              {aiReviewResult?.partnerMessage ||
                "تم حفظ الطلب والمستندات وإرسالها للمراجعة."}
              {" "}لا يعتبر حساب الشريك مفعلاً حتى اكتمال الاعتماد النهائي من Arees Loop.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              <MiniStatus
                number="01"
                label="تم الاستلام"
                active
              />

              <MiniStatus
                number="02"
                label="مراجعة AI"
                active={Boolean(aiReviewResult)}
              />

              <MiniStatus
                number="03"
                label="مراجعة أريس"
              />

              <MiniStatus
                number="04"
                label="العقد والتفعيل"
              />
            </div>

            <div className="mt-7 rounded-[22px] border border-[#D4AF37]/20 bg-[#FFF9E8] p-5 text-right">
              <p className="font-bold">
                مسار اعتماد الشريك
              </p>

              <p className="mt-2 text-xs leading-7 text-[#0D3B34]/60">
                تم الاستلام ← مراجعة الذكاء الاصطناعي
                ← استكمال عند وجود ملاحظات
                ← مراجعة أريس ← الاتفاقية الإلكترونية
                ← قبول الشريك ← اعتماد أريس والتفعيل.
              </p>
            </div>

            <div className="mt-5 rounded-[22px] bg-[#F6F3EC] p-5">
              <p className="text-xs text-[#0D3B34]/45">
                رقم الطلب
              </p>

              <p
                className="mt-2 font-bold tracking-[0.12em]"
                dir="ltr"
              >
                {applicationId || "—"}
              </p>
            </div>

            <div className="mt-5 rounded-[22px] border border-[#0D3B34]/8 bg-[#EEF3F0] p-5 text-right">
              <p className="text-sm font-bold">
                قبل تفعيل الحساب
              </p>

              <p className="mt-2 text-xs leading-7 text-[#0D3B34]/60">
                لا يمكن للشريك إضافة
                خدمات للسوق أو نشرها قبل
                اكتمال المراجعة والعقد
                الإلكتروني واعتماد أريس
                وتفعيل حساب الشريك.
              </p>
            </div>

            <Link
              href="/partner/status"
              className="mt-7 inline-flex rounded-2xl bg-[#0D3B34] px-6 py-3.5 text-sm font-bold text-white"
            >
              متابعة حالة الطلب
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function partnerTypeLabel(
  value: PartnerType
) {
  if (value === "individual") {
    return "فرد";
  }

  if (value === "business") {
    return "مؤسسة أو شركة";
  }

  if (value === "government") {
    return "جهة حكومية أو غير ربحية";
  }

  return "—";
}

const inputClass =
  "h-14 w-full rounded-2xl border border-[#0D3B34]/10 bg-[#F9F8F4] px-4 text-sm text-[#0D3B34] outline-none transition placeholder:text-[#0D3B34]/30 focus:border-[#D4AF37]/65 focus:bg-white";

const errorInputClass =
  "border-[#C83B3B] bg-[#FFF8F8] focus:border-[#C83B3B]";

function ValidationError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-2 text-xs font-semibold text-[#B42318]">
      {message}
    </p>
  );
}

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
    <section className="rounded-[34px] border border-white/80 bg-white/75 p-6 shadow-[0_20px_70px_rgba(13,59,52,0.05)] backdrop-blur-xl md:p-9">
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[0.2em] text-[#B99124]">
          {eyebrow}
        </p>

        <h1
          className="mt-2 text-3xl font-bold md:text-[38px]"
          style={{
            fontFamily:
              "var(--font-el-messiri), serif",
          }}
        >
          {title}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#0D3B34]/58">
          {description}
        </p>
      </div>

      <div className="space-y-5">
        {children}
      </div>
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

function SelectCard({
  title,
  description,
  active,
  onClick,
}: {
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[94px] w-full items-start justify-between gap-4 rounded-[22px] border p-5 text-right transition ${
        active
          ? "border-[#D4AF37] bg-[#0D3B34] text-white shadow-[0_10px_30px_rgba(13,59,52,0.10)]"
          : "border-[#0D3B34]/10 bg-[#FAF9F5] hover:border-[#D4AF37]/50"
      }`}
    >
      <div>
        <p className="font-bold">
          {title}
        </p>

        <p
          className={`mt-1 text-xs leading-6 ${
            active
              ? "text-white/55"
              : "text-[#0D3B34]/48"
          }`}
        >
          {description}
        </p>
      </div>

      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          active
            ? "bg-[#D4AF37] text-[#0D3B34]"
            : "bg-[#0D3B34]/6 text-transparent"
        }`}
      >
        ✓
      </span>
    </button>
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

function AiHint({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#0D3B34]/8 bg-[#EEF3F0] p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0D3B34] text-xs font-bold text-[#E5BE45]">
          AI
        </span>

        <div>
          <p className="text-sm font-bold">
            {title}
          </p>

          <p className="mt-1 text-xs leading-6 text-[#0D3B34]/55">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function Requirement({
  title,
  text,
  important = false,
}: {
  title: string;
  text: string;
  important?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border p-4 ${
        important
          ? "border-[#D4AF37]/35 bg-[#FFF8E4]"
          : "border-[#0D3B34]/8 bg-[#FAF9F5]"
      }`}
    >
      <p className="text-sm font-bold">
        {important
          ? "مطلوب — "
          : ""}
        {title}
      </p>

      <p className="mt-1 text-xs leading-6 text-[#0D3B34]/55">
        {text}
      </p>
    </div>
  );
}

function Actions({
  onBack,
  onNext,
  onSave,
  first = false,
  saved = false,
}: {
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
  first?: boolean;
  saved?: boolean;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-[#0D3B34]/7 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {!first && (
          <SecondaryButton
            label="العودة"
            onClick={onBack}
          />
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SecondaryButton
          label={
            saved
              ? "تم حفظ المسودة ✓"
              : "حفظ ومتابعة لاحقاً"
          }
          onClick={onSave}
        />

        <button
          type="button"
          onClick={onNext}
          className="rounded-2xl bg-[#0D3B34] px-7 py-3.5 text-sm font-bold text-white transition hover:opacity-95"
        >
          متابعة
        </button>
      </div>
    </div>
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
      className="rounded-2xl border border-[#0D3B34]/10 bg-white px-6 py-3.5 text-sm font-bold text-[#0D3B34]/70 transition hover:border-[#D4AF37]/50"
    >
      {label}
    </button>
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
          <span className="font-bold">
            {title}
          </span>

          <span className="text-[#B99124]">
            ⌄
          </span>
        </div>
      </summary>

      <div className="grid gap-3 border-t border-[#0D3B34]/7 px-5 py-4 md:grid-cols-2">
        {items.map(
          ([label, value]) => (
            <div key={label}>
              <p className="text-[10px] text-[#0D3B34]/42">
                {label}
              </p>

              <p className="mt-1 break-words text-sm font-semibold text-[#0D3B34]/75">
                {value || "—"}
              </p>
            </div>
          )
        )}
      </div>
    </details>
  );
}

function MiniStatus({
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
      className={`rounded-[18px] border p-3 ${
        active
          ? "border-[#D4AF37]/40 bg-[#FFF8E4]"
          : "border-[#0D3B34]/7 bg-white/65"
      }`}
    >
      <p
        className={`text-[9px] font-bold ${
          active
            ? "text-[#B99124]"
            : "text-[#0D3B34]/35"
        }`}
      >
        {number}
      </p>

      <p className="mt-1 text-[11px] font-bold">
        {label}
      </p>
    </div>
  );
}









