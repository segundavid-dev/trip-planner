import { useState } from "react";
import type { ComponentType, FormEvent } from "react";
import {
  Clock01Icon,
  Home01Icon,
  PackageIcon,
  WarehouseIcon,
} from "../utils/hugeicons";
import type { ApiError, TripPlanRequest } from "../types";
import { Button, Field, Input, Spinner } from "../ui";

interface TripFormProps {
  onSubmit: (request: TripPlanRequest) => void;
  isSubmitting: boolean;
  error: ApiError | null;
}

type LocationKey = "current_location" | "pickup_location" | "dropoff_location";

interface FieldConfig {
  key: LocationKey;
  label: string;
  placeholder: string;
  icon: ComponentType<{ size?: number | string; className?: string }>;
}

const LOCATION_FIELDS: FieldConfig[] = [
  {
    key: "current_location",
    label: "Current Location",
    placeholder: "e.g. Los Angeles, CA",
    icon: Home01Icon,
  },
  {
    key: "pickup_location",
    label: "Pickup Location",
    placeholder: "e.g. Phoenix, AZ",
    icon: WarehouseIcon,
  },
  {
    key: "dropoff_location",
    label: "Dropoff Location",
    placeholder: "e.g. Dallas, TX",
    icon: PackageIcon,
  },
];

interface Preset {
  label: string;
  values: TripPlanRequest;
}

const PRESETS: Preset[] = [
  {
    label: "West Coast",
    values: {
      current_location: "Los Angeles, CA",
      pickup_location: "Phoenix, AZ",
      dropoff_location: "Dallas, TX",
      current_cycle_used: 20,
    },
  },
  {
    label: "Cross Country",
    values: {
      current_location: "Seattle, WA",
      pickup_location: "Denver, CO",
      dropoff_location: "Miami, FL",
      current_cycle_used: 35,
    },
  },
  {
    label: "Short Haul",
    values: {
      current_location: "Chicago, IL",
      pickup_location: "Indianapolis, IN",
      dropoff_location: "Detroit, MI",
      current_cycle_used: 5,
    },
  },
];

export function TripForm({ onSubmit, isSubmitting, error }: TripFormProps) {
  const [form, setForm] = useState({
    current_location: "",
    pickup_location: "",
    dropoff_location: "",
    current_cycle_used: "",
  });

  const fieldErrors = error?.fieldErrors;

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function applyPreset(preset: Preset) {
    setForm({
      current_location: preset.values.current_location,
      pickup_location: preset.values.pickup_location,
      dropoff_location: preset.values.dropoff_location,
      current_cycle_used: String(preset.values.current_cycle_used),
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      current_location: form.current_location.trim(),
      pickup_location: form.pickup_location.trim(),
      dropoff_location: form.dropoff_location.trim(),
      current_cycle_used: Number(form.current_cycle_used) || 0,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && !error.fieldErrors ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error.message}
        </div>
      ) : null}

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
          Quick examples
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {LOCATION_FIELDS.map((field) => {
        const FieldIcon = field.icon;
        return (
          <Field
            key={field.key}
            label={field.label}
            error={fieldErrors?.[field.key]?.[0]}
          >
            <Input
              value={form[field.key]}
              placeholder={field.placeholder}
              invalid={Boolean(fieldErrors?.[field.key])}
              icon={<FieldIcon size={16} />}
              onChange={(event) => updateField(field.key, event.target.value)}
            />
          </Field>
        );
      })}

      <Field
        label="Current Cycle Used (hrs)"
        error={fieldErrors?.current_cycle_used?.[0]}
      >
        <Input
          type="number"
          min={0}
          max={70}
          step={0.5}
          value={form.current_cycle_used}
          placeholder="e.g. 20"
          invalid={Boolean(fieldErrors?.current_cycle_used)}
          icon={<Clock01Icon size={16} />}
          onChange={(event) => updateField("current_cycle_used", event.target.value)}
        />
        <p className="text-xs text-gray-400">
          Hours already used in your 70-hour / 8-day cycle.
        </p>
      </Field>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner /> Planning...
          </>
        ) : (
          "Plan Trip"
        )}
      </Button>
    </form>
  );
}