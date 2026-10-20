import {NextRequest,NextResponse} from "next/server";
import {get} from "@vercel/blob";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const fail=(message:string,status=400)=>NextResponse.json({success:false,message},{status,headers:{"Cache-Control":"private, no-store"}});
export async function GET(req:NextRequest){
 const session=await getCurrentSession();
 if(!session||session.user.role!=="SUPER_ADMIN")return fail("غير مصرح بعرض مستندات العملاء.",403);
 const reference=req.nextUrl.searchParams.get("reference")||"",slot=req.nextUrl.searchParams.get("slot")||"";
 if(!/^LICC-[0-9a-f-]{36}$/.test(reference)||!["PASSPORT","LOCAL_LICENSE","PORTRAIT"].includes(slot))return fail("الطلب أو نوع المستند غير صحيح.");
 try{
  const request=await prisma.auditLog.findFirst({where:{entityType:"LICENSE_CART_APPLICATION",
   entityId:reference,action:"LICENSE_FORM_ADDED_TO_CART"},select:{userId:true,afterData:true}});
  if(!request?.userId)return fail("طلب الرخصة غير موجود.",404);
  const d=request.afterData&&typeof request.afterData==="object"&&!Array.isArray(request.afterData)?
   request.afterData as Record<string,unknown>:{};
  const ids=d.documentIds;
  if(!Array.isArray(ids)||ids.length!==3||ids.some(x=>typeof x!=="string"))return fail("المستندات غير متاحة لهذا الطلب.",404);
  const index=["PASSPORT","LOCAL_LICENSE","PORTRAIT"].indexOf(slot);
  const doc=await prisma.internationalLicenseDocument.findFirst({where:{id:String(ids[index]),userId:request.userId,
   slot},select:{blobPath:true,mimeType:true}});
  if(!doc||!doc.blobPath.startsWith("license-applications/"+request.userId+"/"))return fail("المستند غير موجود.",404);
  const blob=await get(doc.blobPath,{access:"private"});
  if(!blob||blob.statusCode!==200)return fail("المستند غير موجود.",404);
  const ext=doc.mimeType==="image/png"?"png":doc.mimeType==="image/jpeg"?"jpg":null;
  if(!ext)return fail("صيغة غير مدعومة.",415);
  return new Response(blob.stream,{headers:{"Content-Type":doc.mimeType,"Content-Disposition":'attachment; filename="license-'+slot.toLowerCase()+'.'+ext+'"',
   "Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"default-src 'none'; sandbox"}});
 }catch(e){console.error("License document admin retrieval failed",e instanceof Error?e.name:"UNKNOWN");
  return fail("تعذر فتح مستندات الرخصة.",503);}
}
