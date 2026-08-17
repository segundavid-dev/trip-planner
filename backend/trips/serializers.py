"""Serializers for the trips app."""

from rest_framework import serializers

CYCLE_LIMIT_HOURS = 70.0


class TripPlanRequestSerializer(serializers.Serializer):
    """Validates the inputs for a trip planning request."""

    current_location = serializers.CharField(max_length=255)
    pickup_location = serializers.CharField(max_length=255)
    dropoff_location = serializers.CharField(max_length=255)
    current_cycle_used = serializers.FloatField(
        min_value=0.0,
        max_value=CYCLE_LIMIT_HOURS,
    )