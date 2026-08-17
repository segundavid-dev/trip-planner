import { AppHeader } from "./components/app-header";
import { EldLogs } from "./components/eld-logs";
import { EmptyState } from "./components/empty-state";
import { LoadingState } from "./components/loading-state";
import { RouteMap } from "./components/route-map";
import { StopsList } from "./components/stops-list";
import { TripForm } from "./components/trip-form";
import { TripSummary } from "./components/trip-summary";
import { useTripPlan } from "./hooks/use-trip-plan";
import { cityLabel } from "./utils/location";

export default function App() {
  const tripPlan = useTripPlan();
  const plan = tripPlan.data;

  return (
    <div className="flex h-full flex-col bg-gray-100 text-gray-900">
      <AppHeader />

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <aside className="no-print w-full shrink-0 overflow-y-auto border-b border-gray-200 bg-white p-4 lg:w-96 lg:border-b-0 lg:border-r lg:p-6">
          <TripForm
            onSubmit={tripPlan.mutate}
            isSubmitting={tripPlan.isPending}
            error={tripPlan.error}
          />
        </aside>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {tripPlan.isPending ? (
            <LoadingState />
          ) : plan ? (
            <div className="mx-auto max-w-5xl space-y-6">
              <div className="no-print">
                <TripSummary summary={plan.summary} />
              </div>

              <section className="no-print">
                <h2 className="mb-3 text-base font-semibold uppercase tracking-wide text-gray-700">
                  Route
                </h2>
                <RouteMap route={plan.route} stops={plan.stops} />
              </section>

              <section className="no-print">
                <h2 className="mb-3 text-base font-semibold uppercase tracking-wide text-gray-700">
                  Stops &amp; Rests
                </h2>
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:p-5">
                  <StopsList stops={plan.stops} days={plan.days} />
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="no-print text-base font-semibold uppercase tracking-wide text-gray-700">
                  Daily Logs
                </h2>
                <EldLogs
                  days={plan.days}
                  origin={cityLabel(plan.stops[0]?.location)}
                  destination={cityLabel(plan.stops.at(-1)?.location)}
                />
              </section>
            </div>
          ) : (
            <EmptyState />
          )}
        </main>
      </div>
    </div>
  );
}