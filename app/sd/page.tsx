
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent, type TouchEvent, type WheelEvent } from "react";
import { getCurrentLocation } from "../../lib/location";

const experiences = [
  {
    id: 1,
    image: "/sudan/destinations/meroe.webp",
    alt: "البجراوية والحضارة الكوشية",
    distance: "اكتشفها",
    badge: "تاريخ وحضارة",
    icon: "location",
    title: "البجراوية والحضارة الكوشية",
    description:
      "اكتشف أهرامات مروي وآثار الحضارة الكوشية في واحدة من أبرز الوجهات التاريخية في السودان.",
    duration: "تجربة مفتوحة",
    points: "+ نقاط أريس لوب",
    position: "object-center",
  },
  {
    id: 2,
    image: "/sudan/destinations/port-sudan.webp",
    alt: "بورتسودان والبحر الأحمر",
    distance: "اكتشفها",
    badge: "بحر ومغامرة",
    icon: null,
    title: "بورتسودان والبحر الأحمر",
    description:
      "شعاب مرجانية وغوص وتجارب بحرية وساحل سوداني يفتح لك عالماً مختلفاً من المغامرات.",
    duration: "حسب التجربة",
    points: "+ نقاط أريس لوب",
    position: "object-center",
  },
  {
    id: 3,
    image: "/sudan/destinations/jebel-marra.webp",
    alt: "جبل مرة - دارفور",
    distance: "اكتشفها",
    badge: "طبيعة ومغامرة",
    icon: null,
    title: "جبل مرة – دارفور",
    description:
      "جبال وشلالات وطبيعة خضراء تمنحك وجهاً آخر للسودان وتجارب تستحق الاكتشاف.",
    duration: "حسب التجربة",
    points: "+ نقاط أريس لوب",
    position: "object-center",
  },
];

const steps = [
  {
    number: "01",
    icon: "⌖",
    title: "نكتشف موقعك",
    description:
      "بإذنك، تحدد أريس لوب موقعك داخل السودان وتعرض لك الوجهات والخدمات والتجارب الأقرب إليك.",
  },
  {
    number: "02",
    icon: "✦",
    title: "نفهم ما يناسبك",
    description:
      "الذكاء الاصطناعي يرتب تجارب السودان حسب اهتماماتك، موقعك، الوقت وما يناسب رحلتك.",
  },
  {
    number: "03",
    icon: "◆",
    title: "اكتشف واحجز واكسب",
    description:
      "احجز التجربة، تحقق من زيارتك، واكسب نقاط أريس لوب لاستخدامها في تجارب ومكافآت لاحقة.",
  },
];



const heroScenes = [
  {
    id: "sudan",
    nameAr: "السودان",
    nameEn: "Sudan",
    eyebrowAr: "أريس لوب السودان",
    eyebrowEn: "AREES LOOP SUDAN",
    titleAr: "استكشف السودان",
    titleEn: "Explore Sudan",
    descriptionAr:
      "من حولك… إلى أبعد مكان يستحق التجربة. اكتشف السودان بطريقة أقرب وأذكى مع أريس لوب.",
    descriptionEn:
      "From around you to the farthest place worth experiencing. Discover Sudan in a closer, smarter way with AREES Loop.",
    image: "/sudan/hero/arees-loop-sudan-hero.png.webp",
    coords: null,
    metaAr: "السودان حولك",
    metaEn: "Sudan around you",
    detailAr: "وجهات · تجارب · مغامرات",
    detailEn: "Destinations · Experiences · Adventures",
  },
  {
    id: "khartoum",
    nameAr: "الخرطوم",
    nameEn: "Khartoum",
    eyebrowAr: "قلب السودان",
    eyebrowEn: "THE HEART OF SUDAN",
    titleAr: "حيث يلتقي النيلين",
    titleEn: "Where the two Niles meet",
    descriptionAr:
      "اكتشف الخرطوم من النيل والمتاحف والمعالم إلى التجارب المحلية القريبة منك.",
    descriptionEn:
      "Discover Khartoum through the Nile, museums, landmarks and nearby local experiences.",
    image: "/sudan/destinations/khartoum.webp",
    coords: { lat: 15.5007, lng: 32.5599 },
    metaAr: "الخرطوم",
    metaEn: "Khartoum",
    detailAr: "نيل · ثقافة · مدينة",
    detailEn: "Nile · Culture · City",
  },
  {
    id: "port-sudan",
    nameAr: "بورتسودان والبحر الأحمر",
    nameEn: "Port Sudan & Red Sea",
    eyebrowAr: "البحر الأحمر",
    eyebrowEn: "THE RED SEA",
    titleAr: "البحر يفتح عالماً مختلفاً",
    titleEn: "The sea opens a different world",
    descriptionAr:
      "غوص وشعاب مرجانية وتجارب بحرية وساحل يستحق أن تراه عن قرب.",
    descriptionEn:
      "Diving, coral reefs, marine experiences and a coast worth seeing up close.",
    image: "/sudan/destinations/port-sudan.webp",
    coords: { lat: 19.6158, lng: 37.2164 },
    metaAr: "على البحر الأحمر",
    metaEn: "On the Red Sea",
    detailAr: "بحر · غوص · مغامرة",
    detailEn: "Sea · Diving · Adventure",
  },
  {
    id: "meroe",
    nameAr: "البجراوية والحضارة الكوشية",
    nameEn: "Meroe & Kushite Civilization",
    eyebrowAr: "تاريخ السودان",
    eyebrowEn: "SUDAN'S HISTORY",
    titleAr: "حضارة تحكيها الرمال",
    titleEn: "A civilization told by the sands",
    descriptionAr:
      "أهرامات وآثار كوشية تأخذك إلى عمق التاريخ السوداني في تجربة لا تشبه غيرها.",
    descriptionEn:
      "Pyramids and Kushite heritage take you deep into Sudanese history in a distinctive experience.",
    image: "/sudan/destinations/meroe.webp",
    coords: { lat: 16.9383, lng: 33.7483 },
    metaAr: "البجراوية",
    metaEn: "Meroe",
    detailAr: "آثار · حضارة · صحراء",
    detailEn: "Heritage · Civilization · Desert",
  },
  {
    id: "sabaloga",
    nameAr: "السبلوقة",
    nameEn: "Sabaloga",
    eyebrowAr: "النيل والطبيعة",
    eyebrowEn: "NILE & NATURE",
    titleAr: "قريب من النيل… بعيد عن المعتاد",
    titleEn: "Close to the Nile, far from ordinary",
    descriptionAr:
      "شلالات وطبيعة ومشاهد نيلية تجعل السبلوقة وجهة مثالية ليوم مختلف.",
    descriptionEn:
      "Waterfalls, nature and Nile scenery make Sabaloga a perfect escape for a different day.",
    image: "/sudan/destinations/sabaloga.webp",
    coords: null,
    metaAr: "السبلوقة",
    metaEn: "Sabaloga",
    detailAr: "شلالات · نيل · طبيعة",
    detailEn: "Waterfalls · Nile · Nature",
  },
  {
    id: "dinder",
    nameAr: "محمية الدندر الطبيعية",
    nameEn: "Dinder National Park",
    eyebrowAr: "الحياة البرية",
    eyebrowEn: "WILDLIFE",
    titleAr: "السودان كما تراه الطبيعة",
    titleEn: "Sudan through the eyes of nature",
    descriptionAr:
      "تجربة سفاري وطبيعة وحياة برية في واحدة من أشهر المحميات الطبيعية في السودان.",
    descriptionEn:
      "Safari, nature and wildlife experiences in one of Sudan's best-known natural reserves.",
    image: "/sudan/destinations/dinder.webp",
    coords: null,
    metaAr: "محمية الدندر",
    metaEn: "Dinder",
    detailAr: "سفاري · طبيعة · حياة برية",
    detailEn: "Safari · Nature · Wildlife",
  },
  {
    id: "jebel-marra",
    nameAr: "جبل مرة – دارفور",
    nameEn: "Jebel Marra – Darfur",
    eyebrowAr: "مرتفعات دارفور",
    eyebrowEn: "DARFUR HIGHLANDS",
    titleAr: "وجه أخضر لا تتوقعه",
    titleEn: "An unexpectedly green side of Sudan",
    descriptionAr:
      "جبال وشلالات ووديان وخضرة تكشف لك جانباً مدهشاً من طبيعة السودان.",
    descriptionEn:
      "Mountains, waterfalls, valleys and greenery reveal a remarkable side of Sudan's landscape.",
    image: "/sudan/destinations/jebel-marra.webp",
    coords: null,
    metaAr: "جبل مرة",
    metaEn: "Jebel Marra",
    detailAr: "جبال · شلالات · طبيعة",
    detailEn: "Mountains · Waterfalls · Nature",
  },
];


