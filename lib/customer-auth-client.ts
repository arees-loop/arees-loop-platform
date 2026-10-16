"use client";
/** UI convenience only. Server POST handlers MUST also verify the session. */
export async function requireCustomerSession(returnPath:string):Promise<boolean>{
  try{
    const res=await fetch("/api/auth/me",{cache:"no-store",credentials:"include"});
    if(res.ok){
      const data=await res.json();
      if(data?.data?.user)return true;
    }
  }catch{}
  const target=returnPath.startsWith("/")&&!returnPath.startsWith("//")?returnPath:"/";
  window.dispatchEvent(new CustomEvent("arees:login-required",{detail:{nextPath:target}}));
  return false;
}
