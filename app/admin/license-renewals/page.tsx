"use client";
import {useEffect,useState} from "react";
type Renewal={id:string;licenseId:string;partnerId:string;requestedExpiryDate:string;status:string;createdAt:string;aiReview?:{outcome:string;summary:string;issues?:string[]}|null};
export default function AdminLicenseRenewals(){
 const [items,setItems]=useState<Renewal[]>([]),[message,setMessage]=useState("");
 async function load(){const r=await fetch("/api/admin/license-renewals",{cache:"no-store"});const d=await r.json();if(r.ok)setItems(d.requests||[]);else setMessage("غير مصرح أو تعذر تحميل الطلبات")}
 useEffect(()=>{let active=true;fetch("/api/admin/license-renewals",{cache:"no-store"}).then(async r=>{const d=await r.json();if(!active)return;if(r.ok)setItems(d.requests||[]);else setMessage("غير مصرح أو تعذر تحميل الطلبات")}).catch(()=>{if(active)setMessage("غير مصرح أو تعذر تحميل الطلبات")});return ()=>{active=false};},[]);
 async function decide(id:string,approved:boolean){
 const notes=window.prompt("سجل نتيجة التحقق من الترخيص والجهة المصدرة (20 حرفاً على الأقل)");
 if(!notes||notes.trim().length<20)return;
 if(approved&&!window.confirm("هل تحققت من صحة المستند وتاريخ انتهاء الترخيص؟"))return;
 const r=await fetch("/api/admin/license-renewals",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,approved,notes,verifiedDocument:approved})});
 const d=await r.json();setMessage((d.message||"تعذر تسجيل القرار")+(r.ok&&!d.applicantEmailSent?" — تنبيه: تعذر إرسال بريد الشريك.":""));if(r.ok)await load();
 }
 return <main dir="rtl" className="mx-auto min-h-screen max-w-5xl px-5 pt-36 text-[#0D3B34]"><h1 className="text-3xl font-black">تجديد تراخيص الشركاء</h1><p className="mt-3 text-sm">يجب مراجعة المستند والتحقق من الجهة المصدرة قبل الاعتماد.</p>{message&&<p role="status" className="mt-4">{message}</p>}{items.map(x=><article key={x.id} className="mt-5 rounded-2xl border bg-white p-5"><h2 className="font-bold">طلب تجديد الترخيص {x.licenseId}</h2><p className="mt-2 text-sm">تاريخ الانتهاء الجديد: {new Date(x.requestedExpiryDate).toLocaleDateString("ar-SA")}</p>{x.aiReview&&<section className="mt-3 text-sm"><strong>نتيجة الذكاء الاصطناعي: {x.aiReview.outcome}</strong><p>{x.aiReview.summary}</p>{x.aiReview.issues?.map((issue,i)=><p key={i}>{issue}</p>)}</section>}<a className="mt-3 inline-block underline" target="_blank" rel="noopener noreferrer" href={`/api/admin/license-renewals/document?id=${encodeURIComponent(x.id)}`}>عرض مستند التجديد</a><div className="mt-4 flex gap-3"><button className="rounded-lg bg-[#0D3B34] px-4 py-2 text-white" onClick={()=>void decide(x.id,true)}>اعتماد بعد التحقق</button><button className="rounded-lg bg-red-50 px-4 py-2 text-red-700" onClick={()=>void decide(x.id,false)}>رفض</button></div></article>)}</main>;
}
