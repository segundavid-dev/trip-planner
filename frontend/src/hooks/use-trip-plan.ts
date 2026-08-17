import { useMutation } from "@tanstack/react-query";
import { planTrip } from "../api";
import type { ApiError, TripPlanRequest, TripPlanResponse } from "../types";

export function useTripPlan() {
  return useMutation<TripPlanResponse, ApiError, TripPlanRequest>({
    mutationFn: planTrip,
  });
}