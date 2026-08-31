import { UserPermissionsWrapper } from "./wrapper";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserPermissionsPage({ params }: Props) {
  const resolvedParams = await params;
  return <UserPermissionsWrapper id={resolvedParams.id} />;
}
