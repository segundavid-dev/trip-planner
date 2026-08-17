import type { LogStatus } from "../types";
import { cn } from "../utils/cn";

const LABELS: Record<LogStatus, string> = {
  OFF_DUTY: "Off Duty",
  SLEEPER_BERTH: "Sleeper",
  DRIVING: "Driving",
  ON_DUTY: "On Duty",
};

const COLORS: Record<LogStatus, string> = {
  OFF_DUTY: "border-gray-200 bg-gray-100 text-gray-600",
  SLEEPER_BERTH: "border-purple-200 bg-purple-50 text-purple-700",
  DRIVING: "border-blue-200 bg-blue-50 text-blue-700",
  ON_DUTY: "border-amber-200 bg-amber-50 text-amber-700",
};

interface StatusBadgeProps {
  status: LogStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        COLORS[status],
      )}
    >
      {LABELS[status]}
    </span>
  );
}