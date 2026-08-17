import { TruckIcon } from "../utils/hugeicons";

export function AppHeader() {
  return (
    <header className="no-print border-b border-gray-800 bg-gray-900 px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white sm:h-10 sm:w-10">
          <TruckIcon size={20} />
        </span>
        <h1 className="text-sm font-bold uppercase tracking-wide text-white sm:text-base">
          ELD Trip Planner
        </h1>
      </div>
    </header>
  );
}