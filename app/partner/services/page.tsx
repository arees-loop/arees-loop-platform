"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    google: any;
  }
}

type ServiceStatus =
  | "DRAFT"
  | "UNDER_REVIEW"
  | "PUBLISHED"
  | "SUSPENDED"
  | "REJECTED";

type Service = {
  id: string | number;
  nameAr: string;
  nameEn: string;
  category: string;
  subCategory: string;
  license: string;
  city: string;
  locationName: string;
  formattedAddress: string;
  placeId: string;
  latitude: number | null;
  longitude: number | null;
  basePrice: number;
  vatRate: number;
  finalPrice: number;
  capacity: number;
  bookings: number;
  status: ServiceStatus;
  imageCount: number;
  descriptionAr?: string;
  descriptionEn?: string;
  cancellationPolicy?: string;
  meetingInstructions?: string;
  images?: { url:string; altText?:string|null; sortOrder?:number }[];
  organizerType?: string; organizerName?: string; organizerLicenseNumber?: string; organizerLicenseIssuer?: string; programApprovalNumber?: string;
};

type PartnerApplication = {
  status: string;
  categories: Array<{ name: string }>;
  licenses: Array<{ id: string; type: string; issuer: string; licenseNumber: string; status: string }>;
};

type LocationValue = {
  city: string;
  locationName: string;
  formattedAddress: string;
  placeId: string;
  latitude: number | null;
  longitude: number | null;
};

const statusConfig: Record<
  ServiceStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "مسودة",
    className: "bg-[#F0EFEB] text-[#687873]",
  },
  UNDER_REVIEW: {
    label: "تحت المراجعة",
    className: "bg-[#FFF3D4] text-[#8C6813]",
  },
  PUBLISHED: {
    label: "منشورة",
    className: "bg-[#E6F5EB] text-[#267247]",
  },
  SUSPENDED: {
    label: "موقوفة",
    className: "bg-[#FFE9E7] text-[#A3443E]",
  },
  REJECTED: {
    label: "مرفوضة",
    className: "bg-[#FFE9E7] text-[#A3443E]",
  },
};

const mainCategories = [
  "برامج سياحية","نقل سياحي","حجوزات وتذاكر","مطاعم وكافيهات",
  "تجارب ثرية","مواقع أثرية","حرف يدوية","تقنية وخدمات سياحية","معارض وفعاليات"
];


