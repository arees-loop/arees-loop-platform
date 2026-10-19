import type {Metadata} from "next";
import HomeClient from "./HomeClient";
import {buildPageMetadata} from "@/lib/seo-metadata";

export const metadata:Metadata=buildPageMetadata({
 title:"الرئيسية",
 description:"أريس لوب AREES LOOP من شركة أريس الحلول المتكاملة المحدودة؛ اكتشف التجارب والبرامج السياحية وخدمات الطيران والبواخر والفنادق والتأشيرات في السعودية وحول العالم.",
 path:"/",image:"/Image/social/arees-loop-whatsapp-preview.png",
 imageWidth:1734,imageHeight:907,imageType:"image/png",
 imageAlt:"الرئيسية — أريس لوب، منصة تجارب وخدمات السفر والسياحة"
});

const organization={
 "@context":"https://schema.org",
 "@type":"TravelAgency",
 "@id":"https://www.areesloop.com/#organization",
 "name":"شركة أريس الحلول المتكاملة المحدودة",
 "alternateName":["أريس للسفر والسياحة","AREES LOOP"],
 "legalName":"شركة أريس الحلول المتكاملة المحدودة",
 "url":"https://www.areesloop.com/",
 "logo":"https://www.areesloop.com/Logo/arees-integrated-solutions-logo.png",
 "address":{"@type":"PostalAddress","addressLocality":"المدينة المنورة","addressRegion":"المدينة المنورة","addressCountry":"SA"},
 "identifier":[
  {"@type":"PropertyValue","propertyID":"Saudi Ministry of Tourism license","value":"73104550"},
  {"@type":"PropertyValue","propertyID":"Saudi Commercial Registration","value":"7037003618"}
 ]
};

export default function HomePage(){
 return <>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organization)}}/>
  <HomeClient/>
 </>;
}
