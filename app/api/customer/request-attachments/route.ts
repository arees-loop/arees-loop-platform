import { NextRequest,NextResponse } from "next/server";
import { randomUUID, createHash } from "node:crypto";
import { put,get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { allowedTransportKinds } from "@/lib/transport-permissions";
export const runtime="nodejs";
const fail=(message:string,status=400)=>NextResponse.json({success:false,message},{status,headers:{"Cache-Control":"no-store"}});
async function access(reference:string,token?:string|null){
 const session=await getCurrentSession();
 const isStaff=!!session&&["ADMIN","SUPER_ADMIN"].includes(session.user.role);
 const hash=typeof token==="string"&&/^[A-Za-z0-9_-]{43}$/.test(token)?createHash("sha256").update(token).digest("hex"):null;
 const request=await prisma.transportRequest.findFirst({where:{reference,...(isStaff?(session!.user.role==="SUPER_ADMIN"?{}:{assignedToId:session!.user.id,kind:{in:allowedTransportKinds(session!.user)}}):{OR:[...(session?[{userId:session.user.id}]:[]),...(hash?[{trackingTokenHash:hash}]:[])]})},select:{id:true,reference:true}});
 return request?{request,session,isStaff}:null;
}
export async function GET(req:NextRequest){
 const reference=req.nextUrl.searchParams.get("reference")||"";
 if(!/^AR-(AIR|SEA|VISA|LIC)-[A-F0-9]{10}$/.test(reference))return fail("مرجع غير صالح.");
 const auth=await access(reference,req.headers.get("x-arees-request-token"));if(!auth)return fail("غير مصرح بعرض المرفقات.",403);
 const events=await prisma.transportRequestEvent.findMany({where:{requestId:auth.request.id,action:"CUSTOMER_ATTACHMENT_UPLOADED"},orderBy:{createdAt:"desc"},take:100,select:{id:true,createdAt:true,details:true}});
 const files=events.map(e=>{const d=e.details as {name?:string;contentType?:string;size?:number;purpose?:string;label?:string}|null;return {id:e.id,name:d?.name||"مرفق",contentType:d?.contentType,size:d?.size,purpose:d?.purpose,label:d?.label,createdAt:e.createdAt}});
 const fileId=req.nextUrl.searchParams.get("file");
 if(!fileId)return NextResponse.json({success:true,data:files},{headers:{"Cache-Control":"private, no-store"}});
 const event=events.find(e=>e.id===fileId);if(!event)return fail("الملف غير موجود.",404);
 const d=event.details as {pathname?:string;name?:string;contentType?:string}|null;
 if(!d?.pathname||!d.pathname.startsWith("customer-attachments/"+auth.request.id+"/"))return fail("الملف غير موجود.",404);
 const blob=await get(d.pathname,{access:"private"});
 if(!blob||blob.statusCode!==200)return fail("تعذر قراءة المرفق.",404);
 return new Response(blob.stream,{headers:{"Content-Type":d.contentType||"application/octet-stream","Content-Disposition":"attachment; filename=\"attachment\"","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}
export async function POST(req:NextRequest){
 const data=await req.formData();const reference=String(data.get("reference")||"");
 if(!/^AR-(AIR|SEA|VISA|LIC)-[A-F0-9]{10}$/.test(reference))return fail("مرجع غير صالح.");
 const auth=await access(reference,String(data.get("token")||""));if(!auth||auth.isStaff)return fail("المرفقات لصاحب الطلب فقط.",403);
 const purpose=String(data.get("purpose")||"DOCUMENT");if(!["DOCUMENT","BANK_RECEIPT"].includes(purpose))return fail("نوع المرفق غير صالح.");
 const label=String(data.get("label")||"").trim();
 if(purpose==="DOCUMENT"&&(!label||label.length>100))return fail("اكتب اسم المرفق (حتى 100 حرف).");
 const count=await prisma.transportRequestEvent.count({where:{requestId:auth.request.id,action:"CUSTOMER_ATTACHMENT_UPLOADED"}});
 if(count>=12)return fail("وصلت إلى الحد الأقصى: 12 مرفقاً للطلب.",409);
 const file=data.get("file");if(!(file instanceof File))return fail("اختر ملفاً.");
 if(file.size===0||file.size>5*1024*1024)return fail("حجم الملف يجب ألا يتجاوز 5 ميجابايت.");
 const allowed=["application/pdf","image/jpeg","image/png","image/webp"];
 if(!allowed.includes(file.type))return fail("المسموح PDF أو JPG أو PNG أو WebP.");
 const bytes=new Uint8Array(await file.arrayBuffer());
 const pdf=file.type==="application/pdf"&&String.fromCharCode(...bytes.slice(0,5))==="%PDF-";
 const jpg=file.type==="image/jpeg"&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 const png=file.type==="image/png"&&bytes.slice(0,8).every((v,i)=>v===[137,80,78,71,13,10,26,10][i]);
 const webp=file.type==="image/webp"&&String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP";
 if(!(pdf||jpg||png||webp))return fail("محتوى الملف لا يطابق نوعه.");
 const extension=pdf?"pdf":jpg?"jpg":png?"png":"webp";
 const pathname="customer-attachments/"+auth.request.id+"/"+randomUUID()+"."+extension;
 const uploaded=await put(pathname,Buffer.from(bytes),{access:"private",contentType:file.type,addRandomSuffix:false});
 try{
 await prisma.transportRequestEvent.create({data:{requestId:auth.request.id,actorId:auth.session?.user.id??null,actorName:"العميل",action:"CUSTOMER_ATTACHMENT_UPLOADED",details:{pathname:uploaded.pathname,name:file.name.slice(0,140),contentType:file.type,size:file.size,purpose,label:purpose==="BANK_RECEIPT"?"إثبات التحويل البنكي":label}}});
 }catch(e){console.error("Attachment metadata save failed",e);return fail("لم يكتمل حفظ المرفق. حاول مرة أخرى.",503);}
 return NextResponse.json({success:true,message:"تم استلام المرفق بنجاح."},{headers:{"Cache-Control":"no-store"}});
}
