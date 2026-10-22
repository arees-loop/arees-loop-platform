import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
const select={id:true,firstName:true,lastName:true,email:true,phone:true,status:true,createdAt:true,lastLoginAt:true,updatedAt:true} as const;
type Action="SUSPEND"|"DISABLE"|"RESTORE"|"ARCHIVE"|"UPDATE_NAME";
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"يجب تسجيل الدخول"},{status:401});
 if(session.user.role!=="SUPER_ADMIN")return NextResponse.json({success:false,message:"غير مصرح"},{status:403});
 const {id}=await params;
 const user=await prisma.user.findFirst({where:{id,role:"CUSTOMER"},select});
 if(!user)return NextResponse.json({success:false,message:"العميل غير موجود"},{status:404});
 const [bookings,loyalty,history,relations]=await Promise.all([
  prisma.booking.count({where:{userId:id}}),
  prisma.loyaltyWallet.findUnique({where:{userId:id},select:{balance:true}}),
  prisma.auditLog.findMany({where:{entityType:"CustomerAccount",entityId:id},orderBy:{createdAt:"desc"},take:30,select:{id:true,action:true,createdAt:true,beforeData:true,afterData:true}}),
  prisma.partnerMember.count({where:{userId:id}})
 ]);
 return NextResponse.json({success:true,user,bookings,loyaltyPoints:loyalty?.balance??0,partnerMemberships:relations,history});
}
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"يجب تسجيل الدخول"},{status:401});
 if(session.user.role!=="SUPER_ADMIN")return NextResponse.json({success:false,message:"غير مصرح"},{status:403});
 const {id}=await params;
 const body:unknown=await request.json().catch(()=>null);
 if(!body||typeof body!=="object"||Array.isArray(body))return NextResponse.json({success:false,message:"طلب غير صالح"},{status:400});
 const {action,reason,firstName,lastName}=body as Record<string,unknown>;
 if(!["SUSPEND","DISABLE","RESTORE","ARCHIVE","UPDATE_NAME"].includes(String(action)))return NextResponse.json({success:false,message:"إجراء غير صالح"},{status:400});
 if(typeof reason!=="string"||reason.trim().length<5||reason.trim().length>1000)return NextResponse.json({success:false,message:"يجب كتابة سبب من 5 إلى 1000 حرف"},{status:400});
 if(action==="UPDATE_NAME"&&(typeof firstName!=="string"||typeof lastName!=="string"||!(firstName+" "+lastName).trim()||firstName.length>100||lastName.length>100))return NextResponse.json({success:false,message:"الاسم غير صالح"},{status:400});
 const user=await prisma.user.findFirst({where:{id,role:"CUSTOMER"},select});
 if(!user)return NextResponse.json({success:false,message:"حساب العميل غير موجود"},{status:404});
 const previousArchive=await prisma.auditLog.findFirst({where:{entityType:"CustomerAccount",entityId:id,action:{in:["CUSTOMER_ARCHIVED","CUSTOMER_RESTORED"]}},orderBy:{createdAt:"desc"}});
 if(previousArchive?.action==="CUSTOMER_ARCHIVED"&&action!=="RESTORE")return NextResponse.json({success:false,message:"الحساب مؤرشف؛ استعده أولاً"},{status:409});
 const status=action==="SUSPEND"?"SUSPENDED":action==="DISABLE"||action==="ARCHIVE"?"DISABLED":action==="RESTORE"?"ACTIVE":user.status;
 const updated=await prisma.$transaction(async tx=>{
  const next=await tx.user.update({where:{id},data:action==="UPDATE_NAME"?{firstName:(firstName as string).trim(),lastName:(lastName as string).trim()}:{status},select});
  if(action==="SUSPEND"||action==="DISABLE"||action==="ARCHIVE")await tx.session.deleteMany({where:{userId:id}});
  await tx.auditLog.create({data:{userId:session.user.id,action:action==="ARCHIVE"?"CUSTOMER_ARCHIVED":action==="RESTORE"?"CUSTOMER_RESTORED":action==="UPDATE_NAME"?"CUSTOMER_NAME_UPDATED":action==="SUSPEND"?"CUSTOMER_SUSPENDED":"CUSTOMER_DISABLED",entityType:"CustomerAccount",entityId:id,beforeData:{status:user.status,firstName:user.firstName,lastName:user.lastName},afterData:{status:next.status,firstName:next.firstName,lastName:next.lastName,reason:reason.trim(),archived:action==="ARCHIVE"}}});
  return next;
 });
 return NextResponse.json({success:true,user:updated});
}
