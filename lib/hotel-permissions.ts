export function canManageHotel(user:{role:string;adminPermissions?:unknown}){
  if(user.role==="SUPER_ADMIN")return true;
  return user.role==="ADMIN"&&Array.isArray(user.adminPermissions)&&user.adminPermissions.includes("HOTEL_REQUESTS");
}
