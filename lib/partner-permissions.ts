import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const ACTIVE_PARTNER_COOKIE = "arees_active_partner";

export const PARTNER_PERMISSION_KEYS = [
  "dashboard",
  "bookings",
  "services",
  "coupons",
  "loyalty",
  "settlements",
  "invoices",
  "reports",
  "business",
] as const;

export type PartnerPermission = (typeof PARTNER_PERMISSION_KEYS)[number];
export type PartnerPermissionSet = Record<PartnerPermission, boolean>;

export const EMPTY_PARTNER_PERMISSIONS: PartnerPermissionSet = {
  dashboard: false,
  bookings: false,
  services: false,
  coupons: false,
  loyalty: false,
  settlements: false,
  invoices: false,
  reports: false,
  business: false,
};

export function canManagePartnerTeam(role: string | undefined) {
  return role === "PARTNER_OWNER" || role === "PARTNER_ADMIN";
}

export function hasPartnerPermission(
  role: string | undefined,
  permissions: unknown,
  permission: PartnerPermission,
) {
  if (canManagePartnerTeam(role)) return true;
  if (!permissions || typeof permissions !== "object" || Array.isArray(permissions)) return false;
  return (permissions as Record<string, unknown>)[permission] === true;
}

export function normalizePartnerPermissions(value: unknown): PartnerPermissionSet {
  const result = { ...EMPTY_PARTNER_PERMISSIONS };
  if (!value || typeof value !== "object" || Array.isArray(value)) return result;
  for (const key of PARTNER_PERMISSION_KEYS) {
    result[key] = (value as Record<string, unknown>)[key] === true;
  }
  return result;
}

export async function getActivePartnerMembership(userId: string) {
  const active = await prisma.partnerMember.findMany({
    where: { userId, isActive: true },
    select: { partnerId: true },
    orderBy: { createdAt: "desc" },
  });
  if (!active.length) return null;
  const selectedId = (await cookies()).get(ACTIVE_PARTNER_COOKIE)?.value;
  if (selectedId) {
    const selected = await prisma.partnerMember.findFirst({
      where: { userId, isActive: true, partnerId: selectedId },
      include: { user: { select: { id: true, role: true, email: true } }, partner: true },
    });
    if (selected) return selected;
  }
  // Keep the current one-partner experience. Multiple memberships require an explicit choice.
  if (active.length > 1) return null;
  return prisma.partnerMember.findFirst({
    where: { userId, isActive: true, partnerId: active[0].partnerId },
    include: { user: { select: { id: true, role: true, email: true } }, partner: true },
  });
}

export async function userHasPartnerPermission(userId: string, permission: PartnerPermission) {
  const membership = await getActivePartnerMembership(userId);
  return !!membership && hasPartnerPermission(membership.user.role, membership.permissions, permission);
}
