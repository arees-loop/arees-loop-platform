import {NextRequest,NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
import {canManageTransport,type TransportKind} from "@/lib/transport-permissions";
import {isQuoteVatTreatment} from "@/lib/quotation-format";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const HEADERS={"Cache-Control":"private, no-store"};
const fail=(message:string,status=400)=>NextResponse.json({success:false,message},{status,headers:HEADERS});
const eventType="QUOTE_VAT_CLASSIFIED";
async function requireAccess(id:string){
 const session=await getCurrentSession();
 if(!session||!["ADMIN","SUPER_ADMIN"].includes(session.user.role))return null;
 const request=await prisma.transportRequest.findFirst({where:{
   id,...(session.user.role==="SUPER_ADMIN"?{}:{assignedToId:session.user.id}),
 },select:{id:true,kind:true,quoteAmountSar:true,quoteUpdatedAt:true}});
 if(!request||!canManageTransport(session.user,request.kind as TransportKind))return null;
 return {request,session};
}
export async function POST(req:NextRequest){
 const body=await req.json().catch(()=>null);
 const id=typeof body?.id==="string"?body.id:"";
 if(!id||id.length>150)return fail("معرف الطلب غير صحيح.");
 const auth=await requireAccess(id);
 if(!auth)return fail("غير مصرح بإعداد المعالجة الضريبية.",403);
 if(auth.request.quoteAmountSar===null)return fail("يجب حفظ عرض السعر أولاً.",409);
 const treatment=body?.treatment;
 if(!isQuoteVatTreatment(treatment))return fail("اختيار المعالجة الضريبية غير صحيح.");
 if(treatment==="ZERO_RATED_INTERNATIONAL"&&!["FLIGHT","FERRY"].includes(auth.request.kind))return fail("التصنيف الخاص بالنقل الدولي مخصص لتذاكر الطيران أو البواخر المؤهلة فقط.",400);
 if(treatment!=="UNDETERMINED"&&body.confirmed!==true)
   return fail("يرجى تأكيد أن التصنيف الضريبي راجعه المسؤول المختص.");
 const event=await prisma.transportRequestEvent.create({data:{
   requestId:id,actorId:auth.session.user.id,actorName:"إدارة أريس",
   action:eventType,details:{treatment,quoteUpdatedAt:auth.request.quoteUpdatedAt?.toISOString()||null,
     reviewedBy:auth.session.user.id,customerTotalSar:Number(auth.request.quoteAmountSar)},
  },select:{id:true}});
 return NextResponse.json({success:true,eventId:event.id,message:"تم حفظ معالجة الضريبة لعرض السعر دون تغيير السعر الإجمالي للعميل."},{headers:HEADERS});
}
