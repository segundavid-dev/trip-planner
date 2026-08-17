import { useState } from "react";
import type { TripDay } from "../types";
import { Button } from "../ui";
import { EldLog } from "./eld-log";

interface EldLogsProps {
  days: TripDay[];
  origin: string;
  destination: string;
}

export function EldLogs({ days, origin, destination }: EldLogsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDay = days[Math.min(activeIndex, days.length - 1)];

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {days.map((day, index) => (
            <button
              key={day.day}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                index === activeIndex
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Day {day.day}
            </button>
          ))}
        </div>
        <Button variant="secondary" onClick={() => window.print()}>
          Print
        </Button>
      </div>

      {activeDay ? (
        <EldLog
          day={activeDay}
          dayCount={days.length}
          origin={origin}
          destination={destination}
        />
      ) : null}
    </div>
  );
}