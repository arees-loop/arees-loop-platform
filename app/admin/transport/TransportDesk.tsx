"use client";
import AdminPaymentReview from "@/app/components/AdminPaymentReview";
import AdminTicketFulfillment from "@/app/components/AdminTicketFulfillment";
import AdminConfirmedBooking from "@/app/components/AdminConfirmedBooking";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { AirportLookup, AirlineLookup } from "@/app/components/AviationLookup";
import ImageSizeGuidance from "@/app/components/ImageSizeGuidance";
import { IMAGE_REQUIREMENTS, imageDimensionMessage } from "@/lib/image-requirements";

type RequestRow={
  id:string;reference:string;kind:string;customerName:string;customerEmail:string|null;
  countryCode:string;phone:string;whatsappCountryCode:string|null;whatsappPhone:string|null;
  origin:string;destination:string;travelDate:string;adults:number;children:number;infants:number;
  notes:string|null;status:string;adminNotes:string|null;customerReply:string|null;carrierName:string|null;
  quoteAmountSar:number|null;quoteNotes:string|null;quoteValidUntil:string|null;whatsappStatus:string;
  notificationStatus:string;createdAt:string;assignedToId:string|null;canceledBy:string|null;cancellationReason:string|null;
  tripType?:string;returnDate?:string|null;itinerary?:unknown;
};
type Offer={
  id:string;kind:string;title:string;description:string|null;carrierName:string|null;
  origin:string|null;destination:string|null;travelDate:string|null;scheduleType:string;scheduleData:unknown;amountSar:number|null;adultPriceSar:number|null;childPriceSar:number|null;infantPriceSar:number|null;
  priceUnit:string|null;bannerUrl:string|null;imageUrls:string[];operationStatus:string;operationNote:string|null;
  isVisible:boolean;sortOrder:number;startsAt:string|null;endsAt:string|null;
};
const operators={FLIGHT:["تاركو للطيران","بدر للطيران","الخطوط الجوية السودانية","أخرى"],FERRY:["الجودي","دليلة","عمان","مونتي","أخرى"],VISA:["سياحية","زيارة عائلية","أعمال","عبور","أخرى"]};
type Staff={id:string;firstName:string|null;lastName:string|null;email:string;role:string;adminPermissions:unknown};
type HistoryEvent={id:string;actorName:string;action:string;fromStatus:string|null;toStatus:string|null;details:unknown;createdAt:string};
const statusNames:Record<string,string>={NEW:"جديد",PROCESSING:"تحت المعالجة",QUOTE_READY:"عرض السعر جاهز",QUOTE_SENT:"تم إرسال عرض السعر",PAID:"تم السداد",EXECUTING:"تحت التنفيذ",DONE:"تم التنفيذ",CANCELED:"تم الإلغاء"};
const transitions:Record<string,string[]>={NEW:["PROCESSING","CANCELED"],PROCESSING:["QUOTE_READY","CANCELED"],QUOTE_READY:["PROCESSING","CANCELED"],QUOTE_SENT:["PAID","PROCESSING","CANCELED"],PAID:["EXECUTING","DONE","CANCELED"],EXECUTING:["DONE","CANCELED"],DONE:[],CANCELED:[]};
const rowTheme:Record<string,{row:string;badge:string}>={
 NEW:{row:"border-[#B9DAC4] bg-[#F2FAF3] hover:bg-[#EAF8ED]",badge:"bg-[#DBF1E1] text-[#16603C]"},
 PROCESSING:{row:"border-[#E9D6A1] bg-[#FFFBEC] hover:bg-[#FFF5D9]",badge:"bg-[#F8E8B9] text-[#88611B]"},
 QUOTE_READY:{row:"border-[#E9D6A1] bg-[#FFFBEC] hover:bg-[#FFF5D9]",badge:"bg-[#F8E8B9] text-[#88611B]"},
 QUOTE_SENT:{row:"border-[#E9D6A1] bg-[#FFFBEC] hover:bg-[#FFF5D9]",badge:"bg-[#F8E8B9] text-[#88611B]"},
 PAID:{row:"border-[#B4D9E7] bg-[#F1F9FC] hover:bg-[#E4F3FA]",badge:"bg-[#DAEEF6] text-[#1D607B]"},
 EXECUTING:{row:"border-[#DACFF0] bg-[#F8F4FD] hover:bg-[#F0E9F8]",badge:"bg-[#EEE3F8] text-[#66438D]"},
 DONE:{row:"border-[#B1DBC8] bg-[#EFFAF5] hover:bg-[#E5F5EC]",badge:"bg-[#D3EEDF] text-[#116442]"},
 CANCELED:{row:"border-[#F0C7C2] bg-[#FFF2F0] hover:bg-[#FFE9E6]",badge:"bg-[#F9D9D5] text-[#9C3028]"},
};
const blankOffer={
  id:"",kind:"FERRY",title:"",description:"",carrierName:"",origin:"سواكن",destination:"جدة",
  travelDate:"",scheduleType:"SINGLE",scheduleDates:"",rangeFrom:"",rangeTo:"",weekdaysText:"",monthDaysText:"",scheduleUntil:"",amountSar:"",adultPriceSar:"",childPriceSar:"",infantPriceSar:"",priceUnit:"للبالغ",bannerUrl:"",imageUrls:[] as string[],operationStatus:"AVAILABLE",operationNote:"",
  isVisible:true,sortOrder:0,startsAt:"",endsAt:"",
};
type OfferForm=typeof blankOffer;
const field="w-full rounded-xl border border-[#D4AF37]/35 bg-[#FFFEFA] px-3 py-3 text-sm outline-[#B38A25]";
const label="flex flex-col gap-1.5 text-xs font-semibold";
const day=(d:string|null)=>d?d.slice(0,10):"";
const offerDay=(d:string|null)=>d?new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Riyadh",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(d)):"";

