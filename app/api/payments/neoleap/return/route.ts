import { NextRequest, NextResponse } from "next/server";
export const runtime="nodejs";
export const dynamic="force-dynamic";
/** Browser return is NOT proof of settlement. Customer must authenticate and run server-side inquiry. */
export async function GET(req:NextRequest) {
  const origin=process.env.NEOLEAP_CALLBACK_ORIGIN;
  if (!origin || new URL(origin).origin!==origin) return new Response("Gateway callback not configured",{status:503});
  const url=new URL("/cart",origin);
  url.searchParams.set("paymentReturn","pending-verification");
  return NextResponse.redirect(url,303);
}
export async function POST(req:NextRequest) {
  return GET(req);
}
