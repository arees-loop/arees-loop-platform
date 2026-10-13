import Link from "next/link";
import PartnerIcon from "@/app/components/PartnerIcon";

export default function PartnersLandingPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#F8F5ED] px-5 pb-24 pt-32 text-[#0D3B34]">
      <section className="mx-auto max-w-5xl overflow-hidden rounded-[34px] border border-[#D4AF37]/30 bg-white shadow-[0_20px_60px_rgba(13,59,52,.08)]">
        <div className="bg-[#0D3B34] px-6 py-12 text-center text-white md:px-12 md:py-16">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] border border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#E7C469]">
            <PartnerIcon kind="handshake" className="h-10 w-10" />
          </div>
          <p className="text-xs font-extrabold tracking-widest text-[#D4AF37]">AREES LOOP PARTNERS</p>
          <h1 className="mt-4 text-3xl font-black md:text-5xl">شراكتك تصنع تجربة أغنى</h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-9 text-white/80">
            نرحب بالشركات ومقدمي التجارب والجهات الحكومية وغير الربحية للمشاركة في إبراز البرامج
            والفعاليات والوجهات السياحية، وتوسيع أثر الشراكات والمبادرات المجتمعية.
          </p>
        </div>
        <div className="grid gap-4 px-6 py-10 md:grid-cols-3 md:px-10">
          <Link href="/partner/select-type" className="group flex flex-col items-center rounded-[24px] border border-[#D4AF37]/35 bg-[#FFF9E9] px-5 py-7 text-center transition hover:-translate-y-1 hover:shadow-lg">
            <PartnerIcon kind="handshake" className="h-10 w-10 text-[#B18A2B]" />
            <h2 className="mt-4 text-xl font-black">انضم كشريك</h2>
            <p className="mt-2 text-sm leading-7 text-[#0D3B34]/65">اختر شركة أو مؤسسة، أو فرداً، أو جهة حكومية وابدأ طلب الانضمام.</p>
            <span className="mt-5 rounded-full bg-[#0D3B34] px-5 py-2.5 text-sm font-bold text-white">اختر نوع الشريك ←</span>
          </Link>
          <Link href="/partner/government" className="group flex flex-col items-center rounded-[24px] border border-[#D4AF37]/30 bg-[#FBF8F0] px-5 py-7 text-center transition hover:-translate-y-1 hover:shadow-lg">
            <PartnerIcon kind="government" className="h-10 w-10 text-[#B18A2B]" />
            <h2 className="mt-4 text-xl font-black">الجهات الحكومية</h2>
            <p className="mt-2 text-sm leading-7 text-[#0D3B34]/65">انضمام الجهات الحكومية وغير الربحية، ورفع الشعار الرسمي ومراجعة الطلب.</p>
            <span className="mt-5 rounded-full border border-[#B18A2B] px-5 py-2.5 text-sm font-bold">طلب انضمام جهة ←</span>
          </Link>
          <Link href="/partner/login" className="group flex flex-col items-center rounded-[24px] border border-[#D4AF37]/30 bg-white px-5 py-7 text-center transition hover:-translate-y-1 hover:shadow-lg">
            <PartnerIcon kind="login" className="h-10 w-10 text-[#B18A2B]" />
            <h2 className="mt-4 text-xl font-black">تسجيل دخول الشركاء</h2>
            <p className="mt-2 text-sm leading-7 text-[#0D3B34]/65">استكمل طلبك أو تابع أعمالك وخدماتك من حساب الشريك.</p>
            <span className="mt-5 rounded-full border border-[#B18A2B] px-5 py-2.5 text-sm font-bold">تسجيل الدخول ←</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
