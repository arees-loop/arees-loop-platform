"use client";

import Link from "next/link";
import { useCallback,useEffect,useState,type FormEvent } from "react";

type HotelCase={
 id:string;reference:string;customerName:string;customerEmail:string|null;
 countryCode:string;phone:string;destination:string;hotelName:string|null;
 checkInDate:string;checkOutDate:string;rooms:number;adults:number;children:number;notes:string|null;
 status:string;assignedToId:string|null;customerReply:string|null;quoteAmountSar:number|null;
 quoteNotes:string|null;notificationStatus:string;createdAt:string;
};
type Staff={id:string;firstName:string|null;lastName:string|null;email:string};
type Offer={id:string;title:string;destination:string|null;hotelName:string|null;description:string|null;
 amountSar:number|null;priceUnit:string|null;bannerUrl:string|null;startsAt:string|null;endsAt:string|null;isVisible:boolean;sortOrder:number};
type Event={id:string;actorName:string;action:string;fromStatus:string|null;toStatus:string|null;createdAt:string};
const stages:Record<string,string>={NEW:"جديد",PROCESSING:"تحت المعالجة",QUOTE_READY:"عرض السعر جاهز",QUOTE_SENT:"تم إرسال العرض",PAID:"تم السداد",EXECUTING:"تحت التنفيذ",DONE:"تم التنفيذ",CANCELED:"ملغى"};
const next:Record<string,string[]>={NEW:["PROCESSING","CANCELED"],PROCESSING:["CANCELED"],QUOTE_READY:["QUOTE_SENT","PROCESSING","CANCELED"],QUOTE_SENT:["PAID","PROCESSING","CANCELED"],PAID:["EXECUTING","CANCELED"],EXECUTING:["DONE","CANCELED"],DONE:[],CANCELED:[]};
const blank={id:"",title:"",destination:"",hotelName:"",description:"",amountSar:"",priceUnit:"لليلة",bannerUrl:"",startsAt:"",endsAt:"",isVisible:false,sortOrder:0};
type Form=typeof blank;
const field="w-full rounded-xl border border-[#D4AF37]/40 bg-[#FFFCF5] px-4 py-3 text-sm outline-[#B69034]";
const day=(v:string|null)=>v?new Date(v).toISOString().slice(0,10):"";

