import { TruckIcon } from "../utils/hugeicons";

export function AppHeader() {
  return (
    <header className="no-print border-b border-gray-800 bg-gray-900 px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
          <TruckIcon size={22} />
        </span>
        <h1 className="text-base font-bold uppercase tracking-wide text-white">
          ELD Trip Planner
        </h1>
      </div>
    </header>
  );
}