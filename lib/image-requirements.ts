export const IMAGE_REQUIREMENTS = {
  offer: { width: 1200, height: 1200, label: "صورة عرض الطيران والبواخر والفنادق (مربعة)" },
  visa: { width: 1200, height: 1200, label: "صورة التأشيرة" },
  servicePhoto: { width: 1200, height: 1200, label: "صورة الخدمة أو البرنامج (مربعة)" },
  successPartner: { width: 1200, height: 800, label: "شعار شريك النجاح" },
  squareLogo: { width: 512, height: 512, label: "شعار الجهة" },
  avatar: { width: 512, height: 512, label: "الصورة الشخصية" },
} as const;

export type ImageRequirement = { width: number; height: number; label: string };

export function imageDimensionMessage(requirement: ImageRequirement) {
  return `المقاس المطلوب ${requirement.width} × ${requirement.height} بكسل.`;
}
