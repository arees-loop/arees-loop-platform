import type { Metadata } from "next";
import TransportRequestPage from "@/app/transport/TransportRequestPage";
import { buildPageMetadata } from "@/lib/seo-metadata";
export const metadata: Metadata = buildPageMetadata({title:"حجز تذاكر البواخر جدة سواكن",description:"وكيل حجز لباخرة تاركو وعمان ودليلة وجودي ومونتي حسب التوفر. اطلب تذاكر جدة–سواكن أو سواكن–جدة، وتابع العروض والمواعيد مع أريس لوب.",path:"/ferries",image:"/Image/hero/arees-ferry-banner.webp",imageWidth:2048,imageHeight:488,imageType:"image/webp",imageAlt:"حجوزات البواخر مع أريس لوب"});
export default function FerriesPage(){return <><TransportRequestPage kind="FERRY"/></>;}
