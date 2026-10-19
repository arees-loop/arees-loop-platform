import type {Metadata} from "next";
import {buildPageMetadata} from "@/lib/seo-metadata";
export const metadata:Metadata=buildPageMetadata({title:"الشروط والأحكام",description:"الشروط والأحكام المنظمة لاستخدام منصة أريس لوب والخدمات والحجوزات المتاحة.",path:"/terms",image:"/Image/social/arees-loop-whatsapp-preview.png",imageWidth:1734,imageHeight:907,imageType:"image/png",imageAlt:"الشروط والأحكام — AREES LOOP"});
export default function Layout({children}:{children:React.ReactNode}){return children;}
