"use client";
import {useCallback,useEffect,useState} from "react";
import BankReceiptPreview from "@/app/components/BankReceiptPreview";
import LicenseDocumentPreview from "@/app/components/LicenseDocumentPreview";
type Order={reference:string;customerName:string;customerEmail:string|null;phone:string;status:string;priceSar:number;amountSar:number;
 bankReference:string|null;bankStatus:string|null;bankVerified:boolean;hasVoucher:boolean;notes:string;deliveryAddress:string;deliveryLink:string;
 trackingNumber:string;trackingUrl:string;
 eyeColor:string;height:string;emailStatus:string;createdAt:string;history:{action:string;status:string;notes:string;createdAt:string}[]};
const names:Record<string,string>={NEW:"جديد / بانتظار السداد",PAID:"تم السداد",EXECUTING:"تحت التنفيذ",DONE:"تم التنفيذ",SHIPPING:"تحت التوصيل",DELIVERED:"تم التوصيل",CANCELED:"ملغي",
 CART_BANK_CREATED:"بانتظار الحوالة",CART_BANK_RECEIPT_SUBMITTED:"إيصال يحتاج مراجعة",CART_BANK_VERIFIED:"تحويل معتمد",CART_BANK_REJECTED:"إيصال مرفوض"};
const field="w-full rounded-xl border border-[#D4AF37]/40 bg-white px-3 py-3 text-sm outline-[#C19845]";
export default function LicenseCartOrderDetail({reference,onClose,onChange}:{reference:string;onClose:()=>void;onChange:()=>void}){
 const [order,setOrder]=useState<Order|null>(null),[error,setError]=useState(""),[notice,setNotice]=useState(""),[loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false),[selectedStatus,setSelectedStatus]=useState(""),[notes,setNotes]=useState("");
 const [file,setFile]=useState<File|null>(null);
 const [trackingNumber,setTrackingNumber]=useState(""),[trackingUrl,setTrackingUrl]=useState("");
 const [customerMessage,setCustomerMessage]=useState("");
 const [edit,setEdit]=useState({name:"",phone:"",height:"",eyeColor:"",deliveryAddress:"",deliveryLink:""});
 const load=useCallback(async()=>{
  try{
   const r=await fetch("/api/admin/license-cart-workflow?reference="+encodeURIComponent(reference),{credentials:"include",cache:"no-store"});
   const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر تحميل الطلب.");
   setOrder(d.order);setSelectedStatus(d.order.status);setNotes(d.order.notes||"");
   setTrackingNumber(d.order.trackingNumber||"");setTrackingUrl(d.order.trackingUrl||"");
   setEdit({name:d.order.customerName||"",phone:d.order.phone||"",height:d.order.height||"",
    eyeColor:d.order.eyeColor||"",deliveryAddress:d.order.deliveryAddress||"",deliveryLink:d.order.deliveryLink||""});setError("");
  }catch(e){setError(e instanceof Error?e.message:"تعذر تحميل الطلب.")}
  finally{setLoading(false)}
 },[reference]);
 useEffect(()=>{void Promise.resolve().then(load)},[load]);
 async function change(action:"STATUS"|"NOTES",status?:string){
  if(!order||busy)return;
  setBusy(true);setError("");setNotice("");
  try{
   const r=await fetch("/api/admin/license-cart-workflow",{method:"PATCH",credentials:"include",
    headers:{"Content-Type":"application/json"},body:JSON.stringify({reference,action,status,notes})});
   const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر تحديث الطلب.");
   setNotice(d.message);await load();onChange();
  }catch(e){setError(e instanceof Error?e.message:"تعذر تحديث الطلب.")}finally{setBusy(false)}
 }
 async function decide(decision:"VERIFY"|"REJECT"){
  if(!order?.bankReference||busy)return;
  if(decision==="VERIFY"&&!window.confirm("هل راجعت كشف البنك وتأكدت فعلياً من وصول المبلغ؟ رفع الإيصال وحده غير كافٍ."))return;
  setBusy(true);setError("");setNotice("");
  try{
   const r=await fetch("/api/admin/cart-bank-payments",{method:"POST",credentials:"include",
    headers:{"Content-Type":"application/json"},body:JSON.stringify({reference:order.bankReference,decision})});
   const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر مراجعة الإيصال.");
   setNotice(d.message);await load();onChange();
  }catch(e){setError(e instanceof Error?e.message:"تعذر مراجعة الإيصال.")}finally{setBusy(false)}
 }
 async function saveDetails(){
  if(!order||busy||order.bankVerified)return;
  setBusy(true);setError("");setNotice("");
  try{
   const r=await fetch("/api/admin/license-cart-workflow",{method:"PATCH",credentials:"include",
    headers:{"Content-Type":"application/json"},body:JSON.stringify({reference,action:"DETAILS",details:edit})});
   const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر حفظ بيانات الطلب.");
   setNotice(d.message);await load();onChange();
  }catch(e){setError(e instanceof Error?e.message:"تعذر تعديل بيانات الطلب.")}
  finally{setBusy(false)}
 }
 async function saveTracking(){
  if(!order||busy)return;
  setBusy(true);setError("");setNotice("");
  try{
   const r=await fetch("/api/admin/license-cart-workflow",{method:"PATCH",credentials:"include",
    headers:{"Content-Type":"application/json"},body:JSON.stringify({reference,action:"DELIVERY",trackingNumber,trackingUrl})});
   const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر حفظ معلومات التوصيل.");
   setNotice(d.message);await load();onChange();
  }catch(e){setError(e instanceof Error?e.message:"تعذر الحفظ.")}finally{setBusy(false)}
 }
 async function sendCustomerNote(){
  if(!order||busy||customerMessage.trim().length<5)return;
  if(!window.confirm("إرسال الملاحظة للعميل وحفظها في طلباته؟"))return;
  setBusy(true);setError("");setNotice("");
  try{
   const r=await fetch("/api/admin/license-cart-workflow",{method:"PATCH",credentials:"include",
    headers:{"Content-Type":"application/json"},body:JSON.stringify({reference,action:"CUSTOMER_MESSAGE",message:customerMessage})});
   const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر إرسال الملاحظة.");
   setNotice(d.message);setCustomerMessage("");await load();onChange();
  }catch(e){setError(e instanceof Error?e.message:"تعذر الإرسال.")}finally{setBusy(false)}
 }
 async function upload(){
  if(!order?.bankReference||!file||busy)return;
  setBusy(true);setError("");setNotice("");
  try{
   const data=new FormData();data.set("reference",order.bankReference);data.set("file",file);
   const r=await fetch("/api/cart/service-voucher",{method:"POST",body:data,credentials:"include"});
   const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر رفع الملف.");
   setNotice(d.message);setFile(null);await load();onChange();
  }catch(e){setError(e instanceof Error?e.message:"تعذر رفع الملف.")}finally{setBusy(false)}
 }
 const actions=order?.status==="NEW"?(order.bankReference?["NEW"]:["NEW","CANCELED"]):order?.status==="PAID"?["PAID","EXECUTING"]:order?.status==="EXECUTING"?["EXECUTING","DONE"]:order?.status==="DONE"?["DONE","SHIPPING"]:order?.status==="SHIPPING"?["SHIPPING","DELIVERED"]:[order?.status||"NEW"];
 return <section dir="rtl" className="space-y-5">
  <button type="button" onClick={onClose} className="rounded-xl border border-[#D4AF37] px-4 py-2 text-sm font-bold">← العودة لقائمة الطلبات</button>
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
  {notice&&<p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
  {loading&&!order?<p>جارٍ تحميل تفاصيل الطلب...</p>:order&&<>
   <header className="flex flex-wrap items-center justify-between gap-3">
    <div><h2 className="text-2xl font-black">طلب رخصة القيادة الدولية</h2>
     <p dir="ltr" className="mt-1 break-all text-right font-mono text-sm">{order.reference}</p>
    </div>
    <div className="flex flex-wrap items-center gap-2"><span className={"rounded-full px-4 py-2 text-xs font-black "+(order.status==="DONE"?"bg-emerald-100 text-emerald-900":order.status==="EXECUTING"?"bg-sky-100 text-sky-900":order.status==="PAID"?"bg-amber-100 text-amber-900":"bg-[#EEEDE7]")}>{names[order.status]||order.status}</span>
     <span className="rounded-xl bg-[#F6EDD2] px-4 py-2 text-sm font-black">{order.amountSar.toLocaleString("ar-SA")} ر.س</span></div>
   </header>
   <div className="grid gap-3 rounded-2xl bg-[#F7F4EB] p-5 text-sm sm:grid-cols-2">
    <p>العميل: <b>{order.customerName}</b></p>
    <p>رقم التواصل: <b dir="ltr">{order.phone}</b></p>
    <p>البريد: <b dir="ltr">{order.customerEmail||"غير متوفر"}</b></p>
    <p>تاريخ الطلب: <b>{new Date(order.createdAt).toLocaleString("ar-SA")}</b></p>
    <p>سعر الخدمة المعلن: <b>{order.priceSar.toLocaleString("ar-SA")} ر.س</b></p>
    <p>الإجمالي المطلوب بعد الخصم: <b>{order.amountSar.toLocaleString("ar-SA")} ر.س</b></p>
    <p>الطول: <b>{order.height||"غير محفوظ بالطلب القديم"}</b></p>
    <p>لون العين: <b>{order.eyeColor||"غير محفوظ بالطلب القديم"}</b></p>
    <p className="sm:col-span-2">عنوان التوصيل: <b>{order.deliveryAddress||"غير محفوظ بالطلب القديم"}</b></p>
    {order.deliveryLink?.startsWith("https://")&&<a className="text-xs font-bold underline sm:col-span-2" href={order.deliveryLink} target="_blank" rel="noopener noreferrer">فتح موقع التوصيل ↗</a>}
    <p className="sm:col-span-2">حالة إشعار البريد: <b>{order.emailStatus==="LICENSE_CART_EMAIL_SENT"?"تم قبول الإرسال":order.emailStatus==="LICENSE_CART_EMAIL_FAILED"?"فشل الإرسال":"لم يتم التأكد"}</b></p>
   </div>
   <section className="rounded-2xl border border-[#D4AF37]/35 p-5">
    <h3 className="text-base font-black">تعديل بيانات طلب العميل</h3>
    <p className="mt-2 text-xs text-[#66766A]">تُحفظ التعديلات كسجل إضافي ولا تمس المستندات الأصلية. يتوقف تعديل بيانات الهوية والتواصل بعد اعتماد السداد.</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
     {([{key:"name",title:"اسم العميل"},{key:"phone",title:"رقم الهاتف"},{key:"height",title:"الطول"},{key:"eyeColor",title:"لون العين"},{key:"deliveryAddress",title:"عنوان التوصيل"},{key:"deliveryLink",title:"رابط موقع التوصيل"}] as const).map(v=>
      <label key={v.key} className="text-xs font-bold">{v.title}<input disabled={busy||order.bankVerified}
       className={field+" mt-2 disabled:bg-[#F2F2EF]"} value={edit[v.key]} onChange={e=>setEdit(x=>({...x,[v.key]:e.target.value}))}/></label>
     )}
    </div>
    <button type="button" disabled={busy||order.bankVerified} onClick={()=>void saveDetails()} className="mt-4 rounded-xl bg-[#0D3B34] px-4 py-3 text-xs font-bold text-white disabled:opacity-40">حفظ تعديل بيانات الطلب</button>
   </section>
   <LicenseDocumentPreview reference={reference}/>
   <section className="rounded-2xl border border-[#D4AF37]/35 p-5">
    <h3 className="text-base font-black">ملاحظة إلى العميل</h3>
    <p className="mt-2 text-xs text-[#66766A]">تظهر الملاحظة في «طلباتي» للعميل، وتُرسل إلى بريده إذا كانت خدمة البريد متاحة. لا تشارك صور الهوية أو تفاصيل الملاحظات الداخلية.</p>
    <textarea aria-label="ملاحظة للعميل" rows={4} maxLength={2000} value={customerMessage} onChange={e=>setCustomerMessage(e.target.value)}
     placeholder="مثال: الصورة الشخصية غير واضحة، يرجى التواصل معنا لتحديثها." className={field+" mt-3"}/>
    <button type="button" disabled={busy||customerMessage.trim().length<5} onClick={()=>void sendCustomerNote()}
     className="mt-3 rounded-xl bg-[#0D3B34] px-4 py-3 text-xs font-bold text-white disabled:opacity-40">إرسال الملاحظة إلى العميل</button>
   </section>
   <div className="rounded-2xl border border-[#D4AF37]/35 p-5">
    <h3 className="text-base font-black">دورة الطلب</h3>
    <div className="mt-3 flex flex-wrap gap-2">{(["NEW","PAID","EXECUTING","DONE","SHIPPING","DELIVERED"] as const).map(st=><span key={st} className={"rounded-full border px-3 py-2 text-xs font-bold "+(order.status===st?"border-[#B89439] bg-[#FFF1C9]":st==="DONE"?"border-emerald-200":"border-[#E3DAC4]")}>{names[st]}</span>)}</div>
    <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
     <label className="text-xs font-bold">تغيير حالة الطلب<select aria-label="حالة الطلب" className={field+" mt-2"} value={selectedStatus} onChange={e=>setSelectedStatus(e.target.value)}>{actions.map(a=><option key={a} value={a}>{names[a]||a}</option>)}</select></label>
     <button disabled={busy||selectedStatus===order.status} onClick={()=>void change("STATUS",selectedStatus)} className="self-end rounded-xl bg-[#0D3B34] px-4 py-3 text-xs font-bold text-white disabled:opacity-40">حفظ الحالة</button>
    </div>
    {!order.bankVerified&&<p className="mt-3 text-xs leading-7 text-amber-800">يُعرض «تم السداد» تلقائياً بعد مراجعة إثبات التحويل وكشف البنك. لا يمكن اعتماده يدوياً دون التحقق المالي.</p>}
    <label className="mt-4 block text-xs font-bold">ملاحظات الإدارة الداخلية<textarea className={field+" mt-2"} rows={3} maxLength={2500} value={notes} onChange={e=>setNotes(e.target.value)}/></label>
    <button disabled={busy||notes===order.notes} onClick={()=>void change("NOTES")} className="mt-3 rounded-xl border border-[#B89439] px-4 py-2 text-xs font-bold disabled:opacity-40">حفظ الملاحظات</button>
   </div>
   {order.bankVerified&&["DONE","SHIPPING","DELIVERED"].includes(order.status)&&<section className="rounded-2xl border border-[#D4AF37]/35 p-5">
    <h3 className="text-base font-black">التوصيل وتتبع الشحنة</h3>
    <p className="mt-2 text-xs">احفظ بيانات الشحنة قبل تغيير الحالة إلى «تحت التوصيل». سيظهر رقم التتبع والرابط للعميل في «طلباتي».</p>
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
     <label className="text-xs font-bold">رقم التتبع
      <input value={trackingNumber} maxLength={80} onChange={e=>setTrackingNumber(e.target.value)} className={field+" mt-2"} placeholder="رقم بوليصة الشحن" /></label>
     <label className="text-xs font-bold">رابط التتبع HTTPS
      <input value={trackingUrl} maxLength={700} onChange={e=>setTrackingUrl(e.target.value)} className={field+" mt-2"} placeholder="https://..." /></label>
    </div>
    <button type="button" disabled={busy||trackingNumber.trim().length<4||!trackingUrl.startsWith("https://")}
     onClick={()=>void saveTracking()} className="mt-3 rounded-xl border border-[#B89439] px-4 py-2 text-xs font-bold disabled:opacity-40">حفظ بيانات التوصيل</button>
   </section>}
   <div className="rounded-2xl border border-[#D4AF37]/35 p-5">
    <h3 className="text-base font-black">التحويل البنكي والمستندات PDF</h3>
    {order.bankReference?<div className="mt-3 space-y-3 text-sm">
     <p>مرجع الحوالة: <b dir="ltr">{order.bankReference}</b></p>
     <p>حالة التحويل: <b>{names[order.bankStatus||""]||order.bankStatus||"لم يبدأ السداد"}</b></p>
     <div className="flex flex-wrap gap-2">
      {order.bankStatus==="CART_BANK_RECEIPT_SUBMITTED"&&<>
       <BankReceiptPreview reference={order.bankReference}/>
       <button disabled={busy} onClick={()=>void decide("VERIFY")} className="rounded-xl bg-[#0D3B34] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">اعتماد وصول المبلغ</button>
       <button disabled={busy} onClick={()=>void decide("REJECT")} className="rounded-xl border border-red-300 px-4 py-2 text-xs font-bold text-red-800 disabled:opacity-40">رفض الإيصال</button>
      </>}
      {order.bankVerified&&<a target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[#D4AF37] px-4 py-2 text-xs font-bold" href={"/cart/documents/invoice?reference="+encodeURIComponent(order.bankReference)}>الفاتورة / Invoice · PDF</a>}
      {order.hasVoucher&&<a href={"/api/cart/service-voucher?download=true&reference="+encodeURIComponent(order.bankReference)} className="rounded-xl border border-[#D4AF37] px-4 py-2 text-xs font-bold">ملف الخدمة / الفاوتشر PDF</a>}
     </div>
     {order.bankVerified&&<div className="rounded-xl bg-[#F8F5EB] p-4">
      <label className="text-xs font-bold">إرفاق ملف الرخصة النهائي أو الفاوتشر (PDF أو صورة حتى 4 ميجابايت)<input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="mt-2 block max-w-full text-xs" onChange={e=>setFile(e.target.files?.[0]||null)}/></label>
      <button disabled={!file||busy||file.size>4*1024*1024} onClick={()=>void upload()} className="mt-3 rounded-xl bg-[#0D3B34] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">رفع الملف وإتاحته للعميل</button>
     </div>}
    </div>:<p className="mt-2 text-sm text-[#6E7A72]">العميل لم ينشئ مرجع تحويل بعد؛ الطلب مسجل وينتظر سداداً.</p>}
   </div>
   <div className="rounded-2xl border border-[#D4AF37]/35 p-5"><h3 className="text-base font-black">سجل مراحل الطلب</h3>
    {order.history.length===0?<p className="mt-3 text-xs">الطلب جديد ولا توجد تعديلات يدوية.</p>:
     <div className="mt-3 space-y-2">{order.history.map((x,i)=><div key={i} className="rounded-lg bg-[#F8F5EB] p-3 text-xs"><b>{x.action==="NOTES_UPDATED"?"تعديل الملاحظات":x.action==="DETAILS_UPDATED"?"تعديل بيانات الطلب":"تغيير حالة الطلب"}</b> · {names[x.status]||x.status}<p className="mt-1">{new Date(x.createdAt).toLocaleString("ar-SA")}</p></div>)}</div>}
   </div>
  </>}
 </section>;
}
