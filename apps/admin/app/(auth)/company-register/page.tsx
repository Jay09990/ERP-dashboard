"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { CompanyRegisterForm } from "@/features/auth/components/CompanyRegisterForm";
import { useCompanies } from "@/features/companies/api";

export default function CompanyRegisterPage() {
  const router = useRouter();
  const { data: companies = [] } = useCompanies();

  useEffect(() => {
    // If companies already exist, redirect to dashboard
    if (companies && companies.length > 0) {
      router.push("/");
    }
  }, [companies, router]);

  return <CompanyRegisterForm />;
}