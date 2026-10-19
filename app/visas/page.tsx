import LicensedTravelOperator from "@/app/components/LicensedTravelOperator";
import type { Metadata } from "next";
import RequestServicePage from "@/app/components/RequestServicePage";
import { buildPageMetadata } from "@/lib/seo-metadata";
export const metadata: Metadata = buildPageMetadata({title:"إصدار التأشيرات حول العالم",description:"قدّم طلب التأشيرة السياحية أو العائلية أو التجارية عبر أريس لوب. متابعة منظمة للمتطلبات والخيارات المناسبة لوجهتك.",path:"/visas",image:"/Image/hero/arees-visas-banner.webp",imageWidth:2048,imageHeight:682,imageType:"image/webp",imageAlt:"إصدار التأشيرات حول العالم مع Arees Loop"});
export default function VisasPage(){return <><RequestServicePage kind="VISA"/><LicensedTravelOperator/></>;}
