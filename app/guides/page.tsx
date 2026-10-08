import Link from "next/link";

export default function GuidesLandingPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#F8F5ED] pb-20 pt-28 text-[#0D3B34]">
      <section className="mx-auto max-w-[1500px] px-4 md:px-8">
        <div className="relative overflow-hidden rounded-[26px] border border-[#D4AF37]/30 bg-[#E8D5AF] shadow-[0_20px_60px_rgba(13,59,52,.12)]">
          <img src="/Image/guides/arees-loop-tour-guides-banner.png" alt="مرشد سياحي يعرّف زواراً بالمواقع التراثية والتاريخية في المملكة" className="block h-auto w-full object-contain" />
          <div className="bg-[#0D3B34] px-5 py-8 text-center text-white md:py-10">
            <p className="text-xs font-bold tracking-[.16em] text-[#D4AF37]">AREES LOOP GUIDES</p>
            <h1 className="mt-2 text-3xl font-black md:text-4xl">المرشدون السياحيون</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/75">اكتشف مرشداً سياحياً مرخصاً في وجهتك، أو انضم لتقديم خدمات الإرشاد السياحي عبر أريس لوب.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/guides/directory" className="rounded-full bg-white px-7 py-3 font-bold text-[#0D3B34] transition hover:bg-[#F2E8D5]">ابحث عن مرشد سياحي</Link>
              <Link href="/guides/register" className="rounded-full border border-[#D4AF37] bg-[#D4AF37] px-7 py-3 font-bold text-[#0D3B34] transition hover:bg-[#E8C661]">انضم كمرشد سياحي</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
