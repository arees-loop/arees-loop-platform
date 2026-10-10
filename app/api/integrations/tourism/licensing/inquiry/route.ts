import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";

/**
 * Ministry of Tourism integration is intentionally disabled until the
 * ministry grants access and the verification response contract is reviewed.
 * No license is verified or updated by this endpoint.
 */
export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "يجب تسجيل الدخول أولاً." }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ success: false, message: "بيانات الاستعلام غير صحيحة." }, { status: 400 });
  }

  return NextResponse.json(
    {
      success: false,
      code: "MINISTRY_INTEGRATION_PENDING",
      verified: false,
      message: "التحقق المباشر من وزارة السياحة غير متاح حالياً. يرجى رفع مستند الترخيص لاستكمال المراجعة الإدارية.",
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
