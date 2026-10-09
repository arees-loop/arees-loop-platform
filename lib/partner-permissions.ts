/** PartnerMember.permissions: { services: { manage: false } } denies writes.
 * Legacy null permissions remain allowed until owner roles are migrated. */
export function canManagePartnerServices(permissions: unknown): boolean {
  if (!permissions || typeof permissions !== "object" || Array.isArray(permissions)) return true;
  const record = permissions as Record<string, unknown>;
  const services = record.services;
  if (!services || typeof services !== "object" || Array.isArray(services)) return true;
  return (services as Record<string, unknown>).manage !== false;
}

/** Explicit opt-out for financial data; legacy memberships retain access pending migration. */
export function canViewPartnerFinances(permissions: unknown): boolean {
  if (!permissions || typeof permissions !== "object" || Array.isArray(permissions)) return true;
  const finances = (permissions as Record<string, unknown>).finances;
  if (!finances || typeof finances !== "object" || Array.isArray(finances)) return true;
  return (finances as Record<string, unknown>).view !== false;
}

/** Explicit member-level restrictions for booking and team visibility. */
export function canViewPartnerBookings(permissions: unknown): boolean {
  if (!permissions || typeof permissions !== "object" || Array.isArray(permissions)) return true;
  const bookings = (permissions as Record<string, unknown>).bookings;
  if (!bookings || typeof bookings !== "object" || Array.isArray(bookings)) return true;
  return (bookings as Record<string, unknown>).view !== false;
}

export function canViewPartnerTeam(permissions: unknown): boolean {
  if (!permissions || typeof permissions !== "object" || Array.isArray(permissions)) return true;
  const team = (permissions as Record<string, unknown>).team;
  if (!team || typeof team !== "object" || Array.isArray(team)) return true;
  return (team as Record<string, unknown>).view !== false;
}
