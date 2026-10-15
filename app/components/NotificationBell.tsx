"use client";
import Link from "next/link";
import {useCallback,useEffect,useRef,useState} from "react";
import {useRouter} from "next/navigation";

type Item={id:string;type:string;title:string;body:string;href:string;createdAt:string;readAt:string|null};
type Tone="newRequest"|"update"|"confirmed"|"appOpen";
// Files are the five officially approved Arees Loop Sonic Signature v2 tracks.
// Assets must be checked into public/audio separately; no substitute tone is played.
export const AREES_SONIC_TRACKS:Record<Tone,string>={
 newRequest:"/audio/01_AreesLoop_Signature_Luxury_Cinematic.mp3",
 update:"/audio/03_AreesLoop_Modern_Youthful.mp3",
 confirmed:"/audio/05_AreesLoop_Booking_Confirmed.mp3",
 appOpen:"/audio/04_AreesLoop_App_Opening.mp3",
};
const SOUND_PREFERENCE="arees-loop-notification-sound-v2";
const ANCHOR_PREFIX="arees-loop-notification-last-seen-v2:";
export default function NotificationBell({role,userId}:{role:"admin"|"customer";userId:string}) {
 const router=useRouter();
 const [open,setOpen]=useState(false);
 const [items,setItems]=useState<Item[]>([]);
 const [unread,setUnread]=useState(0);
 const [muted,setMuted]=useState(true);
 const [error,setError]=useState("");
 const [soundReady,setSoundReady]=useState(false);
 const [loaded,setLoaded]=useState(false);
 const lastSeen=useRef<number|null>(null);
 const audio=useRef<HTMLAudioElement|null>(null);
 const busy=useRef(false);

 useEffect(()=>{
   try{setMuted(window.localStorage.getItem(SOUND_PREFERENCE)!=="on");}
   catch{setMuted(true);}
 },[]);

 const playSound=useCallback((type:string)=>{
  const track=type==="REQUEST_CONFIRMED"?AREES_SONIC_TRACKS.confirmed:role==="admin"?AREES_SONIC_TRACKS.newRequest:AREES_SONIC_TRACKS.update;
  try{
   audio.current?.pause();
   const player=new Audio(track);
   audio.current=player;player.volume=0.55;
   // A user gesture must enable playback; browsers can still block it.
   void player.play().catch(()=>{});
  }catch{}
 },[role]);

 const refresh=useCallback(async()=>{
  if(busy.current||document.hidden)return;
  busy.current=true;
  try{
   const r=await fetch("/api/notifications/inbox",{cache:"no-store",credentials:"include"});
   if(!r.ok)throw new Error("تعذر جلب الإشعارات.");
   const payload=await r.json() as {success:boolean;data:Item[];unread:number};
   if(!payload.success||!Array.isArray(payload.data))throw new Error("تعذر قراءة الإشعارات.");
   setItems(payload.data);
   setUnread(payload.unread);
   const newest=payload.data.reduce((v,item)=>Math.max(v,new Date(item.createdAt).getTime()||0),0);
   const key=ANCHOR_PREFIX+userId;
   let previous=lastSeen.current;
   if(previous===null){
     try{previous=Number(window.localStorage.getItem(key)||0);}catch{previous=0;}
   }
   const incoming=payload.data.filter(item=>!item.readAt&&(new Date(item.createdAt).getTime()||0)>previous!);
   if(incoming.length&&previous>0&&!muted&&soundReady)playSound(incoming[0].type);
   if(newest>previous){lastSeen.current=newest;try{window.localStorage.setItem(key,String(newest));}catch{}}
   else if(lastSeen.current===null)lastSeen.current=previous;
   setError("");
  }catch{setError("تعذر تحديث الإشعارات الآن.");}
  finally{busy.current=false;setLoaded(true);}
 },[userId,muted,soundReady,playSound]);

 useEffect(()=>{
  let active=true;
  const safeRefresh=()=>{if(active)void refresh()};
  safeRefresh();
  const id=window.setInterval(safeRefresh,25000);
  window.addEventListener("focus",safeRefresh);
  document.addEventListener("visibilitychange",safeRefresh);
  return()=>{active=false;window.clearInterval(id);window.removeEventListener("focus",safeRefresh);document.removeEventListener("visibilitychange",safeRefresh);audio.current?.pause();};
 },[refresh]);

 async function readAndOpen(item:Item){
   if(!item.readAt){
    try{await fetch("/api/notifications/inbox",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:item.id})});}catch{}
   }
   setOpen(false);
   if(item.href.startsWith("/")&&!item.href.startsWith("//"))router.push(item.href);
 }
 function toggleSound(){
   const enable=muted;
   setMuted(!enable);setSoundReady(enable);
   try{window.localStorage.setItem(SOUND_PREFERENCE,enable?"on":"off");}catch{}
   if(enable)playSound(role==="admin"?"NEW_REQUEST":"REQUEST_UPDATE"); // Direct user gesture: preview approved signature.
   else audio.current?.pause();
 }
 return <div className="relative" dir="rtl">
   <button type="button" aria-label={`الإشعارات، ${unread} غير مقروء`} aria-expanded={open} onClick={()=>{setOpen(v=>!v);void refresh()}}
     className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-white text-[#0D3B34] shadow-sm hover:bg-[#FFF6DD]">
     <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 8-3 7-3 9h18c0-2-3-1-3-9M10 21h4"/></svg>
     {unread>0&&<span className="absolute -left-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[10px] font-black">{unread>99?"99+":unread}</span>}
   </button>
   {open&&<div className="absolute left-0 top-[calc(100%+10px)] z-[200] w-[min(355px,calc(100vw-24px))] max-h-[65vh] overflow-y-auto rounded-[20px] border border-[#D4AF37]/35 bg-white p-3 shadow-[0_18px_45px_rgba(13,59,52,.20)]">
    <div className="flex items-center justify-between gap-3 border-b border-[#D4AF37]/25 pb-3">
      <strong className="text-sm text-[#0D3B34]">الإشعارات ({unread})</strong>
      <button type="button" onClick={toggleSound} className="rounded-lg border border-[#D4AF37]/35 px-2 py-1.5 text-xs font-bold text-[#0D3B34]">{muted?"🔇 تفعيل الصوت":"🔊 كتم الصوت"}</button>
    </div>
    {error&&<p role="status" className="mt-2 text-xs text-amber-700">{error}</p>}
    {!loaded&&<p className="py-4 text-xs">جارٍ تحميل الإشعارات...</p>}
    {loaded&&items.length===0&&<p className="py-6 text-center text-sm text-[#0D3B34]/60">لا توجد إشعارات جديدة.</p>}
    <div className="space-y-1 py-2">{items.slice(0,12).map(item=><button key={item.id} type="button" onClick={()=>void readAndOpen(item)}
     className={`w-full rounded-xl p-3 text-right hover:bg-[#FBF3DF] ${item.readAt?"bg-white":"bg-[#F9F5EB]"}`}>
      <span className="block text-xs font-black text-[#0D3B34]">{item.title}</span>
      <span className="mt-1 block text-xs leading-6 text-[#0D3B34]/75">{item.body}</span>
      <span className="mt-1 block text-[10px] text-[#0D3B34]/45">{new Intl.DateTimeFormat("ar-SA",{dateStyle:"short",timeStyle:"short"}).format(new Date(item.createdAt))}</span>
    </button>)}</div>
    {role==="customer"&&<Link onClick={()=>setOpen(false)} href="/notifications" className="block rounded-xl border border-[#D4AF37]/35 p-2 text-center text-xs font-black text-[#0D3B34]">جميع الإشعارات ←</Link>}
    {!muted&&<p className="mt-2 text-[10px] text-[#0D3B34]/55">الصوت يعمل عند السماح به من المتصفح، أثناء فتح الموقع.</p>}
   </div>}
 </div>;
}
