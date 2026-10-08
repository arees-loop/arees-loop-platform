"use client";
import { useEffect, useState } from "react";
type Transaction={id:string;type:string;points:number;description:string|null;referenceId:string|null;createdAt:string;userName:string;email:string};
type Report={walletCount:number;outstandingPoints:number;totals:{type:string;count:number;points:number}[];transactions:Transaction[]};
const labels:Record<string,string>={EARN:"اكتساب",REDEEM:"استبدال",GIFT_SENT:"إرسال هدية",GIFT_RECEIVED:"استلام هدية",ADJUSTMENT:"تعديل"};
export default function AdminRewardsPage(){
 const [report,setReport]=useState<Report|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 useEffect(()=>{fetch("/api/admin/rewards",{credentials:"include",cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر جلب التقرير");setReport(d.data)}).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 const earned=report?.totals.find(t=>t.type==="EARN");const redeemed=report?.totals.find(t=>t.type==="REDEEM");
 return <main dir="rtl" className="mx-auto max-w-7xl px-5 py-10 text-[#0D3B34]">
  <h1 className="text-3xl font-black">إدارة النقاط والمكافآت</h1>
  <p className="mt-2 text-sm text-[#0D3B34]/65">إحصاءات وسجل العمليات المسجلة في قاعدة البيانات. لا تشمل النقاط المحفوظة محلياً في متصفح الزائر.</p>
  {loading?<p className="mt-8">جارٍ تحميل التقرير…</p>:error?<p role="alert" className="mt-8 text-red-700">{error}</p>:report&&<>
   <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {([{name:"الأرصدة الحالية",value:report.outstandingPoints},{name:"إجمالي النقاط المكتسبة",value:earned?.points??0},{name:"إجمالي النقاط المستبدلة",value:redeemed?.points??0},{name:"عدد المحافظ",value:report.walletCount}]).map(x=><div key={x.name} className="rounded-2xl border border-[#D4AF37]/25 bg-white p-6 shadow-sm"><p className="text-sm text-[#0D3B34]/70">{x.name}</p><p className="mt-3 text-3xl font-black">{x.value.toLocaleString("en-US")}</p></div>)}
   </div>
   <h2 className="mb-4 mt-10 text-xl font-black">سجل العمليات — آخر 100 عملية</h2>
   <div className="overflow-x-auto rounded-2xl border border-[#D4AF37]/25 bg-white"><table className="w-full min-w-[700px] text-right text-sm"><thead className="bg-[#F8F0E2]"><tr>{["التاريخ","العميل","العملية","النقاط","المرجع","الوصف"].map(x=><th key={x} className="p-4">{x}</th>)}</tr></thead><tbody>{report.transactions.map(t=><tr key={t.id} className="border-t border-[#D4AF37]/15"><td className="p-4">{new Date(t.createdAt).toLocaleString("ar-SA")}</td><td className="p-4"><div className="font-bold">{t.userName}</div><div className="text-xs opacity-60">{t.email}</div></td><td className="p-4">{labels[t.type]||t.type}</td><td className="p-4 font-bold">{t.points.toLocaleString("en-US")}</td><td className="p-4">{t.referenceId||"—"}</td><td className="p-4">{t.description||"—"}</td></tr>)}</tbody></table>{report.transactions.length===0&&<p className="p-8 text-center text-sm opacity-60">لا توجد عمليات نقاط مسجلة حتى الآن.</p>}</div>
  </>}
 </main>;
}
