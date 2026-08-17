import { useState } from "react";
import type { FormEvent } from "react";
import type { ApiError, TripPlanRequest } from "../types";
import { Button, Field, Input, Spinner } from "../ui";

interface TripFormProps {
  onSubmit: (request: TripPlanRequest) => void;
  isSubmitting: boolean;
  error: ApiError | null;
}

interface FieldConfig {
  key: "current_location" | "pickup_location" | "dropoff_location";
  label: string;
  placeholder: string;
}

const FIELDS: FieldConfig[] = [
  {
    key: "current_location",
    label: "Current Location",
    placeholder: "e.g. Los Angeles, CA",
  },
  {
    key: "pickup_location",
    label: "Pickup Location",
    placeholder: "e.g. Phoenix, AZ",
  },
  {
    key: "dropoff_location",
    label: "Dropoff Location",
    placeholder: "e.g. Dallas, TX",
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

      {FIELDS.map((field) => (
        <Field
          key={field.key}
          label={field.label}
          error={fieldErrors?.[field.key]?.[0]}
        >
          <Input
            value={form[field.key]}
            placeholder={field.placeholder}
            invalid={Boolean(fieldErrors?.[field.key])}
            onChange={(event) => updateField(field.key, event.target.value)}
          />
        </Field>
      ))}

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
          onChange={(event) => updateField("current_cycle_used", event.target.value)}
        />
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