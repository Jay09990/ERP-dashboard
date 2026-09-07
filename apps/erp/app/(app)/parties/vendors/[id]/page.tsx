"use client";

import { VendorDetail } from "@/features/parties/vendors";
import { useParams } from "next/navigation";

export default function VendorDetailPage() {
  const params = useParams();
  return <VendorDetail id={params.id as string} />;
}
