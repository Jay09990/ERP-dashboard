/**
 * Login returns permission objects `{ permission_name, is_allowed, ... }`.
 * Session storage and nav checks expect a flat list of allowed permission name strings.
 */
export function normalizePermissionNames(permissions: unknown): string[] {
  if (!Array.isArray(permissions)) return [];

  const names: string[] = [];
  for (const entry of permissions) {
    if (typeof entry === "string" && entry.trim()) {
      names.push(entry);
      continue;
    }
    if (!entry || typeof entry !== "object") continue;

    const record = entry as {
      permission_name?: string;
      permissionName?: string;
      is_allowed?: boolean | number | string;
    };
    const name = record.permission_name ?? record.permissionName;
    if (!name) continue;

    const allowed =
      record.is_allowed === undefined ||
      record.is_allowed === true ||
      record.is_allowed === 1 ||
      record.is_allowed === "1" ||
      record.is_allowed === "true";

    if (allowed) names.push(name);
  }

  return names;
}

export function sessionHasPermission(
  permissions: unknown,
  permKey?: string,
): boolean {
  if (!permKey) return true;
  const names = Array.isArray(permissions)
    ? permissions.every((p) => typeof p === "string")
      ? (permissions as string[])
      : normalizePermissionNames(permissions)
    : [];

  return (
    names.includes(permKey) ||
    names.includes("*") ||
    names.includes("all")
  );
}
