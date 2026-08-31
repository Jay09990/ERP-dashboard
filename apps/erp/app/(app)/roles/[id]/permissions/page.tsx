import { RolePermissionsWrapper } from "./wrapper";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RolePermissionsPage({ params }: Props) {
  const resolvedParams = await params;
  return <RolePermissionsWrapper id={resolvedParams.id} />;
}
