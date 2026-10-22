import type {Metadata} from "next";
import Link from "next/link";

export const metadata:Metadata={
 title:"تذاكر الفعاليات | أريس لوب",
 description:"اكتشف قريباً تذاكر الفعاليات الترفيهية والثقافية والرياضية في السعودية من خلال شركاء تذاكر معتمدين عبر أريس لوب.",
 robots:{index:false,follow:true},
 alternates:{canonical:"https://www.areesloop.com/event-tickets"}
};

const categories=[
 {icon:"🎤",name:"الحفلات والمهرجانات",detail:"حفلات موسيقية ومهرجانات ومناسبات ترفيهية"},
 {icon:"🎭",name:"المسرح والعروض",detail:"عروض مسرحية وكوميدية وتجارب حيّة"},
 {icon:"🏟️",name:"الرياضة والبطولات",detail:"مباريات ومنافسات وفعاليات رياضية"},
 {icon:"🎡",name:"التجارب العائلية",detail:"أنشطة ووجهات ترفيهية تناسب العائلة"},
 {icon:"🎨",name:"الثقافة والمعارض",detail:"معارض وفنون وفعاليات ثقافية"},
 {icon:"🎟️",name:"المواسم والفعاليات الكبرى",detail:"فعاليات المواسم السعودية والبرامج الخاصة"},
];

export default function EventTicketsPage(){
 return <main dir="rtl" className="min-h-screen bg-[#F7F4EC] pb-24 pt-28 text-[#0D3B34] md:pt-32">
  <div className="mx-auto max-w-7xl space-y-8 px-4 md:px-8">
   <section className="relative overflow-hidden rounded-[30px] border border-[#D4AF37]/35 bg-[linear-gradient(115deg,#fff9ed,#f8f4e8_46%,#f1e4c7)] px-6 py-12 shadow-[0_16px_50px_rgba(13,59,52,.07)] md:px-12 md:py-16">
    <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full border-[38px] border-white/35 blur-[1px]"/>
    <div className="relative max-w-3xl">
     <p className="text-[11px] font-black tracking-[.16em] text-[#AC8427]">AREES LOOP · EVENT TICKETS</p>
     <h1 className="mt-5 text-4xl font-black leading-[1.5] md:text-5xl">تذاكر الفعاليات</h1>
     <p className="mt-5 text-lg font-bold leading-9">من الحفلات والرياضة إلى المسرح والتجارب العائلية… فعاليات السعودية في وجهة واحدة.</p>
     <p className="mt-3 max-w-2xl text-sm leading-8 text-[#416258]">نعمل على ربط أريس لوب بمزودي التذاكر المعتمدين لإتاحة الحجز والإصدار ومتابعة الطلبات بصورة واضحة وآمنة.</p>
     <div className="mt-7 inline-flex items-center gap-2 rounded-xl border border-[#D4AF37]/50 bg-white/70 px-4 py-3 text-xs font-black text-[#855F14]"><span aria-hidden="true">⌛</span> جاري تجهيز تكامل التذاكر — الحجز الإلكتروني غير مفعّل حالياً</div>
    </div>
   </section>
   <section aria-labelledby="ticket-categories">
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
     <div><p className="text-xs font-bold text-[#B48E34]">EXPLORE EVENTS</p><h2 id="ticket-categories" className="mt-2 text-2xl font-black">استكشف أنواع الفعاليات</h2></div>
     <span className="text-xs text-[#657D73]">سيتم عرض التذاكر المعتمدة عند اكتمال الربط</span>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
     {categories.map(category=><article key={category.name} className="rounded-2xl border border-[#D4AF37]/25 bg-white px-6 py-7 shadow-sm">
      <span aria-hidden="true" className="text-3xl">{category.icon}</span>
      <h3 className="mt-4 text-lg font-black">{category.name}</h3>
      <p className="mt-3 text-sm leading-7 text-[#6B8077]">{category.detail}</p>
     </article>)}
    </div>
   </section>
   <section className="rounded-2xl border border-[#D4AF37]/25 bg-white px-6 py-7 md:px-9">
    <h2 className="text-xl font-black">كيف سيعمل الحجز؟</h2>
    <p className="mt-3 text-sm leading-8 text-[#5E776B]">بعد اعتماد شراكات التذاكر ستظهر الفعاليات المتاحة وأسعارها وشروط الاسترداد واسم الجهة المصدرة. تختلف طريقة الدفع واستلام التذكرة بحسب نوع الاتفاق مع مزود التذاكر.</p>
    <p className="mt-4 rounded-xl bg-[#F9F5E9] p-4 text-xs leading-7">هذه الصفحة تمهيدية ولا تعرض حالياً تذاكر للبيع أو أسعاراً أو حجوزات مؤكدة. لا تدفع أي مبلغ مقابل تذكرة حتى تظهر خدمة حجز مفعّلة وشروطها المعتمدة.</p>
    <Link href="/discover" className="mt-5 inline-flex rounded-xl border border-[#B58C34] px-5 py-3 text-sm font-bold transition hover:bg-[#FFF8E8]">تصفح البرامج السياحية المتاحة ←</Link>
   </section>
  </div>
 </main>
}
