"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ContractPayload = {
  partner: {
    legalNameAr: string;
    legalNameEn?: string | null;
    tradeNameAr?: string | null;
    tradeNameEn?: string | null;
    unifiedNumber?: string | null;
    commercialRegister?: string | null;
    mainContactName?: string | null;
    status: string;
  };
  agreement: {
    id: string;
    version: string;
    commissionRate: string | null;
    acceptedAt: string | null;
    acceptedByName?: string | null;
    acceptedByEmail?: string | null;
    status: string;
  };
};

const clauses = [
  ["1. نطاق العلاقة | Scope of Relationship", "تعمل أريس لوب كمنصة للتسويق والعرض والحجز للخدمات التي يقدمها وينفذها الشريك ضمن نطاق تراخيصه المعتمدة. الشريك هو الجهة المنظمة أو المنفذة الفعلية للخدمة ويتحمل مسؤولية تنفيذها والتصاريح اللازمة.", "Arees Loop acts as a marketing, listing and booking platform for services provided and performed by the Partner within its approved licensed scope. The Partner remains the actual organizer/service provider and is responsible for delivery and required permits."],
  ["2. الشروط التجارية | Commercial Terms", "يطبق المقابل التجاري المتفق عليه مع الشريك وفق النسخة المعتمدة من العقد، وتظهر رسوم الدفع والتحويل والتسويات بصورة مستقلة وفق ما تم الاتفاق عليه.", "The agreed commercial consideration applies according to the approved contract version. Payment processing, transfer and settlement charges are treated separately as agreed."],
  ["3. الخدمات والحجوزات | Services & Bookings", "لا يجوز للشريك نشر أو تنفيذ خدمة خارج نطاق نشاطه أو ترخيصه المعتمد، وتخضع الخدمات الجديدة لمراجعة أريس قبل النشر.", "The Partner may not publish or perform services outside its approved activity or licence scope. New services are subject to Arees review before publication."],
  ["4. الإلغاء والاسترداد | Cancellation & Refunds", "تطبق سياسة الإلغاء والاسترداد المعتمدة لكل خدمة، وإذا تعذر على الشريك التنفيذ تتم معالجة حقوق العميل والتسويات المرتبطة وفق العقد والسياسة المعتمدة.", "The approved cancellation and refund policy for each service applies. If the Partner cannot deliver the service, customer entitlements and related settlement adjustments are processed under the contract and applicable policy."],
  ["5. التراخيص والالتزام | Licensing & Compliance", "يلتزم الشريك بالمحافظة على صلاحية التراخيص والتصاريح اللازمة وإبلاغ أريس بأي تغيير جوهري في بيانات المنشأة أو التراخيص.", "The Partner shall maintain all required licences and permits and notify Arees of material changes to its business or licensing information."],
  ["6. القبول الإلكتروني | Electronic Acceptance", "يقر المفوض بأنه مخول بقبول العقد نيابة عن الشريك. يسجل النظام نسخة العقد وهوية الحساب وتاريخ ووقت القبول وبيانات التدقيق المرتبطة به.", "The authorised representative confirms authority to accept this contract for the Partner. The system records the contract version, account identity, acceptance date/time and associated audit evidence."]
];

