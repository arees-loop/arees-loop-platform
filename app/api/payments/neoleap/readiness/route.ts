import { NextResponse } from "next/server";
import { neoleapReadiness } from "@/lib/payments/neoleap-readiness";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Safe capability endpoint: does not expose environment variable names,
 * credentials, merchant identifiers or gateway addresses to anonymous users.
 */
export async function GET() {
  const state = neoleapReadiness();
  return NextResponse.json(
    { provider: state.provider, available: state.configured && state.mode === "sandbox" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
