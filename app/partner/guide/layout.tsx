import type {Metadata} from "next";
import {buildPageMetadata} from "@/lib/seo-metadata";
export const metadata:Metadata=buildPageMetadata({title:"أريس لوب لشركاء الرحلات والتجارب",description:"تعرف على خطوات عرض الخدمات والحجوزات للشركاء المرخصين في منصة أريس لوب.",path:"/partner/guide",image:"/Image/social/arees-partner-share.webp",imageWidth:1254,imageHeight:1254,imageType:"image/webp",imageAlt:"أريس لوب لشركاء الرحلات والتجارب — AREES LOOP"});
export default function Layout({children}:{children:React.ReactNode}){return children;}
