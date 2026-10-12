import { redirect } from "next/navigation";

// Guide registration uses the existing, persistent partner onboarding workflow.
// Applicants select the individual provider type and the "مرشدون" category.
export default function GuideRegisterPage() {
  redirect("/partner/onboarding");
}
