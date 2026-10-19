import type {Metadata} from "next";
import {buildPageMetadata} from "@/lib/seo-metadata";
import ProgramsListing from "../ProgramsListing";
export const dynamic="force-dynamic";
export const metadata:Metadata=buildPageMetadata({
 title:"البرامج السياحية العالمية والوجهات الدولية",
 description:"تصفح البرامج والخدمات السياحية المنشورة خارج السعودية عبر أريس لوب، واعرف الوجهات المتاحة وخيارات الطيران والفنادق والتأشيرات.",
 path:"/programs/international",image:"/api/og/discover?type=international",imageWidth:1200,imageHeight:630,imageType:"image/png",
 imageAlt:"البرامج السياحية العالمية والوجهات الدولية — أريس لوب"
});
export default function InternationalPrograms(){return <ProgramsListing scope="international" title="البرامج السياحية العالمية" intro="خطط لرحلتك إلى الوجهات العالمية عبر الخدمات المنشورة فعلياً في أريس لوب. تختلف الخيارات حسب توفر البرامج وشركائنا في كل وجهة." banner="/Image/hero/world-destinations-hero.webp"/>;}
