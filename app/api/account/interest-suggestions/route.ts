import {NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";

const keywords:Record<string,string[]>={
 HERITAGE:["تراث","تاريخ","متحف","أثر","heritage","museum","history"],
 ADVENTURE:["مغامر","تسلق","هايكنج","سفاري","adventure","hiking"],
 FOOD:["مطعم","طعام","أكل","تذوق","food","dining","restaurant"],
 EVENTS:["فعالي","مهرجان","حفلة","events","festival"],
 SHOPPING:["تسوق","سوق","shopping","market"],
 GUIDES:["مرشد","إرشاد","جولة","guide","guided"],
 STAYS:["فندق","إقامة","سكن","hotel","stay"],
 NATURE:["طبيعة","حديقة","جبال","بحر","nature","garden"],
 FAMILY:["عائل","أطفال","أسرة","family","kids"],
 SPORTS:["رياض","مباراة","sports","sport"],
 TECHNOLOGY:["تقني","تكنولوج","ابتكار","technology","tech"],
 SEASONAL:["موسم","رمضان","عيد","seasonal","season"]
};
const norm=(v:string|null|undefined)=>(v||"").trim().toLowerCase();
async function getSuggestions(userId:string){
 const [favorites,interests,reads]=await Promise.all([
  prisma.userFavoriteService.findMany({where:{userId:userId},select:{serviceId:true,createdAt:true,service:{select:{category:true,subCategory:true,city:true,country:true}}},orderBy:{createdAt:"desc"},take:100}),
  prisma.userInterest.findMany({where:{userId:userId},select:{code:true}}),
  prisma.interestNotificationRead.findMany({where:{userId:userId},select:{serviceId:true}})
 ]);
 if(!favorites.length&&!interests.length)return [];
 const cutoff=new Date(Date.now()-30*24*60*60*1000);
 const recent=await prisma.service.findMany({where:{status:"PUBLISHED",createdAt:{gte:cutoff},id:{notIn:favorites.map(x=>x.serviceId)}},select:{id:true,nameAr:true,category:true,subCategory:true,city:true,country:true,createdAt:true},orderBy:{createdAt:"desc"},take:150});
 const readIds=new Set(reads.map(x=>x.serviceId));
 const suggestions=recent.flatMap(service=>{
  const terms=norm([service.category,service.subCategory,service.nameAr].filter(Boolean).join(" "));
  const registrationMatch=interests.some(x=>(keywords[x.code]||[]).some(word=>terms.includes(word)));
  const favoriteMatch=favorites.some(f=>norm(f.service.category)===norm(service.category)&&(
   Boolean(service.subCategory&&norm(f.service.subCategory)===norm(service.subCategory))||
   Boolean(service.city&&norm(f.service.city)===norm(service.city))||
   Boolean(service.country&&norm(f.service.country)===norm(service.country))
  )&&service.createdAt>f.createdAt);
  return registrationMatch||favoriteMatch?[{id:service.id,title:"تجربة جديدة تناسب اهتماماتك",message:service.nameAr,href:`/services/${service.id}`,createdAt:service.createdAt,unread:!readIds.has(service.id)}]:[];
 }).slice(0,30);
 return suggestions;
}
export async function GET(){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"يجب تسجيل الدخول."},{status:401});
 const suggestions=await getSuggestions(session.user.id);
 return NextResponse.json({success:true,suggestions,unreadCount:suggestions.filter(x=>x.unread).length});
}
export async function PATCH(request:Request){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"يجب تسجيل الدخول."},{status:401});
 const body=await request.json().catch(()=>null);
 const ids=Array.isArray(body?.serviceIds)?body.serviceIds.filter((x:unknown):x is string=>typeof x==="string"&&x.length>0&&x.length<=120).slice(0,30):[];
 if(!ids.length)return NextResponse.json({success:false,message:"حدد إشعاراً واحداً على الأقل."},{status:400});
 const suggested=await getSuggestions(session.user.id);
 const allowed=new Set(suggested.map(x=>x.id));
 const valid=ids.filter(id=>allowed.has(id));
 if(!valid.length)return NextResponse.json({success:false,message:"الإشعارات المحددة غير متاحة."},{status:404});
 await prisma.$transaction(valid.map(serviceId=>prisma.interestNotificationRead.upsert({where:{userId_serviceId:{userId:session.user.id,serviceId}},update:{readAt:new Date()},create:{userId:session.user.id,serviceId}})));
 return NextResponse.json({success:true});
}
