import type {Metadata} from "next";
import {buildPageMetadata} from "@/lib/seo-metadata";
export const metadata:Metadata=buildPageMetadata({title:"سياسة الخصوصية",description:"اطلع على سياسة الخصوصية وآلية التعامل مع بيانات المستخدمين في منصة أريس لوب.",path:"/privacy-policy",image:"/Image/social/arees-loop-whatsapp-preview.png",imageWidth:1734,imageHeight:907,imageType:"image/png",imageAlt:"سياسة الخصوصية — AREES LOOP"});
export default function Layout({children}:{children:React.ReactNode}){return children;}
