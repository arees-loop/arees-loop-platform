import type {Metadata} from "next";
import {buildPageMetadata} from "@/lib/seo-metadata";
export const metadata:Metadata=buildPageMetadata({title:"المرشدون السياحيون",description:"تعرّف على المرشدين السياحيين المتاحين واستكشف دليل المرشدين في أريس لوب.",path:"/guides",image:"/api/og/guides?type=directory",imageWidth:1200,imageHeight:630,imageType:"image/png",imageAlt:"المرشدون السياحيون — AREES LOOP"});
export default function Layout({children}:{children:React.ReactNode}){return children;}
