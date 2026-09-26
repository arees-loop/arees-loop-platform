"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getTotalLoopPoints } from "@/lib/loop-progress";
import AccountMenu from "@/app/components/AccountMenu";

type ToggleRowProps = {
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
};


type VisitorType = "CITIZEN" | "RESIDENT" | "VISITOR";
type InterestCode =
  | "HERITAGE"
  | "ADVENTURE"
  | "FOOD"
  | "EVENTS"
  | "SHOPPING"
  | "GUIDES"
  | "STAYS"
  | "NATURE"
  | "FAMILY"
  | "SPORTS"
  | "TECHNOLOGY"
  | "SEASONAL";

type ProfileData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  userType: VisitorType | "";
};

type AuthUser = {
  id: string;
  email: string;
  username: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  status: string;
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  visitorType: VisitorType | null;
  interests: InterestCode[];
};

const EMPTY_PROFILE: ProfileData = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  userType: "",
};

const INTEREST_LABELS: Record<InterestCode, string> = {
  HERITAGE: "التاريخ والتراث",
  ADVENTURE: "التجارب والمغامرات",
  FOOD: "الطعام والمقاهي",
  EVENTS: "الفعاليات والترفيه",
  SHOPPING: "التسوق والأسواق",
  GUIDES: "الجولات والمرشدون",
  STAYS: "الفنادق والإقامة",
  NATURE: "الطبيعة والاستجمام",
  FAMILY: "العائلة والأطفال",
  SPORTS: "الرياضة واللياقة",
  TECHNOLOGY: "التقنية والابتكار",
  SEASONAL: "التجارب الموسمية",
};

const ALL_INTERESTS = Object.entries(INTEREST_LABELS) as [InterestCode, string][];

function visitorTypeLabel(value: VisitorType | "") {
  if (value === "CITIZEN") return "مواطن";
  if (value === "RESIDENT") return "مقيم";
  if (value === "VISITOR") return "زائر";
  return "غير محدد";
}

