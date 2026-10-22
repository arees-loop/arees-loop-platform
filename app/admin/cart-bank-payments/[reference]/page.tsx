"use client";
import Link from "next/link";
import {useParams} from "next/navigation";
import {useCallback,useEffect,useState} from "react";
type Document={id:string;name:unknown;from:unknown;createdAt:string};
type Message={id:string;from:unknown;text:unknown;createdAt:string};
type Order={reference:string;status:string;paymentStatus:string;amountSar:number;createdAt:string;rows:{title:string;quantity:number;unitPriceSar:number}[];hasReceipt:boolean;customer:{name:string;email:string;phone:string|null}|null;documents:Document[];messages:Message[];timeline:{id:string;action:string;createdAt:string;status?:unknown}[]};
const labels:Record<string,string>={CART_BANK_CREATED:"طلب جديد — بانتظار تحويل العميل",CART_BANK_RECEIPT_SUBMITTED:"إيصال للتحقق — لا يعني وصول المبلغ",CART_BANK_VERIFIED:"تم تأكيد السداد",CART_BANK_REJECTED:"إيصال مرفوض",PAID:"تم السداد — تحت الإجراء",PROCESSING:"تحت التنفيذ",DOCUMENTS_REQUESTED:"طلب مستندات إضافية",COMPLETED:"تم التنفيذ"};
const money=(v:number)=>Number(v||0).toLocaleString("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2})+" ر.س";
export default function AdminCartOrderDetails(){
 const {reference:raw}=useParams<{reference:string}>();
 const reference=decodeURIComponent(raw||"");
 const [order,setOrder]=useState<Order|null>(null),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(""),[notice,setNotice]=useState(""),[message,setMessage]=useState(""),[status,setStatus]=useState("PROCESSING"),[file,setFile]=useState<File|null>(null);
 const load=useCallback(async()=>{try{
  const r=await fetch("/api/cart/order-workflow?reference="+encodeURIComponent(reference),{cache:"no-store",credentials:"include"});
  const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر قراءة الطلب.");
  setOrder(d.order);setError("");
 }catch(e){setError(e instanceof Error?e.message:"تعذر قراءة الطلب.");}finally{setLoading(false)}},[reference]);
 useEffect(()=>{void Promise.resolve().then(load)},[load]);
 async function post(url:string,body:Record<string,unknown>,confirm?:string){
  if(confirm&&!window.confirm(confirm))return;
  setBusy(true);setError("");setNotice("");
  try{const r=await fetch(url,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({reference,...body})});
   const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذّر التنفيذ.");
   setNotice(d.message||"تم الحفظ");setMessage("");await load();
  }catch(e){setError(e instanceof Error?e.message:"تعذّر التنفيذ.");}finally{setBusy(false);}
 }
 async function upload(){
  if(!file)return;setBusy(true);setError("");try{
   const form=new FormData();form.set("reference",reference);form.set("file",file);
   const r=await fetch("/api/cart/order-documents",{method:"POST",body:form,credentials:"include"});
   const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر حفظ الملف.");
   setFile(null);setNotice("تم رفع المرفق إلى الطلب، وهو متاح للعميل.");await load();
  }catch(e){setError(e instanceof Error?e.message:"تعذر رفع الملف");}finally{setBusy(false);}
 }
 const verified=!!order&&["PAID","PROCESSING","DOCUMENTS_REQUESTED","COMPLETED"].includes(order.status);
 const canReview=order?.paymentStatus==="CART_BANK_RECEIPT_SUBMITTED";
 const phone=(order?.customer?.phone||"").replace(/[^0-9]/g,"");
 return <main dir="rtl" className="mx-auto max-w-7xl space-y-4 p-4 text-[#0D3B34] md:p-7">
   <header className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold text-[#B59035]">AREES LOOP · إدارة طلبات السلة</p><h1 className="mt-2 text-2xl font-black">إدارة طلب السلة</h1><p dir="ltr" className="mt-2 text-left font-mono text-xs">{reference}</p></div><Link href="/admin/cart-bank-payments" className="rounded-xl border border-[#D4AF37] bg-white px-4 py-2 text-xs font-black">← العودة إلى قائمة الطلبات</Link></header>
   {loading&&<p>جارٍ تحميل الطلب...</p>}
   {error&&<p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
   {notice&&<p role="status" className="rounded-xl border border-[#9CBDAA] bg-[#EFFAF0] p-3 text-sm">{notice}</p>}
   {order&&<><div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E0CD9A] bg-white p-4"><div><p className="text-lg font-black">{order.rows.map(r=>r.title).join("، ")||"طلب خدمة"}</p><p className="mt-1 text-xs text-[#67756D]">{labels[order.status]||order.status}</p></div><b className="text-xl text-[#9A7525]">{money(order.amountSar)}</b></div>
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-[#DACAAC] bg-white p-5"><h2 className="mb-3 font-black">① بيانات العميل والخدمة</h2>
        <p className="text-sm">العميل: <b>{order.customer?.name||"عميل"}</b></p><p className="mt-2 text-xs">البريد: {order.customer?.email||"غير متوفر"}</p><p className="mt-2 text-xs">الجوال: <span dir="ltr">{order.customer?.phone||"غير متوفر"}</span></p>
        <p className="mt-2 text-xs">الطلب بتاريخ: {new Date(order.createdAt).toLocaleString("ar-SA")}</p>
        <ul className="mt-3 list-inside list-disc text-xs">{order.rows.map((r,i)=><li key={i}>{r.title} × {r.quantity} — {money(r.unitPriceSar*r.quantity)}</li>)}</ul>
        {phone&&<a href={"https://wa.me/"+phone} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-xl bg-[#0D6B4F] px-4 py-2 text-xs font-bold text-white">التواصل مع العميل عبر واتساب ↗</a>}
      </section>
      <section className="rounded-2xl border border-[#DACAAC] bg-white p-5"><h2 className="mb-3 font-black">② السداد وإثبات التحويل</h2>
        <p className="text-sm">{labels[order.paymentStatus]||order.paymentStatus}</p><p className="mt-2 text-xs">الإيصال يُراجع ولا يُعتبر إثباتاً لوصول المبلغ قبل المطابقة البنكية.</p>
        {order.hasReceipt?<div className="mt-4 flex flex-wrap gap-2">
         <a target="_blank" rel="noreferrer" href={"/api/admin/cart-bank-payments?receipt=true&inline=true&reference="+encodeURIComponent(reference)} className="rounded-xl border border-[#D4AF37] px-4 py-2 text-xs font-bold">👁 معاينة الإيصال</a>
         <a href={"/api/admin/cart-bank-payments?receipt=true&reference="+encodeURIComponent(reference)} className="rounded-xl border border-[#D4AF37] px-4 py-2 text-xs font-bold">↓ تنزيل الإيصال</a>
        </div>:<p className="mt-3 text-xs">لم يُرفع إيصال بعد.</p>}
        {canReview&&<div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={()=>void post("/api/admin/cart-bank-payments",{decision:"VERIFY"},"هل راجعت حساب البنك وتأكدت فعلياً من وصول المبلغ؟")} className="rounded-xl bg-[#0D3B34] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">تأكيد وصول المبلغ</button><button type="button" disabled={busy} onClick={()=>void post("/api/admin/cart-bank-payments",{decision:"REJECT"},"رفض الإيصال مع إمكانية رفع آخر؟")} className="rounded-xl border border-red-300 px-4 py-2 text-xs font-bold text-red-700">رفض الإيصال</button></div>}
        {verified&&<a target="_blank" rel="noreferrer" href={"/cart/documents/invoice?reference="+encodeURIComponent(reference)} className="mt-4 inline-block rounded-xl border border-[#D4AF37] px-4 py-2 text-xs font-bold">عرض مستند سداد العميل</a>}
      </section>
      <section className="rounded-2xl border border-[#DACAAC] bg-white p-5"><h2 className="mb-3 font-black">③ حالة الطلب ومستندات التنفيذ</h2>
        <p className="mb-3 text-xs">حالة الطلب: <b>{labels[order.status]||order.status}</b></p>
        {verified?<div className="flex flex-wrap gap-2"><select value={status} onChange={e=>setStatus(e.target.value)} aria-label="حالة التنفيذ الجديدة" className="min-w-0 flex-1 rounded-xl border p-3 text-sm"><option value="PROCESSING">تحت التنفيذ</option><option value="DOCUMENTS_REQUESTED">طلب مستندات إضافية</option><option value="COMPLETED">تم التنفيذ</option></select><button disabled={busy||order.status===status} onClick={()=>void post("/api/cart/order-workflow",{action:"STATUS",status})} className="rounded-xl bg-[#0D3B34] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">حفظ الحالة</button></div>:<p className="rounded-lg bg-[#FFF7EA] p-3 text-xs">تعديل حالة التنفيذ وإرسال ملفات الخدمة متاحان بعد تأكيد وصول السداد.</p>}
        {verified&&<div className="mt-4 space-y-2 rounded-xl bg-[#FAF7F0] p-3"><label className="block text-xs font-bold">ملف تأكيد الحجز أو التذكرة أو مستند التنفيذ<input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="mt-2 block w-full" onChange={e=>setFile(e.target.files?.[0]||null)}/></label><button disabled={!file||busy} onClick={()=>void upload()} className="rounded-xl border border-[#B89643] px-4 py-2 text-xs font-bold disabled:opacity-40">إرفاق الملف للعميل</button></div>}
        <div className="mt-4 space-y-2">{order.documents.map(d=><div key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2 text-xs"><span>{String(d.name||"مرفق")} · {d.from==="CUSTOMER"?"العميل":"الإدارة"}</span><span className="flex gap-2"><a href={"/api/cart/order-documents?reference="+encodeURIComponent(reference)+"&document="+encodeURIComponent(d.id)+"&inline=true"} target="_blank" rel="noreferrer" className="underline">معاينة</a><a href={"/api/cart/order-documents?reference="+encodeURIComponent(reference)+"&document="+encodeURIComponent(d.id)} className="underline">تنزيل</a></span></div>)}</div>
      </section>
      <section className="rounded-2xl border border-[#DACAAC] bg-white p-5"><h2 className="mb-3 font-black">④ التواصل وسجل الطلب</h2>
        <div className="max-h-56 space-y-2 overflow-y-auto">{order.messages.length===0?<p className="text-xs text-[#67756D]">لا توجد رسائل بعد.</p>:order.messages.map(m=><div key={m.id} className="rounded-xl bg-[#F8F6F0] p-3 text-xs"><b>{m.from==="ADMIN"?"الإدارة":"العميل"}</b><p className="mt-1 whitespace-pre-wrap">{String(m.text)}</p><small>{new Date(m.createdAt).toLocaleString("ar-SA")}</small></div>)}</div>
        <label className="mt-4 block text-xs font-bold">الرد على العميل<textarea maxLength={1500} rows={3} value={message} onChange={e=>setMessage(e.target.value)} className="mt-2 w-full rounded-xl border border-[#DACAAC] p-3" placeholder="مثلاً: يرجى إرفاق صورة جواز السفر"/></label>
        <button disabled={busy||message.trim().length<2} onClick={()=>void post("/api/cart/order-workflow",{action:"MESSAGE",text:message})} className="rounded-xl bg-[#0D3B34] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">إرسال الرد وحفظه</button>
        <h3 className="mt-5 text-xs font-black">سجل إجراءات الطلب</h3><ul className="mt-2 max-h-40 space-y-2 overflow-y-auto text-xs">{order.timeline.map(t=><li key={t.id} className="border-r-2 border-[#D4AF37] pr-3">{labels[String(t.status||t.action)]||String(t.status||t.action)} · {new Date(t.createdAt).toLocaleString("ar-SA")}</li>)}</ul>
      </section>
    </div>
   </>}
  </main>;
}
