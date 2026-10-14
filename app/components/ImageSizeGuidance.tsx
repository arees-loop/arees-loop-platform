import type { ImageDimensions } from "@/lib/client-image-dimensions";
import type { ImageRequirement } from "@/lib/image-requirements";

export default function ImageSizeGuidance({
  requirement,
  actual,
}: {
  requirement: ImageRequirement;
  actual?: ImageDimensions | null;
}) {
  const valid = actual?.width === requirement.width && actual?.height === requirement.height;
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
