import { Prisma } from "@/app/generated/prisma/client";
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
import {getPartnerAccessRole,partnerPermissionPreset} from "@/lib/partner-permissions";

export async function POST(request:Request){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"Login required"},{status:401});
 if(session.user.role!=="SUPER_ADMIN")return NextResponse.json({success:false,message:"Forbidden"},{status:403});
 const body=await request.json().catch(()=>null);
 const partnerId=body?.partnerId;
 const memberId=body?.memberId;
 const note=body?.evidenceNote;
 if(typeof partnerId!=="string"||typeof memberId!=="string"||typeof note!=="string"||note.trim().length<20||note.trim().length>2000||body?.confirmOwnershipVerified!==true)return NextResponse.json({success:false,message:"Verified evidence required"},{status:400});
 try{
  const result=await prisma.$transaction(async tx=>{
   const partner=await tx.partner.findUnique({where:{id:partnerId},select:{status:true}});
   if(partner?.status!=="ACTIVE")return "INACTIVE";
   const target=await tx.partnerMember.findFirst({where:{id:memberId,partnerId,isActive:true},select:{permissions:true,userId:true,updatedAt:true,user:{select:{emailVerifiedAt:true,status:true}}}});
   if(!target||getPartnerAccessRole(target.permissions)!=="LEGACY"||!target.user.emailVerifiedAt||target.user.status!=="ACTIVE")return "INVALID";
   const members=await tx.partnerMember.findMany({where:{partnerId,isActive:true},select:{permissions:true}});
   if(members.some(m=>getPartnerAccessRole(m.permissions)==="OWNER"))return "EXISTS";
   const updated=await tx.partnerMember.updateMany({where:{id:memberId,partnerId,isActive:true,updatedAt:target.updatedAt},data:{permissions:partnerPermissionPreset("OWNER")}});
   if(updated.count!==1)return "CONFLICT";
   await tx.auditLog.create({data:{userId:session.user.id,action:"PARTNER_OWNER_VERIFIED",entityType:"PartnerMember",entityId:memberId,beforeData:{partnerId,role:"LEGACY"},afterData:{partnerId,userId:target.userId,role:"OWNER",evidenceNote:note.trim()}}});
   return "OK";
  },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});
  return NextResponse.json({success:result==="OK",result},{status:result==="OK"?200:409});
 }catch(error){console.error("Owner verification failed",error);if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2034")return NextResponse.json({success:false,message:"Concurrent ownership change. Retry after refreshing."},{status:409});return NextResponse.json({success:false,message:"Internal error"},{status:500});}
}
