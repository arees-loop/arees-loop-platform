import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { neoleapReadiness } from "@/lib/payments/neoleap-readiness";
import { createHostedPayment } from "@/lib/payments/arb-hosted-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (data:unknown,status=200) => NextResponse.json(data,{status,headers:{"Cache-Control":"private, no-store"}});
function credentials() {
  return {
    portalId:process.env.NEOLEAP_TRANPORTAL_ID || "",
    password:process.env.NEOLEAP_TRANPORTAL_PASSWORD || "",
    resourceKey:process.env.NEOLEAP_RESOURCE_KEY || "",
    endpoint:process.env.NEOLEAP_API_BASE_URL || "",
  };
}
function dataRecord(value:unknown):Record<string,unknown> {
  return value && typeof value==="object" && !Array.isArray(value) ? value as Record<string,unknown> : {};
}
export async function POST(req:NextRequest) {
  const session=await getCurrentSession();
  if (!session || session.user.status!=="ACTIVE") return json({error:"AUTH_REQUIRED"},401);
  const ready=neoleapReadiness();
  if (!ready.configured || ready.mode!=="sandbox") return json({error:"BANK_NOT_READY"},503);
  const body=await req.json().catch(()=>null);
  const reference=typeof body?.reference==="string"?body.reference:"";
  if (!/^CART-[0-9a-f-]{36}$/.test(reference)) return json({error:"INVALID_REFERENCE"},400);
  const order=await prisma.auditLog.findFirst({
    where:{entityType:"CART_BANK_CHECKOUT",entityId:reference,action:"CART_BANK_CREATED",userId:session.user.id},
    select:{afterData:true},
  });
  if (!order) return json({error:"ORDER_NOT_FOUND"},404);
  const data=dataRecord(order.afterData);
  const amount=Number(data.amountSar);
  const amountMinor=Math.round(amount*100);
  if (!Number.isSafeInteger(amountMinor) || amountMinor<=0 || Math.abs(amount*100-amountMinor)>0.00001) return json({error:"INVALID_SAVED_AMOUNT"},409);
  const manual=await prisma.auditLog.findFirst({where:{
    entityType:"CART_BANK_CHECKOUT",entityId:reference,
    action:{in:["CART_BANK_RECEIPT_SUBMITTED","CART_BANK_VERIFIED","CART_BANK_REJECTED"]},
  },select:{id:true}});
  if (manual) return json({error:"BANK_TRANSFER_ALREADY_STARTED"},409);
  const existing=await prisma.cardPaymentAttempt.findUnique({where:{orderReference:reference}});
  if (existing) return existing.status==="REDIRECT_READY" && existing.checkoutUrl
    ? json({reference,checkoutUrl:existing.checkoutUrl})
    : json({error:"PAYMENT_ALREADY_INITIATED",status:existing.status},409);
  const trackId=BigInt("0x"+randomBytes(12).toString("hex")).toString(10);
  try {
    await prisma.cardPaymentAttempt.create({data:{orderReference:reference,userId:session.user.id,amountMinor,trackId}});
  } catch { return json({error:"PAYMENT_ALREADY_INITIATED"},409); }
  try {
    const origin=process.env.NEOLEAP_CALLBACK_ORIGIN;
    if (!origin || new URL(origin).origin!==origin || !origin.startsWith("https://")) throw Error("INVALID_CALLBACK_ORIGIN");
    const callback=process.env.NEOLEAP_CALLBACK_URL;
    if (!callback) throw Error("CALLBACK_ENDPOINT_NOT_CONFIGURED");
    const callbackUrl=new URL(callback);
    if (callbackUrl.protocol!=="https:" || callbackUrl.username || callbackUrl.password || callbackUrl.search || callbackUrl.hash || callbackUrl.pathname!=="/api/payments/neoleap/return" || callbackUrl.origin===origin || !/^arees-neoleap-callback-[a-z0-9-]+-arees-loop\.vercel\.app$/.test(callbackUrl.hostname)) throw Error("INVALID_CALLBACK_ENDPOINT");
    const token=await createHostedPayment(credentials(),{amountMinor,trackId,responseURL:callback,errorURL:callback});
    await prisma.cardPaymentAttempt.update({where:{orderReference:reference},data:{
      gatewayPaymentId:token.paymentId,checkoutUrl:token.checkoutUrl,status:"REDIRECT_READY",
    }});
    return json({reference,checkoutUrl:token.checkoutUrl},201);
  } catch {
    // Do not assume a failed network call means the bank did not create a session.
    await prisma.cardPaymentAttempt.updateMany({where:{orderReference:reference,status:"INITIATING"},data:{status:"PENDING"}});
    return json({error:"BANK_SESSION_UNCONFIRMED",message:"تعذر تأكيد جلسة الدفع؛ يرجى التواصل مع الدعم قبل إعادة المحاولة."},503);
  }
}

