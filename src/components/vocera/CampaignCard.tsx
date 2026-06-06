// useState ใช้เก็บ state ว่า Runner เปิดอยู่ไหม (true/false)
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  LayoutGrid,
  Pencil,
  Play,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/vocera/Button";
// import Runner component และ type ของ Contact เข้ามาใช้ใน Card นี้
import { CampaignRunner } from "@/components/CampaignRunner";
import type { RunnerContact } from "@/hooks/useCampaignRunner";

// เพิ่ม contacts? (optional) ใน interface
// เครื่องหมาย ? หมายความว่า "มีหรือไม่มีก็ได้" — backward compatible
export interface Campaign {
  id: string;
  name: string;
  date: string;
  time: string;
  total: number;
  confirmed: number;
  percent: number;
  status?: string;
  contacts?: RunnerContact[]; // รายชื่อแขกที่จะส่งให้ Runner
}

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const { id, name, date, time, total, confirmed, percent, status = "กำลังดำเนินงาน", contacts } = campaign;
  const pct = Math.min(100, Math.max(0, percent));

  // showRunner คือ state ที่บอกว่าตอนนี้ Runner โชว์อยู่ไหม
  // useState(false) = เริ่มต้นปิดอยู่
  const [showRunner, setShowRunner] = useState(false);

  return (
    <div className="group relative rounded-2xl border border-gray-100 bg-white shadow-card transition-shadow hover:shadow-modal">
      {/* ส่วนบนของ Card — padding ปกติ */}
      <div className="p-6">
        <span className="absolute right-6 top-6 rounded-full border border-brand-300 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          {status}
        </span>

        <div className="flex items-start gap-4 pr-32">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-gray-800">{name}</h3>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                {date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-gray-400" />
                {time}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 text-gray-400" />
                {total.toLocaleString()} contacts
              </span>
              <span className="inline-flex items-center gap-1.5 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                {confirmed.toLocaleString()} confirmed
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar ของแคมเปญ */}
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Progress</span>
            <span className="text-right text-sm font-semibold text-brand-700">
              {pct.toFixed(pct % 1 === 0 ? 0 : 2)}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-brand-100">
            <div
              className="h-full rounded-full bg-brand-700 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* ปุ่ม Actions */}
        <div className="mt-6 flex items-center gap-3">
          {/* ปุ่มรัน — กดแล้ว toggle (เปิด/ปิด) Runner ด้านล่าง */}
          {contacts && contacts.length > 0 && (
            <Button
              variant="primary"
              className="flex-1 justify-center gap-2"
              onClick={() => setShowRunner((prev) => !prev)}
            >
              {/* เปลี่ยน icon และ label ตาม state ของ showRunner */}
              {showRunner ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  ปิด Runner
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  รันแคมเปญ
                </>
              )}
            </Button>
          )}

          {/* ลิงก์ไปหน้ารายชื่อแขก */}
          <Link to="/campaign/$id/contacts" params={{ id }} className="flex-1">
            <Button variant="secondary" className="w-full justify-center">
              รายชื่อแขก
            </Button>
          </Link>

          {/* ปุ่มแก้ไขแคมเปญ */}
          <Link to="/campaign/$id/edit" params={{ id }}>
            <Button
              variant="ghost"
              className="!p-2.5"
              aria-label="แก้ไขแคมเปญ"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Runner Section — แสดงเมื่อ showRunner เป็น true */}
      {/* && คือ "ถ้า condition เป็น true ให้แสดง element ด้านขวา" */}
      {showRunner && contacts && (
        <div className="border-t border-brand-100 px-6 pb-6 pt-4">
          {/* ป้ายบอกว่า section นี้คือ Runner */}
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-300">
            Campaign Runner
          </p>
          {/* ส่ง campaignId และ contacts เข้า Runner */}
          <CampaignRunner campaignId={id} contacts={contacts} />
        </div>
      )}
    </div>
  );
}

export default CampaignCard;
