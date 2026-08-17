import { EldLog } from "./components/eld-log";
import { RouteMap } from "./components/route-map";
import { StopsList } from "./components/stops-list";
import { TripForm } from "./components/trip-form";
import { TripSummary } from "./components/trip-summary";
import { useTripPlan } from "./hooks/use-trip-plan";
import { Spinner } from "./ui";

export default function App() {
  const tripPlan = useTripPlan();

  return (
    <div className="flex h-full bg-gray-100 text-gray-900">
      <aside className="w-96 shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-6">
        <header className="mb-6">
          <h1 className="text-lg font-bold uppercase tracking-wide text-gray-900">
            ELD Trip Planner
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Plan compliant routes and generate daily log sheets.
          </p>
        </header>
        <TripForm
          onSubmit={tripPlan.mutate}
          isSubmitting={tripPlan.isPending}
          error={tripPlan.error}
        />
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        {tripPlan.isPending ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex items-center gap-2 text-gray-500">
              <Spinner /> Planning trip...
            </div>
          </div>
        ) : tripPlan.data ? (
          <div className="mx-auto max-w-5xl space-y-6">
            <TripSummary summary={tripPlan.data.summary} />

            <section>
              <h2 className="mb-3 text-base font-semibold uppercase tracking-wide text-gray-700">
                Route
              </h2>
              <RouteMap route={tripPlan.data.route} stops={tripPlan.data.stops} />
            </section>

            <section>
              <h2 className="mb-3 text-base font-semibold uppercase tracking-wide text-gray-700">
                Stops & Rests
              </h2>
              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <StopsList stops={tripPlan.data.stops} />
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-base font-semibold uppercase tracking-wide text-gray-700">
                Daily Logs
              </h2>
              {tripPlan.data.days.map((day) => (
                <EldLog
                  key={day.day}
                  day={day}
                  dayCount={tripPlan.data.days.length}
                />
              ))}
            </section>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            Enter trip details to plan a route.
          </div>
        )}
      </main>
    </div>
  );
}