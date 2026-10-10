import {NextRequest} from "next/server";
import {get} from "@vercel/blob";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
import {hasAdminPermission} from "@/lib/admin-permissions";
import {canManagePartnerServices} from "@/lib/partner-permissions";
import {serviceEligibilityWhere} from "@/lib/services/eligibility";
import {isAreesStagingProject} from "@/lib/database-target.mjs";
import {publicServiceEligibilityWhere} from "@/lib/services/public-eligibility.mjs";
export const runtime="nodejs";
export async function GET(request:NextRequest){
 const pathname=request.nextUrl.searchParams.get("pathname");
 if(!pathname||(!pathname.startsWith("services/")&&!pathname.startsWith("partners/"))||pathname.includes("..")||pathname.includes("\\")||pathname.length>1000)return new Response("Not found",{status:404});
 const url="/api/media?pathname="+encodeURIComponent(pathname);
 if(pathname.startsWith("partners/")){
  const activePartner=await prisma.partner.findFirst({where:{status:"ACTIVE",logoUrl:url},select:{id:true}});
  if(!activePartner)return new Response("Not found",{status:404});
 }else{
  const published=await prisma.service.findFirst({where:{status:"PUBLISHED",...publicServiceEligibilityWhere(isAreesStagingProject(),serviceEligibilityWhere()),images:{some:{url}}},select:{id:true}});
  if(!published){
  const session=await getCurrentSession();
  let allowed=hasAdminPermission(session?.user,"CONTENT_EXPERIENCES");
  if(!allowed&&session){
   const member=await prisma.partnerMember.findFirst({where:{userId:session.user.id,isActive:true},orderBy:{createdAt:"desc"},select:{partnerId:true,permissions:true,partner:{select:{status:true}}}});
   if(member?.partner.status==="ACTIVE"&&canManagePartnerServices(member.permissions)){
    allowed=pathname.startsWith(`services/${session.user.id}/`)||!!await prisma.service.findFirst({where:{partnerId:member.partnerId,images:{some:{url}}},select:{id:true}});
   }
  }
  if(!allowed)return new Response("Not found",{status:404});
  }
 }
 const file=await get(pathname,{access:"private"});
 if(!file||file.statusCode!==200||!["image/jpeg","image/png","image/webp"].includes(file.blob.contentType))return new Response("Not found",{status:404});
 return new Response(file.stream,{headers:{"Content-Type":file.blob.contentType,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}