const toRadians = (value: number) => (value * Math.PI) / 180;

const distanceKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
};

export default function Home() {
  const [partnersNudge, setPartnersNudge] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [activeScene, setActiveScene] = useState(0);
  const [locationReady, setLocationReady] = useState(false);
  const [showLocationNotice, setShowLocationNotice] = useState(false);
  const [detectedLocationScene, setDetectedLocationScene] = useState<(typeof heroScenes)[number] | null>(null);
  const [detectedAddress, setDetectedAddress] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [heroLanguage, setHeroLanguage] = useState<"ar" | "en">("ar");
  const wheelLocked = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const touchLocked = useRef(false);

  const currentScene = heroScenes[activeScene];
  const isArabic = heroLanguage === "ar";
  const isLastScene = activeScene === heroScenes.length - 1;
  const nearbyDiscoverHref = userCoords
    ? `/sd?lat=${userCoords.lat.toFixed(6)}&lng=${userCoords.lng.toFixed(6)}&source=location#discover`
    : "/sd#discover";

  useEffect(() => {
    let cancelled = false;
    let noticeTimer: number | undefined;

    const detectLocation = async () => {
      try {
        const location = await getCurrentLocation();

        if (cancelled) return;

        const { lat, lng } = location.coordinates;

        setUserCoords({ lat, lng });
        setDetectedAddress(location.address);

        let nearestIndex = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;

        heroScenes.forEach((scene, index) => {
          if (!scene.coords) return;

          const distance = distanceKm(
            lat,
            lng,
            scene.coords.lat,
            scene.coords.lng,
          );

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        });

        if (nearestDistance <= 80) {
          setDetectedLocationScene(heroScenes[nearestIndex]);
          setActiveScene(nearestIndex);
          noticeTimer = window.setTimeout(
            () => setShowLocationNotice(true),
            650,
          );
        } else {
          setDetectedLocationScene(null);
          setActiveScene(0);
        }
      } catch (error) {
        console.error("Arees Loop location detection failed:", error);

        if (!cancelled) {
          setDetectedLocationScene(null);
          setDetectedAddress(null);
          setActiveScene(0);
        }
      } finally {
        if (!cancelled) {
          setLocationReady(true);
        }
      }
    };

    void detectLocation();

    return () => {
      cancelled = true;

      if (noticeTimer !== undefined) {
        window.clearTimeout(noticeTimer);
      }
    };
  }, []);


  useEffect(() => {
    const previousOverflow = document.body.style.overflowY;

    if (!isLastScene) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
    }

    return () => {
      document.body.style.overflowY = previousOverflow;
    };
  }, [isLastScene]);
    const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouse({ x, y });
  };

  const handleHowClick = () => {
    setShowLocationNotice(false);
    wheelLocked.current = false;
    setActiveScene(heroScenes.length - 1);

    window.setTimeout(() => {
      document.body.style.overflowY = "auto";
      document.getElementById("how")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 40);
  };

  const handleHeroWheel = (e: WheelEvent<HTMLElement>) => {
    const forward = e.deltaY > 8;
    const backward = e.deltaY < -8;
    const canMoveForward = forward && activeScene < heroScenes.length - 1;
    const canMoveBackward = backward && activeScene > 0;

    if (!canMoveForward && !canMoveBackward) return;

    e.preventDefault();
    if (wheelLocked.current) return;

    wheelLocked.current = true;
    setShowLocationNotice(false);

    setActiveScene((current) =>
      Math.max(
        0,
        Math.min(
          heroScenes.length - 1,
          current + (canMoveForward ? 1 : -1),
        ),
      ),
    );

    window.setTimeout(() => {
      wheelLocked.current = false;
    }, 820);
  };

  const handleHeroTouchStart = (e: TouchEvent<HTMLElement>) => {
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };

  const handleHeroTouchEnd = (e: TouchEvent<HTMLElement>) => {
    if (touchStartY.current === null || touchLocked.current) {
      touchStartY.current = null;
      return;
    }

    const touchEndY = e.changedTouches[0]?.clientY;
    if (touchEndY === undefined) {
      touchStartY.current = null;
      return;
    }

    const deltaY = touchStartY.current - touchEndY;
    touchStartY.current = null;

    const swipeThreshold = 50;
    const forward = deltaY > swipeThreshold;
    const backward = deltaY < -swipeThreshold;

    if (!forward && !backward) return;

    if (forward && activeScene < heroScenes.length - 1) {
      touchLocked.current = true;
      setShowLocationNotice(false);
      setActiveScene((current) =>
        Math.min(heroScenes.length - 1, current + 1),
      );
    } else if (backward && activeScene > 0) {
      touchLocked.current = true;
      setShowLocationNotice(false);
      setActiveScene((current) => Math.max(0, current - 1));
    } else {
      return;
    }

    window.setTimeout(() => {
      touchLocked.current = false;
    }, 820);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F7F3] text-[#182028]">
      <section
        className="relative min-h-screen overflow-hidden bg-[#182028]"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMouse({ x: 0, y: 0 })}
        onWheel={handleHeroWheel}
        onTouchStart={handleHeroTouchStart}
        onTouchEnd={handleHeroTouchEnd}
      >
        <div className="absolute inset-0">
          {heroScenes.map((scene, index) => (
            <div
              key={scene.id}
              className={`absolute inset-0 transition-[opacity,transform] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                index === activeScene
                  ? "scale-100 opacity-100"
                  : index < activeScene
                    ? "scale-[1.02] opacity-0"
                    : "scale-[1.05] opacity-0"
              }`}
              aria-hidden={index !== activeScene}
            >
              <Image
                src={scene.image}
                alt={
                  isArabic
                    ? `أريس لوب - ${scene.nameAr}`
                    : `AREES Loop - ${scene.nameEn}`
                }
                fill
                sizes="100vw"
                priority={index <= 1}
                className="object-cover object-center"
                style={{
                  transform:
                    index === activeScene
                      ? `scale(1.04) translate3d(${mouse.x * -10}px, ${
                          mouse.y * -5
                        }px, 0)`
                      : "scale(1.06)",
                  transition:
                    "transform 1000ms cubic-bezier(0.22,1,0.36,1)",
                }}
              />
            </div>
          ))}

          <div className="absolute inset-0 bg-gradient-to-r from-black/34 via-black/5 to-[#007848]/16" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#182028]/44 via-transparent to-black/10" />
        </div>

        <header className="relative z-40 px-4 pt-1 md:px-8 md:pt-1">
          <nav className="mx-auto flex h-[92px] max-w-[1450px] items-center justify-between gap-3 rounded-[24px] border border-white/35 bg-white/[0.055] px-4 py-0 shadow-[0_12px_34px_rgba(0,0,0,0.13),inset_0_1px_0_rgba(255,255,255,0.58)] backdrop-blur-[10px] backdrop-saturate-150 md:h-[96px] md:px-6">
            <div className="flex items-center gap-2.5">
              <Image
                src="/Logo/arees-loop-logo.png"
                alt="Arees Loop"
                width={240}
                height={120}
                priority
                className="h-auto w-[142px] md:w-[166px]"
              />
              <button
                type="button"
                aria-label="تغيير السوق"
                title="تغيير السوق"
                className="flex items-center gap-1.5 rounded-full border border-white/30 bg-black/18 px-3 py-2 text-[11px] font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-xl transition hover:bg-white/[0.16]"
              >
                <span aria-hidden="true">🇸🇩</span>
                <span>🇸🇩 السودان</span>
                <span className="text-white/60">⌄</span>
              </button>
            </div>

            <div
              dir="rtl"
              className="hidden items-center gap-8 text-[13px] font-bold text-white/95 lg:flex xl:gap-10"
            >
              <a href="#discover" className="transition hover:text-[#F0B6C1]">اكتشف</a>
              <a href="#how" className="transition hover:text-[#F0B6C1]">كيف تعمل؟</a>
              <a href="#rewards" className="transition hover:text-[#F0B6C1]">المكافآت</a>
              <a href="#partners" className="transition hover:text-[#F0B6C1]">للشركاء</a>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-full border border-white/30 bg-white/[0.05] p-1 text-[11px] font-black text-white backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => setHeroLanguage("ar")}
                  className={`rounded-full px-2.5 py-2 transition ${
                    heroLanguage === "ar"
                      ? "bg-white text-[#007848]"
                      : "text-white/75 hover:text-white"
                  }`}
                >
                  AR
                </button>

                <button
                  type="button"
                  onClick={() => setHeroLanguage("en")}
                  className={`rounded-full px-2.5 py-2 transition ${
                    heroLanguage === "en"
                      ? "bg-white text-[#007848]"
                      : "text-white/75 hover:text-white"
                  }`}
                >
                  EN
                </button>
              </div>

              <Link
                href="/login"
                className="hidden rounded-full border border-white/30 bg-white/[0.06] px-4 py-2.5 text-xs font-bold text-white backdrop-blur-xl transition hover:bg-white/15 sm:inline-flex"
              >
                تسجيل الدخول
              </Link>

              <Link
                href="/auth"
                className="rounded-full bg-[#C81035] px-4 py-2.5 text-xs font-black text-white shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-[#A80F2A] md:px-5"
              >
                ابدأ التجربة
              </Link>
            </div>
          </nav>
          <div className="mx-auto mt-1 h-[4px] max-w-[1410px] overflow-hidden rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.18)]">
            <div className="grid h-full grid-cols-3">
              <span className="bg-[#C81035]" />
              <span className="bg-white" />
              <span className="bg-[#007848]" />
            </div>
          </div>
        </header>

        {showLocationNotice && detectedLocationScene && (
          <div
            dir={isArabic ? "rtl" : "ltr"}
            className="absolute left-1/2 top-[112px] z-[70] w-[calc(100%-32px)] max-w-[520px] -translate-x-1/2 px-2 md:top-[116px]"
          >
            <div className="relative overflow-hidden rounded-[24px] border border-white/45 bg-[#182028]/62 px-5 py-4 text-white shadow-[0_18px_55px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-[14px] backdrop-saturate-150">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.10] via-transparent to-white/[0.025]" />

              <button
                type="button"
                onClick={() => setShowLocationNotice(false)}
                aria-label={isArabic ? "إغلاق الإشعار" : "Close notification"}
                className="absolute left-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/[0.06] text-sm text-white/75 transition hover:bg-white/15 hover:text-white"
              >
                ×
              </button>

              <div className="relative z-10 flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 animate-bounce items-center justify-center rounded-2xl border border-[#C81035]/55 bg-[#C81035]/14 text-[#F5DCE1] shadow-[inset_0_1px_0_rgba(255,255,255,0.20)]">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                    <circle cx="12" cy="10" r="2.4" />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-black tracking-[0.12em] text-[#F5DCE1]">
                    {isArabic ? "تم تحديد موقعك" : "LOCATION DETECTED"}
                  </p>

                  <p className="mt-1 text-base font-black md:text-lg">
                    {isArabic
                      ? `أنت الآن في ${detectedLocationScene.nameAr}`
                      : `You are now in ${detectedLocationScene.nameEn}`}
                  </p>

                  {detectedAddress && (
                    <p className="mt-1 truncate text-[11px] text-white/65 md:text-xs">
                      {detectedAddress}
                    </p>
                  )}

                  <p className="mt-1 text-xs leading-6 text-white/78 md:text-sm">
                    {isArabic
                      ? "استكشف تجارب ومهام قريبة من موقعك، مصممة لتناسب لحظتك الحالية."
                      : "Explore nearby experiences and missions selected around your current location."}
                  </p>
                </div>

                <Link
                  href={nearbyDiscoverHref}
                  className="hidden shrink-0 rounded-full bg-[#C81035] px-5 py-3 text-xs font-black text-[#182028] shadow-[0_10px_28px_rgba(200,16,53,0.24)] transition hover:-translate-y-0.5 hover:bg-[#C81035] sm:inline-flex"
                >
                  {isArabic ? "اكتشف ما حولك" : "Explore nearby"}
                </Link>
              </div>

              <Link
                href={nearbyDiscoverHref}
                className="relative z-10 mt-3 flex w-full items-center justify-center rounded-full bg-[#C81035] px-5 py-3 text-xs font-black text-[#182028] sm:hidden"
              >
                {isArabic ? "اكتشف ما حولك" : "Explore nearby"}
              </Link>
            </div>
          </div>
        )}

        <div
          dir="ltr"
          className="relative z-20 mx-auto grid min-h-[calc(100vh-88px)] max-w-[1450px] items-center gap-12 px-5 pb-20 pt-8 md:px-8 lg:grid-cols-[1fr_0.92fr] lg:px-12"
        >
          <div
            dir={isArabic ? "rtl" : "ltr"}
            className={isArabic ? "text-right" : "text-left"}
            style={{
              transform: `translate3d(${mouse.x * 7}px, ${mouse.y * 4}px, 0)`,
              transition: "transform 700ms cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-12 bg-[#C81035]" />
              <p className="text-xs font-black tracking-[0.16em] text-[#F5DCE1]">
                {isArabic ? currentScene.eyebrowAr : currentScene.eyebrowEn}
              </p>
            </div>

            <p className="mb-2 text-sm font-bold text-white/78">
              {isArabic ? currentScene.nameAr : currentScene.nameEn}
            </p>

            <h1 className="max-w-3xl text-5xl font-black leading-[1.07] tracking-tight text-white [text-shadow:0_3px_9px_rgba(0,0,0,0.92),0_10px_30px_rgba(0,0,0,0.50)] md:text-7xl xl:text-[5.3rem]">
              {isArabic ? currentScene.titleAr : currentScene.titleEn}
            </h1>

            <p className="mt-6 max-w-2xl text-base font-medium leading-8 font-semibold text-white [text-shadow:0_2px_7px_rgba(0,0,0,0.88)] md:text-lg">
              {isArabic ? currentScene.descriptionAr : currentScene.descriptionEn}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/discover"
                className="rounded-full bg-[#C81035] px-7 py-3.5 text-sm font-black text-[#182028] shadow-[0_15px_40px_rgba(200,16,53,0.20)] transition hover:-translate-y-1 hover:bg-[#A80F2A]"
              >
                {isArabic ? "اكتشف الآن" : "Discover now"}
              </Link>

              <button
                type="button"
                onClick={handleHowClick}
                className="rounded-full border border-white/35 bg-white/[0.05] px-7 py-3.5 text-sm font-black text-white backdrop-blur-xl transition hover:bg-white/12"
              >
                {isArabic ? "شاهد كيف تعمل" : "See how it works"}
              </button>
            </div>
          </div>

          {/* MINISTRY-STYLE CLEAR 3D GLASS */}
          <div
            className="relative mx-auto w-full max-w-[530px]"
            style={{ perspective: "1800px" }}
          >
            <div
              className="relative"
              style={{
                transformStyle: "preserve-3d",
                transform: `rotateY(${mouse.x * -1.8 - 0.8}deg) rotateX(${
                  mouse.y * 1.2 - 0.25
                }deg)`,
                transition: "transform 320ms ease-out",
              }}
            >
              {/* الخلفية الثانية تعطي سماكة قطعة الزجاج بدون تعتيم الصورة */}
              <div
                className="pointer-events-none absolute inset-0 translate-x-[7px] translate-y-[8px] rounded-[34px] border border-white/16 bg-transparent shadow-[0_20px_42px_rgba(0,0,0,0.20)]"
                style={{ transform: "translateZ(-18px)" }}
              />

              {/* الحافة السفلية = سماكة الزجاج */}
              <div
                className="pointer-events-none absolute -bottom-[8px] left-[5%] h-[14px] w-[90%] rounded-b-[30px] bg-gradient-to-b from-white/22 via-white/8 to-transparent blur-[0.5px]"
                style={{
                  transform: "translateZ(-8px) rotateX(72deg)",
                  transformOrigin: "top",
                }}
              />

              {/* الحافة الجانبية = سماكة الزجاج */}
              <div
                className="pointer-events-none absolute -right-[7px] top-[6%] h-[88%] w-[12px] rounded-r-[28px] bg-gradient-to-r from-white/22 via-white/7 to-transparent blur-[0.4px]"
                style={{
                  transform: "translateZ(-8px) rotateY(-70deg)",
                  transformOrigin: "left",
                }}
              />

              {/* قطعة الزجاج الرئيسية — شفافة بالكامل مثل عدسة موضوعة فوق المشهد */}
              <div
                className="relative overflow-hidden rounded-[36px] border border-white/55 bg-white/[0.012] shadow-[0_30px_80px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.95),inset_1px_0_0_rgba(255,255,255,0.30),inset_-1px_0_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(255,255,255,0.12)]"
                style={{
                  transform: "translateZ(24px)",
                  backdropFilter:
                    "saturate(1.12) contrast(1.035) brightness(1.035)",
                  WebkitBackdropFilter:
                    "saturate(1.12) contrast(1.035) brightness(1.035)",
                }}
              >
                {/* سطح زجاجي شفاف: لا توجد أي صورة داخلية — الخلفية نفسها تستمر خلال اللوح */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[35px]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.025) 24%, rgba(255,255,255,0.00) 55%, rgba(255,255,255,0.045) 76%, rgba(255,255,255,0.10) 100%)",
                  }}
                />

                {/* الحافة العلوية السميكة */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[3%] top-[2px] h-[8px] w-[94%] rounded-full opacity-90 blur-[0.35px]"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.20), rgba(255,255,255,0))",
                  }}
                />

                {/* حافة يسار مضيئة — تعطي إحساس الانكسار */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[2px] top-[5%] h-[90%] w-[9px] rounded-full opacity-70 blur-[0.8px]"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(255,255,255,0.85), rgba(255,255,255,0.18), rgba(255,255,255,0))",
                  }}
                />

                {/* حافة يمين زجاجية أغمق قليلاً لإظهار السمك */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute right-[2px] top-[6%] h-[88%] w-[10px] rounded-full opacity-55 blur-[0.9px]"
                  style={{
                    background:
                      "linear-gradient(270deg, rgba(255,255,255,0.65), rgba(255,255,255,0.10), rgba(0,0,0,0.03), rgba(255,255,255,0))",
                  }}
                />

                {/* الحافة السفلية — مثل عدسة سميكة موضوعة فوق الشاشة */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-[2px] left-[4%] h-[10px] w-[92%] rounded-full opacity-75 blur-[0.65px]"
                  style={{
                    background:
                      "linear-gradient(0deg, rgba(255,255,255,0.70), rgba(255,255,255,0.12), rgba(255,255,255,0))",
                  }}
                />

                {/* انعكاس قطري خفيف على سطح الزجاج */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-[18%] -top-[34%] h-[56%] w-[82%] rotate-[9deg] rounded-full bg-white/[0.055] blur-3xl"
                />

                {/* خط داخلي رفيع يثبت الإحساس بأن القطعة بارزة */}
                <div className="pointer-events-none absolute inset-[7px] rounded-[29px] border border-white/13" />

                <div
                  dir={isArabic ? "rtl" : "ltr"}
                  className={`relative z-10 p-8 text-white ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black tracking-[0.22em] text-white/70">
                        AREES DISCOVERY
                      </p>

                      <h2 className="mt-2 text-3xl font-black [text-shadow:0_2px_7px_rgba(0,0,0,0.88)]">
                        {isArabic ? currentScene.nameAr : currentScene.nameEn}
                      </h2>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/38 bg-white/[0.022] shadow-[inset_0_1px_0_rgba(255,255,255,0.48)] backdrop-blur-[1px]">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-6 w-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                        <circle cx="12" cy="10" r="2.3" />
                      </svg>
                    </div>
                  </div>

                  {/* المحتوى الداخلي شفاف جداً - الخلفية وراءه واضحة */}
                  <div className="mt-7 rounded-[26px] border border-white/24 bg-white/[0.010] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.20)] backdrop-blur-[0.8px]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-white/26 bg-white/[0.014] px-3 py-1.5 text-[11px] font-black text-white/90">
                        {isArabic ? currentScene.metaAr : currentScene.metaEn}
                      </span>

                      <span className="text-xs font-bold text-white/76">
                        {String(activeScene + 1).padStart(2, "0")} /{" "}
                        {String(heroScenes.length).padStart(2, "0")}
                      </span>
                    </div>

                    <p className="mt-7 text-2xl font-black [text-shadow:0_2px_6px_rgba(0,0,0,0.82)]">
                      {isArabic ? currentScene.detailAr : currentScene.detailEn}
                    </p>

                    <p className="mt-3 text-sm font-medium leading-7 text-white [text-shadow:0_2px_5px_rgba(0,0,0,0.78)]">
                      {isArabic
                        ? "أماكن وتجارب أقرب إلى لحظتك الحالية، مع حجز ومكافآت داخل أريس لوب."
                        : "Places and experiences closer to your current moment, with booking and rewards inside AREES Loop."}
                    </p>

                    <div className="mt-7 grid grid-cols-3 gap-2.5 text-center">
                      <Link
                        href="/discover"
                        className="rounded-2xl border border-white/40 bg-white/[0.055] px-2 py-3 text-xs font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] backdrop-blur-[1px] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C81035]/90 hover:bg-[#C81035] hover:text-[#007848] hover:shadow-[0_0_24px_rgba(200,16,53,0.38),inset_0_1px_0_rgba(255,255,255,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C81035]/80"
                      >
                        {isArabic ? "اكتشف" : "Discover"}
                      </Link>

                      <Link
                        href="/bookings"
                        className="rounded-2xl border border-white/40 bg-white/[0.055] px-2 py-3 text-xs font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] backdrop-blur-[1px] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C81035]/90 hover:bg-[#C81035] hover:text-[#007848] hover:shadow-[0_0_24px_rgba(200,16,53,0.38),inset_0_1px_0_rgba(255,255,255,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C81035]/80"
                      >
                        {isArabic ? "احجز" : "Book"}
                      </Link>

                      <Link
                        href="/rewards"
                        className="rounded-2xl border border-white/40 bg-white/[0.055] px-2 py-3 text-xs font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] backdrop-blur-[1px] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C81035]/90 hover:bg-[#C81035] hover:text-[#007848] hover:shadow-[0_0_24px_rgba(200,16,53,0.38),inset_0_1px_0_rgba(255,255,255,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C81035]/80"
                      >
                        {isArabic ? "اكسب" : "Earn"}
                      </Link>
                    </div>
                  </div>

                  <Link
                    href="/discover"
                    className="mt-4 flex w-full items-center justify-between rounded-2xl border border-white/22 bg-black/24 px-5 py-4 font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-[2px] transition hover:bg-[#242D35]/86"
                  >
                    <span>{isArabic ? "ادخل التجربة" : "Enter experience"}</span>
                    <span className="text-[#C81035]">←</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex xl:right-7">
          {heroScenes.map((scene, index) => (
            <button
              key={scene.id}
              type="button"
              onClick={() => {
                setShowLocationNotice(false);
                setActiveScene(index);
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-[11px] font-black backdrop-blur-xl transition ${
                activeScene === index
                  ? "border-[#C81035]/80 bg-[#C81035] text-[#007848] shadow-[0_0_24px_rgba(200,16,53,0.36)]"
                  : "border-white/30 bg-white/[0.035] text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              {String(index + 1).padStart(2, "0")}
            </button>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-5 z-30 flex justify-center">
          <div className="flex items-center gap-3 rounded-full border border-white/22 bg-white/[0.02] px-5 py-2.5 text-[11px] font-bold text-white/78 backdrop-blur-xl">
            <span>
              {isArabic
                ? isLastScene
                  ? "واصل للأسفل"
                  : "مرر لاستكشاف الوجهة التالية"
                : isLastScene
                  ? "Continue down"
                  : "Scroll to discover the next destination"}
            </span>
            <span className="text-base text-white">⌄</span>
          </div>
        </div>
      </section>

      {/* =====================================================
          اكتشف EXPERIENCES
      ====================================================== */}

      <section
        id="discover"
        className="relative bg-[#F1F1ED] px-6 py-24 md:px-10"
      >
        <div className="mx-auto max-w-7xl">
          {/* Heading */}
          <div dir="rtl" className="mb-12 text-right">
            <p className="text-sm font-bold tracking-[0.18em] text-[#007848]/60">
              اكتشف القريب منك
            </p>

            <h2 className="mt-3 text-4xl font-black text-[#007848] md:text-5xl">
              اكتشف ما حولك
            </h2>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#007848]/70">
              تجارب مختارة بذكاء حسب موقعك، وقتك واهتماماتك.
            </p>
          </div>

          {/* Experience cards */}
          <div
            id="experiences"
            dir="rtl"
            className="grid gap-6 text-right md:grid-cols-3"
          >
            {experiences.map((experience) => (
              <article
                key={experience.title}
                className="group relative flex h-full flex-col overflow-hidden rounded-[30px] border border-[#007848]/10 bg-white p-6 shadow-[0_18px_45px_rgba(0,120,72,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,120,72,0.14)]"
              >
                {/* Image */}
                <div className="relative mb-5 h-48 overflow-hidden rounded-[22px]">
                  <Image
                    src={experience.image}
                    alt={experience.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className={`object-cover ${experience.position} transition-transform duration-700 group-hover:scale-105`}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                  {/* Distance */}
                  <div className="absolute left-4 top-4 rounded-full border border-white/30 bg-[#007848]/55 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                    {experience.distance}
                  </div>

                  {/* Badge */}
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
                    <span className="rounded-full border border-white/30 bg-black/15 px-3 py-1 text-xs font-bold backdrop-blur-md">
                      {experience.badge}
                    </span>

                    {experience.icon === "location" && (
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-[#007848]/65 text-white shadow-sm backdrop-blur-md"
                        aria-label="الموقع"
                        title="الموقع"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                          <circle cx="12" cy="10" r="2.5" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-black leading-9 text-[#007848]">
                  {experience.title}
                </h3>

                <p className="mt-3 flex-1 leading-7 text-[#007848]/65">
                  {experience.description}
                </p>

                {/* Chips */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#007848]/[0.07] px-4 py-2 text-sm font-bold text-[#007848]">
                    ◷ {experience.duration}
                  </span>

                  <span className="rounded-full bg-[#C81035]/[0.12] px-4 py-2 text-sm font-bold text-[#007848]">
                    {experience.points}
                  </span>
                </div>

                {/* Button */}
                <Link
                  href={`/experience/${experience.id}`}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#007848] py-3.5 font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#008A52] hover:shadow-[0_10px_25px_rgba(0,120,72,0.20)]"
                >
                  عرض التجربة

                  <span className="text-lg">←</span>
                </Link>
              </article>
            ))}
          </div>

          {/* Discover more */}
          <div className="mt-12 flex justify-center">
            <Link
              href="/discover"
              className="rounded-full border border-[#007848]/15 bg-white px-8 py-4 font-bold text-[#007848] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C81035]/50 hover:shadow-md"
            >
              استكشف المزيد من التجارب
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}

      <section
        id="how"
        className="relative overflow-hidden  px-6 py-24 md:px-10 bg-white"
      >
        {/* الزجاجة الواحدة كخلفية كاملة للقسم */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#F7F7F3]/[0.05]" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div dir="rtl" className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold tracking-[0.18em] text-[#C81035]">
              كيف تعمل أريس لوب؟
            </p>

            <h2 className="mt-3 text-4xl font-black text-[#007848] md:text-5xl">
              من موقعك إلى تجربة حقيقية
            </h2>

            <p className="mt-5 text-lg leading-8 text-[#007848]/65">
              أريس لوب لا تنتظر منك البحث فقط، بل تفهم سياقك وتساعدك على
              اكتشاف ما يستحق التجربة حولك.
            </p>
          </div>

          {/* Steps */}
          <div
            dir="rtl"
            className="relative mt-16 grid gap-8 text-right md:grid-cols-3"
          >
            {steps.map((step) => (
              <div
                key={step.number}
                className="group relative overflow-hidden rounded-[34px] border-2 border-white/70 bg-white/[0.10] p-8 shadow-[0_18px_50px_rgba(24,32,40,0.10),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(255,255,255,0.35)] backdrop-blur-[10px] transition-all duration-500 ease-out hover:-translate-y-4 hover:scale-[1.025] hover:border-[#C81035]/80 hover:bg-white/[0.18] hover:shadow-[0_30px_75px_rgba(111,78,18,0.22),0_0_34px_rgba(200,16,53,0.28),inset_0_1px_0_rgba(255,255,255,1)]"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/65 via-white/18 to-transparent" />
                <div className="pointer-events-none absolute -right-12 -top-10 h-28 w-28 rounded-full bg-[#C81035]/14 blur-2xl transition-all duration-300 group-hover:bg-[#C81035]/22" />

                <div className="relative flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white/75 bg-white/18 text-[#007848]
                    shadow-[0_10px_28px_rgba(24,32,40,0.10),inset_0_1px_0_rgba(255,255,255,0.95)]
                    backdrop-blur-xl transition-all duration-500
                    group-hover:-translate-y-1 group-hover:border-[#C81035]/80
                    group-hover:bg-[#C81035]/16 group-hover:text-[#007848]
                    group-hover:shadow-[0_0_28px_rgba(200,16,53,0.42)]">
                    {step.number === "01" && (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-7 w-7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </svg>
                    )}

                    {step.number === "02" && (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-7 w-7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M4 7h10" />
                        <path d="M18 7h2" />
                        <circle cx="16" cy="7" r="2" />
                        <path d="M4 12h3" />
                        <path d="M11 12h9" />
                        <circle cx="9" cy="12" r="2" />
                        <path d="M4 17h8" />
                        <path d="M16 17h4" />
                        <circle cx="14" cy="17" r="2" />
                      </svg>
                    )}

                    {step.number === "03" && (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-7 w-7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M4 7.5A2.5 2.5 0 0 0 6.5 10 2.5 2.5 0 0 0 4 12.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4.5a2.5 2.5 0 0 0-2.5-2.5A2.5 2.5 0 0 0 20 7.5V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v.5Z" />
                        <path d="m12 8 .9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2-1.45-1.4 2-.3L12 8Z" />
                      </svg>
                    )}
                  </div>

                  <span className="text-4xl font-black text-[#007848]/[0.08]">
                    {step.number}
                  </span>
                </div>

                <h3 className="relative mt-7 text-2xl font-black text-[#007848]">
                  {step.title}
                </h3>

                <p className="relative mt-4 leading-8 text-[#007848]/65">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Flow line */}
          <div
            dir="rtl"
            className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-3 text-sm font-bold text-[#007848]/65"
          >
            <span className="rounded-full px-5 py-3 border border-white/75 bg-white/24 text-[#007848]/80 shadow-[0_8px_24px_rgba(24,32,40,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-[#C81035]/85 hover:bg-[#C81035] hover:text-white hover:shadow-[0_0_30px_rgba(200,16,53,0.48)]">
              حدد موقعك
            </span>

            <span>←</span>

            <span className="rounded-full px-5 py-3 border border-white/75 bg-white/24 text-[#007848]/80 shadow-[0_8px_24px_rgba(24,32,40,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-[#C81035]/85 hover:bg-[#C81035] hover:text-white hover:shadow-[0_0_30px_rgba(200,16,53,0.48)]">
              اكتشف
            </span>

            <span>←</span>

            <span className="rounded-full px-5 py-3 border border-white/75 bg-white/24 text-[#007848]/80 shadow-[0_8px_24px_rgba(24,32,40,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-[#C81035]/85 hover:bg-[#C81035] hover:text-white hover:shadow-[0_0_30px_rgba(200,16,53,0.48)]">
              احجز
            </span>

            <span>←</span>

            <span className="rounded-full px-5 py-3 border border-white/75 bg-white/24 text-[#007848]/80 shadow-[0_8px_24px_rgba(24,32,40,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-[#C81035]/85 hover:bg-[#C81035] hover:text-white hover:shadow-[0_0_30px_rgba(200,16,53,0.48)]">
              اكسب
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          مكافأة أريس لوبS
      ====================================================== */}

      <section
        id="rewards"
        className="relative overflow-hidden bg-[#007848] px-6 py-24 text-white md:px-10"
      >
        <div className="absolute -left-24 top-8 h-80 w-80 rounded-full bg-[#C81035]/10 blur-3xl" />

        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-white/[0.04] blur-3xl" />

        <div
          dir="rtl"
          className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2"
        >
          {/* Rewards Text */}
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-[#C81035]">
              مكافأة أريس لوبS
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              كل تجربة تفتح لك
              <span className="block text-[#C81035]">التجربة التالية</span>
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-9 text-white/70">
              اجمع نقاط أريس لوب من زياراتك وتجاربك المؤهلة، واستخدمها للحصول على
              مكافآت وخصومات وتجارب جديدة داخل المنصة.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-bold">
                اكسب مع كل تجربة
              </span>

              <span className="rounded-full border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-bold">
                استبدل داخل المنصة
              </span>

              <span className="rounded-full border border-[#C81035]/30 bg-[#C81035]/10 px-5 py-3 text-sm font-bold text-[#C81035]">
                عروض ومهمات خاصة
              </span>
            </div>
          </div>

          {/* Wallet Card */}
          <div className="mx-auto w-full max-w-[520px]">
            <div className="relative overflow-hidden rounded-[34px] border border-white/20 bg-white/[0.07] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.20)] backdrop-blur-xl">
              <div className="absolute right-[-60px] top-[-80px] h-52 w-52 rounded-full bg-[#C81035]/20 blur-3xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold tracking-[0.18em] text-white/60">
                      محفظة أريس لوب
                    </p>

                    <p className="mt-2 text-lg font-bold">
                      رصيد المكافآت
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-xl">
                    ◆
                  </div>
                </div>

                <div className="mt-10">
                  <p className="text-sm text-white/55">رصيدك الحالي</p>

                  <div className="mt-2 flex items-end gap-3">
                    <p className="text-5xl font-black text-[#C81035]">
                      5,750
                    </p>

                    <span className="pb-1 font-bold text-white/70">
                      نقطة
                    </span>
                  </div>
                </div>

                <div className="mt-8 rounded-[24px] border border-white/10 bg-black/10 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-white/65">
                      آخر مكافأة
                    </span>

                    <span className="font-black text-[#C81035]">
                      +750 نقطة
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[72%] rounded-full bg-[#C81035]" />
                  </div>

                  <p className="mt-3 text-xs leading-6 text-white/50">
                    كلما اكتشفت تجارب مؤهلة أكثر، تتقدم نحو مكافآت وتجارب
                    جديدة.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SUCCESS PARTNERS — CONTINUOUS LUXURY RIBBON
      ====================================================== */}

      <section id="partners" className="relative overflow-hidden bg-[#007848] px-0 py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#007848] via-[#00663D] to-[#182028]" />
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-white/8 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-[#C81035]/16 blur-3xl" />

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-[#007848]/[0.15] blur-[90px]" />
          <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#C81035]/[0.13] blur-[90px]" />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -left-[12%] top-[12%] h-[2px] w-[62%] rotate-[-5deg] bg-gradient-to-r from-transparent via-[#C81035]/35 to-transparent" />
          <div className="absolute -right-[10%] top-[24%] h-[2px] w-[58%] rotate-[5deg] bg-gradient-to-r from-transparent via-[#C81035]/25 to-transparent" />
          <div className="absolute left-[8%] top-[36%] h-24 w-[84%] rounded-[50%] border-t border-[#C81035]/20" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-[radial-gradient(ellipse_at_center,rgba(200,16,53,0.14),transparent_68%)]" />
        </div>

        <div dir="rtl" className="relative z-20 mx-auto max-w-7xl px-6 text-center md:px-10">
          <p className="text-sm font-black tracking-[0.20em] text-[#007848] md:text-base">شركاء النجاح</p>
          <h2 className="mt-3 text-4xl font-black leading-tight text-[#182028] md:text-6xl">
            شراكات تصنع تجربة أقرب
            <span className="text-[#007848]"> وأثراً أكبر</span>
          </h2>
          <div className="mx-auto mt-5 flex w-52 items-center justify-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-l from-[#A80F2A] to-transparent" />
            <span className="h-2.5 w-2.5 rotate-45 border border-[#007848] bg-[#C81035]/45" />
            <span className="h-px flex-1 bg-gradient-to-r from-[#A80F2A] to-transparent" />
          </div>
          <p className="mx-auto mt-5 max-w-3xl text-base font-medium leading-8 text-[#D8D8D0]/65 md:text-lg">
            نعمل مع شركائنا لربط الزائر بالخدمات والتجارب والفرص التي تثري رحلته، ضمن منظومة رقمية واحدة تجمع الاكتشاف والحجز والتفاعل.
          </p>
        </div>

        <div className="partners-stage relative z-20 mt-12 overflow-hidden py-14 md:mt-16 md:py-20">
          <div className="pointer-events-none absolute left-1/2 top-[26%] h-20 w-[115%] -translate-x-1/2 rounded-[50%] border-t-[3px] border-[#C81035]/70 shadow-[0_-2px_12px_rgba(255,209,87,.35)]" />
          <div className="pointer-events-none absolute left-1/2 bottom-[23%] h-20 w-[115%] -translate-x-1/2 rounded-[50%] border-b-[3px] border-[#C81035]/70 shadow-[0_3px_14px_rgba(255,196,50,.35)]" />

          <button type="button" aria-label="الشريك السابق" className="partner-arrow left-4 md:left-8" onClick={() => setPartnersNudge((value) => value - 1)}>‹</button>
          <button type="button" aria-label="الشريك التالي" className="partner-arrow right-4 md:right-8" onClick={() => setPartnersNudge((value) => value + 1)}>›</button>

          <div className="partners-marquee" style={{ "--partners-nudge": `${partnersNudge * 210}px` } as React.CSSProperties}>
            {[0, 1].map((group) => (
              <div key={group} className="partners-group" aria-hidden={group === 1}>
                {[
                  { src: "/Logo/arees-travel-solutions-logo.png", alt: "أريس للسفر والسياحة" },
                  { src: "/Logo/tarco-aviation-logo.png", alt: "تاركو للطيران" },
                  { src: "/Logo/badr-airlines-transparent-v2.png", alt: "بدر للطيران" },
                  { src: "/Logo/sudan-airways-transparent-v2.png", alt: "الخطوط الجوية السودانية" },
                  { src: "/Logo/arees-travel-solutions-logo.png", alt: "أريس للسفر والسياحة" },
                  { src: "/Logo/tarco-aviation-logo.png", alt: "تاركو للطيران" },
                  { src: "/Logo/badr-airlines-transparent-v2.png", alt: "بدر للطيران" },
                  { src: "/Logo/sudan-airways-transparent-v2.png", alt: "الخطوط الجوية السودانية" },
                ].map((partner, index) => (
                  <div key={`${group}-${index}`} className="partner-slot">
                    <div className="partner-glass">
                      <Image src={partner.src} alt={group === 0 ? partner.alt : ""} width={420} height={190} className="h-auto max-h-[78px] w-auto max-w-[165px] object-contain md:max-h-[96px] md:max-w-[205px]" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-20 mx-auto mt-2 flex max-w-5xl flex-col items-center justify-between gap-4 px-6 text-center md:flex-row md:px-10 md:text-right" dir="rtl">
          <div>
            <p className="text-lg font-black text-[#182028]">انضم إلى منظومة أريس لوب</p>
            <p className="mt-1 text-sm font-medium leading-7 text-[#182028]/65">للشركات ومقدمي التجارب والجهات الراغبة في الوصول إلى الزوار عبر تجربة رقمية ذكية.</p>
          </div>
          <Link href="/partner/onboarding" className="shrink-0 rounded-full border border-[#A80F2A]/45 bg-white/55 px-8 py-3.5 font-black text-[#8E1027] shadow-[0_12px_35px_rgba(155,112,24,0.12)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/75">انضم كشريك</Link>
        </div>

        <style jsx>{`
          .partners-stage { perspective: 1200px; }
          .partners-marquee { display:flex; width:max-content; transform:translateX(var(--partners-nudge)); transition:transform .55s cubic-bezier(.2,.8,.2,1); animation:partnersFlow 34s linear infinite; will-change:transform; }
          .partners-stage:hover .partners-marquee { animation-play-state:paused; }
          .partners-group { display:flex; flex-shrink:0; align-items:center; }
          .partner-slot { width:210px; flex:0 0 210px; padding:0 10px; transform:translateY(0); }
          .partner-slot:nth-child(8n+1), .partner-slot:nth-child(8n+8) { transform:translateY(18px) scale(.88); }
          .partner-slot:nth-child(8n+2), .partner-slot:nth-child(8n+7) { transform:translateY(8px) scale(.94); }
          .partner-glass { display:flex; height:126px; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,.68); border-radius:30px; background:linear-gradient(135deg,rgba(255,255,255,.52),rgba(255,248,231,.20)); box-shadow:inset 0 1px 0 rgba(255,255,255,.92),0 16px 35px rgba(115,78,12,.08); backdrop-filter:blur(14px); transition:transform .28s ease,box-shadow .28s ease,background .28s ease; }
          .partner-glass:hover { transform:translateY(-8px) scale(1.12); background:linear-gradient(135deg,rgba(255,255,255,.76),rgba(255,249,232,.34)); box-shadow:inset 0 1px 0 white,0 22px 42px rgba(132,89,12,.16),0 0 28px rgba(200,16,53,.16); }
          .partner-arrow { position:absolute; z-index:40; top:50%; display:flex; height:48px; width:48px; transform:translateY(-50%); align-items:center; justify-content:center; border:1px solid rgba(184,138,37,.32); border-radius:999px; background:rgba(255,255,255,.72); color:#8E1027; font-size:32px; line-height:1; box-shadow:0 10px 30px rgba(86,57,8,.12); backdrop-filter:blur(12px); transition:.25s ease; }
          .partner-arrow:hover { transform:translateY(-50%) scale(1.08); background:white; }
          @keyframes partnersFlow { from { transform:translateX(calc(var(--partners-nudge) + 0px)); } to { transform:translateX(calc(var(--partners-nudge) - 1680px)); } }
          @media (max-width:767px) { .partner-slot{width:165px;flex-basis:165px;padding:0 7px}.partner-glass{height:105px;border-radius:24px}.partners-marquee{animation-duration:28s}@keyframes partnersFlow{from{transform:translateX(calc(var(--partners-nudge) + 0px))}to{transform:translateX(calc(var(--partners-nudge) - 1320px))}} }
          @media (prefers-reduced-motion:reduce){.partners-marquee{animation:none}}
        `}</style>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="relative overflow-hidden border-y border-[#007848]/10 px-6 py-20 md:px-10">
        {/* خلفية سودانية هادئة */}
        <div className="absolute inset-0">
          <Image
            src="/sudan/hero/arees-loop-sudan-hero.png.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />

          {/* طبقة فاتحة تجعل الصورة هافتون وتحافظ على وضوح النص */}
          <div className="absolute inset-0 bg-white/58" />

          {/* تدرج ناعم يحافظ على نظافة مركز النص */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.38)_48%,rgba(247,247,242,0.18)_100%)]" />
        </div>

        <div
          dir="rtl"
          className="relative z-10 mx-auto max-w-5xl text-center"
        >
          <Image
            src="/Logo/arees-loop-logo.png"
            alt="Arees Loop"
            width={190}
            height={95}
            className="mx-auto h-auto w-[160px]"
          />

          <h2 className="mt-8 text-4xl font-black text-[#007848] drop-shadow-[0_1px_0_rgba(255,255,255,0.75)] md:text-5xl">
            مدينتك مليئة بالتجارب
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-8 text-[#007848]/70">
            أريس لوب تساعدك على اكتشاف التجربة المناسبة في اللحظة المناسبة.
          </p>

          <Link
            href="/auth"
            className="mt-8 inline-flex rounded-full bg-[#007848] px-9 py-4 font-bold text-white shadow-[0_12px_30px_rgba(0,120,72,0.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#008A52] hover:shadow-[0_16px_34px_rgba(0,120,72,0.24)]"
          >
            ابدأ الاستكشاف
          </Link>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <div className="h-[6px] w-full bg-gradient-to-l from-[#C81035] via-white to-[#007848]" />
      <footer className="border-t border-[#007848]/10 bg-[#F8E8EB] px-6 pb-4 pt-4 md:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 overflow-hidden">
          <div className="absolute -right-[8%] -top-20 h-28 w-[58%] rotate-[-2deg] rounded-[50%] bg-[#C81035]/10" />
          <div className="absolute -left-[8%] -top-20 h-28 w-[58%] rotate-[2deg] rounded-[50%] bg-[#007848]/10" />
        </div>

        <div dir="rtl" className="mx-auto max-w-7xl">
          {/* Top row: app / centered brand / navigation */}
          <div className="grid items-center gap-5 border-b border-[#007848]/10 pb-4 lg:grid-cols-[1fr_0.9fr_1fr]">
            {/* Right: app download placeholders */}
            <div className="order-3 flex justify-center lg:order-1 lg:justify-start">
              <div className="text-center">
                <p className="text-xs font-black text-[#007848]">
                  حمّل التطبيق
                </p>

                <div className="mt-2 flex flex-wrap justify-center gap-2 lg:justify-start" dir="ltr">
                  <div
                    aria-label="متجر آبل قريبًا"
                    title="قريبًا"
                    className="flex min-w-[138px] cursor-default items-center gap-2 rounded-xl border border-[#007848]/12 bg-white px-3 py-2 shadow-sm"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 shrink-0 text-[#007848]"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M16.7 12.9c0-2.5 2.1-3.7 2.2-3.8-1.2-1.8-3.1-2-3.8-2-1.6-.2-3.2 1-4 1-0.9 0-2.2-1-3.6-.9-1.9 0-3.6 1.1-4.6 2.8-2 3.4-.5 8.5 1.4 11.3.9 1.4 2 2.9 3.5 2.8 1.4-.1 1.9-.9 3.6-.9 1.7 0 2.2.9 3.7.9 1.5 0 2.5-1.4 3.4-2.8 1.1-1.6 1.5-3.1 1.5-3.2-.1 0-3.3-1.3-3.3-5.2Zm-2.7-7.5c.8-1 1.4-2.4 1.2-3.8-1.2.1-2.7.8-3.6 1.8-.8.9-1.5 2.3-1.3 3.6 1.4.1 2.8-.7 3.7-1.6Z" />
                    </svg>
                    <span className="text-left">
                      <span className="block text-[9px] uppercase tracking-wide text-[#007848]/40">
                        متاح على
                      </span>
                      <span className="block text-xs font-black text-[#007848]">
                        متجر آبل
                      </span>
                    </span>
                    <span className="ml-auto rounded-full bg-[#C81035]/12 px-2 py-0.5 text-[8px] font-bold text-[#007848]">
                      قريبًا
                    </span>
                  </div>

                  <div
                    aria-label="متجر جوجل قريبًا"
                    title="قريبًا"
                    className="flex min-w-[138px] cursor-default items-center gap-2 rounded-xl border border-[#007848]/12 bg-white px-3 py-2 shadow-sm"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 text-[#007848]"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M3.6 2.8c-.4.4-.6 1-.6 1.7v15c0 .7.2 1.3.6 1.7l.1.1 8.4-8.4v-.2L3.7 2.7l-.1.1Zm11.3 12.9-2.8-2.8v-.2l2.8-2.8.1.1 3.4 1.9c1 .6 1 1.5 0 2.1L15 15.8l-.1-.1ZM4.7 21.9l8.8-8.8 1.8 1.8-8.1 4.6c-.8.5-1.7.8-2.5 2.4Zm0-19.8c.8 1.6 1.7 1.9 2.5 2.4l8.1 4.6-1.8 1.8-8.8-8.8Z" />
                    </svg>
                    <span className="text-left">
                      <span className="block text-[9px] uppercase tracking-wide text-[#007848]/40">
                        متاح على
                      </span>
                      <span className="block text-xs font-black text-[#007848]">
                        متجر جوجل
                      </span>
                    </span>
                    <span className="ml-auto rounded-full bg-[#C81035]/12 px-2 py-0.5 text-[8px] font-bold text-[#007848]">
                      قريبًا
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="h-px w-8 bg-[#007848]/20" />
                  <p className="text-[11px] font-black text-[#007848]">
                    حلول متكاملة ... لرحلة أذكى
                  </p>
                  <span className="h-px w-8 bg-[#007848]/20" />
                </div>

                <p className="mt-1 text-[10px] text-[#007848]/40">
                  خطة اليوم ... لتجارب أجمل غدًا
                </p>
              </div>
            </div>

            {/* Center: brand */}
            <div className="order-1 mx-auto w-full max-w-[360px] text-center lg:order-2">
              <Image
                src="/Logo/arees-loop-logo.png"
                alt="Arees Loop"
                width={320}
                height={160}
                className="mx-auto h-auto w-[190px] md:w-[220px]"
              />

              <p className="mt-1.5 text-[11px] font-semibold text-[#007848]/55">
                منصة تجربة الزائر الذكية
              </p>

              <p className="mt-1 text-[11px] font-bold text-[#007848]/70">
                اكتشف · احجز · اجمع النقاط · عش التجربة
              </p>

              <div className="mt-2.5 flex items-center justify-center gap-2">
                <a
                  href="https://www.instagram.com/arees_travel_ksa?stkn=MWdqZDZzc2NiaGRheg="
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  title="Instagram"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#007848] text-white transition hover:-translate-y-0.5 hover:bg-[#008A52]"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </a>

                <a
                  href="https://www.tiktok.com/@areestravel.ksa?_r=1&_t=ZS-99hfKs0fqiO"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok"
                  title="TikTok"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#007848] text-white transition hover:-translate-y-0.5 hover:bg-[#008A52]"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M14.4 3c.35 2.65 1.85 4.22 4.6 4.4v3.1c-1.6.1-3-.37-4.55-1.32v5.8c0 3.7-2.55 6.02-5.65 6.02-4.75 0-6.6-5.25-3.55-8.28 1.35-1.35 3.18-1.72 5.2-1.45v3.2c-.43-.14-.85-.2-1.28-.16-1.02.08-1.92.78-2.1 1.8-.28 1.53.9 2.72 2.33 2.72 1.27 0 2.3-.97 2.3-2.47V3h2.7Z" />
                  </svg>
                </a>

                <a
                  href="https://www.facebook.com/Arees.Integrated.Solutions"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  title="Facebook"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#007848] text-white transition hover:-translate-y-0.5 hover:bg-[#008A52]"
                >
                  <span className="text-base font-black leading-none">f</span>
                </a>

                <a
                  href="https://whatsapp.com/channel/0029VazSemFFsn0ni3vxEO0t"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp Channel"
                  title="قناة واتساب"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#007848] text-white transition hover:-translate-y-0.5 hover:bg-[#008A52]"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20.5 11.7a8.5 8.5 0 0 1-12.7 7.4L3 20.5l1.4-4.7A8.5 8.5 0 1 1 20.5 11.7Z" />
                    <path d="M8.2 7.8c.3-.5.6-.5.9-.5h.5c.2 0 .4.1.5.4l.8 1.9c.1.3.1.5-.1.7l-.7.9c-.2.2-.1.4 0 .6.7 1.2 1.6 2.1 2.8 2.8.2.1.4.2.6 0l.9-1c.2-.2.4-.3.7-.2l2 .9c.3.1.4.3.4.5 0 .3-.1 1.5-.8 2.1-.6.6-1.5.9-2.5.6-1.3-.3-3.1-1-4.8-2.5-1.8-1.6-3-3.6-3.4-4.9-.4-1.1 0-2 .2-2.3Z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Left: navigation */}
            <div className="order-2 grid grid-cols-2 gap-x-5 gap-y-3 text-right sm:grid-cols-4 lg:order-3">
              <div>
                <h3 className="text-[11px] font-black text-[#007848]">اكتشف</h3>
                <div className="mt-1.5 space-y-1 text-[11px] text-[#007848]/50">
                  <Link href="/discover" className="block transition hover:text-[#C81035]">التجارب</Link>
                  <Link href="/discover" className="block transition hover:text-[#C81035]">المعالم</Link>
                  <Link href="/discover" className="block transition hover:text-[#C81035]">الفعاليات</Link>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-black text-[#007848]">كيف تعمل؟</h3>
                <div className="mt-1.5 space-y-1 text-[11px] text-[#007848]/50">
                  <a href="#how" className="block transition hover:text-[#C81035]">خطوات الاستخدام</a>
                  <a href="#rewards" className="block transition hover:text-[#C81035]">جمع النقاط</a>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-black text-[#007848]">المكافآت</h3>
                <div className="mt-1.5 space-y-1 text-[11px] text-[#007848]/50">
                  <Link href="/rewards" className="block transition hover:text-[#C81035]">برنامج المكافآت</Link>
                  <Link href="/missions" className="block transition hover:text-[#C81035]">المهمات</Link>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-black text-[#007848]">للشركاء</h3>
                <div className="mt-1.5 space-y-1 text-[11px] text-[#007848]/50">
                  <Link href="/partner/onboarding" className="block transition hover:text-[#C81035]">سجل كشريك</Link>
                  <Link href="/partner/dashboard" className="block transition hover:text-[#C81035]">لوحة الشريك</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Contact + legal row */}
          <div className="grid gap-1 border-b border-[#007848]/10 py-3 text-center sm:grid-cols-2 lg:grid-cols-5">
            <a
              href="mailto:info@areestravel.com"
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-2 transition hover:bg-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#007848]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m4 7 8 6 8-6" />
              </svg>
              <div>
                <p className="text-[9px] text-[#007848]/40">البريد الإلكتروني</p>
                <p dir="ltr" className="mt-0.5 text-[10px] font-black text-[#007848]">info@areestravel.com</p>
              </div>
            </a>

            <a
              href="tel:09999994350"
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-2 transition hover:bg-white"
              title="اتصل بأريس لوب السودان"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#007848] text-white">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20.5 11.7a8.5 8.5 0 0 1-12.7 7.4L3 20.5l1.4-4.7A8.5 8.5 0 1 1 20.5 11.7Z" />
                </svg>
              </span>
              <div>
                <p className="text-[9px] text-[#007848]/40">تواصل معنا</p>
                <p dir="ltr" className="mt-0.5 text-[10px] font-black text-[#007848]">09999994350</p>
                <p className="text-[8px] text-[#007848]/40">0999994250</p>
              </div>
            </a>

            <div className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C81035]/10 text-sm">🇸🇩</span>
              <div>
                <p className="text-[9px] text-[#007848]/40">السوق</p>
                <p className="mt-0.5 text-[10px] font-black text-[#182028]">🇸🇩 السودان</p>
              </div>
            </div>

            <div className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-2 lg:col-span-2">
              <div className="h-7 w-1 rounded-full bg-gradient-to-b from-[#C81035] via-white to-[#007848]" />
              <div>
                <p className="text-[9px] text-[#007848]/40">أريس لوب السودان</p>
                <p className="mt-0.5 text-[10px] font-black text-[#182028]">اكتشف · احجز · جرّب</p>
              </div>
            </div>
          </div>
          {/* Bottom */}
          <div className="grid items-center gap-3 pt-3 md:grid-cols-3">
            <div className="text-center text-[9px] text-[#007848]/35 md:text-right">
              <p>© 2026 أريس لوب</p>
              <p className="mt-0.5">جميع الحقوق محفوظة</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[10px] font-bold text-[#007848]/60">
              <a href="#discover" className="transition hover:text-[#C81035]">اكتشف</a>
              <a href="#how" className="transition hover:text-[#C81035]">كيف تعمل؟</a>
              <a href="#rewards" className="transition hover:text-[#C81035]">المكافآت</a>
              <a href="#partners" className="transition hover:text-[#C81035]">للشركاء</a>
            <Link href="/privacy-policy" className="transition hover:text-[#C81035]">سياسة الخصوصية</Link>
<Link href="/terms" className="transition hover:text-[#C81035]">الشروط والأحكام</Link>
            </div>
            <div className="flex items-center justify-center gap-2 text-center md:justify-end md:text-left">
              <span className="text-[9px] text-[#007848]/40">
                إحدى منتجات شركة أريس للحلول المتكاملة المحدودة – السودان
              </span>
              <Image
                src="/Logo/arees-company-logo.png"
                alt="شركة أريس الحلول المتكاملة المحدودة"
                width={90}
                height={45}
                className="h-auto w-[42px] object-contain"
              />
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}