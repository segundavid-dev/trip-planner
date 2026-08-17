import type { TripSummary as TripSummaryData } from "../types";
import { Card } from "../ui";

interface TripSummaryProps {
  summary: TripSummaryData;
}

interface Metric {
  label: string;
  value: string;
}

function buildMetrics(summary: TripSummaryData): Metric[] {
  return [
    { label: "Trip Miles", value: summary.trip_miles.toFixed(0) },
    {
      label: "Driving Time",
      value: `${summary.estimated_driving_hours.toFixed(1)} h`,
    },
    {
      label: "On-Duty Time",
      value: `${summary.total_on_duty_hours.toFixed(1)} h`,
    },
    { label: "Days", value: String(summary.number_of_days) },
    { label: "Fuel Stops", value: String(summary.fuel_stops) },
    { label: "Rest Stops", value: String(summary.rest_stops) },
  ];
}

export function TripSummary({ summary }: TripSummaryProps) {
  const metrics = buildMetrics(summary);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {metrics.map((metric) => (
        <Card key={metric.label} className="p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
            {metric.label}
          </p>
          <p className="mt-1 text-xl font-semibold text-gray-900">
            {metric.value}
          </p>
        </Card>
      ))}
    </div>
  );
}