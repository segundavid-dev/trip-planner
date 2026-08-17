import type { TripDay, TripStop } from "../types";
import { STOP_META } from "../utils/stop-meta";
import { formatDate, formatTime } from "../utils/time";

interface StopsListProps {
  stops: TripStop[];
  days: TripDay[];
}

export function StopsList({ stops, days }: StopsListProps) {
  const dayMap = new Map(days.map((day) => [day.day, day]));
  const grouped = new Map<number, TripStop[]>();

  for (const stop of stops) {
    const list = grouped.get(stop.day) ?? [];
    list.push(stop);
    grouped.set(stop.day, list);
  }

  return (
    <div className="space-y-6">
      {[...grouped.entries()].map(([dayNumber, dayStops]) => {
        const day = dayMap.get(dayNumber);
        return (
          <div key={dayNumber}>
            <div className="mb-3 flex flex-col items-start gap-1 border-b border-gray-100 pb-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Day {dayNumber}
              </h3>
              <p className="text-xs text-gray-400">
                {day ? formatDate(day.date) : ""}
                {day ? ` · ${day.totals.distance_miles.toFixed(0)} mi` : ""}
              </p>
            </div>
            <ol>
              {dayStops.map((stop, index) => {
                const meta = STOP_META[stop.type];
                const StopIcon = meta.icon;
                return (
                  <li key={stop.order} className="relative flex gap-3 pb-4 pl-7">
                    {index < dayStops.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 left-[11px] top-6 w-px bg-gray-200"
                      />
                    ) : null}
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full text-white ring-2 ring-white"
                      style={{ backgroundColor: meta.color }}
                    >
                      <StopIcon size={12} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {meta.label}
                        <span className="ml-2 text-xs font-normal text-gray-400">
                          {stop.cumulative_miles.toFixed(0)} mi
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {stop.location}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {formatTime(stop.arrival_min)} -{" "}
                        {formatTime(stop.departure_min)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })}
    </div>
  );
}