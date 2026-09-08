"use client";

import { deliveryChallanApi } from "@/features/documents/api";
import { DocumentList } from "@/features/documents/components/DocumentList";

export default function DeliveryChallansPage() {
  return (
    <DocumentList
      docType="delivery_challan"
      title="Delivery Challans"
      subtitle="Track material dispatch documents and goods movement notes."
      eyebrow="Sales Module"
      useList={deliveryChallanApi.useList}
      useCreate={deliveryChallanApi.useCreate}
      useUpdate={deliveryChallanApi.useUpdate}
      useDelete={deliveryChallanApi.useDelete}
    />
  );
}
