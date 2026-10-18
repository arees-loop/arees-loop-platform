import {NextRequest,NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
import {canManageTransport} from "@/lib/transport-permissions";
import {randomBytes} from "node:crypto";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 const session=await getCurrentSession();
 if(!session||!["SUPER_ADMIN","ADMIN"].includes(session.user.role))return NextResponse.json({success:false,message:"غير مصرح"},{status:403});
 try{
 const d=await req.json();const kind=String(d.kind||"");
 if(!["FLIGHT","FERRY","VISA","DRIVING_LICENSE"].includes(kind)||!canManageTransport(session.user,kind))return NextResponse.json({success:false,message:"لا تملك صلاحية نوع الطلب"},{status:403});
 const name=String(d.customerName||"").trim().slice(0,120),phone=String(d.phone||"").replace(/[^0-9]/g,"").slice(0,18),countryCode=String(d.countryCode||"966").replace(/[^0-9]/g,"").slice(0,5),origin=String(d.origin||"").trim().slice(0,120),destination=String(d.destination||"").trim().slice(0,120);
 const date=String(d.travelDate||"");if(!name||phone.length<7||!origin||!destination||!/^\d{4}-\d{2}-\d{2}$/.test(date))return NextResponse.json({success:false,message:"أكمل الاسم والهاتف والمسار وتاريخ الخدمة"},{status:400});
 const travelDate=new Date(date+"T12:00:00Z");if(Number.isNaN(travelDate.getTime())||travelDate.toISOString().slice(0,10)!==date)return NextResponse.json({success:false,message:"التاريخ غير صحيح"},{status:400});
 const reference="AR-MAN-"+randomBytes(6).toString("hex").toUpperCase();
 const result=await prisma.$transaction(async tx=>{
 const record=await tx.transportRequest.create({data:{reference,kind,customerName:name,phone,countryCode,origin,destination,travelDate,status:"NEW",notes:String(d.notes||"").slice(0,2000)||null,assignedToId:session.user.role==="ADMIN"?session.user.id:null,notificationStatus:"PENDING"}});
 await tx.transportRequestEvent.create({data:{requestId:record.id,actorId:session.user.id,action:"MANUAL_REQUEST_CREATED",toStatus:"NEW",details:{source:"ADMIN_MANUAL"}}});
 return record;
 });
 return NextResponse.json({success:true,data:result},{status:201});
 }catch(e){console.error("Manual request creation failed",e);return NextResponse.json({success:false,message:"تعذر حفظ الطلب اليدوي"},{status:500});}
}
