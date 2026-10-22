import Image from "next/image";
import { pointsFromServicePrice } from "@/lib/service-loyalty-points";

/** Compact price-adjacent Loop points badge; no changes to earning calculations. */
export default function ServiceLoyaltyBanner({
  finalPrice,
  className = "",
}: {
  finalPrice: number;
  className?: string;
}) {
  const points = pointsFromServicePrice(Number(finalPrice));
  if (points <= 0) return null;

  return (
    <span
      dir="rtl"
      aria-label={`احصل على ${points.toLocaleString("ar-SA")} نقطة أريس لوب عند الحجز المؤهل`}
      className={`inline-flex max-w-full shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-[#D4AF37]/25 bg-[#FFF8E8] px-2 py-1 text-[10px] font-semibold leading-4 text-[#846117] ${className}`}
    >
      <Image
        src="/Logo/arees-loop-logo.png"
        alt="أريس لوب"
        width={28}
        height={21}
        className="h-[18px] w-[25px] shrink-0 object-contain"
      />
      <span>احصل على <strong className="font-extrabold tabular-nums">{points.toLocaleString("ar-SA")}</strong> نقطة</span>
    </span>
  );
}
