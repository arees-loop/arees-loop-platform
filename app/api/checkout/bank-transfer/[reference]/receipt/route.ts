import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const runtime="nodejs";
export async function POST(request:NextRequest,context:{params:Promise<{reference:string}>}) {
  const session=await getCurrentSession();
  if(!session)return NextResponse.json({success:false,message:"سجّل الدخول أولاً."},{status:401});
  const {reference}=await context.params;
  const order=await prisma.bankTransferOrder.findFirst({where:{reference,userId:session.user.id}});
  if(!order)return NextResponse.json({success:false,message:"الطلب غير موجود."},{status:404});
  if(!["AWAITING_TRANSFER","NEEDS_CORRECTION"].includes(order.status))return NextResponse.json({success:false,message:"لا يسمح باستبدال الإيصال في هذه الحالة."},{status:409});
  const form=await request.formData();
  const file=form.get("receipt");
  if(!(file instanceof File)||file.size<100||file.size>5*1024*1024)return NextResponse.json({success:false,message:"أرفق صورة أو PDF أقل من 5 ميجابايت."},{status:400});
  const allowed:Record<string,string>={"image/png":"png","image/jpeg":"jpg","application/pdf":"pdf"};
  const ext=allowed[file.type];
  if(!ext)return NextResponse.json({success:false,message:"الملفات المدعومة JPG وPNG وPDF فقط."},{status:415});
  const signature=new Uint8Array(await file.slice(0,8).arrayBuffer());
  const isPng=signature.length>=8&&[137,80,78,71,13,10,26,10].every((x,i)=>signature[i]===x);
  const isJpg=signature[0]===255&&signature[1]===216&&signature[2]===255;
  const isPdf=String.fromCharCode(...signature.slice(0,5))==="%PDF-";
  if(!(ext==="png"&&isPng||ext==="jpg"&&isJpg||ext==="pdf"&&isPdf))return NextResponse.json({success:false,message:"محتوى الملف غير مطابق لنوعه."},{status:415});
  try{
    const blob=await put("bank-transfer-receipts/"+order.id+"/"+randomUUID()+"."+ext,file,{access:"private",contentType:file.type,addRandomSuffix:false});
    const changed=await prisma.bankTransferOrder.updateMany({where:{id:order.id,userId:session.user.id,status:{in:["AWAITING_TRANSFER","NEEDS_CORRECTION"]}},data:{receiptPath:blob.pathname,receiptUploadedAt:new Date(),status:"RECEIPT_UNDER_REVIEW",reviewNotes:null}});
    if(changed.count!==1)return NextResponse.json({success:false,message:"تغيّرت حالة الطلب أثناء رفع الملف، أعد تحميل الصفحة."},{status:409});
    return NextResponse.json({success:true,status:"RECEIPT_UNDER_REVIEW",message:"تم استلام إشعار التحويل للمراجعة. هذا لا يؤكد وصول المبلغ."});
  }catch(e){console.error("Bank transfer receipt upload error",e);return NextResponse.json({success:false,message:"تعذر رفع الإيصال حالياً."},{status:503});}
}
