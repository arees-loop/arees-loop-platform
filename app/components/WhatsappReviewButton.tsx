"use client";
type Props={phone?:string|null;reference?:string;className?:string};
export const REVIEW_TEXT="قيم تجربتك معنا ☺️\n\nانطلاقاً من قيمنا ، تتمثل مهمتنا في أن نكون شريكاً ذا قيمة عالية لعملائنا ،لنسهل لعملائنا الوصول لمبتغاهم ونبسط لهم المعاملة نهديهم الخدمة الانيقة.\n\nتقييمك يساعدنا في تحقيق رضاكم🙂‍↕️\n\nhttps://g.page/r/CV-pkJoyxG97EB0/review";
export default function WhatsappReviewButton({phone,reference,className}:Props){
 const clean=(phone||"").replace(/\D/g,"");
 if(!clean)return <span className="text-xs text-[#805D38]">يلزم تسجيل رقم واتساب العميل لإرسال طلب التقييم.</span>;
 return <a href={"https://wa.me/"+clean+"?text="+encodeURIComponent(REVIEW_TEXT)}
  target="_blank" rel="noopener noreferrer" aria-label={"فتح واتساب لطلب تقييم الخدمة"+(reference?" للطلب "+reference:"")}
  className={className||"inline-flex items-center justify-center rounded-xl bg-[#147D55] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#106448]"}>
  ⭐ إرسال طلب تقييم للعميل عبر واتساب ↗
 </a>;
}
