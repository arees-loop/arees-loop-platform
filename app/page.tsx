import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "الرئيسية",
  description: "اكتشف واحجز التجارب والوجهات السياحية في السعودية، واكسب المكافآت في تجربة واحدة ذكية.",
  path: "/",
  image: "/Image/social/arees-loop-whatsapp-preview.png",
  imageWidth: 1734,
  imageHeight: 907,
  imageType: "image/png",
  imageAlt: "Arees Loop — اكتشف تجارب ووجهات السعودية",
});

export default function HomePage() {
  const graph = {"@context":"https://schema.org","@graph":[
    {"@type":"WebSite","@id":"https://www.areesloop.com/#website","url":"https://www.areesloop.com/","name":"AREES LOOP","inLanguage":"ar-SA","description":"منصة للتجارب والخدمات السياحية وطلبات السفر"},
    {"@type":"Organization","@id":"https://www.areesloop.com/#operator","name":"شركة أريس الحلول المتكاملة المحدودة","legalName":"شركة أريس الحلول المتكاملة المحدودة","alternateName":"أريس للسفر والسياحة","url":"https://www.areesloop.com/","logo":"https://www.areesloop.com/Logo/arees-integrated-solutions-logo.png","identifier":{"@type":"PropertyValue","propertyID":"وزارة السياحة — ترخيص وكالة سفر وسياحة","value":"73104550"},"address":{"@type":"PostalAddress","addressLocality":"المدينة المنورة","addressCountry":"SA","streetAddress":"حي قربان"}}
  ]};
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph)}}/>
    <HomeClient/>
  </>;
}
