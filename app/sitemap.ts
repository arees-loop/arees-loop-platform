import type {MetadataRoute} from "next";
import {prisma} from "@/lib/prisma";

export const dynamic="force-dynamic";
const SITE="https://www.areesloop.com";
const fixed=[
 "/","/flights","/ferries","/visas","/hotels","/international-driving-license",
 "/discover","/services","/events","/guides","/guides/directory",
 "/guides/register","/programs/saudi","/programs/international",
 "/privacy-policy","/terms",
] as const;
type Row={id:string;updatedAt:Date};
function item(path:string,lastModified?:Date):MetadataRoute.Sitemap[number]{
 return {url:SITE+path,lastModified,changeFrequency:"weekly",priority:path==="/"?1:0.7};
}
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const now=new Date();
 const entries:MetadataRoute.Sitemap=fixed.map(path=>item(path));
 const current=[{OR:[{startsAt:null},{startsAt:{lte:now}}]},{OR:[{endsAt:null},{endsAt:{gte:now}}]}];
 // Only actually published/visible records become crawlable URLs.
 // Failure to access the database never produces invented listings.
 const [services,hotels,visas,events]=await Promise.allSettled([
  prisma.service.findMany({where:{status:"PUBLISHED"},select:{id:true,updatedAt:true},take:2000}),
  prisma.hotelOffer.findMany({where:{isVisible:true,deletedAt:null,AND:current},select:{id:true,updatedAt:true},take:1000}),
  prisma.transportOffer.findMany({where:{kind:"VISA",isVisible:true,deletedAt:null,AND:current},select:{id:true,updatedAt:true},take:1000}),
  prisma.publicEvent.findMany({where:{status:"PUBLISHED",partner:{partnerType:"GOVERNMENT_NONPROFIT",status:"ACTIVE"}},select:{id:true,updatedAt:true},take:1000})
 ]);
 function append(result:PromiseSettledResult<Row[]>,prefix:string){
  if(result.status!=="fulfilled"){console.error("Sitemap query unavailable:",prefix);return;}
  for(const row of result.value)entries.push(item(prefix+"/"+encodeURIComponent(row.id),row.updatedAt));
 }
 append(services,"/services");append(hotels,"/hotels");append(visas,"/visas");append(events,"/events");
 return entries;
}
