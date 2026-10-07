"use client";

import { useEffect, useMemo, useState } from "react";

type Service={id:string;nameAr:string;category:string;status:string};
const categories=["برامج سياحية محلية","برامج سياحية عالمية","نقل سياحي","حجوزات وتذاكر","مطاعم وكافيهات","تجارب ثرية","مواقع أثرية","حرف يدوية","تقنية وخدمات سياحية","معارض وفعاليات"];

export default function PartnerCouponsPage(){
 const [services,setServices]=useState<Service[]>([]);
 const [code,setCode]=useState(""); const [discountType,setDiscountType]=useState<"PERCENTAGE"|"FIXED">("PERCENTAGE"); const [discountValue,setDiscountValue]=useState("");
 const [scope,setScope]=useState<"ALL"|"CATEGORY"|"SERVICE">("ALL"); const [category,setCategory]=useState(""); const [serviceId,setServiceId]=useState("");
 const [duration,setDuration]=useState<"PERMANENT"|"DATED">("PERMANENT"); const [startsAt,setStartsAt]=useState(""); const [expiresAt,setExpiresAt]=useState(""); const [saving,setSaving]=useState(false); const [message,setMessage]=useState(""); const [error,setError]=useState(false);
 useEffect(()=>{fetch("/api/partner/operations",{credentials:"include",cache:"no-store"}).then(r=>r.json()).then(d=>{if(d?.success)setServices((d.services||[]).filter((x:Service)=>x.status==="PUBLISHED"))}).catch(()=>{})},[]);
 const available=useMemo(()=>services.filter(s=>scope!=="CATEGORY"||!category||s.category===category),[services,scope,category]);
 const saveCoupon=async()=>{if(saving)return;setSaving(true);setMessage("");setError(false);try{const r=await fetch("/api/partner/coupons",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({code,discountType,discountValue,scope,category,serviceId,duration,startsAt,expiresAt})});const d=await r.json();if(!r.ok||!d?.success)throw new Error(d?.message||"تعذر إنشاء الكوبون.");setMessage("✓ تم إنشاء الكوبون بنجاح. أصبح جاهزاً للاستخدام.");setCode("");setDiscountValue("");setScope("ALL");setCategory("");setServiceId("");setDuration("PERMANENT");setStartsAt("");setExpiresAt("");}catch(e:any){setError(true);setMessage(e?.message||"تعذر إنشاء الكوبون.");}finally{setSaving(false);}};
 return <div dir="rtl" className="mx-auto max-w-6xl p-6 md:p-8">
   <div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-bold text-[#B99124]">التسويق والمبيعات</p><h1 className="mt-1 text-3xl font-black text-[#0D3B34]">الكوبونات</h1><p className="mt-2 text-sm text-[#54716B]">أنشئ كوبون خصم وحدد أين ومدة استخدامه.</p></div><span className="rounded-full bg-[#F4F0E4] px-4 py-2 text-xs font-bold text-[#0D3B34]">كوبونات الشريك</span></div>
   <div className="rounded-[24px] border border-[#0D3B34]/10 bg-white p-6 shadow-sm">
    <h2 className="mb-5 text-lg font-black text-[#0D3B34]">إنشاء كوبون جديد</h2>
    <div className="grid gap-5 md:grid-cols-2">
      <label className="text-sm font-bold text-[#173F38]">كود الكوبون
       <input value={code} onChange={e=>setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,""))} placeholder="مثال: ALULA20" className="mt-2 w-full rounded-xl border border-[#0D3B34]/15 px-4 py-3 uppercase outline-none focus:border-[#B99124]"/>
       <span className="mt-1 block text-[11px] font-normal text-[#6D827D]">حروف إنجليزية وأرقام فقط.</span>
      </label>
      <div><span className="text-sm font-bold text-[#173F38]">نوع الخصم</span><div className="mt-2 flex gap-2"><button onClick={()=>setDiscountType("PERCENTAGE")} className={`flex-1 rounded-xl border px-4 py-3 text-sm font-bold ${discountType==="PERCENTAGE"?"border-[#0D3B34] bg-[#0D3B34] text-white":"border-[#0D3B34]/15"}`}>نسبة %</button><button onClick={()=>setDiscountType("FIXED")} className={`flex-1 rounded-xl border px-4 py-3 text-sm font-bold ${discountType==="FIXED"?"border-[#0D3B34] bg-[#0D3B34] text-white":"border-[#0D3B34]/15"}`}>مبلغ ثابت ر.س</button></div></div>
      <label className="text-sm font-bold text-[#173F38]">قيمة الخصم<input type="number" min="0" value={discountValue} onChange={e=>setDiscountValue(e.target.value)} className="mt-2 w-full rounded-xl border border-[#0D3B34]/15 px-4 py-3 outline-none focus:border-[#B99124]"/></label>
      <div><span className="text-sm font-bold text-[#173F38]">مكان استخدام الكوبون</span><select value={scope} onChange={e=>setScope(e.target.value as any)} className="mt-2 w-full rounded-xl border border-[#0D3B34]/15 bg-white px-4 py-3"><option value="ALL">كل خدماتي</option><option value="CATEGORY">تصنيف محدد</option><option value="SERVICE">برنامج / خدمة محددة</option></select></div>
      {scope==="CATEGORY"&&<label className="text-sm font-bold text-[#173F38]">التصنيف<select value={category} onChange={e=>setCategory(e.target.value)} className="mt-2 w-full rounded-xl border border-[#0D3B34]/15 bg-white px-4 py-3"><option value="">اختر التصنيف</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label>}
      {scope==="SERVICE"&&<label className="text-sm font-bold text-[#173F38]">البرنامج / الخدمة<select value={serviceId} onChange={e=>setServiceId(e.target.value)} className="mt-2 w-full rounded-xl border border-[#0D3B34]/15 bg-white px-4 py-3"><option value="">اختر من خدماتك المنشورة</option>{available.map(s=><option key={s.id} value={s.id}>{s.nameAr}</option>)}</select></label>}
      <div><span className="text-sm font-bold text-[#173F38]">مدة الكوبون</span><div className="mt-2 flex gap-2"><button onClick={()=>setDuration("PERMANENT")} className={`flex-1 rounded-xl border px-4 py-3 text-sm font-bold ${duration==="PERMANENT"?"border-[#0D3B34] bg-[#0D3B34] text-white":"border-[#0D3B34]/15"}`}>دائم</button><button onClick={()=>setDuration("DATED")} className={`flex-1 rounded-xl border px-4 py-3 text-sm font-bold ${duration==="DATED"?"border-[#0D3B34] bg-[#0D3B34] text-white":"border-[#0D3B34]/15"}`}>تاريخ محدد</button></div></div>
      {duration==="DATED"&&<><label className="text-sm font-bold text-[#173F38]">يبدأ من<input type="date" value={startsAt} onChange={e=>setStartsAt(e.target.value)} className="mt-2 w-full rounded-xl border border-[#0D3B34]/15 px-4 py-3"/></label><label className="text-sm font-bold text-[#173F38]">ينتهي في<input type="date" value={expiresAt} onChange={e=>setExpiresAt(e.target.value)} className="mt-2 w-full rounded-xl border border-[#0D3B34]/15 px-4 py-3"/></label></>}
    </div>
    {message&&<p className={`mt-6 rounded-xl px-4 py-3 text-sm font-bold ${error?"bg-red-50 text-red-700":"bg-emerald-50 text-emerald-800"}`}>{message}</p>}
    <div className="mt-7 flex justify-end"><button onClick={saveCoupon} disabled={saving} className="rounded-xl bg-[#0D3B34] px-7 py-3 text-sm font-black text-white disabled:opacity-50">{saving?"جارٍ الحفظ...":"حفظ الكوبون"}</button></div>
   </div>
 </div>
}