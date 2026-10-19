import type {Metadata} from "next";
import {prisma} from "@/lib/prisma";
import {buildPageMetadata} from "@/lib/seo-metadata";
export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
 const {id}=await params;
 try{
  const event=await prisma.publicEvent.findFirst({
   where:{id,status:"PUBLISHED",partner:{partnerType:"GOVERNMENT_NONPROFIT",status:"ACTIVE"}},
   select:{nameAr:true,descriptionAr:true,posterUrl:true,city:true}
  });
  if(!event)return {title:"البرنامج غير متاح",robots:{index:false,follow:false}};
  const desc=(event.descriptionAr||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
  const image=event.posterUrl||"/Image/social/arees-loop-whatsapp-preview.png";
  const clean=image.toLowerCase().split("?")[0];
  return buildPageMetadata({
    title:event.nameAr+" — "+event.city,
    description:(desc||"تفاصيل البرنامج أو الفعالية المنشورة عبر أريس لوب.").slice(0,160),
    path:"/events/"+encodeURIComponent(id),image,
    imageWidth:1200,imageHeight:630,
    imageType:clean.endsWith(".png")?"image/png":/\.jpe?g$/i.test(clean)?"image/jpeg":"image/webp",
    imageAlt:event.nameAr
  });
 }catch{return {title:"تفاصيل البرنامج غير متاحة",robots:{index:false,follow:false}};}
}
export default function Layout({children}:{children:React.ReactNode}){return children;}
