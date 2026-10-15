import {NextRequest,NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const REF=/^AR-(AIR|SEA|HOT|VISA|IDL)-[A-F0-9]{10}$/;
function response(message:string,status:number){return NextResponse.json({success:false,message},{status,headers:{"Cache-Control":"private, no-store"}});}
const labels:Record<string,string>={FLIGHT:"طلب تذكرة طيران",FERRY:"طلب باخرة",HOTEL:"طلب فندق",VISA:"طلب تأشيرة",DRIVING_LICENSE:"طلب رخصة دولية"};

/** Read-only quote verification: never accept price, status or currency from the browser. */
export async function POST(request:NextRequest){
  let body:unknown;
  try{body=await request.json();}catch{return response("طلب غير صالح.",400);}
  if(!body||typeof body!=="object"||Array.isArray(body))return response("طلب غير صالح.",400);
  const data=body as Record<string,unknown>;
  const reference=data.reference;
  if(typeof reference!=="string"||!REF.test(reference))return response("مرجع الطلب غير صحيح.",400);
  const session=await getCurrentSession();
  if(!session)return response("سجّل الدخول قبل الاطلاع على وسائل السداد.",401);
  // A legacy guest tracking token is not a payment authorization.
  // Only the account that owns a request may access its checkout.
  const auth=[{userId:session.user.id}];
  try{
    const isHotel=reference.startsWith("AR-HOT-");
    const requestItem=isHotel?await prisma.hotelInquiry.findFirst({
      where:{reference,OR:auth},
      select:{reference:true,status:true,quoteAmountSar:true,quoteNotes:true}
    }):await prisma.transportRequest.findFirst({
      where:{reference,OR:auth},
      select:{reference:true,kind:true,status:true,quoteAmountSar:true,quoteNotes:true,quoteValidUntil:true}
    });
    if(!requestItem)return response("لا يمكن الوصول إلى هذا الطلب من حسابك.",404);
    const amount=requestItem.quoteAmountSar===null?null:Number(requestItem.quoteAmountSar);
    const expiry="quoteValidUntil" in requestItem?requestItem.quoteValidUntil:null;
    const expired=expiry instanceof Date&&expiry.getTime()<Date.now();
    const eligible=requestItem.status==="QUOTE_SENT"&&amount!==null&&Number.isFinite(amount)&&amount>0&&!expired;
    const kind="kind" in requestItem&&typeof requestItem.kind==="string"?requestItem.kind:"HOTEL";
    const reason=["CLOSED","CANCELED","CANCELLED"].includes(requestItem.status)?
      "هذا الطلب مغلق أو ملغى ولا يقبل السداد.":
      expired?"انتهت صلاحية عرض السعر. يرجى التواصل مع الإدارة للحصول على عرض جديد.":
      requestItem.status!=="QUOTE_SENT"?"عرض السعر لم يُرسل لك بعد، أو ما زال تحت المراجعة.":
      !eligible?"لا يوجد مبلغ معتمد صالح للسداد.":"";
    return NextResponse.json({
      success:true,
      quote:{reference:requestItem.reference,kind,title:labels[kind]||"طلب خدمة",status:requestItem.status,amountSar:amount,quoteNotes:requestItem.quoteNotes,expiresAt:expiry},
      eligible,
      reason,
      // Payment is intentionally fail-closed until server-bound orders and settlement are tested.
      methods:[{id:"BANK_TRANSFER",label:"تحويل بنكي",available:false,note:"قيد استكمال الربط الآمن بين عرض السعر والتحويل والتحقق من الإيصال."},
      {id:"CARD",label:"مدى / Visa / Mastercard",available:false,note:"بانتظار تكامل NeoLeap واختبارات بوابة الدفع."}],
    },{headers:{"Cache-Control":"private, no-store"}});
  }catch(error){
    console.error("Request quote checkout availability failed",error instanceof Error?error.name:"UNKNOWN");
    return response("تعذر التحقق من عرض السعر حالياً.",503);
  }
}
