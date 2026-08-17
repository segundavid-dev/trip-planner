import type { StopType } from "../types";

interface StopMeta {
  label: string;
  color: string;
}

export const STOP_META: Record<StopType, StopMeta> = {
  current: { label: "Trip Start", color: "#6b7280" },
  pickup: { label: "Pickup", color: "#2563eb" },
  dropoff: { label: "Drop-off", color: "#16a34a" },
  fuel: { label: "Fuel Stop", color: "#f59e0b" },
  rest: { label: "Rest Break", color: "#14b8a6" },
  overnight: { label: "Overnight Rest", color: "#7c3aed" },
};