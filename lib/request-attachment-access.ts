import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
import {canManageTransport,type TransportKind} from "@/lib/transport-permissions";
import {canManageHotel} from "@/lib/hotel-permissions";

export const REF_PATTERN=/^AR-(AIR|SEA|HOT|VISA|IDL)-[A-F0-9]{10}$/;
export type AttachmentContext={
  type:"HOTEL"|"TRANSPORT";
  id:string;
  reference:string;
  status:string;
  customerId:string|null;
  actorId:string;
  staff:boolean;
  transportKind?:TransportKind;
};
export async function authorizedAttachmentContext(reference:string):Promise<AttachmentContext|null>{
 if(!REF_PATTERN.test(reference))return null;
 const session=await getCurrentSession();
 if(!session||session.user.status!=="ACTIVE")return null;
 const user=session.user,actorId=user.id;
 if(reference.startsWith("AR-HOT-")){
  const request=await prisma.hotelInquiry.findUnique({where:{reference},select:{id:true,reference:true,status:true,userId:true,assignedToId:true}});
  if(!request)return null;
  const staff=canManageHotel(user)&&(user.role==="SUPER_ADMIN"||request.assignedToId===actorId);
  if(!staff&&request.userId!==actorId)return null;
  return {type:"HOTEL",id:request.id,reference,status:request.status,customerId:request.userId,actorId,staff};
 }
 const request=await prisma.transportRequest.findUnique({where:{reference},select:{id:true,reference:true,status:true,userId:true,kind:true,assignedToId:true}});
 if(!request||!["FLIGHT","FERRY","VISA","DRIVING_LICENSE"].includes(request.kind))return null;
 const kind=request.kind as TransportKind;
 const staff=canManageTransport(user,kind)&&(user.role==="SUPER_ADMIN"||request.assignedToId===actorId);
 if(!staff&&request.userId!==actorId)return null;
 return {type:"TRANSPORT",id:request.id,reference,status:request.status,customerId:request.userId,actorId,staff,transportKind:kind};
}
export const attachmentWriteEnabled=()=>process.env.AREES_REQUEST_ATTACHMENTS_ENABLED==="true";
export function attachmentWhere(ctx:AttachmentContext){
 return ctx.type==="HOTEL"?{hotelInquiryId:ctx.id}:{transportRequestId:ctx.id};
}