const money = (value: number) =>
  new Intl.NumberFormat("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function PartnerServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ServiceStatus>("ALL");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [editingServiceId, setEditingServiceId] = useState<string | number | null>(null);
  const [editingOriginalService, setEditingOriginalService] = useState<Service | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | number | null>(null);
  const [form, setForm] = useState({
    nameAr: "",
    nameEn: "",
    category: "",
    subCategory: "",
    license: "",
    city: "",
    locationName: "",
    formattedAddress: "",
    placeId: "",
    latitude: null as number | null,
    longitude: null as number | null,
    basePrice: "",
    vatRate: "included",
    locationUrl: "",
    hasMeetingPoint: false,
    meetingPointName: "",
    meetingPointUrl: "",
    capacity: "",
    descriptionAr: "",
    descriptionEn: "",
    cancellationPolicy: "",
    meetingInstructions: "",
    organizerType: "SELF", organizerName: "", organizerLicenseNumber: "", organizerLicenseIssuer: "", programApprovalNumber: "",
    images: [] as { name: string; url: string }[],
    imagePreviews: [] as { name: string; url: string }[],
    primaryImage: "",
    bookingMode: "direct",
    availableDays: [] as string[],
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    let alive = true;
    fetch("/api/partner/operations", { credentials: "include", cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!alive || !data?.success) return;
        setServices((data.services ?? []).map((service: any) => ({
          id: service.id,
          nameAr: service.nameAr ?? "",
          nameEn: service.nameEn ?? "",
          category: service.category ?? "غير محدد",
          subCategory: service.subCategory ?? "غير محدد",
          license: service.license ? `${service.license.type} - ${service.license.licenseNumber}` : "غير مرتبط",
          city: service.city ?? "",
          locationName: service.locationName ?? "",
          formattedAddress: service.formattedAddress ?? "",
          placeId: service.placeId ?? "",
          latitude: service.latitude,
          longitude: service.longitude,
          basePrice: Number(service.basePrice ?? 0),
          vatRate: Number(service.vatRate ?? 0),
          finalPrice: Number(service.finalPrice ?? 0),
          capacity: Number(service.capacity ?? 0),
          bookings: Number(service.bookingCount ?? 0),
          status: service.status,
          imageCount: service.images?.length ?? 0,
          descriptionAr: service.descriptionAr ?? "", descriptionEn: service.descriptionEn ?? "", cancellationPolicy: service.cancellationPolicy ?? "", meetingInstructions: service.meetingInstructions ?? "", images: service.images ?? [],
        })));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const canSubmitForReview = Boolean(
    form.nameAr.trim() &&
    form.category &&
    form.descriptionAr.trim() &&
    form.city.trim() &&
    form.locationName.trim() &&
    Number.isFinite(form.latitude) &&
    Number.isFinite(form.longitude) &&
    Number(form.basePrice) > 0 &&
    Number(form.capacity) > 0 &&
    form.cancellationPolicy.trim()
  );

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const searchable =
        `${service.nameAr} ${service.nameEn} ${service.category} ${service.subCategory}`.toLowerCase();

      const matchesSearch = searchable.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || service.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [services, search, statusFilter]);

  const summary = useMemo(
    () => ({
      total: services.length,
      published: services.filter(
        (service) => service.status === "PUBLISHED"
      ).length,
      review: services.filter(
        (service) => service.status === "UNDER_REVIEW"
      ).length,
      draft: services.filter(
        (service) => service.status === "DRAFT"
      ).length,
    }),
    [services]
  );

  const calculatedFinalPrice = useMemo(() => {
    const base = Number(form.basePrice) || 0;
    return form.vatRate === "excluded" ? base * 1.15 : base;
  }, [form.basePrice, form.vatRate]);

  const resetForm = () => {
    setForm({
      nameAr: "",
      nameEn: "",
      category: "",
      subCategory: "",
      license: "",
      city: "",
      locationName: "",
      formattedAddress: "",
      placeId: "",
      latitude: null,
      longitude: null,
      basePrice: "",
      vatRate: "included",
      locationUrl: "",
      hasMeetingPoint: false,
      meetingPointName: "",
      meetingPointUrl: "",
      capacity: "",
      descriptionAr: "",
      descriptionEn: "",
      cancellationPolicy: "",
      meetingInstructions: "",
      organizerType: "SELF", organizerName: "", organizerLicenseNumber: "", organizerLicenseIssuer: "", programApprovalNumber: "",
      images: [],
      imagePreviews: [],
      primaryImage: "",
      bookingMode: "direct",
      availableDays: [],
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
    });
  };


  const openNewServiceForm = () => {
    setEditingServiceId(null);
    setEditingOriginalService(null);
    resetForm();
    setShowForm(true);
  };

  const openEditServiceForm = (service: Service) => {
    setEditingServiceId(service.id);
    setEditingOriginalService(service);
    setForm({
      nameAr: service.nameAr,
      nameEn: service.nameEn,
      category: service.category,
      subCategory: service.subCategory,
      license: service.license,
      city: service.city,
      locationName: service.locationName,
      formattedAddress: service.formattedAddress,
      placeId: service.placeId,
      latitude: service.latitude,
      longitude: service.longitude,
      basePrice: String(service.basePrice),
      vatRate: "included",
      locationUrl: "",
      hasMeetingPoint: false,
      meetingPointName: "",
      meetingPointUrl: "",
      capacity: String(service.capacity),
      descriptionAr: service.descriptionAr ?? "",
      descriptionEn: service.descriptionEn ?? "",
      cancellationPolicy: service.cancellationPolicy ?? "",
      meetingInstructions: service.meetingInstructions ?? "",
      organizerType: service.organizerType ?? "SELF", organizerName: service.organizerName ?? "", organizerLicenseNumber: service.organizerLicenseNumber ?? "", organizerLicenseIssuer: service.organizerLicenseIssuer ?? "", programApprovalNumber: service.programApprovalNumber ?? "",
      images: (service.images ?? []).map((image,index)=>({name:image.altText || `صورة ${index+1}`,url:image.url})),
      imagePreviews: (service.images ?? []).map((image,index)=>({name:image.altText || `صورة ${index+1}`,url:image.url})),
      primaryImage: service.images?.[0]?.altText || (service.images?.length ? "صورة 1" : ""),
      bookingMode: "direct",
      availableDays: [],
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
    });
    setShowForm(true);
  };

  const closeServiceForm = () => {
    setShowForm(false);
    setEditingServiceId(null);
    resetForm();
  };

  const buildServiceFromForm = (
    status: ServiceStatus,
    existing?: Service
  ): Service => ({
    id: existing?.id ?? Date.now(),
    nameAr: form.nameAr || "خدمة جديدة",
    nameEn: form.nameEn || "New Service",
    category: form.category || "غير محدد",
    subCategory: form.subCategory || "غير محدد",
    license: form.license || "غير مرتبط",
    city: form.city || "غير محدد",
    locationName: form.locationName || "غير محدد",
    formattedAddress: form.formattedAddress || "",
    placeId: form.placeId || "",
    latitude: form.latitude,
    longitude: form.longitude,
    basePrice: Number(form.basePrice) || 0,
    vatRate: Number(form.vatRate) || 0,
    finalPrice: calculatedFinalPrice,
    capacity: Number(form.capacity) || 0,
    bookings: existing?.bookings ?? 0,
    status,
    imageCount:
      form.images.length > 0 ? form.images.length : existing?.imageCount ?? 0,
  });

  const servicePayload = (submitForReview=false) => ({
    nameAr:form.nameAr,nameEn:form.nameEn,category:form.category,subCategory:form.subCategory,descriptionAr:form.descriptionAr,descriptionEn:form.descriptionEn,
    basePrice:form.basePrice,vatMode:form.vatRate,capacity:form.capacity,city:form.city,locationName:form.locationName,formattedAddress:form.formattedAddress,
    placeId:form.placeId,latitude:form.latitude,longitude:form.longitude,meetingInstructions:form.meetingInstructions,cancellationPolicy:form.cancellationPolicy,
    organizerType:form.organizerType,organizerName:form.organizerName,organizerLicenseNumber:form.organizerLicenseNumber,organizerLicenseIssuer:form.organizerLicenseIssuer,programApprovalNumber:form.programApprovalNumber,
    images:form.images.filter((image)=>image.url).map((image,index)=>({url:image.url,altText:image.name,sortOrder:image.name===form.primaryImage?-1:index})),submitForReview
  });

  const refreshServices = async () => {
    const refreshed=await fetch("/api/partner/operations",{credentials:"include",cache:"no-store"}).then(r=>r.json());
    if(refreshed?.success) setServices((refreshed.services??[]).map((service:any)=>({
      id:service.id,nameAr:service.nameAr??"",nameEn:service.nameEn??"",category:service.category??"غير محدد",subCategory:service.subCategory??"غير محدد",
      license:service.license?`${service.license.type} - ${service.license.licenseNumber}`:"غير مرتبط",city:service.city??"",locationName:service.locationName??"",
      formattedAddress:service.formattedAddress??"",placeId:service.placeId??"",latitude:service.latitude,longitude:service.longitude,basePrice:Number(service.basePrice??0),
      vatRate:Number(service.vatRate??0),finalPrice:Number(service.finalPrice??0),capacity:Number(service.capacity??0),bookings:Number(service.bookingCount??0),status:service.status,
      imageCount:Array.isArray(service.images)?service.images.length:0,descriptionAr:service.descriptionAr??"",descriptionEn:service.descriptionEn??"",
      cancellationPolicy:service.cancellationPolicy??"",meetingInstructions:service.meetingInstructions??"",organizerType:service.organizerType??"SELF",organizerName:service.organizerName??"",organizerLicenseNumber:service.organizerLicenseNumber??"",organizerLicenseIssuer:service.organizerLicenseIssuer??"",programApprovalNumber:service.programApprovalNumber??"",images:service.images??[]
    })));
  };

  const hasMaterialChanges = Boolean(editingOriginalService && (
    form.nameAr.trim() !== (editingOriginalService.nameAr ?? "").trim() ||
    form.nameEn.trim() !== (editingOriginalService.nameEn ?? "").trim() ||
    form.category !== editingOriginalService.category ||
    form.subCategory !== editingOriginalService.subCategory ||
    form.descriptionAr.trim() !== (editingOriginalService.descriptionAr ?? "").trim() ||
    form.descriptionEn.trim() !== (editingOriginalService.descriptionEn ?? "").trim() ||
    Number(form.basePrice || 0) !== Number(editingOriginalService.basePrice || 0) ||
    Number(form.capacity || 0) !== Number(editingOriginalService.capacity || 0) ||
    form.city !== editingOriginalService.city ||
    form.locationName !== editingOriginalService.locationName ||
    form.cancellationPolicy.trim() !== (editingOriginalService.cancellationPolicy ?? "").trim() ||
    form.organizerType !== (editingOriginalService.organizerType ?? "SELF") ||
    form.organizerName.trim() !== (editingOriginalService.organizerName ?? "").trim() ||
    form.organizerLicenseNumber.trim() !== (editingOriginalService.organizerLicenseNumber ?? "").trim()
  ));

  const saveDraft = async () => {
    if(!editingServiceId){ setSubmitMessage("استخدم «إرسال للمراجعة» لإنشاء الخدمة الجديدة."); return; }
    if(submitting)return; setSubmitting(true); setSubmitMessage("");
    try{
      const response=await fetch(`/api/partner/services/${editingServiceId}`,{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({...servicePayload(editingOriginalService?.status==="PUBLISHED" && hasMaterialChanges),submitForReview:editingOriginalService?.status==="PUBLISHED" && hasMaterialChanges})});
      const data=await response.json(); if(!response.ok||!data?.success)throw new Error(data?.message||"تعذر حفظ التعديلات.");
      const sentForReview=editingOriginalService?.status==="PUBLISHED" && hasMaterialChanges;
      await refreshServices(); closeServiceForm(); setSubmitMessage(sentForReview ? "✓ تم حفظ التعديل. التعديل الذي تم جوهري ويحتاج مراجعة الإدارة، وتم إرسال الخدمة للمراجعة." : "✓ تم حفظ التعديلات بنجاح."); window.scrollTo({top:0,behavior:"smooth"});
      window.setTimeout(()=>setSubmitMessage(""),3500);
    }catch(error:any){setSubmitMessage(error?.message||"تعذر حفظ التعديلات.");}finally{setSubmitting(false);}
  };

  const submitForReview = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitMessage("");
    try {
      const response = await fetch(editingServiceId ? `/api/partner/services/${editingServiceId}` : "/api/partner/services", {
        method: editingServiceId ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameAr: form.nameAr, nameEn: form.nameEn, category: form.category,
          subCategory: form.subCategory, descriptionAr: form.descriptionAr,
          descriptionEn: form.descriptionEn, basePrice: form.basePrice,
          vatMode: form.vatRate, capacity: form.capacity, city: form.city,
          locationName: form.locationName, formattedAddress: form.formattedAddress,
          placeId: form.placeId, latitude: form.latitude, longitude: form.longitude,
          hasMeetingPoint: form.hasMeetingPoint, meetingPointName: form.meetingPointName,
          meetingPointUrl: form.meetingPointUrl, meetingInstructions: form.meetingInstructions,
          cancellationPolicy: form.cancellationPolicy, organizerType:form.organizerType, organizerName:form.organizerName, organizerLicenseNumber:form.organizerLicenseNumber, organizerLicenseIssuer:form.organizerLicenseIssuer, programApprovalNumber:form.programApprovalNumber, bookingMode: form.bookingMode,
          availableDays: form.availableDays, startDate: form.startDate, endDate: form.endDate,
          startTime: form.startTime, endTime: form.endTime,
          images: form.images.filter((image)=>image.url).map((image,index)=>({url:image.url,altText:image.name,sortOrder:image.name===form.primaryImage?-1:index})), submitForReview: Boolean(editingServiceId)
        }),
      });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.message || "تعذر حفظ الخدمة.");
      setSubmitMessage(editingOriginalService?.status==="PUBLISHED" ? "✓ تم إرسال طلب التعديلات للمراجعة، وأصبحت حالة الخدمة «تحت المراجعة»." : "✓ تم إرسال الخدمة إلى إدارة Arees Loop للمراجعة والموافقة بنجاح.");
      const refreshed = await fetch("/api/partner/operations", { credentials:"include", cache:"no-store" }).then(r=>r.json());
      if (refreshed?.success) setServices((refreshed.services ?? []).map((service:any)=>({
        id:service.id,nameAr:service.nameAr??"",nameEn:service.nameEn??"",category:service.category??"غير محدد",
        subCategory:service.subCategory??"غير محدد",license:service.license?`${service.license.type} - ${service.license.licenseNumber}`:"غير مرتبط",
        city:service.city??"",locationName:service.locationName??"",formattedAddress:service.formattedAddress??"",placeId:service.placeId??"",
        latitude:service.latitude,longitude:service.longitude,basePrice:Number(service.basePrice??0),vatRate:Number(service.vatRate??0),
        finalPrice:Number(service.finalPrice??0),capacity:Number(service.capacity??0),bookings:Number(service.bookingCount??0),
        status:service.status,imageCount:Array.isArray(service.images)?service.images.length:0
      })));
      closeServiceForm();
    } catch (error:any) {
      setSubmitMessage(error?.message || "تعذر حفظ الخدمة.");
    } finally { setSubmitting(false); }
  };

  const togglePublication = async (service: Service) => {
    const action=service.status==="PUBLISHED"?"HIDE":"PUBLISH";
    setActionMenuId(null); setSubmitMessage("");
    try{
      const response=await fetch(`/api/partner/services/${service.id}`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({action})});
      const data=await response.json(); if(!response.ok||!data?.success)throw new Error(data?.message||"تعذر تنفيذ الإجراء.");
      setServices((current)=>current.map((item)=>item.id===service.id?{...item,status:data.status}:item)); setSubmitMessage(data.message);
    }catch(error:any){setSubmitMessage(error?.message||"تعذر تنفيذ الإجراء.");}
  };

  const requestDeleteService = async (service: Service) => {
    if (!window.confirm(`هل تريد حذف «${service.nameAr}»؟ إذا كانت مرتبطة بحجوزات أو سجل مالي فلن يتم حذفها نهائياً.`)) return;
    setSubmitMessage("");
    try {
      const response = await fetch(`/api/partner/services/${service.id}`, { method:"DELETE", credentials:"include" });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.message || "تعذر حذف الخدمة.");
      setServices((current)=>current.filter((item)=>item.id!==service.id));
      setSubmitMessage(data.message || "تم حذف الخدمة.");
    } catch(error:any) { setSubmitMessage(error?.message || "تعذر حذف الخدمة."); }
  };

  const updateLocation = (location: LocationValue) => {
    setForm((current) => ({
      ...current,
      city: location.city,
      locationName: location.locationName,
      formattedAddress: location.formattedAddress,
      placeId: location.placeId,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
  };

  const [locationQuery, setLocationQuery] = useState("");
  const [locationBusy, setLocationBusy] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<Array<{name:string;address:string;city:string;location:{lat:number;lng:number}}>>([]);
  const locationSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchServiceLocation = async (queryOverride?: string) => {
    const q = (queryOverride ?? locationQuery).trim();
    if (q.length < 2) { setLocationSuggestions([]); return; }
    setLocationBusy(true); setLocationMessage("");
    try {
      const r = await fetch(`/api/location/search?query=${encodeURIComponent(q)}`, { cache: "no-store" });
      const data = await r.json();
      if (!r.ok || !data?.location) throw new Error();
      const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [data];
      setLocationSuggestions(suggestions);
      setLocationMessage(suggestions.length ? "اختر الموقع الصحيح من النتائج أدناه." : "لم نجد نتائج.");
    } catch { setLocationMessage("تعذر العثور على الموقع. جرّب اسم المكان مع المدينة."); }
    finally { setLocationBusy(false); }
  };

  const handleLocationQueryChange = (value: string) => {
    setLocationQuery(value);
    setLocationMessage("");
    if (locationSearchTimer.current) clearTimeout(locationSearchTimer.current);
    if (value.trim().length < 2) { setLocationSuggestions([]); return; }
    locationSearchTimer.current = setTimeout(() => { void searchServiceLocation(value); }, 350);
  };

  const useCurrentServiceLocation = () => {
    setLocationMessage("");
    if (!navigator.geolocation) { setLocationMessage("المتصفح لا يدعم تحديد الموقع."); return; }
    setLocationBusy(true);
    navigator.geolocation.getCurrentPosition(async (p)=>{
      const lat=p.coords.latitude,lng=p.coords.longitude;
      setForm((x)=>({...x,latitude:lat,longitude:lng}));
      try {
        const r=await fetch(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}`,{cache:"no-store"});
        const data=await r.json();
        if(r.ok) setForm((x)=>({...x,latitude:lat,longitude:lng,formattedAddress:data.address||x.formattedAddress,locationName:x.locationName||data.address||"موقعي الحالي",placeId:data.placeId||x.placeId}));
      } catch {}
      setLocationMessage("تم تحديد موقعك الحالي ✓"); setLocationBusy(false);
    },()=>{setLocationMessage("تعذر تحديد موقعك. اسمح للموقع من إعدادات المتصفح.");setLocationBusy(false);},{enableHighAccuracy:true,timeout:12000});
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F7F4EA] text-[#0D3B34]"
      style={{
        fontFamily: "var(--font-ibm-plex-arabic), sans-serif",
      }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-[#0D3B34]/6 blur-[120px]" />
        <div className="absolute -left-40 top-[40%] h-[450px] w-[450px] rounded-full bg-[#D4AF37]/10 blur-[125px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* SIDEBAR */}
        <aside className={`hidden shrink-0 border-l border-[#0D3B34]/8 bg-[#F9F7F0]/92 backdrop-blur-xl transition-all duration-300 xl:block ${sidebarOpen ? "w-[270px] px-4 py-5" : "w-0 overflow-hidden p-0 border-l-0"}`}>
          <div className="mb-7 px-3">
            <p className="text-[10px] font-bold tracking-[0.22em] text-[#B99124]">
              AREES LOOP PARTNER
            </p>

            <h2
              className="mt-2 text-xl font-bold"
              style={{
                fontFamily: "var(--font-el-messiri), serif",
              }}
            >
              لوحة الشريك
            </h2>
          </div>

          <nav className="space-y-2">
            <NavItem href="/partner/dashboard" label="الرئيسية" icon="⌂" />

            <NavItem href="/partner/bookings" label="الحجوزات" icon="▣" />

            <NavItem
              href="/partner/services"
              label="الخدمات والتجارب"
              icon="◈"
              active
            />

            <NavItem
              href="/partner/settlements"
              label="التسويات"
              icon="﷼"
            />

            <NavItem href="/partner/invoices" label="الفواتير" icon="▤" />

            <NavItem href="/partner/reports" label="التقارير" icon="◫" />

            <NavItem
              href="/partner/team"
              label="الموظفون والصلاحيات"
              icon="◎"
            />

            <NavItem
              href="/partner/business"
              label="المنشأة والتراخيص"
              icon="◇"
            />

            <NavItem
              href="/partner/agreement"
              label="الاتفاقية والإعدادات"
              icon="✓"
            />
          </nav>

          <div className="mt-8 rounded-[24px] bg-[#0D3B34] p-5 text-white">
            <p className="text-[10px] font-bold tracking-[0.16em] text-[#E6C24D]">
              SERVICE GOVERNANCE
            </p>

            <p className="mt-2 text-sm font-bold">
              {summary.published} خدمات منشورة
            </p>

            <p className="mt-2 text-xs leading-6 text-white/50">
              أي خدمة جديدة تحتاج مراجعة قبل ظهورها للزائر.
            </p>
          </div>
        </aside>

        {/* CONTENT */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-[#0D3B34]/8 bg-[#F9F7F0]/94 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 px-5 py-3 md:px-8">
              <div className="relative">
                <button type="button" onClick={()=>setAccountMenuOpen(v=>!v)} className="flex items-center gap-3 rounded-2xl px-2 py-1.5 text-right hover:bg-white/70">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D3B34] font-bold text-[#D4AF37]">ت</div>
                  <div className="hidden sm:block"><p className="text-sm font-bold">تجارب المدينة</p><p className="text-[10px] text-[#0D3B34]/45">partner@areesloop.com</p></div><span className="text-xs">⌄</span>
                </button>
                {accountMenuOpen && <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-[#0D3B34]/10 bg-white p-2 shadow-lg">
                  <Link href="/partner/profile" className="block rounded-xl px-4 py-3 text-xs font-bold hover:bg-[#F7F4EA]">الملف الشخصي</Link>
                  <Link href="/partner/logout" className="block rounded-xl px-4 py-3 text-xs font-bold text-red-700 hover:bg-red-50">تسجيل الخروج</Link>
                </div>}
              </div>
              <div className="hidden rounded-full bg-[#0D3B34] px-5 py-2.5 text-[10px] font-bold tracking-[.14em] text-[#E6C24D] md:block">AREES LOOP <span className="text-white/55">| إصدار تجريبي</span></div>
              <div className="flex items-center gap-2">
                <Link href="/" className="rounded-full border border-[#0D3B34]/10 bg-white px-4 py-2.5 text-xs font-semibold">العودة للمنصة</Link>
                <button type="button" onClick={()=>setSidebarOpen(v=>!v)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D3B34] text-white" title={sidebarOpen?"إخفاء القائمة":"إظهار القائمة"}>{sidebarOpen?"⇥":"⇤"}</button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1550px] px-5 py-8 md:px-8">
            {/* TITLE */}
            <section className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-[0.22em] text-[#B99124]">
                  SERVICES & EXPERIENCES
                </p>

                <h1
                  className="mt-2 text-3xl font-bold md:text-[42px]"
                  style={{
                    fontFamily: "var(--font-el-messiri), serif",
                  }}
                >
                  الخدمات والتجارب
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#0D3B34]/60">
                  أضف خدماتك وأسعارك وصورها واربط كل خدمة بالترخيص
                  المعتمد قبل إرسالها للمراجعة.
                </p>
              </div>


            </section>

            {/* SUMMARY */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="إجمالي الخدمات"
                value={String(summary.total)}
              />

              <SummaryCard
                label="منشورة"
                value={String(summary.published)}
                success
              />

              <SummaryCard
                label="تحت المراجعة"
                value={String(summary.review)}
                highlight
              />

              <SummaryCard
                label="مسودات"
                value={String(summary.draft)}
              />
            </section>

            {/* FILTERS */}
            <section className="mt-7 rounded-[28px] border border-white/80 bg-white/72 p-5 backdrop-blur-xl">
              <div className="grid gap-3 lg:grid-cols-[1fr_200px_auto]">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث باسم الخدمة أو النشاط..."
                  className={inputClass}
                />

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as "ALL" | ServiceStatus
                    )
                  }
                  className={inputClass}
                >
                  <option value="ALL">كل الحالات</option>
                  <option value="PUBLISHED">منشورة</option>
                  <option value="UNDER_REVIEW">تحت المراجعة</option>
                  <option value="DRAFT">مسودة</option>
                  <option value="SUSPENDED">موقوفة</option>
                  <option value="REJECTED">مرفوضة</option>
                </select>

                <div className="flex items-center gap-2">
                  <button type="button" onClick={openNewServiceForm} className="h-14 rounded-2xl bg-[#0D3B34] px-6 text-sm font-bold text-white transition hover:bg-[#124A41]">إضافة خدمة</button>
                  <button type="button" onClick={()=>setViewMode("grid")} className={`h-14 rounded-2xl px-4 text-xs font-bold ${viewMode==="grid"?"bg-[#0D3B34] text-white":"border border-[#0D3B34]/10 bg-white"}`}>▦ بطاقات</button>
                  <button type="button" onClick={()=>setViewMode("list")} className={`h-14 rounded-2xl px-4 text-xs font-bold ${viewMode==="list"?"bg-[#0D3B34] text-white":"border border-[#0D3B34]/10 bg-white"}`}>☷ قائمة</button>
                </div>
              </div>
            </section>

            {/* SERVICES GRID */}
            {!showForm && <section className={viewMode === "grid" ? "mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "mt-6 space-y-2"}>
              {filteredServices.map((service) => {
                const status = statusConfig[service.status];

                return (
                  <div
                    key={service.id}
                    className={viewMode === "grid" ? "overflow-hidden rounded-[22px] border border-white/80 bg-white/80 backdrop-blur-xl" : "overflow-hidden rounded-[16px] border border-[#0D3B34]/8 bg-white/90 backdrop-blur-xl md:flex md:h-[86px]"}
                  >
                    {/* IMAGE PLACEHOLDER */}
                    <div className={viewMode === "grid" ? "relative flex h-[140px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#D9E5DF] via-[#F1E8D1] to-[#E8DFC3]" : "relative flex h-[82px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#D9E5DF] via-[#F1E8D1] to-[#E8DFC3] md:h-[86px] md:w-[92px] md:shrink-0"}>
                      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-[#0D3B34]/10" />
                      <div className="absolute bottom-[-40px] left-5 h-32 w-32 rounded-full border border-[#D4AF37]/25" />

                      <div className="relative text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0D3B34] text-xl text-[#D4AF37]">
                          ◈
                        </div>

                        <p className="mt-3 text-xs font-bold text-[#0D3B34]/55">
                          {service.imageCount} صور
                        </p>
                      </div>

                      {viewMode==="grid" && (
                        <div className="absolute right-3 top-3 flex items-center gap-2">
                          <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${status.className}`}>
                            {status.label}
                          </span>
                          <div className="relative">
                            <button type="button" aria-label="إجراءات الخدمة" onClick={()=>setActionMenuId(actionMenuId===service.id?null:service.id)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white/95 text-lg font-bold text-[#0D3B34] shadow-sm">⋮</button>
                            {actionMenuId===service.id && <div className="absolute right-0 top-11 z-30 w-40 overflow-hidden rounded-2xl border border-[#0D3B34]/10 bg-white p-1 shadow-xl">
                              <button type="button" onClick={()=>{setActionMenuId(null);openEditServiceForm(service);window.scrollTo({top:0,behavior:"smooth"});}} className="w-full rounded-xl px-3 py-2 text-right text-xs font-bold hover:bg-[#F7F4EA]">✎ تعديل</button>
                              <Link href={`/services/${service.id}`} className="block w-full rounded-xl px-3 py-2 text-right text-xs font-bold hover:bg-[#F7F4EA]">◉ معاينة</Link>
                              {(service.status==="PUBLISHED"||service.status==="SUSPENDED") && <button type="button" onClick={()=>void togglePublication(service)} className="w-full rounded-xl px-3 py-2 text-right text-xs font-bold hover:bg-[#F7F4EA]">{service.status==="PUBLISHED"?"◌ إخفاء من النشر":"● نشر الخدمة"}</button>}
                              <button type="button" onClick={()=>{setActionMenuId(null);void requestDeleteService(service);}} className="w-full rounded-xl px-3 py-2 text-right text-xs font-bold text-red-700 hover:bg-red-50">⌫ حذف</button>
                            </div>}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={viewMode==="grid" ? "p-4" : "flex-1 p-2 md:grid md:grid-cols-[1.25fr_.65fr_.8fr_auto] md:items-center md:gap-3"}>
                      <p className="text-[10px] font-semibold text-[#B99124]">
                        {service.category}
                      </p>

                      <h2 className="mt-2 text-lg font-bold">
                        {service.nameAr}
                      </h2>

                      <p className="mt-1 text-xs text-[#0D3B34]/42">
                        {service.nameEn}
                      </p>

                      <div className={viewMode==="grid" ? "mt-4 grid grid-cols-2 gap-2" : "mt-2 grid grid-cols-2 gap-2 md:mt-0"}>
                        <InfoBox label="السعر" value={`${money(service.finalPrice)} ر.س`} />
                        <InfoBox label="الحجوزات" value={String(service.bookings)} />
                        {viewMode==="grid" && <><InfoBox label="السعة" value={`${service.capacity} زائر`} /><InfoBox label="الضريبة" value={`${service.vatRate}%`} /></>}
                      </div>

                      <div className={viewMode==="grid" ? "mt-3 rounded-2xl bg-[#F7F6F1] p-3" : "mt-2 rounded-xl bg-[#F7F6F1] p-2 md:mt-0"}>
                        <p className="text-[10px] text-[#0D3B34]/40">
                          الموقع
                        </p>

                        <p className="mt-1 text-xs font-semibold text-[#0D3B34]/70">
                          {service.locationName}
                        </p>

                        {service.latitude !== null &&
                          service.longitude !== null && (
                            <p
                              className="mt-1 text-[10px] text-[#0D3B34]/40"
                              dir="ltr"
                            >
                              {service.latitude.toFixed(5)},{" "}
                              {service.longitude.toFixed(5)}
                            </p>
                          )}
                      </div>

                      <div className={viewMode==="grid" ? "mt-3 rounded-2xl bg-[#F7F6F1] p-3" : "hidden"}>
                        <p className="text-[10px] text-[#0D3B34]/40">
                          الترخيص المرتبط
                        </p>

                        <p className="mt-1 text-xs font-semibold text-[#0D3B34]/70">
                          {service.license}
                        </p>
                      </div>

                      {viewMode==="list" && <div className="mt-1 flex items-center gap-2 md:mt-0">
                        <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${status.className}`}>{status.label}</span>
                        <div className="relative">
                          <button type="button" aria-label="إجراءات الخدمة" onClick={()=>setActionMenuId(actionMenuId===service.id?null:service.id)} className="h-10 w-10 rounded-xl border border-[#0D3B34]/10 bg-white text-lg font-bold">⋮</button>
                          {actionMenuId===service.id && <div className="absolute left-0 top-12 z-30 w-40 overflow-hidden rounded-2xl border border-[#0D3B34]/10 bg-white p-1 shadow-xl">
                            <button type="button" onClick={()=>{setActionMenuId(null);openEditServiceForm(service);window.scrollTo({top:0,behavior:"smooth"});}} className="w-full rounded-xl px-3 py-2 text-right text-xs font-bold hover:bg-[#F7F4EA]">✎ تعديل</button>
                            <Link href={`/services/${service.id}`} className="block w-full rounded-xl px-3 py-2 text-right text-xs font-bold hover:bg-[#F7F4EA]">◉ معاينة</Link>
                            {(service.status==="PUBLISHED"||service.status==="SUSPENDED") && <button type="button" onClick={()=>void togglePublication(service)} className="w-full rounded-xl px-3 py-2 text-right text-xs font-bold hover:bg-[#F7F4EA]">{service.status==="PUBLISHED"?"◌ إخفاء من النشر":"● نشر الخدمة"}</button>}
                            <button type="button" onClick={()=>{setActionMenuId(null);void requestDeleteService(service);}} className="w-full rounded-xl px-3 py-2 text-right text-xs font-bold text-red-700 hover:bg-red-50">⌫ حذف</button>
                          </div>}
                        </div>
                      </div>}
                    </div>
                  </div>
                );
              })}
            </section>}

            {!showForm && filteredServices.length === 0 && (
              <div className="mt-6 rounded-[28px] border border-white/80 bg-white/70 px-6 py-16 text-center">
                <p className="font-bold">لا توجد خدمات مطابقة</p>

                <p className="mt-2 text-xs text-[#0D3B34]/45">
                  غيّر البحث أو حالة الخدمة.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {submitMessage && !showForm && (
        <div className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-2xl border border-[#0D3B34]/10 bg-white px-5 py-3 text-sm font-bold text-[#0D3B34] shadow-xl">
          {submitMessage}
        </div>
      )}

      {/* ADD / EDIT SERVICE INLINE */}
      {showForm && (
        <div className="border-t border-[#0D3B34]/8 bg-[#F8F5ED] px-5 py-8 md:px-8">
          <div className="mx-auto w-full max-w-[1200px] overflow-hidden rounded-[28px] border border-white/80 bg-[#F8F5ED] shadow-sm">
            <div className="sticky top-0 z-10 border-b border-[#0D3B34]/8 bg-[#F8F5ED]/95 px-6 py-5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.18em] text-[#B99124]">
                    {editingServiceId ? "EDIT SERVICE" : "NEW SERVICE"}
                  </p>

                  <h2
                    className="mt-1 text-2xl font-bold"
                    style={{
                      fontFamily: "var(--font-el-messiri), serif",
                    }}
                  >
                    {editingServiceId ? "تعديل الخدمة" : "إضافة خدمة جديدة"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeServiceForm}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0D3B34]/10 bg-white text-lg"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {/* BASIC INFO */}
              <FormSection
                eyebrow="BASIC INFORMATION"
                title="معلومات الخدمة"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="اسم الخدمة بالعربية">
                    <input
                      value={form.nameAr}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          nameAr: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Service Name">
                    <input
                      value={form.nameEn}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          nameEn: e.target.value,
                        }))
                      }
                      className={inputClass}
                      dir="ltr"
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="التصنيف">
                    <select value={form.category} onChange={(e)=>setForm((current)=>({...current,category:e.target.value,subCategory:""}))} className={inputClass}>
                      <option value="">اختر التصنيف</option>
                      {mainCategories.map((category)=><option key={category}>{category}</option>)}
                    </select>
                  </Field>
                  <Field label="التصنيف الفرعي (اختياري)">
                    <input value={form.subCategory} onChange={(e)=>setForm((current)=>({...current,subCategory:e.target.value}))} className={inputClass} placeholder="اكتب تصنيفك، مثال: تجربة تاريخية" />
                  </Field>
                </div></FormSection>

              {/* DESCRIPTION */}
              <FormSection
                eyebrow="CONTENT"
                title="وصف الخدمة"
              >
                <Field label="الوصف بالعربية">
                  <textarea
                    value={form.descriptionAr}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        descriptionAr: e.target.value,
                      }))
                    }
                    rows={5}
                    className={`${inputClass} h-auto min-h-[140px] py-4`}
                  />
                </Field>

                <Field label="Description in English">
                  <textarea
                    value={form.descriptionEn}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        descriptionEn: e.target.value,
                      }))
                    }
                    rows={5}
                    dir="ltr"
                    className={`${inputClass} h-auto min-h-[140px] py-4`}
                  />
                </Field>
              </FormSection>

              {/* LOCATION */}
              <FormSection eyebrow="LOCATION" title="موقع تنفيذ الخدمة">
                <div className="mb-4 rounded-[18px] border border-[#D4AF37]/25 bg-[#FFF8E5] p-4 text-xs leading-6 text-[#0D3B34]/70">
                  <b className="text-[#0D3B34]">الموقع أساسي في Arees Loop.</b> حدّد المدينة وموقع تنفيذ الخدمة ليتمكن النظام من معرفة التجارب القريبة من العميل. نقطة التجمع معلومة إضافية وليست بديلاً عن موقع الخدمة.
                </div>
                <div className="mb-4 grid gap-4 md:grid-cols-2">
                  <Field label="المدينة *"><input value={form.city} onChange={(e)=>setForm((x)=>({...x,city:e.target.value}))} className={inputClass} placeholder="مثال: العلا"/></Field>
                  <Field label="اسم موقع تنفيذ الخدمة *"><input value={form.locationName} onChange={(e)=>setForm((x)=>({...x,locationName:e.target.value}))} className={inputClass} placeholder="مثال: جبل الفيل، البلدة القديمة"/></Field>
                </div>
                <Field label="العنوان التفصيلي / الحي"><input value={form.formattedAddress} onChange={(e)=>setForm((x)=>({...x,formattedAddress:e.target.value}))} className={inputClass} placeholder="اكتب الحي أو العنوان الوطني/المختصر إن توفر"/></Field>
                <div className="mt-4 rounded-[18px] border border-[#0D3B34]/8 bg-white p-4">
                  <p className="mb-2 text-xs font-bold">تحديد الموقع على الخريطة *</p>
                  <div className="flex flex-col gap-2 md:flex-row">
                    <input value={locationQuery} onChange={(e)=>handleLocationQueryChange(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter"){e.preventDefault();void searchServiceLocation();}}} className={inputClass} placeholder="ابحث باسم المكان، الحي أو العنوان"/>
                    <button type="button" onClick={()=>void searchServiceLocation()} disabled={locationBusy} className="shrink-0 rounded-2xl bg-[#0D3B34] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">بحث</button>
                    <button type="button" onClick={useCurrentServiceLocation} disabled={locationBusy} className="shrink-0 rounded-2xl border border-[#0D3B34]/15 bg-white px-5 py-3 text-sm font-bold disabled:opacity-50">استخدام موقعي الحالي</button>
                  </div>
                  {locationMessage&&<p className="mt-3 text-xs font-bold">{locationMessage}</p>}
                  {locationSuggestions.length>0&&<div className="mt-3 overflow-hidden rounded-xl border border-[#0D3B34]/10 bg-white">{locationSuggestions.map((s,i)=><button key={i} type="button" onClick={()=>{setForm((x)=>({...x,city:s.city||x.city,locationName:s.name,formattedAddress:s.address,latitude:s.location.lat,longitude:s.location.lng}));setLocationQuery(s.address);setLocationSuggestions([]);setLocationMessage("تم اختيار وتثبيت الموقع ✓");}} className="block w-full border-b border-[#0D3B34]/8 px-4 py-3 text-right last:border-0 hover:bg-[#F8F5ED]"><b className="block text-sm">{s.name}</b><span className="mt-1 block text-xs text-[#0D3B34]/55">{s.address}</span></button>)}</div>}
                  {Number.isFinite(form.latitude)&&Number.isFinite(form.longitude)&&<div className="mt-3 rounded-xl bg-[#F8F5ED] p-3 text-xs"><b>الموقع مثبت ✓</b><p className="mt-1" dir="ltr">{form.latitude?.toFixed(6)}, {form.longitude?.toFixed(6)}</p></div>}
                </div>
                <div className="mt-4 rounded-[18px] border border-[#0D3B34]/8 bg-white p-4">
                  <p className="text-sm font-bold">هل توجد نقطة تجمع؟</p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={()=>setForm((x)=>({...x,hasMeetingPoint:true}))} className={`rounded-xl px-5 py-2 text-sm font-bold ${form.hasMeetingPoint?"bg-[#0D3B34] text-white":"border bg-white"}`}>نعم</button>
                    <button type="button" onClick={()=>setForm((x)=>({...x,hasMeetingPoint:false,meetingPointName:"",meetingPointUrl:"",meetingInstructions:""}))} className={`rounded-xl px-5 py-2 text-sm font-bold ${!form.hasMeetingPoint?"bg-[#0D3B34] text-white":"border bg-white"}`}>لا</button>
                  </div>
                  {form.hasMeetingPoint && (
                    <div className="mt-4 space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="عنوان / اسم نقطة التجمع"><input value={form.meetingPointName} onChange={(e)=>setForm((x)=>({...x,meetingPointName:e.target.value}))} className={inputClass} placeholder="مثال: بوابة المتحف الرئيسية"/></Field>
                        <Field label="رابط الموقع (اختياري)"><input value={form.meetingPointUrl} onChange={(e)=>setForm((x)=>({...x,meetingPointUrl:e.target.value,locationUrl:e.target.value}))} className={inputClass} dir="ltr" placeholder="الصق رابط Google Maps"/></Field>
                      </div>
                      <Field label="تعليمات الوصول (اختياري)"><textarea value={form.meetingInstructions} onChange={(e)=>setForm((x)=>({...x,meetingInstructions:e.target.value}))} rows={3} className={`${inputClass} h-auto py-4`} placeholder="مثال: الدخول من البوابة الشمالية..."/></Field>
                    </div>
                  )}
                </div>
              </FormSection>

              {/* PRICING */}
              <FormSection
                eyebrow="PRICING & VAT"
                title="السعر والضريبة"
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="السعر">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.basePrice}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          basePrice: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="طريقة احتساب الضريبة">
                    <select
                      value={form.vatRate}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          vatRate: e.target.value,
                        }))
                      }
                      className={inputClass}
                    >
                      <option value="included">السعر شامل الضريبة</option>
                      <option value="excluded">السعر غير شامل الضريبة (+15%)</option>
                    </select>
                  </Field>

                  <div>
                    <p className="mb-2 text-xs font-semibold text-[#0D3B34]/65">
                      السعر النهائي
                    </p>

                    <div className="flex h-14 items-center rounded-2xl bg-[#0D3B34] px-4 text-lg font-bold text-[#F1C94C]">
                      {money(calculatedFinalPrice)} ر.س
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <InfoBox
                    label="الضريبة"
                    value={form.vatRate === "included" ? "مشمولة في السعر" : `${money((Number(form.basePrice)||0)*0.15)} ر.س`}
                  />

                  <InfoBox
                    label="السعر الظاهر للعميل"
                    value={`${money(calculatedFinalPrice)} ر.س`}
                  />
                </div>

                <div className="rounded-[18px] border border-[#0D3B34]/8 bg-white p-4 text-xs leading-6 text-[#0D3B34]/60">
                  إذا كان السعر شامل الضريبة يظهر كما أدخله الشريك. وإذا كان غير شامل، تضيف المنصة 15% تلقائيًا إلى السعر النهائي.
                </div>
              </FormSection>

              {/* BOOKING & AVAILABILITY */}
              <FormSection eyebrow="BOOKING" title="الحجز والتوفر">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="طريقة الحجز">
                    <select value={form.bookingMode} onChange={(e)=>setForm((x)=>({...x,bookingMode:e.target.value}))} className={inputClass}>
                      <option value="direct">حجز مباشر — بدون اختيار موعد</option>
                      <option value="scheduled">حجز بموعد / تاريخ</option>
                    </select>
                  </Field>
                  <Field label="السعة القصوى المتاحة">
                    <input type="number" min="1" value={form.capacity} onChange={(e)=>setForm((x)=>({...x,capacity:e.target.value}))} className={inputClass}/>
                  </Field>
                </div>
                {form.bookingMode === "scheduled" && (
                  <div className="rounded-[22px] border border-[#0D3B34]/10 bg-white p-5">
                    <p className="text-sm font-bold text-[#0D3B34]">المواعيد المتاحة</p>
                    <p className="mt-1 text-xs text-[#0D3B34]/50">حدد الفترة والأيام والأوقات التي يستطيع العميل الحجز فيها.</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <Field label="من تاريخ"><input type="date" value={form.startDate} onChange={(e)=>setForm((x)=>({...x,startDate:e.target.value}))} className={inputClass}/></Field>
                      <Field label="إلى تاريخ"><input type="date" value={form.endDate} onChange={(e)=>setForm((x)=>({...x,endDate:e.target.value}))} className={inputClass}/></Field>
                      <Field label="من الساعة"><input type="time" value={form.startTime} onChange={(e)=>setForm((x)=>({...x,startTime:e.target.value}))} className={inputClass}/></Field>
                      <Field label="إلى الساعة"><input type="time" value={form.endTime} onChange={(e)=>setForm((x)=>({...x,endTime:e.target.value}))} className={inputClass}/></Field>
                    </div>
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-semibold text-[#0D3B34]/65">الأيام المتاحة</p>
                      <div className="flex flex-wrap gap-2">
                        {["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"].map((day)=>{
                          const active=form.availableDays.includes(day);
                          return <button key={day} type="button" onClick={()=>setForm((x)=>({...x,availableDays:active?x.availableDays.filter((d)=>d!==day):[...x.availableDays,day]}))} className={`rounded-xl px-4 py-2 text-xs font-bold ${active?"bg-[#0D3B34] text-white":"border border-[#0D3B34]/10 bg-[#F8F7F2] text-[#0D3B34]"}`}>{day}</button>
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </FormSection>

              {/* IMAGES */}
              <FormSection eyebrow="MEDIA" title="صور الخدمة">
                <div className="mb-3 text-xs leading-5 text-[#0D3B34]/55">
                  الصور الموصى بها: <strong>1080 × 1080 بكسل (1:1)</strong> · الحد الأقصى <strong>2 MB للصورة</strong> · حتى <strong>10 صور</strong> · JPG / PNG / WebP
                </div>
                <label className="flex cursor-pointer items-center justify-center rounded-[18px] border border-dashed border-[#B88A13]/45 bg-white px-5 py-5 text-sm font-bold text-[#0D3B34] hover:bg-[#FFF9E8]">
                  + إضافة صور
                  <input type="file" multiple accept="image/png,image/jpeg,image/webp" className="hidden"
                    onChange={(e)=>{
                      const selected=Array.from(e.target.files||[]);
                      const remaining=Math.max(0,10-form.imagePreviews.length);
                      const files=selected.filter((file)=>file.size<=2*1024*1024).slice(0,remaining);
                      if(!files.length) { e.currentTarget.value=""; return; }
                      const previews=files.map((file)=>({name:file.name,url:URL.createObjectURL(file)}));
                      setForm((current)=>({
                        ...current,
                        imagePreviews:[...current.imagePreviews,...previews],
                        primaryImage:current.primaryImage || files[0].name,
                      }));
                      void Promise.all(files.map(async(file)=>{
                        const data=new FormData(); data.append("file",file);
                        const response=await fetch("/api/partner/services/images",{method:"POST",credentials:"include",body:data});
                        const result=await response.json();
                        if(!response.ok||!result?.success) throw new Error(result?.message||"تعذر رفع الصورة.");
                        return {name:file.name,url:result.url as string};
                      })).then((uploaded)=>setForm((current)=>({...current,images:[...current.images,...uploaded]}))).catch((error)=>setSubmitMessage(error?.message||"تعذر رفع الصورة."));
                      e.currentTarget.value="";
                    }}
                  />
                </label>
                {form.imagePreviews.length > 0 && (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-bold">تم اختيار {form.imagePreviews.length} صور</p>
                      <p className="text-[10px] text-[#0D3B34]/50">اختر الصورة الرئيسية التي تظهر أولاً للعميل</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {form.imagePreviews.map((image,index)=>(
                        <div key={image.name+`-${index}`} className={`relative overflow-hidden rounded-[18px] border-2 bg-white ${form.primaryImage===image.name?"border-[#D4AF37]":"border-transparent"}`}>
                          <img src={image.url} alt="" className="aspect-[4/3] w-full object-cover"/>
                          {form.primaryImage===image.name && <span className="absolute right-2 top-2 rounded-full bg-[#D4AF37] px-2 py-1 text-[9px] font-bold text-[#0D3B34]">الرئيسية</span>}
                          <div className="flex items-center gap-1 p-2">
                            {form.primaryImage!==image.name && <button type="button" onClick={()=>setForm((x)=>({...x,primaryImage:image.name}))} className="flex-1 rounded-lg bg-[#EEF3F0] px-2 py-1.5 text-[10px] font-bold">تعيين كرئيسية</button>}
                            <button type="button" onClick={()=>setForm((x)=>{
                              URL.revokeObjectURL(image.url);
                              const nextPreviews=x.imagePreviews.filter((_,i)=>i!==index);
                              const nextImages=x.images.filter((_,i)=>i!==index);
                              return {...x,imagePreviews:nextPreviews,images:nextImages,primaryImage:x.primaryImage===image.name?(nextImages[0]?.name||""):x.primaryImage};
                            })} className="rounded-lg bg-red-50 px-2.5 py-1.5 text-[10px] font-bold text-red-600">حذف</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-[10px] leading-5 text-[#0D3B34]/50">في صفحة العميل تظهر الصورة الرئيسية أولاً، وبقية الصور ضمن معرض يمكن التنقل فيه يمينًا ويسارًا.</p>
                  </div>
                )}
              </FormSection>

              <FormSection eyebrow="ORGANIZER & APPROVAL" title="بيانات التنظيم والاعتماد">
                <div className="grid gap-4 md:grid-cols-2">
                  <div><label className="mb-2 block text-xs font-bold">🪪 منظم البرنامج</label><select value={form.organizerType} onChange={(e)=>setForm(x=>({...x,organizerType:e.target.value}))} className={inputClass}><option value="SELF">مقدم الخدمة نفسه</option><option value="OTHER">جهة منظمة أخرى</option></select></div>
                  <div><label className="mb-2 block text-xs font-bold">🔢 رقم اعتماد البرنامج <span className="font-normal opacity-50">— للإدارة فقط</span></label><input value={form.programApprovalNumber} onChange={(e)=>setForm(x=>({...x,programApprovalNumber:e.target.value}))} className={inputClass} placeholder="رقم الاعتماد إن وجد" /></div>
                  {form.organizerType==="OTHER" && <>
                    <div><label className="mb-2 block text-xs font-bold">اسم الجهة المنظمة</label><input value={form.organizerName} onChange={(e)=>setForm(x=>({...x,organizerName:e.target.value}))} className={inputClass} placeholder="اسم الجهة المنظمة" /></div>
                    <div><label className="mb-2 block text-xs font-bold">رقم ترخيص الجهة المنظمة</label><input value={form.organizerLicenseNumber} onChange={(e)=>setForm(x=>({...x,organizerLicenseNumber:e.target.value}))} className={inputClass} placeholder="رقم الترخيص" /></div>
                    <div className="md:col-span-2"><label className="mb-2 block text-xs font-bold">الجهة المصدرة للترخيص</label><input value={form.organizerLicenseIssuer} onChange={(e)=>setForm(x=>({...x,organizerLicenseIssuer:e.target.value}))} className={inputClass} placeholder="مثال: وزارة السياحة" /></div>
                  </>}
                </div>
                <p className="mt-4 text-[11px] leading-6 text-[#0D3B34]/55">🏢 مقدم الخدمة هو الشريك المسجل في Arees Loop. رقم اعتماد البرنامج معلومة داخلية تساعد الإدارة في سرعة التحقق ولا يظهر للعميل.</p>
              </FormSection>

              {/* POLICY */}
              <FormSection
                eyebrow="POLICIES"
                title="سياسة الإلغاء"
              >
                <textarea
                  value={form.cancellationPolicy}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      cancellationPolicy: e.target.value,
                    }))
                  }
                  rows={4}
                  className={`${inputClass} h-auto py-4`}
                  placeholder="مثال: استرداد كامل قبل 24 ساعة..."
                />
              </FormSection>

              {/* SUBMIT */}
              <div className="rounded-[28px] bg-[#0D3B34] p-6 text-white">
                <p className="text-[10px] font-bold tracking-[0.17em] text-[#E6C24D]">
                  PUBLISHING WORKFLOW
                </p>

                <h3 className="mt-2 text-lg font-bold">
                  {editingServiceId ? "حفظ تعديلات الخدمة" : "حفظ وإرسال للمراجعة"}
                </h3>

                <p className="mt-2 text-xs leading-6 text-white/50">
                  {editingServiceId
                    ? "اضغط حفظ التعديلات. إذا كان التعديل جوهرياً فسيتم حفظه وإرساله تلقائياً لمراجعة الإدارة."
                    : "الحفظ كمسودة لا ينشر الخدمة. إرسالها للمراجعة يحولها إلى «تحت المراجعة» حتى تعتمدها إدارة Arees Loop."}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={saveDraft}
                    className="rounded-2xl border border-white/15 bg-white/8 px-5 py-3.5 text-sm font-bold text-white"
                  >
                    {submitting ? "جارٍ الحفظ..." : (editingServiceId ? "حفظ التعديلات" : "حفظ كمسودة")}
                  </button>

                  <button
                    type="button"
                    onClick={submitForReview}
                    disabled={!canSubmitForReview}
                    className="rounded-2xl bg-[#D4AF37] px-5 py-3.5 text-sm font-bold text-[#0D3B34] transition disabled:cursor-not-allowed disabled:opacity-35"
                    title={!canSubmitForReview ? "أكمل البيانات الإلزامية قبل الإرسال" : undefined}
                  >
                    إرسال للمراجعة
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE NAV */}
      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-[560px] -translate-x-1/2 items-center justify-around rounded-[22px] border border-white/80 bg-[#F9F7F0]/94 px-2 py-2 backdrop-blur-xl xl:hidden">
        <MobileNav href="/partner/dashboard" label="الرئيسية" />
        <MobileNav href="/partner/bookings" label="الحجوزات" />
        <MobileNav href="/partner/services" label="الخدمات" active />
        <MobileNav href="/partner/settlements" label="التسويات" />
        <MobileNav href="/partner/business" label="المنشأة" />
      </nav>
    </main>
  );
}


function ServiceLocationPicker({
  value,
  onChange,
}: {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const autocompleteContainerRef = useRef<HTMLDivElement | null>(null);

  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  const [status, setStatus] = useState(
    "جاري تشغيل محرك الموقع..."
  );

  const [ready, setReady] = useState(false);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const extractCity = (components: any[] = []) => {
    const priorities = [
      "locality",
      "administrative_area_level_2",
      "administrative_area_level_1",
    ];

    for (const type of priorities) {
      const component = components.find((item: any) =>
        item.types?.includes(type)
      );

      if (component) {
        return (
          component.long_name ||
          component.longText ||
          component.short_name ||
          component.shortText ||
          ""
        );
      }
    }

    return "";
  };

  const reverseGeocode = async (
    lat: number,
    lng: number,
    source: "MAP" | "GPS" | "DRAG"
  ) => {
    const current = valueRef.current;

    onChangeRef.current({
      ...current,
      latitude: lat,
      longitude: lng,
    });

    if (!geocoderRef.current) {
      setStatus("تم تحديد الإحداثيات، وتعذر قراءة العنوان");
      return;
    }

    try {
      setStatus("جاري قراءة العنوان من Google...");

      const response = await geocoderRef.current.geocode({
        location: { lat, lng },
        language: "ar",
        region: "SA",
      });

      const result = response.results?.[0];

      if (!result) {
        setStatus("تم تحديد الإحداثيات، ولم يُعثر على عنوان مطابق");
        return;
      }

      const city =
        extractCity(result.address_components || []) ||
        current.city ||
        "غير محدد";

      const locationName =
        result.address_components?.[0]?.long_name ||
        current.locationName ||
        (source === "GPS"
          ? "موقعي الحالي"
          : "موقع محدد من الخريطة");

      onChangeRef.current({
        city,
        locationName,
        formattedAddress: result.formatted_address || "",
        placeId: result.place_id || "",
        latitude: lat,
        longitude: lng,
      });

      setStatus(
        source === "GPS"
          ? "تم تحديد موقعك وقراءة العنوان بنجاح"
          : "تم تحديد الموقع وقراءة العنوان بنجاح"
      );
    } catch (error) {
      console.error("Reverse geocoding error:", error);

      onChangeRef.current({
        ...current,
        latitude: lat,
        longitude: lng,
      });

      setStatus("تم تحديد الإحداثيات، وتعذر جلب العنوان");
    }
  };

  useEffect(() => {
    const apiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setStatus(
        "مفتاح Google Maps غير موجود في .env.local"
      );
      return;
    }

    let destroyed = false;

    async function initMap() {
      if (
        destroyed ||
        !mapRef.current ||
        !autocompleteContainerRef.current ||
        !window.google?.maps
      ) {
        return;
      }

      try {
        await window.google.maps.importLibrary("maps");

        const placesLibrary =
          await window.google.maps.importLibrary("places");

        const { PlaceAutocompleteElement } = placesLibrary;

        geocoderRef.current = new window.google.maps.Geocoder();

        const current = valueRef.current;

        const defaultLocation = {
          lat: current.latitude ?? 24.4672,
          lng: current.longitude ?? 39.6111,
        };

        const map = new window.google.maps.Map(
          mapRef.current,
          {
            center: defaultLocation,
            zoom:
              current.latitude !== null &&
              current.longitude !== null
                ? 16
                : 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            gestureHandling: "greedy",
          }
        );

        mapInstanceRef.current = map;

        const marker = new window.google.maps.Marker({
          map,
          position: defaultLocation,
          draggable: true,
          title: "موقع الخدمة",
        });

        markerRef.current = marker;

        const autocomplete =
          new PlaceAutocompleteElement();

        autocomplete.placeholder =
          "ابحث باسم المكان أو نقطة التجمع...";

        try {
          autocomplete.includedRegionCodes = ["sa"];
        } catch {}

        autocompleteContainerRef.current.innerHTML = "";
        autocompleteContainerRef.current.appendChild(
          autocomplete
        );

        autocomplete.addEventListener(
          "gmp-select",
          async (event: any) => {
            try {
              setStatus("جاري تحميل بيانات المكان...");

              const prediction = event.placePrediction;

              if (!prediction) {
                setStatus("تعذر قراءة نتيجة البحث");
                return;
              }

              const place = prediction.toPlace();

              await place.fetchFields({
                fields: [
                  "id",
                  "displayName",
                  "formattedAddress",
                  "location",
                  "viewport",
                  "addressComponents",
                ],
              });

              if (!place.location) {
                setStatus(
                  "المكان المختار لا يحتوي على موقع جغرافي"
                );
                return;
              }

              const lat = place.location.lat();
              const lng = place.location.lng();

              if (place.viewport) {
                map.fitBounds(place.viewport);
              } else {
                map.panTo({ lat, lng });
                map.setZoom(17);
              }

              marker.setPosition({ lat, lng });

              const city =
                extractCity(place.addressComponents || []) ||
                "غير محدد";

              onChangeRef.current({
                city,
                locationName:
                  place.displayName || "موقع الخدمة",
                formattedAddress:
                  place.formattedAddress || "",
                placeId: place.id || "",
                latitude: lat,
                longitude: lng,
              });

              setStatus(
                "تم ربط الموقع بالخدمة بنجاح"
              );
            } catch (error) {
              console.error(
                "Places selection error:",
                error
              );

              setStatus(
                "حدث خطأ أثناء جلب بيانات المكان"
              );
            }
          }
        );

        map.addListener("click", async (event: any) => {
          if (!event.latLng) return;

          const lat = event.latLng.lat();
          const lng = event.latLng.lng();

          marker.setPosition({ lat, lng });

          await reverseGeocode(lat, lng, "MAP");
        });

        marker.addListener(
          "dragend",
          async (event: any) => {
            if (!event.latLng) return;

            const lat = event.latLng.lat();
            const lng = event.latLng.lng();

            await reverseGeocode(lat, lng, "DRAG");
          }
        );

        setReady(true);
        setStatus(
          "Google Maps و Places و Geocoding متصلة بنجاح"
        );
      } catch (error) {
        console.error(
          "Location engine initialization error:",
          error
        );

        setStatus(
          "تعذر تشغيل محرك الموقع"
        );
      }
    }

    if (window.google?.maps) {
      initMap();

      return () => {
        destroyed = true;
      };
    }

    const existingScript = document.querySelector(
      'script[data-arees-google-maps="true"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", initMap);

      return () => {
        destroyed = true;

        existingScript.removeEventListener(
          "load",
          initMap
        );
      };
    }

    const script = document.createElement("script");

    script.src =
      `https://maps.googleapis.com/maps/api/js` +
      `?key=${apiKey}` +
      `&v=weekly` +
      `&language=ar` +
      `&region=SA`;

    script.async = true;
    script.defer = true;

    script.dataset.areesGoogleMaps = "true";

    script.onload = initMap;

    script.onerror = () => {
      setStatus("تعذر تحميل Google Maps");
    };

    document.head.appendChild(script);

    return () => {
      destroyed = true;
      script.onload = null;
    };
  }, []);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setStatus("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    setStatus("جاري تحديد موقعك...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo({ lat, lng });
          mapInstanceRef.current.setZoom(17);
        }

        if (markerRef.current) {
          markerRef.current.setPosition({ lat, lng });
        }

        await reverseGeocode(lat, lng, "GPS");
      },

      () => {
        setStatus(
          "تعذر تحديد موقعك. تأكد من السماح للمتصفح بالوصول إلى الموقع."
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const clearLocation = () => {
    onChangeRef.current({
      city: "",
      locationName: "",
      formattedAddress: "",
      placeId: "",
      latitude: null,
      longitude: null,
    });

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({
        lat: 24.4672,
        lng: 39.6111,
      });

      mapInstanceRef.current.setZoom(13);
    }

    if (markerRef.current) {
      markerRef.current.setPosition({
        lat: 24.4672,
        lng: 39.6111,
      });
    }

    setStatus("تم مسح الموقع المختار");
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-semibold text-[#0D3B34]/65">
          البحث عن موقع الخدمة
        </p>

        <div
          ref={autocompleteContainerRef}
          className="arees-service-autocomplete min-h-[58px] w-full"
        />

        <p className="mt-2 text-[10px] leading-5 text-[#0D3B34]/45">
          ابحث باسم المتحف، الفندق، المطعم، الوجهة أو نقطة التجمع.
        </p>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#0D3B34]/10 bg-[#ECE9DF] p-2">
        <div
          ref={mapRef}
          className="h-[360px] w-full rounded-[18px]"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={useMyLocation}
          className="rounded-2xl bg-[#0D3B34] px-4 py-3 text-xs font-bold text-white"
        >
          استخدام موقعي الحالي
        </button>

        <button
          type="button"
          onClick={clearLocation}
          className="rounded-2xl border border-[#0D3B34]/10 bg-white px-4 py-3 text-xs font-bold text-[#0D3B34]/65"
        >
          مسح الموقع
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <LocationInfo
          label="اسم المكان"
          value={
            value.locationName ||
            "لم يتم الاختيار"
          }
        />

        <LocationInfo
          label="المدينة"
          value={value.city || "—"}
        />

        <LocationInfo
          label="Latitude"
          value={
            value.latitude !== null
              ? value.latitude.toFixed(6)
              : "—"
          }
          ltr
        />

        <LocationInfo
          label="Longitude"
          value={
            value.longitude !== null
              ? value.longitude.toFixed(6)
              : "—"
          }
          ltr
        />
      </div>

      <div className="rounded-[18px] border border-[#0D3B34]/8 bg-[#FAF9F5] p-4">
        <p className="text-[10px] text-[#0D3B34]/40">
          العنوان
        </p>

        <p className="mt-2 text-xs font-bold leading-6 text-[#0D3B34]/70">
          {value.formattedAddress || "—"}
        </p>
      </div>

      <div className="rounded-[18px] border border-[#0D3B34]/8 bg-[#FAF9F5] p-4">
        <p className="text-[10px] text-[#0D3B34]/40">
          Google Place ID
        </p>

        <p
          className="mt-2 break-all text-[10px] font-bold text-[#0D3B34]/60"
          dir="ltr"
        >
          {value.placeId || "—"}
        </p>
      </div>

      <div
        className={`flex items-center justify-between gap-4 rounded-[18px] px-4 py-3 ${
          ready
            ? "bg-[#EAF5EE]"
            : "bg-[#FFF9E8]"
        }`}
      >
        <div>
          <p className="text-[9px] font-bold tracking-[0.12em] text-[#0D3B34]/40">
            LOCATION ENGINE STATUS
          </p>

          <p
            className={`mt-1 text-xs font-bold ${
              ready
                ? "text-[#267247]"
                : "text-[#8B6812]"
            }`}
          >
            {status}
          </p>
        </div>

        <div className="h-3 w-3 shrink-0 rounded-full bg-[#D4AF37]" />
      </div>

      <style jsx global>{`
        .arees-service-autocomplete {
          position: relative;
          z-index: 250;
        }

        .arees-service-autocomplete
          gmp-place-autocomplete {
          width: 100%;
          min-height: 58px;
          direction: rtl;
        }
      `}</style>
    </div>
  );
}

function LocationInfo({
  label,
  value,
  ltr = false,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="rounded-[18px] border border-[#0D3B34]/8 bg-[#FAF9F5] p-4">
      <p className="text-[10px] text-[#0D3B34]/40">
        {label}
      </p>

      <p
        dir={ltr ? "ltr" : "rtl"}
        className="mt-2 break-all text-xs font-bold text-[#0D3B34]/70"
      >
        {value}
      </p>
    </div>
  );
}


const inputClass =
  "h-14 w-full rounded-2xl border border-[#0D3B34]/10 bg-[#FAF9F5] px-4 text-sm text-[#0D3B34] outline-none transition placeholder:text-[#0D3B34]/30 focus:border-[#D4AF37]/60 focus:bg-white";

function NavItem({
  href,
  label,
  icon,
  active = false,
}: {
  href: string;
  label: string;
  icon: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
        active
          ? "bg-[#0D3B34] text-white"
          : "text-[#0D3B34]/62 hover:bg-white/70"
      }`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-xl ${
          active
            ? "bg-white/10 text-[#D4AF37]"
            : "bg-[#0D3B34]/6"
        }`}
      >
        {icon}
      </span>

      {label}
    </Link>
  );
}

function SummaryCard({
  label,
  value,
  highlight = false,
  success = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  success?: boolean;
}) {
  return (
    <div
      className={`rounded-[26px] border p-5 ${
        highlight
          ? "border-[#D4AF37]/25 bg-[#FFF8E4]"
          : success
          ? "border-[#267247]/15 bg-[#EAF5EE]"
          : "border-white/80 bg-white/72"
      }`}
    >
      <p className="text-xs text-[#0D3B34]/45">{label}</p>

      <p
        className={`mt-3 text-2xl font-bold ${
          success
            ? "text-[#267247]"
            : highlight
            ? "text-[#A67B11]"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#0D3B34]/7 bg-white px-4 py-3">
      <p className="text-[10px] text-[#0D3B34]/40">{label}</p>

      <p className="mt-1 text-xs font-bold text-[#0D3B34]/75">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-[#0D3B34]/65">
        {label}
      </span>

      {children}
    </label>
  );
}

function FormSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[26px] border border-white/80 bg-white/70 p-5 backdrop-blur-xl">
      <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
        {eyebrow}
      </p>

      <h3
        className="mt-1 text-xl font-bold"
        style={{
          fontFamily: "var(--font-el-messiri), serif",
        }}
      >
        {title}
      </h3>

      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function AvailabilityBox({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#0D3B34]/7 bg-[#F8F7F2] p-4">
      <p className="text-[10px] text-[#0D3B34]/40">{title}</p>

      <p className="mt-2 text-xs font-bold">{value}</p>
    </div>
  );
}

function MobileNav({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl px-3 py-2 text-[10px] font-bold ${
        active
          ? "bg-[#0D3B34] text-white"
          : "text-[#0D3B34]/55"
      }`}
    >
      {label}
    </Link>
  );
}