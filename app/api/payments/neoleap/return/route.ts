import { NextRequest, NextResponse } from "next/server";
import { isGatewayNotification, paymentCallbackAcknowledgement, paymentReturnUrl } from "@/lib/payments/neoleap-callback";
export const runtime="nodejs";
export const dynamic="force-dynamic";
function configuredOrigin() {
  const origin=process.env.NEOLEAP_CALLBACK_ORIGIN;
  if(!origin) return null;
  try { return paymentReturnUrl(origin).origin; } catch { return null; }
}
/** Browser return is not proof of settlement. The customer must authenticate and run a server-side inquiry. */
export async function GET() {
  const origin=configuredOrigin();
  if(!origin) return new Response("Gateway callback not configured",{status:503});
  return NextResponse.redirect(paymentReturnUrl(origin),303);
}
/** Acknowledge the bank notification so its hosted flow can complete. Settlement is still verified by inquiry. */
export async function POST(req:NextRequest) {
  const origin=configuredOrigin();
  if(!origin) return NextResponse.json({error:"CALLBACK_NOT_CONFIGURED"},{status:503});
  let body:unknown=null;
  const contentType=req.headers.get("content-type")||"";
  if(contentType.includes("application/json")) {
    body=await req.json().catch(()=>null);
  } else if(contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form=await req.formData().catch(()=>null);
    if(form) body={paymentId:form.get("paymentId"),trandata:form.get("trandata")};
  } else {
    const params=req.nextUrl.searchParams;
    body={paymentId:params.get("paymentId"),trandata:params.get("trandata")};
  }
  const notification=Array.isArray(body)?body[0]:body;
  if(!isGatewayNotification(notification)) return NextResponse.json({error:"INVALID_GATEWAY_NOTIFICATION"},{status:400});
  // Do not settle or trust callback values here; /reconcile performs an authenticated bank inquiry.
  return NextResponse.json(paymentCallbackAcknowledgement(origin),{headers:{"Cache-Control":"no-store"}});
}
