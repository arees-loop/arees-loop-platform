import {createHash} from "node:crypto";
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
import {partnerPermissionPreset} from "@/lib/partner-permissions";

export async function POST(request:Request){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"سجل الدخول أولاً."},{status:401});
 if(!session.user.emailVerifiedAt)return NextResponse.json({success:false,message:"وثّق بريدك الإلكتروني أولاً."},{status:403});
 const {token}=await request.json().catch(()=>({token:null}));
 if(typeof token!=="string"||token.length!==64)return NextResponse.json({success:false,message:"الرابط غير صالح."},{status:400});
 const tokenHash=createHash("sha256").update(token).digest("hex");
 const invitation=await prisma.partnerInvitation.findUnique({where:{tokenHash},include:{partner:true}});
 if(!invitation||invitation.revokedAt||invitation.acceptedAt||invitation.expiresAt<=new Date())return NextResponse.json({success:false,message:"الدعوة منتهية أو غير صالحة."},{status:410});
 if(invitation.partner.status!=="ACTIVE"||invitation.email.toLowerCase()!==session.user.email.toLowerCase())return NextResponse.json({success:false,message:"هذه الدعوة لا تخص حسابك أو المنشأة غير نشطة."},{status:403});
 if(invitation.role!=="EMPLOYEE"&&invitation.role!=="MANAGER")return NextResponse.json({success:false,message:"الدور غير صالح."},{status:400});
 try{
  await prisma.$transaction(async tx=>{
   const claim=await tx.partnerInvitation.updateMany({where:{id:invitation.id,acceptedAt:null,revokedAt:null,expiresAt:{gt:new Date()}},data:{acceptedAt:new Date()}});
   if(claim.count!==1)throw new Error("INVITATION_ALREADY_USED");
   await tx.partnerMember.create({data:{partnerId:invitation.partnerId,userId:session.user.id,jobTitle:invitation.jobTitle,permissions:partnerPermissionPreset(invitation.role as "EMPLOYEE"|"MANAGER")}});
   await tx.auditLog.create({data:{userId:session.user.id,action:"PARTNER_TEAM_INVITATION_ACCEPTED",entityType:"PartnerInvitation",entityId:invitation.id,afterData:{partnerId:invitation.partnerId,userId:session.user.id,role:invitation.role}}});
  });
  return NextResponse.json({success:true,message:"تم قبول الدعوة."});
 }catch(error){
  console.error("Partner invitation acceptance failed:",error);
  return NextResponse.json({success:false,message:"تعذر قبول الدعوة. ربما لديك عضوية سابقة."},{status:409});
 }
}
