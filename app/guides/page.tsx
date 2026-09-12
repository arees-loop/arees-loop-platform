import Image from "next/image";
import Link from "next/link";

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

export default function GuidesPage() {
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
        {/* BACK */}
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 text-[10px] font-semibold text-[#0D3B34]/60 transition hover:text-[#0D3B34]"
        >
          ← العودة إلى الاكتشاف
        </Link>

        {/* HERO */}
        <section className="relative mt-6 overflow-hidden rounded-[30px] bg-[#0D3B34] p-7 text-white md:p-10">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-white/[0.06]" />
          <div className="absolute -bottom-32 right-[25%] h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-3xl" />

          <div className="relative">
            <p className="text-[9px] font-bold tracking-[0.18em] text-[#D4AF37]">
              LICENSED GUIDES
            </p>

            <h1
              className="mt-3 text-3xl font-semibold md:text-4xl"
              style={{
                fontFamily: "var(--font-el-messiri), sans-serif",
              }}
            >
              مرشدون قريبون منك
            </h1>

            <p className="mt-4 max-w-2xl text-[11px] leading-7 text-white/55">
              اكتشف المرشد المناسب حسب التخصص واللغة والقرب، ثم انتقل
              إلى ملفه لمعرفة تفاصيل التجربة.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[9px] text-white/70">
                {guides.length} مرشدين
              </span>

              <span className="rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-2 text-[9px] text-[#D4AF37]">
                المدينة المنورة
              </span>
            </div>
          </div>
        </section>

        {/* GUIDES */}
        <section className="mt-8">
          <div>
            <p className="text-[9px] font-bold tracking-[0.18em] text-[#B99124]">
              EXPLORE GUIDES
            </p>

            <h2
              className="mt-2 text-2xl font-semibold"
              style={{
                fontFamily: "var(--font-el-messiri), sans-serif",
              }}
            >
              اختر مرشدك
            </h2>

            <p className="mt-2 text-[10px] text-[#0D3B34]/45">
              المرشدون المتاحون حاليًا ضمن النسخة التجريبية.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {guides.map((guide) => (
              <article
                key={guide.id}
                className="rounded-[24px] border border-white/80 bg-white/65 p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(13,59,52,0.08)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#0D3B34] to-[#1A5B4F] text-lg font-bold text-[#D4AF37]">
                    {guide.name.charAt(0)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold">
                            {guide.name}
                          </h3>

                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0D3B34] text-[8px] text-white">
                            ✓
                          </span>
                        </div>

                        <p className="mt-1 text-[10px] leading-5 text-[#0D3B34]/45">
                          {guide.specialty}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] font-semibold">
                        <span className="text-[#D4AF37]">★</span>
                        {guide.rating}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#0D3B34]/[0.045] px-3 py-1.5 text-[8px] text-[#0D3B34]/55">
                        {guide.languages}
                      </span>

                      <span className="rounded-full bg-[#0D3B34]/[0.045] px-3 py-1.5 text-[8px] text-[#0D3B34]/55">
                        {guide.distance}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#0D3B34]/[0.06] pt-4">
                  <div className="flex items-center gap-2 text-[9px] font-semibold text-[#2F765F]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#3A8F70]" />
                    {guide.status}
                  </div>

                  <Link
                    href={`/guide/${guide.id}`}
                    className="rounded-[12px] bg-[#0D3B34] px-5 py-2.5 text-[9px] font-semibold text-white transition hover:bg-[#145347]"
                  >
                    عرض الملف
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* INFO */}
        <section className="mt-8 rounded-[24px] border border-[#D4AF37]/15 bg-[#D4AF37]/[0.055] p-5">
          <p className="text-[9px] font-semibold text-[#B99124]">
            AREES LOOP • PILOT
          </p>

          <p className="mt-2 max-w-3xl text-[10px] leading-6 text-[#0D3B34]/55">
            بيانات المرشدين الحالية تجريبية. لاحقًا سيتم ربط الملفات
            بالتراخيص والتوفر والحجوزات والتقييمات الفعلية ضمن نظام
            الشركاء.
          </p>
        </section>
      </div>

      {/* MOBILE NAV */}
      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-md -translate-x-1/2 items-center justify-around rounded-[20px] border border-white/80 bg-white/90 px-2 py-2 shadow-[0_12px_40px_rgba(13,59,52,0.12)] backdrop-blur-2xl lg:hidden">
        <MobileNavItem href="/discover" label="اكتشف" symbol="⌖" />
        <MobileNavItem href="/bookings" label="حجوزاتي" symbol="◇" />
        <MobileNavItem href="/rewards" label="المكافآت" symbol="✦" />
        <MobileNavItem href="/profile" label="حسابي" symbol="○" />
      </nav>
    </main>
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
      <span className="text-base text-[#B99124]">{symbol}</span>
      <span className="text-[8px] font-semibold">{label}</span>
    </Link>
  );
}