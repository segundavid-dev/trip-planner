import type { TripStop } from "../types";
import { formatTime } from "../utils/time";
import { STOP_META } from "../utils/stop-meta";

interface StopsListProps {
  stops: TripStop[];
}

export function StopsList({ stops }: StopsListProps) {
  return (
    <ol className="relative">
      {stops.map((stop, index) => (
        <li key={stop.order} className="relative flex gap-3 pb-5 pl-5">
          {index < stops.length - 1 ? (
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-[5px] top-3 w-px bg-gray-200"
            />
          ) : null}
          <span
            aria-hidden="true"
            className="absolute left-0 top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white"
            style={{ backgroundColor: STOP_META[stop.type].color }}
          />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {STOP_META[stop.type].label}
              <span className="ml-2 text-xs font-normal text-gray-400">
                {stop.cumulative_miles.toFixed(0)} mi
              </span>
            </p>
            <p className="mt-0.5 text-xs text-gray-500">{stop.location}</p>
            <p className="mt-0.5 text-xs text-gray-400">
              Day {stop.day} · {formatTime(stop.arrival_min)} -{" "}
              {formatTime(stop.departure_min)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}