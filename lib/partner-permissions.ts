import { prisma } from "@/lib/prisma";

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
  return prisma.partnerMember.findFirst({
    where: { userId, isActive: true },
    include: { user: { select: { id: true, role: true, email: true } }, partner: true },
    orderBy: { createdAt: "desc" },
  });
}
