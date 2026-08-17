import { Skeleton } from "../ui";

export function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="mt-3 h-3 w-16" />
            <Skeleton className="mt-2 h-6 w-20" />
          </div>
        ))}
      </div>
      <Skeleton className="h-72 rounded-lg sm:h-96" />
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:p-5">
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}