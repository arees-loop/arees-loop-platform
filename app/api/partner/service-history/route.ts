import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
export async function GET(){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"يجب تسجيل الدخول."},{status:401});
 const membership=await prisma.partnerMember.findFirst({where:{userId:session.user.id,isActive:true},select:{partnerId:true}});
 if(!membership)return NextResponse.json({success:false,message:"غير مصرح."},{status:403});
 const services=await prisma.service.findMany({where:{partnerId:membership.partnerId},select:{id:true,nameAr:true}});
 const ids=services.map(s=>s.id);
 const logs=await prisma.auditLog.findMany({where:{entityType:"Service",entityId:{in:ids}},orderBy:{createdAt:"desc"},take:150,include:{user:{select:{firstName:true,lastName:true,email:true}}}});
 return NextResponse.json({success:true,data:logs.map(log=>({id:log.id,action:log.action,createdAt:log.createdAt,serviceName:services.find(s=>s.id===log.entityId)?.nameAr||String((log.beforeData as {nameAr?:string}|null)?.nameAr||"خدمة محذوفة"),employee:[log.user?.firstName,log.user?.lastName].filter(Boolean).join(" ")||log.user?.email||"مستخدم سابق",beforeData:log.beforeData,afterData:log.afterData}))});
}
