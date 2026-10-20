import type { Metadata } from "next";
import TransportRequestPage from "@/app/transport/TransportRequestPage";
import { buildPageMetadata } from "@/lib/seo-metadata";
export const metadata: Metadata = buildPageMetadata({title:"حجز تذاكر تاركو وبدر للطيران",description:"وكيل حجز لتذاكر تاركو للطيران وبدر للطيران حسب التوفر. اطلب رحلة الخرطوم–جدة أو جدة–الخرطوم ومسارات أخرى، وتابع العروض والأسعار مع أريس لوب.",path:"/flights",image:"/Image/hero/arees-flight-banner.webp",imageWidth:2048,imageHeight:488,imageType:"image/webp",imageAlt:"حجوزات الطيران مع أريس لوب"});
export default function FlightsPage(){return <><TransportRequestPage kind="FLIGHT"/></>;}
