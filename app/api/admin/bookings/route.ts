import {NextRequest,NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
import {getPartnerCartRows,safeObject} from "@/lib/partner-cart-bookings";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){
 const session=await getCurrentSession();
 const permissions=Array.isArray(session?.user.adminPermissions)?session.user.adminPermissions.map(String):[];
 if(!session||!["SUPER_ADMIN","ADMIN"].includes(session.user.role)||(session.user.role!=="SUPER_ADMIN"&&!permissions.includes("BOOKINGS")))return NextResponse.json({success:false,message:"غير مصرح"},{status:403});
 const status=req.nextUrl.searchParams.get("status")||"ALL";
 const allowed=["ALL","PENDING","RECEIPT_REVIEW","RECEIPT_REJECTED","PAID","CONFIRMED","IN_PROGRESS","COMPLETED","CANCELLED","REFUNDED"];
 if(!allowed.includes(status))return NextResponse.json({success:false,message:"حالة غير صحيحة"},{status:400});
 try{
 const bookingWhere=["ALL","RECEIPT_REVIEW","RECEIPT_REJECTED"].includes(status)?{}:
  {status:status as "PENDING"|"PAID"|"CONFIRMED"|"IN_PROGRESS"|"COMPLETED"|"CANCELLED"|"REFUNDED"};
 const [bookings,groups,partnerCart]=await Promise.all([
  prisma.booking.findMany({where:bookingWhere,orderBy:{createdAt:"desc"},take:100,
   select:{id:true,reference:true,customerName:true,customerEmail:true,customerPhone:true,guests:true,totalAmount:true,status:true,
    createdAt:true,serviceDate:true,service:{select:{nameAr:true}},
    partner:{select:{legalNameAr:true,tradeNameAr:true}}}}),
  prisma.booking.groupBy({by:["status"],_count:{_all:true}}),
  getPartnerCartRows()
 ]);
 const bookingNotes=bookings.length?await prisma.auditLog.findMany({where:{
  entityType:"PARTNER_BOOKING_WORKFLOW",entityId:{in:bookings.map(b=>b.reference)},action:"NOTES_UPDATED"},
  orderBy:[{createdAt:"desc"},{id:"desc"}],select:{entityId:true,afterData:true}}):[];
 const notesByRef=new Map<string,string>();
 for(const entry of bookingNotes)if(entry.entityId&&!notesByRef.has(entry.entityId))
  notesByRef.set(entry.entityId,String(safeObject(entry.afterData).notes||""));
 const real=bookings.map(b=>({...b,source:"BOOKING" as const,totalAmount:Number(b.totalAmount),
  createdAt:b.createdAt.toISOString(),serviceDate:b.serviceDate?.toISOString()||null,
  notes:notesByRef.get(b.reference)||""}));
 const combined=[...real,...partnerCart].filter(b=>status==="ALL"||b.status===status)
  .sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,250);
 const allCounts=new Map<string,number>();
 const cartCounts=new Map<string,number>();
 for(const group of groups)allCounts.set(group.status,group._count._all);
 for(const row of partnerCart){
  allCounts.set(row.status,(allCounts.get(row.status)||0)+1);
  cartCounts.set(row.status,(cartCounts.get(row.status)||0)+1);
 }
 return NextResponse.json({success:true,data:combined,
  counts:[...allCounts].map(([name,count])=>({status:name,count})),
  info:{countsBySource:{
    BOOKING:groups.map(group=>({status:group.status,count:group._count._all})),
    CART:[...cartCounts].map(([name,count])=>({status:name,count}))
   },partnerCartCount:partnerCart.length,cartScanLimited:partnerCart.length>=300,
   note:"Orders from bank cart remain pending until the transfer is verified; they are not confirmed bookings."}},
  {headers:{"Cache-Control":"private, no-store"}});
 }catch(e){console.error("Admin bookings read failed",e);return NextResponse.json({success:false,message:"تعذر تحميل الحجوزات"},{status:503})}
}
