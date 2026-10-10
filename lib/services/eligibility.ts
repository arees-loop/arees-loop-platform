import {utcLicenseDay} from "../license-validity";
export function serviceEligibilityWhere(now=new Date()) {
 return {partner:{status:"ACTIVE" as const},license:{is:{status:"VERIFIED" as const,expiryDate:{gte:utcLicenseDay(now)}}}};
}
