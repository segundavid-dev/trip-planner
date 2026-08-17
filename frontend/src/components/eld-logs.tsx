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
      <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white p-1">
          <div className="flex w-max gap-1">
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
        </div>
        <Button
          variant="secondary"
          onClick={() => window.print()}
          className="w-full sm:w-auto"
        >
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