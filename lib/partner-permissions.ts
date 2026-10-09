/** PartnerMember.permissions: { services: { manage: false } } denies writes.
 * Legacy null permissions remain allowed until owner roles are migrated. */
export function canManagePartnerServices(permissions: unknown): boolean {
  if (!permissions || typeof permissions !== "object" || Array.isArray(permissions)) return true;
  const record = permissions as Record<string, unknown>;
  const services = record.services;
  if (!services || typeof services !== "object" || Array.isArray(services)) return true;
  return (services as Record<string, unknown>).manage !== false;
}
