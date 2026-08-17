"""Routing service.

Computes a driving route through an ordered list of waypoints using the
OSRM public API. OSRM is a free, keyless routing engine.

See https://project-osrm.org
"""

from __future__ import annotations

import requests

OSRM_ROUTE_URL = "https://router.project-osrm.org/route/v1/driving"
REQUEST_TIMEOUT_SECONDS = 15
USER_AGENT = "eld-route-planner/1.0"

METERS_PER_MILE = 1609.344
SECONDS_PER_HOUR = 3600


class RoutingError(Exception):
    """Raised when a route cannot be computed."""


def get_route(coordinates: list[tuple[float, float]]) -> dict:
    """Compute a driving route through ordered ``(longitude, latitude)`` waypoints.

    Returns a dict with the keys:

    * ``distance_miles``  - total route distance in miles
    * ``duration_hours``  - total driving duration in hours
    * ``legs``            - per-leg distances in miles
    * ``polyline``        - list of ``[latitude, longitude]`` pairs for mapping
    * ``coordinates``     - list of ``[longitude, latitude]`` pairs (raw)
    """
    waypoints = ";".join(f"{lon},{lat}" for lon, lat in coordinates)
    url = f"{OSRM_ROUTE_URL}/{waypoints}"
    params = {
        "overview": "full",
        "geometries": "geojson",
    }
    headers = {"User-Agent": USER_AGENT}

    try:
        response = requests.get(
            url,
            params=params,
            headers=headers,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        raise RoutingError(f"Routing request failed: {exc}") from exc

    payload = response.json()
    if payload.get("code") != "Ok" or not payload.get("routes"):
        raise RoutingError(f"OSRM could not compute a route: {payload.get('code')}")

    route = payload["routes"][0]
    geometry = route["geometry"]["coordinates"]

    return {
        "distance_miles": route["distance"] / METERS_PER_MILE,
        "duration_hours": route["duration"] / SECONDS_PER_HOUR,
        "legs": [leg["distance"] / METERS_PER_MILE for leg in route.get("legs", [])],
        "polyline": [[lat, lon] for lon, lat in geometry],
        "coordinates": geometry,
    }


def point_at_distance_miles(
    polyline: list[list[float]], target_miles: float
) -> list[float]:
    """Return a ``[latitude, longitude]`` point ``target_miles`` along the polyline."""
    target_meters = target_miles * METERS_PER_MILE
    cumulative_meters = 0.0

    for index in range(len(polyline) - 1):
        lat1, lon1 = polyline[index]
        lat2, lon2 = polyline[index + 1]
        segment_meters = _haversine_meters(lat1, lon1, lat2, lon2)

        if segment_meters <= 0:
            continue

        if cumulative_meters + segment_meters >= target_meters:
            fraction = (target_meters - cumulative_meters) / segment_meters
            return [
                lat1 + (lat2 - lat1) * fraction,
                lon1 + (lon2 - lon1) * fraction,
            ]

        cumulative_meters += segment_meters

    return polyline[-1]


def _haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in meters between two coordinates."""
    import math

    radius_meters = 6_371_000.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    return 2 * radius_meters * math.asin(math.sqrt(a))