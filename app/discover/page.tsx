import type { Metadata } from "next";
import { Suspense } from "react";
import DiscoverClient from "./DiscoverClient";
import { buildPageMetadata } from "@/lib/seo-metadata";
type Props={searchParams:Promise<{type?:string;destination?:string}>};
export async function generateMetadata({searchParams}:Props):Promise<Metadata>{
 const {type}=await searchParams;
 const data:Record<string,{title:string;description:string}>={
  domestic:{title:"برامج سياحية محلية",description:"اكتشف برامج سياحية داخل المملكة تجمع الوجهات والأنشطة المحلية في رحلة واحدة."},
  international:{title:"برامج سياحية عالمية",description:"خطط رحلتك إلى وجهات عالمية مع برامج سياحية وخيارات تناسب اهتماماتك."},
  cruise:{title:"رحلات الكروز",description:"اكتشف رحلات الكروز البحرية، الوجهات، والخدمات المتاحة لرحلتك القادمة."},
  experiences:{title:"التجارب والأنشطة السياحية",description:"تصفح التجارب والأنشطة السياحية واختر ما يناسب رحلتك واهتماماتك."},
 };
 const key=type&&data[type]?type:"experiences",item=data[key];
 return buildPageMetadata({title:item.title,description:item.description,path:key==="experiences"?"/discover":"/discover?type="+key,image:key==="domestic"?"/Image/hero/saudi-panorama-hero.jpg":key==="international"?"/Image/hero/world-destinations-hero.webp":key==="cruise"?"/Image/hero/arees-ferry-photo.webp":"/Image/social/arees-loop-whatsapp-preview.png",imageWidth:key==="experiences"?1734:1920,imageHeight:key==="experiences"?907:1080,imageType:key==="domestic"?"image/jpeg":key==="experiences"?"image/png":"image/webp",imageAlt:item.title+" | أريس لوب"});
}
export default function DiscoverPage(){return <Suspense fallback={<main dir="rtl" className="min-h-screen bg-[#F7F4ED] pt-32 text-center">جاري تحميل التجارب...</main>}><DiscoverClient/></Suspense>;}
