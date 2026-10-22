/**
 * Submission/approval contract for new and existing partner requests.
 * This function is pure: it never writes to live customer/partner records.
 */
type License = {type:string;issuer:string;licenseNumber:string;expiryDate:Date|null};
type Document = {type:string;label:string|null;fileUrl:string;fileName:string|null};
export type PartnerRequirementsSnapshot = {
  partnerType:string|null;applicantRole:string|null;
  tradeNameAr:string|null;city:string|null;descriptionAr:string|null;
  licenses:License[];documents:Document[];
};
export function getPartnerRequirements(p:PartnerRequirementsSnapshot):string[] {
  const missing:string[] = [];
  if (!p.partnerType || !["BUSINESS","INDIVIDUAL","GOVERNMENT_NONPROFIT"].includes(p.partnerType)) missing.push("نوع الشريك غير محدد.");
  if (!p.tradeNameAr?.trim() || !p.city?.trim()) missing.push("اسم مقدم الخدمة والمدينة مطلوبان.");
  const license = p.licenses.some(l => l.type?.trim() && l.issuer?.trim() && l.licenseNumber?.trim() &&
    l.expiryDate && l.expiryDate.getTime() >= Date.now());
  if (!license) missing.push("رخصة سارية برقم وجهة إصدار وتاريخ انتهاء إلزامية.");
  const documents = p.documents.filter(d => Boolean(d.fileUrl&&d.fileName));
  const licenseFile = documents.some(d => /ترخيص|رخصة|license|permit/i.test(d.label||""));
  if (!licenseFile) missing.push("ارفع صورة الترخيص أو ملف PDF للرخصة.");
  if (p.partnerType === "BUSINESS") {
    if (!["OWNER","REPRESENTATIVE"].includes(p.applicantRole||"")) missing.push("حدد صفة مقدم الطلب: مالك أو ممثل مفوض.");
    if (p.applicantRole === "OWNER" && !documents.some(d => d.type==="BUSINESS_PROOF" && /ملكية/.test(d.label||"")))
      missing.push("أرفق إثبات ملكية المنشأة.");
    if (p.applicantRole === "REPRESENTATIVE" && !documents.some(d => d.type==="AUTHORIZATION"))
      missing.push("أرفق التفويض الرسمي للممثل.");
  }
  if (p.partnerType === "INDIVIDUAL") {
    if (!p.descriptionAr?.includes("تخصص المرشد:") || !p.descriptionAr?.includes("اللغات:"))
      missing.push("أكمل تخصص المرشد السياحي ولغات الإرشاد.");
  }
  if (p.partnerType === "GOVERNMENT_NONPROFIT") {
    if (!documents.some(d=>d.type==="GOVERNMENT_LETTER"||/وثيقة جهة/.test(d.label||"")))
      missing.push("أرفق خطاباً أو وثيقة رسمية لإثبات صفة الجهة الحكومية أو غير الربحية.");
  }
  return missing;
}
