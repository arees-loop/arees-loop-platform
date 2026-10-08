import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
export const NAV_KEYS=["discover","how","programs","guides","hotels","flights","cruise","partners"] as const;
export async function GET(){
 try{const rows=await prisma.navigationVisibility.findMany();return NextResponse.json({success:true,data:Object.fromEntries(NAV_KEYS.map(k=>[k,rows.find(r=>r.key===k)?.visible??true]))});}
 catch{return NextResponse.json({success:true,data:Object.fromEntries(NAV_KEYS.map(k=>[k,true])),pendingMigration:true});}
}
export async function PATCH(request:Request){
 const session=await getCurrentSession();
 if(!session||session.user.role!=="SUPER_ADMIN")return NextResponse.json({success:false,message:"يتطلب صلاحية المدير العام"},{status:403});
 const body=await request.json().catch(()=>null);
 if(!body||!NAV_KEYS.includes(body.key)||typeof body.visible!=="boolean")return NextResponse.json({success:false,message:"إعداد غير صالح"},{status:400});
 try{
  const row=await prisma.navigationVisibility.upsert({where:{key:body.key},create:{key:body.key,visible:body.visible},update:{visible:body.visible}});
  return NextResponse.json({success:true,data:row});
 }catch{return NextResponse.json({success:false,message:"تعذر حفظ الإعداد. تأكد من تطبيق ترحيل قاعدة البيانات."},{status:500});}
}
