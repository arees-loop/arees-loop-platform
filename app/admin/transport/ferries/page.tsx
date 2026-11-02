import { notFound, redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { canManageTransport } from "@/lib/transport-permissions";
import TransportAdminPage from "../TransportDesk";

export default async function FerryTransportAdminPage() {
  const session=await getCurrentSession();
  if(!session || !["SUPER_ADMIN","ADMIN"].includes(session.user.role)) redirect("/admin/login");
  if(!canManageTransport(session.user,"FERRY")) notFound();
  return <TransportAdminPage initialOfferKind="FERRY"/>;
}
