import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, MessageSquare } from "lucide-react";

import { AppLayout } from "@/components/vocera/AppLayout";
import { StatusBadge, type StatusVariant } from "@/components/vocera/StatusBadge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/campaign/$id/contacts/$contactId")({
  head: () => ({ meta: [{ title: "รายละเอียดการโทร — Ringo" }] }),
  component: CallDetailPage,
});

const campaignsById: Record<string, { name: string }> = {
  "1": { name: "ประชุมผู้ถือหุ้น ประจำปี 2026" },
  "2": { name: "อบรมพนักงานใหม่ รุ่นที่ 12" },
  "3": { name: "สัมมนาเทคโนโลยี AI" },
};

interface ContactData {
  id: string;
  name: string;
  phone: string;
  status: StatusVariant;
  date: string;
  time: string;
}

const contactsById: Record<string, ContactData> = {
  "1": { id: "1", name: "กฤษฎา มานะธรรม", phone: "081-234-5678", status: "confirmed", date: "12/04/26", time: "10:32" },
  "2": { id: "2", name: "พงศกร รัตนสิริ", phone: "089-111-2233", status: "rejected", date: "12/04/26", time: "10:35" },
  "3": { id: "3", name: "ชนากานต์ ใจดี", phone: "082-555-7788", status: "missed", date: "12/04/26", time: "10:40" },
  "4": { id: "4", name: "อรทัย ศรีสุข", phone: "086-222-3344", status: "pending", date: "12/04/26", time: "10:42" },
  "5": { id: "5", name: "ธนกร สุขเกษม", phone: "084-987-6543", status: "confirmed", date: "12/04/26", time: "10:45" },
  "6": { id: "6", name: "นภัสสร พงษ์ไพศาล", phone: "087-345-2211", status: "confirmed", date: "12/04/26", time: "10:48" },
  "7": { id: "7", name: "ปวีณา วงศ์วิทย์", phone: "081-998-1122", status: "missed", date: "12/04/26", time: "10:52" },
  "8": { id: "8", name: "สมชาย ใจกล้า", phone: "083-444-5566", status: "pending", date: "12/04/26", time: "10:55" },
  "9": { id: "9", name: "วิภาวี ตั้งใจ", phone: "088-321-9988", status: "confirmed", date: "12/04/26", time: "10:58" },
  "10": { id: "10", name: "เกียรติศักดิ์ พรชัย", phone: "085-654-3210", status: "rejected", date: "12/04/26", time: "11:02" },
};

type ChatRole = "bot" | "user";

interface ChatMessage {
  role: ChatRole;
  text: string;
  time: string;
}

const MOCK_CONVERSATION: ChatMessage[] = [
  {
    role: "bot",
    text: "สวัสดีค่ะ คุณ xxxx xxxxxx ดิฉันโทรมาจากงานประชุมผู้ถือหุ้น ประจำปี 2026 ต้องการสอบถามเพื่อยืนยันการเข้าร่วมงาน ในวันที่ xx xxx เวลา xx โมง xx นาทีค่ะ กรุณากด 1 เพื่อยืนยัน หรือกด 2 หากไม่สะดวก ขอบคุณค่ะ",
    time: "10:45:01",
  },
  {
    role: "user",
    text: "ยืนยันเข้าร่วมงานครับ",
    time: "10:45:22",
  },
  {
    role: "bot",
    text: "ขอบคุณมากค่ะ ได้รับการยืนยันเรียบร้อยแล้ว เราจะส่งรายละเอียดงานให้ทางข้อความอีกครั้ง ขอบคุณ และพบกันในงานนะคะ สวัสดีค่ะ",
    time: "10:46:03",
  },
  {
    role: "user",
    text: "ครับ ขอบคุณครับ",
    time: "10:46:22",
  },
];

function CallDetailPage() {
  const { id, contactId } = Route.useParams();
  const navigate = useNavigate();

  const campaign = campaignsById[id] ?? { name: `Campaign ${id}` };
  const contact = contactsById[contactId] ?? {
    id: contactId,
    name: `Contact ${contactId}`,
    phone: "—",
    status: "pending" as StatusVariant,
    date: "—",
    time: "—",
  };

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
          {/* Avatar + name */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
              {contact.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <div className="font-semibold text-gray-800 truncate">{contact.name}</div>
              <div className="text-sm text-gray-400 truncate">{campaign.name}</div>
            </div>
          </div>

          {/* Right meta */}
          <div className="flex items-center gap-5 shrink-0">
            <span className="text-sm text-gray-600">{contact.phone}</span>
            <span className="text-sm text-gray-600">{contact.date}</span>
            <span className="text-sm text-gray-600">{contact.time} น.</span>
            <StatusBadge variant={contact.status} />
          </div>
        </div>

        {/* Conversation card */}
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <h2 className="mb-4 font-semibold text-gray-700">ประวัติบทสนทนา</h2>

          {/* Date separator */}
          <div className="flex justify-center mb-5">
            <span className="rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-400">
              11-04-2024
            </span>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-4">
            {MOCK_CONVERSATION.map((msg, i) =>
              msg.role === "bot" ? (
                <BotMessage key={i} text={msg.text} time={msg.time} />
              ) : (
                <UserMessage key={i} text={msg.text} time={msg.time} initial={contact.name.charAt(0)} />
              ),
            )}
          </div>
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
