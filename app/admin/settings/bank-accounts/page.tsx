"use client";
import Link from "next/link";
import {useCallback,useEffect,useState} from "react";

type BankAccount={id:string;bankName:string;beneficiaryName:string;iban:string;active:boolean;note:string};
const field="w-full rounded-xl border border-[#DED5BE] bg-[#FFFEFC] px-4 py-3 text-sm text-[#0D3B34] outline-none transition focus:border-[#B99444] focus:ring-2 focus:ring-[#D4AF37]/20";
export default function BankSettings(){
 const [accounts,setAccounts]=useState<BankAccount[]>([]);
 const [bankName,setBank]=useState(""),[beneficiaryName,setName]=useState(""),[iban,setIban]=useState(""),[newNote,setNewNote]=useState("");
 const [noteOpenId,setNoteOpenId]=useState<string|null>(null),[noteDrafts,setNoteDrafts]=useState<Record<string,string>>({});
 const [message,setMessage]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
 const refresh=useCallback(async()=>{
   try{
     const r=await fetch("/api/admin/bank-accounts",{cache:"no-store",credentials:"include"});
     const d=await r.json();
     if(!r.ok||!d.success)throw Error(d.message||"تعذر تحميل الحسابات البنكية.");
     const received:BankAccount[]=Array.isArray(d.accounts)?d.accounts:[];
     setAccounts(received);
     setNoteDrafts(Object.fromEntries(received.map(account=>[account.id,account.note||""])));
     setError("");
   }catch(e){setError(e instanceof Error?e.message:"تعذر تحميل الحسابات البنكية.");}
   finally{setLoading(false);}
 },[]);
 useEffect(()=>{void refresh()},[refresh]);
 async function save(){
   if(busy)return;setBusy(true);setMessage("");setError("");
   try{
     const r=await fetch("/api/admin/bank-accounts",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({bankName,beneficiaryName,iban,note:newNote})});
     const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر حفظ الحساب.");
     setBank("");setName("");setIban("");setNewNote("");setMessage(d.message||"تم حفظ الحساب غير مفعل.");await refresh();
   }catch(e){setError(e instanceof Error?e.message:"تعذر حفظ الحساب.");}
   finally{setBusy(false);}
 }
 async function setActive(account:BankAccount){
   if(busy)return;
   const intent=account.active?"تعطيل":"تفعيل";
   if(!window.confirm(`هل تريد ${intent} حساب ${account.bankName}؟ ${account.active?"لن يظهر الحساب للعميل بعد التعطيل.":"راجع اسم المستفيد والآيبان قبل إظهاره للعملاء."}`))return;
   setBusy(true);setMessage("");setError("");
   try{
     const r=await fetch("/api/admin/bank-accounts",{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:account.id,active:!account.active})});
     const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر تحديث حالة الحساب.");
     setMessage(`تم ${intent} حساب ${account.bankName} بنجاح.`);await refresh();
   }catch(e){setError(e instanceof Error?e.message:"تعذر تحديث الحساب.");}
   finally{setBusy(false);}
 }
 async function saveNote(account:BankAccount){
   if(busy)return;
   const nextNote=(noteDrafts[account.id]||"").trim();
   if(nextNote.length>1500){setError("الحد الأقصى للملاحظات 1500 حرف.");return;}
   setBusy(true);setError("");setMessage("");
   try{
     const r=await fetch("/api/admin/bank-accounts",{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:account.id,note:nextNote})});
     const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر حفظ الملاحظات.");
     setMessage("تم حفظ ملاحظات "+account.bankName+" بنجاح.");
     await refresh();
     setNoteOpenId(null);
   }catch(e){setError(e instanceof Error?e.message:"تعذر حفظ الملاحظات.");}
   finally{setBusy(false);}
 }
 const enabled=accounts.filter(a=>a.active).length;
 return <main dir="rtl" className="min-h-screen bg-[#FAF8F2] px-4 py-8 text-[#103D34] sm:px-7 lg:px-10">
   <div className="mx-auto max-w-6xl">
     <div className="flex flex-wrap items-start justify-between gap-3">
       <div><p className="text-xs font-extrabold tracking-widest text-[#B18C31]">AREES LOOP • PLATFORM SETTINGS</p><h1 className="mt-2 text-2xl font-black md:text-3xl">الحسابات البنكية</h1><p className="mt-2 max-w-2xl text-sm leading-7 text-[#52665F]">إدارة حسابات التحويل البنكي من لوحة السوبر أدمن. لا يظهر للعميل إلا الحساب المفعّل، بعد قبول عرض السعر.</p></div>
       <Link href="/admin/settings" className="rounded-xl border border-[#D8C9A2] bg-white px-4 py-2.5 text-xs font-bold text-[#786019] transition hover:bg-[#FBF2DC]">← العودة لإعدادات المنصة</Link>
     </div>
     <section className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="ملخص الحسابات البنكية">
       <div className="rounded-2xl border border-[#E6DBC3] bg-white px-5 py-4 shadow-sm"><p className="text-xs text-[#607069]">إجمالي الحسابات</p><p className="mt-2 text-3xl font-black">{loading?"—":accounts.length.toLocaleString("ar-SA")}</p></div>
       <div className="rounded-2xl border border-[#D8EBDD] bg-[#F5FCF7] px-5 py-4 shadow-sm"><p className="text-xs text-[#276F4C]">حسابات نشطة</p><p className="mt-2 text-3xl font-black text-[#176642]">{loading?"—":enabled.toLocaleString("ar-SA")}</p></div>
       <div className="rounded-2xl border border-[#F0DEBE] bg-[#FFF9ED] px-5 py-4 shadow-sm"><p className="text-xs text-[#A57121]">حسابات غير نشطة</p><p className="mt-2 text-3xl font-black text-[#9C6C22]">{loading?"—":(accounts.length-enabled).toLocaleString("ar-SA")}</p></div>
     </section>
     <section className="mt-6 overflow-hidden rounded-[24px] border border-[#E2D5B7] bg-white shadow-[0_12px_32px_rgba(40,61,49,.05)]">
       <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFE6D3] bg-[#FFFCF6] px-5 py-4 sm:px-7"><div><h2 className="text-lg font-black">إضافة حساب بنكي</h2><p className="mt-1 text-xs text-[#66786F]">يُحفظ الحساب الجديد غير نشط حتى تراجع بياناته وتفعّله بنفسك.</p></div><span className="rounded-full bg-[#F5ECD5] px-3 py-1.5 text-xs font-bold text-[#926A1F]">يتطلب اعتماد التفعيل</span></div>
       <form className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7" onSubmit={e=>{e.preventDefault();void save();}}>
         <label className="text-xs font-bold">اسم البنك<input required maxLength={120} value={bankName} onChange={e=>setBank(e.target.value)} placeholder="مثال: مصرف الراجحي" className={field+" mt-2"}/></label>
         <label className="text-xs font-bold">اسم المستفيد<input required maxLength={160} value={beneficiaryName} onChange={e=>setName(e.target.value)} placeholder="اسم صاحب الحساب" className={field+" mt-2"}/></label>
         <label className="text-xs font-bold sm:col-span-2">رقم الآيبان السعودي (IBAN)<input required pattern="SA[0-9]{22}" dir="ltr" maxLength={24} autoComplete="off" value={iban} onChange={e=>setIban(e.target.value.toUpperCase().replace(/\s+/g,""))} placeholder="SA0000000000000000000000" className={field+" mt-2 font-mono tracking-wider"}/></label>
         <label className="text-xs font-bold sm:col-span-2">ملاحظات التحويل للعميل (اختياري)<textarea rows={3} maxLength={1500} value={newNote} onChange={e=>setNewNote(e.target.value)} placeholder="تعليمات التحويل التي تظهر للعميل مع هذا الحساب" className={field+" mt-2 resize-y"}/><span className="mt-1 block font-normal text-[#637168]">لن تظهر الملاحظات إلا مع الحساب النشط وبعد قبول العميل عرض السعر.</span></label>
         <div className="flex justify-end sm:col-span-2"><button type="submit" disabled={busy} className="w-full rounded-xl bg-[#103D34] px-7 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-[#175749] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">{busy?"جارٍ التنفيذ...":"حفظ الحساب غير نشط"}</button></div>
       </form>
     </section>
     {error&&<p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
     {message&&<p role="status" className="mt-5 rounded-xl border border-[#B8D9C4] bg-[#F1FAF4] p-4 text-sm font-bold text-[#176642]">{message}</p>}
     <section className="mt-8" aria-label="قائمة الحسابات البنكية"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">الحسابات المسجلة</h2><p className="mt-1 text-xs text-[#62766C]">بطاقات مستقلة لعرض الحساب وتغيير حالة النشر للعملاء.</p></div><button type="button" disabled={busy||loading} onClick={()=>{setLoading(true);void refresh()}} className="rounded-xl border border-[#D9CBAB] bg-white px-4 py-2.5 text-xs font-bold transition hover:bg-[#FFF9EB] disabled:opacity-50">↻ تحديث الحسابات</button></div>
       {loading?<p className="rounded-xl bg-white p-6 text-sm">جارٍ تحميل الحسابات...</p>:accounts.length===0?<p className="rounded-xl border border-[#E4D8BE] bg-white p-8 text-center text-sm text-[#65746D]">لا توجد حسابات بنكية مسجلة حتى الآن.</p>:
       <div className="space-y-4">{accounts.map(a=><article key={a.id} className="overflow-hidden rounded-[22px] border border-[#E1D8C5] bg-white shadow-[0_8px_25px_rgba(15,59,49,.05)]">
         <div className="flex flex-wrap items-center justify-between gap-4 p-5 md:px-7 md:py-6">
           <div className="flex min-w-0 flex-1 items-center gap-4"><span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F7F0DE] text-2xl text-[#A98329]">▣</span><div className="min-w-0"><h3 className="truncate text-lg font-black">{a.bankName}</h3><p className="mt-1 text-sm text-[#637168]">{a.beneficiaryName}</p></div></div>
           <span className={a.active?"rounded-full border border-[#B7DFC5] bg-[#E9F8EF] px-3 py-2 text-xs font-extrabold text-[#14683C]":"rounded-full border border-[#EAD4AA] bg-[#FFF6E5] px-3 py-2 text-xs font-extrabold text-[#9E6A1C]"}>{a.active?"● نشط — ظاهر للعملاء":"○ غير نشط — غير ظاهر للعملاء"}</span>
         </div>
         <div className="flex flex-col gap-4 border-t border-[#EEE5D4] bg-[#FFFEFB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-7">
           <div className="min-w-0"><p className="text-[11px] font-bold text-[#8B8D7E]">رقم الحساب الدولي (IBAN)</p><p dir="ltr" className="mt-1 break-all text-left font-mono text-sm font-bold tracking-wide text-[#244C40]">{a.iban}</p></div>
           <div className="flex shrink-0 flex-wrap items-center gap-2"><button type="button" aria-expanded={noteOpenId===a.id} onClick={()=>{setNoteOpenId(current=>current===a.id?null:a.id);setNoteDrafts(current=>({...current,[a.id]:a.note||""}));}} className="rounded-xl border border-[#D8C9A2] bg-white px-5 py-3 text-xs font-black text-[#87631D] transition hover:bg-[#FFF8E8]">📝 ملاحظات {a.note?"• محفوظة":""}</button><button type="button" disabled={busy} onClick={()=>void setActive(a)} className={a.active?"rounded-xl border border-[#EAC6B8] bg-[#FFF4EF] px-5 py-3 text-xs font-black text-[#A84B32] transition hover:bg-[#FFE6DD] disabled:opacity-50":"rounded-xl border border-[#B8DCC7] bg-[#147450] px-5 py-3 text-xs font-black text-white transition hover:bg-[#0F5C3E] disabled:opacity-50"}>{busy?"جارٍ التنفيذ...":a.active?"تعطيل الحساب":"تفعيل الحساب"}</button></div>
         </div>
         {noteOpenId===a.id&&<div className="border-t border-[#E6DCC8] bg-[#FBF9F3] px-5 py-5 md:px-7" aria-label={"ملاحظات حساب "+a.bankName}>
           <label className="block text-sm font-bold text-[#103D34]">ملاحظات التحويل للعميل
             <textarea rows={3} maxLength={1500} className={field+" mt-2 resize-y"} value={noteDrafts[a.id]||""} onChange={e=>setNoteDrafts(drafts=>({...drafts,[a.id]:e.target.value}))} placeholder="اكتب ملاحظات التحويل الخاصة بهذا الحساب..."/>
           </label>
           <p className="mt-2 text-xs text-[#637168]">الملاحظات تظهر للعميل مع بيانات الحساب النشط عند قبول العرض. يمكن تعديلها أو إفراغها وحفظها في أي وقت.</p>
           <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-[#8C816B]">{(noteDrafts[a.id]||"").length} / 1500</span><div className="flex gap-2"><button type="button" onClick={()=>setNoteOpenId(null)} className="rounded-xl border border-[#D8C9A2] bg-white px-4 py-2.5 text-xs font-bold">إغلاق</button><button type="button" disabled={busy||(noteDrafts[a.id]||"")===(a.note||"")} onClick={()=>void saveNote(a)} className="rounded-xl bg-[#103D34] px-5 py-2.5 text-xs font-black text-white disabled:opacity-45">{busy?"جارٍ الحفظ...":"حفظ الملاحظات"}</button></div></div>
         </div>}
       </article>)}</div>}
     </section>
   </div>
 </main>;
}
