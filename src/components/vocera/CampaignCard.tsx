import { Link } from "@tanstack/react-router";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  LayoutGrid,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/vocera/Button";

export interface Campaign {
  id: string;
  name: string;
  date: string;
  time: string;
  total: number;
  confirmed: number;
  percent: number;
  status?: string;
}

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const { id, name, date, time, total, confirmed, percent, status = "กำลังดำเนินงาน" } = campaign;
  const pct = Math.min(100, Math.max(0, percent));

  return (
    <div className="group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-card transition-shadow hover:shadow-modal">
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

      <div className="mt-6 flex items-center gap-3">
        <Link to="/campaign/$id" params={{ id }} className="flex-1">
          <Button variant="primary" className="w-full justify-center">
            ดูแคมเปญ
          </Button>
        </Link>
        <Link to="/campaign/$id/contacts" params={{ id }} className="flex-1">
          <Button variant="secondary" className="w-full justify-center">
            รายชื่อแขก
          </Button>
        </Link>
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
  );
}

export default CampaignCard;
