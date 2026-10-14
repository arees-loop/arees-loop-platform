import type { Metadata } from "next";
import TransportRequestPage from "@/app/transport/TransportRequestPage";
import { buildPageMetadata } from "@/lib/seo-metadata";
export const metadata: Metadata = buildPageMetadata({title:"حجوزات البواخر",description:"خطط لرحلتك البحرية بين سواكن وجدة. أرسل طلب الحجز وتابع مواعيد الإبحار والعروض مع أريس لوب.",path:"/ferries",image:"/Image/hero/arees-ferry-banner.webp",imageWidth:2048,imageHeight:488,imageType:"image/webp",imageAlt:"حجوزات البواخر مع أريس لوب"});
export default function FerriesPage(){return <TransportRequestPage kind="FERRY"/>;}
