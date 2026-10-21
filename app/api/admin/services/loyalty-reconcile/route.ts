import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
const pointsForPrice=(price:number)=>Math.floor(Math.max(0,price));
async function plan(){
 const services=await prisma.service.findMany({select:{id:true,nameAr:true,basePrice:true,loyaltyPoints:true,_count:{select:{bookings:true}}},orderBy:{createdAt:"asc"}});
 const changes=services.map(s=>({id:s.id,name:s.nameAr,from:s.loyaltyPoints,to:pointsForPrice(Number(s.basePrice)),bookings:s._count.bookings})).filter(s=>s.from!==s.to);
 return {total:services.length,changes,blocked:changes.filter(x=>x.bookings>0)};
}
export async function GET(){
 const session=await getCurrentSession();if(!session)return NextResponse.json({success:false},{status:401});
 if(session.user.role!=="SUPER_ADMIN")return NextResponse.json({success:false},{status:403});
 const result=await plan();
 return NextResponse.json({success:true,total:result.total,changes:result.changes,blocked:result.blocked});
}
export async function POST(request:Request){
 const session=await getCurrentSession();if(!session)return NextResponse.json({success:false},{status:401});
 if(session.user.role!=="SUPER_ADMIN")return NextResponse.json({success:false},{status:403});
 const body:unknown=await request.json().catch(()=>null);
 if(!body||typeof body!=="object"||Array.isArray(body)||(body as Record<string,unknown>).confirm!=="UPDATE_EXISTING_SERVICE_POINTS")return NextResponse.json({success:false,message:"التأكيد مطلوب"},{status:400});
 const preview=await plan();
 if(preview.blocked.length)return NextResponse.json({success:false,message:"بعض الخدمات مرتبطة بحجوزات. لن يتم تغيير أي خدمة حتى تتم مراجعتها.",blocked:preview.blocked},{status:409});
 const updates=await prisma.$transaction(async tx=>{
  const results=[];
  for(const item of preview.changes){
   // Protect against concurrent price changes and new bookings since review.
   const original=await tx.service.findUnique({where:{id:item.id},select:{basePrice:true,loyaltyPoints:true,_count:{select:{bookings:true}}}});
   if(!original||original._count.bookings!==0||original.loyaltyPoints!==item.from||pointsForPrice(Number(original.basePrice))!==item.to)throw new Error("STALE_SERVICE");
   const updated=await tx.service.update({where:{id:item.id},data:{loyaltyPoints:item.to}});
   await tx.auditLog.create({data:{userId:session.user.id,action:"SERVICE_LOYALTY_POINTS_RECONCILED",entityType:"Service",entityId:item.id,beforeData:{points:item.from},afterData:{points:item.to,price:String(original.basePrice)}}});
   results.push({id:updated.id,from:item.from,to:item.to});
  }
  return results;
 }).catch(error=>{if(error instanceof Error&&error.message==="STALE_SERVICE")return null;throw error;});
 if(!updates)return NextResponse.json({success:false,message:"تغيرت بيانات الخدمات أثناء العملية، أعد المعاينة."},{status:409});
 return NextResponse.json({success:true,updated:updates.length,changes:updates});
}
