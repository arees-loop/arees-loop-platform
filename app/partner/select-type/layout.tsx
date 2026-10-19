import type {Metadata} from "next";
import {buildPageMetadata} from "@/lib/seo-metadata";
export const metadata:Metadata=buildPageMetadata({title:"انضم إلى شركاء أريس لوب",description:"اختر فئة التسجيل كشريك لتقديم الخدمات أو التجارب السياحية عبر أريس لوب.",path:"/partner/select-type",image:"/Image/social/arees-partner-share.webp",imageWidth:1254,imageHeight:1254,imageType:"image/webp",imageAlt:"انضم إلى شركاء أريس لوب — AREES LOOP"});
export default function Layout({children}:{children:React.ReactNode}){return children;}
