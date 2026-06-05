import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  icon: ReactNode;
  value: number;
  label: string;
  subText?: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function KPICard({
  icon,
  value,
  label,
  subText,
  isActive = false,
  onClick,
  className,
}: KPICardProps) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-2 rounded-2xl bg-white p-5 text-left shadow-card transition-all",
        isActive
          ? "border-2 border-brand-700 bg-brand-50"
          : "border-2 border-transparent hover:border-brand-300",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="text-brand-700">{icon}</div>
        <div className="text-3xl font-semibold text-gray-900">{value.toLocaleString()}</div>
      </div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
      {subText && <div className="text-sm text-gray-400">{subText}</div>}
    </Comp>
  );
}

export default KPICard;
