"use client";
import {useEffect,useState} from "react";
type CartItem={serviceId:string;quantity:number;itemType?:"DRIVING_LICENSE";application?:Record<string,unknown>};
type Bank={id:string;bankName:string;beneficiaryName:string;iban:string;note:string};
type Order={reference:string;amountSar:number;bankAccountId:string;status:string;licenseRequestReference?:string};
type Props={items:CartItem[];couponCode:string;total:number;pointsDiscount:number};
export default function CartBankCheckout({items,couponCode,total,pointsDiscount}:Props){
 // Bank transfer is the only live checkout method until a verified payment gateway is configured.
 const [banks,setBanks]=useState<Bank[]>([]);
 const [bankId,setBankId]=useState("");
 const [order,setOrder]=useState<Order|null>(null);
 const rawLicenseRequestReference=items.find(item=>item.itemType==="DRIVING_LICENSE")?.application?.requestReference;
 const licenseRequestReference=typeof rawLicenseRequestReference==="string"?rawLicenseRequestReference:"";
 const [file,setFile]=useState<File|null>(null);
 const [voucherAvailable,setVoucherAvailable]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 useEffect(()=>{
  let alive=true;
  fetch("/api/cart/bank-checkout",{credentials:"include",cache:"no-store"}).then(async r=>{
   const d=await r.json();if(!r.ok)throw Error(d.message||"تعذر تحميل الحسابات.");
   if(alive){setBanks(d.banks||[]);setBankId((d.banks||[])[0]?.id||"");}
  }).catch(e=>{if(alive)setError(e instanceof Error?e.message:"تعذر تحميل الحسابات.");});
  return()=>{alive=false;};
 },[]);
 useEffect(()=>{
  const reference=new URLSearchParams(window.location.search).get("reference")||localStorage.getItem("arees-loop-cart-bank-reference");
  if(!reference)return;
  let alive=true;
  fetch("/api/cart/bank-checkout?reference="+encodeURIComponent(reference),{cache:"no-store",credentials:"include"}).then(async r=>{
   const d=await r.json();if(!r.ok||!d.success){if(r.status===404||r.status===401)localStorage.removeItem("arees-loop-cart-bank-reference");return;}
   if(alive){setOrder(d.order);setBankId(d.order.bankAccountId);localStorage.setItem("arees-loop-cart-bank-reference",reference);}
  }).catch(()=>{});return()=>{alive=false};
 },[]);
 useEffect(()=>{
  if(!order||order.status!=="CART_BANK_VERIFIED")return;
  fetch("/api/cart/service-voucher?reference="+encodeURIComponent(order.reference),{credentials:"include",cache:"no-store"}).then(async r=>{
   const d=await r.json();if(r.ok&&d.success)setVoucherAvailable(!!d.available);
  }).catch(()=>{});
 },[order]);
 const bank=banks.find(x=>x.id===(order?.bankAccountId||bankId))||null;
 const money=(n:number)=>n.toLocaleString("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2})+" ر.س";
 async function createOrder(){
  setError("");setNotice("");setBusy(true);
  try{
   const r=await fetch("/api/cart/bank-checkout",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"CREATE",items,couponCode,bankAccountId:bankId,expectedTotalSar:total})});
   const d=await r.json();if(!r.ok)throw Error(d.message||"تعذر إنشاء طلب التحويل.");
   setOrder({reference:d.reference,amountSar:Number(d.amountSar),bankAccountId:bankId,status:"AWAITING_TRANSFER",licenseRequestReference:typeof licenseRequestReference==="string"?licenseRequestReference:undefined});
   localStorage.setItem("arees-loop-cart-bank-reference",d.reference);
   setNotice(d.message);
  }catch(e){setError(e instanceof Error?e.message:"تعذر إنشاء الطلب.");}
  finally{setBusy(false);}
 }
 async function submitReceipt(){
  if(!file||!order)return;
  setError("");setNotice("");setBusy(true);
  try{
   const data=new FormData();data.set("reference",order.reference);data.set("bankAccountId",order.bankAccountId);data.set("file",file);
   const r=await fetch("/api/cart/bank-checkout",{method:"POST",body:data,credentials:"include"});
   const d=await r.json();if(!r.ok)throw Error(d.message||"تعذر إرسال الإثبات.");
   setOrder({...order,status:"PENDING_REVIEW"});setFile(null);setNotice(d.message);
  }catch(e){setError(e instanceof Error?e.message:"تعذر رفع الإيصال.");}
  finally{setBusy(false);}
 }
 return <section aria-label="طرق السداد" className="mt-5 rounded-2xl border border-[#D4AF37]/40 bg-[#FFFDF7] p-5 text-[#0D3B34]">
  <h3 className="text-lg font-black">طرق السداد</h3>
  <p className="mt-1 text-xs text-[#66796F]">اختر وسيلة الدفع المناسبة لسلتك.</p>
  <div className="mt-4 space-y-3">
   <div className="rounded-xl border border-[#B9974A] bg-[#FFF2CA] p-4 text-sm">
    <div className="flex flex-wrap items-center gap-2 font-black"><span aria-hidden="true">🏦</span> التحويل البنكي <span className="rounded-full bg-[#0D3B34] px-2 py-0.5 text-[10px] text-white">متاح</span></div>
    <p className="mt-2 text-xs leading-6 text-[#53695C]">أنشئ مرجع الطلب، وحوّل إلى الحساب المعتمد، ثم ارفع الإيصال. لا يُعد المبلغ مستلماً حتى تراجعه الإدارة.</p>
   </div>
   <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="طرق دفع إلكترونية قريباً">
    {["مدى","Visa / Mastercard","Apple Pay","STC Pay","تابي","تمارا"].map(label=>(
      <div key={label} aria-disabled="true" className="rounded-xl border border-[#DED5BE] bg-white px-3 py-2.5 text-center text-xs font-bold text-[#688076] opacity-75">
       <span className="block">{label}</span><span className="mt-1 inline-block rounded-full bg-[#F3E2B0] px-2 py-0.5 text-[10px] text-[#8A6521]">قريباً</span>
      </div>
    ))}
   </div>
   <div className="space-y-3">
   {!order&&banks.length>1&&<label className="block text-sm font-bold">الحساب المعتمد<select className="mt-2 w-full rounded-xl border p-3" value={bankId} onChange={e=>setBankId(e.target.value)}>{banks.map(b=><option key={b.id} value={b.id}>{b.bankName} — {b.iban.slice(-6)}</option>)}</select></label>}
   {bank?<div className="rounded-xl border border-[#D4AF37]/30 bg-white p-4 text-sm leading-8">
    <p className="font-black">البنك: {bank.bankName}</p><p>المستفيد: {bank.beneficiaryName}</p>
    <p dir="ltr" className="break-all text-left font-mono font-bold">{bank.iban}</p>
    <button type="button" onClick={()=>void navigator.clipboard.writeText(bank.iban)} className="mt-1 rounded-lg border px-3 py-1 text-xs">نسخ الآيبان</button>
    {bank.note&&<p className="mt-2 whitespace-pre-wrap rounded-lg bg-[#FFF8E6] px-3 py-2 text-xs">{bank.note}</p>}
   </div>:<p className="rounded-xl border border-[#E6C77C] bg-[#FFF8EA] p-3 text-xs">{error||"لا يوجد حساب بنكي معتمد ظاهر حالياً. يرجى المحاولة لاحقاً."}</p>}
   {order?<div className="space-y-3 rounded-xl border border-[#D4AF37]/30 bg-white p-4">
    {(order.licenseRequestReference||licenseRequestReference)&&<p className="break-all text-sm font-bold">رقم طلب الرخصة: <span dir="ltr" className="block font-mono text-xs">{String(order.licenseRequestReference||licenseRequestReference)}</span></p>}
    <p className="text-sm font-bold">مرجع التحويل: <span dir="ltr">{order.reference}</span></p>
    <p className="font-black">المبلغ المطلوب: {money(order.amountSar)}</p>
    <div className="flex flex-wrap gap-2">
     {order.status==="CART_BANK_VERIFIED"&&<a href={"/cart/documents/invoice?reference="+encodeURIComponent(order.reference)} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[#D4AF37] px-3 py-2 text-xs font-bold">الفاتورة بعد السداد</a>}
     {voucherAvailable&&<a href={"/api/cart/service-voucher?download=true&reference="+encodeURIComponent(order.reference)} className="rounded-lg border border-[#D4AF37] px-3 py-2 text-xs font-bold">تنزيل الفاوتشر / ملف الخدمة</a>}
    </div>
    {order.status==="PENDING_REVIEW"||order.status==="CART_BANK_RECEIPT_SUBMITTED"?<p role="status" className="rounded-lg bg-[#EFF8F0] p-3 text-sm text-[#1B663A]">تم تسجيل الإيصال، والتحويل بانتظار مراجعة الإدارة. لا يعتبر السداد مؤكداً بعد.</p>:order.status==="CART_BANK_VERIFIED"?<p role="status" className="rounded-lg bg-[#EFF8F0] p-3 text-sm text-[#1B663A]">تم التحقق من التحويل بواسطة الإدارة. ستُتابع معالجة الخدمة.</p>:<>
     <label className="block text-xs font-bold">إثبات التحويل (صورة أو PDF)<input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" className="mt-2 block w-full rounded-lg border p-3 text-sm" onChange={e=>setFile(e.target.files?.[0]||null)}/></label>
     <button type="button" disabled={!file||busy} onClick={()=>void submitReceipt()} className="rounded-xl bg-[#0D3B34] px-5 py-3 text-sm font-black text-white disabled:opacity-40">{busy?"جارٍ رفع الإيصال":"إرسال إثبات التحويل للإدارة"}</button>
    </>}
   <button type="button" onClick={()=>{localStorage.removeItem("arees-loop-cart-bank-reference");setOrder(null);setNotice("");setError("");}} className="mt-3 rounded-lg border border-[#D4AF37]/40 px-3 py-2 text-xs font-bold">بدء طلب جديد دون حذف الطلب السابق</button>
   </div>:<div>
    <p className="mb-2 text-sm font-bold">الإجمالي بعد الخصم: {money(total)}</p>
    {pointsDiscount>0&&<p className="mb-2 text-xs text-[#986A19]">استخدام نقاط المكافآت مع التحويل غير مفعل؛ ألغِ خيار النقاط لإكمال السداد البنكي.</p>}
    <button type="button" disabled={busy||!bank||total<=0||pointsDiscount>0} onClick={()=>void createOrder()} className="rounded-xl bg-[#0D3B34] px-5 py-3 text-sm font-black text-white disabled:opacity-40">{busy?"جارٍ تسجيل الطلب":"اعتماد الإجمالي وإنشاء مرجع التحويل"}</button>
   </div>}
  </div></div>
  {error&&<p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
  {notice&&<p role="status" className="mt-3 rounded-lg bg-[#EFF8F0] p-3 text-xs text-[#165934]">{notice}</p>}
 </section>;
}
