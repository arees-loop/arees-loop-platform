import {prisma} from "@/lib/prisma";
import {licenseValidity} from "@/lib/license-validity";
export async function refreshLicenseAlerts(userId:string){
 const memberships=await prisma.partnerMember.findMany({where:{userId,isActive:true},select:{partnerId:true}});
 const ids=memberships.map(x=>x.partnerId);
 if(!ids.length)return;
 const today=new Date().toISOString().slice(0,10);
 const licenses=await prisma.license.findMany({where:{partnerId:{in:ids}},select:{id:true,partnerId:true,type:true,expiryDate:true,status:true}});
 for(const license of licenses){
  const validity=licenseValidity(license.expiryDate);
  if(validity.state!=="EXPIRING"&&validity.state!=="EXPIRED")continue;
  const kind=validity.state==="EXPIRED"?"LICENSE_EXPIRED":"LICENSE_EXPIRING";
  const title=validity.state==="EXPIRED"?"انتهاء ترخيص":"تجديد ترخيص قريب";
  const message=validity.state==="EXPIRED"?`الترخيص ${license.type} منتهي. الخدمات المرتبطة به غير متاحة للحجز حتى اعتماد التجديد.`:`الترخيص ${license.type} متبقي على انتهائه ${validity.daysRemaining} يوم. يرجى رفع التجديد.`;
  await prisma.licenseAlert.upsert({where:{recipientUserId_licenseId_kind_dayKey:{recipientUserId:userId,licenseId:license.id,kind,dayKey:today}},create:{recipientUserId:userId,licenseId:license.id,partnerId:license.partnerId,kind,title,message,dayKey:today},update:{}});
 }
}
