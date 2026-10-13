import Link from "next/link";
import PartnerIcon from "@/app/components/PartnerIcon";

const partnerTypes = [
  {
    title: "شركة أو مؤسسة",
    description: "للشركات والمؤسسات التجارية الراغبة في تقديم خدماتها وبرامجها وتجاربها السياحية.",
    icon: "business" as const,
    href: "/partner/onboarding?type=business",
  },
  {
    title: "فرد",
    description: "للمرشدين السياحيين ومقدمي التجارب والخدمات الفردية وفق التراخيص والمتطلبات المعتمدة.",
    icon: "individual" as const,
    href: "/partner/onboarding?type=individual",
  },
  {
    title: "جهة حكومية أو غير ربحية",
    description: "للجهات الرسمية والمنظمات غير الربحية للمشاركة المجتمعية وإبراز الفعاليات والبرامج والوجهات.",
    icon: "government" as const,
    href: "/partner/government",
  },
];

export default function SelectPartnerTypePage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#F8F5ED] px-5 pb-24 pt-32 text-[#0D3B34]">
      <section className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] border border-[#D4AF37]/40 bg-[#FFF9E9] text-[#AC8024] shadow-sm">
            <PartnerIcon kind="handshake" className="h-9 w-9" />
          </div>
          <p className="text-xs font-extrabold tracking-widest text-[#A87917]">AREES LOOP PARTNERS</p>
          <h1 className="mt-3 text-3xl font-black leading-tight md:text-5xl">شراكتك تصنع تجربة أغنى</h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-9 text-[#0D3B34]/75">
            نرحب بالشركات ومقدمي التجارب والجهات الحكومية وغير الربحية للمشاركة في إبراز البرامج
            والفعاليات والوجهات السياحية، وتوسيع أثر الشراكات والمبادرات المجتمعية.
          </p>
          <div className="mx-auto mt-8 flex max-w-sm items-center justify-center gap-3">
            <span className="h-px flex-1 bg-[#D4AF37]/40" aria-hidden="true" />
            <h2 className="text-lg font-black text-[#0D3B34] md:text-xl">اختر نوع الشريك</h2>
            <span className="h-px flex-1 bg-[#D4AF37]/40" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {partnerTypes.map((item) => (
            <Link key={item.icon} href={item.href} className="group flex min-h-[290px] flex-col items-center rounded-[30px] border border-[#D4AF37]/30 bg-white px-7 py-9 text-center shadow-[0_14px_40px_rgba(13,59,52,.07)] transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-[0_20px_45px_rgba(13,59,52,.12)] focus-visible:outline-4 focus-visible:outline-[#D4AF37]">
              <span className="flex h-[76px] w-[76px] items-center justify-center rounded-[24px] border border-[#D4AF37]/35 bg-gradient-to-br from-[#FFF7DF] to-[#F0E5C6] text-[#A87C21] transition group-hover:bg-[#0D3B34] group-hover:text-[#0D3B34]">
                <PartnerIcon kind={item.icon} className="h-10 w-10" />
              </span>
              <h2 className="mt-6 text-xl font-black md:text-2xl">{item.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-7 text-[#0D3B34]/65">{item.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0D3B34] px-7 py-3 text-sm font-bold text-white transition group-hover:bg-[#16594D]">
                ابدأ طلب الانضمام <span aria-hidden="true">←</span>
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold">
          <span className="text-[#0D3B34]/65">لديك طلب أو حساب سابق؟</span>
          <Link href="/partner/login" className="inline-flex items-center gap-2 rounded-full border border-[#C5A052] bg-white px-6 py-3 text-[#0D3B34] transition hover:bg-[#FFF9E9]">
            <PartnerIcon kind="login" className="h-5 w-5" /> تسجيل دخول الشركاء
          </Link>
        </div>
      </section>
    </main>
  );
}
