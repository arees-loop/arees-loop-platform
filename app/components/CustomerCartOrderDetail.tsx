"use client";
import {useCallback,useEffect,useState} from "react";
import Link from "next/link";
type Item={reference:string;paymentStatus:string;status:string;amountSar:number;rows:{title:string;quantity:number}[];messages:{id:string;from:unknown;text:unknown;createdAt:string}[];documents:{id:string;from:unknown;name:unknown;createdAt:string}[];timeline:{id:string;action:string;createdAt:string}[]};
const labels:Record<string,string>={CART_BANK_CREATED:"بانتظار التحويل",CART_BANK_RECEIPT_SUBMITTED:"تم رفع الإيصال — قيد المراجعة",CART_BANK_VERIFIED:"تم اعتماد وصول السداد",CART_BANK_REJECTED:"الإيصال مرفوض",PAID:"تم السداد — تحت الإجراء",PROCESSING:"تحت التنفيذ",DOCUMENTS_REQUESTED:"يرجى إرفاق مستندات إضافية",COMPLETED:"تم التنفيذ"};
export default function CustomerCartOrderDetail({reference}:{reference:string}){
 const [order,setOrder]=useState<Item|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(""),[notice,setNotice]=useState(""),[message,setMessage]=useState(""),[file,setFile]=useState<File|null>(null),[busy,setBusy]=useState(false);
 const load=useCallback(async()=>{
  try{const r=await fetch("/api/cart/order-workflow?reference="+encodeURIComponent(reference),{credentials:"include",cache:"no-store"});const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر تحميل الطلب.");setOrder(d.order);setError("");}
  catch(e){setError(e instanceof Error?e.message:"تعذر قراءة الطلب.");}finally{setLoading(false);}
 },[reference]);useEffect(()=>{void load()},[load]);
 async function send(){
  if(message.trim().length<2||busy)return;setBusy(true);setError("");
  try{const r=await fetch("/api/cart/order-workflow",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({reference,action:"MESSAGE",text:message})});const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر الإرسال.");setNotice(d.message||"تم إرسال الرد");setMessage("");await load();}
  catch(e){setError(e instanceof Error?e.message:"تعذر الإرسال.");}finally{setBusy(false);}
 }
 async function upload(){
  if(!file||busy)return;setBusy(true);setError("");
  try{const form=new FormData();form.set("reference",reference);form.set("file",file);const r=await fetch("/api/cart/order-documents",{method:"POST",body:form,credentials:"include"});const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر الرفع.");setNotice("تم إرفاق المستند في الطلب.");setFile(null);await load();}
  catch(e){setError(e instanceof Error?e.message:"تعذر الرفع.");}finally{setBusy(false);}
 }
 return <div dir="rtl" className="space-y-3 border-t border-[#D4AF37]/20 p-4 text-xs">
   {loading&&<p>جارٍ تحميل تفاصيل الطلب...</p>}
   {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
   {notice&&<p role="status" className="rounded-xl bg-green-50 p-3">{notice}</p>}
   {order&&<>
    <p><b>الحالة:</b> {labels[order.status]||order.status}</p>
    <p><b>رقم الطلب:</b> <span dir="ltr" className="font-mono">{reference}</span></p>
    {["CART_BANK_CREATED","CART_BANK_REJECTED"].includes(order.paymentStatus)&&<Link href={"/cart?reference="+encodeURIComponent(reference)} className="inline-block rounded-xl border border-[#D4AF37] px-3 py-2 font-bold">استكمال التحويل أو إعادة رفع الإيصال</Link>}
    {order.paymentStatus==="CART_BANK_VERIFIED"&&<a target="_blank" rel="noreferrer" href={"/cart/documents/invoice?reference="+encodeURIComponent(reference)} className="inline-block rounded-xl border border-[#D4AF37] px-3 py-2 font-bold">عرض مستند السداد</a>}
    {order.status==="DOCUMENTS_REQUESTED"&&<div className="rounded-xl border border-[#D4AF37] p-3"><b>مستندات إضافية مطلوبة</b><input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="my-3 block max-w-full" onChange={e=>setFile(e.target.files?.[0]||null)}/><button disabled={!file||busy} onClick={()=>void upload()} className="rounded-xl bg-[#0D3B34] px-4 py-2 text-white disabled:opacity-50">رفع المستند</button></div>}
    {order.documents.length>0&&<section className="rounded-xl bg-[#FBF7ED] p-3"><b>مرفقات الطلب</b>{order.documents.map(d=><div key={d.id} className="mt-2 flex flex-wrap justify-between gap-2 border-b border-[#D4AF37]/20 py-2"><span>{String(d.name||"ملف")} ({d.from==="ADMIN"?"أريس":"العميل"})</span><div className="flex gap-3"><a target="_blank" rel="noreferrer" className="underline" href={"/api/cart/order-documents?reference="+encodeURIComponent(reference)+"&document="+encodeURIComponent(d.id)+"&inline=true"}>معاينة</a><a className="underline" href={"/api/cart/order-documents?reference="+encodeURIComponent(reference)+"&document="+encodeURIComponent(d.id)}>تنزيل</a></div></div>)}</section>}
    <section className="rounded-xl bg-[#F8F6F0] p-3"><h3 className="font-black">المراسلات مع إدارة أريس</h3><div className="mt-3 max-h-52 space-y-2 overflow-auto">{order.messages.length?order.messages.map(m=><div key={m.id} className="rounded-lg bg-white p-3"><b>{m.from==="ADMIN"?"إدارة أريس":"أنت"}</b><p className="mt-2 whitespace-pre-wrap">{String(m.text)}</p><small className="text-[#79877B]">{new Date(m.createdAt).toLocaleString("ar-SA")}</small></div>):<p className="text-[#6F7B70]">لا توجد مراسلات بعد.</p>}</div><textarea aria-label="الرد على الإدارة" rows={3} maxLength={1500} className="mt-3 w-full rounded-lg border p-3" value={message} onChange={e=>setMessage(e.target.value)} placeholder="اكتب استفسارك أو رسالتك هنا..."/><button disabled={busy||message.trim().length<2} onClick={()=>void send()} className="mt-2 rounded-xl bg-[#0D3B34] px-4 py-2 text-white disabled:opacity-50">إرسال الرسالة</button></section>
   </>}
 </div>;
}
