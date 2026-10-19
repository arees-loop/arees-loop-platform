import {NextRequest,NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){
 const session=await getCurrentSession();
 if(!session||session.user.role!=="SUPER_ADMIN")return NextResponse.json({success:false,message:"غير مصرح"},{status:403});
 const url=req.nextUrl.searchParams;
 const period=url.get("period")||"month",now=new Date();
 let start:Date;
 let end=new Date(now);
 if(period==="today")start=new Date(now.getFullYear(),now.getMonth(),now.getDate());
 else if(period==="month")start=new Date(now.getFullYear(),now.getMonth(),1);
 else if(period==="year")start=new Date(now.getFullYear(),0,1);
 else if(period==="custom"){
  const from=url.get("from"),to=url.get("to");
  if(!from||!to||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(from)||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(to)||from>to)return NextResponse.json({success:false,message:"حدد فترة صحيحة"},{status:400});
  start=new Date(from+"T00:00:00.000Z");end=new Date(to+"T23:59:59.999Z");
  if(Number.isNaN(start.getTime())||Number.isNaN(end.getTime()))return NextResponse.json({success:false,message:"التاريخ غير صحيح"},{status:400});
 }else return NextResponse.json({success:false,message:"الفترة غير صحيحة"},{status:400});
 try{
  const date={gte:start,lte:end};
  const [bookings,bookingStatuses,settlements,settlementTotals,directTransport,directHotels]=await Promise.all([
   prisma.booking.count({where:{createdAt:date}}),
   prisma.booking.groupBy({by:["status"],where:{createdAt:date},_count:{_all:true}}),
   prisma.settlement.count({where:{createdAt:date}}),
   prisma.settlement.aggregate({where:{createdAt:date},_sum:{grossSales:true,platformCommission:true,netAmount:true}}),
   prisma.transportRequest.count({where:{createdAt:date}}),
   prisma.hotelInquiry.count({where:{createdAt:date}})
  ]);
  return NextResponse.json({success:true,period:{start:start.toISOString(),end:end.toISOString()},bookings,bookingStatuses:bookingStatuses.map(s=>({status:s.status,count:s._count._all})),settlements,settlementTotals:{grossSales:Number(settlementTotals._sum.grossSales||0),platformCommission:Number(settlementTotals._sum.platformCommission||0),netAmount:Number(settlementTotals._sum.netAmount||0)},directRequests:directTransport+directHotels},{headers:{"Cache-Control":"private, no-store"}});
 }catch(e){console.error("Admin dashboard metrics error",e);return NextResponse.json({success:false,message:"تعذر قراءة المؤشرات"},{status:503});}
}
