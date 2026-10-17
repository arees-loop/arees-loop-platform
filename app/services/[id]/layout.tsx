import type {Metadata} from "next";
import {prisma} from "@/lib/prisma";
import {buildPageMetadata} from "@/lib/seo-metadata";
export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
 const {id}=await params;
 const service=await prisma.service.findFirst({where:{id,status:"PUBLISHED"},select:{nameAr:true,descriptionAr:true,images:{orderBy:{sortOrder:"asc"},take:1,select:{url:true}}}});
 if(!service)return {title:"الخدمة غير متاحة",robots:{index:false,follow:false}};
 const image=service.images[0]?.url||"/Image/social/arees-loop-whatsapp-preview.png";
 const description=(service.descriptionAr||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().slice(0,180)||"اكتشف تفاصيل التجربة عبر أريس لوب";
 return buildPageMetadata({title:service.nameAr,description,path:`/services/${encodeURIComponent(id)}`,image,imageWidth:1200,imageHeight:630,imageType:image.includes(".png")?"image/png":image.includes(".jpg")||image.includes(".jpeg")?"image/jpeg":"image/webp",imageAlt:service.nameAr});
}
export default function Layout({children}:{children:React.ReactNode}){return children;}
