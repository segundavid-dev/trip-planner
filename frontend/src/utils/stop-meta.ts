import type { ComponentType } from "react";
import {
  Coffee01Icon,
  FuelIcon,
  Home01Icon,
  MoonIcon,
  PackageIcon,
  WarehouseIcon,
} from "hugeicons-react";
import type { StopType } from "../types";

interface StopMeta {
  label: string;
  color: string;
  icon: ComponentType<{ size?: number | string; className?: string }>;
}

export const STOP_META: Record<StopType, StopMeta> = {
  current: { label: "Trip Start", color: "#6b7280", icon: Home01Icon },
  pickup: { label: "Pickup", color: "#2563eb", icon: WarehouseIcon },
  dropoff: { label: "Drop-off", color: "#16a34a", icon: PackageIcon },
  fuel: { label: "Fuel Stop", color: "#f59e0b", icon: FuelIcon },
  rest: { label: "Rest Break", color: "#14b8a6", icon: Coffee01Icon },
  overnight: { label: "Overnight Rest", color: "#7c3aed", icon: MoonIcon },
};