export type PartnerAccessRole = "OWNER" | "MANAGER" | "EMPLOYEE" | "LEGACY";

export function getPartnerAccessRole(permissions: unknown): PartnerAccessRole {
  if (!permissions || typeof permissions !== "object" || Array.isArray(permissions)) return "LEGACY";
  const role = (permissions as Record<string, unknown>).role;
  return role === "OWNER" || role === "MANAGER" || role === "EMPLOYEE" ? role : "LEGACY";
}

/** An explicit flag takes precedence; otherwise use the role preset.
 * Unclassified memberships are denied until ownership and membership are verified. */
function capability(permissions: unknown, section: "services" | "finances" | "bookings" | "team", action: "manage" | "view"): boolean {
  const role = getPartnerAccessRole(permissions);
  if (role === "OWNER") return true;
  if (role === "LEGACY") return false;
  if (permissions && typeof permissions === "object" && !Array.isArray(permissions)) {
    const entry = (permissions as Record<string, unknown>)[section];
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      const flag = (entry as Record<string, unknown>)[action];
      if (typeof flag === "boolean") return flag;
    }
  }
  if (role === "EMPLOYEE") return false;
  return section === "services" && action === "manage" ||
    section === "bookings" && action === "view" ||
    section === "team" && action === "view";
}

export const canManagePartnerServices = (permissions: unknown) => capability(permissions, "services", "manage");
export const canViewPartnerFinances = (permissions: unknown) => capability(permissions, "finances", "view");
export const canViewPartnerBookings = (permissions: unknown) => capability(permissions, "bookings", "view");
export const canViewPartnerTeam = (permissions: unknown) => capability(permissions, "team", "view");

/** Only an identified owner or an explicitly delegated manager may manage team permissions.
 * Unverified LEGACY members are denied this sensitive capability. */
export function canManagePartnerTeam(permissions: unknown): boolean {
  const role = getPartnerAccessRole(permissions);
  if (role === "OWNER") return true;
  if (role !== "MANAGER") return false;
  return capability(permissions, "team", "manage");
}

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
