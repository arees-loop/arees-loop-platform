import {NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
import {refreshLicenseAlerts} from "@/lib/license-alerts";
export async function GET(){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"يجب تسجيل الدخول"},{status:401});
 await refreshLicenseAlerts(session.user.id);
 const alerts=await prisma.licenseAlert.findMany({where:{recipientUserId:session.user.id},orderBy:{createdAt:"desc"},take:60,select:{id:true,kind:true,title:true,message:true,createdAt:true,readAt:true,licenseId:true}});
 return NextResponse.json({success:true,alerts,unreadCount:alerts.filter(a=>!a.readAt).length});
}
export async function PATCH(request:Request){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false},{status:401});
 const body=await request.json().catch(()=>null);
 if(typeof body?.id!=="string")return NextResponse.json({success:false},{status:400});
 const result=await prisma.licenseAlert.updateMany({where:{id:body.id,recipientUserId:session.user.id},data:{readAt:new Date()}});
 return NextResponse.json({success:result.count>0},{status:result.count?200:404});
}
