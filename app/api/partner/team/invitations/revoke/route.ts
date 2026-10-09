import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
import {canManagePartnerTeam} from "@/lib/partner-permissions";

export async function POST(request:Request){
 try{
  const session=await getCurrentSession();
  if(!session)return NextResponse.json({success:false,message:"يجب تسجيل الدخول."},{status:401});
  const body=await request.json().catch(()=>null);
  const invitationId=typeof body?.invitationId==="string"?body.invitationId.trim():"";
  if(!invitationId)return NextResponse.json({success:false,message:"حدد الدعوة."},{status:400});
  const actor=await prisma.partnerMember.findFirst({where:{userId:session.user.id,isActive:true},orderBy:{createdAt:"desc"},select:{id:true,partnerId:true,permissions:true,partner:{select:{status:true}}}});
  if(!actor||actor.partner.status!=="ACTIVE"||!canManagePartnerTeam(actor.permissions))return NextResponse.json({success:false,message:"غير مصرح."},{status:403});
  const result=await prisma.$transaction(async tx=>{
   const current=await tx.partnerMember.findFirst({where:{id:actor.id,isActive:true},select:{permissions:true}});
   if(!current||!canManagePartnerTeam(current.permissions))return false;
   const changed=await tx.partnerInvitation.updateMany({where:{id:invitationId,partnerId:actor.partnerId,acceptedAt:null,revokedAt:null},data:{revokedAt:new Date()}});
   if(changed.count!==1)return false;
   await tx.auditLog.create({data:{userId:session.user.id,action:"PARTNER_TEAM_INVITATION_REVOKED",entityType:"PartnerInvitation",entityId:invitationId,afterData:{partnerId:actor.partnerId}}});
   return true;
  });
  return result?NextResponse.json({success:true,message:"تم إلغاء الدعوة."}):NextResponse.json({success:false,message:"الدعوة غير متاحة للإلغاء."},{status:409});
 }catch(error){console.error("Revoke partner invitation failed:",error);return NextResponse.json({success:false,message:"تعذر إلغاء الدعوة."},{status:500});}
}
