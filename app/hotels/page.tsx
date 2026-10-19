import TravelAgencyIdentity from "@/app/components/TravelAgencyIdentity";
import type { Metadata } from "next";
import HotelsClient from "./HotelsClient";
import { buildPageMetadata } from "@/lib/seo-metadata";
export const metadata: Metadata = buildPageMetadata({title:"حجوزات الفنادق",description:"اكتشف عروض الفنادق وأرسل طلب الإقامة المناسب لوجهتك وتواريخ سفرك عبر أريس لوب.",path:"/hotels",image:"/Image/hero/arees-hotel-banner.webp",imageWidth:2048,imageHeight:488,imageType:"image/webp",imageAlt:"حجوزات الفنادق مع أريس لوب"});
export default function HotelsPage(){return <><TravelAgencyIdentity/><HotelsClient/></>;}
