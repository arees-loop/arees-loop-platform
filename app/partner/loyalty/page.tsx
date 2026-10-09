"use client";

import { useEffect, useMemo, useState } from "react";

type Service = { id: string; nameAr: string; category: string };
type Setting = { id: string; scope: "ALL"|"CATEGORY"|"SERVICE"; category?: string|null; serviceId?: string|null; isActive: boolean; service?: Service|null };

export default function LoyaltyPage() {
  const [services,setServices]=useState<Service[]>([]);
  const [setting,setSetting]=useState<Setting|null>(null);
  const [scope,setScope]=useState<"ALL"|"CATEGORY"|"SERVICE">("ALL");
  const [category,setCategory]=useState("");
  const [serviceId,setServiceId]=useState("");
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [loadError,setLoadError]=useState("");

  const categories=useMemo(()=>Array.from(new Set(services.map(s=>s.category).filter(Boolean))),[services]);

  async function load(){
    setLoadError("");
    const res=await fetch("/api/partner/loyalty",{cache:"no-store"});
    const data=await res.json();
    if(!data.success){ setLoadError(data.message||"تعذر تحميل إعدادات النقاط."); return; }
    if(data.success){
      setServices(data.services||[]);
      const current=data.settings?.[0]||null;
      setSetting(current);
      if(current){setScope(current.scope);setCategory(current.category||"");setServiceId(current.serviceId||"");}
    }
  }
  useEffect(()=>{
    const controller=new AbortController();
    fetch("/api/partner/loyalty",{cache:"no-store",signal:controller.signal}).then(r=>r.json()).then(data=>{
      if(!data.success){setLoadError(data.message||"تعذر تحميل إعدادات النقاط.");return;}
      setServices(data.services||[]);const current=data.settings?.[0]||null;setSetting(current);
      if(current){setScope(current.scope);setCategory(current.category||"");setServiceId(current.serviceId||"")}
    }).catch(()=>{if(!controller.signal.aborted)setLoadError("تعذر تحميل إعدادات النقاط.")});
    return ()=>controller.abort();
  },[]);

  async function save(){
    setSaving(true);setMessage("");
    const res=await fetch("/api/partner/loyalty",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({scope,category,serviceId})});
    const data=await res.json();
    setSaving(false);
    if(!data.success){setMessage(data.message||"تعذر الحفظ.");return;}
    setMessage("تم حفظ إعدادات نقاط Arees Loop.");
    await load();
  }

  async function toggle(){
    if(!setting)return;
    const res=await fetch("/api/partner/loyalty",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({isActive:!setting.isActive})});
    const data=await res.json();
    if(data.success)await load();
  }

  return <main className="min-h-screen p-6 md:p-10">
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-bold tracking-[.16em] text-[#B99124]">AREES LOOP LOYALTY</p><h1 className="mt-2 text-3xl font-black">النقاط والمكافآت</h1><p className="mt-2 max-w-2xl text-sm text-[#0D3B34]/60">فعّل نقاط Arees Loop لخدماتك لتشجّع العميل على العودة والحجز معك مرة أخرى. تُحفظ النقاط في محفظة العميل، وتتولى Arees Loop تحديد قيمتها وقواعد استخدامها واستبدالها مركزياً.</p></div>
        {setting&&<button onClick={toggle} className={"rounded-2xl px-5 py-3 text-sm font-black text-white shadow-sm "+(setting.isActive?"bg-emerald-700 hover:bg-emerald-800":"bg-red-700 hover:bg-red-800")}>{setting.isActive?"● النقاط مفعّلة — اضغط للإيقاف":"● النقاط متوقفة — اضغط للتفعيل"}</button>}
      </div>

      {loadError&&<div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{loadError}</div>}
      <section className="rounded-[28px] border border-[#0D3B34]/10 bg-white p-6 shadow-sm">
        <div className="mb-6 rounded-2xl border border-[#D4AF37]/25 bg-[#FFF9E8] p-4 text-sm leading-7 text-[#0D3B34]"><strong>لماذا تفعّل نقاط الولاء؟</strong> تمنح عميلك سبباً للعودة إليك وتجربة خدماتك مرة أخرى، وتزيد ارتباطه بخدماتك داخل Arees Loop. تُحفظ النقاط في محفظة العميل، ويمكن استخدامها وفق قواعد الاستبدال التي تحددها Arees Loop وتعلنها للعملاء.</div><div className="mb-6 flex items-center justify-between gap-3"><div><h2 className="text-lg font-black">نطاق كسب النقاط</h2><p className="mt-1 text-xs text-[#0D3B34]/50">الشريك يحدد الخدمات المشاركة فقط، ولا يحدد قيمة النقطة.</p></div>{setting&&<span className={"rounded-full px-3 py-1 text-xs font-bold "+(setting.isActive?"bg-emerald-700 text-white":"bg-red-700 text-white")}>{setting.isActive?"● مفعّل":"● متوقف"}</span>}</div>
        <div className="grid gap-3 md:grid-cols-3">
          {([["ALL","كل الخدمات"],["CATEGORY","تصنيف محدد"],["SERVICE","خدمة محددة"]] as const).map(([value,label])=><button key={value} onClick={()=>setScope(value)} className={"rounded-2xl border p-4 text-right text-sm font-bold transition "+(scope===value?"border-[#D4AF37] bg-[#FFF9E8]":"border-[#0D3B34]/10 hover:border-[#0D3B34]/25")}>{label}</button>)}
        </div>
        {scope==="CATEGORY"&&<div className="mt-5"><label className="mb-2 block text-sm font-bold">التصنيف</label><select value={category} onChange={e=>setCategory(e.target.value)} className="w-full rounded-2xl border border-[#0D3B34]/15 bg-white p-3"><option value="">اختر التصنيف</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div>}
        {scope==="SERVICE"&&<div className="mt-5"><label className="mb-2 block text-sm font-bold">الخدمة</label><select value={serviceId} onChange={e=>setServiceId(e.target.value)} className="w-full rounded-2xl border border-[#0D3B34]/15 bg-white p-3"><option value="">اختر الخدمة</option>{services.map(s=><option key={s.id} value={s.id}>{s.nameAr}</option>)}</select></div>}
        <div className="mt-6 rounded-2xl bg-[#F7F4EA] p-4 text-sm leading-7"><strong>سياسة Arees Loop:</strong> النقاط تُدار كمحفظة ولاء مركزية. الشريك يقرر المشاركة ونطاقها فقط، بينما قيمة النقاط والاستبدال وقواعد المحفظة تحددها Arees Loop.</div>
        {message&&<p className="mt-4 text-sm font-bold">{message}</p>}
        <button disabled={saving} onClick={save} className="mt-6 rounded-2xl bg-[#0D3B34] px-6 py-3 text-sm font-bold text-white disabled:opacity-50">{saving?"جاري الحفظ...":setting?"حفظ التعديلات":"تفعيل نقاط Arees Loop"}</button>
      </section>
    </div>
  </main>;
}
