import { redirect } from "next/navigation";
// Legacy combined link: route to the independent air desk. The sidebar exposes both departments.
export default function TransportIndexPage() { redirect("/admin/transport/flights"); }
