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
 let partnerAlerts=0,guideAlerts=0,licenseRecordsChecked=0,guideRecordsChecked=0;
 const deadline=Date.now()+35000;
 let licenseCursor:string|undefined,guideCursor:string|undefined,licensesComplete=false,guidesComplete=false;
 for(let page=0;page<100&&Date.now()<deadline;page++){
 const licenses=await prisma.license.findMany({where:{expiryDate:{lte:soon},...(licenseCursor?{id:{gt:licenseCursor}}:{})},select:{id:true,partnerId:true,type:true,expiryDate:true},take:100,orderBy:{id:"asc"}});
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
  licenseRecordsChecked+=licenses.length;
  if(licenses.length<100){licensesComplete=true;break}
  licenseCursor=licenses[licenses.length-1].id;
 }
 for(let page=0;page<100&&Date.now()<deadline;page++){
 const guides=await prisma.guideApplication.findMany({where:{status:"APPROVED",licenseExpiresAt:{lte:soon},...(guideCursor?{id:{gt:guideCursor}}:{})},select:{id:true,userId:true,licenseCategory:true,licenseExpiresAt:true},take:100,orderBy:{id:"asc"}});
 for(const guide of guides){
  const validity=licenseValidity(guide.licenseExpiresAt);
  if(validity.state!=="EXPIRED"&&validity.state!=="EXPIRING")continue;
  const kind=validity.state==="EXPIRED"?"GUIDE_LICENSE_EXPIRED":"GUIDE_LICENSE_EXPIRING";
  await prisma.guideLicenseAlert.upsert({where:{recipientUserId_applicationId_kind_dayKey:{recipientUserId:guide.userId,applicationId:guide.id,kind,dayKey:day}},create:{recipientUserId:guide.userId,applicationId:guide.id,kind,dayKey:day,title:validity.state==="EXPIRED"?"انتهاء ترخيص المرشد":"اقتراب انتهاء ترخيص المرشد",message:validity.state==="EXPIRED"?`انتهى ترخيص ${guide.licenseCategory}. ملف المرشد غير ظاهر حتى اعتماد التجديد.`:`ترخيص ${guide.licenseCategory} متبقي على انتهائه ${validity.daysRemaining} يوم.`},update:{}});
  guideAlerts++;
 }
  guideRecordsChecked+=guides.length;
  if(guides.length<100){guidesComplete=true;break}
  guideCursor=guides[guides.length-1].id;
 }
 const complete=licensesComplete&&guidesComplete;
 return NextResponse.json({success:complete,day,partnerAlerts,guideAlerts,licenseRecordsChecked,guideRecordsChecked,truncated:!complete,message:complete?"تم الفحص الكامل":"لم يكتمل الفحص ضمن المهلة؛ راجع سجلات التشغيل وأعد المحاولة"},{status:complete?200:503});
}
