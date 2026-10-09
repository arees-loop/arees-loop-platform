import {NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";

export async function GET(){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"يجب تسجيل الدخول."},{status:401});
 const favorites=await prisma.userFavoriteService.findMany({where:{userId:session.user.id},select:{serviceId:true,createdAt:true,service:{select:{category:true,subCategory:true,city:true,country:true}}},orderBy:{createdAt:"desc"},take:100});
 if(!favorites.length)return NextResponse.json({success:true,suggestions:[]});
 const cutoff=new Date(Date.now()-30*24*60*60*1000);
 const recent=await prisma.service.findMany({where:{status:"PUBLISHED",createdAt:{gte:cutoff},id:{notIn:favorites.map(x=>x.serviceId)}},select:{id:true,nameAr:true,category:true,subCategory:true,city:true,country:true,createdAt:true},orderBy:{createdAt:"desc"},take:150});
 const normalize=(v:string|null|undefined)=>(v||"").trim().toLowerCase();
 const suggestions=recent.flatMap(service=>{
  const matched=favorites.some(f=>normalize(f.service.category)===normalize(service.category)&&(
   Boolean(service.subCategory&&normalize(f.service.subCategory)===normalize(service.subCategory))||
   Boolean(service.city&&normalize(f.service.city)===normalize(service.city))||
   Boolean(service.country&&normalize(f.service.country)===normalize(service.country))
  )&&service.createdAt>f.createdAt);
  return matched?[{id:service.id,title:"تجربة جديدة تناسب اهتماماتك",message:service.nameAr,href:`/services/${service.id}`,createdAt:service.createdAt}]:[];
 }).slice(0,30);
 return NextResponse.json({success:true,suggestions});
}