export default function HotelAdminPage(){
 const [tab,setTab]=useState<"requests"|"offers">("requests");
 const [rows,setRows]=useState<HotelCase[]>([]);
 const [offers,setOffers]=useState<Offer[]>([]);
 const [staff,setStaff]=useState<Staff[]>([]);
 const [admin,setAdmin]=useState(false);
 const [selected,setSelected]=useState<HotelCase|null>(null);
 const [events,setEvents]=useState<Event[]>([]);
 const [reply,setReply]=useState("");
 const [amount,setAmount]=useState("");
 const [quoteNotes,setQuoteNotes]=useState("");
 const [cancelReason,setCancelReason]=useState("");
 const [edit,setEdit]=useState<Form>({...blank});
 const [banner,setBanner]=useState<File|null>(null);
 const [bannerDimensions,setBannerDimensions]=useState<{width:number;height:number}|null>(null);
 const [preview,setPreview]=useState("");
 const [view,setView]=useState<"cards"|"list">("cards");
 const [filter,setFilter]=useState<"ALL"|"ACTIVE"|"PAUSED">("ALL");
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const load=useCallback(async()=>{
   setLoading(true);
   try{
     const a=await fetch("/api/admin/hotels",{cache:"no-store"});
     const data=await a.json();
     if(!a.ok||!data.success){setError(data.message||"تعذر تحميل طلبات الفنادق.");return;}
     setRows(data.data||[]);
     const b=await fetch("/api/admin/hotels?mode=offers",{cache:"no-store"});
     const list=await b.json();if(b.ok&&list.success)setOffers(list.data||[]);
     setError("");
   }catch{setError("تعذر الاتصال ببيانات الفنادق.");}
   finally{setLoading(false);}
 },[]);
 useEffect(()=>{void load();
   void fetch("/api/admin/me",{cache:"no-store"}).then(r=>r.json()).then(x=>{if(x.success&&x.data.role==="SUPER_ADMIN")setAdmin(true);}).catch(()=>{});
   void fetch("/api/admin/hotels?mode=staff",{cache:"no-store"}).then(r=>r.json()).then(x=>{if(x.success)setStaff(x.data||[]);}).catch(()=>{});
 },[load]);
 useEffect(()=>{if(!banner){setPreview("");return;}const url=URL.createObjectURL(banner);setPreview(url);return()=>URL.revokeObjectURL(url);},[banner]);
 async function history(id:string){
   const r=await fetch("/api/admin/hotels?mode=history&id="+encodeURIComponent(id),{cache:"no-store"});
   const d=await r.json();setEvents(d.success?d.data:[]);
 }
 function choose(row:HotelCase){
   setSelected(row);setReply(row.customerReply||"");setAmount(row.quoteAmountSar===null?"":String(row.quoteAmountSar));
   setQuoteNotes(row.quoteNotes||"");setCancelReason("");setError("");setNotice("");void history(row.id);
 }
 async function action(type:string,more:Record<string,unknown>={}){
   if(!selected||busy)return;
   setBusy(true);setError("");setNotice("");
   try{
     const res=await fetch("/api/admin/hotels",{method:"PATCH",headers:{"Content-Type":"application/json"},
       body:JSON.stringify({id:selected.id,action:type,...more})});
     const d=await res.json();
     if(!res.ok||!d.success){setError(d.message||"تعذر حفظ الإجراء.");return;}
     setSelected(d.data);setNotice("تم حفظ الإجراء وتحديث السجل.");
     await Promise.all([load(),history(selected.id)]);
   }catch{setError("تعذر تنفيذ الإجراء.");}
   finally{setBusy(false);}
 }
 function selectOffer(o?:Offer){
   setBanner(null);
   setBannerDimensions(null);
   setEdit(o?{
     id:o.id,title:o.title,destination:o.destination||"",hotelName:o.hotelName||"",description:o.description||"",
     amountSar:o.amountSar===null?"":String(o.amountSar),priceUnit:o.priceUnit||"",
     bannerUrl:o.bannerUrl||"",startsAt:day(o.startsAt),endsAt:day(o.endsAt),
     isVisible:o.isVisible,sortOrder:o.sortOrder,
   }:{...blank});
 }
 async function saveOffer(e:FormEvent){
   e.preventDefault();if(!admin||busy)return;
   setBusy(true);setError("");setNotice("");
   try{
     let bannerUrl=edit.bannerUrl;
     if(banner){
       const form=new FormData();form.set("file",banner);form.set("kind","HOTEL");
       const uploaded=await fetch("/api/admin/transport/image",{method:"POST",body:form});
       const json=await uploaded.json();
       if(!uploaded.ok||!json.success){setError(json.message||"تعذر رفع الصورة.");return;}
       bannerUrl=json.url;
     }
     const res=await fetch("/api/admin/hotels",{method:edit.id?"PUT":"POST",headers:{"Content-Type":"application/json"},
       body:JSON.stringify({...edit,bannerUrl})});
     const d=await res.json();
     if(!res.ok||!d.success){setError(d.message||"تعذر حفظ العرض.");return;}
     setNotice("تم حفظ إعلان الفندق. يظهر في الموقع إذا كان مفعلاً وضمن تواريخ النشر.");
     selectOffer();await load();
   }catch{setError("تعذر حفظ الإعلان.");}
   finally{setBusy(false);}
 }
 async function toggle(o:Offer,active:boolean){
   if(!admin||busy)return;
   const next={
     id:o.id,title:o.title,destination:o.destination||"",hotelName:o.hotelName||"",
     description:o.description||"",amountSar:o.amountSar===null?"":String(o.amountSar),
     priceUnit:o.priceUnit||"",bannerUrl:o.bannerUrl||"",startsAt:day(o.startsAt),endsAt:day(o.endsAt),
     isVisible:active,sortOrder:o.sortOrder,
   };
   setBusy(true);try{
     const res=await fetch("/api/admin/hotels",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(next)});
     const d=await res.json();if(!res.ok||!d.success){setError(d.message||"تعذر تغيير ظهور الإعلان.");return;}
     setNotice(active?"تم تفعيل الإعلان.":"تم إيقاف الإعلان.");await load();
   }finally{setBusy(false);}
 }
 async function archive(o:Offer){
   if(!admin||busy||!window.confirm("أرشفة هذا العرض وإخفاؤه مع الاحتفاظ بسجله؟"))return;
   setBusy(true);try{
     const res=await fetch("/api/admin/hotels",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:o.id})});
     const d=await res.json();if(!res.ok||!d.success){setError(d.message||"تعذر الأرشفة.");return;}
     setNotice(d.message);await load();
   }finally{setBusy(false);}
 }
 const display=offers.filter(o=>filter==="ALL"||(filter==="ACTIVE"?o.isVisible:!o.isVisible));
 return <main dir="rtl" className="mx-auto max-w-[1300px] px-5 py-8 text-[#0D3B34]">
   <div className="flex flex-wrap items-start justify-between gap-4">
     <div><p className="text-xs font-black text-[#AE8529]">AREES LOOP · HOTEL DESK</p>
     <h1 className="mt-2 text-3xl font-black">إدارة حجوزات وعروض الفنادق</h1>
     <p className="mt-3 text-sm text-[#0D3B34]/70">طلبات العملاء والإسناد والردود، وإعلانات الفنادق وأسعارها.</p></div>
     <Link href="/hotels" className="rounded-full border border-[#D4AF37] bg-white px-5 py-3 text-sm font-bold">معاينة الفنادق ←</Link>
   </div>
   <div className="mt-6 flex flex-wrap gap-3">
     <button onClick={()=>setTab("requests")} className={`rounded-full px-6 py-3 text-sm font-bold ${tab==="requests"?"bg-[#0D3B34] text-white":"border bg-white"}`}>طلبات الفنادق ({rows.length})</button>
     <button onClick={()=>setTab("offers")} className={`rounded-full px-6 py-3 text-sm font-bold ${tab==="offers"?"bg-[#0D3B34] text-white":"border bg-white"}`}>عروض الفنادق ({offers.length})</button>
     <button type="button" onClick={()=>void load()} className="rounded-full border px-4 py-3 text-sm">تحديث</button>
   </div>
   {error&&<p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
   {notice&&<p role="status" className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
   {loading&&<p className="mt-6 text-sm">جاري تحميل البيانات...</p>}
   {tab==="requests"&&<div className="mt-7 grid items-start gap-6 xl:grid-cols-2">
     <section className="space-y-3">
       {rows.length===0&&!loading&&<p className="rounded-xl bg-white p-5 text-sm">لا توجد طلبات فنادق بعد.</p>}
       {rows.map(item=><button key={item.id} onClick={()=>choose(item)} className={`w-full rounded-2xl border p-5 text-right ${selected?.id===item.id?"border-[#B88A30] bg-[#FFF8E8]":"border-[#D4AF37]/30 bg-white"}`}>
         <div className="flex items-start justify-between"><b>{item.customerName}</b><span className="rounded-full bg-[#EEF3ED] px-3 py-1 text-xs">{stages[item.status]||item.status}</span></div>
         <p className="mt-2 text-sm">{item.destination} · {item.hotelName||"لم يحدد الفندق"}</p>
         <p className="mt-2 text-xs text-[#0D3B34]/65">{item.reference} · {day(item.checkInDate)} → {day(item.checkOutDate)}</p>
         {item.notificationStatus==="FAILED"&&<p className="mt-2 text-xs text-amber-800">الطلب محفوظ لكن تعذر إرسال بريد التنبيه.</p>}
       </button>)}
     </section>
     <section className="rounded-[24px] border border-[#D4AF37]/35 bg-white p-6 shadow-sm">
       {!selected?<p className="text-sm">اختر طلباً لمراجعة التفاصيل والرد عليه.</p>:<>
         <h2 className="text-xl font-black">{selected.reference}</h2>
         <p className="mt-3 text-sm leading-7">{selected.customerName} · {selected.destination} · {selected.hotelName||"فندق حسب الطلب"}</p>
         <p className="mt-1 text-sm leading-7">دخول {day(selected.checkInDate)} · خروج {day(selected.checkOutDate)}</p>
         <p className="mt-1 text-sm">الغرف: {selected.rooms} · البالغون: {selected.adults} · الأطفال: {selected.children}</p>
         <p className="mt-1 text-sm" dir="ltr">+{selected.countryCode}{selected.phone}</p>
         {selected.notes&&<p className="mt-3 rounded-xl bg-[#F7F4EC] p-4 text-sm leading-7">ملاحظات العميل: {selected.notes}</p>}
         {admin&&<label className="mt-5 block text-sm font-bold">إسناد الطلب
           <select className={field+" mt-2"} value={selected.assignedToId||""} onChange={e=>void action("ASSIGN",{assignedToId:e.target.value})} disabled={busy}>
             <option value="">غير مسند</option>
             {staff.map(s=><option key={s.id} value={s.id}>{[s.firstName,s.lastName].filter(Boolean).join(" ")||s.email}</option>)}
           </select>
         </label>}
         <label className="mt-5 block text-sm font-bold">رد أريس الذي سيظهر للعميل في «طلباتي»
           <textarea rows={3} maxLength={2500} className={field+" mt-2"} value={reply} onChange={e=>setReply(e.target.value)}/>
         </label>
         <button type="button" disabled={busy||!reply.trim()} onClick={()=>void action("REPLY",{customerReply:reply})} className="mt-2 rounded-xl bg-[#0D3B34] px-5 py-3 text-xs font-bold text-white disabled:opacity-40">نشر رد العميل</button>
         <div className="mt-5 grid gap-3 sm:grid-cols-2">
           <label className="text-xs font-bold">إجمالي العرض بالريال
             <input className={field+" mt-2"} type="number" min="0" step=".01" value={amount} onChange={e=>setAmount(e.target.value)}/>
           </label>
           <label className="text-xs font-bold sm:col-span-2">تفاصيل عرض الفندق
             <textarea className={field+" mt-2"} rows={3} value={quoteNotes} onChange={e=>setQuoteNotes(e.target.value)}/>
           </label>
           <button type="button" disabled={busy||!amount} onClick={()=>void action("QUOTE",{quoteAmountSar:amount,quoteNotes})} className="rounded-xl border border-[#D4AF37] bg-[#FFF8DE] px-5 py-3 text-sm font-bold disabled:opacity-40">حفظ عرض الفندق</button>
         </div>
         <div className="mt-6 flex flex-wrap gap-2">
           {(next[selected.status]||[]).filter(v=>v!=="CANCELED").map(v=><button key={v} disabled={busy} onClick={()=>void action("STATUS",{status:v})} className="rounded-xl border border-[#D4AF37] px-4 py-2.5 text-xs font-bold disabled:opacity-40">{stages[v]}</button>)}
         </div>
         {(next[selected.status]||[]).includes("CANCELED")&&<div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
           <label className="text-xs font-bold">سبب الإلغاء<input className={field+" mt-2"} maxLength={1500} value={cancelReason} onChange={e=>setCancelReason(e.target.value)}/></label>
           <button disabled={busy||cancelReason.trim().length<5} onClick={()=>void action("STATUS",{status:"CANCELED",reason:cancelReason})} className="mt-3 rounded-xl bg-red-700 px-5 py-3 text-xs font-bold text-white disabled:opacity-40">إلغاء الطلب</button>
         </div>}
         <section className="mt-6 border-t border-[#D4AF37]/35 pt-4">
           <h3 className="font-black">سجل إجراءات الموظفين</h3>
           {events.length===0?<p className="mt-3 text-xs text-[#0D3B34]/60">لا توجد أحداث محفوظة بعد.</p>:
             <ol className="mt-3 space-y-2">{events.map(e=><li key={e.id} className="rounded-xl bg-[#F8F6EE] p-3 text-xs leading-7">
               <b>{e.actorName} · {e.action}</b>
               {e.toStatus&&<p>{stages[e.fromStatus||""]||"—"} ← {stages[e.toStatus]||e.toStatus}</p>}
               <p>{new Date(e.createdAt).toLocaleString("ar-SA")}</p>
             </li>)}</ol>}
         </section>
       </>}
     </section>
   </div>}
   {tab==="offers"&&<div className="mt-7 grid gap-6 xl:grid-cols-2">
     <section className="rounded-3xl border border-[#D4AF37]/30 bg-white p-6">
       <h2 className="text-xl font-black">إضافة أو تعديل إعلان فندق</h2>
       {!admin&&<p className="mt-3 text-xs text-amber-700">إدارة العروض للسوبر أدمن فقط.</p>}
       <form onSubmit={saveOffer} className="mt-5 grid gap-3 sm:grid-cols-2">
         {([["عنوان العرض","title"],["المدينة","destination"],["اسم الفندق","hotelName"]] as const).map(([label,key])=>
           <label key={key} className="text-xs font-bold">{label}<input required={key==="title"} maxLength={160} className={field+" mt-2"} value={edit[key]} onChange={e=>setEdit(f=>({...f,[key]:e.target.value}))}/></label>)}
         <label className="text-xs font-bold sm:col-span-2">وصف العرض
           <textarea rows={3} className={field+" mt-2"} value={edit.description} onChange={e=>setEdit(f=>({...f,description:e.target.value}))}/>
         </label>
         <label className="text-xs font-bold">السعر بالريال
           <input type="number" min="0" step=".01" className={field+" mt-2"} value={edit.amountSar} onChange={e=>setEdit(f=>({...f,amountSar:e.target.value}))}/>
         </label>
         <label className="text-xs font-bold">وحدة السعر
           <input className={field+" mt-2"} value={edit.priceUnit} onChange={e=>setEdit(f=>({...f,priceUnit:e.target.value}))}/>
         </label>
         <label className="text-xs font-bold">بداية النشر<input className={field+" mt-2"} type="date" value={edit.startsAt} onChange={e=>setEdit(f=>({...f,startsAt:e.target.value}))}/></label>
         <label className="text-xs font-bold">آخر يوم للنشر<input className={field+" mt-2"} type="date" min={edit.startsAt||undefined} value={edit.endsAt} onChange={e=>setEdit(f=>({...f,endsAt:e.target.value}))}/></label>
         <label className="text-xs font-bold sm:col-span-2">صورة العرض (PNG / JPG / WEBP)
           <input type="file" accept="image/png,image/jpeg,image/webp" className={field+" mt-2"} onChange={e=>{setBanner(e.target.files?.[0]||null);setBannerDimensions(null);}}/>
         </label>
         <div className="sm:col-span-2 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
           <p className="font-black">مقاس صورة عروض الفنادق: 1200 × 600 بكسل — أفقي (2:1).</p>
           <p className="text-xs">الحد الأقصى 4 ميجابايت. قد يقص الموقع أطراف الصورة حسب الشاشة؛ خلي العنصر المهم في المنتصف.</p>
           {banner&&bannerDimensions&&<p className="mt-1 font-black">مقاس الصورة المختارة: {bannerDimensions.width} × {bannerDimensions.height} بكسل</p>}
         </div>
         <label className="text-xs font-bold sm:col-span-2">أو مسار صورة بالمشروع
           <input className={field+" mt-2"} value={edit.bannerUrl} onChange={e=>setEdit(f=>({...f,bannerUrl:e.target.value}))} placeholder="/Image/..."/>
         </label>
         <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={edit.isVisible} onChange={e=>setEdit(f=>({...f,isVisible:e.target.checked}))}/>نشر الإعلان</label>
         <label className="text-xs font-bold">ترتيب الإعلان<input type="number" min={0} className={field+" mt-2"} value={edit.sortOrder} onChange={e=>setEdit(f=>({...f,sortOrder:Number(e.target.value)}))}/></label>
         <div className="flex flex-wrap gap-3 sm:col-span-2">
           <button disabled={!admin||busy} className="rounded-xl bg-[#0D3B34] px-6 py-3 text-sm font-bold text-white disabled:opacity-40">حفظ الإعلان</button>
           <button type="button" onClick={()=>selectOffer()} className="rounded-xl border px-5 py-3 text-sm">عرض جديد</button>
         </div>
       </form>
       <div className="mt-6 overflow-hidden rounded-[22px] border border-[#D4AF37]/40 bg-[#FFFDF8]">
         <p className="bg-[#0D3B34] px-5 py-3 text-xs font-black text-white">معاينة إعلانك قبل الحفظ</p>
         {(preview||edit.bannerUrl)&&<>
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img alt="معاينة الفندق" src={preview||edit.bannerUrl} onLoad={e=>{if(banner)setBannerDimensions({width:e.currentTarget.naturalWidth,height:e.currentTarget.naturalHeight});}} className="h-40 w-full object-contain"/>
         </>}
         <div className="p-5"><p className="text-xs text-[#B18B2C]">{edit.hotelName}</p><h3 className="mt-2 text-xl font-black">{edit.title||"عنوان الإعلان"}</h3>
         <p className="mt-2 text-xs">{edit.destination}</p>
         {edit.amountSar!==""&&<p className="mt-3 text-xl font-black text-[#B18B2C]">{Number(edit.amountSar).toLocaleString("ar-SA")} ر.س</p>}
         <p className="mt-2 whitespace-pre-wrap text-xs leading-7">{edit.description}</p></div>
       </div>
     </section>
     <section className="space-y-3">
       <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">العروض والإعلانات ({display.length})</h2>
         <div className="flex gap-2"><button onClick={()=>setView("cards")} className="rounded-xl border px-3 py-2 text-xs">بطاقات</button><button onClick={()=>setView("list")} className="rounded-xl border px-3 py-2 text-xs">قائمة</button></div>
       </div>
       <select className={field} value={filter} onChange={e=>setFilter(e.target.value as typeof filter)}><option value="ALL">الكل</option><option value="ACTIVE">مفعّل</option><option value="PAUSED">موقوف</option></select>
       {display.map(o=><article key={o.id} className={`rounded-2xl border border-[#D4AF37]/30 bg-white p-4 ${view==="list"?"flex flex-wrap items-center gap-4":""}`}>
         {o.bannerUrl&&<div className={view==="list"?"h-20 w-32 overflow-hidden rounded-xl":"mb-3 h-36 overflow-hidden rounded-xl"}>
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img alt={o.title} src={o.bannerUrl} className="h-full w-full object-cover"/>
         </div>}
         <div className="min-w-0 flex-1"><h3 className="font-black">{o.title}</h3><p className="mt-1 text-xs">{o.destination} · {o.hotelName}</p>
           {o.amountSar!==null&&<p className="mt-2 text-sm font-black text-[#98751A]">{o.amountSar} ر.س</p>}
           <p className="mt-2 text-xs">{o.isVisible?"مفعّل":"موقوف"}</p>
         </div>
         {admin&&<div className="mt-3 flex flex-wrap gap-2">
           <button onClick={()=>selectOffer(o)} className="rounded-full border px-4 py-2 text-xs">تعديل</button>
           <button disabled={busy} onClick={()=>void toggle(o,!o.isVisible)} className="rounded-full border px-4 py-2 text-xs">{o.isVisible?"إيقاف":"تفعيل"}</button>
           <button disabled={busy} onClick={()=>void archive(o)} className="rounded-full border border-red-200 px-4 py-2 text-xs text-red-700">أرشفة</button>
         </div>}
       </article>)}
       {!display.length&&<p className="rounded-xl bg-white p-5 text-sm">لا توجد إعلانات في هذا القسم.</p>}
     </section>
   </div>}
 </main>;
}
