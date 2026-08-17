import { Route01Icon } from "../utils/hugeicons";

export function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white/60 p-6 text-center sm:p-10">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Route01Icon size={28} />
      </span>
      <h2 className="mt-4 text-base font-semibold text-gray-900">Plan a trip</h2>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        Enter your current, pickup and drop-off locations along with the hours
        already used in your cycle to generate a compliant route and daily log
        sheets.
      </p>
    </div>
  );
}