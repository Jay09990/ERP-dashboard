export const permissions = {
  dashboardRead: "dashboard:read",
  customersRead: "customers:read",
  leadsRead: "leads:read",
  leadsCreate: "leads:create",
  leadsUpdate: "leads:update",
  leadsDelete: "leads:delete",
  leadsStatusUpdate: "leads:status:update",
  leadsConvert: "leads:convert",
  leadActivitiesRead: "leads:activities:read",
  leadActivitiesCreate: "leads:activities:create",
  leadSourcesRead: "lead-sources:read",
  leadSourcesCreate: "lead-sources:create",
  industriesRead: "industries:read",
  industriesCreate: "industries:create",
  followUpsRead: "follow-ups:read",
} as const;

/** Frontend permission entries missing from older backend permission catalogs. */
export const additionalPermissionCatalog = [
  { permission_name: permissions.leadsRead, module_name: "CRM" },
  { permission_name: permissions.leadsCreate, module_name: "CRM" },
  { permission_name: permissions.leadsUpdate, module_name: "CRM" },
  { permission_name: permissions.leadsDelete, module_name: "CRM" },
  { permission_name: permissions.leadsStatusUpdate, module_name: "CRM" },
  { permission_name: permissions.leadsConvert, module_name: "CRM" },
  { permission_name: permissions.leadActivitiesRead, module_name: "CRM" },
  { permission_name: permissions.leadActivitiesCreate, module_name: "CRM" },
  { permission_name: permissions.leadSourcesRead, module_name: "CRM" },
  { permission_name: permissions.leadSourcesCreate, module_name: "CRM" },
  { permission_name: permissions.industriesRead, module_name: "CRM" },
  { permission_name: permissions.industriesCreate, module_name: "CRM" },
  { permission_name: permissions.followUpsRead, module_name: "CRM" },
] as const;
