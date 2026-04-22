import VorhangImpressum from "@/components/tenant-vorhang/VorhangImpressum";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ImpressumPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const d = decodeURIComponent(domain);

  if (d.includes('vorhang')) {
    return <VorhangImpressum />;
  }

  // If a tenant requests impressum but doesn't have one, we could return 404
  // since it's mostly a German requirement for Vorhang.
  return notFound();
}
