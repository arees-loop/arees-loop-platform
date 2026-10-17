import type {Metadata} from "next";
import {prisma} from "@/lib/prisma";
import {buildPageMetadata} from "@/lib/seo-metadata";
export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
 const {id}=await params;
 const now=new Date();
 const offer=await prisma.transportOffer.findFirst({where:{id,kind:"VISA",deletedAt:null,isVisible:true,AND:[{OR:[{startsAt:null},{startsAt:{lte:now}}]},{OR:[{endsAt:null},{endsAt:{gte:now}}]}]},select:{title:true,description:true,bannerUrl:true,imageUrls:true}});
 if(!offer)return {title:"التأشيرة غير متاحة",robots:{index:false,follow:false}};
 const images=Array.isArray(offer.imageUrls)?offer.imageUrls.filter((x):x is string=>typeof x==="string"&&x.trim().length>0):[];
 const image=[...images,offer.bannerUrl].find((value)=>{if(typeof value!=="string")return false;try{const url=new URL(value,"https://www.areesloop.com");return (url.protocol==="https:"||url.protocol==="http:")&&Boolean(url.hostname)}catch{return false}})||"/Image/social/arees-loop-whatsapp-preview.png";
 return buildPageMetadata({title:offer.title,description:offer.description||"تفاصيل التأشيرة ومتطلبات التقديم عبر أريس لوب",path:`/visas/${encodeURIComponent(id)}`,image,imageWidth:1200,imageHeight:630,imageType:image.toLowerCase().split("?")[0].endsWith(".png")?"image/png":/\.jpe?g$/i.test(image.split("?")[0])?"image/jpeg":"image/webp",imageAlt:offer.title});
}
export default function Layout({children}:{children:React.ReactNode}){return children;}
