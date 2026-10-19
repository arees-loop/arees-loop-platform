"use client";
import {useState} from "react";
import type {QuoteVatTreatment} from "@/lib/quotation-format";

export default function AdminQuoteVatEditor({id,initial}:{id:string;initial:QuoteVatTreatment}){
 const [treatment,setTreatment]=useState<QuoteVatTreatment>(initial);
 const [verified,setVerified]=useState(false),[busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const changed=treatment!==initial;
 const options:{value:QuoteVatTreatment;label:string;hint:string}[]=[
  {value:"UNDETERMINED",label:"التصنيف لم يُراجع بعد / Pending review",hint:"لا يُعرض رقم ضريبة غير موثق في مستند العميل"},
  {value:"STANDARD_15_INCLUDED",label:"15% ضمن السعر النهائي / Standard VAT included",hint:"يُحسب صافي المبلغ والضريبة من الإجمالي الحالي؛ لا زيادة على السعر"},
  {value:"ZERO_RATED_INTERNATIONAL",label:"0% نقل دولي مؤهل / Eligible international transport",hint:"يُستخدم فقط بعد تأكيد استيفاء شروط تطبيق نسبة الصفر"}
 ];
 async function save(){
  if(busy||!changed)return;setBusy(true);setError("");
  try{
   const response=await fetch("/api/admin/transport/quote-vat",{
    method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",
    body:JSON.stringify({id,treatment,confirmed:verified})
   });
   const data=await response.json();
   if(!response.ok||!data.success)throw new Error(data.message||"تعذر حفظ معالجة الضريبة.");
   window.location.reload();
  }catch(e){setError(e instanceof Error?e.message:"تعذر الحفظ.");setBusy(false);}
 }
 return <section dir="rtl" className="mb-4 rounded-2xl border border-[#CDAA52]/50 bg-[#FFF9EC] p-4 print:hidden">
  <h3 className="text-sm font-black text-[#0D3B34]">معالجة ضريبة القيمة المضافة لعرض السعر · VAT</h3>
  <p className="mt-1 text-xs leading-6 text-[#6A5B3D]">التذكرة الدولية قد تخضع لنسبة صفر وفق الشروط، بينما النسبة الأساسية 15%. اختر التصنيف المؤكد فقط. سعر العميل الإجمالي لن يتغير.</p>
  <div className="mt-3 grid gap-2">{options.map(o=><label key={o.value} className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#D9CAAA] bg-white p-3 text-xs">
    <input type="radio" name="quote-vat-treatment" checked={treatment===o.value} onChange={()=>{setTreatment(o.value);setVerified(false);}}/>
    <span><b className="block">{o.label}</b><span className="mt-1 block text-[11px] text-[#69675C]">{o.hint}</span></span>
  </label>)}</div>
  {treatment!=="UNDETERMINED"&&<label className="mt-3 flex items-start gap-2 text-xs leading-6">
    <input type="checkbox" checked={verified} onChange={e=>setVerified(e.target.checked)} className="mt-1"/>
    <span>أؤكد مراجعة المعالجة الضريبية لهذا العرض والناقل والخدمة قبل إظهار قيم الضريبة للعميل.</span>
  </label>}
  <button type="button" disabled={busy||!changed||(treatment!=="UNDETERMINED"&&!verified)} onClick={()=>void save()} className="mt-3 rounded-xl bg-[#0D3B34] px-5 py-2.5 text-xs font-black text-white disabled:opacity-40">{busy?"جارٍ الحفظ...":"حفظ تصنيف الضريبة للعرض"}</button>
  {error&&<p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
 </section>;
}
