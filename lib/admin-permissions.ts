export type AdminPermission = "PARTNER_REQUESTS" | "ACTIVE_PARTNERS" | "CONTENT_EXPERIENCES" | "BOOKINGS" | "PAYMENTS_SETTLEMENTS" | "REPORTS_ANALYTICS" | "PLATFORM_SETTINGS";
/** Authorization belongs at every API boundary, regardless of navigation visibility. */
export function hasAdminPermission(user: {role:string; status?:string; adminPermissions:unknown} | null | undefined, permission:AdminPermission):boolean {
 if(!user || (user.status!==undefined && user.status!=="ACTIVE"))return false;
 if(user.role==="SUPER_ADMIN")return true;
 return user.role==="ADMIN" && Array.isArray(user.adminPermissions) && user.adminPermissions.includes(permission);
}
