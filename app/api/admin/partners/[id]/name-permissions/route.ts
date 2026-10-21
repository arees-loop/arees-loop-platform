import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import {getPartnerNameEditPermissions,PARTNER_NAME_PERMISSION_REASON} from "@/lib/partner-name-edit-permissions";

export async function GET(_:Request,ctx:{params:Promise<{id:string}>}){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"يجب تسجيل الدخول"},{status:401});
 if(session.user.role!=="SUPER_ADMIN")return NextResponse.json({success:false,message:"متاح للسوبر أدمن فقط"},{status:403});
 const {id}=await ctx.params;
 const partner=await prisma.partner.findUnique({where:{id},select:{id:true}});
 if(!partner)return NextResponse.json({success:false,message:"الشريك غير موجود"},{status:404});
 return NextResponse.json({success:true,permissions:await getPartnerNameEditPermissions(id)});
}
export async function PATCH(request:Request,ctx:{params:Promise<{id:string}>}){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"يجب تسجيل الدخول"},{status:401});
 if(session.user.role!=="SUPER_ADMIN")return NextResponse.json({success:false,message:"متاح للسوبر أدمن فقط"},{status:403});
 const {id}=await ctx.params;
 const body:unknown=await request.json().catch(()=>null);
 if(!body||typeof body!=="object"||Array.isArray(body))return NextResponse.json({success:false,message:"بيانات غير صالحة"},{status:400});
 const {field,enabled,reason} = body as Record<string,unknown>;
 if((field!=="legalNameAr"&&field!=="tradeNameAr")||typeof enabled!=="boolean"||typeof reason!=="string"||reason.trim().length<5||reason.trim().length>1000)return NextResponse.json({success:false,message:"حدد الحقل والإجراء وسبب الموافقة أو الإغلاق (5 أحرف على الأقل)"},{status:400});
 const partner=await prisma.partner.findUnique({where:{id},select:{id:true}});
 if(!partner)return NextResponse.json({success:false,message:"الشريك غير موجود"},{status:404});
 const before=await getPartnerNameEditPermissions(id);
 const result=await prisma.$transaction(async(tx)=>{
  const entry=await tx.partnerChangeRequest.create({data:{partnerId:id,requestedByUserId:session.user.id,reason:PARTNER_NAME_PERMISSION_REASON,status:enabled?"APPROVED":"CANCELLED",changes:{field,enabled,reason:reason.trim(),approvedBy:session.user.id}}});
  await tx.auditLog.create({data:{userId:session.user.id,action:"PARTNER_NAME_PERMISSION_CHANGED",entityType:"Partner",entityId:id,beforeData:{field,enabled:before[field]},afterData:{field,enabled,reason:reason.trim(),recordId:entry.id}}});
  return entry;
 });
 return NextResponse.json({success:true,id:result.id,permissions:await getPartnerNameEditPermissions(id)});
}
