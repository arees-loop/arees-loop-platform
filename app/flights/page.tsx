import TravelAgencyIdentity from "@/app/components/TravelAgencyIdentity";
import type { Metadata } from "next";
import TransportRequestPage from "@/app/transport/TransportRequestPage";
import { buildPageMetadata } from "@/lib/seo-metadata";
export const metadata: Metadata = buildPageMetadata({title:"حجوزات الطيران",description:"ابحث عن رحلة الطيران المناسبة، وأرسل طلبك لمتابعة الخيارات والأسعار مع فريق أريس لوب.",path:"/flights",image:"/Image/hero/arees-flight-banner.webp",imageWidth:2048,imageHeight:488,imageType:"image/webp",imageAlt:"حجوزات الطيران مع أريس لوب"});
export default function FlightsPage(){return <><TravelAgencyIdentity/><TransportRequestPage kind="FLIGHT"/></>;}
