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

// WeakMap cache mapping permissions array references to normalized Set<string> of allowed permission names.
// Avoids repeated O(N) array traversals and array allocations on every permission check in UI/navigation.
const permissionSetCache = new WeakMap<object, Set<string>>();

/**
 * Returns a normalized Set<string> of allowed permission names for O(1) membership lookups.
 * Caches results in a WeakMap keyed by the permissions array reference.
 */
export function getPermissionSet(permissions: unknown): Set<string> {
  if (permissions instanceof Set) {
    return permissions as Set<string>;
  }

  if (!Array.isArray(permissions)) {
    return new Set();
  }

  const cached = permissionSetCache.get(permissions);
  if (cached) {
    return cached;
  }

  const set = new Set<string>();
  for (const entry of permissions) {
    if (typeof entry === "string" && entry.trim()) {
      set.add(entry);
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

    if (allowed) set.add(name);
  }

  permissionSetCache.set(permissions, set);
  return set;
}

export function sessionHasPermission(
  permissions: unknown,
  permKey?: string,
): boolean {
  if (!permKey) return true;
  const set = getPermissionSet(permissions);
  return set.has(permKey) || set.has("*") || set.has("all");
}