export default function PartnerContractPage() {
  const [data,setData]=useState<ContractPayload|null>(null);
  const [error,setError]=useState("");
  useEffect(()=>{fetch("/api/partner/agreement",{cache:"no-store"}).then(r=>r.json().then(j=>({ok:r.ok,j}))).then(({ok,j})=>{
    if(!ok) throw new Error(j.message||"تعذر تحميل العقد.");
    if(!j.agreement || j.agreement.status!=="ACCEPTED") throw new Error("العقد النهائي غير متاح حتى يتم قبوله إلكترونياً.");
    setData(j);
  }).catch(e=>setError(e instanceof Error?e.message:"تعذر تحميل العقد."));},[]);

  if(error) return <main dir="rtl" className="min-h-screen bg-[#EAF3EF] p-8"><div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center"><h1 className="text-xl font-bold text-[#0D3B34]">تعذر عرض العقد</h1><p className="mt-3 text-sm text-[#6B7F79]">{error}</p><Link href="/partner/dashboard" className="mt-6 inline-flex rounded-xl bg-[#0D3B34] px-5 py-3 text-sm font-bold text-white">العودة للوحة الشريك</Link></div></main>;
  if(!data) return <main dir="rtl" className="flex min-h-screen items-center justify-center bg-[#EAF3EF] text-[#0D3B34]">جاري تجهيز العقد...</main>;

  const {partner,agreement}=data;
  const acceptedAt=agreement.acceptedAt?new Intl.DateTimeFormat("ar-SA",{dateStyle:"long",timeStyle:"short"}).format(new Date(agreement.acceptedAt)):"—";
  return <main className="min-h-screen bg-[#EAF3EF] px-4 py-8 text-[#17201d] print:bg-white print:p-0">
    <div className="mx-auto mb-4 flex max-w-5xl justify-between gap-3 print:hidden" dir="rtl">
      <Link href="/partner/dashboard" className="rounded-xl border border-[#0D3B34]/15 bg-white px-4 py-2.5 text-sm font-bold text-[#0D3B34]">العودة للوحة الشريك</Link>
      <button onClick={()=>window.print()} className="rounded-xl bg-[#0D3B34] px-5 py-2.5 text-sm font-bold text-white">تحميل / حفظ PDF</button>
    </div>
    <article className="mx-auto max-w-5xl bg-white p-8 shadow-sm print:max-w-none print:p-0 print:shadow-none md:p-12">
      <header className="border-b-2 border-[#B99124] pb-7 text-center">
        <p className="text-xs font-bold tracking-[.22em] text-[#B99124]">AREES LOOP</p>
        <h1 className="mt-3 text-3xl font-bold text-[#0D3B34]">عقد شراكة وتسويق إلكتروني</h1>
        <p className="mt-2 text-lg font-semibold">Electronic Partnership & Marketing Contract</p>
        <p className="mt-3 text-xs text-gray-500">Contract ID: <span dir="ltr">{agreement.id}</span> · Version {agreement.version}</p>
      </header>

      <section className="mt-7 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border p-5" dir="rtl"><h2 className="font-bold text-[#0D3B34]">الطرف الأول | First Party</h2><p className="mt-3 font-bold">شركة أريس الحلول المتكاملة المحدودة</p><p className="text-sm">AREES AL-HELLOUL AL-MUTAKAMLA CO.LTD</p><p className="mt-2 text-sm text-gray-600">السجل التجاري: 4650264140</p><p className="text-sm text-gray-600">الرقم الضريبي: 311897578200003</p><p className="text-sm text-gray-600">ترخيص السياحة: 73104550</p><p className="text-sm text-gray-600">المدينة المنورة، المملكة العربية السعودية</p></div>
        <div className="rounded-2xl border p-5" dir="rtl"><h2 className="font-bold text-[#0D3B34]">الطرف الثاني | Second Party</h2><p className="mt-3 font-bold">{partner.tradeNameAr||partner.legalNameAr}</p>{partner.tradeNameAr&&<p className="text-sm">{partner.legalNameAr}</p>}<p className="mt-2 text-sm text-gray-600">السجل التجاري: {partner.commercialRegister||"—"}</p><p className="text-sm text-gray-600">الرقم الموحد: {partner.unifiedNumber||"—"}</p><p className="text-sm text-gray-600">المفوض: {agreement.acceptedByName||partner.mainContactName||"—"}</p></div>
      </section>

      <section className="mt-7 space-y-5">{clauses.map(([title,ar,en])=><div key={title} className="break-inside-avoid border-b pb-5"><h2 className="font-bold text-[#0D3B34]">{title}</h2><p dir="rtl" className="mt-2 text-sm leading-7">{ar}</p><p dir="ltr" className="mt-2 text-sm leading-7 text-gray-600">{en}</p></div>)}</section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border p-5" dir="rtl"><h2 className="font-bold text-[#0D3B34]">اعتماد أريس | Arees Approval</h2><p className="mt-3 text-sm">شركة أريس الحلول المتكاملة المحدودة</p><p className="mt-2 text-sm text-gray-600">اعتماد المنصة: العقد صادر ومعتمد عبر Arees Loop.</p></div>
        <div className="rounded-2xl border p-5" dir="rtl"><h2 className="font-bold text-[#0D3B34]">قبول الشريك | Partner Acceptance</h2><p className="mt-3 text-sm">المفوض: {agreement.acceptedByName||"—"}</p><p className="text-sm">البريد: <span dir="ltr">{agreement.acceptedByEmail||"—"}</span></p><p className="text-sm">تاريخ ووقت القبول: {acceptedAt}</p><p className="mt-2 font-bold text-[#267247]">✓ مقبول إلكترونياً | Electronically Accepted</p></div>
      </section>
      <footer className="mt-8 border-t pt-4 text-center text-[11px] text-gray-500">هذه النسخة تمثل سجل العقد الإلكتروني المحفوظ في Arees Loop. · This copy represents the electronic contract record maintained by Arees Loop.</footer>
    </article>
  </main>;
}
