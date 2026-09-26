"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { getTotalLoopPoints } from "@/lib/loop-progress";
import AccountMenu from "@/app/components/AccountMenu";
type Category =
  | "all"
  | "heritage"
  | "experiences"
  | "food"
  | "events"
  | "guides";

type Experience = {
  id: number;
  title: string;
  category: Category;
  categoryLabel: string;
  image: string;
  location: string;
  distance: string;
  lat: number;
  lng: number;
  rating: string;
  price: string;
  badge?: string;
};

type UserLocation = {
  lat: number;
  lng: number;
  accuracy: number;
};

type AuthUser = {
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
};

const supportedDestinations = [
  { nameAr: "المدينة المنورة", lat: 24.4672, lng: 39.6024 },
  { nameAr: "مكة المكرمة", lat: 21.4225, lng: 39.8262 },
  { nameAr: "جدة", lat: 21.5433, lng: 39.1728 },
  { nameAr: "العلا", lat: 26.6085, lng: 37.9232 },
] as const;

const destinationMissions: Record<
  string,
  { title: string; description: string; points: number }
> = {
  "المدينة المنورة": {
    title: "اكتشف 3 معالم قريبة واكسب 150 نقطة",
    description:
      "زر ثلاثة مواقع مختارة في المدينة المنورة، وسجّل زيارتك عند الوصول لتحصل على مكافأتك.",
    points: 150,
  },
};

const categories: {
  id: Category;
  title: string;
  icon: string;
}[] = [
  { id: "all", title: "الكل", icon: "✦" },
  { id: "heritage", title: "تراث", icon: "◇" },
  { id: "experiences", title: "تجارب", icon: "◎" },
  { id: "food", title: "مطاعم", icon: "◌" },
  { id: "events", title: "فعاليات", icon: "◈" },
  { id: "guides", title: "مرشدون", icon: "⌖" },
];

const experiences: Experience[] = [
  {
    id: 1,
    title: "متحف وبستان الصافية",
    category: "heritage",
    categoryLabel: "تراث وثقافة",
    image: "/Image/hero/experiences/alsafiya-museum.jpg",
    location: "المدينة المنورة",
    distance: "1.2 كم",
    lat: 24.46376,
    lng: 39.61099,
    rating: "4.9",
    price: "ابتداءً من 35 ر.س",
    badge: "قريب منك",
  },
  {
    id: 2,
    title: "المتحف الدولي للسيرة النبوية",
    category: "heritage",
    categoryLabel: "متاحف",
    image: "/Image/hero/experiences/seerah-museum.jpg",
    location: "المدينة المنورة",
    distance: "850 م",
    lat: 24.4658155,
    lng: 39.6094075,
    rating: "4.8",
    price: "احجز الآن",
    badge: "موصى به",
  },
  {
    id: 3,
    title: "جولة مسجد الغمامة وما حوله",
    category: "experiences",
    categoryLabel: "جولة ثقافية",
    image: "/Image/hero/experiences/al-ghamamah-mosque.jpg",
    location: "المنطقة المركزية",
    distance: "600 م",
    lat: 24.465808,
    lng: 39.606955,
    rating: "4.9",
    price: "من 45 ر.س",
    badge: "الأقرب",
  },
];

const guides = [
  {
    id: 1,
    name: "أحمد السلمي",
    specialty: "السيرة والتاريخ الإسلامي",
    languages: "العربية • English",
    distance: "1.4 كم",
    rating: "4.9",
    status: "متاح الآن",
  },
  {
    id: 2,
    name: "خالد الحربي",
    specialty: "التراث والثقافة المحلية",
    languages: "العربية",
    distance: "2.1 كم",
    rating: "4.8",
    status: "متاح اليوم",
  },
  {
    id: 3,
    name: "سارة الأنصاري",
    specialty: "جولات عائلية وثقافية",
    languages: "العربية • English",
    distance: "3.2 كم",
    rating: "4.9",
    status: "متاحة اليوم",
  },
];

