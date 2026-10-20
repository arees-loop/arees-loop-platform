import type { Metadata } from "next";
import RequestServicePage from "@/app/components/RequestServicePage";
import { buildPageMetadata } from "@/lib/seo-metadata";
export const metadata: Metadata = buildPageMetadata({title:"تأشيرات شنغن وجورجيا والسفر",description:"قدّم طلب تأشيرة شنغن أو جورجيا أو تأشيرات سياحية وعائلية أخرى عبر أريس لوب. نساعد في متابعة المتطلبات؛ والقرار النهائي للجهة المختصة.",path:"/visas",image:"/Image/hero/arees-visas-banner.webp",imageWidth:2048,imageHeight:682,imageType:"image/webp",imageAlt:"إصدار التأشيرات حول العالم مع Arees Loop"});
export default function VisasPage(){return <><RequestServicePage kind="VISA"/></>;}
