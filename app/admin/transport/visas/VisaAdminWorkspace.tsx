"use client";
import {useState} from "react";
import VisaCatalogAdmin from "./VisaCatalogAdmin";
import TransportDesk from "../TransportDesk";
export default function VisaAdminWorkspace(){
 const [tab,setTab]=useState<"requests"|"catalog">("requests");
 return <div dir="rtl"><div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 pt-8"><button type="button" aria-pressed={tab==="requests"} onClick={()=>setTab("requests")} className={`rounded-full border border-[#0D3B34] px-5 py-3 text-sm font-bold ${tab==="requests"?"bg-[#0D3B34] text-white":"bg-white text-[#0D3B34]"}`}>إدارة طلبات التأشيرات</button><button type="button" aria-pressed={tab==="catalog"} onClick={()=>setTab("catalog")} className={`rounded-full border border-[#0D3B34] px-5 py-3 text-sm font-bold ${tab==="catalog"?"bg-[#0D3B34] text-white":"bg-white text-[#0D3B34]"}`}>كاتلوج التأشيرات</button></div>{tab==="requests"?<TransportDesk initialOfferKind="VISA"/>:<VisaCatalogAdmin/>}</div>;
}
