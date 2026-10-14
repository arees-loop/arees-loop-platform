import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { getActivePartnerMembership, canManagePartnerTeam, normalizePartnerPermissions } from "@/lib/partner-permissions";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ success:false, message:"يجب تسجيل الدخول أولاً." }, { status:401 });
  const membership = await getActivePartnerMembership(session.user.id);
  if (!membership) return NextResponse.json({ success:false, message:"لا توجد منشأة مرتبطة بالحساب." }, { status:404 });
  const isManager = canManagePartnerTeam(membership.user.role);
  const permissions = isManager ? {
    dashboard:true, bookings:true, services:true, coupons:true, loyalty:true,
    settlements:true, invoices:true, reports:true, business:true,
  } : normalizePartnerPermissions(membership.permissions);
  return NextResponse.json({ success:true, isManager, permissions });
}
