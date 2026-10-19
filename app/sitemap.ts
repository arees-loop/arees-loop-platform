import type {MetadataRoute} from "next";
import {prisma} from "@/lib/prisma";
export const dynamic="force-dynamic";
const SITE="https://www.areesloop.com";
const main=[
 ["/",1],["/flights",0.9],["/ferries",0.9],["/hotels",0.9],
 ["/visas",0.9],["/international-driving-license",0.8],
 ["/programs",0.8],["/discover",0.9],["/services",0.9],
 ["/events",0.75],["/guides",0.75],["/guides/directory",0.8],
 ["/guides/register",0.5],["/partner/government",0.5],
 ["/privacy-policy",0.3],["/terms",0.3]
] as const;
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const entries:MetadataRoute.Sitemap=main.map(([path,priority])=>({
   url:SITE+path,priority,changeFrequency:"weekly"
 }));
 const append=(path:string,date:Date)=>entries.push({
   url:SITE+path,lastModified:date,priority:0.6,changeFrequency:"weekly"
 });
 try{
   const now=new Date();
   const [services,hotels,visas,events]=await Promise.all([
    prisma.service.findMany({where:{status:"PUBLISHED"},select:{id:true,updatedAt:true},take:3000}),
    prisma.hotelOffer.findMany({where:{isVisible:true,deletedAt:null,AND:[{OR:[{startsAt:null},{startsAt:{lte:now}}]},{OR:[{endsAt:null},{endsAt:{gte:now}}]}]},select:{id:true,updatedAt:true},take:1500}),
    prisma.transportOffer.findMany({where:{kind:"VISA",isVisible:true,deletedAt:null,AND:[{OR:[{startsAt:null},{startsAt:{lte:now}}]},{OR:[{endsAt:null},{endsAt:{gte:now}}]}]},select:{id:true,updatedAt:true},take:1500}),
    prisma.publicEvent.findMany({where:{status:"PUBLISHED",partner:{partnerType:"GOVERNMENT_NONPROFIT",status:"ACTIVE"}},select:{id:true,updatedAt:true},take:1500})
   ]);
   for(const x of services)append("/services/"+encodeURIComponent(x.id),x.updatedAt);
   for(const x of hotels)append("/hotels/"+encodeURIComponent(x.id),x.updatedAt);
   for(const x of visas)append("/visas/"+encodeURIComponent(x.id),x.updatedAt);
   for(const x of events)append("/events/"+encodeURIComponent(x.id),x.updatedAt);
 }catch(error){
   // A database outage must never publish unpublished or mock content.
   console.error("Sitemap published route lookup unavailable",error);
 }
 return entries;
}
