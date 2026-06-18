import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, MessageSquare } from "lucide-react";

import { AppLayout } from "@/components/vocera/AppLayout";
import { StatusBadge, type StatusVariant } from "@/components/vocera/StatusBadge";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/campaign/$id/contacts/$contactId")({
  head: () => ({ meta: [{ title: "รายละเอียดการโทร — Ringo" }] }),
  component: CallDetailPage,
});

interface ChatMessage {
  role: "ai" | "user";
  text: string;
  time: string;
}

function CallDetailPage() {
  const { id, contactId } = Route.useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [campaignName, setCampaignName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("—");
  const [callStatus, setCallStatus] = useState<StatusVariant>("pending");
  const [callStartedAt, setCallStartedAt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    async function load() {
      const [{ data: camp }, { data: contact }, { data: log }] = await Promise.all([
        supabase.from("campaigns").select("name").eq("id", id).single(),
        supabase.from("contacts").select("full_name, phone").eq("id", contactId).single(),
        supabase
          .from("call_logs")
          .select("id, status, started_at")
          .eq("contact_id", contactId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (camp) setCampaignName(camp.name);
      if (contact) {
        setContactName(contact.full_name);
        setContactPhone(contact.phone);
      }
      if (log) {
        setCallStatus(log.status as StatusVariant);
        setCallStartedAt(log.started_at ?? "");

        const { data: msgs } = await supabase
          .from("conversation_messages")
          .select("role, message, created_at")
          .eq("call_log_id", log.id)
          .order("created_at");

        if (msgs) {
          setMessages(
            msgs.map((m) => ({
              role: m.role as "ai" | "user",
              text: m.message,
              time: new Date(m.created_at).toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              }),
            })),
          );
        }
      }

      setLoading(false);
    }
    load();
  }, [id, contactId]);

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
  };

  const formatTime = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-gray-400">กำลังโหลด...</p>
        </div>
      </AppLayout>
    );
  }

  const displayName = contactName || `Contact ${contactId}`;

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate({ to: "/campaign/$id/contacts", params: { id } })}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-brand-50 hover:text-brand-700"
          >
            <ChevronLeft className="h-4 w-4" />
            กลับ
          </button>
          <h1 className="text-2xl font-bold text-brand-700">รายละเอียดการโทร</h1>
        </div>

        {/* Contact info card */}
        <div className="mb-6 flex items-center gap-4 rounded-2xl bg-white p-5 shadow-card">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
              {displayName.charAt(0)}
            </span>
            <div className="min-w-0">
              <div className="font-semibold text-gray-800 truncate">{displayName}</div>
              <div className="text-sm text-gray-400 truncate">{campaignName}</div>
            </div>
          </div>
          <div className="flex items-center gap-5 shrink-0">
            <span className="text-sm text-gray-600">{contactPhone}</span>
            <span className="text-sm text-gray-600">{formatDate(callStartedAt)}</span>
            <span className="text-sm text-gray-600">{formatTime(callStartedAt)} น.</span>
            <StatusBadge variant={callStatus} />
          </div>
        </div>

        {/* Conversation card */}
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <h2 className="mb-4 font-semibold text-gray-700">ประวัติบทสนทนา</h2>

          {messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">ยังไม่มีบทสนทนา</p>
          ) : (
            <>
              <div className="flex justify-center mb-5">
                <span className="rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-400">
                  {formatDate(callStartedAt)}
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {messages.map((msg, i) =>
                  msg.role === "ai" ? (
                    <BotMessage key={i} text={msg.text} time={msg.time} />
                  ) : (
                    <UserMessage key={i} text={msg.text} time={msg.time} initial={displayName.charAt(0)} />
                  ),
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function BotMessage({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-start gap-2">
        <MessageSquare className="mt-1 h-4 w-4 shrink-0 text-brand-300" />
        <div className="max-w-lg rounded-2xl rounded-tl-none bg-gray-100 p-4 text-sm text-gray-700">
          {text}
        </div>
      </div>
      <span className={cn("ml-6 text-xs text-gray-400")}>{time}</span>
    </div>
  );
}

function UserMessage({ text, time, initial }: { text: string; time: string; initial: string }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-start gap-2">
        <div className="max-w-xs rounded-2xl rounded-tr-none bg-brand-100 p-4 text-sm text-brand-900">
          {text}
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-200 text-sm font-semibold text-brand-700">
          {initial}
        </span>
      </div>
      <span className={cn("mr-10 text-xs text-gray-400")}>{time}</span>
    </div>
  );
}