export default function ProfilePage() {
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [smartRecommendations, setSmartRecommendations] = useState(true);
  const [loopPoints, setLoopPoints] = useState(0);
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [draftProfile, setDraftProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [interests, setInterests] = useState<InterestCode[]>([]);
  const [draftInterests, setDraftInterests] = useState<InterestCode[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [activePanel, setActivePanel] = useState<
    | null
    | "profile"
    | "interests"
    | "location"
    | "notifications"
    | "personal-data"
    | "privacy"
  >(null);

  const fullName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "مستخدم Arees Loop";
  const firstName = profile.firstName || "زائر";
  const avatarInitial = firstName.trim().charAt(0) || "ز";

  useEffect(() => {
    setLoopPoints(getTotalLoopPoints());

    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "include",
        });
        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.success || !data?.data?.user) return;

        const user = data.data.user as AuthUser;
        const nextProfile: ProfileData = {
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          phone: user.phone ?? "",
          email: user.email ?? "",
          userType: user.visitorType ?? "",
        };

        if (!cancelled) {
          setProfile(nextProfile);
          setDraftProfile(nextProfile);
          setInterests(user.interests ?? []);
          setDraftInterests(user.interests ?? []);
        }
      } catch (error) {
        console.error("Unable to load profile:", error);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  function openProfileEditor() {
    setDraftProfile(profile);
    setSaveError("");
    setActivePanel("profile");
  }

  async function saveProfile() {
    if (saveLoading) return;
    setSaveLoading(true);
    setSaveError("");

    try {
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: draftProfile.firstName,
          lastName: draftProfile.lastName,
          phone: draftProfile.phone,
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        if (data?.error === "PHONE_ALREADY_IN_USE") {
          setSaveError("رقم الجوال مستخدم في حساب آخر.");
        } else if (data?.error === "INVALID_PHONE") {
          setSaveError("اكتب رقم الجوال بالصيغة الدولية، مثال: +9665XXXXXXXX، أو اتركه فارغًا.");
        } else {
          setSaveError("تعذر حفظ البيانات. تأكد منها وحاول مرة أخرى.");
        }
        return;
      }

      const user = data.data.user as AuthUser;
      const nextProfile: ProfileData = {
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phone: user.phone ?? profile.phone,
        email: user.email ?? profile.email,
        userType: user.visitorType ?? profile.userType,
      };
      setProfile(nextProfile);
      setDraftProfile(nextProfile);
      setActivePanel(null);
    } catch (error) {
      console.error("Unable to update profile:", error);
      setSaveError("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setSaveLoading(false);
    }
  }

  function openInterestsEditor() {
    setDraftInterests(interests);
    setSaveError("");
    setActivePanel("interests");
  }

  function toggleInterest(value: InterestCode) {
    setDraftInterests((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  async function saveInterests() {
    if (saveLoading || draftInterests.length === 0) return;
    setSaveLoading(true);
    setSaveError("");

    try {
      const response = await fetch("/api/onboarding/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ interests: draftInterests }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setSaveError("تعذر حفظ الاهتمامات. حاول مرة أخرى.");
        return;
      }

      setInterests(draftInterests);
      setActivePanel(null);
    } catch (error) {
      console.error("Unable to update interests:", error);
      setSaveError("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setSaveLoading(false);
    }
  }

  function requestLocationPermission() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      () => setLocationEnabled(true),
      () => setLocationEnabled(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#F7F5EF] text-[#0D3B34]"
      style={{ fontFamily: "var(--font-ibm-plex-arabic), sans-serif" }}
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_10%,rgba(212,175,55,0.10),transparent_25%),radial-gradient(circle_at_8%_82%,rgba(13,59,52,0.08),transparent_30%),linear-gradient(135deg,#FAF8F2_0%,#F4F1E8_52%,#F8F6F0_100%)]" />

        <div className="absolute -right-44 top-24 h-[500px] w-[500px] rounded-full bg-[#0D3B34]/[0.045] blur-[120px]" />

        <div className="absolute -left-40 bottom-0 h-[450px] w-[450px] rounded-full bg-[#D4AF37]/[0.055] blur-[130px]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#0D3B34]/[0.06] bg-[#F7F5EF]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between gap-5 px-5 py-3.5 md:px-8">
          <Link href="/">
            <Image
              src="/Logo/arees-loop-logo.png"
              alt="Arees Loop"
              width={170}
              height={85}
              priority
              className="h-auto w-[120px] md:w-[140px]"
            />
          </Link>

          <div className="hidden flex-1 justify-center lg:flex">
            <div className="flex items-center gap-1 rounded-full border border-[#0D3B34]/[0.09] bg-white/60 p-1 backdrop-blur-xl">
              <NavLink href="/discover">اكتشف</NavLink>

              <NavLink href="/bookings">حجوزاتي</NavLink>

              <NavLink href="/rewards">المكافآت</NavLink>

              <NavLink href="/favorites">المفضلة</NavLink>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="hidden items-center gap-2 rounded-full border border-[#0D3B34]/[0.09] bg-white/60 px-3.5 py-2 text-[11px] font-semibold text-[#0D3B34]/70 md:flex"
            >
              <BellIcon />
              <span className="hidden xl:inline">الإشعارات</span>
            </Link>

            <AccountMenu
              firstName={profile.firstName}
              lastName={profile.lastName}
              email={profile.email}
              phone={profile.phone}
            />
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1450px] px-5 pb-24 pt-8 md:px-8">
        {/* PAGE HEADER */}
        <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[9px] font-bold tracking-[0.2em] text-[#B99124]">
              MY PROFILE
            </p>

            <h1
              className="mt-2 text-[30px] font-semibold text-[#0D3B34] md:text-[38px]"
              style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
            >
              حسابي
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-6 text-[#0D3B34]/65">
              إدارة بياناتك الشخصية وتفضيلاتك وخصوصيتك وإعدادات تجربة Arees Loop.
            </p>
          </div>

          <Link
            href="/discover"
            className="inline-flex items-center justify-center gap-2 rounded-[15px] bg-[#0D3B34] px-5 py-3 text-[11px] font-semibold text-white transition hover:bg-[#154C42]"
          >
            <CompassIcon />
            العودة للاكتشاف
          </Link>
        </section>

        {/* PROFILE HERO */}
        <section className="mt-7 grid gap-5 xl:grid-cols-[1fr_0.55fr]">
          <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#0A332C] via-[#0D3B34] to-[#154C42] p-7 text-white md:p-8">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full border border-white/[0.05]" />

            <div className="absolute left-10 top-10 h-44 w-44 rounded-full border border-[#D4AF37]/10" />

            <div className="absolute -bottom-20 right-[28%] h-64 w-64 rounded-full bg-[#D4AF37]/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.07] text-3xl font-bold text-[#D4AF37]">
                {avatarInitial}
              </div>

              <div>
                <p className="text-[9px] font-semibold tracking-[0.18em] text-[#D4AF37]">
                  AREES LOOP MEMBER
                </p>

                <h2
                  className="mt-2 text-3xl font-semibold"
                  style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
                >
                  {profileLoading ? "جاري تحميل الحساب..." : fullName}
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[9px] font-semibold text-white/75">
                    {visitorTypeLabel(profile.userType)}
                  </span>

                  <span className="rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-1.5 text-[9px] font-semibold text-[#E3C357]">
                    Explorer
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[9px] font-semibold text-white/75">
                    الحساب موثّق
                  </span>
                </div>

                <p className="mt-4 text-[10px] leading-5 text-white/60">
                  عضو منذ سبتمبر 2026 • آخر تحديث للملف اليوم
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/80 bg-white/65 p-6 backdrop-blur-xl">
            <p className="text-[9px] font-semibold tracking-[0.16em] text-[#B99124]">
              ACCOUNT SUMMARY
            </p>

            <h2
              className="mt-2 text-xl font-semibold"
              style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
            >
              ملخص حسابك
            </h2>

            <div className="mt-6 grid gap-3">
              <MiniSummary
                label="الحجوزات"
                value="3"
                href="/bookings"
              />

              <MiniSummary
                label="نقاط Loop"
                value={loopPoints.toLocaleString("en-US")}
                href="/rewards"
              />

              <MiniSummary
                label="المفضلة"
                value="3"
                href="/favorites"
              />
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.78fr]">
          <div className="space-y-6">
            {/* PERSONAL INFO */}
            <Card>
              <CardHeader
                eyebrow="PERSONAL INFORMATION"
                title="البيانات الأساسية"
                icon={<UserIcon />}
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <InfoField
                  label="الاسم"
                  value={fullName}
                />

                <InfoField
                  label="رقم الجوال"
                  value={profile.phone || "غير مضاف"}
                  ltr
                />

                <InfoField
                  label="البريد الإلكتروني"
                  value={profile.email || "غير مضاف"}
                  ltr
                />

                <InfoField
                  label="صفة المستخدم"
                  value={visitorTypeLabel(profile.userType)}
                />
              </div>

              <button
                type="button"
                onClick={openProfileEditor}
                className="mt-6 rounded-[13px] border border-[#0D3B34]/10 bg-white/70 px-5 py-2.5 text-[9px] font-semibold text-[#0D3B34]/70 transition hover:border-[#0D3B34]/20 hover:text-[#0D3B34]"
              >
                تعديل البيانات
              </button>
            </Card>

            {/* IDENTITY */}
            <Card>
              <CardHeader
                eyebrow="IDENTITY"
                title="الهوية والتحقق"
                icon={<ShieldIcon />}
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <InfoField
                  label="نوع الهوية"
                  value={profile.userType === "CITIZEN" ? "هوية وطنية" : profile.userType === "RESIDENT" ? "هوية مقيم" : "زائر"}
                />

                <InfoField
                  label="البريد موثّق"
                  value={profile.email ? "نعم" : "غير متاح"}
                  success={Boolean(profile.email)}
                />

                <InfoField
                  label="حالة التحقق"
                  value="موثّق"
                  success
                />

                <InfoField
                  label="نوع الحساب"
                  value={visitorTypeLabel(profile.userType)}
                />
              </div>

              <div className="mt-5 rounded-[16px] border border-[#D4AF37]/20 bg-[#D4AF37]/8 px-4 py-3">
                <div className="flex items-start gap-2">
                  <ShieldIcon />

                  <p className="text-[10px] leading-5 text-[#0D3B34]/65">
                    بيانات الحساب المعروضة هنا مرتبطة بالحساب الحالي. التحقق الحكومي
                    من الهوية سيضاف عند توافر الاعتماد والصلاحيات المطلوبة.
                  </p>
                </div>
              </div>
            </Card>

            {/* INTERESTS */}
            <Card>
              <CardHeader
                eyebrow="INTERESTS"
                title="اهتماماتي"
                icon={<InterestIcon />}
              />

              <p className="mt-2 text-[10px] leading-5 text-[#0D3B34]/60">
                نستخدم هذه التفضيلات لترتيب التجارب والاقتراحات المناسبة لك.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <InterestChip key={interest}>{INTEREST_LABELS[interest]}</InterestChip>
                ))}
              </div>

              <button
                type="button"
                onClick={openInterestsEditor}
                className="mt-6 rounded-[13px] border border-[#0D3B34]/10 bg-white/70 px-5 py-2.5 text-[9px] font-semibold text-[#0D3B34]/70 transition hover:border-[#0D3B34]/20 hover:text-[#0D3B34]"
              >
                تعديل الاهتمامات
              </button>
            </Card>
          </div>

          <div className="space-y-6">
            {/* PREFERENCES */}
            <Card>
              <CardHeader
                eyebrow="EXPERIENCE SETTINGS"
                title="تجربة Arees Loop"
                icon={<SettingsIcon />}
              />

              <div className="mt-5 divide-y divide-[#0D3B34]/[0.07]">
                <ToggleRow
                  title="الموقع"
                  description="استخدام موقعك لعرض التجارب والخدمات القريبة."
                  enabled={locationEnabled}
                  onChange={() =>
                    setLocationEnabled((value) => !value)
                  }
                />

                <ToggleRow
                  title="الإشعارات"
                  description="تنبيهات الحجوزات والمكافآت والتحديثات المهمة."
                  enabled={notificationsEnabled}
                  onChange={() =>
                    setNotificationsEnabled((value) => !value)
                  }
                />

                <ToggleRow
                  title="التوصيات الذكية"
                  description="ترتيب التجارب حسب الاهتمامات والسياق الحالي."
                  enabled={smartRecommendations}
                  onChange={() =>
                    setSmartRecommendations((value) => !value)
                  }
                />
              </div>
            </Card>

            {/* PRIVACY */}
            <Card>
              <CardHeader
                eyebrow="PRIVACY & DATA"
                title="الخصوصية والبيانات"
                icon={<LockIcon />}
              />

              <div className="mt-5 space-y-3">
                <ActionRow
                  title="إدارة أذونات الموقع"
                  description="راجع أو أوقف صلاحية الموقع."
                  icon={<LocationIcon />}
                  onClick={() => setActivePanel("location")}
                />

                <ActionRow
                  title="إعدادات الإشعارات"
                  description="اختر أنواع التنبيهات التي تريد استلامها."
                  icon={<BellIconLarge />}
                  onClick={() => setActivePanel("notifications")}
                />

                <ActionRow
                  title="بياناتي الشخصية"
                  description="مراجعة البيانات المرتبطة بالحساب."
                  icon={<DatabaseIcon />}
                  onClick={() => setActivePanel("personal-data")}
                />

                <ActionRow
                  title="سياسة الخصوصية"
                  description="كيف نستخدم بياناتك ونحميها."
                  icon={<ShieldIcon />}
                  onClick={() => setActivePanel("privacy")}
                />
              </div>
            </Card>

          </div>
        </section>
      </div>

      {activePanel && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#082D27]/45 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActivePanel(null);
          }}
        >
          <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-[26px] border border-white/80 bg-[#F9F7F1] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold tracking-[0.16em] text-[#B99124]">
                  ACCOUNT SETTINGS
                </p>
                <h3
                  className="mt-1.5 text-xl font-semibold text-[#0D3B34]"
                  style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
                >
                  {activePanel === "profile" && "تعديل البيانات"}
                  {activePanel === "interests" && "تعديل الاهتمامات"}
                  {activePanel === "location" && "إدارة أذونات الموقع"}
                  {activePanel === "notifications" && "إعدادات الإشعارات"}
                  {activePanel === "personal-data" && "بياناتي الشخصية"}
                  {activePanel === "privacy" && "سياسة الخصوصية"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActivePanel(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#0D3B34]/10 bg-white text-lg text-[#0D3B34]/70"
                aria-label="إغلاق"
              >
                ×
              </button>
            </div>

            {activePanel === "profile" && (
              <div className="mt-6 space-y-4">
                <ProfileInput
                  label="الاسم الأول"
                  value={draftProfile.firstName}
                  onChange={(value) =>
                    setDraftProfile((current) => ({ ...current, firstName: value }))
                  }
                />
                <ProfileInput
                  label="اسم العائلة"
                  value={draftProfile.lastName}
                  onChange={(value) =>
                    setDraftProfile((current) => ({ ...current, lastName: value }))
                  }
                />
                <div>
                  <label className="mb-2 block text-[9px] font-semibold text-[#0D3B34]/55">
                    رقم الجوال <span className="font-normal text-[#0D3B34]/35">(اختياري)</span>
                  </label>
                  <input
                    dir="ltr"
                    type="tel"
                    inputMode="tel"
                    value={draftProfile.phone}
                    onChange={(event) =>
                      setDraftProfile((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="+9665XXXXXXXX"
                    className="w-full rounded-[14px] border border-[#0D3B34]/10 bg-white/75 px-4 py-3 text-left text-[11px] text-[#0D3B34] outline-none transition focus:border-[#D4AF37]/60"
                  />
                </div>

                <InfoField
                  label="البريد الإلكتروني"
                  value={profile.email || "غير مضاف"}
                  ltr
                />

                {saveError && <DemoNotice text={saveError} />}
                <PrimaryButton onClick={saveProfile} disabled={saveLoading}>
                  {saveLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
                </PrimaryButton>
              </div>
            )}

            {activePanel === "interests" && (
              <div className="mt-6">
                <p className="text-[10px] leading-5 text-[#0D3B34]/60">
                  اختر الاهتمامات التي تريد استخدامها لترتيب التجارب المقترحة لك.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {ALL_INTERESTS.map(([code, label]) => {
                    const selected = draftInterests.includes(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleInterest(code)}
                        className={`rounded-full border px-4 py-2 text-[9px] font-semibold transition ${
                          selected
                            ? "border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#76580F]"
                            : "border-[#0D3B34]/10 bg-white text-[#0D3B34]/60"
                        }`}
                      >
                        {selected ? "✓ " : ""}
                        {label}
                      </button>
                    );
                  })}
                </div>
                {saveError && <div className="mt-4"><DemoNotice text={saveError} /></div>}
                <div className="mt-5">
                  <PrimaryButton
                    onClick={saveInterests}
                    disabled={draftInterests.length === 0 || saveLoading}
                  >
                    {saveLoading ? "جاري الحفظ..." : "حفظ الاهتمامات"}
                  </PrimaryButton>
                </div>
              </div>
            )}

            {activePanel === "location" && (
              <div className="mt-6 space-y-4">
                <DemoNotice text="صلاحية الموقع النهائية يديرها المتصفح. يمكن لـ AREES Loop طلب الصلاحية، لكن لا يمكنه تغيير إعداد المتصفح بالقوة." />
                <div className="rounded-[16px] border border-[#0D3B34]/8 bg-white/65 p-4">
                  <p className="text-[10px] font-semibold text-[#0D3B34]">
                    الحالة داخل التطبيق
                  </p>
                  <p className="mt-1 text-[9px] text-[#0D3B34]/55">
                    {locationEnabled ? "الموقع مفعّل" : "الموقع غير مفعّل"}
                  </p>
                </div>
                <PrimaryButton onClick={requestLocationPermission}>
                  طلب صلاحية الموقع
                </PrimaryButton>
              </div>
            )}

            {activePanel === "notifications" && (
              <div className="mt-6 divide-y divide-[#0D3B34]/[0.07]">
                <ToggleRow
                  title="إشعارات الحجوزات"
                  description="تحديثات الحجز والتذكرة وموعد التجربة."
                  enabled={notificationsEnabled}
                  onChange={() => setNotificationsEnabled((value) => !value)}
                />
                <ToggleRow
                  title="التوصيات الذكية"
                  description="اقتراحات قريبة مرتبطة باهتماماتك."
                  enabled={smartRecommendations}
                  onChange={() => setSmartRecommendations((value) => !value)}
                />
                <Link
                  href="/notifications"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-[13px] border border-[#0D3B34]/10 bg-white px-4 py-3 text-[10px] font-semibold text-[#0D3B34]"
                >
                  فتح مركز الإشعارات
                </Link>
              </div>
            )}

            {activePanel === "personal-data" && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoField label="الاسم" value={fullName} />
                <InfoField label="رقم الجوال" value={profile.phone || "غير مضاف"} ltr />
                <InfoField label="البريد الإلكتروني" value={profile.email || "غير مضاف"} ltr />
                <InfoField label="صفة المستخدم" value={visitorTypeLabel(profile.userType)} />
              </div>
            )}

            {activePanel === "privacy" && (
              <div className="mt-6 space-y-3 text-[10px] leading-6 text-[#0D3B34]/70">
                <p>
                  هذه واجهة تجريبية لسياسة الخصوصية وليست النسخة القانونية النهائية.
                </p>
                <p>
                  تعتمد AREES Loop على بيانات الحساب والموقع والتفضيلات لتقديم
                  التجارب القريبة، تنفيذ التحقق الميداني، وإدارة النقاط والمكافآت
                  عند تفعيل هذه الخدمات.
                </p>
                <p>
                  قبل الإطلاق الإنتاجي ستتم إضافة السياسة القانونية المعتمدة
                  وبيانات التحكم والمشاركة والاحتفاظ بالبيانات.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MOBILE NAV */}
      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-md -translate-x-1/2 items-center justify-around rounded-[20px] border border-white/80 bg-white/90 px-2 py-2 shadow-[0_12px_40px_rgba(13,59,52,0.12)] backdrop-blur-2xl lg:hidden">
        <MobileNavItem
          href="/discover"
          icon={<CompassIcon />}
          label="اكتشف"
        />

        <MobileNavItem
          href="/bookings"
          icon={<TicketIcon />}
          label="حجوزاتي"
        />

        <MobileNavItem
          href="/rewards"
          icon={<RewardIcon />}
          label="المكافآت"
        />

        <MobileNavItem
          href="/profile"
          icon={<UserIcon />}
          label="حسابي"
          active
        />
      </nav>
    </main>
  );
}

/* ================= COMPONENTS ================= */

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-full px-5 py-2 text-[10px] font-semibold text-[#0D3B34]/65 transition hover:bg-[#0D3B34]/6 hover:text-[#0D3B34]"
    >
      {children}
    </Link>
  );
}

function Card({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[26px] border border-white/80 bg-white/65 p-6 backdrop-blur-xl">
      {children}
    </div>
  );
}

function CardHeader({
  eyebrow,
  title,
  icon,
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[9px] font-bold tracking-[0.17em] text-[#B99124]">
          {eyebrow}
        </p>

        <h2
          className="mt-1.5 text-xl font-semibold text-[#0D3B34]"
          style={{ fontFamily: "var(--font-el-messiri), sans-serif" }}
        >
          {title}
        </h2>
      </div>

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D3B34] text-[#D4AF37]">
        {icon}
      </div>
    </div>
  );
}

function MiniSummary({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-[16px] border border-[#0D3B34]/8 bg-white/55 px-4 py-3 transition hover:border-[#0D3B34]/18"
    >
      <span className="text-[10px] font-medium text-[#0D3B34]/65">
        {label}
      </span>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[#0D3B34]">
          {value}
        </span>

        <ArrowIcon />
      </div>
    </Link>
  );
}

function InfoField({
  label,
  value,
  ltr = false,
  success = false,
}: {
  label: string;
  value: string;
  ltr?: boolean;
  success?: boolean;
}) {
  return (
    <div className="rounded-[16px] border border-[#0D3B34]/8 bg-white/55 px-4 py-3.5">
      <p className="text-[9px] font-medium text-[#0D3B34]/55">
        {label}
      </p>

      <p
        dir={ltr ? "ltr" : undefined}
        className={`mt-1.5 text-[11px] font-semibold ${
          success ? "text-[#2C6B56]" : "text-[#0D3B34]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function InterestChip({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/8 px-4 py-2 text-[9px] font-semibold text-[#76580F]">
      {children}
    </span>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="text-[10px] font-semibold text-[#0D3B34]">
          {title}
        </p>

        <p className="mt-1 max-w-sm text-[9px] leading-5 text-[#0D3B34]/58">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        aria-label={title}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled
            ? "bg-[#0D3B34]"
            : "bg-[#0D3B34]/15"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            enabled
              ? "right-1"
              : "right-6"
          }`}
        />
      </button>
    </div>
  );
}

function ActionRow({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[16px] border border-[#0D3B34]/8 bg-white/55 px-4 py-3.5 text-right transition hover:border-[#0D3B34]/18"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0D3B34]/7 text-[#0D3B34]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-[#0D3B34]">
          {title}
        </p>

        <p className="mt-1 text-[9px] text-[#0D3B34]/55">
          {description}
        </p>
      </div>

      <ArrowIcon />
    </button>
  );
}

function ProfileInput({
  label,
  value,
  onChange,
  ltr = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  ltr?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[9px] font-semibold text-[#0D3B34]/60">
        {label}
      </span>
      <input
        dir={ltr ? "ltr" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[14px] border border-[#0D3B34]/10 bg-white px-4 py-3 text-[11px] font-semibold text-[#0D3B34] outline-none transition focus:border-[#D4AF37]/60"
      />
    </label>
  );
}

function DemoNotice({ text }: { text: string }) {
  return (
    <div className="rounded-[15px] border border-[#D4AF37]/20 bg-[#D4AF37]/8 px-4 py-3 text-[9px] leading-5 text-[#0D3B34]/65">
      {text}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-[14px] bg-[#0D3B34] px-5 py-3 text-[10px] font-semibold text-white transition hover:bg-[#154C42] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function MobileNavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-w-[60px] flex-col items-center gap-1 rounded-xl px-3 py-1.5 ${
        active
          ? "text-[#0D3B34]"
          : "text-[#0D3B34]/55"
      }`}
    >
      <div className={active ? "text-[#B99124]" : ""}>
        {icon}
      </div>

      <span className="text-[8px] font-semibold">
        {label}
      </span>
    </Link>
  );
}

/* ================= ICONS ================= */

function BellIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function BellIconLarge() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-2 4-4 2 2-4 4-2Z" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v8a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2V8Z" />
      <path d="M12 6v12" strokeDasharray="2 2" />
    </svg>
  );
}

function RewardIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M12 3 15 8l6 .8-4.3 4.2 1 6-5.7-2.8L6.3 19l1-6L3 8.8 9 8l3-5Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.8-4.5 3.4-7 8-7s7.2 2.5 8 7" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M12 3 5 6v5c0 4.7 2.9 8.2 7 10 4.1-1.8 7-5.3 7-10V6l-7-3Z" />
      <path d="m9.5 12 1.7 1.7 3.6-4" />
    </svg>
  );
}

function InterestIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M12 3 15 8l6 .8-4.3 4.2 1 6-5.7-2.8L6.3 19l1-6L3 8.8 9 8l3-5Z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.3 7 7.1 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <ellipse cx="12" cy="5" rx="7" ry="3" />
      <path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
      <path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

