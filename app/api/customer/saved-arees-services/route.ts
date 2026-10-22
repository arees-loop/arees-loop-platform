import {NextRequest,NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const TYPE="AREES_SERVICE_INTEREST";
const SAVED="AREES_SERVICE_SAVED",REMOVED="AREES_SERVICE_REMOVED";
const services={
 FLIGHT:{title:"الطيران",href:"/flights",image:"/Image/hero/arees-flight-banner.webp",icon:"✈️"},
 FERRY:{title:"البواخر",href:"/ferries",image:"/Image/hero/arees-ferry-banner.webp",icon:"⚓"},
 HOTEL:{title:"الفنادق",href:"/hotels",image:"/Image/hero/arees-hotel-banner.webp",icon:"🏨"},
 VISA:{title:"التأشيرات",href:"/visas",image:"/Image/hero/arees-visas-banner.webp",icon:"🛂"},
 DRIVING_LICENSE:{title:"الرخصة الدولية",href:"/international-driving-license",image:"/Image/social/arees-international-driving-license.webp",icon:"🚗"}
} as const;
type Key=keyof typeof services;
const isKey=(v:unknown):v is Key=>typeof v==="string"&&v in services;
const headers={"Cache-Control":"private, no-store"};
const fail=(message:string,status=400)=>NextResponse.json({success:false,message},{status,headers});
async function state(userId:string){
 const rows=await prisma.auditLog.findMany({where:{userId,entityType:TYPE,entityId:{in:Object.keys(services)},action:{in:[SAVED,REMOVED]}},
   orderBy:[{createdAt:"desc"},{id:"desc"}],select:{entityId:true,action:true,createdAt:true}});
 const map=new Map<string,{saved:boolean,at:Date}>();
 for(const row of rows)if(row.entityId&&!map.has(row.entityId))map.set(row.entityId,{saved:row.action===SAVED,at:row.createdAt});
 return map;
}
export async function GET(){
 const session=await getCurrentSession();if(!session)return fail("سجّل الدخول لمشاهدة الاهتمامات.",401);
 try{
  const statuses=await state(session.user.id);
  const items=(Object.keys(services) as Key[]).filter(k=>statuses.get(k)?.saved).map(k=>({
   id:k,...services[k],savedAt:statuses.get(k)?.at.toISOString()
  }));
  return NextResponse.json({success:true,data:items},{headers});
 }catch(err){console.error("Arees service interests GET failed",err);return fail("تعذر تحميل الاهتمامات.",503);}
}
async function setFavorite(req:NextRequest,save:boolean){
 const session=await getCurrentSession();if(!session)return fail("سجّل الدخول لحفظ الاهتمامات.",401);
 const body=await req.json().catch(()=>null),kind=body?.kind;
 if(!isKey(kind))return fail("الخدمة غير صحيحة.");
 try{
  const current=await state(session.user.id);
  if((current.get(kind)?.saved??false)!==save){
   await prisma.auditLog.create({data:{entityType:TYPE,entityId:kind,userId:session.user.id,
    action:save?SAVED:REMOVED,afterData:{kind}}});
  }
  return NextResponse.json({success:true,saved:save,kind},{headers});
 }catch(err){console.error("Arees service interests write failed",err);return fail("تعذر حفظ الاهتمام.",503);}
}
export async function POST(req:NextRequest){return setFavorite(req,true)}
export async function DELETE(req:NextRequest){return setFavorite(req,false)}
