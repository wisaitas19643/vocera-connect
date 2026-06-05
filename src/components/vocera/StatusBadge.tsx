import { cn } from "@/lib/utils";

export type StatusVariant = "confirmed" | "rejected" | "missed" | "pending";

const config: Record<StatusVariant, { label: string; dot: string; wrap: string }> = {
  confirmed: {
    label: "ยืนยัน",
    dot: "bg-green-500",
    wrap: "bg-green-50 text-green-700 border border-green-200",
  },
  rejected: {
    label: "ปฏิเสธ",
    dot: "bg-red-500",
    wrap: "bg-red-50 text-red-700 border border-red-200",
  },
  missed: {
    label: "ไม่รับสาย",
    dot: "bg-yellow-500",
    wrap: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  },
  pending: {
    label: "รอสาย",
    dot: "bg-blue-500",
    wrap: "bg-blue-50 text-blue-700 border border-blue-200",
  },
};

interface StatusBadgeProps {
  variant: StatusVariant;
  className?: string;
}

export function StatusBadge({ variant, className }: StatusBadgeProps) {
  const c = config[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        c.wrap,
        className,
      )}
    >
      <span className={cn("inline-block rounded-full", c.dot)} style={{ width: 6, height: 6 }} />
      {c.label}
    </span>
  );
}

export default StatusBadge;
