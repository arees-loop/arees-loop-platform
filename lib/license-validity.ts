export type LicenseValidity="VALID"|"EXPIRING"|"EXPIRED"|"UNKNOWN";
export function licenseValidity(expiryDate:Date|string|null|undefined,now=new Date()){
 if(!expiryDate)return {state:"UNKNOWN" as LicenseValidity,daysRemaining:null};
 const date=new Date(expiryDate);
 if(!Number.isFinite(date.getTime()))return {state:"UNKNOWN" as LicenseValidity,daysRemaining:null};
 const utcToday=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());
 const utcExpiry=Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate());
 const daysRemaining=Math.round((utcExpiry-utcToday)/86400000);
 const state:LicenseValidity=daysRemaining<0?"EXPIRED":daysRemaining<=10?"EXPIRING":"VALID";
 return {state,daysRemaining};
}
export function licenseValidityLabel(expiryDate:Date|string|null|undefined,now=new Date()){
 const {state,daysRemaining}=licenseValidity(expiryDate,now);
 if(state==="UNKNOWN")return "تاريخ انتهاء الترخيص غير مسجل";
 if(state==="EXPIRED")return "الترخيص منتهي منذ "+Math.abs(daysRemaining||0)+" يوم";
 if(daysRemaining===0)return "ينتهي الترخيص اليوم";
 return "الترخيص ساري — متبقي "+daysRemaining+" يوم لانتهاء الترخيص";
}
