import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const guides = [
  {
    id: 1,
    name: "أحمد السلمي",
    specialty: "السيرة والتاريخ الإسلامي",
    languages: ["العربية", "English"],
    distance: "1.4 كم",
    rating: "4.9",
    status: "متاح الآن",
    city: "المدينة المنورة",
    bio: "مرشد متخصص في السيرة النبوية والتاريخ الإسلامي، يقدم جولات تعريفية وثقافية تربط الزائر بالمكان وقصته وسياقه التاريخي.",
    experience: "6 سنوات خبرة",
    tours: "120+ جولة",
    verified: true,
    availability: "متاح اليوم",
  },
  {
    id: 2,
    name: "خالد الحربي",
    specialty: "التراث والثقافة المحلية",
    languages: ["العربية"],
    distance: "2.1 كم",
    rating: "4.8",
    status: "متاح اليوم",
    city: "المدينة المنورة",
    bio: "مرشد مهتم بالتراث المحلي والثقافة المدنية، يركز على الحكايات المرتبطة بالأحياء والمعالم والأسواق والتجارب المحلية.",
    experience: "5 سنوات خبرة",
    tours: "95+ جولة",
    verified: true,
    availability: "متاح اليوم",
  },
  {
    id: 3,
    name: "سارة الأنصاري",
    specialty: "جولات عائلية وثقافية",
    languages: ["العربية", "English"],
    distance: "3.2 كم",
    rating: "4.9",
    status: "متاحة اليوم",
    city: "المدينة المنورة",
    bio: "مرشدة تقدم جولات عائلية وثقافية بأسلوب مبسط وتفاعلي، مع اهتمام بالتجارب المناسبة للعائلات والزوار من مختلف الأعمار.",
    experience: "4 سنوات خبرة",
    tours: "80+ جولة",
    verified: true,
    availability: "متاحة اليوم",
  },
];

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function GuideDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const guide = guides.find((item) => item.id === Number(id));

  if (!guide) {
    notFound();
  }

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#F7F5EF] text-[#0D3B34]"
      style={{
        fontFamily: "var(--font-ibm-plex-arabic), sans-serif",
      }}
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
              <Link
                href="/discover"
                className="rounded-full px-5 py-2 text-[10px] font-semibold text-[#0D3B34]/65 transition hover:bg-[#0D3B34]/5"
              >
                اكتشف
              </Link>

              <Link
                href="/bookings"
                className="rounded-full px-5 py-2 text-[10px] font-semibold text-[#0D3B34]/65 transition hover:bg-[#0D3B34]/5"
              >
                حجوزاتي
              </Link>

              <Link
                href="/rewards"
                className="rounded-full px-5 py-2 text-[10px] font-semibold text-[#0D3B34]/65 transition hover:bg-[#0D3B34]/5"
              >
                المكافآت
              </Link>

              <Link
                href="/favorites"
                className="rounded-full px-5 py-2 text-[10px] font-semibold text-[#0D3B34]/65 transition hover:bg-[#0D3B34]/5"
              >
                المفضلة
              </Link>
            </div>
          </div>

          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-full border border-[#0D3B34]/[0.09] bg-white/70 py-1.5 pl-3 pr-1.5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0D3B34] text-[11px] font-bold text-[#D4AF37]">
              م
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-[10px] font-semibold">مرحبًا معتز</p>
              <p className="text-[8px] text-[#0D3B34]/55">حسابي</p>
            </div>
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1450px] px-5 pb-24 pt-7 md:px-8">
        {/* BACK LINK */}
        <Link
          href="/guides"
          className="inline-flex items-center gap-2 text-[10px] font-semibold text-[#0D3B34]/60 transition hover:text-[#0D3B34]"
        >
          ← العودة إلى المرشدين
        </Link>

        {/* HERO */}
        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-[30px] bg-[#0D3B34] p-7 text-white md:p-9">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-white/[0.06]" />
            <div className="absolute -bottom-32 right-[30%] h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-3xl" />

            <div className="relative">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#D4AF37] to-[#B99124] text-4xl font-bold text-[#0D3B34] shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
                  {guide.name.charAt(0)}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#D4AF37]/15 px-3 py-1.5 text-[9px] font-semibold text-[#D4AF37]">
                      LICENSED GUIDE
                    </span>

                    {guide.verified && (
                      <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[9px] text-white/70">
                        ✓ موثّق
                      </span>
                    )}
                  </div>

                  <h1
                    className="mt-4 text-3xl font-semibold md:text-4xl"
                    style={{
                      fontFamily: "var(--font-el-messiri), sans-serif",
                    }}
                  >
                    {guide.name}
                  </h1>

                  <p className="mt-2 text-sm text-white/60">
                    {guide.specialty}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[9px] text-white/70">
                      ★ {guide.rating}
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[9px] text-white/70">
                      {guide.distance}
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[9px] text-white/70">
                      {guide.city}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-7 max-w-2xl text-xs leading-7 text-white/58">
                {guide.bio}
              </p>
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="rounded-[30px] border border-white/80 bg-white/65 p-6 backdrop-blur-2xl md:p-7">
            <p className="text-[9px] font-bold tracking-[0.18em] text-[#B99124]">
              GUIDE OVERVIEW
            </p>

            <h2
              className="mt-2 text-2xl font-semibold"
              style={{
                fontFamily: "var(--font-el-messiri), sans-serif",
              }}
            >
              معلومات المرشد
            </h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <InfoCard
                label="التقييم"
                value={`${guide.rating} / 5`}
              />

              <InfoCard
                label="الخبرة"
                value={guide.experience}
              />

              <InfoCard
                label="الجولات"
                value={guide.tours}
              />

              <InfoCard
                label="التوفر"
                value={guide.availability}
              />
            </div>

            <div className="mt-6 rounded-[18px] border border-[#0D3B34]/[0.06] bg-[#0D3B34]/[0.035] p-4">
              <p className="text-[9px] text-[#0D3B34]/45">
                اللغات
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {guide.languages.map((language) => (
                  <span
                    key={language}
                    className="rounded-full bg-white px-3 py-1.5 text-[9px] font-semibold text-[#0D3B34]/70"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* DETAILS */}
        <section className="mt-7 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[28px] border border-white/80 bg-white/60 p-6 backdrop-blur-xl md:p-7">
            <p className="text-[9px] font-bold tracking-[0.18em] text-[#B99124]">
              ABOUT THE GUIDE
            </p>

            <h2
              className="mt-2 text-2xl font-semibold"
              style={{
                fontFamily: "var(--font-el-messiri), sans-serif",
              }}
            >
              عن المرشد
            </h2>

            <p className="mt-5 text-[11px] leading-7 text-[#0D3B34]/58">
              {guide.bio}
            </p>

            <div className="mt-7 grid gap-3 md:grid-cols-3">
              <FeatureCard
                title="تجربة محلية"
                description="محتوى مرتبط بالمكان وسياقه الثقافي والتاريخي."
              />

              <FeatureCard
                title="مرشد موثّق"
                description="ملف تعريفي ضمن بيئة AREES Loop التجريبية."
              />

              <FeatureCard
                title="جولة مرنة"
                description="تصميم مناسب للزوار والأفراد والعائلات."
              />
            </div>
          </div>

          {/* BOOKING CTA */}
          <aside className="h-fit rounded-[28px] border border-[#D4AF37]/20 bg-gradient-to-b from-[#0D3B34] to-[#123F37] p-6 text-white">
            <p className="text-[9px] font-bold tracking-[0.18em] text-[#D4AF37]">
              BOOK A GUIDE
            </p>

            <h2
              className="mt-3 text-2xl font-semibold"
              style={{
                fontFamily: "var(--font-el-messiri), sans-serif",
              }}
            >
              احجز جولة مع {guide.name}
            </h2>

            <p className="mt-3 text-[10px] leading-6 text-white/50">
              الحجز الفعلي سيتم ربطه لاحقًا بنظام التوفر والحجوزات
              والشركاء بعد تشغيل قاعدة البيانات.
            </p>

            <div className="mt-6 rounded-[18px] border border-white/10 bg-white/[0.06] p-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-white/45">
                  الحالة الحالية
                </span>

                <span className="flex items-center gap-2 text-[9px] font-semibold text-[#76C7A9]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#76C7A9]" />
                  {guide.status}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="mt-5 w-full cursor-not-allowed rounded-[16px] bg-[#D4AF37] px-5 py-3.5 text-[11px] font-bold text-[#0D3B34] opacity-75"
            >
              الحجز قريبًا
            </button>

            <p className="mt-3 text-center text-[8px] leading-5 text-white/35">
              سيتم تفعيل الحجز بعد ربط بيانات الشركاء والتوفر الفعلي.
            </p>
          </aside>
        </section>

        {/* PILOT NOTE */}
        <section className="mt-7 rounded-[24px] border border-[#D4AF37]/15 bg-[#D4AF37]/[0.055] p-5">
          <p className="text-[9px] font-semibold text-[#B99124]">
            AREES LOOP • PILOT
          </p>

          <p className="mt-2 max-w-4xl text-[10px] leading-6 text-[#0D3B34]/55">
            بيانات الملف الحالية تجريبية لأغراض النسخة الأولية MVP.
            عند تشغيل قاعدة البيانات سيتم ربط الملف بالترخيص الحقيقي،
            جدول التوفر، الحجوزات، التقييمات، وسجل الجولات.
          </p>
        </section>
      </div>

      {/* MOBILE NAV */}
      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-md -translate-x-1/2 items-center justify-around rounded-[20px] border border-white/80 bg-white/90 px-2 py-2 shadow-[0_12px_40px_rgba(13,59,52,0.12)] backdrop-blur-2xl lg:hidden">
        <MobileNavItem
          href="/discover"
          label="اكتشف"
          symbol="⌖"
        />

        <MobileNavItem
          href="/bookings"
          label="حجوزاتي"
          symbol="◇"
        />

        <MobileNavItem
          href="/rewards"
          label="المكافآت"
          symbol="✦"
        />

        <MobileNavItem
          href="/profile"
          label="حسابي"
          symbol="○"
        />
      </nav>
    </main>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#0D3B34]/[0.06] bg-[#0D3B34]/[0.03] p-4">
      <p className="text-[8px] text-[#0D3B34]/40">
        {label}
      </p>

      <p className="mt-2 text-[11px] font-semibold">
        {value}
      </p>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#0D3B34]/[0.06] bg-[#0D3B34]/[0.025] p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#0D3B34] text-[11px] text-[#D4AF37]">
        ✓
      </div>

      <h3 className="mt-3 text-[11px] font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-[9px] leading-5 text-[#0D3B34]/45">
        {description}
      </p>
    </div>
  );
}

function MobileNavItem({
  href,
  label,
  symbol,
}: {
  href: string;
  label: string;
  symbol: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-[60px] flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[#0D3B34]/55"
    >
      <span className="text-base text-[#B99124]">
        {symbol}
      </span>

      <span className="text-[8px] font-semibold">
        {label}
      </span>
    </Link>
  );
}