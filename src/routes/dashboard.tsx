import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/vocera/AppLayout";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Vocera" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">The new era of outbound calling.</p>
      </div>
    </AppLayout>
  );
}
