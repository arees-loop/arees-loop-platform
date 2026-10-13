import { redirect } from "next/navigation";

// Single partner entry point: keep old /partner bookmarks working without a duplicate page.
export default function PartnersLandingPage() {
  redirect("/partner/select-type");
}
