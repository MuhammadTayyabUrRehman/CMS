import AdminLayout from "@/components/AdminLayout";

export const metadata = {
  title: "Admin Console - Complaint Portal",
  description: "Administration console for the IT Department Complaint Portal",
};

export default function Layout({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}
