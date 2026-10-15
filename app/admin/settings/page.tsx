import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import AdminIcon, {type AdminIconName} from "../AdminIcon";
type Entry={href:string;label:string;description:string;icon:AdminIconName;permission?:string;superOnly?:boolean};
const operations:Entry[]=[
 {href:"/admin/partners",label:"طلبات الشركاء",description:"مراجعة طلبات انضمام الشركاء",icon:"partners",permission:"PARTNER_REQUESTS"},
 {href:"/admin/partners?view=active",label:"الشركاء المعتمدون",description:"متابعة المنشآت والشركاء النشطين",icon:"check",permission:"ACTIVE_PARTNERS"},
 {href:"/admin/services",label:"الخدمات والتجارب",description:"المراجعة والاعتماد والنشر",icon:"services",permission:"CONTENT_EXPERIENCES"},
 {href:"/admin/users",label:"المستخدمون والصلاحيات",description:"الموظفون والمستخدمون المصرح لهم",icon:"users",superOnly:true},
 {href:"/admin/rewards",label:"النقاط وتقارير الاستبدال",description:"متابعة نقاط Loop ومعاملاتها",icon:"rewards",permission:"REPORTS_ANALYTICS"},
 {href:"/admin/dashboard?section=reports",label:"التقارير والإحصاءات",description:"ملخصات أداء المنصة",icon:"chart",permission:"REPORTS_ANALYTICS"},
];
const settings:Entry[]=[
 {href:"/admin/navigation",label:"روابط القائمة العلوية",description:"إظهار أو إخفاء روابط الهيدر",icon:"menu",permission:"PLATFORM_SETTINGS"},
 {href:"/admin/success-partners",label:"شركاء النجاح",description:"شعارات الشركاء والشريط المتحرك",icon:"partners",superOnly:true},
 {href:"/admin/settings/bank-account",label:"الحساب البنكي",description:"المستفيد والآيبان ورمز QR",icon:"wallet",superOnly:true},
 {href:"/admin/settings/driving-license-points",label:"نقاط الرخصة الدولية",description:"ضبط مكافأة الـ150 نقطة",icon:"rewards",superOnly:true},
 {href:"/admin/settings/payment-gateways",label:"بوابات الدفع والتقسيط",description:"جاهزية NeoLeap وتابي وتمارا وMIS Pay",icon:"credit",superOnly:true},
];
function Tile({item}:{item:Entry}){return <Link href={item.href} className="group flex items-start gap-3 rounded-2xl border border-[#D4AF37]/25 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C0A15A] hover:shadow-md">
  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F3EACF] text-[#0D3B34]"><AdminIcon name={item.icon} size={26}/></span>
  <div className="min-w-0 flex-1"><h3 className="font-black text-[#0D3B34]">{item.label}</h3><p className="mt-1 text-xs leading-6 text-[#0D3B34]/70">{item.description}</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#A47818]">فتح القسم <AdminIcon name="arrow" size={14}/></span></div>
</Link>}
export default async function PlatformManagementPage(){
 const session=await getCurrentSession();
 if(!session||!["ADMIN","SUPER_ADMIN"].includes(session.user.role))redirect("/admin/login");
 const superAdmin=session.user.role==="SUPER_ADMIN";
 const perms=Array.isArray(session.user.adminPermissions)?session.user.adminPermissions.map(String):[];
 const allowed=(item:Entry)=>superAdmin||(!item.superOnly&&(!item.permission||perms.includes(item.permission)));
 const filteredOperations=operations.filter(allowed),filteredSettings=settings.filter(allowed);
 return <main dir="rtl" className="mx-auto max-w-7xl px-5 py-10 text-[#0D3B34]">
 <p className="text-xs font-black tracking-widest text-[#A67B22]">AREES LOOP · ADMIN</p>
 <h1 className="mt-2 text-3xl font-black">إدارة المنصة</h1>
 <p className="mt-3 text-sm leading-7 text-[#0D3B34]/70">أدوات الإدارة والتشغيل والإعدادات في مكان واحد، دون تكرار روابطها في القائمة الجانبية.</p>
 {filteredOperations.length>0&&<section className="mt-8"><h2 className="mb-4 text-xl font-black">المنصة والشركاء</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filteredOperations.map(item=><Tile key={item.href} item={item}/>)}</div></section>}
 {filteredSettings.length>0&&<section className="mt-9"><h2 className="mb-4 text-xl font-black">الضبط والإعدادات</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filteredSettings.map(item=><Tile key={item.href} item={item}/>)}</div></section>}
 </main>;
}
