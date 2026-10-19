import {NextRequest,NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {findBankTransferNotes} from "@/lib/bank-transfer-notes";
 import {getCurrentSession} from "@/lib/session";
export const runtime="nodejs";
const bad=(message:string,status=400)=>NextResponse.json({success:false,message},{status,headers:{"Cache-Control":"private, no-store"}});
const acceptedActions=["CUSTOMER_OFFER_ACCEPTED","CUSTOMER_TRANSFER_SUBMITTED","ADMIN_PAYMENT_VERIFIED","ADMIN_PAYMENT_REJECTED","QUOTE_SAVED","SERVICE_OFFER_PUBLISHED"] as const;
function latestOfferEvents<T extends {action:string}>(events:T[]):T[]{
 const revisionAt=events.findIndex(e=>e.action==="QUOTE_SAVED"||e.action==="SERVICE_OFFER_PUBLISHED");
 return revisionAt<0?events:events.slice(0,revisionAt);
}
function quotePublished(status:string,events:{action:string}[]){
 return status==="QUOTE_SENT"||(status==="PROCESSING"&&events.some(e=>e.action==="SERVICE_OFFER_PUBLISHED"));
}
function quoteExpired(validUntil:Date|null){
 if(!validUntil)return false;
 const todayRiyadh=new Date(Date.now()+3*60*60*1000).toISOString().slice(0,10);
 return validUntil.toISOString().slice(0,10)<todayRiyadh;
}


export async function GET(req:NextRequest){
 const session=await getCurrentSession();if(!session)return bad("سجل الدخول",401);
 const reference=req.nextUrl.searchParams.get("reference")||"";
 const staff=["ADMIN","SUPER_ADMIN"].includes(session.user.role);
 const request=await prisma.transportRequest.findFirst({where:{reference,...(staff?{}:{userId:session.user.id})},select:{id:true,status:true,quoteAmountSar:true,quoteValidUntil:true,assignedToId:true}});
 if(!request)return bad("الطلب غير موجود",404);
 if(staff&&session.user.role!=="SUPER_ADMIN"&&request.assignedToId!==session.user.id)return bad("غير مصرح",403);
 const events=await prisma.transportRequestEvent.findMany({where:{requestId:request.id,action:{in:[...acceptedActions]}},orderBy:[{createdAt:"desc"},{id:"desc"}],select:{action:true,createdAt:true,details:true}});
 const recentEvents=latestOfferEvents(events);
 const accepted=recentEvents.some(e=>e.action==="CUSTOMER_OFFER_ACCEPTED");
 const published=quotePublished(request.status,events);
 const banks=(!staff&&accepted)?await prisma.bankTransferAccount.findMany({where:{active:true},orderBy:{createdAt:"desc"},select:{id:true,bankName:true,beneficiaryName:true,iban:true}}).catch((error:unknown)=>{console.error("Bank accounts lookup failed",error);return null;}):[];
 if(banks===null)return bad("تعذر تحميل الحسابات البنكية مؤقتاً. حاول مرة أخرى.",503);
 let noteMap:Record<string,string>={};
 if(banks.length){try{noteMap=await findBankTransferNotes(banks.map(bank=>bank.id));}catch(error){console.error("Bank transfer notes lookup failed",error);return bad("تعذر تحميل تعليمات التحويل البنكي مؤقتاً.",503);}}
 const customerBanks=banks.map(bank=>({...bank,note:noteMap[bank.id]||""}));
 return NextResponse.json({success:true,events:recentEvents.filter(e=>acceptedActions.slice(0,4).includes(e.action as typeof acceptedActions[number])),banks:customerBanks,bank:customerBanks[0]||null,amountSar:accepted&&published?Number(request.quoteAmountSar):null,canAccept:!staff&&published&&request.quoteAmountSar!==null&&!accepted&&!quoteExpired(request.quoteValidUntil)},{headers:{"Cache-Control":"private, no-store"}});
}
export async function POST(req:NextRequest){
 const session=await getCurrentSession();if(!session)return bad("سجل الدخول",401);
 const body=await req.json().catch(()=>null);
 const reference=typeof body?.reference==="string"?body.reference:"";
 const action=typeof body?.action==="string"?body.action:"";
 if(!["ACCEPT_OFFER","SUBMIT_TRANSFER","VERIFY_TRANSFER","REJECT_TRANSFER"].includes(action))return bad("إجراء غير معروف");
 const staff=["ADMIN","SUPER_ADMIN"].includes(session.user.role);
 const request=await prisma.transportRequest.findFirst({where:{reference,...(staff?{}:{userId:session.user.id})},select:{id:true,status:true,quoteAmountSar:true,quoteValidUntil:true,assignedToId:true}});
 if(!request)return bad("الطلب غير موجود",404);
 if(staff&&session.user.role!=="SUPER_ADMIN"&&request.assignedToId!==session.user.id)return bad("غير مصرح",403);
 if((action==="ACCEPT_OFFER"||action==="SUBMIT_TRANSFER")&&staff)return bad("هذا الإجراء للعميل",403);
 if((action==="VERIFY_TRANSFER"||action==="REJECT_TRANSFER")&&!staff)return bad("هذا الإجراء للإدارة",403);
 if(request.quoteAmountSar===null)return bad("لا يوجد عرض سعر صالح للسداد",409);
 if(action==="ACCEPT_OFFER"&&quoteExpired(request.quoteValidUntil))return bad("انتهت صلاحية عرض السعر. اطلب تحديث العرض من الإدارة.",409);
 const events=await prisma.transportRequestEvent.findMany({where:{requestId:request.id,action:{in:[...acceptedActions,"CUSTOMER_ATTACHMENT_UPLOADED"]}},orderBy:[{createdAt:"desc"},{id:"desc"}],select:{action:true,createdAt:true,details:true}});
 if(!quotePublished(request.status,events))return bad("يجب نشر عرض السعر للعميل قبل الموافقة والسداد.",409);
 const recentEvents=latestOfferEvents(events);
 const accepted=recentEvents.some(e=>e.action==="CUSTOMER_OFFER_ACCEPTED");
 const verified=recentEvents.some(e=>e.action==="ADMIN_PAYMENT_VERIFIED");
 const pending=recentEvents.find(e=>["CUSTOMER_TRANSFER_SUBMITTED","ADMIN_PAYMENT_VERIFIED","ADMIN_PAYMENT_REJECTED"].includes(e.action))?.action==="CUSTOMER_TRANSFER_SUBMITTED";
 if(action==="ACCEPT_OFFER"&&accepted)return bad("العرض مقبول مسبقاً",409);
 if(action!=="ACCEPT_OFFER"&&!accepted)return bad("يجب قبول العرض أولاً",409);
 if(action==="SUBMIT_TRANSFER"&&(verified||pending))return bad("الإيصال تحت المراجعة أو تم تأكيد السداد",409);
 if(action==="VERIFY_TRANSFER"&&(!pending||verified))return bad("لا يوجد إيصال بانتظار التحقق",409);
 if(action==="REJECT_TRANSFER"&&!pending)return bad("لا يوجد إيصال بانتظار المراجعة",409);
 let details:Record<string,string|number>={};
 if(action==="ACCEPT_OFFER")details={amountSar:Number(request.quoteAmountSar)};
 if(action==="SUBMIT_TRANSFER"){
  const selectedBankId=typeof body.bankAccountId==="string"?body.bankAccountId:"";
  const activeBank=selectedBankId?await prisma.bankTransferAccount.findFirst({where:{id:selectedBankId,active:true},select:{id:true}}).catch(()=>null):null;
  if(!activeBank)return bad("اختر حساباً بنكياً مفعّلاً قبل إرسال الإيصال.",409);
  const fileId=typeof body.fileId==="string"?body.fileId:"";
  const file=await prisma.transportRequestEvent.findFirst({where:{id:fileId,requestId:request.id,action:"CUSTOMER_ATTACHMENT_UPLOADED"}});
  if(!file)return bad("ارفع صورة إيصال التحويل أولاً");
  const meta=file.details as {purpose?:string}|null;
  if(meta?.purpose!=="BANK_RECEIPT")return bad("يجب اختيار نوع المرفق: إيصال تحويل");
  details={fileId};
 }
 if(action==="VERIFY_TRANSFER"){
  if(body.confirmed!==true)return bad("يجب تأكيد مطابقة الحوالة مع كشف الحساب البنكي");
  details={verification:"MANUAL_BANK_RECONCILIATION"};
 }
 if(action==="REJECT_TRANSFER")details={reason:String(body.reason||"الإيصال غير مطابق").slice(0,500)};
 const names:Record<string,string>={ACCEPT_OFFER:"CUSTOMER_OFFER_ACCEPTED",SUBMIT_TRANSFER:"CUSTOMER_TRANSFER_SUBMITTED",VERIFY_TRANSFER:"ADMIN_PAYMENT_VERIFIED",REJECT_TRANSFER:"ADMIN_PAYMENT_REJECTED"};
 // Serialize changes per request using a row lock, then recheck all preconditions.
 const updated=await prisma.$transaction(async tx=>{
  await tx.$queryRaw`SELECT id FROM "TransportRequest" WHERE id = ${request.id} FOR UPDATE`;
  const fresh=await tx.transportRequest.findUniqueOrThrow({where:{id:request.id},select:{status:true,quoteAmountSar:true,quoteValidUntil:true}});
  if(fresh.quoteAmountSar===null||action==="ACCEPT_OFFER"&&quoteExpired(fresh.quoteValidUntil))throw new Error("STALE_REQUEST");
  const freshEvents=await tx.transportRequestEvent.findMany({where:{requestId:request.id,action:{in:[...acceptedActions]}},orderBy:[{createdAt:"desc"},{id:"desc"}],select:{action:true,createdAt:true}});
  if(!quotePublished(fresh.status,freshEvents))throw new Error("STALE_REQUEST");
  const currentEvents=latestOfferEvents(freshEvents);
  const hasAccepted=currentEvents.some(e=>e.action==="CUSTOMER_OFFER_ACCEPTED");
  const lastPayment=currentEvents.find(e=>["CUSTOMER_TRANSFER_SUBMITTED","ADMIN_PAYMENT_VERIFIED","ADMIN_PAYMENT_REJECTED"].includes(e.action))?.action;
  if(action==="ACCEPT_OFFER"&&hasAccepted)throw new Error("DUPLICATE_ACTION");
  if(action!=="ACCEPT_OFFER"&&!hasAccepted)throw new Error("STALE_REQUEST");
  if(action==="SUBMIT_TRANSFER"&&["CUSTOMER_TRANSFER_SUBMITTED","ADMIN_PAYMENT_VERIFIED"].includes(lastPayment||""))throw new Error("DUPLICATE_ACTION");
  if(["VERIFY_TRANSFER","REJECT_TRANSFER"].includes(action)&&lastPayment!=="CUSTOMER_TRANSFER_SUBMITTED")throw new Error("STALE_REQUEST");
  const event=await tx.transportRequestEvent.create({data:{requestId:request.id,actorId:session.user.id,actorName:staff?"الإدارة":"العميل",action:names[action],fromStatus:fresh.status,toStatus:action==="VERIFY_TRANSFER"?"PAID":fresh.status,details}});
  if(action==="VERIFY_TRANSFER")await tx.transportRequest.update({where:{id:request.id},data:{status:"PAID"}});
  return event;
 }).catch((error:unknown)=>{if(error instanceof Error&&["STALE_REQUEST","DUPLICATE_ACTION"].includes(error.message))return null;throw error;});
 if(!updated)return bad("تغيرت حالة الطلب أو تم تنفيذ الإجراء مسبقاً. حدّث الصفحة.",409);
 return NextResponse.json({success:true,event:updated.action});
}
