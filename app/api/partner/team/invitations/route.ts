import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { canManagePartnerTeam, getPartnerAccessRole } from "@/lib/partner-permissions";

const hashToken=(token:string)=>createHash("sha256").update(token).digest("hex");
const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(){
 try{
  const session=await getCurrentSession();
  if(!session)return NextResponse.json({success:false,message:"يجب تسجيل الدخول."},{status:401});
  const actor=await prisma.partnerMember.findFirst({where:{userId:session.user.id,isActive:true},orderBy:{createdAt:"desc"},select:{partnerId:true,permissions:true,partner:{select:{status:true}}}});
  if(!actor||actor.partner.status!=="ACTIVE"||!canManagePartnerTeam(actor.permissions))return NextResponse.json({success:false,message:"غير مصرح."},{status:403});
  const invitations=await prisma.partnerInvitation.findMany({where:{partnerId:actor.partnerId},select:{id:true,email:true,role:true,jobTitle:true,expiresAt:true,acceptedAt:true,revokedAt:true,createdAt:true},orderBy:{createdAt:"desc"},take:100});
  return NextResponse.json({success:true,invitations});
 }catch(error){console.error("GET /api/partner/team/invitations failed:",error);return NextResponse.json({success:false,message:"تعذر تحميل الدعوات."},{status:500});}
}

export async function POST(request:Request){
 try{
  const session=await getCurrentSession();
  if(!session)return NextResponse.json({success:false,message:"يجب تسجيل الدخول."},{status:401});
  const body=await request.json().catch(()=>null);
  const email=typeof body?.email==="string"?body.email.trim().toLowerCase():"";
  const role=body?.role;
  const jobTitle=typeof body?.jobTitle==="string"?body.jobTitle.trim().slice(0,120):null;
  if(!emailPattern.test(email)||email.length>254||!["MANAGER","EMPLOYEE"].includes(role))return NextResponse.json({success:false,message:"البريد الإلكتروني أو الدور غير صالح."},{status:400});
  const actor=await prisma.partnerMember.findFirst({where:{userId:session.user.id,isActive:true},orderBy:{createdAt:"desc"},select:{id:true,partnerId:true,permissions:true,partner:{select:{status:true}}}});
  if(!actor||actor.partner.status!=="ACTIVE"||!canManagePartnerTeam(actor.permissions))return NextResponse.json({success:false,message:"غير مصرح بإرسال الدعوات."},{status:403});
  if(role==="MANAGER"&&getPartnerAccessRole(actor.permissions)!=="OWNER")return NextResponse.json({success:false,message:"تعيين المدير من صلاحيات المالك فقط."},{status:403});
  const existingUser=await prisma.user.findUnique({where:{email},select:{id:true}});
  if(existingUser){
   const existingMember=await prisma.partnerMember.findUnique({where:{partnerId_userId:{partnerId:actor.partnerId,userId:existingUser.id}},select:{id:true}});
   if(existingMember)return NextResponse.json({success:false,message:"هذا الحساب مرتبط بالمنشأة بالفعل."},{status:409});
  }
  const pending=await prisma.partnerInvitation.findFirst({where:{partnerId:actor.partnerId,email,acceptedAt:null,revokedAt:null,expiresAt:{gt:new Date()}},select:{id:true}});
  if(pending)return NextResponse.json({success:false,message:"توجد دعوة سارية لهذا البريد بالفعل."},{status:409});
  const token=randomBytes(32).toString("hex");
  const invitation=await prisma.$transaction(async tx=>{
   const current=await tx.partnerMember.findFirst({where:{id:actor.id,isActive:true,partnerId:actor.partnerId},select:{permissions:true}});
   if(!current||!canManagePartnerTeam(current.permissions)||(role==="MANAGER"&&getPartnerAccessRole(current.permissions)!=="OWNER"))return null;
   const created=await tx.partnerInvitation.create({data:{partnerId:actor.partnerId,invitedByUserId:session.user.id,email,role,jobTitle,tokenHash:hashToken(token),expiresAt:new Date(Date.now()+7*24*60*60*1000)}});
   await tx.auditLog.create({data:{userId:session.user.id,action:"PARTNER_TEAM_INVITATION_CREATED",entityType:"PartnerInvitation",entityId:created.id,afterData:{partnerId:actor.partnerId,email,role}}});
   return created;
  });
  if(!invitation)return NextResponse.json({success:false,message:"لم تعد لديك صلاحية إرسال الدعوة."},{status:403});
  // No mail transport is configured here. Do not expose the bearer token in API responses.
  return NextResponse.json({success:true,id:invitation.id,message:"تم إنشاء الدعوة. الإرسال بالبريد غير مفعل بعد."},{status:201});
 }catch(error){console.error("POST /api/partner/team/invitations failed:",error);return NextResponse.json({success:false,message:"تعذر إنشاء الدعوة."},{status:500});}
}
