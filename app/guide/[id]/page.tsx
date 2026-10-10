import { redirect } from "next/navigation";

export default async function LegacyGuideProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/guides/${encodeURIComponent(id)}`);
}
