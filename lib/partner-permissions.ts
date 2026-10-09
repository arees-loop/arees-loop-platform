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

/** Explicit roles stored in PartnerMember.permissions.role.
 * Null/unknown roles remain LEGACY until membership ownership is verified. */
export type PartnerAccessRole = "OWNER" | "MANAGER" | "EMPLOYEE" | "LEGACY";

export function getPartnerAccessRole(permissions: unknown): PartnerAccessRole {
  if (!permissions || typeof permissions !== "object" || Array.isArray(permissions)) return "LEGACY";
  const role = (permissions as Record<string, unknown>).role;
  return role === "OWNER" || role === "MANAGER" || role === "EMPLOYEE" ? role : "LEGACY";
}

/** A role alone never confers permission to manage other members. */
export function canManagePartnerTeam(permissions: unknown): boolean {
  const role = getPartnerAccessRole(permissions);
  if (role === "OWNER") return true;
  if (role !== "MANAGER") return false;
  const team = (permissions as Record<string, unknown>).team;
  return !!team && typeof team === "object" && !Array.isArray(team) &&
    (team as Record<string, unknown>).manage === true;
}

/** Explicit capability map for newly provisioned memberships.
 * Existing LEGACY memberships must be reviewed, never silently promoted. */
export type PartnerPermissionPreset = {
  role: Exclude<PartnerAccessRole, "LEGACY">;
  services: { manage: boolean };
  finances: { view: boolean };
  bookings: { view: boolean };
  team: { view: boolean; manage: boolean };
};

export function partnerPermissionPreset(role: PartnerPermissionPreset["role"]): PartnerPermissionPreset {
  switch (role) {
    case "OWNER":
      return { role, services: { manage: true }, finances: { view: true }, bookings: { view: true }, team: { view: true, manage: true } };
    case "MANAGER":
      return { role, services: { manage: true }, finances: { view: false }, bookings: { view: true }, team: { view: true, manage: false } };
    case "EMPLOYEE":
      return { role, services: { manage: false }, finances: { view: false }, bookings: { view: false }, team: { view: false, manage: false } };
  }
}
