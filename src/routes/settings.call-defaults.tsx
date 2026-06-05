import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/vocera/AppLayout";

export const Route = createFileRoute("/settings/call-defaults")({
  head: () => ({ meta: [{ title: "Call defaults — Vocera" }] }),
  component: CallDefaultsPage,
});

function CallDefaultsPage() {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-gray-900">Call defaults</h1>
      </div>
    </AppLayout>
  );
}
