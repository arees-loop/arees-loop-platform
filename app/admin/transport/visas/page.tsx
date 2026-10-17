import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import VisaAdminWorkspace from "./VisaAdminWorkspace";

export default async function VisaAdminPage(){
  const session=await getCurrentSession();
  if(!session || session.user.role!=="SUPER_ADMIN") redirect("/admin/login");
  return <VisaAdminWorkspace/>;
}
