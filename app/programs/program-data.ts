import "server-only";
import {prisma} from "@/lib/prisma";

export type ProgramCard={
 id:string;title:string;description:string;city:string;country:string;category:string;
 price:number;image:string;
};
const saNames=new Set(["sa","السعودية","المملكة العربية السعودية","saudi arabia","kingdom of saudi arabia"]);
function inSaudi(countryCode:string|null,country:string|null){
 return countryCode?.toUpperCase()==="SA"||saNames.has((country||"").trim().toLowerCase());
}
function isGeorgia(countryCode:string|null,country:string|null){
 return countryCode?.toUpperCase()==="GE"||["georgia","جورجيا"].includes((country||"").trim().toLowerCase());
}
export async function publishedPrograms(scope:"local"|"international"|"georgia"):Promise<ProgramCard[]>{
 const raw=await prisma.service.findMany({
  where:{status:"PUBLISHED"},orderBy:{updatedAt:"desc"},take:1000,
  select:{id:true,nameAr:true,descriptionAr:true,category:true,city:true,country:true,countryCode:true,
    finalPrice:true,images:{orderBy:{sortOrder:"asc"},take:1,select:{url:true}}}
 });
 return raw.filter(s=>scope==="georgia"?isGeorgia(s.countryCode,s.country):
  scope==="local"?inSaudi(s.countryCode,s.country):
  Boolean(s.countryCode||s.country)&&!inSaudi(s.countryCode,s.country)
 ).slice(0,48).map(s=>({
  id:s.id,title:s.nameAr,description:(s.descriptionAr||"").replace(/<[^>]*>/g," ").trim().slice(0,170),
  city:s.city||"",country:s.country||s.countryCode||"",category:s.category,
  price:Number(s.finalPrice),image:s.images[0]?.url||"/Image/social/arees-loop-whatsapp-preview.png",
 }));
}
