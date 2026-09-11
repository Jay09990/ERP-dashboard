import { AppShell } from "@/components/app-shell";
import { VendorList } from "@/features/party/components/VendorList";

export default function VendorsPage() {
  return (
    <AppShell>
      <VendorList />
    </AppShell>
  );
}