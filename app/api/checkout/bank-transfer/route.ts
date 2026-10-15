import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type CartLine = {serviceId:string; quantity:number; itemType?:string; application?:unknown};
export async function POST(request:NextRequest) {
  const session=await getCurrentSession();
  if(!session) return NextResponse.json({success:false,message:"سجّل الدخول أولاً لإتمام الحجز."},{status:401});
  let input:unknown;
  try { input=await request.json(); } catch { return NextResponse.json({success:false,message:"طلب غير صالح."},{status:400}); }
  if(!input||typeof input!=="object")return NextResponse.json({success:false,message:"طلب غير صالح."},{status:400});
  const body=input as {items?:unknown; couponCode?:unknown; usePoints?:unknown};
  const lines=body.items;
  if(!Array.isArray(lines)||lines.length<1||lines.length>15) return NextResponse.json({success:false,message:"السلة غير صالحة."},{status:400});
  const items:CartLine[]=[];
  for(const line of lines){
    if(!line||typeof line!=="object")return NextResponse.json({success:false,message:"عنصر غير صالح."},{status:400});
    const item=line as Record<string,unknown>;
    if(typeof item.serviceId!=="string"||!Number.isInteger(item.quantity)||Number(item.quantity)<1||Number(item.quantity)>30)return NextResponse.json({success:false,message:"كمية أو خدمة غير صالحة."},{status:400});
    items.push({serviceId:item.serviceId,quantity:Number(item.quantity),itemType:typeof item.itemType==="string"?item.itemType:undefined,application:item.application});
  }
  if(new Set(items.map(x=>x.serviceId)).size!==items.length)return NextResponse.json({success:false,message:"خدمات مكررة في السلة."},{status:400});
  const account=await prisma.platformBankAccount.findUnique({where:{id:"primary"}});
  if(!account?.enabled)return NextResponse.json({success:false,message:"التحويل البنكي غير متاح حالياً."},{status:409});
  if(body.couponCode||body.usePoints)return NextResponse.json({success:false,message:"استخدام النقاط والكوبونات عند السداد يحتاج تفعيل التحقق النهائي."},{status:409});
  const ids=items.filter(x=>x.itemType!=="DRIVING_LICENSE").map(x=>x.serviceId);
  const services=await prisma.service.findMany({where:{id:{in:ids},status:"PUBLISHED"},select:{id:true,nameAr:true,finalPrice:true}});
  if(services.length!==ids.length)return NextResponse.json({success:false,message:"إحدى الخدمات لم تعد متاحة. حدّث السلة."},{status:409});
  let totalHalalas=0;
  const details:Array<{serviceId:string;title:string;quantity:number;unitPriceSar:number;itemType?:string;application?:Record<string,string>}>=[];
  for(const item of items){
    if(item.itemType==="DRIVING_LICENSE"){
      if(item.serviceId!=="international-driving-license-1")return NextResponse.json({success:false,message:"مدة الرخصة غير مدعومة."},{status:409});
      if(item.quantity!==1||!item.application||typeof item.application!=="object"||Array.isArray(item.application))return NextResponse.json({success:false,message:"بيانات الرخصة غير مكتملة."},{status:400});
      const raw=item.application as Record<string,unknown>;
      const keys=["name","phone","countryCode","nationality","residence","destination","serviceType","travelDate","height","eyeColor","licenseValidUntil","deliveryAddress","deliveryLink"];
      if(keys.some(key=>typeof raw[key]!=="string"||!(raw[key] as string).trim()||(raw[key] as string).length>240))return NextResponse.json({success:false,message:"أكمل بيانات الرخصة الأساسية."},{status:400});
      const application:Record<string,string>={};
      for(const key of [...keys,"email","notes"]){if(raw[key]!==undefined){if(typeof raw[key]!=="string"||raw[key].length>800)return NextResponse.json({success:false,message:"بيانات الرخصة طويلة أو غير صالحة."},{status:400});application[key]=(raw[key] as string).trim();}}
      if(!application.deliveryLink.startsWith("https://")||!/^\\d{4}-\\d{2}-\\d{2}$/.test(application.licenseValidUntil))return NextResponse.json({success:false,message:"رابط أو تاريخ بيانات الرخصة غير صالح."},{status:400});
      totalHalalas+=19900;
      details.push({serviceId:item.serviceId,title:"رخصة القيادة الدولية — سنة واحدة",quantity:1,unitPriceSar:199,itemType:"DRIVING_LICENSE",application});
      continue;
    }
    const service=services.find(s=>s.id===item.serviceId);
    if(!service)return NextResponse.json({success:false,message:"خدمة غير متاحة."},{status:409});
    const amount=Number(service.finalPrice);
    if(!Number.isFinite(amount)||amount<=0)return NextResponse.json({success:false,message:"سعر غير صالح."},{status:409});
    const halalas=Math.round(amount*100);
    if(Math.abs(halalas/100-amount)>0.000001)return NextResponse.json({success:false,message:"السعر يحتاج ضبط."},{status:409});
    totalHalalas+=halalas*item.quantity;
    details.push({serviceId:item.serviceId,title:service.nameAr,quantity:item.quantity,unitPriceSar:amount});
  }
  if(totalHalalas<100||totalHalalas>100000000)return NextResponse.json({success:false,message:"مبلغ خارج الحدود المسموحة."},{status:409});
  const user=await prisma.user.findUnique({where:{id:session.user.id},select:{email:true}});
  if(!user?.email)return NextResponse.json({success:false,message:"أضف بريداً إلكترونياً إلى حسابك."},{status:409});
  const reference="ALB-"+randomUUID().slice(0,12).toUpperCase();
  const order=await prisma.bankTransferOrder.create({data:{reference,userId:session.user.id,customerEmail:user.email,items:details,amountSar:totalHalalas/100,status:"AWAITING_TRANSFER"}});
  return NextResponse.json({success:true,order:{reference:order.reference,status:order.status,amountSar:totalHalalas/100},account:{bankName:account.bankName,beneficiaryName:account.beneficiaryName,iban:account.iban,qrImageUrl:account.qrImageUrl}},{status:201});
}
