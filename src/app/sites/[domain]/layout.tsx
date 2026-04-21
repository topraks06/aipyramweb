import { ReactNode } from "react";
import PerdeClientWrapper from "@/components/tenant-perde/PerdeClientWrapper";

export default async function DomainLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const resolvedParams = await params;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  
  return (
    <>
      {children}
      {exactDomain.includes('perde') && <PerdeClientWrapper />}
    </>
  );
}
