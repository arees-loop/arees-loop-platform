export type TransportKind = "FLIGHT" | "FERRY";
export const TRANSPORT_PERMISSIONS = ["TRANSPORT_FLIGHTS", "TRANSPORT_FERRIES"] as const;

export function canManageTransport(
  user: { role: string; adminPermissions?: unknown },
  kind: TransportKind,
) {
  if (user.role === "SUPER_ADMIN") return true;
  if (user.role !== "ADMIN") return false;
  return Array.isArray(user.adminPermissions) &&
    user.adminPermissions.includes(kind === "FLIGHT" ? "TRANSPORT_FLIGHTS" : "TRANSPORT_FERRIES");
}

export function allowedTransportKinds(user: { role: string; adminPermissions?: unknown }): TransportKind[] {
  return (["FLIGHT", "FERRY"] as const).filter(kind => canManageTransport(user, kind));
}
