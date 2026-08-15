import DashboardLayout from "@/components/DashboardLayout";
import MyComplaintsPage from "@/app/dashboard/my-complaint/page";

export const metadata = {
  title: "My Complaints - Complaint Portal",
  description: "View and manage your filed complaints",
};

export default function ComplaintsPage() {
  return (
    <DashboardLayout>
      <MyComplaintsPage />
    </DashboardLayout>
  );
}
