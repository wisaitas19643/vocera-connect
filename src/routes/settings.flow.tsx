import { createFileRoute } from "@tanstack/react-router";
import { Plus, GitBranch, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AppLayout } from "@/components/vocera/AppLayout";
import { Button } from "@/components/vocera/Button";
import { ScriptFlowBuilder, DEFAULT_FLOW } from "@/components/vocera/ScriptFlowBuilder";
import { SettingsTabs } from "@/routes/settings.index";
import { useFlowScripts, useCreateFlowScript } from "@/lib/flowStore";

export const Route = createFileRoute("/settings/flow")({
  head: () => ({ meta: [{ title: "Flow การโทร — Ringo" }] }),
  component: FlowsPage,
});

function FlowsPage() {
  const { data: scripts = [], isLoading } = useFlowScripts();
  const create = useCreateFlowScript();

  const handleCreate = () => {
    create.mutate(
      { name: "สคริปต์ใหม่", content: JSON.stringify(DEFAULT_FLOW) },
      {
        onSuccess: () => toast.success("เพิ่มสคริปต์ใหม่แล้ว"),
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-8 py-8">
        <h1 className="mb-6 text-2xl font-bold text-brand-700">ตั้งค่า</h1>

        <SettingsTabs />

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Flow การโทร</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              ออกแบบบทสนทนาของบอตในรูปแบบ Binary Tree พร้อมเลือกเสียง BOTNOI
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              รองรับตัวแปร: {"{ชื่อ}, {ชื่องาน}, {วันที่}, {เวลา}"}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={create.isPending}
            className="shrink-0 gap-2"
          >
            {create.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            เพิ่มสคริปต์ใหม่
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brand-700" />
          </div>
        ) : scripts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50">
              <GitBranch className="h-10 w-10 text-brand-300" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-700">ยังไม่มีสคริปต์</p>
              <p className="text-sm text-gray-400 mt-1">
                คลิก "เพิ่มสคริปต์ใหม่" เพื่อสร้าง Flow แรกของคุณ
              </p>
            </div>
            <Button variant="secondary" onClick={handleCreate} disabled={create.isPending}>
              {create.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              เพิ่มสคริปต์ใหม่
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {scripts.map((s) => (
              <ScriptFlowBuilder key={s.id} script={s} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
