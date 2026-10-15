import { prisma } from "@/lib/prisma";
import { canManageHotel } from "@/lib/hotel-permissions";
import { canManageTransport } from "@/lib/transport-permissions";

/** No private notes or passenger IDs may be copied to notification previews. */
type RequestKind="FLIGHT"|"FERRY"|"VISA"|"DRIVING_LICENSE"|"HOTEL";
const route=(kind:RequestKind,reference:string)=>{
  const base=kind==="HOTEL"?"/admin/hotels":`/admin/transport/${({FLIGHT:"flights",FERRY:"ferries",VISA:"visas",DRIVING_LICENSE:"driving-licenses"} as const)[kind]}`;
  return `${base}?view=requests&reference=${encodeURIComponent(reference)}`;
};
const label:Record<RequestKind,string>={FLIGHT:"طيران",FERRY:"باخرة",VISA:"تأشيرة",DRIVING_LICENSE:"رخصة دولية",HOTEL:"فندق"};

export async function notifyAdminsOfNewRequest(input:{kind:RequestKind;requestId:string;reference:string;assignedToId?:string|null}) {
  const admins=await prisma.user.findMany({
    where:{status:"ACTIVE",role:{in:["ADMIN","SUPER_ADMIN"]},...(input.assignedToId?{id:input.assignedToId}:{role:"SUPER_ADMIN"})},
    select:{id:true,role:true,adminPermissions:true}
  });
  const authorized=admins.filter(u=>input.kind==="HOTEL"?canManageHotel(u):canManageTransport(u,input.kind));
  if(!authorized.length)return;
  await prisma.userNotification.createMany({data:authorized.map(u=>({
    userId:u.id,type:"NEW_REQUEST",title:`طلب ${label[input.kind]} جديد`,
    body:"وصل طلب جديد للمراجعة. افتح الطلب للاطلاع على التفاصيل.",
    href:route(input.kind,input.reference),
    sourceKey:`new:${input.kind}:${input.requestId}:${u.id}`
  })),skipDuplicates:true});
}

export async function notifyCustomerOfRequestUpdate(input:{
 kind:RequestKind;requestId:string;reference:string;userId:string|null;
 eventId:string;title?:string;body?:string;
}) {
  if(!input.userId)return;
  await prisma.userNotification.create({
    data:{
      userId:input.userId,type:"REQUEST_UPDATE",
      title:input.title||"تحديث جديد على طلبك",
      body:input.body||"رد فريق أريس لوب على طلبك. افتح تفاصيل الطلب للاطلاع على التحديث.",
      href:`/my-requests?reference=${encodeURIComponent(input.reference)}`,
      sourceKey:`update:${input.kind}:${input.requestId}:${input.eventId}`
    }
  });
}
