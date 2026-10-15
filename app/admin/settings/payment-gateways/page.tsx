import Link from "next/link";
const gateways=[
  {name:"NeoLeap",note:"بانتظار تأكيد IP Whitelisting واختبار Sandbox وإثبات webhook وربط مبلغ الطلب."},
  {name:"Tabby",note:"بانتظار حساب التاجر، الاعتماد، اختبار التأهيل والرسوم والتسوية."},
  {name:"Tamara",note:"بانتظار حساب التاجر، الاعتماد، اختبار التأهيل والرسوم والتسوية."},
  {name:"MIS Pay",note:"بانتظار تدوير السر المكشوف سابقاً والتحقق من بيانات الربط والتوقيع."},
];
export default function GatewaysReadiness(){
 return <main dir="rtl" className="mx-auto max-w-5xl px-5 py-10 text-[#0D3B34]"><Link href="/admin/settings" className="text-sm underline">← إعدادات المنصة</Link><h1 className="mt-5 text-3xl font-black">بوابات الدفع والتقسيط</h1><p className="mt-3 max-w-3xl text-sm leading-8">هذه شاشة حالة التجهيز فقط. جميع البوابات غير مفعّلة للعملاء؛ لا توجد أزرار تشغيل حتى يجتاز كل مزود اختبار Sandbox وتُراجع صلاحيات الأسرار والـ webhooks ورسوم التسوية.</p><div className="mt-7 grid gap-4 md:grid-cols-2">{gateways.map(g=><section key={g.name} className="rounded-2xl border border-[#D4AF37]/25 bg-white p-6 shadow-sm"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black" dir="ltr">{g.name}</h2><span className="rounded-full bg-[#F8EED4] px-3 py-1 text-xs font-bold">غير مفعّل</span></div><p className="mt-3 text-sm leading-7">{g.note}</p></section>)}</div><section className="mt-6 rounded-2xl border border-[#D4AF37]/30 bg-[#F8F0E2] p-5 text-sm leading-8"><h2 className="font-black">ضوابط التشغيل</h2><p>لا تُقبل المدفوعات إلا بعد إنشاء طلب موثوق بأسعار خادمية، والتحقق من توقيع إشعار مزود الدفع، ومعالجة تكرار الإشعارات، وتسجيل الاسترداد والتسويات ومنع تكرار التحصيل.</p><p>تفعيل التقسيط لكل خدمة ونسب العمولة يُنفّذ بعد توثيق العقود والرسوم الفعلية مع مزوّدي التمويل، لا على افتراضات.</p></section></main>;
}
