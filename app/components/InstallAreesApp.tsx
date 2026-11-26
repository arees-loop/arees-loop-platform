"use client";
import { useEffect, useState } from "react";
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{outcome: "accepted"|"dismissed"}> };
export default function InstallAreesApp() {
  const [promptEvent,setPromptEvent] = useState<InstallPromptEvent|null>(null);
  const [installed,setInstalled] = useState(false);
  const [showHelp,setShowHelp] = useState(false);
  useEffect(()=>{
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & {standalone?:boolean}).standalone === true;
    setInstalled(standalone);
    const onPrompt=(e:Event)=>{e.preventDefault();setPromptEvent(e as InstallPromptEvent)};
    const onInstalled=()=>{setInstalled(true);setPromptEvent(null);setShowHelp(false)};
    window.addEventListener("beforeinstallprompt",onPrompt);
    window.addEventListener("appinstalled",onInstalled);
    return ()=>{window.removeEventListener("beforeinstallprompt",onPrompt);window.removeEventListener("appinstalled",onInstalled)};
  },[]);
  if(installed)return null;
  const install=async()=>{
    if(promptEvent){await promptEvent.prompt();await promptEvent.userChoice;setPromptEvent(null)}
    else setShowHelp(v=>!v);
  };
  return <div dir="rtl" className="fixed bottom-5 left-4 z-[110] max-w-[min(340px,calc(100vw-32px))]">
    <button type="button" onClick={install} className="rounded-full border border-[#D4AF37]/40 bg-[#0D3B34] px-4 py-2.5 text-xs font-bold text-white shadow-lg" aria-expanded={showHelp}>📲 تثبيت أريس على الجوال</button>
    {showHelp&&<div className="mt-2 rounded-2xl border border-[#D4AF37]/30 bg-white p-4 text-sm text-[#0D3B34] shadow-xl">
      <p className="mb-2 font-bold">أضف أريس إلى الشاشة الرئيسية</p>
      <p>على iPhone: افتح الموقع في Safari، ثم مشاركة ← إضافة إلى الشاشة الرئيسية.</p>
      <p className="mt-2">على Android: افتح قائمة Chrome ⋮ واختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».</p>
      <button type="button" className="mt-3 text-xs underline" onClick={()=>setShowHelp(false)}>إغلاق</button>
    </div>}
  </div>;
}
