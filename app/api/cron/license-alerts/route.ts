import {NextRequest,NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {licenseValidity} from "@/lib/license-validity";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||request.headers.get("authorization")!==`Bearer ${secret}`)return NextResponse.json({success:false,message:"Unauthorized"},{status:401});
 const day=new Date().toISOString().slice(0,10);
 const today=new Date(day+"T00:00:00.000Z");
 const soon=new Date(today.getTime()+10*86400000);
 let partnerAlerts=0,guideAlerts=0;
 const licenses=await prisma.license.findMany({where:{expiryDate:{lte:soon}},select:{id:true,partnerId:true,type:true,expiryDate:true},take:1000,orderBy:{id:"asc"}});
 const partnerIds=[...new Set(licenses.map(l=>l.partnerId))];
 const members=await prisma.partnerMember.findMany({where:{partnerId:{in:partnerIds},isActive:true},select:{partnerId:true,userId:true}});
 const usersByPartner=new Map<string,Set<string>>();
 for(const member of members){const users=usersByPartner.get(member.partnerId)||new Set<string>();users.add(member.userId);usersByPartner.set(member.partnerId,users)}
 for(const license of licenses){
  const validity=licenseValidity(license.expiryDate);
  if(validity.state!=="EXPIRED"&&validity.state!=="EXPIRING")continue;
  const kind=validity.state==="EXPIRED"?"LICENSE_EXPIRED":"LICENSE_EXPIRING";
  for(const userId of usersByPartner.get(license.partnerId)||[]){
   await prisma.licenseAlert.upsert({where:{recipientUserId_licenseId_kind_dayKey:{recipientUserId:userId,licenseId:license.id,kind,dayKey:day}},create:{recipientUserId:userId,licenseId:license.id,partnerId:license.partnerId,kind,dayKey:day,title:validity.state==="EXPIRED"?"انتهاء ترخيص":"اقتراب انتهاء الترخيص",message:validity.state==="EXPIRED"?`انتهى ترخيص ${license.type}. الخدمات المرتبطة به غير متاحة للعملاء حتى اعتماد التجديد.`:`ترخيص ${license.type} متبقي على انتهائه ${validity.daysRemaining} يوم.`},update:{}});
   partnerAlerts++;
  }
 }
 const guides=await prisma.guideApplication.findMany({where:{status:"APPROVED",licenseExpiresAt:{lte:soon}},select:{id:true,userId:true,licenseCategory:true,licenseExpiresAt:true},take:1000,orderBy:{id:"asc"}});
 for(const guide of guides){
  const validity=licenseValidity(guide.licenseExpiresAt);
  if(validity.state!=="EXPIRED"&&validity.state!=="EXPIRING")continue;
  const kind=validity.state==="EXPIRED"?"GUIDE_LICENSE_EXPIRED":"GUIDE_LICENSE_EXPIRING";
  await prisma.guideLicenseAlert.upsert({where:{recipientUserId_applicationId_kind_dayKey:{recipientUserId:guide.userId,applicationId:guide.id,kind,dayKey:day}},create:{recipientUserId:guide.userId,applicationId:guide.id,kind,dayKey:day,title:validity.state==="EXPIRED"?"انتهاء ترخيص المرشد":"اقتراب انتهاء ترخيص المرشد",message:validity.state==="EXPIRED"?`انتهى ترخيص ${guide.licenseCategory}. ملف المرشد غير ظاهر حتى اعتماد التجديد.`:`ترخيص ${guide.licenseCategory} متبقي على انتهائه ${validity.daysRemaining} يوم.`},update:{}});
  guideAlerts++;
 }
 return NextResponse.json({success:true,day,partnerAlerts,guideAlerts,licenseRecordsChecked:licenses.length,guideRecordsChecked:guides.length,truncated:licenses.length===1000||guides.length===1000});
}
