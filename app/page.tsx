
"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState, type MouseEvent, type TouchEvent, type WheelEvent } from "react";

const experiences = [
  {
    id: 1,
    image: "/Image/hero/experiences/alsafiya-museum.jpg",
    alt: "متحف وبستان الصافية",
    distance: "2.4 كم",
    badge: "تجربة موصى بها",
    icon: "location",
    title: "متحف وبستان الصافية",
    description:
      "تجربة ثقافية تفاعلية تستكشف تاريخ المدينة المنورة وإرثها في بيئة عصرية.",
    duration: "60 دقيقة",
    points: "+750 نقطة",
    position: "object-center",
  },
  {
    id: 2,
    image: "/Image/hero/experiences/seerah-museum.jpg",
    alt: "المعرض والمتحف الدولي للسيرة النبوية",
    distance: "3.2 كم",
    badge: "ثقافة وتراث",
    icon: null,
    title: "المعرض الدولي للسيرة النبوية",
    description:
      "تجربة معرفية تفاعلية تستعرض السيرة النبوية والحضارة الإسلامية بأسلوب حديث.",
    duration: "60 دقيقة",
    points: "+900 نقطة",
    position: "object-center",
  },
  {
    id: 3,
    image: "/Image/hero/experiences/al-ghamamah-mosque.jpg",
    alt: "مسجد الغمامة",
    distance: "4.8 كم",
    badge: "معلم تاريخي",
    icon: null,
    title: "مسجد الغمامة",
    description:
      "اكتشف أحد المعالم التاريخية البارزة في قلب المدينة المنورة ضمن تجربة قريبة.",
    duration: "30 دقيقة",
    points: "+500 نقطة",
    position: "object-center",
  },
];

