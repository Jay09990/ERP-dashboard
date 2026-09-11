import { AppShell } from "@/components/app-shell";
import { CustomerList } from "@/features/party/components/CustomerList";

export default function CustomersPage() {
  return (
    <AppShell>
      <CustomerList />
    </AppShell>
  );
}