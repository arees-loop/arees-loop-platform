import { Resend } from "resend";

export type TransportEmailData = {
  reference: string;
  kind: "FLIGHT" | "FERRY" | "VISA" | "DRIVING_LICENSE";
  customerName: string;
  customerEmail: string | null;
  countryCode: string;
  phone: string;
  whatsappCountryCode: string | null;
  whatsappPhone: string | null;
  origin: string;
  destination: string;
  travelDate: Date;
  adults: number;
  children: number;
  infants: number;
  notes: string | null;
};

const htmlSafe = (s: string) => s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");

export async function sendTransportInquiryNotification(q: TransportEmailData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL;
  const admins = (process.env.AREES_ADMIN_EMAILS || "")
    .split(/[;,]/).map(s => s.trim()).filter(s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)).slice(0,12);
  if (!apiKey || !from || admins.length === 0) throw new Error("Transport email is not fully configured");
  const type = q.kind === "FERRY" ? "البواخر" : q.kind === "VISA" ? "التأشيرات" : q.kind === "DRIVING_LICENSE" ? "رخصة القيادة الدولية" : "الطيران";
  const rows: Array<[string, string]> = [
    ["رقم الطلب",q.reference],["نوع الطلب",type],["الاسم",q.customerName],
    ["الجوال",`+${q.countryCode} ${q.phone}`],
    ["واتساب بديل",q.whatsappPhone ? `+${q.whatsappCountryCode} ${q.whatsappPhone}` : "لا يوجد"],
    ["البريد",q.customerEmail || "غير متوفر"],["من",q.origin],["إلى",q.destination],
    ["تاريخ السفر",q.travelDate.toISOString().slice(0,10)],
    ["بالغون",String(q.adults)],["أطفال",String(q.children)],["رضع",String(q.infants)],
    ["ملاحظات",q.notes || "لا يوجد"],
  ];
  const details = rows.map(([label,value])=>`<tr><th style="text-align:right;padding:9px;background:#f7f4ea">${htmlSafe(label)}</th><td style="padding:9px">${htmlSafe(value)}</td></tr>`).join("");
  const result = await new Resend(apiKey).emails.send({
    from, to:admins, subject:`طلب ${type} جديد · ${q.reference}`,
    html:`<main dir="rtl" style="font-family:Arial,sans-serif;color:#0D3B34"><h2>طلب حجز ${type} جديد</h2><p>هذا طلب استعلام فقط، وليس تذكرة مؤكدة أو عملية دفع.</p><table border="1" cellspacing="0" style="border-collapse:collapse;width:100%">${details}</table><p>افتح لوحة إدارة AREES LOOP لمراجعته والتواصل مع العميل.</p></main>`,
  });
  if (result.error) throw new Error(result.error.message);
}
