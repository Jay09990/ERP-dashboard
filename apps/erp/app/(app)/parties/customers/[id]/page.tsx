"use client";

import { CustomerDetail } from "@/features/parties/customers";
import { useParams } from "next/navigation";

export default function CustomerDetailPage() {
  const params = useParams();
  return <CustomerDetail id={params.id as string} />;
}
