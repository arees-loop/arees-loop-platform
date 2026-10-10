import {prisma} from "@/lib/prisma";
import {licenseValidity} from "@/lib/license-validity";
export async function refreshGuideLicenseAlerts(userId:string){
 const today=new Date().toISOString().slice(0,10);
 const applications=await prisma.guideApplication.findMany({where:{userId,status:"APPROVED"},select:{id:true,licenseCategory:true,licenseExpiresAt:true}});
 for(const application of applications){
  const validity=licenseValidity(application.licenseExpiresAt);
  if(validity.state!=="EXPIRING"&&validity.state!=="EXPIRED")continue;
  const kind=validity.state==="EXPIRED"?"GUIDE_LICENSE_EXPIRED":"GUIDE_LICENSE_EXPIRING";
  const title=validity.state==="EXPIRED"?"انتهاء ترخيص المرشد":"اقتراب انتهاء ترخيص المرشد";
  const message=validity.state==="EXPIRED"?`انتهى ترخيص ${application.licenseCategory}. تم إخفاء ملف المرشد من الدليل حتى اعتماد التجديد.`:`ترخيص ${application.licenseCategory} متبقي على انتهائه ${validity.daysRemaining} يوم. يرجى تقديم التجديد.`;
  await prisma.guideLicenseAlert.upsert({where:{recipientUserId_applicationId_kind_dayKey:{recipientUserId:userId,applicationId:application.id,kind,dayKey:today}},create:{recipientUserId:userId,applicationId:application.id,kind,title,message,dayKey:today},update:{}});
 }
}
