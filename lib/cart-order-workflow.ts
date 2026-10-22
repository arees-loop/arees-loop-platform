import { Resend } from "resend";

export const CART_ENTITY = "CART_BANK_CHECKOUT";
export const CART_CREATED = "CART_BANK_CREATED";
export const CART_SUBMITTED = "CART_BANK_RECEIPT_SUBMITTED";
export const CART_VERIFIED = "CART_BANK_VERIFIED";
export const CART_REJECTED = "CART_BANK_REJECTED";
export const CART_STATUS = "CART_WORKFLOW_STATUS_UPDATED";
export const CART_MESSAGE = "CART_WORKFLOW_MESSAGE";
export const CART_DOCUMENT = "CART_WORKFLOW_DOCUMENT";
export const CART_VIEWED = "CART_CUSTOMER_VIEWED";
export const CART_VIEWED = "CART_CUSTOMER_VIEWED";
export const CART_STATUSES = ["PROCESSING","DOCUMENTS_REQUESTED","COMPLETED"] as const;
export type CartWorkflowStatus = typeof CART_STATUSES[number];
export type CartEvent = {id:string;action:string;createdAt:Date;afterData:unknown;userId:string|null};
export const asRecord = (v:unknown):Record<string,unknown> =>
  v && typeof v==="object" && !Array.isArray(v) ? v as Record<string,unknown> : {};
export function cartPaymentStatus(events:CartEvent[]):string {
 const last = events.find(e=>[CART_VERIFIED,CART_REJECTED,CART_SUBMITTED].includes(e.action));
 return last?.action || CART_CREATED;
}
export function cartStatus(events:CartEvent[]):string {
 const payment = cartPaymentStatus(events);
 if(payment!==CART_VERIFIED)return payment;
 const step = events.find(e=>e.action===CART_STATUS);
 const state=asRecord(step?.afterData).status;
 if(state==="DOCUMENTS_REQUESTED"){
   // A submitted customer document satisfies the immediate upload request while
   // the admin still has to explicitly confirm completion/processing.
   const response=events.find(e=>e.action===CART_DOCUMENT&&asRecord(e.afterData).from==="CUSTOMER");
   if(response&&step&&response.createdAt>step.createdAt)return "DOCUMENTS_SUBMITTED";
 }
 return typeof state==="string" && CART_STATUSES.some(x=>x===state) ? state : "PAID";
}
export function cartStatusLabel(status:string):string {
 return ({
  CART_BANK_CREATED:"طلب جديد — بانتظار التحويل",
  CART_BANK_RECEIPT_SUBMITTED:"إيصال مرفوع — يرجى مراجعة السداد",
  CART_BANK_VERIFIED:"تم تأكيد السداد — تحت الإجراء",
  CART_BANK_REJECTED:"الإيصال مرفوض — ينتظر إعادة الرفع",
  PAID:"تم السداد — تحت الإجراء",
  PROCESSING:"تحت التنفيذ",
  DOCUMENTS_REQUESTED:"مطلوب مستندات إضافية",
  DOCUMENTS_SUBMITTED:"تم رفع المستندات — تنتظر مراجعة الإدارة",
  COMPLETED:"تم التنفيذ"
 } as Record<string,string>)[status]||"طلب جديد";
}
export function cartStaff(user:{role:string;adminPermissions:unknown}):boolean {
 return user.role==="SUPER_ADMIN"||(user.role==="ADMIN"&&Array.isArray(user.adminPermissions)&&user.adminPermissions.includes("BOOKINGS"));
}
const safe=(s:string)=>s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
export async function sendCartAdminMail(input:{reference:string;name:string;amountSar:number;title:string;type:"RECEIPT"|"MESSAGE"}) {
 const key=process.env.RESEND_API_KEY,from=process.env.EMAIL_FROM||process.env.RESEND_FROM_EMAIL;
 const to=(process.env.AREES_ADMIN_EMAILS||"").split(/[;,]/).map(s=>s.trim()).filter(s=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)).slice(0,12);
 if(!key||!from||!to.length)throw Error("Cart administration email is not fully configured");
 const receipt=input.type==="RECEIPT";
 const subject=(receipt?"طلب جديد — إثبات سداد بانتظار المراجعة":"رد جديد من عميل على طلب السلة")+" | "+input.reference;
 const link="https://www.areesloop.com/admin/cart-bank-payments/"+encodeURIComponent(input.reference);
 const html='<main dir="rtl" style="font-family:Arial,sans-serif;color:#0D3B34;line-height:1.9">'+
  '<h2>'+(receipt?"تم رفع إثبات تحويل بنكي — يرجى مراجعة وتأكيد السداد":"وصلت رسالة جديدة من عميل في طلب السلة")+'</h2>'+
  '<p><b>رقم الطلب:</b> '+safe(input.reference)+'</p>'+
  '<p><b>العميل:</b> '+safe(input.name)+'</p>'+
  '<p><b>الخدمة:</b> '+safe(input.title)+'</p>'+
  '<p><b>المبلغ المسجل:</b> '+safe(input.amountSar.toFixed(2))+' ريال</p>'+
  '<p><b>الحالة:</b> '+(receipt?"إيصال وارد — لا يعني تأكيد وصول المال":"رسالة تحتاج المتابعة")+'</p>'+
  '<p><a href="'+safe(link)+'">فتح الطلب في لوحة الإدارة</a></p>'+
  '<p>لا يتم اعتماد السداد إلا بعد مطابقة الحوالة مع الحساب البنكي فعلياً.</p></main>';
 const result=await new Resend(key).emails.send({from,to,subject,html});
 if(result.error)throw Error(result.error.message);
}
