import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = {...buildPageMetadata({
  title: "الرئيسية",
  description: "اكتشف واحجز التجارب والوجهات السياحية في السعودية، واكسب المكافآت في تجربة واحدة ذكية.",
  path: "/",
  image: "/Image/social/arees-loop-whatsapp-preview.png",
  imageWidth: 1734,
  imageHeight: 907,
  imageType: "image/png",
  imageAlt: "Arees Loop — اكتشف تجارب ووجهات السعودية",
}), title:{absolute:"الرئيسية | AREES LOOP"}};

const homeSchema={
 "@context":"https://schema.org",
 "@graph":[
  {"@type":"WebSite","@id":"https://www.areesloop.com/#website","name":"AREES LOOP","alternateName":"أريس لوب","url":"https://www.areesloop.com/","inLanguage":"ar-SA"},
  {"@type":"Organization","@id":"https://www.areesloop.com/#organization","name":"شركة أريس الحلول المتكاملة المحدودة","alternateName":"أريس للسفر والسياحة","url":"https://www.areesloop.com/","logo":"https://www.areesloop.com/Logo/arees-loop-logo.png"}
 ]
};
export default function HomePage() {
 return <>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(homeSchema).replace(/</g,"\\u003c")}}/>
  <HomeClient/>
 </>;
}
