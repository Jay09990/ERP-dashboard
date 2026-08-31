import { AppShell } from "@/components/app-shell";
import { CompanyList } from "@/features/companies";

export default function CompaniesPage() {
  return (
    <AppShell>
      <CompanyList />
    </AppShell>
  );
}
