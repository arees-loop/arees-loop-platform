"use client";
import {useEffect,useState} from "react";
export default function BankSettings(){
 const [accounts,setAccounts]=useState<any[]>([]);
 const [bankName,setBank]=useState(""),[beneficiaryName,setName]=useState(""),[iban,setIban]=useState(""),[message,setMessage]=useState("");
 async function refresh(){const r=await fetch("/api/admin/bank-accounts",{cache:"no-store"});const d=await r.json();if(d.success)setAccounts(d.accounts);else setMessage(d.message)}
 useEffect(()=>{void refresh()},[]);
 async function save(){const r=await fetch("/api/admin/bank-accounts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bankName,beneficiaryName,iban})});const d=await r.json();setMessage(d.message||"تم");await refresh()}
 async function activate(id:string,active:boolean){if(active&&!confirm("تأكدت من صحة الحساب البنكي؟"))return;const r=await fetch("/api/admin/bank-accounts",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,active})});setMessage(r.ok?"تم تحديث الحساب":"تعذر التحديث");await refresh()}
 return <main dir="rtl" className="mx-auto max-w-3xl p-8 pt-28"><h1 className="text-2xl font-bold">إعدادات السداد والحسابات البنكية</h1><div className="my-5 grid gap-3 rounded-xl border p-5"><input placeholder="اسم البنك" className="border p-3" value={bankName} onChange={e=>setBank(e.target.value)}/><input placeholder="اسم المستفيد" className="border p-3" value={beneficiaryName} onChange={e=>setName(e.target.value)}/><input placeholder="IBAN" dir="ltr" className="border p-3" value={iban} onChange={e=>setIban(e.target.value)}/><button onClick={()=>void save()} className="rounded bg-emerald-900 p-3 text-white">حفظ غير مفعّل</button></div>{accounts.map(a=><div key={a.id} className="my-3 rounded border p-4"><p>{a.bankName} — {a.beneficiaryName}</p><p dir="ltr">{a.iban}</p><button className="mt-3 rounded border p-2" onClick={()=>void activate(a.id,!a.active)}>{a.active?"إيقاف":"تفعيل"}</button></div>)}<p role="status">{message}</p></main>;
}
