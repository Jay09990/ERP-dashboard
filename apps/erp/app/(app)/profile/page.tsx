import { ProfileForm } from "@/features/profile/components/ProfileForm";

export default function ProfilePage() {
  return (
    <>
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Settings</span>
          <h1>Company Profile</h1>
        </div>
      </div>
      <ProfileForm />
    </>
  );
}
