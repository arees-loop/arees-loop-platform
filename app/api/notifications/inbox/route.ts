import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET() {
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,error:"UNAUTHENTICATED"},{status:401});
 try{
  const [data,unread]=await Promise.all([
   prisma.userNotification.findMany({where:{userId:session.user.id},orderBy:{createdAt:"desc"},take:40,
    select:{id:true,type:true,title:true,body:true,href:true,readAt:true,createdAt:true}}),
   prisma.userNotification.count({where:{userId:session.user.id,readAt:null}})
  ]);
  return NextResponse.json({success:true,data,unread},{headers:{"Cache-Control":"private, no-store"}});
 }catch(err){
  console.error("Notification inbox unavailable",err instanceof Error?err.name:"UNKNOWN");
  return NextResponse.json({success:false,message:"تعذر تحميل الإشعارات."},{status:503});
 }
}
export async function PATCH(request:NextRequest){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,error:"UNAUTHENTICATED"},{status:401});
 const data:unknown=await request.json().catch(()=>null);
 const body=data&&typeof data==="object"&&!Array.isArray(data)?data as Record<string,unknown>:{};
 if(typeof body.id!=="string"||body.id.length>100)return NextResponse.json({success:false,message:"الإشعار غير صالح."},{status:400});
 try{
  const updated=await prisma.userNotification.updateMany({
    where:{id:body.id,userId:session.user.id,readAt:null},data:{readAt:new Date()}
  });
  return NextResponse.json({success:true,updated:updated.count},{headers:{"Cache-Control":"private, no-store"}});
 }catch(err){
  console.error("Notification read update failed",err instanceof Error?err.name:"UNKNOWN");
  return NextResponse.json({success:false},{status:503});
 }
}
