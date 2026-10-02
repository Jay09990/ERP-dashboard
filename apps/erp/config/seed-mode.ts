/** Build-time switch for local ERP fixtures; never enable for a real tenant. */
export const seedModeEnabled = process.env.NEXT_PUBLIC_ERP_SEED_MODE === "true";
