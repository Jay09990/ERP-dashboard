import { ProfileForm } from "@/features/profile/components/ProfileForm";

export default function ProfilePage() {
  return (
    <>
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Settings</span>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>Company Profile</h1>
          <p style={{ margin: "4px 0 0", color: "var(--altrex-muted)", fontSize: "14px" }}>
            Manage your organization's identity, contacts, banking, and branding.
          </p>
        </div>
      </div>
      <ProfileForm />
    </>
  );
}
