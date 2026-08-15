import DashboardLayout from "@/components/DashboardLayout";
import ProfilePage from "@/app/dashboard/profile/page";

export const metadata = {
  title: "My Profile - Complaint Portal",
  description: "User Profile and Password Management",
};

export default function ProfileRoute() {
  return (
    <DashboardLayout>
      <ProfilePage />
    </DashboardLayout>
  );
}
