import type { TripPlanRequest, TripPlanResponse } from "../types";
import apiClient from "./client";

export async function planTrip(
  request: TripPlanRequest,
): Promise<TripPlanResponse> {
  const response = await apiClient.post<TripPlanResponse>("/trips/plan/", request);
  return response.data;
}