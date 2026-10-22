import {redirect} from "next/navigation";
export const dynamic="force-dynamic";
/** Legacy admin URL. Financial evidence APIs remain available for the unified detail view. */
export default function LegacyCartBankPayments(){redirect("/admin/bookings?source=cart");}
