import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { RouteData, TripStop } from "../types";
import { STOP_META } from "../utils/stop-meta";
import { formatTime } from "../utils/time";

const DEFAULT_CENTER: [number, number] = [39.5, -98.35];

interface RouteMapProps {
  route: RouteData;
  stops: TripStop[];
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(points, { padding: [40, 40] });
    }
  }, [map, points]);

  return null;
}

export function RouteMap({ route, stops }: RouteMapProps) {
  return (
    <div className="relative h-72 overflow-hidden rounded-lg border border-gray-200 sm:h-96">
      <div className="absolute left-2 top-2 z-[500] rounded-lg border border-gray-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur sm:left-3 sm:top-3 sm:px-4 sm:py-3">
        <p className="text-xl font-bold text-gray-900 sm:text-2xl">
          {route.distance_miles.toFixed(0)} mi
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          {route.duration_hours.toFixed(1)} h driving
        </p>
      </div>

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={4}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline
          positions={route.polyline}
          pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.85 }}
        />
        {stops.map((stop) => {
          const meta = STOP_META[stop.type];
          const StopIcon = meta.icon;
          return (
            <CircleMarker
              key={stop.order}
              center={[stop.latitude, stop.longitude]}
              radius={7}
              pathOptions={{
                color: "#ffffff",
                weight: 2,
                fillColor: meta.color,
                fillOpacity: 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                <div className="min-w-40">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                    <span style={{ color: meta.color }}>
                      <StopIcon size={14} />
                    </span>
                    {meta.label}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{stop.location}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Day {stop.day} · {formatTime(stop.arrival_min)} -{" "}
                    {formatTime(stop.departure_min)}
                  </p>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
        <FitBounds points={route.polyline} />
      </MapContainer>
    </div>
  );
}