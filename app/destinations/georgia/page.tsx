import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {buildPageMetadata} from "@/lib/seo-metadata";
import {publishedPrograms} from "@/app/programs/program-data";
import ProgramsListing from "@/app/programs/ProgramsListing";

export const dynamic="force-dynamic";
export async function generateMetadata():Promise<Metadata>{
 const offers=await publishedPrograms("georgia").catch(()=>[]);
 if(!offers.length)return {title:"برامج جورجيا غير منشورة",robots:{index:false,follow:false}};
 return buildPageMetadata({
  title:"السياحة في جورجيا — البرامج والعروض المنشورة",
  description:"اكتشف برامج وتجارب جورجيا المعتمدة والمنشورة عبر أريس لوب مع تفاصيل العروض وطلبات السفر المتاحة.",
  path:"/destinations/georgia",
  image:"/api/og/discover?type=international",imageWidth:1200,imageHeight:630,imageType:"image/png",
  imageAlt:"برامج السياحة في جورجيا — أريس لوب"
 });
}
export default async function GeorgiaDestination(){
 const offers=await publishedPrograms("georgia").catch(()=>[]);
 if(!offers.length)notFound();
 return <ProgramsListing scope="georgia" title="برامج السياحة في جورجيا" intro="اطّلع على الخدمات والبرامج السياحية المنشورة فعلياً لجورجيا عبر أريس لوب. تفاصيل كل خدمة ومواعيدها وشروط الحجز موجودة في صفحتها." banner="/Image/hero/world-destinations-hero.webp" back="/programs/international"/>;
}
