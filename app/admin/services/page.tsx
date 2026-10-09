"use client";

import { useEffect, useMemo, useState } from "react";

type Service = {
  id: string; nameAr: string; nameEn?: string | null; category: string; subCategory?: string | null;
  descriptionAr?: string | null; descriptionEn?: string | null; city?: string | null;
  locationName?: string | null; formattedAddress?: string | null; latitude?: number | null; longitude?: number | null;
  basePrice: number; vatRate: number; finalPrice: number; capacity?: number | null;
  cancellationPolicy?: string | null; meetingInstructions?: string | null; status: string;
  partnerName: string; bookingCount: number; updatedAt: string;
  license?: { type?: string | null; issuer?: string | null; licenseNumber?: string | null; status?: string | null } | null;
  images?: Array<{ id: string; url: string }>;
  organizerType?: string|null; organizerName?: string|null; organizerLicenseNumber?: string|null; organizerLicenseIssuer?: string|null; programApprovalNumber?: string|null;
};

const labels: Record<string,string> = {
  DRAFT:"مسودة", UNDER_REVIEW:"تحت المراجعة", PUBLISHED:"منشورة", SUSPENDED:"مخفية", REJECTED:"مرفوضة"
};

export default function AdminServicesPage() {
  const [items,setItems]=useState<Service[]>([]);
  const [selected,setSelected]=useState<Service|null>(null);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [viewMode,setViewMode]=useState<"CARDS"|"LIST">("CARDS");

  const [search,setSearch]=useState("");
  const [filters,setFilters]=useState<Record<string,string>>({});
  const [newestFirst,setNewestFirst]=useState(true);
  const cols=[["nameAr","اسم البرنامج"],["partnerName","الشريك"],["category","التصنيف"],["city","المدينة"],["status","الحالة"],["finalPrice","السعر"],["updatedAt","التحديث"]] as const;
  const display=(s:Service,key:string)=>key==="status"?(labels[s.status]||s.status):key==="updatedAt"?(s.updatedAt?new Date(s.updatedAt).toLocaleDateString("ar-SA"):"—"):String(s[key as keyof Service]??"—");
  const visible=useMemo(()=>items.filter(s=>{
    if(search&&![s.nameAr,s.nameEn,s.partnerName,s.category,s.city,s.status].join(" ").toLowerCase().includes(search.toLowerCase()))return false;
    return cols.every(([key])=>!filters[key]||display(s,key).toLowerCase().includes(filters[key].toLowerCase()));
  }).sort((a,b)=>(newestFirst?-1:1)*(new Date(b.updatedAt).getTime()-new Date(a.updatedAt).getTime())),[items,search,filters,newestFirst]);
  const exportCsv=()=>{
    const rows=[cols.map(([,name])=>name),...visible.map(s=>cols.map(([key])=>display(s,key)))];
    const csv="\\uFEFF"+rows.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\\r\\n");
    const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
    const a=document.createElement("a");a.href=url;a.download="arees-loop-services.csv";a.click();URL.revokeObjectURL(url);
  };
  const printPdf=()=>{
    const clean=(v:string)=>v.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const head=cols.map(([,label])=>"<th>"+clean(label)+"</th>").join("");
    const rows=visible.map(s=>"<tr>"+cols.map(([key])=>"<td>"+clean(display(s,key))+"</td>").join("")+"</tr>").join("");
    const html='<html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقرير الخدمات</title><style>body{font-family:Arial}table{width:100%;border-collapse:collapse}td,th{border:1px solid #bbb;padding:8px;text-align:right}@page{size:landscape}</style></head><body><h2>تقرير خدمات أريس لوب</h2><table><thead><tr>'+head+'</tr></thead><tbody>'+rows+'</tbody></table></body></html>';
    const w=window.open("","_blank");if(!w){setMessage("يرجى السماح بالنوافذ المنبثقة.");return;}w.document.write(html);w.document.close();w.focus();w.print();
  };

  const load=async()=>{
    setLoading(true);
    try {
      const r=await fetch("/api/admin/services",{cache:"no-store",credentials:"include"});
      const p=await r.json();
      if(!r.ok||!p.success) throw new Error(p.message||"تعذر تحميل الخدمات.");
      setItems(p.data||[]);
      if(selected) setSelected((p.data||[]).find((x:Service)=>x.id===selected.id)||null);
    } catch(e){ setMessage(e instanceof Error?e.message:"تعذر تحميل الخدمات."); }
    finally{setLoading(false);}
  };
  useEffect(()=>{void load();},[]);

  const counts=useMemo(()=>({
    all:items.length, review:items.filter(x=>x.status==="UNDER_REVIEW").length,
    published:items.filter(x=>x.status==="PUBLISHED").length,
    hidden:items.filter(x=>x.status==="SUSPENDED").length
  }),[items]);

  const decide=async(action:"APPROVE"|"REJECT")=>{
    if(!selected||busy)return;
    let reason="";
    if(action==="REJECT"){ reason=window.prompt("اكتب سبب رفض الخدمة:")?.trim()||""; if(!reason)return; }
    setBusy(true); setMessage("");
    try{
      const r=await fetch(`/api/admin/services/${selected.id}/decision`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,reason})});
      const p=await r.json();
      if(!r.ok||!p.success) throw new Error(p.message||"تعذر تنفيذ الإجراء.");
      setMessage(action==="APPROVE"?"تم اعتماد الخدمة ونشرها للعملاء وإرسال إشعار البريد للشريك.":"تم رفض الخدمة.");
      setSelected(null); await load();
      window.scrollTo({top:0,behavior:"smooth"});
    }catch(e){setMessage(e instanceof Error?e.message:"تعذر تنفيذ الإجراء.");}
    finally{setBusy(false);}
  };

  return <main dir="rtl" className="min-h-screen bg-[#F5F1E8] p-5 text-[#0D3B34] lg:p-10">
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-7">
        <p className="text-[10px] font-bold tracking-[.2em] text-[#B99124]">SERVICES & EXPERIENCES</p>
        <h1 className="mt-2 text-3xl font-bold">الخدمات والتجارب</h1>
        <p className="mt-2 text-sm text-[#0D3B34]/55">مراجعة الخدمات والتجارب المرسلة من الشركاء واعتمادها قبل ظهورها للعملاء.</p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[[ "الإجمالي",counts.all],["تحت المراجعة",counts.review],["منشورة",counts.published],["مخفية",counts.hidden]].map(([l,v])=>
          <div key={String(l)} className="rounded-[22px] border border-white/80 bg-white/70 p-5"><p className="text-xs opacity-55">{l}</p><p className="mt-2 text-3xl font-bold">{v}</p></div>
        )}
      </div>

      {message&&<div role="status" className="mb-5 rounded-2xl border border-[#D4AF37]/25 bg-white/90 p-4 text-sm font-bold shadow-sm">✓ {message}</div>}
      {!selected&&<div className="mb-5 flex justify-end"><div className="flex rounded-xl bg-[#0D3B34]/5 p-1"><button onClick={()=>setViewMode("CARDS")} className={`rounded-lg px-4 py-2 text-xs font-bold ${viewMode==="CARDS"?"bg-white shadow-sm":""}`}>بطاقات</button><button onClick={()=>setViewMode("LIST")} className={`rounded-lg px-4 py-2 text-xs font-bold ${viewMode==="LIST"?"bg-white shadow-sm":""}`}>قائمة</button></div></div>}
      {loading?<div className="rounded-3xl bg-white/70 p-8 text-center">جاري تحميل الخدمات الحقيقية من قاعدة البيانات...</div>:
      !items.length?<div className="rounded-3xl bg-white/70 p-8 text-center">لا توجد خدمات أو تجارب حالياً.</div>:
      <div className={viewMode==="CARDS"?"grid gap-4 md:grid-cols-2 xl:grid-cols-3":"space-y-3"}>
        {items.map(s=><button key={s.id} onClick={()=>setSelected(s)} className="rounded-[24px] border border-white/80 bg-white/75 p-5 text-right transition hover:-translate-y-0.5 hover:shadow-lg">
          <div className="flex items-center justify-between gap-3"><span className="rounded-full bg-[#FFF3D2] px-3 py-1 text-[11px] font-bold">{labels[s.status]||s.status}</span><span className="text-[11px] text-[#B99124]">{s.category}</span></div>
          <h2 className="mt-4 text-lg font-bold">{s.nameAr}</h2>
          <p className="mt-1 text-xs opacity-55">{s.nameEn||"—"}</p>
          <div className="mt-4 border-t border-[#0D3B34]/8 pt-3 text-xs"><b>الشريك:</b> {s.partnerName}</div>
        </button>)}
      </div>}

      {selected&&<section className="mt-6 overflow-hidden rounded-[30px] border border-white/80 bg-white/72 p-6 shadow-sm md:p-8">
        <div className="w-full">
          <div className="flex items-start justify-between"><div><p className="text-xs font-bold text-[#B99124]">{selected.partnerName}</p><h2 className="mt-1 text-2xl font-bold">{selected.nameAr}</h2><p className="text-sm opacity-50">{selected.nameEn}</p></div><button onClick={()=>setSelected(null)} className="rounded-xl border border-[#0D3B34]/10 bg-white px-4 py-2 text-xs font-bold">← العودة للبطاقات</button></div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {[
              ["الحالة",labels[selected.status]||selected.status],["التصنيف",selected.category],["التصنيف الفرعي",selected.subCategory||"—"],
              ["السعر النهائي",`${selected.finalPrice} ريال`],["السعة",String(selected.capacity??"—")],["المدينة",selected.city||"—"],
              ["الموقع",selected.locationName||selected.formattedAddress||"—"],["رقم الترخيص",selected.license?.licenseNumber||"غير مرتبط"],
              ["🏢 مقدم الخدمة",selected.partnerName],["🪪 منظم البرنامج",selected.organizerType==="OTHER"?(selected.organizerName||"—"):"مقدم الخدمة نفسه"],
              ["ترخيص المنظم",selected.organizerType==="OTHER"?(selected.organizerLicenseNumber||"—"):(selected.license?.licenseNumber||"غير مرتبط")],["🔢 رقم اعتماد البرنامج",selected.programApprovalNumber||"غير مدخل"],["الحجوزات",String(selected.bookingCount)]
            ].map(([l,v])=><div key={l} className="rounded-2xl bg-white p-4"><p className="text-[10px] opacity-45">{l}</p><p className="mt-1 text-sm font-bold">{v}</p></div>)}
          </div>
          <div className="mt-4 rounded-2xl bg-white p-4"><p className="text-xs font-bold">الوصف العربي</p><div className="mt-2 text-sm leading-7 opacity-70 [&_ul]:list-disc [&_ul]:pr-5 [&_ol]:list-decimal [&_ol]:pr-5" dangerouslySetInnerHTML={{__html:selected.descriptionAr||"—"}} /></div>
          <div className="mt-4 rounded-2xl bg-white p-4"><p className="text-xs font-bold">الوصف الإنجليزي</p><div className="mt-2 text-sm leading-7 opacity-70 [&_ul]:list-disc [&_ul]:pr-5 [&_ol]:list-decimal [&_ol]:pr-5" dangerouslySetInnerHTML={{__html:selected.descriptionEn||"—"}} /></div>
          {selected.status==="UNDER_REVIEW"&&<div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button disabled={busy} onClick={()=>void decide("REJECT")} className="rounded-2xl border border-red-200 bg-white px-5 py-3 font-bold text-red-600 disabled:opacity-40">رفض الخدمة</button>
            <button disabled={busy} onClick={()=>void decide("APPROVE")} className="rounded-2xl bg-[#0D3B34] px-5 py-3 font-bold text-white disabled:opacity-40">{busy?"جارٍ الاعتماد...":"اعتماد ونشر للعملاء"}</button>
          </div>}
        </div>
      </section>}
    </div>
  </main>;
}
