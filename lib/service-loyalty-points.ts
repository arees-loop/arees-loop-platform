/**
 * Public Arees Loop earning preview: one point per whole Saudi riyal in
 * the displayed payable service price. No client-side award/ledger writes.
 */
export function pointsFromServicePrice(finalPrice: number): number {
  if (!Number.isFinite(finalPrice) || finalPrice <= 0) return 0;
  // Round displayed currency to halalas before calculating whole-riyal points.
  return Math.min(1_000_000_000, Math.floor(Math.round(finalPrice * 100) / 100));
}
