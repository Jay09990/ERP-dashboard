import { AppShell } from "@/components/app-shell";
import { CompanyDetail } from "@/features/companies";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  return (
    <AppShell>
      <CompanyDetail companyId={resolvedParams.id} />
    </AppShell>
  );
}
