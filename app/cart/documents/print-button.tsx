"use client";
export default function PrintCartDocument(){
 return <button type="button" onClick={()=>window.print()} className="rounded-xl bg-[#0D3B34] px-5 py-3 text-sm font-bold text-white print:hidden">طباعة / حفظ PDF</button>;
}
