import DashboardLayout from "@/components/DashboardLayout";

export const metadata = {
  title: "Dashboard - Complaint Portal",
  description: "Dashboard overview for the IT Department Complaint Portal",
};

export default function Layout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
