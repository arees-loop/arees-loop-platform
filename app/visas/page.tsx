import type { Metadata } from "next";
import RequestServicePage from "@/app/components/RequestServicePage";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "تأشيرات السفر والعلاج للهند والموافقات الأمنية لمصر",
  description:
    "استفسر عن تأشيرات جنوب أفريقيا وإثيوبيا وشرق أفريقيا وأوروبا وأمريكا وآسيا، والتأشيرة العلاجية للهند، ومتابعة الموافقات الأمنية لمصر عبر أريس لوب.",
  path: "/visas",
  image: "/Image/hero/arees-visas-banner.webp",
  imageWidth: 2048,
  imageHeight: 682,
  imageType: "image/webp",
  imageAlt: "خدمات التأشيرات والسفر مع أريس لوب",
});

const destinations = [
  "جنوب أفريقيا",
  "إثيوبيا",
  "جنوب السودان",
  "تنزانيا",
  "كينيا",
  "غينيا",
  "أوغندا",
  "الكاميرون",
  "نيجيريا",
  "المغرب",
  "بريطانيا",
  "أمريكا",
  "إندونيسيا",
  "ماليزيا",
  "روسيا",
  "تركيا",
];

export default function VisasPage() {
  return (
    <>
      <RequestServicePage kind="VISA" />
      <section
        dir="rtl"
        aria-labelledby="visa-destinations-title"
        className="bg-[#F7F4ED] px-4 pb-16 text-[#0D3B34] md:px-8"
      >
        <div className="mx-auto max-w-7xl rounded-3xl border border-[#D4AF37]/30 bg-white p-6 shadow-sm sm:p-9">
          <p className="text-xs font-black text-[#A78332]">AREES LOOP · VISA SERVICES</p>
          <h2 id="visa-destinations-title" className="mt-2 text-2xl font-black sm:text-3xl">
            تأشيرات السفر والعلاج والموافقات الأمنية
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-8 text-[#49655D]">
            يمكنكم الاستفسار عن طلبات التأشيرات إلى الوجهات التالية. وتتوفر خدمة متابعة
            الموافقات الأمنية لمصر، كما يمكن طلب التأشيرة العلاجية للهند. يراجع فريق أريس
            متطلبات كل حالة قبل بدء الإجراء.
          </p>
          <h3 className="mt-6 font-black">وجهات التأشيرات</h3>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {destinations.map((country) => (
              <li
                key={country}
                className="rounded-xl border border-[#D4AF37]/20 bg-[#FCFBF6] px-4 py-3 font-bold"
              >
                تأشيرة {country}
              </li>
            ))}
          </ul>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <article className="rounded-2xl bg-[#F7F2E6] p-4">
              <h3 className="font-black">الموافقات الأمنية لمصر</h3>
              <p className="mt-1 text-sm leading-7 text-[#49655D]">
                استقبال طلبات الاستفسار ومتابعة الإجراءات حسب الحالة والمتطلبات.
              </p>
            </article>
            <article className="rounded-2xl bg-[#F7F2E6] p-4">
              <h3 className="font-black">التأشيرة العلاجية للهند</h3>
              <p className="mt-1 text-sm leading-7 text-[#49655D]">
                متابعة طلب التأشيرة العلاجية وفق المستندات المطلوبة من الجهة الطبية والجهات المختصة.
              </p>
            </article>
          </div>
          <p className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
            تقديم الطلب أو متابعة الإجراءات لا يضمن صدور التأشيرة أو الموافقة الأمنية؛
            القرار النهائي للجهات الحكومية المختصة، وقد تختلف المتطلبات والمدة حسب الجنسية والحالة.
          </p>
        </div>
      </section>
    </>
  );
}
