import DashboardLayout from "@/components/DashboardLayout";
import KnowledgeBasePage from "@/app/dashboard/knowledge-base/page";

export const metadata = {
  title: "Knowledge Base - Complaint Portal",
  description: "Helpful articles and user guides for IT support",
};

export default function KnowledgeBaseRoute() {
  return (
    <DashboardLayout>
      <KnowledgeBasePage />
    </DashboardLayout>
  );
}
