import {NextResponse} from "next/server";
import {get} from "@vercel/blob";
import {prisma} from "@/lib/prisma";
import {authorizedAttachmentContext,attachmentWriteEnabled} from "@/lib/request-attachment-access";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 if(!attachmentWriteEnabled())return new Response("Attachments are not enabled",{status:503});
 const {id}=await params;
 if(!/^[a-z0-9]{15,35}$/i.test(id))return new Response("Not found",{status:404});
 try{
  const file=await prisma.requestAttachment.findUnique({where:{id},select:{
    id:true,blobPath:true,originalName:true,mimeType:true,transportRequestId:true,hotelInquiryId:true,
    transportRequest:{select:{reference:true}},hotelInquiry:{select:{reference:true}}
  }});
  const reference=file?.transportRequest?.reference||file?.hotelInquiry?.reference;
  if(!file||!reference)return new Response("Not found",{status:404});
  const ctx=await authorizedAttachmentContext(reference);
  if(!ctx||ctx.type==="HOTEL"&&ctx.id!==file.hotelInquiryId||ctx.type==="TRANSPORT"&&ctx.id!==file.transportRequestId)
    return new Response("Forbidden",{status:403});
  const blob=await get(file.blobPath,{access:"private"});
  if(!blob)return new Response("Not found",{status:404});
  const ext=file.mimeType==="application/pdf"?"pdf":file.mimeType==="image/png"?"png":"jpg";
  return new NextResponse(blob.stream,{headers:{
    "Content-Type":file.mimeType,
    "Content-Disposition":`attachment; filename="arees-loop-document-${file.id}.${ext}"`,
    "Cache-Control":"private, no-store, max-age=0",
    "X-Content-Type-Options":"nosniff",
    "Content-Security-Policy":"sandbox",
    "Referrer-Policy":"no-referrer"
  }});
 }catch(error){
  console.error("Private document retrieval failed",error instanceof Error?error.name:"UNKNOWN");
  return new Response("Unable to retrieve document",{status:503});
 }
}
