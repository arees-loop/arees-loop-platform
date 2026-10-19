import type {MetadataRoute} from "next";
import {prisma} from "@/lib/prisma";

export const dynamic="force-dynamic";
const site="https://www.areesloop.com";
const url=(pathname:string)=>site+pathname;

const publicRoutes=[
 "/","/flights","/ferries","/hotels","/visas","/international-driving-license",
 "/services","/discover","/events","/guides","/guides/directory",
 "/programs","/programs/local","/programs/international",
 "/privacy-policy","/terms",
] as const;

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const now=new Date();
 const listed:MetadataRoute.Sitemap=publicRoutes.map(path=>({
  url:url(path),lastModified:now,changeFrequency:path==="/"?"daily":"weekly",
  priority:path==="/"?1:["/flights","/ferries","/visas","/programs"].includes(path)?0.9:0.7,
 }));
 const active=[{OR:[{startsAt:null},{startsAt:{lte:now}}]},{OR:[{endsAt:null},{endsAt:{gte:now}}]}];
 // One failing content source must not conceal other valid public URLs.
 const queryResults=await Promise.allSettled([
  prisma.service.findMany({
   where:{status:"PUBLISHED"},
   orderBy:{updatedAt:"desc"},take:1500,
   select:{id:true,updatedAt:true,countryCode:true,country:true}
  }),
  prisma.hotelOffer.findMany({
   where:{isVisible:true,deletedAt:null,AND:active},
   orderBy:{updatedAt:"desc"},take:700,select:{id:true,updatedAt:true}
  }),
  prisma.transportOffer.findMany({
   where:{kind:"VISA",isVisible:true,deletedAt:null,AND:active},
   orderBy:{updatedAt:"desc"},take:700,select:{id:true,updatedAt:true}
  }),
  prisma.publicEvent.findMany({
   where:{status:"PUBLISHED",partner:{partnerType:"GOVERNMENT_NONPROFIT",status:"ACTIVE"}},
   orderBy:{updatedAt:"desc"},take:500,select:{id:true,updatedAt:true}
  }),
  prisma.partner.findMany({
   where:{partnerType:"INDIVIDUAL",status:"ACTIVE",licenses:{some:{
     status:"VERIFIED",expiryDate:{gt:now},
     OR:[{type:{contains:"إرشاد"}},{type:{contains:"GUIDE",mode:"insensitive"}}]
   }}},orderBy:{updatedAt:"desc"},take:600,select:{id:true,updatedAt:true}
  }),
 ]);
 const [services,hotels,visas,events,guides]=queryResults;
 if(services.status==="fulfilled"){
  for(const item of services.value)
   listed.push({url:url("/services/"+encodeURIComponent(item.id)),lastModified:item.updatedAt,changeFrequency:"weekly",priority:0.6});
  const georgia=services.value.some(x=>x.countryCode?.toUpperCase()==="GE"||["georgia","جورجيا"].includes((x.country||"").trim().toLowerCase()));
  if(georgia)listed.push({url:url("/destinations/georgia"),lastModified:now,changeFrequency:"weekly",priority:0.7});
 }
 if(hotels.status==="fulfilled")for(const item of hotels.value)
  listed.push({url:url("/hotels/"+encodeURIComponent(item.id)),lastModified:item.updatedAt,changeFrequency:"weekly",priority:0.6});
 if(visas.status==="fulfilled")for(const item of visas.value)
  listed.push({url:url("/visas/"+encodeURIComponent(item.id)),lastModified:item.updatedAt,changeFrequency:"weekly",priority:0.6});
 if(events.status==="fulfilled")for(const item of events.value)
  listed.push({url:url("/events/"+encodeURIComponent(item.id)),lastModified:item.updatedAt,changeFrequency:"weekly",priority:0.6});
 if(guides.status==="fulfilled")for(const item of guides.value)
  listed.push({url:url("/guides/"+encodeURIComponent(item.id)),lastModified:item.updatedAt,changeFrequency:"weekly",priority:0.6});
 return listed;
}
