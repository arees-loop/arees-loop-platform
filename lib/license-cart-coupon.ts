import {prisma} from "@/lib/prisma";

export const LICENSE_SERVICE_ID="international-driving-license-1";
export const LICENSE_COUPON_CATEGORY="DRIVING_LICENSE";

export class LicenseCouponError extends Error {
 constructor(message:string){super(message);this.name="LicenseCouponError";}
}
const round=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;

export async function currentLicensePrice():Promise<number>{
 const now=new Date();
 const offer=await prisma.transportOffer.findFirst({
  where:{kind:"DRIVING_LICENSE",isVisible:true,deletedAt:null,
   AND:[{OR:[{startsAt:null},{startsAt:{lte:now}}]},{OR:[{endsAt:null},{endsAt:{gte:now}}]}]},
  orderBy:[{sortOrder:"asc"},{createdAt:"desc"}],select:{amountSar:true,operationStatus:true}
 });
 if(offer?.operationStatus==="SOLD_OUT")throw new LicenseCouponError("عرض الرخصة غير متاح حالياً.");
 const amount=offer?.amountSar===null||!offer?199:Number(offer.amountSar);
 if(!Number.isFinite(amount)||amount<=0)throw new LicenseCouponError("سعر الرخصة الحالي غير متاح.");
 return round(amount);
}

export async function validateLicenseCoupon(codeRaw:string,subtotal:number,userId?:string){
 const code=codeRaw.trim().toUpperCase();
 if(!code||code.length>100)throw new LicenseCouponError("أدخل كوبوناً صالحاً.");
 const coupon=await prisma.coupon.findUnique({where:{code}});
 if(!coupon)throw new LicenseCouponError("الكوبون غير موجود.");
 // Partner-owned coupons are intentionally excluded. Null serviceId coupons can
 // apply globally, or only to the driving-license category.
 if(coupon.serviceId!==null||(coupon.category!==null&&coupon.category!==LICENSE_COUPON_CATEGORY))
  throw new LicenseCouponError("هذا الكوبون غير مخصص للرخصة الدولية.");
 const now=new Date();
 if(!coupon.isActive||(coupon.startsAt&&coupon.startsAt>now)||(coupon.expiresAt&&coupon.expiresAt<now))
  throw new LicenseCouponError("الكوبون غير فعال أو منتهي الصلاحية.");
 if(coupon.maxUses!==null&&coupon.usedCount>=coupon.maxUses)
  throw new LicenseCouponError("تم استنفاد استخدامات الكوبون.");
 if(coupon.minOrderAmount!==null&&subtotal<Number(coupon.minOrderAmount))
  throw new LicenseCouponError("السعر لا يستوفي الحد الأدنى للكوبون.");
 if(coupon.maxUsesPerUser!==null){
  if(!userId)throw new LicenseCouponError("يجب تسجيل الدخول لاستخدام هذا الكوبون.");
  const [bookings,cartOrders]=await Promise.all([
   prisma.couponRedemption.count({where:{couponId:coupon.id,userId}}),
   prisma.auditLog.count({where:{userId,entityType:"CART_LICENSE_COUPON_USAGE",action:"REDEEMED",
    afterData:{path:["couponId"],equals:coupon.id}}})
  ]);
  if(bookings+cartOrders>=coupon.maxUsesPerUser)
   throw new LicenseCouponError("استنفدت عدد استخدامات الكوبون لحسابك.");
 }
 const base=coupon.discountType==="PERCENTAGE"?subtotal*Number(coupon.discountValue)/100:Number(coupon.discountValue);
 if(!Number.isFinite(base)||base<=0)throw new LicenseCouponError("قيمة الكوبون غير صالحة.");
 const limit=coupon.maxDiscountAmount===null?subtotal:Number(coupon.maxDiscountAmount);
 const discount=round(Math.min(subtotal,Math.max(0,base),Math.max(0,limit)));
 return {couponId:coupon.id,code:coupon.code,discount,subtotal,total:round(subtotal-discount),
  discountType:coupon.discountType,discountValue:Number(coupon.discountValue)};
}
