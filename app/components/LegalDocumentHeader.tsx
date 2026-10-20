/** A4 legal identity header shared by AREES customer documents.
 * Registration numbers and license details are paired on one line each.
 * Header deliberately identifies the registered legal company, not a brand.
 */
export default function LegalDocumentHeader({compact=false}:{compact?:boolean}){
 const legalAr="شركة أريس الحلول المتكاملة المحدودة";
 const legalEn="AREES AL-HELLOUL AL-MUTAKAMLA CO. LTD.";
 return <header className={`arees-legal-document-header border-b-[3px] border-[#B99444] ${compact?"pb-2":"pb-4"}`}>
  <div dir="rtl" className="grid min-w-[680px] grid-cols-[minmax(0,1fr)_148px_minmax(0,1fr)] items-start gap-x-2 print:min-w-0 print:grid-cols-[minmax(0,1fr)_148px_minmax(0,1fr)]">
   <section dir="rtl" className="min-w-0 pt-1 text-right">
    <h1 className="whitespace-nowrap font-[family-name:var(--font-el-messiri)] text-[12px] font-bold leading-6 tracking-tight text-[#0D3B34]">
     {legalAr}
    </h1>
    <div className="mt-2 space-y-2 text-[9px] font-semibold leading-5 text-[#234C43]">
     <p className="flex items-baseline justify-start gap-1 whitespace-nowrap">
      <span>السجل التجاري: <b dir="ltr" className="inline-block">7037003618</b></span>
      <span aria-hidden="true" className="text-[#B99444]">|</span>
      <span>الرقم الضريبي: <b dir="ltr" className="inline-block">311897578200003</b></span>
     </p>
     <p className="flex items-baseline justify-start gap-1 whitespace-nowrap">
      <span>ترخيص السياحة: <b dir="ltr" className="inline-block">73104550</b></span>
      <span aria-hidden="true" className="text-[#B99444]">|</span>
      <span>الفئة: وكالة سفر وسياحة</span>
     </p>
     <p className="whitespace-nowrap">المدينة المنورة — المملكة العربية السعودية</p>
    </div>
   </section>
   <div className="flex items-start justify-center">
    <img src="/Logo/arees-integrated-solutions-logo.png" width={148} height={158}
     alt="شعار شركة أريس الحلول المتكاملة المحدودة"
     className="h-[158px] w-[148px] shrink-0 object-contain print:h-[158px] print:w-[148px]"/>
   </div>
   <section dir="ltr" className="min-w-0 pt-1 text-left">
    <h2 className="whitespace-nowrap font-[Arial,sans-serif] text-[10px] font-extrabold leading-6 tracking-tight text-[#0D3B34]">
     {legalEn}
    </h2>
    <div className="mt-2 space-y-2 font-[Arial,sans-serif] text-[9px] font-medium leading-5 text-[#234C43]">
     <p className="flex items-baseline justify-start gap-1 whitespace-nowrap">
      <span>CR No.: <b>7037003618</b></span>
      <span aria-hidden="true" className="text-[#B99444]">|</span>
      <span>VAT No.: <b>311897578200003</b></span>
     </p>
     <p className="flex items-baseline justify-start gap-1 whitespace-nowrap">
      <span>Tourism License: <b>73104550</b></span>
      <span aria-hidden="true" className="text-[#B99444]">|</span>
      <span>Travel and Tourism Agency</span>
     </p>
     <p className="whitespace-nowrap">Madinah — Saudi Arabia</p>
    </div>
   </section>
  </div>
 </header>;
}
