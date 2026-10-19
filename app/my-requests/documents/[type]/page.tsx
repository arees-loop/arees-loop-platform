import {Suspense} from "react";
import {notFound} from "next/navigation";
import PrintableTravelDocument from "@/app/components/PrintableTravelDocument";

type Props={params:Promise<{type:string}>};
export default async function CustomerPrintablePage({params}:Props){
 const {type}=await params;
 if(type!=="quote"&&type!=="confirmed")notFound();
 return <Suspense fallback={<div dir="rtl" className="mx-auto max-w-3xl p-8">جارٍ إعداد المستند الخاص بك...</div>}>
  <PrintableTravelDocument type={type}/>
 </Suspense>;
}
