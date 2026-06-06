import { Phone } from "lucide-react";
import { Button } from "@/components/vocera/Button";
import { StatusBadge } from "@/components/vocera/StatusBadge";
import { useCampaignRunner, type RunnerContact, type RunnerStatus } from "@/hooks/useCampaignRunner";
import { cn } from "@/lib/utils";

interface CampaignRunnerProps {
  campaignId: string;
  contacts: RunnerContact[];
}

const statusConfig: Record<
  RunnerStatus,
  { dot: string; label: string }
> = {
  idle:      { dot: "bg-gray-400",            label: "พร้อมเริ่ม" },
  running:   { dot: "bg-green-500 animate-pulse", label: "กำลังโทร..." },
  paused:    { dot: "bg-yellow-500",          label: "หยุดชั่วคราว" },
  completed: { dot: "bg-purple-500",          label: "เสร็จสิ้น ✓" },
};

export function CampaignRunner({ campaignId, contacts }: CampaignRunnerProps) {
  const {
    status,
    currentContact,
    results,
    progress,
    startCampaign,
    pauseCampaign,
    resumeCampaign,
    stopCampaign,
    callSingle,
  } = useCampaignRunner(campaignId, contacts);

  const { dot, label } = statusConfig[status];

  const calledIds = new Set(results.map((r) => r.contactId));
  const calledCount = results.length;
  const displayX = calledCount + (status === "running" ? 1 : 0);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      {/* Top: Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className={cn("inline-block h-2.5 w-2.5 rounded-full", dot)} />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>

        <div className="flex items-center gap-2">
          {status === "idle" && (
            <Button variant="primary" size="sm" onClick={startCampaign}>
              ▶ รันแคมเปญ
            </Button>
          )}
          {status === "running" && (
            <>
              <Button variant="secondary" size="sm" onClick={pauseCampaign}>
                ⏸ หยุดชั่วคราว
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={stopCampaign}
              >
                ■ หยุด
              </Button>
            </>
          )}
          {status === "paused" && (
            <>
              <Button variant="primary" size="sm" onClick={resumeCampaign}>
                ▶ ทำต่อ
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={stopCampaign}
              >
                ■ หยุด
              </Button>
            </>
          )}
          {status === "completed" && (
            <Button variant="secondary" size="sm" onClick={startCampaign}>
              ↺ รันใหม่อีกครั้ง
            </Button>
          )}
        </div>
      </div>

      {/* Middle: Progress (hidden when idle) */}
      {status !== "idle" && (
        <div className="mt-5">
          <p className="mb-2 text-sm text-gray-600">
            กำลังโทร{" "}
            <span className="font-semibold text-brand-700">{displayX}</span>{" "}
            /{" "}
            <span className="font-semibold text-gray-800">{contacts.length}</span>{" "}
            คน
          </p>
          <div className="h-3 w-full overflow-hidden rounded-full bg-brand-100">
            <div
              className="h-full rounded-full bg-brand-700 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Current caller card */}
          {status === "running" && currentContact && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-brand-100 bg-brand-50 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-700 text-sm font-semibold text-white">
                  {currentContact.name.charAt(0)}
                </span>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">{currentContact.name}</span>
                  <span className="text-sm text-gray-500">{currentContact.phone}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 animate-bounce text-brand-700" />
                <span className="text-sm font-medium text-brand-700">กำลังโทร...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom: Results table */}
      <div className="mt-6">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-700">ผลการโทร</h3>
          {calledCount > 0 && (
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
              {calledCount}
            </span>
          )}
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-medium text-gray-400">
                <th className="py-2.5 pr-4 font-medium">ชื่อ-นามสกุล</th>
                <th className="py-2.5 pr-4 font-medium">เบอร์โทรศัพท์</th>
                <th className="py-2.5 pr-4 font-medium">สถานะ</th>
                <th className="py-2.5 pr-4 font-medium">เวลา</th>
                <th className="py-2.5 font-medium" />
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => {
                const result = results.find((r) => r.contactId === contact.id);
                const called = calledIds.has(contact.id);
                return (
                  <tr
                    key={contact.id}
                    className={cn(
                      "border-b border-gray-50 transition-colors",
                      called ? "animate-fadeIn hover:bg-brand-50" : "opacity-40",
                    )}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                          {contact.name.charAt(0)}
                        </span>
                        <span className="text-gray-800">{contact.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{contact.phone}</td>
                    <td className="py-3 pr-4">
                      {result ? (
                        <StatusBadge variant={result.status} />
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400" />
                          รอสาย
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-gray-500">
                      {result ? formatTime(result.timestamp) : "—"}
                    </td>
                    <td className="py-3">
                      {!called && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={status === "running"}
                          onClick={() => callSingle(contact)}
                        >
                          <Phone className="h-3.5 w-3.5" />
                          โทร
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                    ไม่มีรายชื่อ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CampaignRunner;
