import {NextRequest,NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){
 const session=await getCurrentSession();
 const permissions=Array.isArray(session?.user.adminPermissions)?session.user.adminPermissions.map(String):[];
 if(!session||!["SUPER_ADMIN","ADMIN"].includes(session.user.role)||(session.user.role!=="SUPER_ADMIN"&&!permissions.includes("BOOKINGS")))return NextResponse.json({success:false,message:"غير مصرح"},{status:403});
 const status=req.nextUrl.searchParams.get("status")||"ALL";
 const allowed=["ALL","PENDING","PAID","CONFIRMED","IN_PROGRESS","COMPLETED","CANCELLED","REFUNDED"];
 if(!allowed.includes(status))return NextResponse.json({success:false,message:"حالة غير صحيحة"},{status:400});
 try{
 const where=status==="ALL"?{}:{status:status as "PENDING"|"PAID"|"CONFIRMED"|"IN_PROGRESS"|"COMPLETED"|"CANCELLED"|"REFUNDED"};
 const [rows,groups]=await Promise.all([
 prisma.booking.findMany({where,orderBy:{createdAt:"desc"},take:100,select:{id:true,reference:true,customerName:true,customerPhone:true,guests:true,totalAmount:true,status:true,createdAt:true,serviceDate:true,service:{select:{nameAr:true}},partner:{select:{legalNameAr:true,tradeNameAr:true}}}}),
 prisma.booking.groupBy({by:["status"],_count:{_all:true}})
 ]);
 return NextResponse.json({success:true,data:rows.map(b=>({...b,totalAmount:Number(b.totalAmount)})),counts:groups.map(g=>({status:g.status,count:g._count._all}))},{headers:{"Cache-Control":"private, no-store"}});
 }catch(e){console.error("Admin bookings read failed",e);return NextResponse.json({success:false,message:"تعذر تحميل الحجوزات"},{status:503})}
}
