"use client";
import {useEffect,useState} from "react";
type Renewal={id:string;applicationId:string;licenseNumber:string;requestedExpiryDate:string;createdAt:string;aiReview?:{outcome:string;summary:string;issues?:string[]}|null};
export default function GuideRenewalsAdmin(){
 const [items,setItems]=useState<Renewal[]>([]),[message,setMessage]=useState("");
 async function load(){const r=await fetch("/api/admin/guide-license-renewals",{cache:"no-store"});const d=await r.json();if(r.ok)setItems(d.requests||[]);else setMessage("تعذر تحميل الطلبات")}
 useEffect(()=>{let active=true;fetch("/api/admin/guide-license-renewals",{cache:"no-store"}).then(async r=>{const d=await r.json();if(!active)return;if(r.ok)setItems(d.requests||[]);else setMessage("تعذر تحميل الطلبات")}).catch(()=>{if(active)setMessage("تعذر تحميل الطلبات")});return ()=>{active=false};},[]);
 async function decide(id:string,approved:boolean){
 const notes=window.prompt("أدخل ملاحظات فحص الترخيص (20 حرفاً على الأقل)");
 if(!notes||notes.trim().length<20||(approved&&!window.confirm("هل تحققت من صحة الترخيص لدى الجهة المختصة؟")))return;
 const r=await fetch("/api/admin/guide-license-renewals",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,approved,notes,verifiedLicense:approved})});
 const d=await r.json();setMessage(d.message||"تعذر المراجعة");if(r.ok)await load();
 }
 return <main dir="rtl" className="mx-auto min-h-screen max-w-5xl px-5 pt-36"><h1 className="text-3xl font-black">تجديد تراخيص المرشدين</h1><p className="mt-3 text-sm">افحص مستند التجديد لدى الجهة المختصة قبل اتخاذ القرار.</p>{message&&<p role="status">{message}</p>}{items.map(x=><article key={x.id} className="mt-5 rounded-xl border bg-white p-5"><p>رقم الترخيص: {x.licenseNumber}</p><p>الانتهاء الجديد: {new Date(x.requestedExpiryDate).toLocaleDateString("ar-SA")}</p>{x.aiReview&&<section className="mt-3 text-sm"><strong>نتيجة الذكاء الاصطناعي: {x.aiReview.outcome}</strong><p>{x.aiReview.summary}</p>{x.aiReview.issues?.map((issue,i)=><p key={i}>{issue}</p>)}</section>}<a target="_blank" rel="noopener noreferrer" className="underline" href={`/api/admin/guide-license-renewals/document?id=${encodeURIComponent(x.id)}`}>فحص المستند</a><div className="mt-3 flex gap-3"><button className="rounded-lg bg-green-700 p-3 text-white" onClick={()=>void decide(x.id,true)}>اعتماد</button><button className="rounded-lg bg-red-700 p-3 text-white" onClick={()=>void decide(x.id,false)}>رفض</button></div></article>)}</main>;
}
