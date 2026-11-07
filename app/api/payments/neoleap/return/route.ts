import { NextRequest, NextResponse } from "next/server";
import { paymentReturnUrl } from "@/lib/payments/neoleap-callback";
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
