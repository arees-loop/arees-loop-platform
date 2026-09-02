"use client";

import Image from "next/image";
import { useState, type MouseEvent } from "react";

const experiences = [
  {
    image: "/Image/hero/experiences/alsafiya-museum.jpg",
    alt: "متحف وبستان الصافية",
    distance: "2.4 KM",
    badge: "تجربة موصى بها",
    icon: "📍",
    title: "متحف وبستان الصافية",
    description:
      "تجربة ثقافية تفاعلية تستكشف تاريخ المدينة المنورة وإرثها في بيئة عصرية.",
    duration: "60 دقيقة",
    points: "+750 نقطة",
    position: "object-center",
  },
  {
    image: "/Image/hero/experiences/seerah-museum.jpg",
    alt: "المعرض والمتحف الدولي للسيرة النبوية",
    distance: "3.2 KM",
    badge: "ثقافة وتراث",
    icon: "✦",
    title: "المعرض الدولي للسيرة النبوية",
    description:
      "تجربة معرفية تفاعلية تستعرض السيرة النبوية والحضارة الإسلامية بأسلوب حديث.",
    duration: "60 دقيقة",
    points: "+900 نقطة",
    position: "object-center",
  },
  {
    image: "/Image/hero/experiences/al-ghamamah-mosque.jpg",
    alt: "مسجد الغمامة",
    distance: "4.8 KM",
    badge: "معلم تاريخي",
    icon: "◆",
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
      "بإذنك، تحدد Arees Loop موقعك والوقت المتاح لك والتجارب الموجودة بالقرب منك.",
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
      "احجز التجربة، تحقق من زيارتك، واكسب نقاط Loop لاستخدامها في تجارب ومكافآت لاحقة.",
  },
];

