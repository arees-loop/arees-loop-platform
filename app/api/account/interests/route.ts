import {NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
export async function GET(){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"يجب تسجيل الدخول."},{status:401});
 const [favorites,interests]=await Promise.all([
  prisma.userFavoriteService.findMany({where:{userId:session.user.id,service:{status:"PUBLISHED"}},select:{serviceId:true,service:{select:{id:true,nameAr:true,category:true,subCategory:true,city:true,country:true,finalPrice:true,images:{take:1,orderBy:{sortOrder:"asc"},select:{url:true}}}}},orderBy:{createdAt:"desc"}}),
  prisma.userInterest.findMany({where:{userId:session.user.id},select:{code:true}})
 ]);
 return NextResponse.json({success:true,serviceIds:favorites.map(x=>x.serviceId),services:favorites.map(x=>({...x.service,finalPrice:Number(x.service.finalPrice),images:x.service.images.map(i=>i.url)})),interests:interests.map(x=>x.code)});
}
export async function POST(request:Request){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"سجل الدخول لإضافة الخدمة إلى اهتماماتك."},{status:401});
 const body=await request.json().catch(()=>null);
 const serviceId=typeof body?.serviceId==="string"?body.serviceId.trim():"";
 if(!serviceId||serviceId.length>120||typeof body?.liked!=="boolean")return NextResponse.json({success:false,message:"طلب غير صالح."},{status:400});
 const service=await prisma.service.findFirst({where:{id:serviceId,status:"PUBLISHED"},select:{id:true}});
 if(!service)return NextResponse.json({success:false,message:"الخدمة غير متاحة."},{status:404});
 if(body.liked)await prisma.userFavoriteService.upsert({where:{userId_serviceId:{userId:session.user.id,serviceId}},update:{},create:{userId:session.user.id,serviceId}});
 else await prisma.userFavoriteService.deleteMany({where:{userId:session.user.id,serviceId}});
 return NextResponse.json({success:true,liked:body.liked});
}
