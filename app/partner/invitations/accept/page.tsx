import {Suspense} from "react";
import InvitationAcceptance from "./InvitationAcceptance";
export default function Page(){
 return <Suspense fallback={<main dir="rtl" className="p-10">جاري تحميل الدعوة...</main>}><InvitationAcceptance/></Suspense>;
}