export default function Home() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setMouse({ x, y });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f7f2] text-[#082d24]">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        className="relative min-h-screen overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMouse({ x: 0, y: 0 })}
      >
        {/* Hero Background */}
        <div className="absolute inset-0">
          <Image
            src="/Image/hero/saudi-panorama-hero.jpg"
            alt="Arees Loop Saudi Tourism Panorama"
            fill
            priority
            className="object-cover transition-transform duration-700 ease-out"
            style={{
              transform: `scale(1.08) translate(${mouse.x * -18}px, ${
                mouse.y * -10
              }px)`,
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-l from-[#062f27]/35 via-[#062f27]/12 to-black/5" />
        </div>

        {/* Decorative glows */}
        <div className="absolute -left-24 top-44 h-72 w-72 rounded-full bg-[#c79b2b]/10 blur-3xl" />

        <div className="absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-[#006c52]/10 blur-3xl" />

        {/* =====================================================
            NAVBAR
        ====================================================== */}

        <header className="relative z-30 px-5 pt-5 md:px-10">
          <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-[26px] border border-white/35 bg-white/[0.10] px-5 py-2 shadow-[0_12px_35px_rgba(0,0,0,0.10),inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-[4px] backdrop-saturate-150 md:px-8">
            {/* Logo */}
           <div className="flex flex-col items-end text-right">
              <Image
                src="/Logo/arees-loop-logo.png"
                alt="Arees Loop"
                width={240}
                height={120}
                priority
                className="h-auto w-[125px] origin-left scale-[1.35] md:w-[145px]"
              />
            </div>

            {/* Desktop menu */}
            <div className="hidden items-center gap-12 text-sm font-semibold text-white md:flex">
              <a
                href="#discover"
                className="transition duration-300 hover:text-[#e5b83f]"
              >
                اكتشف
              </a>

              <a
                href="#how"
                className="transition duration-300 hover:text-[#e5b83f]"
              >
                كيف تعمل؟
              </a>

              <a
                href="#rewards"
                className="transition duration-300 hover:text-[#e5b83f]"
              >
                المكافآت
              </a>

              <a
                href="#partners"
                className="transition duration-300 hover:text-[#e5b83f]"
              >
                للشركاء
              </a>
            </div>

            {/* Action */}
            <a
              href="#discover"
              className="rounded-full bg-[#063c30] px-5 py-3 text-sm font-bold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-[#0a513f]"
            >
              ابدأ التجربة
            </a>
          </nav>
        </header>

        {/* =====================================================
            HERO CONTENT
        ====================================================== */}

        <div
          dir="rtl"
          className="relative z-10 mx-auto grid min-h-[calc(100vh-90px)] max-w-7xl items-center gap-12 px-6 py-6 transition-transform duration-700 ease-out lg:grid-cols-2 lg:px-10"
          style={{
            transform: `translate(${mouse.x * 8}px, ${mouse.y * 5}px)`,
          }}
        >
          {/* Hero Text */}
          <div>
            <p className="mb-5 text-sm font-bold tracking-[0.15em] text-white/80">
              SMART VISITOR EXPERIENCE
            </p>

            <h1 className="text-5xl font-black leading-[1.2] tracking-tight text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.38)] md:text-7xl">
              اكتشف ما
              <span className="block text-[#e5b83f] drop-shadow-[0_3px_10px_rgba(0,0,0,0.32)]">
                حولك الآن
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg font-medium leading-9 text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] md:text-xl">
              Arees Loop يحوّل موقعك ووقتك واهتماماتك إلى تجارب سياحية
              ذكية، قابلة للحجز والقياس والمكافأة.
            </p>

            {/* Hero buttons */}
            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#discover"
                className="rounded-full bg-[#063c30] px-8 py-4 font-bold text-white shadow-[0_15px_35px_rgba(6,60,48,0.25)] transition duration-300 hover:-translate-y-1 hover:bg-[#0a513f]"
              >
                اكتشف التجارب القريبة
              </a>

              <a
                href="#how"
                className="rounded-full border border-white/40 bg-white/65 px-8 py-4 font-bold text-[#063c30] shadow-sm backdrop-blur-xl transition duration-300 hover:bg-white"
              >
                كيف تعمل المنصة؟
              </a>
            </div>

            {/* Benefits */}
            <div className="mt-10 flex flex-wrap gap-7 text-sm font-semibold text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
              <span>📍 تجارب حسب موقعك</span>
              <span>✦ توصيات ذكية</span>
              <span>◆ مكافآت Loop</span>
            </div>
          </div>

          {/* =====================================================
              HERO GLASS CARD
          ====================================================== */}

          <div
            className="relative mx-auto w-full max-w-[520px] transition-transform duration-500 ease-out"
            style={{
              transform: `translate(${mouse.x * -6}px, ${mouse.y * -4}px)`,
            }}
          >
            <div className="relative overflow-hidden rounded-[38px] border border-white/35 bg-white/[0.025] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-[2px]">
              {/* Glass reflection */}
              <div
                className="pointer-events-none absolute inset-0 z-0 opacity-40"
                style={{
                  background: `radial-gradient(
                    circle at ${50 + mouse.x * 35}% ${40 + mouse.y * 30}%,
                    rgba(255,255,255,0.18) 0%,
                    rgba(255,255,255,0.06) 18%,
                    transparent 42%
                  )`,
                }}
              />

              {/* Moving glass edge */}
              <div
                className="pointer-events-none absolute inset-0 z-10 rounded-[38px] p-[1px] opacity-60"
                style={{
                  background: `linear-gradient(
                    ${110 + mouse.x * 25}deg,
                    rgba(255,255,255,0.65),
                    rgba(255,255,255,0.08) 30%,
                    rgba(13,59,52,0.18) 65%,
                    rgba(255,255,255,0.35)
                  )`,
                  WebkitMask:
                    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
              />

              <div className="relative z-20 rounded-[30px] border border-white/20 bg-transparent p-[1px]">
                <div className="relative overflow-hidden rounded-[29px] bg-[#063c30]/[0.06] p-7 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/90">
                        SMART DISCOVERY
                      </p>

                      <h2 className="mt-3 text-3xl font-black">
                        تجربة قريبة منك
                      </h2>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-2xl backdrop-blur-lg">
                      ✦
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="mt-8 rounded-[26px] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#e4bd54] px-3 py-1 text-xs font-black text-[#17372d]">
                        3.2 KM
                      </span>

                      <span className="text-sm text-white/70">
                        مقترح بالذكاء الاصطناعي
                      </span>
                    </div>

                    <h3 className="mt-5 text-2xl font-bold">
                      تجربة سعودية مميزة
                    </h3>

                    <p className="mt-3 leading-7 text-white/70">
                      تجربة مختارة بناءً على موقعك الحالي واهتماماتك والوقت
                      المتاح لديك.
                    </p>

                    {/* Stats */}
                    <div className="mt-6 grid grid-cols-3 gap-3">
                      <div className="rounded-2xl bg-black/15 p-3 text-center">
                        <p className="text-xs text-white/55">المدة</p>
                        <p className="mt-1 font-bold">45 دقيقة</p>
                      </div>

                      <div className="rounded-2xl bg-black/15 p-3 text-center">
                        <p className="text-xs text-white/55">المكافأة</p>

                        <p className="mt-1 font-bold text-[#e6c262]">
                          +750
                        </p>
                      </div>

                      <div className="rounded-2xl bg-black/15 p-3 text-center">
                        <p className="text-xs text-white/55">الحالة</p>

                        <p className="mt-1 font-bold">متاح الآن</p>
                      </div>
                    </div>

                    <a
                      href="#discover"
                      className="mt-6 block w-full rounded-2xl border border-white/25 bg-[#0D3B34]/75 py-4 text-center font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e5b83f]/60 hover:bg-[#0D3B34]/90 hover:shadow-[0_10px_30px_rgba(13,59,52,0.28)]"
                    >
                      اكتشف الآن
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Reward */}
            <div className="absolute -bottom-6 -left-5 hidden rounded-3xl border border-white/35 bg-[#0D3B34]/10 p-4 shadow-[0_12px_35px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.40)] backdrop-blur-[3px] backdrop-saturate-150 md:block">
              <p className="text-xs font-bold tracking-[0.14em] text-white/85">
                LOOP REWARD
              </p>

              <p className="mt-1 text-xl font-black text-[#e5b83f] drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)]">
                +750 نقطة
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          DISCOVER EXPERIENCES
      ====================================================== */}

      <section
        id="discover"
        className="relative bg-[#f7f7f2] px-6 py-24 md:px-10"
      >
        <div className="mx-auto max-w-7xl">
          {/* Heading */}
          <div dir="rtl" className="mb-12 text-right">
            <p className="text-sm font-bold tracking-[0.18em] text-[#0D3B34]/60">
              DISCOVER NEARBY
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
                className="group relative overflow-hidden rounded-[30px] border border-[#0D3B34]/10 bg-white p-6 shadow-[0_18px_45px_rgba(13,59,52,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(13,59,52,0.14)]"
              >
                {/* Image */}
                <div className="relative mb-5 h-48 overflow-hidden rounded-[22px]">
                  <Image
                    src={experience.image}
                    alt={experience.alt}
                    fill
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

                    <span className="text-2xl drop-shadow-md">
                      {experience.icon}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-black leading-9 text-[#0D3B34]">
                  {experience.title}
                </h3>

                <p className="mt-3 min-h-[84px] leading-7 text-[#0D3B34]/65">
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
                <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0D3B34] py-3.5 font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#145347] hover:shadow-[0_10px_25px_rgba(13,59,52,0.20)]">
                  عرض التجربة

                  <span className="text-lg">←</span>
                </button>
              </article>
            ))}
          </div>

          {/* Discover more */}
          <div className="mt-12 flex justify-center">
            <button className="rounded-full border border-[#0D3B34]/15 bg-white px-8 py-4 font-bold text-[#0D3B34] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D4AF37]/50 hover:shadow-md">
              استكشف المزيد من التجارب
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}

      <section
        id="how"
        className="relative overflow-hidden bg-white px-6 py-24 md:px-10"
      >
        <div className="absolute right-[-160px] top-[-160px] h-[420px] w-[420px] rounded-full bg-[#0D3B34]/[0.035] blur-3xl" />

        <div className="mx-auto max-w-7xl">
          <div dir="rtl" className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold tracking-[0.18em] text-[#D4AF37]">
              HOW AREES LOOP WORKS
            </p>

            <h2 className="mt-3 text-4xl font-black text-[#0D3B34] md:text-5xl">
              من موقعك إلى تجربة حقيقية
            </h2>

            <p className="mt-5 text-lg leading-8 text-[#0D3B34]/65">
              Arees Loop لا تنتظر منك البحث فقط، بل تفهم سياقك وتساعدك على
              اكتشاف ما يستحق التجربة حولك.
            </p>
          </div>

          {/* Steps */}
          <div
            dir="rtl"
            className="relative mt-16 grid gap-6 text-right md:grid-cols-3"
          >
            {steps.map((step) => (
              <div
                key={step.number}
                className="group relative rounded-[30px] border border-[#0D3B34]/10 bg-[#f9faf7] p-8 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_20px_55px_rgba(13,59,52,0.08)]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0D3B34] text-2xl text-white shadow-[0_10px_25px_rgba(13,59,52,0.16)]">
                    {step.icon}
                  </div>

                  <span className="text-4xl font-black text-[#0D3B34]/[0.08]">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-7 text-2xl font-black text-[#0D3B34]">
                  {step.title}
                </h3>

                <p className="mt-4 leading-8 text-[#0D3B34]/65">
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
            <span className="rounded-full bg-[#0D3B34]/[0.06] px-5 py-3">
              LOCATE
            </span>

            <span>←</span>

            <span className="rounded-full bg-[#0D3B34]/[0.06] px-5 py-3">
              DISCOVER
            </span>

            <span>←</span>

            <span className="rounded-full bg-[#0D3B34]/[0.06] px-5 py-3">
              BOOK
            </span>

            <span>←</span>

            <span className="rounded-full bg-[#D4AF37]/[0.12] px-5 py-3 text-[#9A741B]">
              REWARD
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          LOOP REWARDS
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
              LOOP REWARDS
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              كل تجربة تفتح لك
              <span className="block text-[#e5b83f]">التجربة التالية</span>
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-9 text-white/70">
              اجمع نقاط Loop من زياراتك وتجاربك المؤهلة، واستخدمها للحصول على
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
                      LOOP WALLET
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
              AREES LOOP BUSINESS
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

            <button className="mt-9 rounded-full bg-[#0D3B34] px-8 py-4 font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#145347] hover:shadow-[0_12px_30px_rgba(13,59,52,0.20)]">
              انضم كشريك
            </button>
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
                      CAMPAIGN PERFORMANCE
                    </p>

                    <p className="mt-2 text-2xl font-black">
                      أداء تجربة اليوم
                    </p>
                  </div>

                  <span className="rounded-full bg-[#D4AF37]/15 px-4 py-2 text-sm font-bold text-[#e5b83f]">
                    LIVE
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

      <section className="bg-white px-6 py-20 md:px-10">
        <div
          dir="rtl"
          className="mx-auto max-w-5xl text-center"
        >
          <Image
            src="/Logo/arees-loop-logo.png"
            alt="Arees Loop"
            width={190}
            height={95}
            className="mx-auto h-auto w-[160px]"
          />

          <h2 className="mt-8 text-4xl font-black text-[#0D3B34] md:text-5xl">
            مدينتك مليئة بالتجارب
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#0D3B34]/65">
            Arees Loop تساعدك على اكتشاف التجربة المناسبة في اللحظة المناسبة.
          </p>

          <a
            href="#discover"
            className="mt-8 inline-flex rounded-full bg-[#0D3B34] px-9 py-4 font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#145347] hover:shadow-[0_12px_30px_rgba(13,59,52,0.20)]"
          >
            ابدأ الاستكشاف
          </a>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-[#0D3B34]/10 bg-[#f7f7f2] px-6 py-10 md:px-10">
        <div
          dir="rtl"
          className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-7 text-center md:flex-row md:text-right"
        >
          <div>
           <Image
  src="/Logo/arees-loop-logo.png"
  alt="Arees Loop"
  width={220}
  height={110}
  className="h-auto w-[175px]"
/>

<p className="mt-3 text-sm text-[#0D3B34]/55">
  منصة تجربة الزائر الذكية
</p>

<div dir="rtl" className="mt-3 flex items-center justify-end gap-3">
  <Image
    src="/Logo/arees-company-logo.png"
    alt="شركة أريس الحلول المتكاملة المحدودة"
    width={90}
    height={45}
    className="h-auto w-[55px] object-contain"
  />

  <span className="text-xs text-[#0D3B34]/45">
    إحدى منتجات شركة أريس الحلول المتكاملة المحدودة
  </span>
</div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-[#0D3B34]/70">
            <a href="#discover" className="transition hover:text-[#D4AF37]">
              اكتشف
            </a>

            <a href="#how" className="transition hover:text-[#D4AF37]">
              كيف تعمل؟
            </a>

            <a href="#rewards" className="transition hover:text-[#D4AF37]">
              المكافآت
            </a>

            <a href="#partners" className="transition hover:text-[#D4AF37]">
              للشركاء
            </a>
          </div>

          <p className="text-sm text-[#0D3B34]/45">
            © 2026 Arees Loop
          </p>
        </div>
      </footer>
    </main>
  );
}