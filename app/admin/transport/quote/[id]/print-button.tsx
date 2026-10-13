"use client";

export default function QuotePrintButton({disabled}:{disabled:boolean}) {
  return <div className="flex flex-wrap items-center gap-2">
    <button type="button" disabled={disabled} onClick={()=>window.print()} className="rounded-full bg-[#0D3B34] px-6 py-3 text-sm font-bold text-white disabled:opacity-40">
      طباعة / حفظ العرض PDF
    </button>
    <span className="text-xs text-[#0D3B34]/65">
      اختر «حفظ كملف PDF» من نافذة الطباعة، ثم أرفقه في محادثة واتساب الشركة.
    </span>
  </div>;
}
