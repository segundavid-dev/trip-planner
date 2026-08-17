import type { ComponentType } from "react";
import {
  Calendar01Icon,
  Clock01Icon,
  Coffee01Icon,
  FuelIcon,
  RoadIcon,
  Timer01Icon,
} from "../utils/hugeicons";
import type { TripSummary as TripSummaryData } from "../types";
import { Card } from "../ui";

interface TripSummaryProps {
  summary: TripSummaryData;
}

interface MetricConfig {
  label: string;
  icon: ComponentType<{ size?: number | string; className?: string }>;
  accent: string;
  value: (summary: TripSummaryData) => string;
}

const METRICS: MetricConfig[] = [
  {
    label: "Trip Miles",
    icon: RoadIcon,
    accent: "bg-blue-50 text-blue-600",
    value: (summary) => summary.trip_miles.toFixed(0),
  },
  {
    label: "Driving Time",
    icon: Clock01Icon,
    accent: "bg-emerald-50 text-emerald-600",
    value: (summary) => `${summary.estimated_driving_hours.toFixed(1)} h`,
  },
  {
    label: "On-Duty Time",
    icon: Timer01Icon,
    accent: "bg-amber-50 text-amber-600",
    value: (summary) => `${summary.total_on_duty_hours.toFixed(1)} h`,
  },
  {
    label: "Days",
    icon: Calendar01Icon,
    accent: "bg-purple-50 text-purple-600",
    value: (summary) => String(summary.number_of_days),
  },
  {
    label: "Fuel Stops",
    icon: FuelIcon,
    accent: "bg-orange-50 text-orange-600",
    value: (summary) => String(summary.fuel_stops),
  },
  {
    label: "Rest Stops",
    icon: Coffee01Icon,
    accent: "bg-teal-50 text-teal-600",
    value: (summary) => String(summary.rest_stops),
  },
];

export function TripSummary({ summary }: TripSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {METRICS.map((metric) => {
        const MetricIcon = metric.icon;
        return (
          <Card key={metric.label} className="p-4">
            <span
              className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${metric.accent}`}
            >
              <MetricIcon size={16} />
            </span>
            <p className="mt-3 text-[10px] font-medium uppercase tracking-wider text-gray-400">
              {metric.label}
            </p>
            <p className="mt-0.5 text-xl font-semibold text-gray-900">
              {metric.value(summary)}
            </p>
          </Card>
        );
      })}
    </div>
  );
}