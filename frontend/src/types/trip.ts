import type { TripDay, TripStop } from "./eld";

export interface TripPlanRequest {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_used: number;
}

export interface TripSummary {
  trip_miles: number;
  estimated_driving_hours: number;
  total_on_duty_hours: number;
  number_of_days: number;
  average_speed_mph: number;
  cycle_hours_used: number;
  cycle_hours_remaining: number;
  fuel_stops: number;
  rest_stops: number;
  cycle_exhausted: boolean;
}

export interface RouteData {
  polyline: [number, number][];
  distance_miles: number;
  duration_hours: number;
}

export interface TripPlanResponse {
  summary: TripSummary;
  stops: TripStop[];
  days: TripDay[];
  route: RouteData;
}