import { CompanyProfileView } from "@/features/profile/components/CompanyProfileView";

export default function ProfilePage() {
  return (
    <>
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Settings</span>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>Company Profile</h1>
          <p style={{ margin: "4px 0 0", color: "var(--altrex-muted)", fontSize: "14px" }}>
            View and manage your organization's legal identity, contact locations, banking, and branding.
          </p>
        </div>
      </div>
      <CompanyProfileView />
    </>
  );
}
