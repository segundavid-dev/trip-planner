"""Geocoding service.

Resolves free-text location names (e.g. "Los Angeles, CA") into
latitude/longitude coordinates using the OpenStreetMap Nominatim API.

Nominatim is a free, keyless geocoder.
See https://nominatim.openstreetmap.org
"""

from __future__ import annotations

import requests

NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search"
REQUEST_TIMEOUT_SECONDS = 10
USER_AGENT = "eld-route-planner/1.0"
DEFAULT_COUNTRY_CODES = "us"


class GeocodingError(Exception):
    """Raised when a location cannot be resolved to coordinates."""


def geocode(location: str) -> dict:
    """Resolve a location name to coordinates.

    Returns a dict with the keys ``label``, ``latitude`` and ``longitude``.
    """
    params = {
        "q": location,
        "format": "jsonv2",
        "limit": 1,
        "addressdetails": 1,
        "countrycodes": DEFAULT_COUNTRY_CODES,
    }
    headers = {"User-Agent": USER_AGENT}

    try:
        response = requests.get(
            NOMINATIM_SEARCH_URL,
            params=params,
            headers=headers,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        raise GeocodingError(
            f"Geocoding request failed for '{location}': {exc}"
        ) from exc

    results = response.json()
    if not results:
        raise GeocodingError(f"Could not find coordinates for '{location}'")

    best = results[0]
    return {
        "label": best.get("display_name", location),
        "latitude": float(best["lat"]),
        "longitude": float(best["lon"]),
    }