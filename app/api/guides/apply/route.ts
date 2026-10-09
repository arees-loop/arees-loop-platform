import {NextRequest,NextResponse} from "next/server";
import {put} from "@vercel/blob";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
import {GUIDE_LICENSE_CATEGORIES} from "@/lib/guides/reference-data";
export const runtime="nodejs";
const value=(data:FormData,key:string)=>String(data.get(key)||"").trim();
const validFile=(file:FormDataEntryValue|null)=>file instanceof File&&file.size>0&&file.size<=5*1024*1024&&["image/jpeg","image/png","image/webp","application/pdf"].includes(file.type);
export async function POST(request:NextRequest){
 try{
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"سجل الدخول أولاً، ثم أكّد بريدك الإلكتروني."},{status:401});
 if(!session.user.emailVerifiedAt)return NextResponse.json({success:false,message:"يجب تأكيد البريد الإلكتروني في حسابك قبل تقديم طلب الإرشاد."},{status:403});
 const data=await request.formData();
 const fullName=value(data,"fullName"),email=value(data,"email").toLowerCase(),phone=value(data,"phone"),gender=value(data,"gender"),city=value(data,"city"),category=value(data,"licenseCategory"),number=value(data,"licenseNumber"),specialization=value(data,"specialization"),bio=value(data,"bio");
 const countries=[...new Set(value(data,"countries").split(/[,،\n]+/).map(x=>x.trim()).filter(Boolean))].slice(0,30);
 const languages=[...new Set(value(data,"languages").split(/[,،\n]+/).map(x=>x.trim()).filter(Boolean))].slice(0,20);
 const expires=new Date(value(data,"licenseExpiresAt")+"T00:00:00.000Z");
 const photo=data.get("photo"),license=data.get("license");
 const photoConsent=value(data,"photoPublicationConsent")==="yes";
 if(fullName.length<4||fullName.length>120||email!==session.user.email.toLowerCase()||!/^\+?[0-9]{8,15}$/.test(phone)||!["MALE","FEMALE"].includes(gender)||!city||city.length>100||!GUIDE_LICENSE_CATEGORIES.some(x=>x===category)||number.length<3||number.length>100||!countries.length||!languages.length||!Number.isFinite(expires.getTime())||expires<=new Date()||value(data,"policyAccepted")!=="yes"||!validFile(license)||photo instanceof File&&photo.size>0&&!validFile(photo)||specialization.length>300||bio.length>2000)return NextResponse.json({success:false,message:"تحقق من البيانات والترخيص الساري والموافقة على السياسات. يجب أن يكون البريد مؤكداً في حسابك."},{status:400});
 const previous=await prisma.guideApplication.findFirst({where:{userId:session.user.id,status:{in:["UNDER_REVIEW","APPROVED"]}},select:{id:true}});
 if(previous)return NextResponse.json({success:false,message:"لديك طلب مرشد قائم قيد المراجعة أو معتمد."},{status:409});
 const id=crypto.randomUUID();
 const licenseFile=license as File;
 const licenseBlob=await put(`guides/private/${id}/license-${crypto.randomUUID()}`,licenseFile,{access:"private",contentType:licenseFile.type,addRandomSuffix:false});
 let photoPath:string|null=null;
 if(photo instanceof File&&photo.size>0){
  if(!["image/jpeg","image/png","image/webp"].includes(photo.type))return NextResponse.json({success:false,message:"الصورة الشخصية يجب أن تكون JPG أو PNG أو WEBP."},{status:400});
  const uploaded=await put(`guides/private/${id}/photo-${crypto.randomUUID()}`,photo,{access:"private",contentType:photo.type,addRandomSuffix:false});
  photoPath=uploaded.pathname;
 }
 await prisma.guideApplication.create({data:{id,userId:session.user.id,fullName,email,phone,gender,countries,city,licenseCategory:category,licenseNumber:number,licenseExpiresAt:expires,specialization:specialization||null,languages,bio:bio||null,photoPath,licensePath:licenseBlob.pathname,photoPublicationConsent:photoConsent,policyAcceptedAt:new Date()}});
 return NextResponse.json({success:true,message:"تم استلام طلب المرشد وإحالته للمراجعة. لن يظهر الملف للعامة قبل الاعتماد."});
 }catch(error){console.error("Guide application error",error);return NextResponse.json({success:false,message:"تعذر إرسال الطلب حالياً. حاول مرة أخرى."},{status:500});}
}
