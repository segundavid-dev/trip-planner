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
import { formatTime } from "../utils/time";
import { STOP_META } from "../utils/stop-meta";

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
    <div className="h-96 overflow-hidden rounded-lg border border-gray-200">
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
        {stops.map((stop) => (
          <CircleMarker
            key={stop.order}
            center={[stop.latitude, stop.longitude]}
            radius={7}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: STOP_META[stop.type].color,
              fillOpacity: 1,
            }}
          >
            <Tooltip>
              <span className="font-medium">{STOP_META[stop.type].label}</span>
              <br />
              {stop.location}
              <br />
              Day {stop.day} {formatTime(stop.arrival_min)} -{" "}
              {formatTime(stop.departure_min)}
            </Tooltip>
          </CircleMarker>
        ))}
        <FitBounds points={route.polyline} />
      </MapContainer>
    </div>
  );
}