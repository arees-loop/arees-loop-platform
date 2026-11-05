import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { neoleapReadiness } from "@/lib/payments/neoleap-readiness";
import { inquireHostedPayment } from "@/lib/payments/arb-hosted-client";
import { isVerifiedPayment } from "@/lib/payments/settlement-verification";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
export async function POST(req:NextRequest) {
  const session=await getCurrentSession();
  if (!session || session.user.status!=="ACTIVE") return reply({error:"AUTH_REQUIRED"},401);
  const ready=neoleapReadiness();
  if (!ready.configured || ready.mode!=="sandbox") return reply({error:"BANK_NOT_READY"},503);
  const body=await req.json().catch(()=>null);
  const reference=typeof body?.reference==="string"?body.reference:"";
  if (!/^CART-[0-9a-f-]{36}$/.test(reference)) return reply({error:"INVALID_REFERENCE"},400);
  const attempt=await prisma.cardPaymentAttempt.findUnique({where:{orderReference:reference}});
  if (!attempt || attempt.userId!==session.user.id) return reply({error:"NOT_FOUND"},404);
  if (attempt.status==="PAID") return reply({reference,status:"PAID"});
  if (!attempt.gatewayPaymentId) return reply({reference,status:"PENDING"});
  let bank:Record<string,unknown>;
  try {
    bank=await inquireHostedPayment({
      portalId:process.env.NEOLEAP_TRANPORTAL_ID||"",
      password:process.env.NEOLEAP_TRANPORTAL_PASSWORD||"",
      resourceKey:process.env.NEOLEAP_RESOURCE_KEY||"",
      endpoint:process.env.NEOLEAP_INQUIRY_URL||"",
    },{amountMinor:attempt.amountMinor,trackId:attempt.trackId,paymentId:attempt.gatewayPaymentId});
  } catch {
    return reply({reference,status:"PENDING",message:"لم يتأكد البنك من حالة العملية بعد."},202);
  }
  const bankAmount=Number(bank.amt);
  const amountMinor=Math.round(bankAmount*100);
  const transactionId=typeof bank.transId==="string" || typeof bank.transId==="number" ? String(bank.transId) : "";
  if (!Number.isFinite(bankAmount) || !Number.isSafeInteger(amountMinor) || !/^\\d{1,40}$/.test(transactionId)) return reply({reference,status:"PENDING"},202);
  const verified=isVerifiedPayment({
    reference:attempt.trackId,amountMinor:attempt.amountMinor,currency:"SAR",
    merchantId:process.env.NEOLEAP_TRANPORTAL_ID||"",
  },{
    reference:String(bank.trackId||""),amountMinor,currency:"SAR",
    merchantId:process.env.NEOLEAP_TRANPORTAL_ID||"",
    transactionId:String(bank.transId||""),status:bank.result==="CAPTURED" && String(bank.authRespCode)==="00"?"SUCCESS":"PENDING",
    authenticated:String(bank.paymentId)===attempt.gatewayPaymentId && String(bank.actionCode)==="8",
  });
  if (!verified) return reply({reference,status:"PENDING"},202);
  const changed=await prisma.$transaction(async tx=>{
    const update=await tx.cardPaymentAttempt.updateMany({
      where:{id:attempt.id,status:{in:["REDIRECT_READY","PENDING"]}},
      data:{status:"PAID",bankTransactionId:transactionId},
    });
    if(update.count===1) await tx.auditLog.create({data:{
      userId:attempt.userId,entityType:"CART_BANK_CHECKOUT",entityId:reference,
      action:"CART_BANK_VERIFIED",afterData:{source:"NEOLEAP_INQUIRY",paymentId:attempt.gatewayPaymentId,
        transactionId,amountMinor:attempt.amountMinor,currency:"SAR"},
    }});
    return update.count;
  });
  if (changed!==1) {
    const current=await prisma.cardPaymentAttempt.findUnique({where:{id:attempt.id},select:{status:true}});
    return reply({reference,status:current?.status==="PAID"?"PAID":"PENDING"},current?.status==="PAID"?200:202);
  }
  return reply({reference,status:"PAID",newlyConfirmed:true});
}
