export type LogStatus = "OFF_DUTY" | "SLEEPER_BERTH" | "DRIVING" | "ON_DUTY";

export type StopType =
  | "current"
  | "pickup"
  | "dropoff"
  | "fuel"
  | "rest"
  | "overnight";

export interface LogEvent {
  start_min: number;
  end_min: number;
  status: LogStatus;
  remark: string;
  location: string;
}

export interface TripDayTotals {
  driving_hours: number;
  on_duty_hours: number;
  distance_miles: number;
}

export interface TripDay {
  day: number;
  date: string;
  totals: TripDayTotals;
  events: LogEvent[];
}

export interface TripStop {
  order: number;
  type: StopType;
  label: string;
  location: string;
  latitude: number;
  longitude: number;
  day: number;
  arrival_min: number;
  departure_min: number;
  cumulative_miles: number;
}