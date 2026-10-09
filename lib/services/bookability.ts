import {serviceEligibilityWhere} from "@/lib/services/eligibility";
import {prisma} from "@/lib/prisma";
/**
 * Enforce this predicate inside the booking transaction immediately before
 * inserting a booking or collecting a payment. Never trust a previously
 * displayed service or a cached license status.
 */
export async function assertServiceBookable(serviceId:string){
 const service=await prisma.service.findFirst({where:{
  id:serviceId,
  status:"PUBLISHED",
  ...serviceEligibilityWhere()
 },select:{id:true,partnerId:true,licenseId:true,status:true}});
 if(!service)throw new Error("SERVICE_NOT_BOOKABLE_LICENSE_OR_STATUS");
 return service;
}
