/** Single legal identity header for customer-facing PDF/print documents.
 * Logo stays centered, registered Arabic name on the right, English on the left.
 * This is the registered legal entity, not the Arees Loop consumer brand.
 */
export default function LegalDocumentHeader({compact=false}:{compact?:boolean}){
 const legalAr="شركة أريس الحلول المتكاملة المحدودة";
 const legalEn="AREES AL-HELLOUL AL-MUTAKAMLA CO. LTD.";
 return <header className={`arees-legal-document-header border-b-[3px] border-[#B99444] ${compact?"pb-3":"pb-5"}`}>
  <div dir="rtl" className="grid grid-cols-[minmax(0,1fr)_128px_minmax(0,1fr)] items-start gap-3 print:grid-cols-[minmax(0,1fr)_128px_minmax(0,1fr)] print:gap-3">
   <section dir="rtl" className="min-w-0 text-right">
    <h1 className="font-[family-name:var(--font-el-messiri)] text-[15px] font-bold leading-7 tracking-tight text-[#0D3B34]">
     {legalAr}
    </h1>
    <div className="mt-2 space-y-1 text-[10px] font-semibold leading-[1.8] text-[#234C43]">
     <p>السجل التجاري: <b dir="ltr">7037003618</b></p>
     <p>الرقم الضريبي: <b dir="ltr">311897578200003</b></p>
     <p>ترخيص وزارة السياحة: <b dir="ltr">73104550</b></p>
     <p>فئة الترخيص: وكالة سفر وسياحة</p>
     <p>المدينة المنورة — المملكة العربية السعودية</p>
    </div>
   </section>
   <div className="flex items-start justify-center">
    <img src="/Logo/arees-integrated-solutions-logo.png" width={128} height={140}
     alt="شعار شركة أريس الحلول المتكاملة المحدودة"
     className="h-[142px] w-[128px] shrink-0 object-contain print:h-[142px] print:w-[128px]"/>
   </div>
   <section dir="ltr" className="min-w-0 text-left">
    <h2 className="font-[Arial,sans-serif] text-[12px] font-extrabold leading-[1.6] tracking-[.015em] text-[#0D3B34]">
     {legalEn}
    </h2>
    <div className="mt-2 space-y-1 font-[Arial,sans-serif] text-[10px] leading-[1.8] text-[#234C43]">
     <p>CR No.: <b>7037003618</b></p>
     <p>VAT No.: <b>311897578200003</b></p>
     <p>Tourism License No.: <b>73104550</b></p>
     <p>Travel and Tourism Agency</p>
     <p>Madinah — Saudi Arabia</p>
    </div>
   </section>
  </div>
 </header>;
}
