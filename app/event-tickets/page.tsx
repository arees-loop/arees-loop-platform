import type {Metadata} from "next";
import Link from "next/link";

export const metadata:Metadata={
  title:"تذاكر الفعاليات | قريباً في أريس لوب",
  description:"قريباً في أريس لوب: تجربة جديدة لاكتشاف تذاكر الفعاليات السعودية، من الحفلات إلى العروض والرياضة والتجارب العائلية.",
  robots:{index:false,follow:true},
  alternates:{canonical:"https://www.areesloop.com/event-tickets"},
  openGraph:{
    title:"تذاكر الفعاليات — قريباً | Arees Loop",
    description:"لحظات أكبر، وتجارب أقرب. قريباً عالم الفعاليات السعودية في أريس لوب.",
    type:"website",
    locale:"ar_SA",
    url:"https://www.areesloop.com/event-tickets",
  }
};

const categories=[
  {icon:"🎤",name:"الحفلات"},
  {icon:"🎭",name:"العروض"},
  {icon:"🏟️",name:"الرياضة"},
  {icon:"🎡",name:"الترفيه العائلي"},
  {icon:"🎨",name:"الفنون والثقافة"},
  {icon:"✨",name:"المواسم السعودية"},
];

export default function EventTicketsPage(){
  return <main dir="rtl" className="min-h-screen overflow-hidden bg-[#F8F5EC] pb-20 pt-28 text-[#0D3B34] md:pt-32">
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <section aria-labelledby="events-headline" className="relative isolate overflow-hidden rounded-[30px] border border-[#D6B76A]/50 bg-[radial-gradient(ellipse_at_17%_18%,rgba(241,210,142,.55),transparent_42%),radial-gradient(ellipse_at_87%_75%,rgba(201,223,205,.35),transparent_42%),linear-gradient(130deg,#FFFFFF,#FAF3E4_55%,#EDE1C6)] px-6 py-14 shadow-[0_22px_75px_rgba(45,38,18,.09)] md:px-14 md:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-40 size-[480px] rounded-full border-[45px] border-white/35"/>
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[-150px] right-[-125px] size-[490px] rounded-full border-[55px] border-[#D9BB7C]/15"/>
        <div aria-hidden="true" className="pointer-events-none absolute bottom-10 left-1/3 size-28 rounded-full bg-[#E2C37D]/30 blur-3xl"/>
        <div className="relative z-10 grid items-center gap-11 lg:grid-cols-[1.15fr_.85fr]">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#D1AF58]/50 bg-white/65 px-4 py-2 text-xs font-black text-[#986E1D] shadow-sm">
              <span aria-hidden="true" className="size-2 rounded-full bg-[#CDA13E]"/> AREES LOOP · EVENT TICKETS
            </p>
            <h1 id="events-headline" className="mt-8 text-4xl font-black leading-[1.5] tracking-tight sm:text-5xl md:text-6xl">
              تذاكر الفعاليات
              <span className="mt-3 block bg-[linear-gradient(95deg,#AD8332,#D7AD54,#81601E)] bg-clip-text text-transparent">قريباً…</span>
            </h1>
            <p className="mt-7 max-w-xl text-xl font-extrabold leading-relaxed md:text-2xl">لحظات أكبر. تجارب أقرب. وذكريات ما تتكرر.</p>
            <p className="mt-5 max-w-xl text-sm leading-8 text-[#48665B] md:text-base">
              من نبض الحفلات إلى حماس الملاعب ومتعة المواسم السعودية…
              نجهّز ليك تجربة جديدة لاكتشاف تذاكر الفعاليات، ونعمل على أن تبدأ رحلة الحجز وتنتهي داخل أريس لوب.
            </p>
            <div className="mt-8 inline-flex flex-wrap items-center gap-2 rounded-2xl border border-[#D1AD56]/45 bg-white/70 px-5 py-3 text-xs font-bold text-[#8B692C] backdrop-blur-lg">
              <span aria-hidden="true">✦</span> ترقّبوا الإطلاق <span aria-hidden="true">✦</span> شراكات الحجز قيد التجهيز
            </div>
          </div>
          <div aria-label="بطاقة تشويقية لتذاكر الفعاليات" className="relative mx-auto w-full max-w-[400px] py-5">
            <div aria-hidden="true" className="absolute inset-x-6 inset-y-10 rotate-[9deg] rounded-[35px] border border-[#B99449]/30 bg-white/30 shadow-xl backdrop-blur-xl"/>
            <div className="relative -rotate-[5deg] overflow-hidden rounded-[30px] border border-white/80 bg-white/60 shadow-[0_35px_65px_rgba(32,58,47,.14)] backdrop-blur-xl">
              <div className="relative overflow-hidden bg-[linear-gradient(140deg,#0D3B34,#275D50)] p-8 text-white md:p-10">
                <div aria-hidden="true" className="absolute -left-12 -top-24 size-72 rounded-full border-[26px] border-[#D8BD75]/15"/>
                <div className="relative flex items-center justify-between text-[10px] font-extrabold tracking-widest text-[#E8CD93]">
                  <span>AREES LOOP</span><span>SAUDI EVENTS</span>
                </div>
                <div aria-hidden="true" className="relative mt-12 flex justify-center text-[100px] leading-none drop-shadow-xl">🎟️</div>
                <p className="relative mt-8 text-center text-[11px] font-extrabold tracking-[.2em] text-[#E8CD93]">COMING SOON</p>
                <p className="relative mt-1 text-center text-3xl font-black">قريباً</p>
              </div>
              <div className="relative border-t-2 border-dashed border-[#D8BB76]/60 px-8 py-5 text-[#0D3B34]">
                <span aria-hidden="true" className="absolute -right-3 -top-3 size-6 rounded-full bg-[#F6F0E3]"/>
                <span aria-hidden="true" className="absolute -left-3 -top-3 size-6 rounded-full bg-[#F6F0E3]"/>
                <div className="flex items-center justify-between gap-2 text-xs font-black">
                  <span>التجربة الجاية تستاهل الانتظار</span><span className="font-mono text-[#A07930]">♾</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section aria-labelledby="events-types" className="mt-12">
        <div className="mb-6 text-center">
          <p className="text-[11px] font-black tracking-[.16em] text-[#B08B3C]">STAY IN THE LOOP</p>
          <h2 id="events-types" className="mt-2 text-2xl font-black md:text-3xl">عالم من الفعاليات ينتظرك</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map(category=><div key={category.name} className="rounded-2xl border border-[#D4AF37]/25 bg-white/80 px-3 py-6 text-center shadow-[0_8px_24px_rgba(13,59,52,.035)]">
            <span aria-hidden="true" className="text-3xl">{category.icon}</span>
            <h3 className="mt-3 text-xs font-extrabold sm:text-sm">{category.name}</h3>
          </div>)}
        </div>
      </section>
      <section className="mx-auto mt-11 max-w-3xl rounded-2xl border border-[#D4AF37]/30 bg-white/85 p-6 text-center md:p-8">
        <h2 className="text-lg font-black">خليك في اللوب… المفاجأة قربت! ♾️</h2>
        <p className="mx-auto mt-3 max-w-2xl text-xs leading-7 text-[#62786F]">
          خدمة تذاكر الفعاليات قيد التجهيز ولم يُفتح الحجز أو الدفع بعد.
          سيتم الإعلان عن التذاكر المتاحة وطريقة إصدارها بعد اكتمال اتفاقيات الموردين واعتماد التكامل.
        </p>
        <Link href="/discover" className="mt-6 inline-flex rounded-xl border border-[#B99649] px-5 py-3 text-sm font-black transition hover:bg-[#FCF5E5]">
          استكشف تجارب أريس المتاحة الآن ←
        </Link>
      </section>
    </div>
  </main>;
}
