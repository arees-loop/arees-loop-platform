import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import VisaCatalogAdmin from "./VisaCatalogAdmin";

export default async function VisaAdminPage(){
  const session=await getCurrentSession();
  if(!session || session.user.role!=="SUPER_ADMIN") redirect("/admin/login");
  return <VisaCatalogAdmin/>;
}
