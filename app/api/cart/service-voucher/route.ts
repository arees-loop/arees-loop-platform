import {NextRequest,NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {put,get,del} from "@vercel/blob";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const TYPE="CART_BANK_CHECKOUT", CREATED="CART_BANK_CREATED", VERIFIED="CART_BANK_VERIFIED", VOUCHER="CART_SERVICE_VOUCHER_UPLOADED";
const fail=(message:string,status=400)=>NextResponse.json({success:false,message},{status,headers:{"Cache-Control":"private, no-store"}});
const object=(x:unknown):Record<string,unknown>=>x&&typeof x==="object"&&!Array.isArray(x)?x as Record<string,unknown>:{};
export async function GET(req:NextRequest){
 const session=await getCurrentSession();if(!session)return fail("يجب تسجيل الدخول.",401);
 const reference=req.nextUrl.searchParams.get("reference")||"";
 if(!/^CART-[0-9a-f-]{36}$/.test(reference))return fail("المرجع غير صحيح.");
 const p=Array.isArray(session.user.adminPermissions)?session.user.adminPermissions.map(String):[];
 const staff=session.user.role==="SUPER_ADMIN"||(session.user.role==="ADMIN"&&p.includes("BOOKINGS"));
 try{
  const order=await prisma.auditLog.findFirst({where:{entityType:TYPE,entityId:reference,action:CREATED,...(staff?{}:{userId:session.user.id})},select:{id:true,userId:true}});
  if(!order)return fail("الطلب غير موجود أو ليس لك صلاحية.",404);
  const approved=await prisma.auditLog.findFirst({where:{entityType:TYPE,entityId:reference,action:VERIFIED},select:{id:true}});
  if(!approved)return fail("ملف الخدمة لا يظهر إلا بعد التحقق من السداد.",403);
  const file=await prisma.auditLog.findFirst({where:{entityType:TYPE,entityId:reference,action:VOUCHER},orderBy:[{createdAt:"desc"},{id:"desc"}],select:{afterData:true,createdAt:true}});
  if(!file)return NextResponse.json({success:true,available:false},{headers:{"Cache-Control":"private, no-store"}});
  if(req.nextUrl.searchParams.get("download")!=="true")return NextResponse.json({success:true,available:true,uploadedAt:file.createdAt},{headers:{"Cache-Control":"private, no-store"}});
  const data=object(file.afterData),pathname=data.pathname;
  if(typeof pathname!=="string"||!pathname.startsWith("cart-service-vouchers/"+reference+"/"))return fail("ملف الخدمة غير موجود.",404);
  const blob=await get(pathname,{access:"private"});
  if(!blob||blob.statusCode!==200)return fail("ملف الخدمة غير موجود.",404);
  const type=typeof data.contentType==="string"&&["application/pdf","image/jpeg","image/png","image/webp"].includes(data.contentType)?data.contentType:"application/octet-stream";
  return new Response(blob.stream,{headers:{"Content-Type":type,"Content-Disposition":"attachment; filename=\"arees-service-voucher\"","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"default-src 'none'; sandbox"}});
 }catch(error){console.error("Cart voucher retrieve error",error);return fail("تعذر جلب ملف الخدمة.",503);}
}
export async function POST(req:NextRequest){
 const session=await getCurrentSession();
 const p=Array.isArray(session?.user.adminPermissions)?session.user.adminPermissions.map(String):[];
 if(!session||(session.user.role!=="SUPER_ADMIN"&&!(session.user.role==="ADMIN"&&p.includes("BOOKINGS"))))return fail("غير مصرح.",403);
 let path:string|null=null;
 try{
  const data=await req.formData(),reference=String(data.get("reference")||"");
  if(!/^CART-[0-9a-f-]{36}$/.test(reference))return fail("المرجع غير صحيح.");
  const order=await prisma.auditLog.findFirst({where:{entityType:TYPE,entityId:reference,action:CREATED},select:{id:true}});
  if(!order)return fail("الطلب غير موجود.",404);
  const verified=await prisma.auditLog.findFirst({where:{entityType:TYPE,entityId:reference,action:VERIFIED},select:{id:true}});
  if(!verified)return fail("لا يمكن إرفاق الفاوتشر قبل اعتماد السداد.",409);
  const file=data.get("file");
  if(!(file instanceof File)||file.size<100||file.size>8*1024*1024)return fail("أرفق ملف خدمة لا يتجاوز 8 ميجابايت.");
  const ext=file.type==="application/pdf"?"pdf":file.type==="image/jpeg"?"jpg":file.type==="image/png"?"png":file.type==="image/webp"?"webp":null;
  if(!ext)return fail("المسموح PDF أو صورة JPG/PNG/WebP.");
  const bytes=new Uint8Array(await file.arrayBuffer());
  const ok=(ext==="pdf"&&String.fromCharCode(...bytes.slice(0,5))==="%PDF-")||(ext==="jpg"&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)||(ext==="png"&&[137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n))||(ext==="webp"&&String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP");
  if(!ok)return fail("محتوى الملف غير مطابق لنوعه.");
  path="cart-service-vouchers/"+reference+"/"+randomUUID()+"."+ext;
  await put(path,Buffer.from(bytes),{access:"private",contentType:file.type,addRandomSuffix:false});
  await prisma.auditLog.create({data:{userId:session.user.id,entityType:TYPE,entityId:reference,action:VOUCHER,afterData:{pathname:path,contentType:file.type,size:file.size}}});
  return NextResponse.json({success:true,message:"تم حفظ ملف الخدمة بأمان، ويمكن للعميل تنزيله من الطلب."},{headers:{"Cache-Control":"private, no-store"}});
 }catch(error){if(path)await del(path).catch(()=>{});console.error("Cart voucher upload error",error);return fail("تعذر حفظ ملف الخدمة.",503);}
}
