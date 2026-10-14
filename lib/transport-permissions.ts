export type TransportKind = "FLIGHT" | "FERRY" | "VISA" | "DRIVING_LICENSE";
export const TRANSPORT_PERMISSIONS = ["TRANSPORT_FLIGHTS", "TRANSPORT_FERRIES", "TRANSPORT_VISAS", "TRANSPORT_DRIVING_LICENSE"] as const;

const permissionByKind: Record<TransportKind, string> = {
  FLIGHT: "TRANSPORT_FLIGHTS",
  FERRY: "TRANSPORT_FERRIES",
  VISA: "TRANSPORT_VISAS",
  DRIVING_LICENSE: "TRANSPORT_DRIVING_LICENSE",
};

export function canManageTransport(user: { role: string; adminPermissions?: unknown }, kind: TransportKind) {
  if (user.role === "SUPER_ADMIN") return true;
  if (user.role !== "ADMIN") return false;
  return Array.isArray(user.adminPermissions) && user.adminPermissions.includes(permissionByKind[kind]);
}

export function allowedTransportKinds(user: { role: string; adminPermissions?: unknown }): TransportKind[] {
  return (["FLIGHT", "FERRY", "VISA", "DRIVING_LICENSE"] as const).filter(kind => canManageTransport(user, kind));
}
