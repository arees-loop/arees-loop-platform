import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { canManageTransport } from "@/lib/transport-permissions";
import VisaAdminWorkspace from "./VisaAdminWorkspace";

export default async function VisaAdminPage(){
  const session=await getCurrentSession();
  if(!session || !canManageTransport(session.user,"VISA")) redirect("/admin/login");
  return <VisaAdminWorkspace canEditCatalog={session.user.role==="SUPER_ADMIN"}/>;
}
