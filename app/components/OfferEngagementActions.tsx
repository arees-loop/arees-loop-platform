"use client";
import {useEffect,useState} from "react";
type Props={id:string;title:string;url?:string;className?:string};
export default function OfferEngagementActions({id,title,url,className=""}:Props){
 const [favorite,setFavorite]=useState(false),[notice,setNotice]=useState("");
 useEffect(()=>{try{setFavorite(JSON.parse(localStorage.getItem("arees-offer-favorites")||"[]").includes(id))}catch{}},[id]);
 function toggle(){try{const current=JSON.parse(localStorage.getItem("arees-offer-favorites")||"[]");const next=favorite?current.filter((x:string)=>x!==id):[...new Set([...current,id])];localStorage.setItem("arees-offer-favorites",JSON.stringify(next));setFavorite(!favorite)}catch{setNotice("تعذر حفظ المفضلة على هذا الجهاز")}}
 async function share(){const link=url||window.location.href;try{if(navigator.share){await navigator.share({title,url:link});return}await navigator.clipboard.writeText(link);setNotice("تم نسخ رابط العرض")}catch(e){if((e as Error)?.name!=="AbortError")setNotice("تعذرت المشاركة، انسخ الرابط من شريط العنوان")}}
 return <div className={`flex items-center justify-between gap-3 ${className}`} dir="rtl"><button type="button" aria-pressed={favorite} onClick={toggle} className="rounded-xl border border-[#D4AF37]/40 bg-white px-4 py-2 text-sm font-bold text-[#0D3B34]">{favorite?"♥ في المفضلة":"♡ أضف للمفضلة"}</button><button type="button" onClick={()=>void share()} className="rounded-xl border border-[#D4AF37]/40 bg-white px-4 py-2 text-sm font-bold text-[#0D3B34]">↗ مشاركة العرض</button>{notice&&<span role="status" className="text-xs text-[#0D3B34]">{notice}</span>}</div>;
}
