import type { LogEvent, LogStatus, TripDay } from "../types";
import { formatDate, formatTime } from "../utils/time";

const GRID_LEFT = 140;
const GRID_RIGHT = 1340;
const GRID_TOP = 230;
const GRID_BOTTOM = 440;
const ROW_HEIGHT = (GRID_BOTTOM - GRID_TOP) / 4;
const GRID_WIDTH = GRID_RIGHT - GRID_LEFT;

const STATUS_ORDER: LogStatus[] = [
  "OFF_DUTY",
  "SLEEPER_BERTH",
  "DRIVING",
  "ON_DUTY",
];

const STATUS_LABELS: Record<LogStatus, string> = {
  OFF_DUTY: "Off Duty",
  SLEEPER_BERTH: "Sleeper Berth",
  DRIVING: "Driving",
  ON_DUTY: "On Duty (Not Driving)",
};

const MINUTES_PER_DAY = 1440;
const LINE_COLOR = "#1f2937";

interface EldLogProps {
  day: TripDay;
  dayCount: number;
  origin: string;
  destination: string;
}

function xPosition(minutes: number): number {
  return GRID_LEFT + (minutes / MINUTES_PER_DAY) * GRID_WIDTH;
}

function yLevel(status: LogStatus): number {
  return GRID_TOP + STATUS_ORDER.indexOf(status) * ROW_HEIGHT;
}

function buildPath(events: LogEvent[]): string {
  const segments: string[] = [];
  let cursor = 0;
  let status: LogStatus = "OFF_DUTY";

  if (events.length > 0 && events[0].start_min === 0) {
    status = events[0].status;
  }

  segments.push(`M ${xPosition(0)} ${yLevel(status)}`);

  for (const event of events) {
    if (event.start_min > cursor) {
      segments.push(`L ${xPosition(event.start_min)} ${yLevel(status)}`);
    }
    if (event.status !== status) {
      segments.push(`L ${xPosition(event.start_min)} ${yLevel(event.status)}`);
      status = event.status;
    }
    segments.push(`L ${xPosition(event.end_min)} ${yLevel(status)}`);
    cursor = event.end_min;
  }

  if (cursor < MINUTES_PER_DAY) {
    segments.push(`L ${xPosition(MINUTES_PER_DAY)} ${yLevel(status)}`);
  }

  return segments.join(" ");
}

function remarkableEvents(events: LogEvent[]): LogEvent[] {
  return events.filter(
    (event) => event.status === "ON_DUTY" || event.status === "OFF_DUTY",
  );
}

