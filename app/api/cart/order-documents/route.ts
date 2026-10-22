import {NextRequest,NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {get,put,del} from "@vercel/blob";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
import {CART_ENTITY,CART_CREATED,CART_DOCUMENT,CART_STATUS,CART_VERIFIED,cartStaff,asRecord} from "@/lib/cart-order-workflow";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
const fail=(message:string,status=400)=>NextResponse.json({success:false,message},{status,headers});
const valid=(reference:string)=>/^CART-[0-9a-f-]{36}$/.test(reference);
async function authorize(reference:string){
 const session=await getCurrentSession();
 if(!session||session.user.status!=="ACTIVE")return null;
 const staff=cartStaff(session.user);
 const order=await prisma.auditLog.findFirst({where:{entityType:CART_ENTITY,entityId:reference,action:CART_CREATED,...(staff?{}:{userId:session.user.id})},select:{id:true,userId:true}});
 if(!order)return null;
 return {session,staff,order};
}
export async function GET(req:NextRequest){
 const reference=req.nextUrl.searchParams.get("reference")||"",eventId=req.nextUrl.searchParams.get("document")||"";
 if(!valid(reference)||!eventId)return fail("الطلب أو الملف غير صالح.");
 const auth=await authorize(reference);
 if(!auth)return fail("غير مصرح.",403);
 try{
  const event=await prisma.auditLog.findFirst({where:{id:eventId,entityType:CART_ENTITY,entityId:reference,action:CART_DOCUMENT},select:{afterData:true}});
  const data=asRecord(event?.afterData),pathname=data.pathname;
  if(typeof pathname!=="string"||!pathname.startsWith("cart-order-documents/"+reference+"/"))return fail("الملف غير موجود.",404);
  const blob=await get(pathname,{access:"private"});
  if(!blob||blob.statusCode!==200)return fail("الملف غير موجود.",404);
  const allowed=["application/pdf","image/jpeg","image/png","image/webp"];
  const type=typeof data.contentType==="string"&&allowed.includes(data.contentType)?data.contentType:"application/octet-stream";
  const suffix=type==="application/pdf"?"pdf":type==="image/jpeg"?"jpg":type==="image/png"?"png":type==="image/webp"?"webp":"bin";
  const inline=req.nextUrl.searchParams.get("inline")==="true";
  return new Response(blob.stream,{headers:{...headers,"Content-Type":type,"Content-Disposition":(inline?"inline":"attachment")+'; filename="arees-order-document.'+suffix+'"',"X-Frame-Options":"SAMEORIGIN","Content-Security-Policy":"default-src 'none'; sandbox"}});
 }catch(error){console.error("Cart document read failed",error);return fail("تعذر قراءة المرفق.",503);}
}
export async function POST(req:NextRequest){
 let uploaded:string|null=null;
 try{
  const data=await req.formData();
  const reference=String(data.get("reference")||"");
  if(!valid(reference))return fail("مرجع غير صالح.");
  const auth=await authorize(reference);
  if(!auth)return fail("غير مصرح.",403);
  const verified=await prisma.auditLog.findFirst({where:{entityType:CART_ENTITY,entityId:reference,action:CART_VERIFIED},select:{id:true}});
  if(!auth.staff){
   if(!verified)return fail("رفع مستندات إضافية متاح بعد اعتماد السداد وطلب المستندات من الإدارة.",409);
   const latest=await prisma.auditLog.findFirst({where:{entityType:CART_ENTITY,entityId:reference,action:CART_STATUS},orderBy:[{createdAt:"desc"},{id:"desc"}],select:{afterData:true}});
   if(asRecord(latest?.afterData).status!=="DOCUMENTS_REQUESTED")return fail("لا توجد مستندات مطلوبة حالياً.",409);
  }else if(!verified)return fail("إرسال ملف الخدمة يتطلب التحقق من السداد.",409);
  const recent=await prisma.auditLog.count({where:{entityType:CART_ENTITY,action:CART_DOCUMENT,userId:auth.session.user.id,createdAt:{gte:new Date(Date.now()-3600000)}}});
  if(recent>=12)return fail("الحد المؤقت للمرفقات 12 ملفاً لكل ساعة.",429);
  const file=data.get("file");
  if(!(file instanceof File)||file.size<100||file.size>8*1024*1024)return fail("أرفق ملفاً لا يتجاوز 8 ميجابايت.");
  const ext=file.type==="application/pdf"?"pdf":file.type==="image/jpeg"?"jpg":file.type==="image/png"?"png":file.type==="image/webp"?"webp":null;
  if(!ext)return fail("المسموح PDF وJPG وPNG وWebP.");
  const bytes=new Uint8Array(await file.arrayBuffer());
  const validBytes=(ext==="pdf"&&String.fromCharCode(...bytes.slice(0,5))==="%PDF-")||(ext==="jpg"&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)||(ext==="png"&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))||(ext==="webp"&&String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP");
  if(!validBytes)return fail("نوع الملف لا يطابق محتواه.");
  const name=file.name.slice(0,120).replace(/[<>"]/g,"").trim()||"مرفق";
  uploaded="cart-order-documents/"+reference+"/"+randomUUID()+"."+ext;
  await put(uploaded,Buffer.from(bytes),{access:"private",contentType:file.type,addRandomSuffix:false});
  const event=await prisma.auditLog.create({data:{entityType:CART_ENTITY,entityId:reference,userId:auth.session.user.id,action:CART_DOCUMENT,afterData:{pathname:uploaded,contentType:file.type,size:file.size,name,from:auth.staff?"ADMIN":"CUSTOMER"}}});
  return NextResponse.json({success:true,id:event.id,message:"تم حفظ المرفق في الطلب."},{headers});
 }catch(error){console.error("Cart document write failed",error);if(uploaded)await del(uploaded).catch(()=>{});return fail("تعذر حفظ المرفق.",503);}
}
