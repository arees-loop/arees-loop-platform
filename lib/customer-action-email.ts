import { Resend } from "resend";

const topics:Record<string,string>={
  CUSTOMER_MESSAGE_SENT:"رد جديد من العميل",
  CUSTOMER_OFFER_ACCEPTED:"العميل وافق على عرض السعر",
  CUSTOMER_TRANSFER_SUBMITTED:"إشعار تحويل بنكي جديد للمراجعة",
};

export async function sendAdminCustomerActionEmail(input:{reference:string;kind:string;action:string}):Promise<void>{
  const key=process.env.RESEND_API_KEY;
  const from=process.env.EMAIL_FROM||process.env.RESEND_FROM_EMAIL;
  const recipients=(process.env.AREES_ADMIN_EMAILS||"")
    .split(/[;,]/).map(x=>x.trim())
    .filter(x=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x)).slice(0,12);
  if(!key||!from||!recipients.length)throw new Error("Admin mail configuration incomplete");
  const kindLabels:Record<string,string>={
    FLIGHT:"الطيران",FERRY:"البواخر",VISA:"التأشيرات",
    DRIVING_LICENSE:"الرخص الدولية",HOTEL:"الفنادق"
  };
  const topic=topics[input.action]||"تحديث من العميل";
  const service=kindLabels[input.kind]||"خدمات أريس";
  const result=await new Resend(key).emails.send({
    from,to:recipients,
    subject:`أريس لوب | ${topic} | ${input.reference}`,
    text:`${topic}\nالقسم: ${service}\nرقم الطلب: ${input.reference}\nالرجاء مراجعة الطلب من لوحة الإدارة: https://www.areesloop.com/admin/dashboard#admin-work-queue\n\nتنبيه آلي من Arees Loop. لا تؤكد استلام السداد إلا بعد التحقق البنكي الفعلي.`,
  });
  if(result.error)throw new Error(result.error.message);
}