const events = [
  {
    id: 1,
    day: "اليوم",
    time: "7:30 م",
    title: "جولة مسائية في المنطقة التاريخية",
    location: "المدينة المنورة",
  },
  {
    id: 2,
    day: "غدًا",
    time: "5:00 م",
    title: "تجربة ثقافية للعائلات",
    location: "وسط المدينة",
  },
  {
    id: 3,
    day: "الجمعة",
    time: "8:00 م",
    title: "مسار اكتشاف الموروث المحلي",
    location: "المدينة المنورة",
  },
];

export default function DiscoverPage() {
  return (
    <Suspense fallback={<DiscoverPageFallback />}>
      <DiscoverContent />
    </Suspense>
  );
}

function DiscoverPageFallback() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F7F5EF] px-5 py-10 text-[#0D3B34]"
    >
      <div className="mx-auto max-w-7xl">
        <div className="h-10 w-48 animate-pulse rounded-full bg-[#0D3B34]/10" />
        <div className="mt-6 h-72 animate-pulse rounded-[32px] bg-[#0D3B34]/10" />
      </div>
    </main>
  );
}

function DiscoverContent() {
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] =
    useState<Category>("all");

  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState<number[]>([]);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState("فعّل موقعك لعرض الأقرب إليك");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [loopPoints, setLoopPoints] = useState(0);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setLoopPoints(getTotalLoopPoints());

    const savedDestination = window.localStorage.getItem(
      "arees-loop-next-destination"
    );

    if (
      savedDestination &&
      supportedDestinations.some(
        (destination) => destination.nameAr === savedDestination
      )
    ) {
      setSelectedDestination(savedDestination);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAuthenticatedUser() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        if (!response.ok) return;

        const result = await response.json().catch(() => null);
        const user = result?.data?.user;

        if (cancelled || !result?.success || !user?.email) return;

        setAuthUser({
          firstName:
            typeof user.firstName === "string" ? user.firstName : null,
          lastName:
            typeof user.lastName === "string" ? user.lastName : null,
          email: user.email,
          phone:
            typeof user.phone === "string" ? user.phone : null,
        });
      } catch {
        // Keep the page usable even if session lookup is temporarily unavailable.
      }
    }

    void loadAuthenticatedUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const source = searchParams.get("source");

    if (!latParam || !lngParam || source !== "location") {
      return;
    }

    const lat = Number(latParam);
    const lng = Number(lngParam);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return;
    }

    setUserLocation({
      lat,
      lng,
      accuracy: 0,
    });
    setLocationEnabled(true);
    setLocationLoading(false);
    setLocationStatus("تم استخدام موقعك المحدد في الصفحة الرئيسية");
  }, [searchParams]);

  const rewardLevel =
    loopPoints >= 5000
      ? "Insider"
      : loopPoints >= 2000
        ? "Traveller"
        : "Explorer";

  const nextLevelPoints =
    loopPoints >= 5000
      ? 5000
      : loopPoints >= 2000
        ? 5000
        : 2000;

  const rewardProgress =
    loopPoints >= 5000
      ? 100
      : Math.min(100, Math.round((loopPoints / nextLevelPoints) * 100));

  const currentDestination = useMemo(() => {
    if (!userLocation) return null;

    return supportedDestinations
      .map((destination) => ({
        ...destination,
        distanceKm: calculateDistanceKm(
          userLocation.lat,
          userLocation.lng,
          destination.lat,
          destination.lng
        ),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)[0];
  }, [userLocation]);

  const destinationIsNearby =
    currentDestination !== null && currentDestination.distanceKm <= 80;

  const activeDestinationName =
    selectedDestination ||
    (destinationIsNearby && currentDestination
      ? currentDestination.nameAr
      : "");

  const hasLocalDemoContent =
    !activeDestinationName || activeDestinationName === "المدينة المنورة";

  const activeMission = activeDestinationName
    ? destinationMissions[activeDestinationName] ?? null
    : null;

  const filteredExperiences = useMemo(() => {
    const normalizedSearch = search.trim();

    const filtered = experiences.filter((experience) => {
      const matchesCategory =
        activeCategory === "all" ||
        activeCategory === "guides" ||
        activeCategory === "events" ||
        experience.category === activeCategory;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        experience.title.includes(normalizedSearch) ||
        experience.categoryLabel.includes(normalizedSearch) ||
        experience.location.includes(normalizedSearch);

      const matchesDestination =
        !activeDestinationName ||
        experience.location.includes(activeDestinationName) ||
        (activeDestinationName === "المدينة المنورة" &&
          experience.location.includes("المنطقة المركزية"));

      return matchesCategory && matchesSearch && matchesDestination;
    });

    if (!userLocation) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const distanceA = calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        a.lat,
        a.lng
      );

      const distanceB = calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        b.lat,
        b.lng
      );

      return distanceA - distanceB;
    });
  }, [activeCategory, search, userLocation, activeDestinationName]);


  function requestLocation() {
    if (locationEnabled) {
      setLocationEnabled(false);
      setUserLocation(null);
      setLocationStatus("تم إيقاف استخدام الموقع");
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    setLocationLoading(true);
    setLocationStatus("جارٍ تحديد موقعك...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });

        setLocationEnabled(true);
        setLocationLoading(false);
        setLocationStatus("تم تحديد موقعك بنجاح");
      },
      (error) => {
        setLocationEnabled(false);
        setUserLocation(null);
        setLocationLoading(false);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus("اسمح للمتصفح بالوصول إلى موقعك ثم حاول مرة أخرى");
          return;
        }

        if (error.code === error.TIMEOUT) {
          setLocationStatus("استغرق تحديد الموقع وقتًا أطول من المتوقع. حاول مرة أخرى");
          return;
        }

        setLocationStatus("تعذر تحديد موقعك الآن");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  function toggleSaved(id: number) {
    setSaved((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  return (
    <main
  
      className="relative min-h-screen overflow-hidden bg-[#F7F5EF] text-[#0D3B34]"
      style={{ fontFamily: "var(--font-ibm-plex-arabic), sans-serif" }}
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_87%_8%,rgba(212,175,55,0.12),transparent_24%),radial-gradient(circle_at_10%_75%,rgba(13,59,52,0.09),transparent_27%),linear-gradient(135deg,#FAF8F2_0%,#F4F1E8_52%,#F8F6F0_100%)]" />

        <div className="absolute -right-48 top-20 h-[520px] w-[520px] rounded-full bg-[#0D3B34]/[0.05] blur-[120px]" />

        <div className="absolute -left-40 top-[28%] h-[470px] w-[470px] rounded-full bg-[#D4AF37]/[0.06] blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(13,59,52,0.9) 0.6px, transparent 0.7px)",
            backgroundSize: "21px 21px",
          }}
        />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#0D3B34]/[0.05] bg-[#F7F5EF]/85 backdrop-blur-2xl">
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

          {/* DESKTOP NAV */}
          <div className="hidden flex-1 justify-center lg:flex">
            <div className="flex items-center gap-1 rounded-full border border-[#0D3B34]/[0.07] bg-white/55 p-1 backdrop-blur-xl">
              <Link
                href="/discover"
                className="rounded-full bg-[#0D3B34] px-5 py-2 text-[10px] font-semibold text-white"
              >
                اكتشف
              </Link>

              <Link
                href="/bookings"
                className="rounded-full px-5 py-2 text-[10px] font-semibold text-[#0D3B34]/50 transition hover:bg-[#0D3B34]/5"
              >
                حجوزاتي
              </Link>

              <Link
                href="/rewards"
                className="rounded-full px-5 py-2 text-[10px] font-semibold text-[#0D3B34]/50 transition hover:bg-[#0D3B34]/5"
              >
                المكافآت
              </Link>

              <Link
                href="/favorites"
                className="rounded-full px-5 py-2 text-[10px] font-semibold text-[#0D3B34]/50 transition hover:bg-[#0D3B34]/5"
              >
                المفضلة
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="hidden items-center gap-2 rounded-full border border-[#0D3B34]/[0.07] bg-white/55 px-3.5 py-2 text-[11px] font-semibold text-[#0D3B34]/65 md:flex"
            >
              <BellIcon />
              <span className="hidden xl:inline">الإشعارات</span>
            </Link>

            <AccountMenu
              firstName={authUser?.firstName}
              lastName={authUser?.lastName}
              email={authUser?.email}
              phone={authUser?.phone}
            />
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1450px] px-5 pb-20 pt-6 md:px-8">
        {/* HERO */}
        <section className="grid gap-5 xl:grid-cols-[1.45fr_0.55fr]">
          <div className="relative overflow-hidden rounded-[30px] border border-white/80 bg-[#0D3B34] p-6 text-white shadow-[0_20px_55px_rgba(13,59,52,0.11)] md:p-8">
            <div className="absolute -left-20 -top-28 h-72 w-72 rounded-full border border-white/[0.06]" />
            <div className="absolute left-16 top-12 h-56 w-56 rounded-full border border-[#D4AF37]/10" />

            <div className="absolute -bottom-24 right-[28%] h-64 w-64 rounded-full bg-[#D4AF37]/8 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={requestLocation}
                  disabled={locationLoading}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-2 text-[10px] text-white/75 backdrop-blur-xl"
                >
                  <LocationSmallIcon />

                  {locationLoading
                    ? "جارٍ تحديد موقعك..."
                    : locationEnabled
                      ? "موقعك الحالي • GPS مفعّل"
                      : "تفعيل الموقع"}
                </button>

                {locationEnabled && (
                  <span className="rounded-full bg-[#D4AF37]/12 px-3 py-2 text-[9px] font-semibold text-[#E3C357]">
                    LIVE LOCATION
                  </span>
                )}
              </div>

              <p className="mb-4 text-[9px] text-white/45">
                {selectedDestination
                  ? `وجهتك القادمة: ${selectedDestination}`
                  : destinationIsNearby && currentDestination
                    ? `موقعك الحالي: ${currentDestination.nameAr}`
                    : locationStatus}
                {userLocation &&
                  userLocation.accuracy > 0 &&
                  ` • دقة تقريبية ${Math.round(userLocation.accuracy)} م`}
              </p>

              <p className="text-[10px] font-semibold tracking-[0.18em] text-[#D4AF37]">
                DISCOVER AROUND YOU
              </p>

              <h1
                className="mt-3 max-w-2xl text-[32px] font-semibold leading-[1.4] md:text-[42px]"
                style={{
                  fontFamily: "var(--font-el-messiri), sans-serif",
                }}
              >
                {activeDestinationName ? (
                  <>
                    اكتشف {activeDestinationName}
                    <br />
                    من حولك.
                  </>
                ) : (
                  <>
                    حولك الآن تجارب
                    <br />
                    تستحق الاكتشاف.
                  </>
                )}
              </h1>

              <p className="mt-4 max-w-2xl text-[15px] font-medium leading-8 text-white/75 md:text-base">
                نرتب لك الوجهات والتجارب والمرشدين حسب موقعك
                واهتماماتك والوقت المناسب لك.
              </p>

              <div className="mt-6 max-w-2xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-bold text-white/80 md:text-[15px]">
                    خطط لوجهتك القادمة:
                  </span>

                  <select
                    value={selectedDestination}
                    onChange={(e) => {
                      const destination = e.target.value;
                      setSelectedDestination(destination);

                      if (destination) {
                        window.localStorage.setItem(
                          "arees-loop-next-destination",
                          destination
                        );
                      } else {
                        window.localStorage.removeItem(
                          "arees-loop-next-destination"
                        );
                      }
                    }}
                    className="min-h-11 rounded-full border border-white/20 bg-white/[0.11] px-5 py-2.5 text-sm font-bold text-white outline-none backdrop-blur-xl"
                  >
                    <option value="">موقعي الحالي</option>
                    {supportedDestinations.map((destination) => (
                      <option
                        key={destination.nameAr}
                        value={destination.nameAr}
                        className="text-[#0D3B34]"
                      >
                        {destination.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedDestination && (
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#E3C357]">
                    تعرض لك الصفحة الآن محتوى {selectedDestination} كوجهتك القادمة.
                  </p>
                )}

                {/* DESTINATION-AWARE MISSION */}
                <div className="mt-5">
                  {activeMission ? (
                    <div className="rounded-[22px] border border-[#D4AF37]/30 bg-white/[0.08] p-5 backdrop-blur-xl md:p-6">
                      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#D4AF37]/15 px-3 py-1.5 text-[10px] font-bold text-[#E3C357]">
                              LOOP MISSION
                            </span>
                            <span className="text-[11px] font-medium text-white/55">
                              مهمة {activeDestinationName}
                            </span>
                          </div>

                          <h2
                            className="mt-3 text-xl font-semibold text-white md:text-2xl"
                            style={{
                              fontFamily: "var(--font-el-messiri), sans-serif",
                            }}
                          >
                            {activeMission.title}
                          </h2>

                          <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
                            {activeMission.description}
                          </p>
                        </div>

                        <Link
                          href={`/missions?destination=${encodeURIComponent(activeDestinationName)}`}
                          className="shrink-0 rounded-[16px] bg-[#D4AF37] px-7 py-3.5 text-center text-sm font-bold text-[#0D3B34] transition hover:bg-[#E0BE50]"
                        >
                          ابدأ المهمة
                        </Link>
                      </div>
                    </div>
                  ) : activeDestinationName ? (
                    <div className="rounded-[22px] border border-[#D4AF37]/20 bg-white/[0.07] p-5 backdrop-blur-xl">
                      <p className="text-[10px] font-bold tracking-[0.14em] text-[#E3C357]">
                        LOOP MISSIONS
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white/80">
                        مهام {activeDestinationName} قريبًا — لا توجد مهمة منشورة لهذه الوجهة حاليًا.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 flex max-w-2xl items-center rounded-[18px] border border-white/10 bg-white/[0.08] p-1.5 backdrop-blur-xl">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center text-white/60">
                  <SearchIcon />
                </div>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن وجهة، تجربة، مطعم أو نشاط..."
                  className="min-w-0 flex-1 bg-transparent px-2 py-2 text-xs text-white outline-none placeholder:text-white/35"
                />

                <button
                  type="button"
                  className="rounded-[14px] bg-[#D4AF37] px-5 py-3 text-[11px] font-bold text-[#0D3B34]"
                >
                  بحث
                </button>
              </div>
            </div>
          </div>

          {/* REWARDS */}
          <div className="relative overflow-hidden rounded-[30px] border border-white/80 bg-white/65 p-6 backdrop-blur-2xl md:p-7">
            <div className="absolute -left-20 -top-20 h-52 w-52 rounded-full bg-[#D4AF37]/10 blur-[70px]" />

            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] font-semibold tracking-[0.16em] text-[#B99124]">
                    LOOP REWARDS
                  </p>

                  <h2
                    className="mt-2 text-xl font-semibold"
                    style={{
                      fontFamily:
                        "var(--font-el-messiri), sans-serif",
                    }}
                  >
                    مكافآتك معك
                  </h2>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D3B34] text-[#D4AF37]">
                  <RewardIcon />
                </div>
              </div>

              <div className="mt-7">
                <p className="text-[10px] text-[#0D3B34]/40">
                  رصيد النقاط
                </p>

                <div className="mt-1 flex items-end gap-2">
                  <span className="text-4xl font-semibold">
                    {loopPoints.toLocaleString("en-US")}
                  </span>

                  <span className="pb-1 text-[10px] text-[#0D3B34]/40">
                    نقطة
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex justify-between text-[9px] text-[#0D3B34]/45">
                  <span>المستوى الحالي</span>
                  <span>{rewardLevel}</span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-[#0D3B34]/7">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-[#D4AF37] to-[#B99124] transition-[width] duration-500"
                    style={{ width: `${rewardProgress}%` }}
                  />
                </div>
              </div>

              <Link
                href="/rewards"
                className="mt-7 block w-full rounded-[15px] border border-[#0D3B34]/8 bg-[#0D3B34]/[0.04] py-3 text-center text-[11px] font-semibold transition hover:bg-[#0D3B34]/[0.07]"
              >
                عرض المكافآت
              </Link>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="mt-7">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const active =
                activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    setActiveCategory(category.id)
                  }
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-[11px] font-semibold transition ${
                    active
                      ? "border-[#0D3B34] bg-[#0D3B34] text-white"
                      : "border-[#0D3B34]/[0.07] bg-white/55 text-[#0D3B34]/60 hover:border-[#0D3B34]/15"
                  }`}
                >
                  <span
                    className={
                      active
                        ? "text-[#D4AF37]"
                        : "text-[#B99124]"
                    }
                  >
                    {category.icon}
                  </span>

                  {category.title}
                </button>
              );
            })}
          </div>
        </section>

        {/* EXPERIENCES */}
        <section className="mt-8">
          <SectionTitle
            eyebrow="NEAR YOU"
            title="تجارب قريبة منك"
            description={
              userLocation
                ? "مرتبة فعليًا من الأقرب إلى الأبعد حسب موقعك الحالي."
                : "فعّل موقعك لترتيب التجارب حسب القرب الفعلي."
            }
          />

          {activeCategory !== "guides" &&
            activeCategory !== "events" && (
              <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredExperiences.map((experience) => (
                  <ExperienceCard
                    key={experience.id}
                    experience={experience}
                    distance={
                      userLocation
                        ? formatDistance(
                            calculateDistanceKm(
                              userLocation.lat,
                              userLocation.lng,
                              experience.lat,
                              experience.lng
                            )
                          )
                        : experience.distance
                    }
                    saved={saved.includes(experience.id)}
                    onSave={() =>
                      toggleSaved(experience.id)
                    }
                  />
                ))}
              </div>
            )}

          {filteredExperiences.length === 0 &&
            activeCategory !== "guides" &&
            activeCategory !== "events" && (
              <div className="mt-5 rounded-[26px] border border-[#0D3B34]/8 bg-white/60 p-7 text-center backdrop-blur-xl md:p-9">
                {selectedDestination ? (
                  <>
                    <p className="text-[10px] font-bold tracking-[0.14em] text-[#B99124]">
                      NEXT DESTINATION
                    </p>

                    <h3
                      className="mt-2 text-xl font-semibold text-[#0D3B34]"
                      style={{
                        fontFamily: "var(--font-el-messiri), sans-serif",
                      }}
                    >
                      نجهّز لك محتوى {selectedDestination}
                    </h3>

                    <p className="mx-auto mt-2 max-w-xl text-[11px] leading-6 text-[#0D3B34]/45">
                      لا توجد تجارب منشورة لهذه الوجهة ضمن بيانات النسخة الحالية بعد.
                      سيبقى اختيارك محفوظًا، وستظهر لك التجارب هنا فور إضافتها.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDestination("");
                        window.localStorage.removeItem(
                          "arees-loop-next-destination"
                        );
                      }}
                      className="mt-5 rounded-full bg-[#0D3B34] px-5 py-2.5 text-[10px] font-semibold text-white transition hover:bg-[#145347]"
                    >
                      العودة إلى موقعي الحالي
                    </button>
                  </>
                ) : (
                  <>
                    <h3
                      className="text-lg font-semibold text-[#0D3B34]"
                      style={{
                        fontFamily: "var(--font-el-messiri), sans-serif",
                      }}
                    >
                      لا توجد نتائج مطابقة الآن
                    </h3>

                    <p className="mt-2 text-[11px] text-[#0D3B34]/45">
                      جرّب تصنيفًا آخر أو غيّر عبارة البحث.
                    </p>
                  </>
                )}
              </div>
            )}
        </section>

        {/* GUIDES */}
        {hasLocalDemoContent &&
          (activeCategory === "all" ||
            activeCategory === "guides") && (
          <section className="mt-12">
            <div className="flex items-end justify-between gap-5">
              <SectionTitle
                eyebrow="LICENSED GUIDES"
                title="مرشدون قريبون منك"
                description="اختر المرشد الأنسب حسب التخصص واللغة والقرب."
              />

              <Link
                href="/guides"
                className="hidden text-[10px] font-semibold text-[#0D3B34]/50 md:block"
              >
                عرض الجميع ←
              </Link>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {guides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                />
              ))}
            </div>
          </section>
        )}

        {/* EVENTS */}
        {hasLocalDemoContent &&
          (activeCategory === "all" ||
            activeCategory === "events") && (
          <section className="mt-12">
            <SectionTitle
              eyebrow="WHAT'S HAPPENING"
              title="يحدث حولك"
              description="أنشطة وفعاليات مناسبة لوقتك الحالي."
            />

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                />
              ))}
            </div>
          </section>
        )}

        {!hasLocalDemoContent &&
          activeDestinationName &&
          (activeCategory === "guides" || activeCategory === "events") && (
            <section className="mt-8">
              <div className="rounded-[26px] border border-[#0D3B34]/8 bg-white/60 p-7 text-center backdrop-blur-xl md:p-9">
                <p className="text-[10px] font-bold tracking-[0.14em] text-[#B99124]">
                  DESTINATION CONTENT
                </p>

                <h3
                  className="mt-2 text-xl font-semibold text-[#0D3B34]"
                  style={{
                    fontFamily: "var(--font-el-messiri), sans-serif",
                  }}
                >
                  نجهّز هذا القسم لـ {activeDestinationName}
                </h3>

                <p className="mx-auto mt-2 max-w-xl text-[11px] leading-6 text-[#0D3B34]/45">
                  لا توجد بيانات منشورة لهذا القسم في وجهتك المختارة ضمن النسخة الحالية بعد.
                  سيظهر المحتوى تلقائيًا فور إضافته.
                </p>
              </div>
            </section>
          )}


      </div>

      {/* MOBILE NAV */}
      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-md -translate-x-1/2 items-center justify-around rounded-[20px] border border-white/80 bg-white/85 px-2 py-2 shadow-[0_12px_40px_rgba(13,59,52,0.12)] backdrop-blur-2xl lg:hidden">
        <MobileNavItem
          href="/discover"
          icon={<CompassIcon />}
          label="اكتشف"
          active
        />

        <MobileNavItem
          href="/bookings"
          icon={<TicketIcon />}
          label="حجوزاتي"
        />

        <MobileNavItem
          href="/rewards"
          icon={<RewardSmallIcon />}
          label="المكافآت"
        />

        <MobileNavItem
          href="/profile"
          icon={<UserIcon />}
          label="حسابي"
        />
      </nav>
    </main>
  );
}

function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const earthRadiusKm = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;

  const deltaLat = toRadians(lat2 - lat1);
  const deltaLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(deltaLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.max(1, Math.round(distanceKm * 1000))} م`;
  }

  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} كم`;
  }

  return `${Math.round(distanceKm)} كم`;
}

/* ================= COMPONENTS ================= */

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-bold tracking-[0.18em] text-[#B99124]">
        {eyebrow}
      </p>

      <h2
        className="mt-1.5 text-[24px] font-semibold"
        style={{
          fontFamily:
            "var(--font-el-messiri), sans-serif",
        }}
      >
        {title}
      </h2>

      <p className="mt-1 text-[11px] text-[#0D3B34]/42">
        {description}
      </p>
    </div>
  );
}

function ExperienceCard({
  experience,
  distance,
  saved,
  onSave,
}: {
  experience: Experience;
  distance: string;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <article className="group overflow-hidden rounded-[24px] border border-white/80 bg-white/60 backdrop-blur-xl transition duration-300 hover:-translate-y-1">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={experience.image}
          alt={experience.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        {experience.badge && (
          <span className="absolute right-3 top-3 rounded-full bg-white/88 px-3 py-1.5 text-[9px] font-semibold text-[#0D3B34] backdrop-blur-xl">
            {experience.badge}
          </span>
        )}

        <button
          type="button"
          onClick={onSave}
          className={`absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-xl ${
            saved
              ? "bg-[#D4AF37] text-[#0D3B34]"
              : "bg-black/20 text-white"
          }`}
        >
          <HeartIcon filled={saved} />
        </button>

        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1.5 text-[9px] text-white backdrop-blur-xl">
          <LocationSmallIcon />
          {distance}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-semibold text-[#B99124]">
            {experience.categoryLabel}
          </span>

          <div className="flex items-center gap-1 text-[9px]">
            <StarIcon />
            <span className="font-semibold">
              {experience.rating}
            </span>
          </div>
        </div>

        <h3 className="mt-2 text-base font-semibold">
          {experience.title}
        </h3>

        <p className="mt-1.5 text-[10px] text-[#0D3B34]/40">
          {experience.location}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-[#0D3B34]/[0.05] pt-3">
          <span className="text-[11px] font-semibold">
            {experience.price}
          </span>

          <Link
            href={`/experience/${experience.id}`}
            className="flex items-center gap-1 text-[10px] font-semibold text-[#0D3B34]/55"
          >
            التفاصيل
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </article>
  );
}

function GuideCard({
  guide,
}: {
  guide: {
    id: number;
    name: string;
    specialty: string;
    languages: string;
    distance: string;
    rating: string;
    status: string;
  };
}) {
  return (
    <article className="rounded-[22px] border border-white/80 bg-white/55 p-4 backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#0D3B34] to-[#1A5B4F] text-sm font-bold text-[#D4AF37]">
          {guide.name.charAt(0)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold">
                  {guide.name}
                </h3>

                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0D3B34] text-[8px] text-white">
                  ✓
                </span>
              </div>

              <p className="mt-1 text-[10px] text-[#0D3B34]/45">
                {guide.specialty}
              </p>
            </div>

            <div className="flex items-center gap-1 text-[9px]">
              <StarIcon />
              {guide.rating}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <GuideTag>
              {guide.languages}
            </GuideTag>

            <GuideTag>
              {guide.distance}
            </GuideTag>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#0D3B34]/[0.05] pt-3">
        <div className="flex items-center gap-1.5 text-[9px] font-semibold text-[#2F765F]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#3A8F70]" />
          {guide.status}
        </div>

        <Link
          href={`/guide/${guide.id}`}
          className="rounded-[11px] bg-[#0D3B34] px-4 py-2 text-[9px] font-semibold text-white"
        >
          عرض الملف
        </Link>
      </div>
    </article>
  );
}

function GuideTag({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full bg-[#0D3B34]/[0.045] px-2.5 py-1 text-[8px] text-[#0D3B34]/50">
      {children}
    </span>
  );
}

function EventCard({
  event,
}: {
  event: {
    id: number;
    day: string;
    time: string;
    title: string;
    location: string;
  };
}) {
  return (
    <article className="flex items-center gap-4 rounded-[22px] border border-white/80 bg-white/55 p-4 backdrop-blur-xl">
      <div className="flex h-[62px] w-[62px] shrink-0 flex-col items-center justify-center rounded-[16px] bg-[#0D3B34] text-center">
        <span className="text-[9px] font-semibold text-[#D4AF37]">
          {event.day}
        </span>

        <span className="mt-1 text-[11px] font-bold text-white">
          {event.time}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold">
          {event.title}
        </h3>

        <div className="mt-2 flex items-center gap-1 text-[9px] text-[#0D3B34]/40">
          <LocationSmallIcon />
          {event.location}
        </div>
      </div>

      <Link
        href={`/events/${event.id}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#0D3B34]/8"
      >
        <ArrowIcon />
      </Link>
    </article>
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
          : "text-[#0D3B34]/35"
      }`}
    >
      <div
        className={
          active
            ? "text-[#B99124]"
            : ""
        }
      >
        {icon}
      </div>

      <span className="text-[8px] font-semibold">
        {label}
      </span>
    </Link>
  );
}

/* ================= ICONS ================= */

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

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

function LocationSmallIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function RewardIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 3 15 8l6 .8-4.3 4.2 1 6-5.7-2.8L6.3 19l1-6L3 8.8 9 8l3-5Z" />
    </svg>
  );
}

function HeartIcon({
  filled,
}: {
  filled: boolean;
}) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="#D4AF37"
      stroke="#D4AF37"
      strokeWidth="1.5"
    >
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3l-5.5 2.9 1-6.2L3 9.6l6.2-.9L12 3Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
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

function RewardSmallIcon() {
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