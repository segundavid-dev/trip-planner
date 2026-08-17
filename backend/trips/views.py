"""API views for the trips app."""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import TripPlanRequestSerializer
from .services.geocoding import GeocodingError, geocode
from .services.routing import RoutingError, get_route
from .services.trip_planner import build_trip_plan


class TripPlanView(APIView):
    """Plan a compliant trip from free-text locations and cycle hours."""

    def post(self, request):
        serializer = TripPlanRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            current = geocode(data["current_location"])
            pickup = geocode(data["pickup_location"])
            dropoff = geocode(data["dropoff_location"])
        except GeocodingError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        coordinates = [
            (current["longitude"], current["latitude"]),
            (pickup["longitude"], pickup["latitude"]),
            (dropoff["longitude"], dropoff["latitude"]),
        ]

        try:
            route = get_route(coordinates)
        except RoutingError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        if route["distance_miles"] <= 0:
            return Response(
                {"error": "Pickup and drop-off must be different locations."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        plan = build_trip_plan(
            current=current,
            pickup=pickup,
            dropoff=dropoff,
            cycle_used_hours=data["current_cycle_used"],
            route=route,
        )
        return Response(plan)