export function EldLog({ day, dayCount, origin, destination }: EldLogProps) {
  const path = buildPath(day.events);
  const remarks = remarkableEvents(day.events);
  const hourTicks = Array.from({ length: 25 }, (_, hour) => hour);

  return (
    <svg
      viewBox="0 0 1400 560"
      className="w-full rounded-lg border border-gray-200 bg-white shadow-sm"
      role="img"
      aria-label={`Daily log sheet for day ${day.day}`}
    >
      <text
        x={GRID_LEFT}
        y={55}
        className="fill-gray-900"
        style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1 }}
      >
        DRIVER LOG SHEET
      </text>
      <text
        x={GRID_RIGHT}
        y={55}
        textAnchor="end"
        className="fill-gray-500"
        style={{ fontSize: 14 }}
      >
        Day {day.day} of {dayCount}
      </text>

      <text x={GRID_LEFT} y={92} className="fill-gray-600" style={{ fontSize: 14 }}>
        Driver: ____________________
      </text>
      <text x={620} y={92} className="fill-gray-600" style={{ fontSize: 14 }}>
        Carrier: __________________
      </text>
      <text x={1100} y={92} className="fill-gray-600" style={{ fontSize: 14 }}>
        Truck No: ________
      </text>

      <text x={GRID_LEFT} y={128} className="fill-gray-600" style={{ fontSize: 14 }}>
        Date: {formatDate(day.date)}
      </text>
      <text x={340} y={128} className="fill-gray-600" style={{ fontSize: 14 }}>
        Driving: {day.totals.driving_hours.toFixed(1)} h
      </text>
      <text x={540} y={128} className="fill-gray-600" style={{ fontSize: 14 }}>
        On Duty: {day.totals.on_duty_hours.toFixed(1)} h
      </text>
      <text x={760} y={128} className="fill-gray-600" style={{ fontSize: 14 }}>
        Distance: {day.totals.distance_miles.toFixed(0)} mi
      </text>

      <text x={GRID_LEFT} y={162} className="fill-gray-600" style={{ fontSize: 13 }}>
        Trip: {origin} {origin ? "→" : ""} {destination}
      </text>

      {STATUS_ORDER.map((status, index) => (
        <rect
          key={status}
          x={GRID_LEFT}
          y={GRID_TOP + index * ROW_HEIGHT}
          width={GRID_WIDTH}
          height={ROW_HEIGHT}
          fill={index % 2 === 0 ? "#ffffff" : "#f9fafb"}
        />
      ))}

      {STATUS_ORDER.map((status, index) => (
        <text
          key={status}
          x={GRID_LEFT - 10}
          y={GRID_TOP + index * ROW_HEIGHT + 4}
          textAnchor="end"
          className="fill-gray-500"
          style={{ fontSize: 12 }}
        >
          {STATUS_LABELS[status]}
        </text>
      ))}

      {hourTicks.map((hour) => {
        const x = xPosition(hour * 60);
        const isMajor = hour % 2 === 0;
        return (
          <g key={hour}>
            <line
              x1={x}
              y1={GRID_TOP}
              x2={x}
              y2={GRID_BOTTOM}
              stroke={isMajor ? "#e5e7eb" : "#f3f4f6"}
              strokeWidth={1}
            />
            <text
              x={x}
              y={GRID_TOP - 10}
              textAnchor="middle"
              className="fill-gray-400"
              style={{ fontSize: 11 }}
            >
              {hour}
            </text>
          </g>
        );
      })}

      {STATUS_ORDER.map((status) => (
        <line
          key={status}
          x1={GRID_LEFT}
          y1={yLevel(status)}
          x2={GRID_RIGHT}
          y2={yLevel(status)}
          stroke="#d1d5db"
          strokeWidth={1}
        />
      ))}

      <rect
        x={GRID_LEFT}
        y={GRID_TOP}
        width={GRID_WIDTH}
        height={GRID_BOTTOM - GRID_TOP}
        fill="none"
        stroke="#9ca3af"
        strokeWidth={1.5}
      />

      <path d={path} fill="none" stroke={LINE_COLOR} strokeWidth={2.5} />

      {remarks.map((event, index) => {
        const number = index + 1;
        const cx = xPosition(event.start_min);
        const cy = yLevel(event.status);
        return (
          <g key={`${number}-${event.start_min}`}>
            <line
              x1={cx}
              y1={GRID_TOP}
              x2={cx}
              y2={GRID_BOTTOM}
              stroke="#94a3b8"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <circle
              cx={cx}
              cy={cy}
              r={9}
              fill="#1d4ed8"
              stroke="#ffffff"
              strokeWidth={1.5}
            />
            <text
              x={cx}
              y={cy + 3.5}
              textAnchor="middle"
              fill="#ffffff"
              style={{ fontSize: 11, fontWeight: 600 }}
            >
              {number}
            </text>
          </g>
        );
      })}

      <text
        x={GRID_LEFT}
        y={478}
        className="fill-gray-700"
        style={{ fontSize: 13, fontWeight: 600 }}
      >
        Remarks
      </text>
      {remarks.map((event, index) => {
        const column = index < 8 ? 0 : 1;
        const row = index % 8;
        const x = column === 0 ? GRID_LEFT : 770;
        const y = 500 + row * 20;
        return (
          <text
            key={`${index}-${event.start_min}`}
            x={x}
            y={y}
            className="fill-gray-600"
            style={{ fontSize: 12 }}
          >
            {index + 1}. {formatTime(event.start_min)} - {event.remark}
          </text>
        );
      })}
    </svg>
  );
}