const steps = [
  {
    number: "01",
    icon: "⌖",
    title: "نكتشف موقعك",
    description:
      "بإذنك، تحدد أريس لوب موقعك والوقت المتاح لك والتجارب الموجودة بالقرب منك.",
  },
  {
    number: "02",
    icon: "✦",
    title: "نفهم ما يناسبك",
    description:
      "الذكاء الاصطناعي يرتب التجارب حسب اهتماماتك، المسافة، الوقت والسياق الحالي.",
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
    id: "saudi",
    nameAr: "السعودية",
    nameEn: "Saudi Arabia",
    eyebrowAr: "بوابة أريس لوب",
    eyebrowEn: "AREES LOOP GATEWAY",
    titleAr: "كل اتجاه يحكي قصة",
    titleEn: "Every direction tells a story",
    descriptionAr:
      "ابدأ من الصورة الأكبر، ثم مرّر داخل أريس لوب لتكتشف المدن والتجارب التي تناسب موقعك ووقتك واهتماماتك.",
    descriptionEn:
      "Start with the bigger picture, then move through AREES Loop to discover destinations and experiences that match your location, time and interests.",
    image: "/Image/hero/saudi-panorama-hero.jpg",
    coords: null,
    metaAr: "السعودية حولك",
    metaEn: "Saudi around you",
    detailAr: "وجهات · تجارب · مهمات",
    detailEn: "Destinations · Experiences · Missions",
  },
  {
    id: "medina",
    nameAr: "المدينة المنورة",
    nameEn: "Al Madinah",
    eyebrowAr: "أنت تستكشف الآن",
    eyebrowEn: "YOU ARE EXPLORING",
    titleAr: "المدينة أقرب مما تتخيل",
    titleEn: "Madinah is closer than you think",
    descriptionAr:
      "من السيرة والتاريخ إلى المتاحف والتجارب القريبة؛ أريس لوب تربط المكان بما يمكنك فعله الآن.",
    descriptionEn:
      "From Seerah and history to museums and nearby experiences, AREES Loop connects the place with what you can do now.",
    image: "/Image/destinations/medina-hero.webp",
    coords: { lat: 24.4672, lng: 39.6111 },
    metaAr: "تجارب قريبة",
    metaEn: "Nearby experiences",
    detailAr: "ثقافة · تاريخ · إيمان",
    detailEn: "Culture · History · Faith",
  },
  {
    id: "jeddah",
    nameAr: "جدة",
    nameEn: "Jeddah",
    eyebrowAr: "حلقة جديدة",
    eyebrowEn: "A NEW LOOP",
    titleAr: "البحر يفتح تجربة مختلفة",
    titleEn: "The sea opens a different experience",
    descriptionAr:
      "كورنيش، فن، مطاعم وتجارب بحرية؛ اكتشف ما يناسب اللحظة بدل البحث الطويل.",
    descriptionEn:
      "Waterfront, art, dining and marine experiences—discover what fits the moment instead of searching endlessly.",
    image: "/Image/destinations/jeddah-hero.webp",
    coords: { lat: 21.5433, lng: 39.1728 },
    metaAr: "على البحر",
    metaEn: "By the Red Sea",
    detailAr: "بحر · فن · تجارب",
    detailEn: "Sea · Art · Experiences",
  },
  {
    id: "makkah",
    nameAr: "مكة المكرمة",
    nameEn: "Makkah",
    eyebrowAr: "داخل أريس لوب",
    eyebrowEn: "INSIDE AREES LOOP",
    titleAr: "رحلة تبدأ من المعنى",
    titleEn: "A journey that starts with meaning",
    descriptionAr:
      "أريس لوب تساعدك على اكتشاف التجارب والخدمات المناسبة حول رحلتك في مكة بطريقة أذكى وأقرب.",
    descriptionEn:
      "AREES Loop helps you discover relevant experiences and services around your journey in Makkah, intelligently and nearby.",
    image: "/Image/destinations/makkah-hero.webp",
    coords: { lat: 21.4225, lng: 39.8262 },
    metaAr: "حول رحلتك",
    metaEn: "Around your journey",
    detailAr: "روحانية · تاريخ · خدمة",
    detailEn: "Spirituality · History · Service",
  },

  {
    eyebrowAr: "العلا",
    eyebrowEn: "ALULA",
    titleAr: "حكايات محفورة في الصخر",
    titleEn: "Stories carved in stone",
    descriptionAr:
      "اكتشف العلا من موقعك، ثم دع أريس لوب يقودك إلى التجارب والمهام القريبة.",
    descriptionEn:
      "Discover AlUla from where you are, then let AREES Loop lead you to nearby experiences and missions.",
    image: "/Image/destinations/alula-hero.webp",
    coords: { lat: 26.6084, lng: 37.9232 },
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
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [activeScene, setActiveScene] = useState(0);
  const [locationReady, setLocationReady] = useState(false);
  const [showLocationNotice, setShowLocationNotice] = useState(false);
  const [detectedLocationScene, setDetectedLocationScene] = useState<(typeof heroScenes)[number] | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [heroLanguage, setHeroLanguage] = useState<"ar" | "en">("ar");
  const wheelLocked = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const touchLocked = useRef(false);

  const currentScene = heroScenes[activeScene];
  const isArabic = heroLanguage === "ar";
  const isLastScene = activeScene === heroScenes.length - 1;
  const nearbyDiscoverHref = userCoords
    ? `/discover?lat=${userCoords.lat.toFixed(6)}&lng=${userCoords.lng.toFixed(6)}&source=location`
    : "/discover";

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocationReady(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserCoords({
          lat: coords.latitude,
          lng: coords.longitude,
        });

        let nearestIndex = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;

        heroScenes.forEach((scene, index) => {
          if (!scene.coords) return;

          const distance = distanceKm(
            coords.latitude,
            coords.longitude,
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
          window.setTimeout(() => setShowLocationNotice(true), 650);
        } else {
          setActiveScene(0);
        }

        setLocationReady(true);
      },
      () => {
        setActiveScene(0);
        setLocationReady(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60 * 1000,
      },
    );
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
    <main className="min-h-screen overflow-hidden bg-[#f7f7f2] text-[#082d24]">
      <section
        className="relative min-h-screen overflow-hidden bg-[#071713]"
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

          <div className="absolute inset-0 bg-gradient-to-r from-black/34 via-black/5 to-[#062f27]/16" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#041713]/44 via-transparent to-black/10" />
        </div>

        <header className="relative z-40 px-4 pt-1 md:px-8 md:pt-1">
          <nav className="mx-auto flex h-[92px] max-w-[1450px] items-center justify-between gap-3 rounded-[24px] border border-white/35 bg-white/[0.055] px-4 py-0 shadow-[0_12px_34px_rgba(0,0,0,0.13),inset_0_1px_0_rgba(255,255,255,0.58)] backdrop-blur-[10px] backdrop-saturate-150 md:h-[96px] md:px-6">
            <Image
              src="/Logo/arees-loop-logo.png"
              alt="Arees Loop"
              width={240}
              height={120}
              priority
              className="h-auto w-[142px] md:w-[166px]"
            />

            <div
              dir="rtl"
              className="hidden items-center gap-8 text-[13px] font-bold text-white/95 lg:flex xl:gap-10"
            >
              <a href="#discover" className="transition hover:text-[#e6bd4b]">اكتشف</a>
              <a href="#how" className="transition hover:text-[#e6bd4b]">كيف تعمل؟</a>
              <a href="#rewards" className="transition hover:text-[#e6bd4b]">المكافآت</a>
              <a href="#partners" className="transition hover:text-[#e6bd4b]">للشركاء</a>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-full border border-white/30 bg-white/[0.05] p-1 text-[11px] font-black text-white backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => setHeroLanguage("ar")}
                  className={`rounded-full px-2.5 py-2 transition ${
                    heroLanguage === "ar"
                      ? "bg-white text-[#0D3B34]"
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
                      ? "bg-white text-[#0D3B34]"
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
                className="rounded-full bg-[#0D3B34]/90 px-4 py-2.5 text-xs font-black text-white shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-[#145347] md:px-5"
              >
                ابدأ التجربة
              </Link>
            </div>
          </nav>
        </header>

        {showLocationNotice && detectedLocationScene && (
          <div
            dir={isArabic ? "rtl" : "ltr"}
            className="absolute left-1/2 top-[112px] z-[70] w-[calc(100%-32px)] max-w-[520px] -translate-x-1/2 px-2 md:top-[116px]"
          >
            <div className="relative overflow-hidden rounded-[24px] border border-white/45 bg-[#0B342D]/62 px-5 py-4 text-white shadow-[0_18px_55px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-[14px] backdrop-saturate-150">
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
                <div className="flex h-11 w-11 shrink-0 animate-bounce items-center justify-center rounded-2xl border border-[#D4AF37]/55 bg-[#D4AF37]/14 text-[#F0D37D] shadow-[inset_0_1px_0_rgba(255,255,255,0.20)]">
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
                  <p className="text-[11px] font-black tracking-[0.12em] text-[#F0D37D]">
                    {isArabic ? "تم تحديد موقعك" : "LOCATION DETECTED"}
                  </p>

                  <p className="mt-1 text-base font-black md:text-lg">
                    {isArabic
                      ? `أنت الآن في ${detectedLocationScene.nameAr}`
                      : `You are now in ${detectedLocationScene.nameEn}`}
                  </p>

                  <p className="mt-1 text-xs leading-6 text-white/78 md:text-sm">
                    {isArabic
                      ? "استكشف تجارب ومهام قريبة من موقعك، مصممة لتناسب لحظتك الحالية."
                      : "Explore nearby experiences and missions selected around your current location."}
                  </p>
                </div>

                <Link
                  href={nearbyDiscoverHref}
                  className="hidden shrink-0 rounded-full bg-[#D4AF37] px-5 py-3 text-xs font-black text-[#10342C] shadow-[0_10px_28px_rgba(212,175,55,0.24)] transition hover:-translate-y-0.5 hover:bg-[#E6C45F] sm:inline-flex"
                >
                  {isArabic ? "اكتشف ما حولك" : "Explore nearby"}
                </Link>
              </div>

              <Link
                href={nearbyDiscoverHref}
                className="relative z-10 mt-3 flex w-full items-center justify-center rounded-full bg-[#D4AF37] px-5 py-3 text-xs font-black text-[#10342C] sm:hidden"
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
              <span className="h-px w-12 bg-[#e5b83f]" />
              <p className="text-xs font-black tracking-[0.16em] text-[#f2cf71]">
                {isArabic ? currentScene.eyebrowAr : currentScene.eyebrowEn}
              </p>
            </div>

            <p className="mb-2 text-sm font-bold text-white/78">
              {isArabic ? currentScene.nameAr : currentScene.nameEn}
            </p>

            <h1 className="max-w-3xl text-5xl font-black leading-[1.07] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.34)] md:text-7xl xl:text-[5.3rem]">
              {isArabic ? currentScene.titleAr : currentScene.titleEn}
            </h1>

            <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-white/82 drop-shadow-[0_2px_10px_rgba(0,0,0,0.28)] md:text-lg">
              {isArabic ? currentScene.descriptionAr : currentScene.descriptionEn}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/discover"
                className="rounded-full bg-[#D4AF37] px-7 py-3.5 text-sm font-black text-[#102e27] shadow-[0_15px_40px_rgba(212,175,55,0.20)] transition hover:-translate-y-1 hover:bg-[#e7c760]"
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

                      <h2 className="mt-2 text-3xl font-black drop-shadow-[0_2px_7px_rgba(0,0,0,0.24)]">
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

                    <p className="mt-7 text-2xl font-black">
                      {isArabic ? currentScene.detailAr : currentScene.detailEn}
                    </p>

                    <p className="mt-3 text-sm leading-7 text-white/82">
                      {isArabic
                        ? "أماكن وتجارب أقرب إلى لحظتك الحالية، مع حجز ومكافآت داخل أريس لوب."
                        : "Places and experiences closer to your current moment, with booking and rewards inside AREES Loop."}
                    </p>

                    <div className="mt-7 grid grid-cols-3 gap-2.5 text-center">
                      <Link
                        href="/discover"
                        className="rounded-2xl border border-white/40 bg-white/[0.055] px-2 py-3 text-xs font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] backdrop-blur-[1px] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D4AF37]/90 hover:bg-[#D4AF37] hover:text-[#0D3B34] hover:shadow-[0_0_24px_rgba(212,175,55,0.38),inset_0_1px_0_rgba(255,255,255,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/80"
                      >
                        {isArabic ? "اكتشف" : "Discover"}
                      </Link>

                      <Link
                        href="/bookings"
                        className="rounded-2xl border border-white/40 bg-white/[0.055] px-2 py-3 text-xs font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] backdrop-blur-[1px] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D4AF37]/90 hover:bg-[#D4AF37] hover:text-[#0D3B34] hover:shadow-[0_0_24px_rgba(212,175,55,0.38),inset_0_1px_0_rgba(255,255,255,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/80"
                      >
                        {isArabic ? "احجز" : "Book"}
                      </Link>

                      <Link
                        href="/rewards"
                        className="rounded-2xl border border-white/40 bg-white/[0.055] px-2 py-3 text-xs font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] backdrop-blur-[1px] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D4AF37]/90 hover:bg-[#D4AF37] hover:text-[#0D3B34] hover:shadow-[0_0_24px_rgba(212,175,55,0.38),inset_0_1px_0_rgba(255,255,255,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/80"
                      >
                        {isArabic ? "اكسب" : "Earn"}
                      </Link>
                    </div>
                  </div>

                  <Link
                    href="/discover"
                    className="mt-4 flex w-full items-center justify-between rounded-2xl border border-white/22 bg-[#07372f]/76 px-5 py-4 font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-[2px] transition hover:bg-[#0b493e]/86"
                  >
                    <span>{isArabic ? "ادخل التجربة" : "Enter experience"}</span>
                    <span className="text-[#e6c45f]">←</span>
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
                  ? "border-[#e6c45f]/80 bg-[#D4AF37] text-[#0D3B34] shadow-[0_0_24px_rgba(212,175,55,0.36)]"
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
        className="relative bg-[#f7f7f2] px-6 py-24 md:px-10"
      >
        <div className="mx-auto max-w-7xl">
          {/* Heading */}
          <div dir="rtl" className="mb-12 text-right">
            <p className="text-sm font-bold tracking-[0.18em] text-[#0D3B34]/60">
              اكتشف القريب منك
            </p>

            <h2 className="mt-3 text-4xl font-black text-[#0D3B34] md:text-5xl">
              اكتشف ما حولك
            </h2>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#0D3B34]/70">
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
                className="group relative flex h-full flex-col overflow-hidden rounded-[30px] border border-[#0D3B34]/10 bg-white p-6 shadow-[0_18px_45px_rgba(13,59,52,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(13,59,52,0.14)]"
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
                  <div className="absolute left-4 top-4 rounded-full border border-white/30 bg-[#0D3B34]/55 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                    {experience.distance}
                  </div>

                  {/* Badge */}
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
                    <span className="rounded-full border border-white/30 bg-black/15 px-3 py-1 text-xs font-bold backdrop-blur-md">
                      {experience.badge}
                    </span>

                    {experience.icon === "location" && (
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-[#0D3B34]/65 text-white shadow-sm backdrop-blur-md"
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
                <h3 className="text-2xl font-black leading-9 text-[#0D3B34]">
                  {experience.title}
                </h3>

                <p className="mt-3 flex-1 leading-7 text-[#0D3B34]/65">
                  {experience.description}
                </p>

                {/* Chips */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#0D3B34]/[0.07] px-4 py-2 text-sm font-bold text-[#0D3B34]">
                    ◷ {experience.duration}
                  </span>

                  <span className="rounded-full bg-[#D4AF37]/[0.12] px-4 py-2 text-sm font-bold text-[#9A741B]">
                    {experience.points}
                  </span>
                </div>

                {/* Button */}
                <Link
                  href={`/experience/${experience.id}`}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0D3B34] py-3.5 font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#145347] hover:shadow-[0_10px_25px_rgba(13,59,52,0.20)]"
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
              className="rounded-full border border-[#0D3B34]/15 bg-white px-8 py-4 font-bold text-[#0D3B34] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D4AF37]/50 hover:shadow-md"
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
          <div className="absolute inset-0 bg-[#FFF8EC]/[0.05]" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div dir="rtl" className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold tracking-[0.18em] text-[#D4AF37]">
              كيف تعمل أريس لوب؟
            </p>

            <h2 className="mt-3 text-4xl font-black text-[#0D3B34] md:text-5xl">
              من موقعك إلى تجربة حقيقية
            </h2>

            <p className="mt-5 text-lg leading-8 text-[#0D3B34]/65">
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
                className="group relative overflow-hidden rounded-[34px] border-2 border-white/70 bg-white/[0.10] p-8 shadow-[0_18px_50px_rgba(64,44,20,0.10),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(255,255,255,0.35)] backdrop-blur-[10px] transition-all duration-500 ease-out hover:-translate-y-4 hover:scale-[1.025] hover:border-[#D4AF37]/80 hover:bg-white/[0.18] hover:shadow-[0_30px_75px_rgba(111,78,18,0.22),0_0_34px_rgba(212,175,55,0.28),inset_0_1px_0_rgba(255,255,255,1)]"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/65 via-white/18 to-transparent" />
                <div className="pointer-events-none absolute -right-12 -top-10 h-28 w-28 rounded-full bg-[#D4AF37]/14 blur-2xl transition-all duration-300 group-hover:bg-[#D4AF37]/22" />

                <div className="relative flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white/75 bg-white/18 text-[#0D3B34]
                    shadow-[0_10px_28px_rgba(64,44,20,0.10),inset_0_1px_0_rgba(255,255,255,0.95)]
                    backdrop-blur-xl transition-all duration-500
                    group-hover:-translate-y-1 group-hover:border-[#D4AF37]/80
                    group-hover:bg-[#D4AF37]/16 group-hover:text-[#9A7010]
                    group-hover:shadow-[0_0_28px_rgba(212,175,55,0.42)]">
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

                  <span className="text-4xl font-black text-[#0D3B34]/[0.08]">
                    {step.number}
                  </span>
                </div>

                <h3 className="relative mt-7 text-2xl font-black text-[#0D3B34]">
                  {step.title}
                </h3>

                <p className="relative mt-4 leading-8 text-[#0D3B34]/65">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Flow line */}
          <div
            dir="rtl"
            className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-3 text-sm font-bold text-[#0D3B34]/65"
          >
            <span className="rounded-full px-5 py-3 border border-white/75 bg-white/24 text-[#0D3B34]/80 shadow-[0_8px_24px_rgba(64,44,20,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-[#D4AF37]/85 hover:bg-[#D4AF37] hover:text-white hover:shadow-[0_0_30px_rgba(212,175,55,0.48)]">
              حدد موقعك
            </span>

            <span>←</span>

            <span className="rounded-full px-5 py-3 border border-white/75 bg-white/24 text-[#0D3B34]/80 shadow-[0_8px_24px_rgba(64,44,20,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-[#D4AF37]/85 hover:bg-[#D4AF37] hover:text-white hover:shadow-[0_0_30px_rgba(212,175,55,0.48)]">
              اكتشف
            </span>

            <span>←</span>

            <span className="rounded-full px-5 py-3 border border-white/75 bg-white/24 text-[#0D3B34]/80 shadow-[0_8px_24px_rgba(64,44,20,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-[#D4AF37]/85 hover:bg-[#D4AF37] hover:text-white hover:shadow-[0_0_30px_rgba(212,175,55,0.48)]">
              احجز
            </span>

            <span>←</span>

            <span className="rounded-full px-5 py-3 border border-white/75 bg-white/24 text-[#0D3B34]/80 shadow-[0_8px_24px_rgba(64,44,20,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-[#D4AF37]/85 hover:bg-[#D4AF37] hover:text-white hover:shadow-[0_0_30px_rgba(212,175,55,0.48)]">
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
        className="relative overflow-hidden bg-[#0D3B34] px-6 py-24 text-white md:px-10"
      >
        <div className="absolute -left-24 top-8 h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-3xl" />

        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-white/[0.04] blur-3xl" />

        <div
          dir="rtl"
          className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2"
        >
          {/* Rewards Text */}
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-[#e5b83f]">
              مكافأة أريس لوبS
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              كل تجربة تفتح لك
              <span className="block text-[#e5b83f]">التجربة التالية</span>
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

              <span className="rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-5 py-3 text-sm font-bold text-[#e5b83f]">
                عروض ومهمات خاصة
              </span>
            </div>
          </div>

          {/* Wallet Card */}
          <div className="mx-auto w-full max-w-[520px]">
            <div className="relative overflow-hidden rounded-[34px] border border-white/20 bg-white/[0.07] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.20)] backdrop-blur-xl">
              <div className="absolute right-[-60px] top-[-80px] h-52 w-52 rounded-full bg-[#D4AF37]/20 blur-3xl" />

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
                    <p className="text-5xl font-black text-[#e5b83f]">
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

                    <span className="font-black text-[#e5b83f]">
                      +750 نقطة
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[72%] rounded-full bg-[#D4AF37]" />
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
          PARTNERS
      ====================================================== */}

      <section
        id="partners"
        className="relative bg-[#f7f7f2] px-6 py-24 md:px-10"
      >
        <div
          dir="rtl"
          className="mx-auto grid max-w-7xl overflow-hidden rounded-[38px] border border-[#0D3B34]/10 bg-white shadow-[0_25px_80px_rgba(13,59,52,0.08)] lg:grid-cols-[1.1fr_0.9fr]"
        >
          {/* Partner content */}
          <div className="p-8 text-right md:p-14">
            <p className="text-sm font-bold tracking-[0.18em] text-[#D4AF37]">
              أريس لوب للأعمال
            </p>

            <h2 className="mt-4 max-w-2xl text-4xl font-black leading-tight text-[#0D3B34] md:text-5xl">
              حوّل الزوار القريبين
              <span className="block">إلى زيارات قابلة للقياس</span>
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-9 text-[#0D3B34]/65">
              للمتاحف والمعالم ومقدمي التجارب والمنشآت السياحية: اعرض تجربتك،
              أطلق مهمات ذكية، واستهدف الزوار المناسبين بالقرب منك.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#0D3B34]/[0.05] px-5 py-4 font-bold text-[#0D3B34]">
                ✓ إدارة التجارب والحجوزات
              </div>

              <div className="rounded-2xl bg-[#0D3B34]/[0.05] px-5 py-4 font-bold text-[#0D3B34]">
                ✓ حملات حسب الموقع
              </div>

              <div className="rounded-2xl bg-[#0D3B34]/[0.05] px-5 py-4 font-bold text-[#0D3B34]">
                ✓ قياس الزيارات والتحويل
              </div>

              <div className="rounded-2xl bg-[#0D3B34]/[0.05] px-5 py-4 font-bold text-[#0D3B34]">
                ✓ مكافآت ومهمات ذكية
              </div>
            </div>

            <Link
              href="/partner/onboarding"
              className="mt-9 inline-flex rounded-full bg-[#0D3B34] px-8 py-4 font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#145347] hover:shadow-[0_12px_30px_rgba(13,59,52,0.20)]"
            >
              انضم كشريك
            </Link>
          </div>

          {/* Partner visual */}
          <div className="relative min-h-[400px] overflow-hidden bg-[#0D3B34] p-8 md:p-12">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#D4AF37]/15 blur-3xl" />

            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/[0.06] blur-3xl" />

            <div className="relative flex h-full items-center">
              <div className="w-full rounded-[30px] border border-white/20 bg-white/[0.07] p-6 text-white backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold tracking-[0.16em] text-white/55">
                      أداء الحملة
                    </p>

                    <p className="mt-2 text-2xl font-black">
                      أداء تجربة اليوم
                    </p>
                  </div>

                  <span className="rounded-full bg-[#D4AF37]/15 px-4 py-2 text-sm font-bold text-[#e5b83f]">
                    مباشر
                  </span>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-black/10 p-5">
                    <p className="text-sm text-white/50">
                      تم الوصول إليهم
                    </p>

                    <p className="mt-2 text-3xl font-black">
                      1,284
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/10 p-5">
                    <p className="text-sm text-white/50">
                      الحجوزات
                    </p>

                    <p className="mt-2 text-3xl font-black text-[#e5b83f]">
                      126
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/10 p-5">
                    <p className="text-sm text-white/50">
                      زيارات مؤكدة
                    </p>

                    <p className="mt-2 text-3xl font-black">
                      104
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/10 p-5">
                    <p className="text-sm text-white/50">
                      معدل التحويل
                    </p>

                    <p className="mt-2 text-3xl font-black text-[#e5b83f]">
                      9.8%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="relative overflow-hidden border-y border-[#0D3B34]/10 px-6 py-20 md:px-10">
        {/* خلفية تراثية سعودية هادئة */}
        <div className="absolute inset-0">
          <Image
            src="/Image/hero/saudi-heritage-collage-bg.png"
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

          <h2 className="mt-8 text-4xl font-black text-[#0D3B34] drop-shadow-[0_1px_0_rgba(255,255,255,0.75)] md:text-5xl">
            مدينتك مليئة بالتجارب
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-8 text-[#0D3B34]/70">
            أريس لوب تساعدك على اكتشاف التجربة المناسبة في اللحظة المناسبة.
          </p>

          <Link
            href="/auth"
            className="mt-8 inline-flex rounded-full bg-[#0D3B34] px-9 py-4 font-bold text-white shadow-[0_12px_30px_rgba(13,59,52,0.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#145347] hover:shadow-[0_16px_34px_rgba(13,59,52,0.24)]"
          >
            ابدأ الاستكشاف
          </Link>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-[#0D3B34]/10 bg-[#f7f7f2] px-6 pb-4 pt-4 md:px-10">
        <div dir="rtl" className="mx-auto max-w-7xl">
          {/* Top row: app / centered brand / navigation */}
          <div className="grid items-center gap-5 border-b border-[#0D3B34]/10 pb-4 lg:grid-cols-[1fr_0.9fr_1fr]">
            {/* Right: app download placeholders */}
            <div className="order-3 flex justify-center lg:order-1 lg:justify-start">
              <div className="text-center">
                <p className="text-xs font-black text-[#0D3B34]">
                  حمّل التطبيق
                </p>

                <div className="mt-2 flex flex-wrap justify-center gap-2 lg:justify-start" dir="ltr">
                  <div
                    aria-label="متجر آبل قريبًا"
                    title="قريبًا"
                    className="flex min-w-[138px] cursor-default items-center gap-2 rounded-xl border border-[#0D3B34]/12 bg-white px-3 py-2 shadow-sm"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 shrink-0 text-[#0D3B34]"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M16.7 12.9c0-2.5 2.1-3.7 2.2-3.8-1.2-1.8-3.1-2-3.8-2-1.6-.2-3.2 1-4 1-0.9 0-2.2-1-3.6-.9-1.9 0-3.6 1.1-4.6 2.8-2 3.4-.5 8.5 1.4 11.3.9 1.4 2 2.9 3.5 2.8 1.4-.1 1.9-.9 3.6-.9 1.7 0 2.2.9 3.7.9 1.5 0 2.5-1.4 3.4-2.8 1.1-1.6 1.5-3.1 1.5-3.2-.1 0-3.3-1.3-3.3-5.2Zm-2.7-7.5c.8-1 1.4-2.4 1.2-3.8-1.2.1-2.7.8-3.6 1.8-.8.9-1.5 2.3-1.3 3.6 1.4.1 2.8-.7 3.7-1.6Z" />
                    </svg>
                    <span className="text-left">
                      <span className="block text-[9px] uppercase tracking-wide text-[#0D3B34]/40">
                        متاح على
                      </span>
                      <span className="block text-xs font-black text-[#0D3B34]">
                        متجر آبل
                      </span>
                    </span>
                    <span className="ml-auto rounded-full bg-[#D4AF37]/12 px-2 py-0.5 text-[8px] font-bold text-[#9A741B]">
                      قريبًا
                    </span>
                  </div>

                  <div
                    aria-label="متجر جوجل قريبًا"
                    title="قريبًا"
                    className="flex min-w-[138px] cursor-default items-center gap-2 rounded-xl border border-[#0D3B34]/12 bg-white px-3 py-2 shadow-sm"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 text-[#0D3B34]"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M3.6 2.8c-.4.4-.6 1-.6 1.7v15c0 .7.2 1.3.6 1.7l.1.1 8.4-8.4v-.2L3.7 2.7l-.1.1Zm11.3 12.9-2.8-2.8v-.2l2.8-2.8.1.1 3.4 1.9c1 .6 1 1.5 0 2.1L15 15.8l-.1-.1ZM4.7 21.9l8.8-8.8 1.8 1.8-8.1 4.6c-.8.5-1.7.8-2.5 2.4Zm0-19.8c.8 1.6 1.7 1.9 2.5 2.4l8.1 4.6-1.8 1.8-8.8-8.8Z" />
                    </svg>
                    <span className="text-left">
                      <span className="block text-[9px] uppercase tracking-wide text-[#0D3B34]/40">
                        متاح على
                      </span>
                      <span className="block text-xs font-black text-[#0D3B34]">
                        متجر جوجل
                      </span>
                    </span>
                    <span className="ml-auto rounded-full bg-[#D4AF37]/12 px-2 py-0.5 text-[8px] font-bold text-[#9A741B]">
                      قريبًا
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="h-px w-8 bg-[#0D3B34]/20" />
                  <p className="text-[11px] font-black text-[#0D3B34]">
                    حلول متكاملة ... لرحلة أذكى
                  </p>
                  <span className="h-px w-8 bg-[#0D3B34]/20" />
                </div>

                <p className="mt-1 text-[10px] text-[#0D3B34]/40">
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

              <p className="mt-1.5 text-[11px] font-semibold text-[#0D3B34]/55">
                منصة تجربة الزائر الذكية
              </p>

              <p className="mt-1 text-[11px] font-bold text-[#0D3B34]/70">
                اكتشف · احجز · اجمع النقاط · عش التجربة
              </p>

              <div className="mt-2.5 flex items-center justify-center gap-2">
                <a
                  href="https://www.instagram.com/arees_travel_ksa?stkn=MWdqZDZzc2NiaGRheg="
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  title="Instagram"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0D3B34] text-white transition hover:-translate-y-0.5 hover:bg-[#145347]"
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
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0D3B34] text-white transition hover:-translate-y-0.5 hover:bg-[#145347]"
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
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0D3B34] text-white transition hover:-translate-y-0.5 hover:bg-[#145347]"
                >
                  <span className="text-base font-black leading-none">f</span>
                </a>

                <a
                  href="https://whatsapp.com/channel/0029VazSemFFsn0ni3vxEO0t"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp Channel"
                  title="قناة واتساب"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0D3B34] text-white transition hover:-translate-y-0.5 hover:bg-[#145347]"
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
                <h3 className="text-[11px] font-black text-[#0D3B34]">اكتشف</h3>
                <div className="mt-1.5 space-y-1 text-[11px] text-[#0D3B34]/50">
                  <Link href="/discover" className="block transition hover:text-[#D4AF37]">التجارب</Link>
                  <Link href="/discover" className="block transition hover:text-[#D4AF37]">المعالم</Link>
                  <Link href="/discover" className="block transition hover:text-[#D4AF37]">الفعاليات</Link>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-black text-[#0D3B34]">كيف تعمل؟</h3>
                <div className="mt-1.5 space-y-1 text-[11px] text-[#0D3B34]/50">
                  <a href="#how" className="block transition hover:text-[#D4AF37]">خطوات الاستخدام</a>
                  <a href="#rewards" className="block transition hover:text-[#D4AF37]">جمع النقاط</a>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-black text-[#0D3B34]">المكافآت</h3>
                <div className="mt-1.5 space-y-1 text-[11px] text-[#0D3B34]/50">
                  <Link href="/rewards" className="block transition hover:text-[#D4AF37]">برنامج المكافآت</Link>
                  <Link href="/missions" className="block transition hover:text-[#D4AF37]">المهمات</Link>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-black text-[#0D3B34]">للشركاء</h3>
                <div className="mt-1.5 space-y-1 text-[11px] text-[#0D3B34]/50">
                  <Link href="/partner/onboarding" className="block transition hover:text-[#D4AF37]">سجل كشريك</Link>
                  <Link href="/partner/dashboard" className="block transition hover:text-[#D4AF37]">لوحة الشريك</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Contact + legal row */}
          <div className="grid gap-1 border-b border-[#0D3B34]/10 py-3 text-center sm:grid-cols-2 lg:grid-cols-5">
            <a
              href="mailto:info@areeloop.com"
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-2 transition hover:bg-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#0D3B34]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m4 7 8 6 8-6" />
              </svg>
              <div>
                <p className="text-[9px] text-[#0D3B34]/40">البريد الإلكتروني</p>
                <p dir="ltr" className="mt-0.5 text-[10px] font-black text-[#0D3B34]">info@areeloop.com</p>
              </div>
            </a>

            <a
              href="https://wa.me/966580091220"
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-2 transition hover:bg-white"
              title="تواصل عبر واتساب أعمال"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0D3B34] text-white">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20.5 11.7a8.5 8.5 0 0 1-12.7 7.4L3 20.5l1.4-4.7A8.5 8.5 0 1 1 20.5 11.7Z" />
                </svg>
              </span>
              <div>
                <p className="text-[9px] text-[#0D3B34]/40">تواصل معنا</p>
                <p dir="ltr" className="mt-0.5 text-[10px] font-black text-[#0D3B34]">0580091220</p>
                <p className="text-[8px] text-[#0D3B34]/40">واتساب أعمال</p>
              </div>
            </a>

            <div className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-2">
              <img
                src="data:image/png;base64,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"
                alt="ضريبة القيمة المضافة"
                className="h-8 w-auto object-contain"
              />
              <div>
                <p className="text-[9px] text-[#0D3B34]/40">الرقم الضريبي</p>
                <p dir="ltr" className="mt-0.5 text-[10px] font-black text-[#0D3B34]">311897578200003</p>
              </div>
            </div>

            <div className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#0D3B34]" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                <rect x="5" y="3" width="14" height="18" rx="2" />
                <path d="M8 8h8M8 12h8M8 16h5" />
              </svg>
              <div>
                <p className="text-[9px] text-[#0D3B34]/40">السجل التجاري</p>
                <p dir="ltr" className="mt-0.5 text-[10px] font-black text-[#0D3B34]">7037003618</p>
              </div>
            </div>

            <div className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#0D3B34]" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                <circle cx="12" cy="9" r="5" />
                <path d="m9.5 13-2 8 4.5-2 4.5 2-2-8" />
              </svg>
              <div>
                <p className="text-[9px] text-[#0D3B34]/40">ترخيص وزارة السياحة</p>
                <p dir="ltr" className="mt-0.5 text-[10px] font-black text-[#0D3B34]">73104550</p>
                <p className="text-[8px] font-bold text-[#0D3B34]/55">فئة وكالة سفر وسياحة</p>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="grid items-center gap-3 pt-3 md:grid-cols-3">
            <div className="text-center text-[9px] text-[#0D3B34]/35 md:text-right">
              <p>© 2026 أريس لوب</p>
              <p className="mt-0.5">جميع الحقوق محفوظة</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[10px] font-bold text-[#0D3B34]/60">
              <a href="#discover" className="transition hover:text-[#D4AF37]">اكتشف</a>
              <a href="#how" className="transition hover:text-[#D4AF37]">كيف تعمل؟</a>
              <a href="#rewards" className="transition hover:text-[#D4AF37]">المكافآت</a>
              <a href="#partners" className="transition hover:text-[#D4AF37]">للشركاء</a>
            </div>

            <div className="flex items-center justify-center gap-2 text-center md:justify-end md:text-left">
              <span className="text-[9px] text-[#0D3B34]/40">
                إحدى منتجات شركة أريس الحلول المتكاملة المحدودة
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

          <div className="mt-6 flex justify-center">
            <div
              className="sbc-verify-seal"
              data-token="bHNZMFR6VHFRQ095M3RmMzcwbU02QTQ9"
              data-position="bottom-left"
            />
          </div>

          <Script
            src="https://eauthenticate.saudibusiness.gov.sa/EAuthSealApi/seal.js"
            strategy="afterInteractive"
          />
        </div>
      </footer>

    </main>
  );
}