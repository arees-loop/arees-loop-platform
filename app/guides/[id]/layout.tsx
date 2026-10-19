import type {Metadata} from "next";
import {prisma} from "@/lib/prisma";
import {buildPageMetadata} from "@/lib/seo-metadata";
export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
 const {id}=await params;
 try{
  const guide=await prisma.partner.findFirst({
   where:{id,partnerType:"INDIVIDUAL",status:"ACTIVE",licenses:{some:{
    status:"VERIFIED",expiryDate:{gt:new Date()},OR:[
      {type:{contains:"إرشاد"}},{type:{contains:"GUIDE",mode:"insensitive"}}
    ]}}},
   select:{publicName:true,legalNameAr:true,descriptionAr:true,city:true,logoUrl:true}
  });
  if(!guide)return {title:"ملف المرشد غير متاح",robots:{index:false,follow:false}};
  const name=guide.publicName||guide.legalNameAr;
  return buildPageMetadata({
   title:"المرشد السياحي "+name,
   description:((guide.descriptionAr||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim()||"تفاصيل المرشد السياحي في "+(guide.city||"السعودية")).slice(0,160),
   path:"/guides/"+encodeURIComponent(id),
   image:guide.logoUrl||"/api/og/guides?type=directory",
   imageWidth:1200,imageHeight:630,
   imageType:guide.logoUrl?.toLowerCase().split("?")[0].endsWith(".webp")?"image/webp":guide.logoUrl?.toLowerCase().split("?")[0].endsWith(".jpg")?"image/jpeg":"image/png",
   imageAlt:"المرشد السياحي "+name
  });
 }catch{return {title:"ملف المرشد غير متاح",robots:{index:false,follow:false}};}
}
export default function Layout({children}:{children:React.ReactNode}){return children;}
