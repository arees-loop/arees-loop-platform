import type { ImageDimensions } from "@/lib/client-image-dimensions";
import type { ImageRequirement } from "@/lib/image-requirements";

export default function ImageSizeGuidance({
  requirement,
  actual,
  flexible = false,
}: {
  requirement: ImageRequirement;
  actual?: ImageDimensions | null;
  flexible?: boolean;
}) {
  const valid = actual?.width === requirement.width && actual?.height === requirement.height;
  const sameRatio=!!actual&&Math.abs(actual.width/actual.height-requirement.width/requirement.height)<0.02;
  if(flexible)return <div className="mt-2 rounded-xl border border-[#D4AF37]/45 bg-[#FFF9E9] px-4 py-3 text-xs leading-6 text-[#0D3B34]">
    <p className="font-black">المقاس الموصى به: {requirement.width} × {requirement.height} بكسل — {requirement.label}.</p>
    <p className="mt-1">يمكنك رفع أي أبعاد مناسبة؛ الصور المخالفة للنسبة المقترحة لا تُرفض، وقد يُقص جزء منها عند عرضها داخل بطاقة بنسبة 2:1.</p>
    {actual&&<p className={`mt-1 font-bold ${valid||sameRatio?"text-emerald-800":"text-amber-800"}`}>
      صورتك: {actual.width} × {actual.height} بكسل — {valid?"✓ المقاس المقترح":sameRatio?"✓ النسبة مناسبة وقد يتغير الحجم":"⚠ نسبة مختلفة، راجع معاينة القص قبل النشر"}
    </p>}
  </div>;
  return (
    <div className="mt-2 rounded-xl border-2 border-red-300 bg-red-50 px-3 py-2 text-xs leading-5 text-red-800">
      <p className="font-black">المقاس المطلوب: {requirement.width} × {requirement.height} بكسل — {requirement.label}.</p>
      {actual && (
        <p className={`mt-1 font-bold ${valid ? "text-emerald-700" : "text-red-700"}`}>
          مقاس الصورة المختارة: {actual.width} × {actual.height} بكسل {valid ? "✓ مطابق" : "— لن تُقبل الصورة"}
        </p>
      )}
    </div>
  );
}
