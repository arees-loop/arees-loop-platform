"use client";
import Link from "next/link";

/**
 * Informational payment-method chooser for the legacy cart.
 * This release does not create a bank checkout order from the cart;
 * existing bank transfer flow requires an approved service quote.
 */
export default function CartPaymentMethodsInfo(){
 const upcoming=[
  {name:"مدى",description:"بطاقات مدى"},
  {name:"Visa",description:"البطاقات الائتمانية"},
  {name:"Mastercard",description:"البطاقات الائتمانية"},
  {name:"Apple Pay",description:"الدفع بالأجهزة المدعومة"},
  {name:"stc pay",description:"محفظة إلكترونية"},
  {name:"تابي / تمارا",description:"التقسيط"},
 ];
 return <section dir="rtl" aria-label="طرق السداد" className="mt-5 rounded-2xl border border-[#D4AF37]/40 bg-[#FFFDF7] p-5 text-[#0D3B34]">
  <h3 className="text-lg font-black">طرق السداد</h3>
  <p className="mt-1 text-xs leading-7 text-[#536C63]">طرق السداد المعتمدة والخيارات القادمة. لا يتم الخصم بمجرد اختيار وسيلة الدفع.</p>
  <div className="mt-4 rounded-2xl border border-[#D4AF37]/45 bg-white p-4">
   <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-black">🏦 التحويل البنكي</p><span className="rounded-full bg-[#EDF5E9] px-2 py-1 text-[10px] font-bold text-[#386E38]">متاح للطلبات المعتمدة</span></div>
   <p className="mt-2 text-xs leading-6">بعد تسجيل الطلب ومراجعته واعتماد السعر، تظهر بيانات الحساب البنكي وإرسال إثبات التحويل في صفحة «طلباتي». التحويل المباشر من السلة لم يُفعّل بعد.</p>
   <Link href="/my-requests" className="mt-3 inline-flex rounded-xl border border-[#B9974A] bg-[#FFF8E8] px-4 py-2.5 text-xs font-black">متابعة الطلبات ووسائل السداد ←</Link>
  </div>
  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="طرق الدفع الإلكتروني القادمة">
    {upcoming.map(method=><div key={method.name} className="flex min-h-[80px] flex-col items-center justify-center rounded-xl border border-[#E4D8BC] bg-white px-2 py-3 text-center">
      <span className="text-xs font-black">{method.name}</span>
      <span className="mt-1 text-[10px] text-[#687970]">{method.description}</span>
      <span className="mt-1.5 rounded-full bg-[#F7ECCD] px-2 py-0.5 text-[9px] font-bold text-[#795C26]">قريباً</span>
    </div>)}
  </div>
  <p className="mt-3 text-xs leading-6 text-[#536C63]">لن يتم تحصيل مبلغ عبر مدى أو Visa أو Mastercard أو Apple Pay أو stc pay أو التقسيط إلى حين تفعيل مزود الدفع وإعلانه.</p>
 </section>;
}
