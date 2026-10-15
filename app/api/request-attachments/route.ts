import {NextRequest,NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {put,del} from "@vercel/blob";
import {prisma} from "@/lib/prisma";
import {authorizedAttachmentContext,attachmentWhere,attachmentWriteEnabled,REF_PATTERN} from "@/lib/request-attachment-access";
import {notifyCustomerOfRequestUpdate} from "@/lib/request-notification";
import {canManageTransport} from "@/lib/transport-permissions";
import {canManageHotel} from "@/lib/hotel-permissions";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const MAX_SIZE=4*1024*1024;
const MIME:Record<string,string>={"image/jpeg":"jpg","image/png":"png","application/pdf":"pdf"};
function json(data:unknown,status=200){return NextResponse.json(data,{status,headers:{"Cache-Control":"private, no-store"}});}
function result(a:{id:string;originalName:string;mimeType:string;sizeBytes:number;note:string|null;uploaderRole:string;createdAt:Date}){
 return {id:a.id,name:a.originalName,mimeType:a.mimeType,sizeBytes:a.sizeBytes,note:a.note,uploaderRole:a.uploaderRole,createdAt:a.createdAt,downloadUrl:`/api/request-attachments/${a.id}/download`};
}
export async function GET(request:NextRequest){
 const reference=request.nextUrl.searchParams.get("reference")||"";
 if(!REF_PATTERN.test(reference))return json({success:false,message:"مرجع غير صالح."},400);
 try{
  const ctx=await authorizedAttachmentContext(reference);
  if(!ctx)return json({success:false,message:"لا توجد صلاحية لعرض مرفقات هذا الطلب."},403);
  if(!attachmentWriteEnabled())return json({success:true,enabled:false,data:[]});
  const data=await prisma.requestAttachment.findMany({where:attachmentWhere(ctx),orderBy:{createdAt:"asc"},take:60,
    select:{id:true,originalName:true,mimeType:true,sizeBytes:true,note:true,uploaderRole:true,createdAt:true}});
  return json({success:true,enabled:true,data:data.map(result)});
 }catch(err){console.error("Attachment list unavailable",err instanceof Error?err.name:"UNKNOWN");return json({success:false,message:"تعذر قراءة المرفقات حالياً."},503);}
}
export async function POST(request:NextRequest){
 if(!attachmentWriteEnabled())return json({success:false,message:"رفع المستندات قيد التفعيل بعد اختبار التخزين وقاعدة البيانات."},503);
 let pathname:string|undefined;
 try{
  const form=await request.formData();
  const reference=form.get("reference");
  const file=form.get("file");
  const note=String(form.get("note")||"").trim().slice(0,500);
  if(typeof reference!=="string"||!REF_PATTERN.test(reference))return json({success:false,message:"مرجع غير صالح."},400);
  const ctx=await authorizedAttachmentContext(reference);
  if(!ctx)return json({success:false,message:"لا توجد صلاحية لإرفاق مستند بهذا الطلب."},403);
  if(!ctx.staff&&["CANCELED","CLOSED","DONE"].includes(ctx.status))return json({success:false,message:"هذا الطلب مغلق أمام مرفقات العميل."},409);
  if(ctx.staff&&["CANCELED","CLOSED"].includes(ctx.status))return json({success:false,message:"هذا الطلب مغلق."},409);
  if(!(file instanceof File)||file.size<100||file.size>MAX_SIZE)return json({success:false,message:"أرفق صورة JPG/PNG أو PDF لا يتجاوز 4 ميجابايت."},400);
  const extension=MIME[file.type];
  if(!extension)return json({success:false,message:"نوع الملف غير مدعوم."},415);
  const signature=new Uint8Array(await file.slice(0,8).arrayBuffer());
  const isPng=extension==="png"&&[137,80,78,71,13,10,26,10].every((v,i)=>signature[i]===v);
  const isJpg=extension==="jpg"&&signature[0]===255&&signature[1]===216&&signature[2]===255;
  const isPdf=extension==="pdf"&&String.fromCharCode(...signature.slice(0,5))==="%PDF-";
  if(!(isPng||isJpg||isPdf))return json({success:false,message:"محتوى الملف لا يطابق نوعه."},415);
  const existing=await prisma.requestAttachment.count({where:attachmentWhere(ctx)});
  if(existing>=20)return json({success:false,message:"بلغ الطلب الحد الأقصى 20 مرفقاً. تواصل مع الإدارة."},409);
  const name=file.name.replace(/[\\/\x00-\x1f]/g,"").slice(0,110)||"document."+extension;
  const blob=await put(`request-documents/${ctx.type.toLowerCase()}/${ctx.id}/${randomUUID()}.${extension}`,file,
    {access:"private",contentType:file.type,addRandomSuffix:false});
  pathname=blob.pathname;
  const [attachment,event]=await prisma.$transaction(async tx=>{
   const attachment=await tx.requestAttachment.create({data:{
    ...attachmentWhere(ctx),uploaderId:ctx.actorId,uploaderRole:ctx.staff?"STAFF":"CUSTOMER",
    originalName:name,blobPath:blob.pathname,mimeType:file.type,sizeBytes:file.size,note:note||null
   }});
   const details={attachmentId:attachment.id,kind:file.type};
   const event=ctx.type==="HOTEL"
    ? await tx.hotelInquiryEvent.create({data:{requestId:ctx.id,actorId:ctx.actorId,actorName:ctx.staff?"موظف أريس":"العميل",
      action:ctx.staff?"DOCUMENT_SENT_TO_CUSTOMER":"CUSTOMER_DOCUMENT_UPLOADED",fromStatus:ctx.status,toStatus:ctx.status,details}})
    : await tx.transportRequestEvent.create({data:{requestId:ctx.id,actorId:ctx.actorId,actorName:ctx.staff?"موظف أريس":"العميل",
      action:ctx.staff?"DOCUMENT_SENT_TO_CUSTOMER":"CUSTOMER_DOCUMENT_UPLOADED",fromStatus:ctx.status,toStatus:ctx.status,details}});
   return [attachment,event] as const;
  });
  if(ctx.staff&&ctx.customerId){
   await notifyCustomerOfRequestUpdate({kind:ctx.type==="HOTEL"?"HOTEL":ctx.transportKind!,requestId:ctx.id,reference:ctx.reference,userId:ctx.customerId,eventId:event.id,
     title:"مرفق جديد من أريس لوب",body:"تمت إضافة مستند إلى طلبك. افتح الطلب للاطلاع عليه وتنزيله."})
   .catch(e=>console.error("Attachment customer notification failed",e instanceof Error?e.name:"UNKNOWN"));
  }else if(!ctx.staff){
   const admins=await prisma.user.findMany({where:{status:"ACTIVE",role:{in:["ADMIN","SUPER_ADMIN"]}},select:{id:true,role:true,adminPermissions:true}});
   const assigned=ctx.type==="HOTEL"
    ?await prisma.hotelInquiry.findUnique({where:{id:ctx.id},select:{assignedToId:true}})
    :await prisma.transportRequest.findUnique({where:{id:ctx.id},select:{assignedToId:true}});
   const relevant=admins.filter(a=>{
    const permission=ctx.type==="HOTEL"?canManageHotel(a):canManageTransport(a,ctx.transportKind!);
    return permission&&(a.role==="SUPER_ADMIN"||a.id===assigned?.assignedToId);
   });
   await prisma.userNotification.createMany({data:relevant.map(a=>({
    userId:a.id,type:"CUSTOMER_ATTACHMENT",title:"مستند جديد على طلب",
    body:"أضاف العميل مستنداً إلى طلب يحتاج المراجعة.",
    href:ctx.type==="HOTEL"?`/admin/hotels?view=requests&reference=${ctx.reference}`:
      `/admin/transport/${ctx.transportKind==="FLIGHT"?"flights":ctx.transportKind==="FERRY"?"ferries":ctx.transportKind==="VISA"?"visas":"driving-licenses"}?view=requests&reference=${ctx.reference}`,
    sourceKey:`attachment:${attachment.id}:${a.id}`
   })),skipDuplicates:true}).catch(e=>console.error("Attachment staff notification failed",e instanceof Error?e.name:"UNKNOWN"));
  }
  return json({success:true,data:result(attachment)});
 }catch(error){
  if(pathname)await del(pathname).catch(()=>{});
  console.error("Private attachment upload failed",error instanceof Error?error.name:"UNKNOWN");
  return json({success:false,message:"تعذر حفظ المرفق بأمان. لم يُرسل الطلب. أعد المحاولة."},503);
 }
}
