import {prisma} from "@/lib/prisma";
/**
 * Enforce this predicate inside the booking transaction immediately before
 * inserting a booking or collecting a payment. Never trust a previously
 * displayed service or a cached license status.
 */
export async function assertServiceBookable(serviceId:string){
 const today=new Date(new Date().toISOString().slice(0,10)+"T00:00:00.000Z");
 const service=await prisma.service.findFirst({where:{
  id:serviceId,
  status:"PUBLISHED",
  partner:{status:"ACTIVE"},
  license:{is:{status:"VERIFIED",expiryDate:{gte:today}}}
 },select:{id:true,partnerId:true,licenseId:true,status:true}});
 if(!service)throw new Error("SERVICE_NOT_BOOKABLE_LICENSE_OR_STATUS");
 return service;
}
