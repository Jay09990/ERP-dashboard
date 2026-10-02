"use client";

import { ProjectDetail } from "@/features/projects/components/ProjectDetail";
import { useParams } from "next/navigation";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  return <ProjectDetail id={params.id} />;
}