export default function TransportAdminPage({initialOfferKind="ALL"}:{initialOfferKind?:"ALL"|"FLIGHT"|"FERRY"|"VISA"|"DRIVING_LICENSE"}={}) {
  const [tab,setTab]=useState<"requests"|"offers">(initialOfferKind==="ALL"?"requests":"offers");
  const [requests,setRequests]=useState<RequestRow[]>([]);
  const [requestStatusFilter,setRequestStatusFilter]=useState("ALL");
  const [offers,setOffers]=useState<Offer[]>([]);
  const [staff,setStaff]=useState<Staff[]>([]);
  const [identity,setIdentity]=useState<{role:string;id:string}|null>(null);
  const [history,setHistory]=useState<HistoryEvent[]>([]);
  const [cancelReason,setCancelReason]=useState("");
  const [replyDraft,setReplyDraft]=useState("");
  const [cancelBy,setCancelBy]=useState("STAFF");
  const [filterKind,setFilterKind]=useState<"ALL"|"FLIGHT"|"FERRY"|"VISA"|"DRIVING_LICENSE">(initialOfferKind);
  const [offerEditorOpen,setOfferEditorOpen]=useState(false);
  const [offerView,setOfferView]=useState<"CARDS"|"LIST">("CARDS");
  const [offerFilter,setOfferFilter]=useState<"ALL"|"ACTIVE"|"PAUSED"|"UPCOMING"|"EXPIRED">("ALL");
  const [bannerFile,setBannerFile]=useState<File|null>(null);
  const [extraBannerFiles,setExtraBannerFiles]=useState<File[]>([]);
  const [bannerPreview,setBannerPreview]=useState("");
  const [bannerDimensions,setBannerDimensions]=useState<{width:number;height:number}|null>(null);
  const [selected,setSelected]=useState<RequestRow|null>(null);
  const [visaAvailability,setVisaAvailability]=useState<"AVAILABLE"|"UNAVAILABLE">("AVAILABLE");
  const [form,setForm]=useState({carrierName:"",quoteAmountSar:"",quoteNotes:"",adminNotes:"",quoteValidUntil:""});
  const [offerForm,setOfferForm]=useState<OfferForm>({...blankOffer,kind:initialOfferKind==="ALL"?"FERRY":initialOfferKind,origin:initialOfferKind==="FERRY"?blankOffer.origin:"",destination:initialOfferKind==="FERRY"?blankOffer.destination:""});
  const [status,setStatus]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const [r,o]=await Promise.all([
        fetch("/api/admin/transport?mode=requests",{cache:"no-store"}),
        fetch("/api/admin/transport?mode=offers",{cache:"no-store"}),
      ]);
      const [q,p]=await Promise.all([r.json(),o.json()]);
      if(!r.ok||!q.success||!o.ok||!p.success){setError(q.message||p.message||"تعذر تحميل بيانات إدارة النقل.");return;}
      setRequests(q.data);setOffers(p.data);setError("");
    }catch{setError("تعذر الاتصال بالخادم.");}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{void load();},[load]);
  useEffect(()=>{
    void fetch("/api/admin/me",{cache:"no-store"}).then(r=>r.json()).then(d=>{
      if(d.success)setIdentity({role:d.data.role,id:d.data.id});
    }).catch(()=>{});
    void fetch("/api/admin/transport?mode=staff",{cache:"no-store"}).then(r=>r.json()).then(d=>{
      if(d.success)setStaff(d.data||[]);
    }).catch(()=>{});
  },[]);
  useEffect(()=>{
    if(!bannerFile){setBannerPreview("");return;}
    const url=URL.createObjectURL(bannerFile);setBannerPreview(url);
    return()=>URL.revokeObjectURL(url);
  },[bannerFile]);
  const showSuper=identity?.role==="SUPER_ADMIN";
  const staffName=(id:string|null)=>{
    const user=staff.find(s=>s.id===id);
    return user?([user.firstName,user.lastName].filter(Boolean).join(" ")||user.email):"لم يسند بعد";
  };
  async function loadHistory(id:string){
    try {
      const r=await fetch("/api/admin/transport?mode=history&id="+encodeURIComponent(id),{cache:"no-store"});
      const d=await r.json();setHistory(d.success?d.data:[]);
    }catch{setHistory([]);}
  }

  function choose(q:RequestRow) {
    setSelected(q);setError("");setStatus("");setReplyDraft(q.customerReply||"");setVisaAvailability("AVAILABLE");
    void loadHistory(q.id);
    setForm({carrierName:q.carrierName||"",
      quoteAmountSar:q.quoteAmountSar===null?"":String(q.quoteAmountSar),
      quoteNotes:q.quoteNotes||"",adminNotes:q.adminNotes||"",
      quoteValidUntil:day(q.quoteValidUntil)});
  }

  async function saveQuote(event:FormEvent) {
    event.preventDefault();if(!selected||busy)return;
    setBusy(true);setError("");setStatus("");
    try{
      const r=await fetch("/api/admin/transport",{method:"PATCH",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({id:selected.id,action:"SAVE_QUOTE",...form})});
      const result=await r.json();
      if(!r.ok||!result.success){setError(result.message||"تعذر حفظ العرض.");return;}
      setSelected(result.data);
      void loadHistory(selected.id);
      setStatus(initialOfferKind==="VISA"?"تم حفظ سعر التأشيرة. انشر الرد للعميل ليظهر في طلباتي.":"حُفظ عرض السعر. يمكن فتحه وطباعة PDF، ثم إرساله يدوياً من واتساب الشركة.");
      await load();
    }catch{setError("تعذر حفظ العرض.");}
    finally{setBusy(false);}
  }

  async function publishQuoteToCustomer(){
    if(!selected||busy||selected.status!=="QUOTE_READY"||selected.quoteAmountSar===null)return;
    if(!window.confirm("هل راجعت سعر العرض وشروطه وتريد نشره للعميل داخل صفحة «طلباتي»؟ لن يُرسل ملف PDF إلى واتساب تلقائياً."))return;
    setBusy(true);setError("");setStatus("");
    try{
      const r=await fetch("/api/admin/transport",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:selected.id,action:"PUBLISH_QUOTE_TO_CUSTOMER"})});
      const result=await r.json();
      if(!r.ok||!result.success){setError(result.message||"تعذر نشر العرض للعميل.");return;}
      setSelected(result.data);
      setStatus("تم نشر عرض السعر داخل «طلباتي». يستطيع العميل الآن قبوله ثم اختيار حساب التحويل البنكي المفعّل. الإرسال إلى واتساب إجراء منفصل.");
      void loadHistory(selected.id);await load();
    }catch{setError("تعذر نشر العرض للعميل.");}
    finally{setBusy(false);}
  }

  async function publishVisaDecision(){
    if(!selected||busy)return;
    setBusy(true);setError("");setStatus("");
    try{
      const r=await fetch("/api/admin/transport",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:selected.id,action:"PUBLISH_SERVICE_DECISION",availability:visaAvailability,quoteAmountSar:form.quoteAmountSar,quoteNotes:form.quoteNotes,reason:cancelReason})});
      const d=await r.json();
      if(!r.ok||!d.success){setError(d.message||"تعذر إرسال قرار الخدمة.");return;}
      setSelected(d.data);setReplyDraft(d.data.customerReply||"");setStatus(visaAvailability==="AVAILABLE"?"تم إرسال السعر والتعليق للعميل، والطلب تحت الإجراء.":"تم إرسال الاعتذار للعميل وإغلاق الطلب.");
      void loadHistory(selected.id);await load();
    }catch{setError("تعذر الاتصال بالخادم.");}
    finally{setBusy(false);}
  }

  async function performAction(action:"SET_STATUS"|"ASSIGN",payload:Record<string,unknown>){
    if(!selected||busy)return;
    setBusy(true);setError("");setStatus("");
    try{
      const r=await fetch("/api/admin/transport",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:selected.id,action,...payload})});
      const d=await r.json();
      if(!r.ok||!d.success){setError(d.message||"تعذر تنفيذ الإجراء.");return;}
      setSelected(d.data);
      setStatus(action==="ASSIGN"?"تم إسناد الطلب للموظف المختار.":"تم تحديث حالة الطلب وتسجيل الإجراء في السجل.");
      setCancelReason("");
      void loadHistory(selected.id);
      await load();
    }catch{setError("تعذر تحديث الطلب.");}
    finally{setBusy(false);}
  }

  async function publishReply(){
    if(!selected||busy||!replyDraft.trim())return;
    setBusy(true);setError("");setStatus("");
    try{
      const r=await fetch("/api/admin/transport",{method:"PATCH",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({id:selected.id,action:"REPLY_CUSTOMER",customerReply:replyDraft})});
      const d=await r.json();
      if(!r.ok||!d.success){setError(d.message||"تعذر نشر الرد.");return;}
      setSelected(d.data);setStatus("تم نشر الرد ليظهر للعميل داخل صفحة «طلباتي».");
      void loadHistory(selected.id);await load();
    }catch{setError("تعذر نشر الرد.");}
    finally{setBusy(false);}
  }
  async function markManuallySent() {
    if(!selected||busy)return;setBusy(true);setError("");
    try{
      if(!window.confirm("هل أرسلت ملف عرض السعر PDF فعلياً من واتساب الشركة؟ فتح المحادثة فقط لا يكفي.")){setBusy(false);return;}
      const r=await fetch("/api/admin/transport",{method:"PATCH",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({id:selected.id,action:"MARK_MANUAL_WHATSAPP",confirmed:true})});
      const q=await r.json();
      if(!r.ok||!q.success){setError(q.message||"تعذر تحديث الإرسال.");return;}
      setSelected(current=>current?{...current,whatsappStatus:"MANUALLY_MARKED_SENT",status:"QUOTE_SENT"}:current);
      void loadHistory(selected.id);
      setStatus("تم تسجيل تأكيد الموظف اليدوي لإرسال العرض. هذا ليس إثبات تسليم من واتساب.");
      await load();
    }catch{setError("تعذر تحديث حالة الإرسال.");}
    finally{setBusy(false);}
  }

  const customerWhatsApp = selected
    ? (selected.whatsappPhone ? (selected.whatsappCountryCode||"")+selected.whatsappPhone : selected.countryCode+selected.phone).replace(/\D/g,"")
    : "";
  const message = selected ? `السلام عليكم، بناءً على طلبكم لدى شركة أريس لخدمة ${selected.kind==="FERRY"?"البواخر":selected.kind==="VISA"?"التأشيرات":selected.kind==="DRIVING_LICENSE"?"رخصة القيادة الدولية":"الطيران"} رقم ${selected.reference} (${selected.origin} - ${selected.destination})، أعددنا عرض السعر لدى ${selected.carrierName||"الناقل المختار"}. المبلغ ${selected.quoteAmountSar===null?"قيد التحديد":selected.quoteAmountSar+" ريال سعودي"}. يمكننا إرسال ملف عرض السعر PDF في هذه المحادثة بعد حفظه، ويرجى التأكد من استلام المرفق. نؤكد أن العرض ليس حجزاً نهائياً، وشروط الاسترداد والتعديل وفق الناقل. ${selected.quoteNotes||""}` : "";

  function startOffer(offer?:Offer) {
    setBannerFile(null);
    setExtraBannerFiles([]);
    setBannerDimensions(null);
    setStatus("");setError("");setTab("offers");setOfferEditorOpen(true);
    setOfferForm(offer?{
      id:offer.id,kind:offer.kind,title:offer.title,description:offer.description||"",
      carrierName:offer.carrierName||"",origin:offer.origin||"",destination:offer.destination||"",
      travelDate:day(offer.travelDate),scheduleType:offer.scheduleType||"SINGLE",scheduleDates:Array.isArray((offer.scheduleData as {dates?:unknown[]}|null)?.dates)?((offer.scheduleData as {dates:string[]}).dates).join("\n"):"",rangeFrom:String((offer.scheduleData as {from?:string}|null)?.from||""),rangeTo:String((offer.scheduleData as {to?:string}|null)?.to||""),weekdaysText:Array.isArray((offer.scheduleData as {weekdays?:unknown[]}|null)?.weekdays)?((offer.scheduleData as {weekdays:number[]}).weekdays).join(", "):"",monthDaysText:Array.isArray((offer.scheduleData as {monthDays?:unknown[]}|null)?.monthDays)?((offer.scheduleData as {monthDays:number[]}).monthDays).join(", "):"",scheduleUntil:String((offer.scheduleData as {until?:string}|null)?.until||""),amountSar:offer.amountSar===null?"":String(offer.amountSar),
      adultPriceSar:offer.adultPriceSar===null?"":String(offer.adultPriceSar),childPriceSar:offer.childPriceSar===null?"":String(offer.childPriceSar),infantPriceSar:offer.infantPriceSar===null?"":String(offer.infantPriceSar),
      priceUnit:offer.priceUnit||"",bannerUrl:offer.bannerUrl||"",imageUrls:offer.imageUrls?.length?offer.imageUrls:(offer.bannerUrl?[offer.bannerUrl]:[]),
      operationStatus:offer.operationStatus,operationNote:offer.operationNote||"",
      isVisible:offer.isVisible,sortOrder:offer.sortOrder,startsAt:offerDay(offer.startsAt),endsAt:offerDay(offer.endsAt),
    }:{...blankOffer});
  }

  async function saveOffer(event:FormEvent) {
    event.preventDefault();if(busy)return;setBusy(true);setError("");setStatus("");
    if (bannerFile && (bannerDimensions?.width !== IMAGE_REQUIREMENTS.offer.width || bannerDimensions?.height !== IMAGE_REQUIREMENTS.offer.height)) {
      setError(imageDimensionMessage(IMAGE_REQUIREMENTS.offer));
      setBusy(false);
      return;
    }
    try{
      const method=offerForm.id?"PUT":"POST";
      let imageUrl=offerForm.bannerUrl;
      let imageUrls=offerForm.imageUrls;
      const selectedImages=[bannerFile,...extraBannerFiles].filter((file):file is File=>Boolean(file));
      if(selectedImages.length){
        const uploadedImages:string[]=[];
        for(const file of selectedImages){
          const data=new FormData();data.set("kind",offerForm.kind);data.set("file",file);
          const uploaded=await fetch("/api/admin/transport/image",{method:"POST",body:data});
          const up=await uploaded.json();
          if(!uploaded.ok||!up.success){setError(up.message||"تعذر رفع إحدى الصور.");return;}
          uploadedImages.push(up.url);
        }
        imageUrls=uploadedImages;
        imageUrl=imageUrls[0]||"";
      }
      const r=await fetch("/api/admin/transport",{method,headers:{"Content-Type":"application/json"},body:JSON.stringify({...offerForm,imageUrls,scheduleData:offerForm.scheduleType==="SINGLE"?{date:offerForm.travelDate}:offerForm.scheduleType==="MULTIPLE"?{datesText:offerForm.scheduleDates}:offerForm.scheduleType==="RANGE"?{from:offerForm.rangeFrom,to:offerForm.rangeTo}:offerForm.scheduleType==="WEEKLY"?{weekdaysText:offerForm.weekdaysText,until:offerForm.scheduleUntil}:{monthDaysText:offerForm.monthDaysText,until:offerForm.scheduleUntil},bannerUrl:imageUrl})});
      const d=await r.json();
      if(!r.ok||!d.success){setError(d.message||"تعذر حفظ العرض.");return;}
      setStatus("تم حفظ العرض أو الجدول. سيظهر للزوار إذا اخترت «ظاهر» والبيانات متصلة.");
      setOfferForm({...blankOffer,kind:initialOfferKind==="ALL"?"FERRY":initialOfferKind,origin:initialOfferKind==="FERRY"?"سواكن":"",destination:initialOfferKind==="FERRY"?"جدة":""});
      setBannerFile(null);setExtraBannerFiles([]);setOfferEditorOpen(false);
      await load();
    }catch{setError("تعذر الاتصال بالخادم لحفظ العرض.");}
    finally{setBusy(false);}
  }


  function formForOffer(offer:Offer) {
    return {
      id:offer.id,kind:offer.kind,title:offer.title,description:offer.description||"",
      carrierName:offer.carrierName||"",origin:offer.origin||"",destination:offer.destination||"",
      travelDate:day(offer.travelDate),scheduleType:offer.scheduleType||"SINGLE",scheduleData:offer.scheduleData,scheduleDates:Array.isArray((offer.scheduleData as {dates?:unknown[]}|null)?.dates)?((offer.scheduleData as {dates:string[]}).dates).join("\n"):"",rangeFrom:String((offer.scheduleData as {from?:string}|null)?.from||""),rangeTo:String((offer.scheduleData as {to?:string}|null)?.to||""),weekdaysText:Array.isArray((offer.scheduleData as {weekdays?:unknown[]}|null)?.weekdays)?((offer.scheduleData as {weekdays:number[]}).weekdays).join(", "):"",monthDaysText:Array.isArray((offer.scheduleData as {monthDays?:unknown[]}|null)?.monthDays)?((offer.scheduleData as {monthDays:number[]}).monthDays).join(", "):"",scheduleUntil:String((offer.scheduleData as {until?:string}|null)?.until||""),amountSar:offer.amountSar===null?"":String(offer.amountSar),
      priceUnit:offer.priceUnit||"",bannerUrl:offer.bannerUrl||"",imageUrls:offer.imageUrls||[],
      operationStatus:offer.operationStatus,operationNote:offer.operationNote||"",
      isVisible:offer.isVisible,sortOrder:offer.sortOrder,
      startsAt:offerDay(offer.startsAt),endsAt:offerDay(offer.endsAt),
    };
  }
  async function setOfferVisibility(offer:Offer,visible:boolean) {
    if(!showSuper||busy)return;
    setBusy(true);setError("");setStatus("");
    try{
      const r=await fetch("/api/admin/transport",{method:"PUT",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...formForOffer(offer),isVisible:visible})});
      const d=await r.json();
      if(!r.ok||!d.success){setError(d.message||"تعذر تغيير حالة العرض.");return;}
      setStatus(visible?"تم تفعيل العرض (وفق فترة النشر إن وجدت).":"تم إيقاف العرض وإخفاؤه.");
      await load();
    }catch{setError("تعذر تحديث ظهور العرض.");}
    finally{setBusy(false);}
  }
  async function archiveOffer(offer:Offer) {
    if(!showSuper||busy||!window.confirm("هل تريد حذف العرض من الواجهة؟ سيتم أرشفته للاحتفاظ بالسجلات وعدم فقد البيانات."))return;
    setBusy(true);setError("");setStatus("");
    try{
      const r=await fetch("/api/admin/transport",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:offer.id})});
      const d=await r.json();
      if(!r.ok||!d.success){setError(d.message||"تعذر حذف العرض.");return;}
      setStatus(d.message||"تمت أرشفة العرض.");await load();
      if(offerForm.id===offer.id)startOffer();
    }catch{setError("تعذر حذف العرض.");}
    finally{setBusy(false);}
  }
  const serviceRequests=requests.filter(q=>initialOfferKind==="ALL"||q.kind===initialOfferKind);
  const requestStatuses=[...new Set(serviceRequests.map(q=>q.status))];
  const filteredRequests=serviceRequests.filter(q=>requestStatusFilter==="ALL"||q.status===requestStatusFilter).sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
  const nowMs=Date.now();
  const offerState=(o:Offer)=>{
    if(!o.isVisible)return "PAUSED";
    if(o.startsAt&&new Date(o.startsAt).getTime()>nowMs)return "UPCOMING";
    if(o.endsAt&&new Date(o.endsAt).getTime()<nowMs)return "EXPIRED";
    return "ACTIVE";
  };
  const filteredOffers=offers.filter(o=>
    (initialOfferKind==="ALL"?(filterKind==="ALL"||o.kind===filterKind):o.kind===initialOfferKind) &&
    (offerFilter==="ALL"||offerState(o)===offerFilter)
  );
  const ferryOperators=operators.FERRY;
  return (
    <main dir="rtl" className="mx-auto max-w-[1600px] px-5 py-8 text-[#0D3B34]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-black tracking-widest text-[#A78332]">AREES LOOP · AREES TRAVEL</p>
          <h1 className="mt-2 text-3xl font-black">{initialOfferKind==="FLIGHT"?"إدارة حجوزات الطيران":initialOfferKind==="FERRY"?"إدارة حجوزات البواخر":initialOfferKind==="VISA"?"طلبات وعروض التأشيرات":initialOfferKind==="DRIVING_LICENSE"?"طلبات رخصة القيادة الدولية":"حجوزات الطيران والبواخر"}</h1>
          <p className="mt-2 text-sm leading-8 text-[#0D3B34]/70">استقبال الطلبات، إعداد عروض الأسعار، متابعة التواصل، وإدارة إعلانات الأسعار وجداول البواخر.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/flights" className="rounded-full border border-[#D4AF37] bg-white px-4 py-2.5 text-sm font-bold">معاينة الطيران</Link>
          <Link href="/ferries" className="rounded-full border border-[#D4AF37] bg-white px-4 py-2.5 text-sm font-bold">معاينة البواخر</Link>{initialOfferKind==="VISA"&&<Link href="/visas" className="rounded-full border border-[#D4AF37] bg-white px-4 py-2.5 text-sm font-bold">معاينة التأشيرات</Link>}
        </div>
      </div>
      <div className="mt-7 flex flex-wrap gap-2">
        <button onClick={()=>setTab("requests")} className={`rounded-full px-6 py-3 text-sm font-bold ${tab==="requests"?"bg-[#0D3B34] text-white":"border border-[#D4AF37]/40 bg-white"}`}>طلبات العملاء ({filteredRequests.length})</button>
        {initialOfferKind!=="DRIVING_LICENSE"&&<button onClick={()=>setTab("offers")} className={`rounded-full px-6 py-3 text-sm font-bold ${tab==="offers"?"bg-[#0D3B34] text-white":"border border-[#D4AF37]/40 bg-white"}`}>الأسعار والعروض والجداول ({offers.filter(x=>initialOfferKind==="ALL"||x.kind===initialOfferKind).length})</button>}
        {tab==="offers"&&initialOfferKind==="ALL"&&<div className="flex flex-wrap gap-2">
          <button type="button" onClick={()=>{setFilterKind("FLIGHT");startOffer();setOfferForm(f=>({...f,kind:"FLIGHT",origin:"",destination:""}));}} className={`rounded-full border px-5 py-3 text-sm font-bold ${filterKind==="FLIGHT"?"bg-[#D4AF37]":"bg-white"}`}>✈ عروض الطيران</button>
          <button type="button" onClick={()=>{setFilterKind("FERRY");startOffer();}} className={`rounded-full border px-5 py-3 text-sm font-bold ${filterKind==="FERRY"?"bg-[#D4AF37]":"bg-white"}`}>⚓ عروض البواخر</button>
          <button type="button" onClick={()=>{setFilterKind("VISA");startOffer();setOfferForm(f=>({...f,kind:"VISA",origin:"",destination:""}));}} className={`rounded-full border px-5 py-3 text-sm font-bold ${filterKind==="VISA"?"bg-[#D4AF37]":"bg-white"}`}>🛂 عروض التأشيرات</button><button type="button" onClick={()=>setFilterKind("ALL")} className={`rounded-full border px-5 py-3 text-sm font-bold ${filterKind==="ALL"?"bg-[#D4AF37]":"bg-white"}`}>جميع العروض</button>
        </div>}
        <button onClick={()=>void load()} disabled={busy||loading} className="rounded-full border border-[#D4AF37]/40 px-5 py-3 text-sm font-bold disabled:opacity-40">تحديث</button>
      </div>
      {error&&<p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
      {status&&<p role="status" className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">{status}</p>}
      {loading&&<p className="mt-5 text-sm">جاري تحميل البيانات...</p>}
      {tab==="requests"&&(
        <div className={"mt-5 grid items-start gap-5 xl:grid-cols-1"}>
          <section className={selected?"hidden":"min-w-0"}>
            <div className="mb-4 flex flex-wrap items-center gap-2"><span className="text-sm font-bold">تصفية الطلبات:</span><button type="button" onClick={()=>setRequestStatusFilter("ALL")} className={`rounded-full border px-3 py-2 text-xs ${requestStatusFilter==="ALL"?"bg-[#0D3B34] text-white":"bg-white"}`}>الكل ({serviceRequests.length})</button>{requestStatuses.map(st=><button type="button" key={st} onClick={()=>setRequestStatusFilter(st)} className={`rounded-full border px-3 py-2 text-xs ${requestStatusFilter===st?"bg-[#0D3B34] text-white":"bg-white"}`}>{st} ({serviceRequests.filter(q=>q.status===st).length})</button>)}<span className="text-xs text-[#0D3B34]/60">الأحدث أولاً</span></div>
            <div className={"grid grid-cols-1 gap-2"}>
            {filteredRequests.length===0&&!loading&&<p className="rounded-2xl border bg-white p-5 text-sm">لا توجد طلبات قابلة للعرض حالياً.</p>}
            {filteredRequests.map(q=>(
              <button key={q.id} onClick={()=>choose(q)} className={`grid w-full min-w-0 grid-cols-1 items-center gap-2 rounded-xl border px-4 py-3 text-right transition hover:shadow-md sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,.8fr)_minmax(0,.7fr)] ${rowTheme[q.status]?.row||"border-[#D4AF37]/25 bg-white"}`}>
                <div className="min-w-0"><p className="truncate text-sm font-black">{q.customerName}</p><p className="mt-1 truncate text-[11px] text-[#0D3B34]/60">{q.reference} · {q.kind==="FERRY"?"باخرة":q.kind==="VISA"?"تأشيرة":q.kind==="DRIVING_LICENSE"?"رخصة دولية":"طيران"}</p></div>
                <div className="min-w-0 text-xs"><p className="truncate">{q.origin} ← {q.destination}</p><p className="mt-1 text-[#0D3B34]/60">{day(q.travelDate)}</p></div>
                <div className="text-xs font-bold">{q.quoteAmountSar==null?"لم يسعّر بعد":Number(q.quoteAmountSar).toLocaleString("ar-SA")+" ر.س"}</div>
                <div className="flex items-center justify-between gap-2 sm:justify-end"><span className={`rounded-full px-3 py-1 text-[11px] font-black ${rowTheme[q.status]?.badge||"bg-[#EDF2EB]"}`}>{statusNames[q.status]||q.status}</span><span className="text-xs text-[#A78332]">فتح ←</span></div>
              </button>
            ))}
            </div>
          </section>
          <section className={`${selected?"":"hidden"} min-w-0 rounded-[25px] border border-[#D4AF37]/35 bg-white p-5 shadow-md lg:p-6`}>
            {!selected? <p className="text-sm">اختر طلباً من القائمة لفتح تفاصيله وتجهيز عرض السعر.</p> : (
              <>
                {<button type="button" onClick={()=>setSelected(null)} className="mb-4 rounded-xl border border-[#B99124] px-4 py-2 text-sm font-bold">← إغلاق الطلب والعودة للقائمة</button>}
                <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">طلب {selected.reference}</h2><span className="rounded-full bg-[#E8F2EC] px-4 py-2 text-xs font-black text-[#0D3B34]">{statusNames[selected.status]||selected.status}</span><span className="rounded-xl bg-[#FFF8E4] px-4 py-2 text-sm font-black">{selected.quoteAmountSar==null?"لم يتم التسعير":Number(selected.quoteAmountSar).toLocaleString("ar-SA")+" ر.س"}</span></div>
                <a href={`https://wa.me/${customerWhatsApp}?text=${encodeURIComponent(`السلام عليكم ${selected.customerName}، بخصوص طلبك رقم ${selected.reference} لخدمة ${selected.kind==="FLIGHT"?"الطيران":selected.kind==="FERRY"?"البواخر":selected.kind==="VISA"?"التأشيرات":"الرخصة الدولية"} لدى أريس لوب. نتابع معك تفاصيل طلبك.`)}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-xl bg-[#147D55] px-5 py-3 text-sm font-black text-white">واتساب العميل مباشرة ↗</a>
                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#F7F4EB] p-4 text-sm">
                  <p>الاسم: <b>{selected.customerName}</b></p>
                  <p>التواصل: <b dir="ltr">+{selected.countryCode}{selected.phone}</b></p>
                  <p>المغادرة: <b>{selected.origin}</b></p>
                  <p>الوصول: <b>{selected.destination}</b></p>
                  <p>السفر: <b>{day(selected.travelDate)}</b></p>
                  <p>العدد: <b>{selected.adults} بالغ / {selected.children} طفل / {selected.infants} رضيع</b></p>
                </div>
                {selected.kind==="FLIGHT"&&<div className="mt-3 rounded-xl border border-[#D4AF37]/25 bg-[#F8F5EC] p-4 text-xs leading-7">
                  <b>نوع الرحلة:</b> {selected.tripType==="ROUND_TRIP"?"ذهاب وعودة":selected.tripType==="MULTI_CITY"?"متعدد الوجهات":"ذهاب فقط"}
                  {selected.returnDate&&<p>تاريخ العودة: {day(selected.returnDate)}</p>}
                  {Array.isArray(selected.itinerary)&&selected.itinerary.map((leg,index)=>{
                    const value=leg as {origin:string;destination:string;travelDate:string};
                    return <p key={index}>الرحلة {index+1}: {value.origin} ← {value.destination} · {value.travelDate}</p>;
                  })}
                </div>}
                {selected.notes&&<p className="mt-3 whitespace-pre-wrap rounded-xl border p-3 text-xs leading-7">ملاحظات العميل: {selected.notes}</p>}
                <div className="mt-4 grid items-start gap-3 lg:grid-cols-3">
                <details className="min-w-0 rounded-2xl border border-[#D4AF37]/35 bg-[#FFFCF4] p-4" open><summary className="cursor-pointer text-sm font-black">⚙️ حالة الطلب والإسناد · {statusNames[selected.status]||selected.status} · {staffName(selected.assignedToId)}</summary><div className="mt-3">
                  
                  <p className="mt-2 text-sm">الموظف المسؤول: <b>{staffName(selected.assignedToId)}</b></p>
                  {showSuper&&<div className="mt-3 flex flex-wrap gap-2">
                    <select aria-label="إسناد الطلب لموظف" className={field+" min-w-0 flex-1"} value={selected.assignedToId||""} onChange={e=>void performAction("ASSIGN",{assignedToId:e.target.value})} disabled={busy}>
                      <option value="">غير مسند</option>
                      {staff.filter(u=>u.role==="SUPER_ADMIN"||(Array.isArray(u.adminPermissions)&&u.adminPermissions.includes(selected.kind==="FERRY"?"TRANSPORT_FERRIES":selected.kind==="VISA"?"TRANSPORT_VISAS":selected.kind==="DRIVING_LICENSE"?"TRANSPORT_DRIVING_LICENSE":"TRANSPORT_FLIGHTS"))).map(u=><option key={u.id} value={u.id}>{[u.firstName,u.lastName].filter(Boolean).join(" ")||u.email} · {u.role}</option>)}
                    </select>
                  </div>}
                  <p className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-bold">الحالة: {statusNames[selected.status]||selected.status}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(transitions[selected.status]||[]).filter(x=>x!=="CANCELED"&&x!=="QUOTE_READY"&&x!=="PAID"&&!(["FLIGHT","FERRY"].includes(selected.kind)&&x==="DONE")).map(next=>
                      <button key={next} type="button" disabled={busy} onClick={()=>void performAction("SET_STATUS",{status:next})}
                        className="rounded-full border border-[#D4AF37]/40 bg-white px-4 py-2 text-xs font-bold disabled:opacity-40">
                        {statusNames[next]}
                      </button>)}
                  </div>
                  {(transitions[selected.status]||[]).includes("CANCELED")&&<details className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3"><summary className="cursor-pointer font-bold text-red-800">إلغاء الطلب</summary><div className="mt-3 grid gap-3">
                    <label className={label}>جهة الإلغاء
                      <select className={field} value={cancelBy} onChange={e=>setCancelBy(e.target.value)}>
                        <option value="STAFF">الموظف</option><option value="PARTNER">الشريك / مقدم الخدمة</option><option value="CUSTOMER">العميل</option>
                      </select>
                    </label>
                    <label className={label}>سبب الإلغاء (إلزامي)
                      <textarea className={field} minLength={5} maxLength={1500} rows={2} value={cancelReason} onChange={e=>setCancelReason(e.target.value)} placeholder="وضح سبب الإلغاء مع التفاصيل..."/>
                    </label>
                    <button type="button" disabled={busy||cancelReason.trim().length<5} onClick={()=>void performAction("SET_STATUS",{status:"CANCELED",canceledBy:cancelBy,cancellationReason:cancelReason})} className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40">تأكيد إلغاء الطلب</button>
                  </div></details>}
                  {selected.cancellationReason&&<p className="mt-3 whitespace-pre-wrap text-sm text-red-700">سبب الإلغاء: {selected.cancellationReason}</p>}
                </div></details>
                <div className="min-w-0 rounded-2xl border border-[#D4AF37]/35 bg-[#F3F8F6] p-4"><h3 className="text-sm font-black text-[#0D3B34]">التواصل مع العميل</h3><p className="mt-2 text-xs text-[#0D3B34]/65">يمكنك مراجعة الرد والملاحظات وإرسال الرسائل من أقسام الطلب.</p><a className="mt-3 inline-flex rounded-lg bg-[#147D55] px-3 py-2 text-xs font-bold text-white" href={`https://wa.me/${customerWhatsApp}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">واتساب العميل ↗</a></div>
                <div className="min-w-0 rounded-2xl border border-[#D4AF37]/35 bg-[#F9F6EC] p-4"><h3 className="text-sm font-black">المرفقات والسداد</h3>
                <details className="mt-3 rounded-2xl border border-[#D4AF37]/30 bg-white p-4"><summary className="cursor-pointer text-sm font-black">📎 المرفقات وطلب مستندات إضافية</summary><AdminRequestAttachments reference={selected.reference}/></details>
                <details className="mt-3 rounded-2xl border border-[#D4AF37]/30 bg-white p-4"><summary className="cursor-pointer text-sm font-black">💳 مراجعة السداد والمرفقات المالية</summary><AdminPaymentReview reference={selected.reference} onReviewed={next=>{setSelected(current=>current?{...current,status:next}:current);void loadHistory(selected.id);void load();}}/></details>
                {["FLIGHT","FERRY"].includes(selected.kind)&&<AdminTicketFulfillment reference={selected.reference} id={selected.id} status={selected.status} onStatusChange={next=>{setSelected(current=>current?{...current,status:next}:current);void loadHistory(selected.id);void load();}}/>}
                {selected.kind==="FLIGHT"&&<AdminConfirmedBooking id={selected.id}/>}
                </div>
                </div>
                {initialOfferKind!=="VISA"&&<div className="mt-4 grid items-start gap-4 lg:grid-cols-2"><section className="min-w-0 rounded-2xl border border-[#D4AF37]/35 bg-[#FFFAEE] p-4">
 <h3 className="font-black">قرار توفر الخدمة وإرسال العرض للعميل</h3>
 <div className="mt-3 flex flex-wrap gap-4"><label className="flex items-center gap-2"><input type="radio" checked={visaAvailability==="AVAILABLE"} onChange={()=>setVisaAvailability("AVAILABLE")}/>متاح</label><label className="flex items-center gap-2"><input type="radio" checked={visaAvailability==="UNAVAILABLE"} onChange={()=>setVisaAvailability("UNAVAILABLE")}/>غير متاح</label></div>
 {visaAvailability==="AVAILABLE"?<div className="mt-4 grid gap-3">
 <label className={label}>السعر الإجمالي بالريال<input type="number" min="0.01" step="0.01" className={field} value={form.quoteAmountSar} onChange={e=>setForm(v=>({...v,quoteAmountSar:e.target.value}))}/></label>
 <label className={label}>تفاصيل العرض للعميل<textarea rows={3} className={field} value={form.quoteNotes} onChange={e=>setForm(v=>({...v,quoteNotes:e.target.value}))}/></label>
 <button type="button" disabled={busy||!(Number(form.quoteAmountSar)>0)||["CANCELED","DONE","PAID","EXECUTING"].includes(selected.status)} onClick={()=>void publishVisaDecision()} className="rounded-xl bg-[#0D3B34] px-4 py-3 font-bold text-white disabled:opacity-40">إرسال عرض السعر للعميل</button>
 </div>:<div className="mt-4 grid gap-3"><label className={label}>سبب عدم التوفر<textarea rows={3} className={field} value={cancelReason} onChange={e=>setCancelReason(e.target.value)}/></label><button type="button" disabled={busy||["CANCELED","DONE","PAID","EXECUTING"].includes(selected.status)} onClick={()=>void publishVisaDecision()} className="rounded-xl bg-red-700 px-4 py-3 font-bold text-white disabled:opacity-40">إرسال الاعتذار وإغلاق الطلب</button></div>}
 </section><aside className="min-w-0 rounded-2xl border border-[#D4AF37]/35 bg-white p-4"><h3 className="text-sm font-black">ملخص التسعير والإجراء</h3><div className="mt-3 space-y-3 text-sm"><p>العميل: <b>{selected.customerName}</b></p><p>الحالة: <b>{statusNames[selected.status]||selected.status}</b></p><p>السعر المحفوظ: <b>{selected.quoteAmountSar==null?"لم يتم التسعير":Number(selected.quoteAmountSar).toLocaleString("ar-SA")+" ر.س"}</b></p></div><p className="mt-4 text-xs leading-6 text-[#0D3B34]/65">ملف PDF وإجراءات العرض التفصيلية متاحة في قسم إعداد عرض السعر أدناه.</p></aside></div>}
 {initialOfferKind==="VISA"?<div className="mt-5 grid gap-4 md:grid-cols-2">
                  <section className="rounded-2xl border border-[#D4AF37]/35 bg-[#FFFAEE] p-4">
                    <h3 className="font-bold">توفر الخدمة المطلوبة</h3>
                    <div className="mt-3 flex gap-3"><label className="flex items-center gap-2"><input type="radio" checked={visaAvailability==="AVAILABLE"} onChange={()=>setVisaAvailability("AVAILABLE")}/>متاحة</label><label className="flex items-center gap-2"><input type="radio" checked={visaAvailability==="UNAVAILABLE"} onChange={()=>setVisaAvailability("UNAVAILABLE")}/>غير متاحة</label></div>
                    {visaAvailability==="AVAILABLE"?<div className="mt-4 grid gap-3">
                      <label className={label}>السعر الإجمالي بالريال<input required type="number" min="0.01" step=".01" className={field} value={form.quoteAmountSar} onChange={e=>setForm(f=>({...f,quoteAmountSar:e.target.value}))}/></label>
                      <label className={label}>تعليق للعميل<textarea rows={4} className={field} value={form.quoteNotes} onChange={e=>setForm(f=>({...f,quoteNotes:e.target.value}))}/></label>
                      <button type="button" disabled={busy||!(Number(form.quoteAmountSar)>0)||["CANCELED","DONE","PAID","EXECUTING"].includes(selected.status)} onClick={()=>void publishVisaDecision()} className="rounded-xl bg-[#0D3B34] p-3 font-bold text-white disabled:opacity-40">إرسال العرض للعميل وتحويل الطلب إلى تحت الإجراء</button>
                    </div>:<div className="mt-4 grid gap-3"><label className={label}>توضيح سبب عدم التوفر (اختياري)<textarea rows={3} className={field} value={cancelReason} onChange={e=>setCancelReason(e.target.value)}/></label><button type="button" disabled={busy||["CANCELED","DONE","PAID","EXECUTING"].includes(selected.status)} onClick={()=>void publishVisaDecision()} className="rounded-xl bg-red-700 p-3 font-bold text-white disabled:opacity-40">إغلاق الطلب وإرسال الاعتذار تلقائياً</button></div>}
                  </section>
                  <section className="rounded-2xl border border-[#D4AF37]/35 bg-white p-4">
                    <h3 className="font-bold">التواصل وحالة الطلب</h3><p className="mt-2 text-sm">الحالة: {statusNames[selected.status]||selected.status}</p>
                    {showSuper&&<label className={label+" mt-3"}>إسناد إلى موظف<select className={field} value={selected.assignedToId||""} disabled={busy} onChange={e=>void performAction("ASSIGN",{assignedToId:e.target.value})}><option value="">غير مسند</option>{staff.filter(u=>u.role==="SUPER_ADMIN"||(Array.isArray(u.adminPermissions)&&u.adminPermissions.includes("TRANSPORT_VISAS"))).map(u=><option key={u.id} value={u.id}>{[u.firstName,u.lastName].filter(Boolean).join(" ")||u.email}</option>)}</select></label>}
                    <p className="mt-3 text-xs text-[#49655D]">يظهر السعر والتعليق أو الاعتذار للعميل في «طلباتي» عند الضغط على الزر الموحّد أعلاه.</p>
                  </section>
                </div>:<>                <section className="mt-4 rounded-2xl border border-[#D4AF37]/35 bg-[#FFFAEE] p-4">
                  <h3 className="text-sm font-black">رد يظهر للعميل في «طلباتي»</h3>
                  <p className="mt-1 text-xs leading-6 text-[#0D3B34]/65">هذا الرد عام للعميل، ومختلف عن ملاحظات الموظفين الداخلية.</p>
                  <textarea maxLength={2500} rows={3} className={field+" mt-3"} value={replyDraft} onChange={e=>setReplyDraft(e.target.value)} placeholder="اكتب رد أريس على العميل..."/>
                  <button type="button" onClick={()=>void publishReply()} disabled={busy||replyDraft.trim().length<1} className="mt-3 rounded-xl bg-[#0D3B34] px-5 py-3 text-xs font-black text-white disabled:opacity-40">نشر الرد للعميل</button>
                </section>
                <details className="mt-5 overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-white" open={false}><summary className="cursor-pointer select-none bg-[#F9F6EC] px-4 py-4 text-sm font-black text-[#0D3B34]">▤ إعداد عرض السعر وملف PDF والتواصل مع العميل <span className="mr-2 text-xs font-normal text-[#0D3B34]/60">اضغط لعرض التفاصيل</span></summary><div className="p-4">
                <form onSubmit={saveQuote} className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2 rounded-xl border border-[#D4AF37]/35 bg-[#F9F6EC] px-4 py-3 text-sm font-bold">حالة الطلب الحالية: {statusNames[selected.status]||selected.status}</div>
                  <label className={label}>المشغّل / الباخرة / شركة الطيران
                    {selected.kind==="FLIGHT" ? <AirlineLookup ariaLabel="ابحث عن شركة الطيران" value={form.carrierName} onChange={v=>setForm(f=>({...f,carrierName:v}))} placeholder="اختر شركة طيران برمز IATA أو اكتب اسماً آخر"/> :
                      <><input className={field} list="ferry-operators-quote" value={form.carrierName} onChange={e=>setForm(f=>({...f,carrierName:e.target.value}))} placeholder="اسم الباخرة" maxLength={100}/>
                        <datalist id="ferry-operators-quote">{operators.FERRY.map(n=><option value={n} key={n}/>)}</datalist></>}
                  </label>
                  <label className={label}>سعر العرض الإجمالي (ريال سعودي)<input className={field} type="number" min="0" step=".01" value={form.quoteAmountSar} onChange={e=>setForm(f=>({...f,quoteAmountSar:e.target.value}))} placeholder="0.00"/></label>
                  <label className={label}>صلاحية العرض حتى<input className={field} type="date" value={form.quoteValidUntil} onChange={e=>setForm(f=>({...f,quoteValidUntil:e.target.value}))}/></label>
                  <label className={label+" sm:col-span-2"}>ملاحظات العرض للعميل / توقف الباخرة<textarea className={field} rows={3} maxLength={2500} value={form.quoteNotes} onChange={e=>setForm(f=>({...f,quoteNotes:e.target.value}))} placeholder="مثل: جودي غير متاحة حالياً، وتوجد رحلة دليلة في الموعد المحدد..."/></label>
                  <label className={label+" sm:col-span-2"}>ملاحظات داخلية للموظف (لا تظهر في PDF)<textarea className={field} rows={2} maxLength={2500} value={form.adminNotes} onChange={e=>setForm(f=>({...f,adminNotes:e.target.value}))}/></label>
                  <button disabled={busy} className="rounded-xl bg-[#0D3B34] px-5 py-3 font-bold text-white disabled:opacity-40 sm:col-span-2" type="submit">حفظ تفاصيل عرض السعر</button>
                </form>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <Link href={`/admin/transport/quote/${selected.id}`} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[#D4AF37]/50 bg-[#FFF8E4] px-4 py-3 text-center text-sm font-bold">فتح عرض السعر · طباعة PDF</Link>
                  {selected.status==="QUOTE_READY"&&selected.quoteAmountSar!==null&&<button type="button" disabled={busy} onClick={()=>void publishQuoteToCustomer()} className="rounded-xl bg-[#0D3B34] px-4 py-3 text-center text-sm font-black text-white transition hover:bg-[#17604E] disabled:opacity-45">✓ نشر عرض السعر للعميل في طلباتي</button>}
                  <a href={`https://wa.me/${customerWhatsApp}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[#D4AF37]/50 bg-white px-4 py-3 text-center text-sm font-bold">فتح محادثة العميل في واتساب</a>
                </div>
                <p className="mt-3 text-xs leading-7 text-[#0D3B34]/65">احفظ عرض السعر PDF ثم أرفقه يدوياً من حساب واتساب الشركة في المحادثة المفتوحة. فتح المحادثة وحده لا يعني إرسال الملف. لا يتم إرسال المستند تلقائياً قبل ربط WhatsApp Cloud API.</p>
                <button disabled={busy||selected.whatsappStatus==="MANUALLY_MARKED_SENT"||!["QUOTE_READY","QUOTE_SENT"].includes(selected.status)} type="button" onClick={()=>void markManuallySent()} className="mt-4 w-full rounded-xl border border-[#D4AF37]/35 px-4 py-3 text-sm font-bold">تأكيد الموظف أنه أرسل PDF يدوياً</button>
                <p className="mt-2 text-xs">حالة العرض في المنصة: {selected.status==="QUOTE_SENT"?"منشور":selected.status==="QUOTE_READY"?"محفوظ ولم يُنشر":statusNames[selected.status]||selected.status} · حالة واتساب: {selected.whatsappStatus==="MANUALLY_MARKED_SENT"?"أكد الموظف الإرسال يدوياً":"لم يتم إثبات الإرسال"}</p>
                </div></details>
</>}                <section className="mt-6 rounded-2xl border border-[#D4AF37]/30 bg-[#FBF9F4] p-4">
                  <div className="flex items-center justify-between gap-3"><h3 className="font-black">سجل إجراءات الطلب</h3><button type="button" onClick={()=>void loadHistory(selected.id)} className="text-xs font-bold text-[#A67D28]">تحديث</button></div>
                  {history.length===0?<p className="mt-3 text-xs text-[#0D3B34]/60">لا توجد إجراءات محفوظة لعرضها.</p>:
                    <ol className="mt-4 space-y-3">{history.map(e=><li key={e.id} className="rounded-xl border border-[#D4AF37]/25 bg-white p-3 text-xs leading-6">
                      <p className="font-bold">{e.actorName} · {e.action==="ASSIGNED"?"إسناد موظف":e.action==="QUOTE_SAVED"?"حفظ عرض السعر":e.action==="QUOTE_MARKED_SENT_MANUALLY"?"تأكيد إرسال العرض":e.action==="CANCELED"?"إلغاء الطلب":e.action==="REQUEST_CREATED"?"إنشاء الطلب":"تغيير حالة"}</p>
                      {e.toStatus&&<p>الحالة: {statusNames[e.fromStatus||""]||"—"} ← {statusNames[e.toStatus]||e.toStatus}</p>}
                      <p className="text-[#0D3B34]/55">{new Date(e.createdAt).toLocaleString("ar-SA")}</p>
                    </li>)}</ol>}
                </section>
              </>
            )}
          </section>
        </div>
      )}
      {tab==="offers"&&(
        <div className={`mt-7 grid items-start gap-6 ${offerEditorOpen?"xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]":""}`}>
          {offerEditorOpen&&<section className="rounded-[25px] border border-[#D4AF37]/35 bg-white p-6">
            <h2 className="text-xl font-black">{offerForm.id?"تعديل عرض أو جدول":"إضافة عرض أو جدول جديد"}</h2>
            {!showSuper&&<p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-800">تعديل العروض والأسعار والصور متاح للسوبر أدمن فقط.</p>}
            <p className="mt-2 text-xs leading-7">الأسعار تظهر في البطاقات الجانبية، وليس داخل نموذج طلب العميل. في البواخر أضف حالة التشغيل والملاحظات عند توقف أي باخرة.</p>
            <form onSubmit={saveOffer} className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <label className={label}>الخدمة<select className={field} disabled={initialOfferKind!=="ALL"} value={offerForm.kind} onChange={e=>setOfferForm(f=>({...f,kind:e.target.value}))}><option value="FERRY">بواخر</option><option value="FLIGHT">طيران</option><option value="VISA">تأشيرات</option></select></label>
              <label className={label}>الناقل / الباخرة
                {offerForm.kind==="FLIGHT" ? <AirlineLookup ariaLabel="شركة الطيران في الإعلان" value={offerForm.carrierName} onChange={v=>setOfferForm(f=>({...f,carrierName:v}))} /> : offerForm.kind==="VISA" ? <input className={field} value={offerForm.carrierName} onChange={e=>setOfferForm(f=>({...f,carrierName:e.target.value}))} placeholder="جهة أو نوع الخدمة"/> :
                  <><input className={field} list="offer-operators" value={offerForm.carrierName} onChange={e=>setOfferForm(f=>({...f,carrierName:e.target.value}))} placeholder="اختر الباخرة"/><datalist id="offer-operators">{ferryOperators.map(v=><option key={v} value={v}/>)}</datalist></>}
              </label>
              <label className={label+" sm:col-span-2 xl:col-span-2"}>اسم العرض / الجدول<input required maxLength={160} className={field} value={offerForm.title} onChange={e=>setOfferForm(f=>({...f,title:e.target.value}))}/></label>
              <label className={label}>{offerForm.kind==="VISA"?"بلد الإقامة أو الجنسية":"من"}
                {offerForm.kind==="FLIGHT" ? <AirportLookup ariaLabel="مطار أو مدينة المغادرة" value={offerForm.origin} onChange={v=>setOfferForm(f=>({...f,origin:v}))}/> : offerForm.kind==="VISA" ? <input className={field} value={offerForm.origin} onChange={e=>setOfferForm(f=>({...f,origin:e.target.value}))} placeholder="بلد الإقامة أو الجنسية"/> :
                  <select className={field} value={offerForm.origin} onChange={e=>setOfferForm(f=>({...f,origin:e.target.value,destination:e.target.value==="جدة"?"سواكن":"جدة"}))}><option value="سواكن">سواكن</option><option value="جدة">جدة</option></select>}
              </label>
              <label className={label}>{offerForm.kind==="VISA"?"الدولة":"إلى"}
                {offerForm.kind==="FLIGHT" ? <AirportLookup ariaLabel="مطار أو مدينة الوصول" value={offerForm.destination} onChange={v=>setOfferForm(f=>({...f,destination:v}))}/> : offerForm.kind==="VISA" ? <input className={field} value={offerForm.destination} onChange={e=>setOfferForm(f=>({...f,destination:e.target.value}))} placeholder="الدولة أو الوجهة"/> :
                  <select className={field} value={offerForm.destination} onChange={e=>setOfferForm(f=>({...f,destination:e.target.value,origin:e.target.value==="جدة"?"سواكن":"جدة"}))}><option value="جدة">جدة</option><option value="سواكن">سواكن</option></select>}
              </label>
              <label className={label}>تاريخ بدء ظهور العرض
                <input className={field} type="date" value={offerForm.startsAt} onChange={e=>setOfferForm(f=>({...f,startsAt:e.target.value}))}/>
              </label>
              <label className={label}>تاريخ آخر يوم لظهور العرض
                <input className={field} type="date" min={offerForm.startsAt||undefined} value={offerForm.endsAt} onChange={e=>setOfferForm(f=>({...f,endsAt:e.target.value}))}/>
              </label>
              <p className="sm:col-span-2 xl:col-span-2 xl:col-start-3 rounded-lg bg-[#F7F2E6] px-4 py-3 text-xs leading-6">تاريخ نهاية العرض شامل طوال اليوم المحدد. عند انتهاء المدة يختفي تلقائياً من صفحة العميل، ويظل محفوظاً في الإدارة.</p>
              <label className={label}>نمط مواعيد السفر<select className={field} value={offerForm.scheduleType} onChange={e=>setOfferForm(f=>({...f,scheduleType:e.target.value}))}><option value="SINGLE">تاريخ واحد</option><option value="MULTIPLE">تواريخ متعددة</option><option value="RANGE">فترة من إلى</option><option value="WEEKLY">أيام أسبوعية</option><option value="MONTHLY">أيام من كل شهر</option></select></label>
              {offerForm.scheduleType==="SINGLE"&&<label className={label}>موعد السفر/الإبحار<input className={field} type="date" value={offerForm.travelDate} onChange={e=>setOfferForm(f=>({...f,travelDate:e.target.value}))}/></label>}
              {offerForm.scheduleType==="MULTIPLE"&&<label className={label}>التواريخ المتعددة (كل تاريخ في سطر أو مفصول بفاصلة)<textarea className={field} rows={2} placeholder="2026-11-05، 2026-11-15" value={offerForm.scheduleDates} onChange={e=>setOfferForm(f=>({...f,scheduleDates:e.target.value}))}/></label>}
              {offerForm.scheduleType==="RANGE"&&<><label className={label}>بداية الفترة<input className={field} type="date" value={offerForm.rangeFrom} onChange={e=>setOfferForm(f=>({...f,rangeFrom:e.target.value}))}/></label><label className={label}>نهاية الفترة<input className={field} type="date" value={offerForm.rangeTo} onChange={e=>setOfferForm(f=>({...f,rangeTo:e.target.value}))}/></label></>}
              {offerForm.scheduleType==="WEEKLY"&&<label className={label}>أيام الأسبوع (0 الأحد إلى 6 السبت)<input className={field} placeholder="مثال: 0، 3، 6" value={offerForm.weekdaysText} onChange={e=>setOfferForm(f=>({...f,weekdaysText:e.target.value}))}/></label>}
              {offerForm.scheduleType==="MONTHLY"&&<label className={label}>أيام الشهر (1 إلى 31)<input className={field} placeholder="مثال: 5، 15، 25" value={offerForm.monthDaysText} onChange={e=>setOfferForm(f=>({...f,monthDaysText:e.target.value}))}/></label>}
              {(offerForm.scheduleType==="WEEKLY"||offerForm.scheduleType==="MONTHLY")&&<label className={label}>آخر موعد للتكرار (اختياري)<input className={field} type="date" value={offerForm.scheduleUntil} onChange={e=>setOfferForm(f=>({...f,scheduleUntil:e.target.value}))}/></label>}
              <label className={label}>السعر المعلن (ريال)<input className={field} type="number" min="0" step=".01" value={offerForm.amountSar} onChange={e=>setOfferForm(f=>({...f,amountSar:e.target.value}))}/></label>
              <label className={label}>سعر البالغ (ريال)<input className={field} type="number" min="0" step=".01" value={offerForm.adultPriceSar} onChange={e=>setOfferForm(f=>({...f,adultPriceSar:e.target.value}))}/></label>
              <label className={label}>سعر الطفل (ريال)<input className={field} type="number" min="0" step=".01" value={offerForm.childPriceSar} onChange={e=>setOfferForm(f=>({...f,childPriceSar:e.target.value}))}/></label>
              <label className={label}>سعر الرضيع (ريال)<input className={field} type="number" min="0" step=".01" value={offerForm.infantPriceSar} onChange={e=>setOfferForm(f=>({...f,infantPriceSar:e.target.value}))}/></label>
              <label className={label}>وحدة / ملاحظة السعر<input className={field} placeholder="مثلاً: يبدأ من / حسب الناقل" value={offerForm.priceUnit} onChange={e=>setOfferForm(f=>({...f,priceUnit:e.target.value}))}/></label>
              <label className={label}>حالة التشغيل<select className={field} value={offerForm.operationStatus} onChange={e=>setOfferForm(f=>({...f,operationStatus:e.target.value}))}><option value="AVAILABLE">تعمل / متاحة</option><option value="SUSPENDED">متوقفة حالياً</option><option value="UNKNOWN">غير مؤكد</option></select></label>
              <label className={label+" sm:col-span-2 xl:col-span-2 xl:col-start-3"}>وصف العرض<textarea className={field} rows={3} value={offerForm.description} onChange={e=>setOfferForm(f=>({...f,description:e.target.value}))}/></label>
              <label className={label+" sm:col-span-2 xl:col-span-2 xl:col-start-3"}>ملاحظات التشغيل التي تظهر للعميل<textarea className={field} rows={2} value={offerForm.operationNote} onChange={e=>setOfferForm(f=>({...f,operationNote:e.target.value}))} placeholder="مثلاً: الباخرة متوقفة حالياً حتى إشعار آخر"/></label>
              <div className="sm:col-span-2 xl:col-span-2 xl:col-start-3 rounded-[20px] border border-[#D4AF37]/35 bg-[#F8F5EC] p-4">
                <label className={label}>صور الإعلان أو تصميم العرض (PNG / JPG / WEBP — حتى 10 صور)
                  <input type="file" multiple accept="image/png,image/jpeg,image/webp" className={field} onChange={e=>{const files=Array.from(e.target.files||[]);setBannerFile(files[0]||null);setExtraBannerFiles(files.slice(1));setBannerDimensions(null);}} />
                </label>
                <ImageSizeGuidance requirement={IMAGE_REQUIREMENTS.offer} actual={bannerFile ? bannerDimensions : null} />
                <p className="mt-2 text-xs text-[#0D3B34]/60">PNG أو JPG أو WEBP، بحد أقصى 4 ميجابايت للصورة و10 صور للعرض. يجب أن تطابق كل صورة المقاس المحدد وإلا يرفضها النظام.</p>
                {!bannerFile&&offerForm.imageUrls.length>0&&<p className="mt-3 text-xs font-bold text-[#0D3B34]/65">الصور الحالية محفوظة ({offerForm.imageUrls.length}). اختيار صور جديدة يستبدل الصور الحالية.</p>}
                {bannerFile&&<p className="mt-2 text-xs font-bold text-[#0D3B34]/65">سيتم رفع {1+extraBannerFiles.length} صور للعرض.</p>}
                {(bannerPreview||offerForm.bannerUrl)&&<div className="mt-4 overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="معاينة صورة العرض قبل النشر" src={bannerPreview||offerForm.bannerUrl} onLoad={e=>{if(bannerFile)setBannerDimensions({width:e.currentTarget.naturalWidth,height:e.currentTarget.naturalHeight});}} className="h-44 w-full object-contain"/>
                </div>}
              </div>
              <div className="sm:col-span-2 xl:col-span-2 xl:col-start-3 overflow-hidden rounded-[24px] border border-[#D4AF37]/40 bg-white shadow-lg">
                <div className="bg-[#0D3B34] px-5 py-3 text-sm font-black text-white">معاينة بطاقة العرض — نص مع صورة</div>
                {(bannerPreview||offerForm.bannerUrl)&&
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img alt={offerForm.title||"صورة العرض"} src={bannerPreview||offerForm.bannerUrl} className="h-40 w-full bg-[#F8F5EC] object-contain"/>}
                <div className="p-5">
                  <p className="text-xs font-bold text-[#A77B23]">{offerForm.carrierName||"الناقل / الباخرة"}</p>
                  <h3 className="mt-2 text-xl font-black">{offerForm.title||"عنوان العرض"}</h3>
                  <p className="mt-2 text-sm">{offerForm.origin||"من"} ← {offerForm.destination||"إلى"} · {offerForm.travelDate||"موعد يحدد لاحقاً"}</p>
                  {(offerForm.adultPriceSar!==""||offerForm.childPriceSar!==""||offerForm.infantPriceSar!=="")&&<div className="mt-3 flex flex-wrap gap-2 text-xs font-black text-[#9A7620]">{offerForm.adultPriceSar!==""&&<span className="rounded-full bg-[#FBF8EF] px-3 py-1">بالغ {Number(offerForm.adultPriceSar).toLocaleString("ar-SA")} ر.س</span>}{offerForm.childPriceSar!==""&&<span className="rounded-full bg-[#FBF8EF] px-3 py-1">طفل {Number(offerForm.childPriceSar).toLocaleString("ar-SA")} ر.س</span>}{offerForm.infantPriceSar!==""&&<span className="rounded-full bg-[#FBF8EF] px-3 py-1">رضيع {Number(offerForm.infantPriceSar).toLocaleString("ar-SA")} ر.س</span>}</div>}
                  {offerForm.amountSar!==""&&<p className="mt-2 text-sm font-bold">{Number(offerForm.amountSar).toLocaleString("ar-SA")} ر.س {offerForm.priceUnit}</p>}
                  {offerForm.description&&<p className="mt-2 whitespace-pre-line text-sm leading-7">{offerForm.description}</p>}
                  {offerForm.operationNote&&<p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-6 text-amber-900">{offerForm.operationNote}</p>}
                  <p className="mt-3 text-xs text-[#0D3B34]/60">حسب التوفر والتأكيد — العرض ليس تذكرة مؤكدة.</p>
                </div>
              </div>
              <label className={label}>ترتيب العرض<input className={field} type="number" min={0} max={9999} value={offerForm.sortOrder} onChange={e=>setOfferForm(f=>({...f,sortOrder:Number(e.target.value)}))}/></label>
              <label className="flex items-center gap-3 rounded-xl border border-[#D4AF37]/30 p-3 text-sm font-bold"><input type="checkbox" checked={offerForm.isVisible} onChange={e=>setOfferForm(f=>({...f,isVisible:e.target.checked}))}/> ظاهر للزوار</label>
              <div className="flex flex-wrap gap-3 sm:col-span-2 xl:col-span-2 xl:col-start-3">
                <button disabled={busy||!showSuper||Boolean(bannerFile&&(bannerDimensions?.width!==IMAGE_REQUIREMENTS.offer.width||bannerDimensions?.height!==IMAGE_REQUIREMENTS.offer.height))} className="rounded-xl bg-[#0D3B34] px-6 py-3 font-bold text-white disabled:opacity-40">حفظ العرض</button>
                <button type="button" onClick={()=>{setBannerFile(null);setExtraBannerFiles([]);setOfferForm({...blankOffer,kind:initialOfferKind==="ALL"?"FERRY":initialOfferKind,origin:initialOfferKind==="FERRY"?"سواكن":"",destination:initialOfferKind==="FERRY"?"جدة":""});}} className="rounded-xl border border-[#D4AF37] px-5 py-3 text-sm font-bold">عرض جديد</button>
              </div>
            </form>
          </section>}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-black">إدارة العروض ({filteredOffers.length})</h2><button type="button" disabled={!showSuper} onClick={()=>startOffer()} className="rounded-xl bg-[#0D3B34] px-5 py-3 text-sm font-black text-white disabled:opacity-40">+ إضافة عرض</button></div>
              <div className="flex gap-2">
                <button type="button" onClick={()=>setOfferView("CARDS")} className={`rounded-lg border px-4 py-2 text-xs font-bold ${offerView==="CARDS"?"bg-[#0D3B34] text-white":"bg-white"}`}>▦ بطاقات</button>
                <button type="button" onClick={()=>setOfferView("LIST")} className={`rounded-lg border px-4 py-2 text-xs font-bold ${offerView==="LIST"?"bg-[#0D3B34] text-white":"bg-white"}`}>☷ قائمة</button>
              </div>
            </div>
            <select className={field} aria-label="فلترة حالة العروض" value={offerFilter} onChange={e=>setOfferFilter(e.target.value as typeof offerFilter)}>
              <option value="ALL">كل العروض</option>
              <option value="ACTIVE">المفعّلة حالياً</option>
              <option value="PAUSED">الموقوفة يدوياً</option>
              <option value="UPCOMING">مجدولة للنشر</option>
              <option value="EXPIRED">انتهت تلقائياً</option>
            </select>
            {filteredOffers.length===0&&!loading&&<p className="rounded-xl bg-white p-5 text-sm">لا توجد عروض بعد.</p>}
            <div className={offerView==="CARDS"?"grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4":"space-y-3"}>
            {filteredOffers.map(offer=>(
              <article key={offer.id} className={`min-w-0 rounded-[18px] border border-[#D4AF37]/30 bg-white p-3 shadow-sm ${offerView==="LIST"?"flex flex-wrap items-center gap-4":""}`}>
                {offer.bannerUrl&&<div className={offerView==="LIST"?"aspect-[2/1] w-28 shrink-0 overflow-hidden rounded-xl bg-[#F7F4ED]":"mb-3 aspect-[2/1] overflow-hidden rounded-xl bg-[#F7F4ED]"}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={offer.bannerUrl} alt={offer.title} className="h-full w-full object-contain" />
                </div>}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="text-xs font-semibold text-[#947426]">{offer.kind==="FERRY"?"بواخر":offer.kind==="VISA"?"تأشيرات":"طيران"} · {offer.carrierName}</p>
                    <h3 className="mt-1 text-lg font-black">{offer.title}</h3>
                    <p className="mt-2 text-sm">{offer.origin} ← {offer.destination} · {day(offer.travelDate)}</p>
                    {(offer.adultPriceSar!==null||offer.childPriceSar!==null||offer.infantPriceSar!==null)&&<p className="mt-1 text-xs font-black text-[#9A7020]">{offer.adultPriceSar!==null&&`بالغ ${offer.adultPriceSar.toLocaleString("ar-SA")} ر.س `}{offer.childPriceSar!==null&&`طفل ${offer.childPriceSar.toLocaleString("ar-SA")} ر.س `}{offer.infantPriceSar!==null&&`رضيع ${offer.infantPriceSar.toLocaleString("ar-SA")} ر.س`}</p>}
                    {offer.amountSar!==null&&<p className="mt-1 font-bold text-xs text-[#0D3B34]/70">السعر العام: {offer.amountSar.toLocaleString("ar-SA")} ر.س {offer.priceUnit}</p>}
                    <p className="mt-2 text-xs">{offerState(offer)==="ACTIVE"?"ظاهر الآن":offerState(offer)==="PAUSED"?"موقوف":offerState(offer)==="UPCOMING"?"مجدول": "منتهي تلقائياً"} · {offer.operationStatus==="SUSPENDED"?"متوقف":offer.operationStatus==="UNKNOWN"?"قيد التأكيد":"متاح"}</p>
                    {(offer.startsAt||offer.endsAt)&&<p className="mt-1 text-xs text-[#0D3B34]/65">النشر: {offerDay(offer.startsAt)||"الآن"} ← {offerDay(offer.endsAt)||"مفتوح"}</p>}
                    {offer.operationNote&&<p className="mt-2 whitespace-pre-wrap text-xs text-amber-800">{offer.operationNote}</p>}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button onClick={()=>startOffer(offer)} disabled={!showSuper} className="rounded-full border border-[#D4AF37]/40 px-4 py-2 text-xs font-bold disabled:opacity-40">تعديل</button>
                    <button onClick={()=>void setOfferVisibility(offer,!offer.isVisible)} disabled={!showSuper||busy} className="rounded-full border border-[#D4AF37]/40 bg-[#F7F1DE] px-4 py-2 text-xs font-bold disabled:opacity-40">{offer.isVisible?"إيقاف":"تفعيل"}</button>
                    <button onClick={()=>void archiveOffer(offer)} disabled={!showSuper||busy} className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 disabled:opacity-40">حذف</button>
                  </div>
                </div>
              </article>
            ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function AdminRequestAttachments({reference}:{reference:string}){
 const [files,setFiles]=useState<{id:string;name:string}[]>([]);
 useEffect(()=>{let active=true;fetch("/api/customer/request-attachments?reference="+encodeURIComponent(reference),{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>{if(active)setFiles(d?.data||[])}).catch(()=>{});return()=>{active=false}},[reference]);
 return <section className="mt-3 rounded-xl border border-[#D4AF37]/30 bg-white p-4"><h3 className="font-bold">📎 مرفقات العميل ({files.length})</h3>{files.length?files.map(f=><a key={f.id} className="mt-2 block text-xs underline" href={"/api/customer/request-attachments?reference="+encodeURIComponent(reference)+"&file="+encodeURIComponent(f.id)}>{f.name} — تنزيل آمن</a>):<p className="mt-2 text-xs">لا توجد مرفقات لهذا الطلب.</p>}</section>;
}
