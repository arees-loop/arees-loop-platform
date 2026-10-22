import {prisma} from "@/lib/prisma";

const BANK_TYPE="CART_BANK_CHECKOUT";
const WORKFLOW_TYPE="PARTNER_CART_WORKFLOW";
export const partnerCartReferencePattern=/^CART-[0-9a-f-]{36}$/;

export type PartnerCartRow={
 id:string;source:"CART";reference:string;customerName:string;customerEmail:string|null;customerPhone:string|null;
 guests:number;totalAmount:number;status:string;createdAt:string;serviceDate:null;
 service:{nameAr:string};partner:{legalNameAr:string;tradeNameAr:string|null};
 items:{title:string;serviceId:string;partnerId:string|null;partnerName:string;quantity:number;unitPriceSar:number}[];
 bankReference:string;bankStatus:string;bankVerified:boolean;hasReceipt:boolean;hasVoucher:boolean;
 notes:string;mixedWithLicense:boolean;
};

export function safeObject(value:unknown):Record<string,unknown>{
 return value!==null&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:{};
}

export function partnerCartStatus(paymentStatus:string,customStatus:string){
 const verified=paymentStatus==="CART_BANK_VERIFIED";
 if(verified&&customStatus==="COMPLETED")return "COMPLETED";
 if(verified&&customStatus==="IN_PROGRESS")return "IN_PROGRESS";
 if(verified)return "PAID";
 if(paymentStatus==="CART_BANK_RECEIPT_SUBMITTED")return "RECEIPT_REVIEW";
 if(paymentStatus==="CART_BANK_REJECTED")return "RECEIPT_REJECTED";
 return "PENDING";
}

/**
 * Read-only adapter; existing checkout records remain in AuditLog.
 * Partner services are displayed without copying or mutating Booking records.
 * Full mixed-cart payment remains one financial record, with a warning in the UI.
 */
export async function getPartnerCartRows():Promise<PartnerCartRow[]>{
 const created=await prisma.auditLog.findMany({
  where:{entityType:BANK_TYPE,action:"CART_BANK_CREATED"},
  orderBy:[{createdAt:"desc"},{id:"desc"}],take:300,
  select:{entityId:true,userId:true,afterData:true,createdAt:true}
 });
 const raw=created.flatMap(order=>{
  if(!order.entityId||!partnerCartReferencePattern.test(order.entityId))return [];
  const details=safeObject(order.afterData),entries=Array.isArray(details.rows)?details.rows.map(safeObject):[];
  const services=entries.filter(x=>x.itemType==="SERVICE");
  if(!services.length)return []; // License-only purchases belong to AREES services, not partner bookings.
  return [{order,details,services,mixedWithLicense:entries.some(x=>x.itemType==="DRIVING_LICENSE")}];
 });
 if(!raw.length)return [];

 const refs=raw.map(x=>x.order.entityId!).filter(Boolean);
 const userIds=[...new Set(raw.map(x=>x.order.userId).filter((id):id is string=>!!id))];
 const partnerIds=[...new Set(raw.flatMap(x=>x.services.map(s=>String(s.partnerId||"")).filter(Boolean)))];
 const [events,workflow,users,partners,vouchers]=await Promise.all([
  prisma.auditLog.findMany({where:{entityType:BANK_TYPE,entityId:{in:refs},
   action:{in:["CART_BANK_RECEIPT_SUBMITTED","CART_BANK_VERIFIED","CART_BANK_REJECTED"]}},
   orderBy:[{createdAt:"desc"},{id:"desc"}],select:{entityId:true,action:true}}),
  prisma.auditLog.findMany({where:{entityType:WORKFLOW_TYPE,entityId:{in:refs},
   action:{in:["STATUS_CHANGED","NOTES_UPDATED","CUSTOMER_UPDATED"]}},
   orderBy:[{createdAt:"desc"},{id:"desc"}],select:{entityId:true,action:true,afterData:true}}),
  prisma.user.findMany({where:{id:{in:userIds}},select:{id:true,firstName:true,lastName:true,email:true,phone:true}}),
  prisma.partner.findMany({where:{id:{in:partnerIds}},select:{id:true,legalNameAr:true,tradeNameAr:true}}),
  prisma.auditLog.findMany({where:{entityType:BANK_TYPE,entityId:{in:refs},action:"CART_SERVICE_VOUCHER_UPLOADED"},
   select:{entityId:true}})
 ]);
 const lastBank=new Map<string,string>();
 for(const e of events)if(e.entityId&&!lastBank.has(e.entityId))lastBank.set(e.entityId,e.action);
 const lastWorkflow=new Map<string,Record<string,unknown>>();
 const lastNotes=new Map<string,string>();
 const lastCustomer=new Map<string,Record<string,unknown>>();
 for(const e of workflow){
  if(!e.entityId)continue;
  if(e.action==="STATUS_CHANGED"&&!lastWorkflow.has(e.entityId))lastWorkflow.set(e.entityId,safeObject(e.afterData));
  if(e.action==="NOTES_UPDATED"&&!lastNotes.has(e.entityId))lastNotes.set(e.entityId,String(safeObject(e.afterData).notes||""));
  if(e.action==="CUSTOMER_UPDATED"&&!lastCustomer.has(e.entityId))lastCustomer.set(e.entityId,safeObject(e.afterData));
 }
 const voucherRefs=new Set(vouchers.map(x=>x.entityId));
 return raw.map(({order,details,services,mixedWithLicense})=>{
  const reference=order.entityId!;
  const user=users.find(u=>u.id===order.userId), customer=lastCustomer.get(reference);
  const items=services.map(s=>{
   const partner=partners.find(p=>p.id===s.partnerId);
   return {title:String(s.title||"تجربة شريك").slice(0,160),
    serviceId:String(s.serviceId||""),partnerId:typeof s.partnerId==="string"?s.partnerId:null,
    partnerName:partner?.tradeNameAr||partner?.legalNameAr||"شريك",quantity:Number(s.quantity||1),
    unitPriceSar:Number(s.unitPriceSar||0)};
  });
  const names=[...new Set(items.map(x=>x.partnerName))];
  const paymentStatus=lastBank.get(reference)||"CART_BANK_CREATED";
  const status=partnerCartStatus(paymentStatus,String(lastWorkflow.get(reference)?.status||""));
  return {id:"cart:"+reference,source:"CART" as const,reference,
   customerName:String(customer?.name||[user?.firstName,user?.lastName].filter(Boolean).join(" ")||user?.email||"عميل"),
   customerEmail:user?.email||null,customerPhone:String(customer?.phone||user?.phone||"")||null,
   guests:items.reduce((n,item)=>n+item.quantity,0),totalAmount:Number(details.amountSar||0),
   status,createdAt:order.createdAt.toISOString(),serviceDate:null,
   service:{nameAr:items.map(x=>x.title).join("، ")},
   partner:{legalNameAr:names.join("، "),tradeNameAr:names.join("، ")},
   items,bankReference:reference,bankStatus:paymentStatus,bankVerified:paymentStatus==="CART_BANK_VERIFIED",
   hasReceipt:paymentStatus==="CART_BANK_RECEIPT_SUBMITTED",hasVoucher:voucherRefs.has(reference),
   notes:lastNotes.get(reference)||"",mixedWithLicense};
 });
}
