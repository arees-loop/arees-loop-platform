import { Resend } from "resend";
type HotelEmail={
  reference:string;customerName:string;customerEmail:string|null;countryCode:string;phone:string;
  destination:string;hotelName:string|null;checkInDate:string;checkOutDate:string;
  rooms:number;adults:number;children:number;notes:string|null;
};
const escapeHtml=(s:string)=>s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
export async function sendHotelInquiryNotification(q:HotelEmail){
  const key=process.env.RESEND_API_KEY;
  const from=process.env.EMAIL_FROM||process.env.RESEND_FROM_EMAIL;
  const admins=(process.env.AREES_ADMIN_EMAILS||"").split(/[;,]/)
    .map(s=>s.trim()).filter(v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)).slice(0,12);
  if(!key||!from||!admins.length)throw new Error("Hotel email notification is not configured");
  const details=[
    ["رقم الطلب",q.reference],["الاسم",q.customerName],["التواصل",`+${q.countryCode} ${q.phone}`],
    ["الإيميل",q.customerEmail||"غير متوفر"],["الوجهة",q.destination],["الفندق",q.hotelName||"حسب اختيار العميل"],
    ["الدخول",q.checkInDate],["الخروج",q.checkOutDate],["الغرف",String(q.rooms)],
    ["البالغون",String(q.adults)],["الأطفال",String(q.children)],["الملاحظات",q.notes||"لا توجد"],
  ];
  const table=details.map(([k,v])=>`<tr><th style="padding:8px;text-align:right;background:#faf6ed">${escapeHtml(k)}</th><td style="padding:8px">${escapeHtml(v)}</td></tr>`).join("");
  const result=await new Resend(key).emails.send({
    from,to:admins,subject:`طلب فندق جديد — ${q.reference}`,
    html:`<main dir="rtl" style="font-family:Arial,sans-serif;color:#0D3B34"><h2>طلب حجز فندق جديد</h2><p>تم حفظ طلب استعلام جديد في AREES LOOP؛ لا يوجد دفع أو حجز مؤكد.</p><table border="1" cellspacing="0" style="border-collapse:collapse;width:100%">${table}</table><p>افتح لوحة إدارة الفنادق لمتابعة الطلب وإسناده للموظف.</p></main>`,
  });
  if(result.error)throw new Error(result.error.message);
}
