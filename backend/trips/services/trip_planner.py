"""Hours-of-Service (HOS) trip planner.

Builds a compliant driving plan for a property-carrying driver under the
U.S. FMCSA 70-hour/8-day rule. No adverse driving conditions are assumed.

Rules enforced (49 CFR 395):
* 11 hours maximum daily driving time
* 14 hours maximum on-duty time per shift
* 30-minute break after 8 cumulative hours of driving
* 10 consecutive hours off duty between shifts
* 70 hours on duty per rolling 8-day period

Trip assumptions:
* Fuel stop at least every 1,000 miles (30 minutes)
* 1 hour for pickup and 1 hour for drop-off
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from enum import Enum

from .routing import point_at_distance_miles

# --- regulatory constants ---------------------------------------------------

DAILY_DRIVING_LIMIT_HOURS = 11.0
DAILY_ON_DUTY_LIMIT_HOURS = 14.0
BREAK_TRIGGER_DRIVING_HOURS = 8.0
BREAK_DURATION_HOURS = 0.5
CYCLE_LIMIT_HOURS = 70.0

# --- trip assumptions -------------------------------------------------------

FUEL_INTERVAL_MILES = 1000.0
FUEL_STOP_HOURS = 0.5
PICKUP_HOURS = 1.0
DROPOFF_HOURS = 1.0
PRE_TRIP_HOURS = 0.25
POST_TRIP_HOURS = 0.25

MINUTES_PER_HOUR = 60
MINUTES_PER_DAY = 1440
MILE_EPSILON = 0.05


class LogStatus(str, Enum):
    """Driver statuses shown on an ELD daily log sheet."""

    OFF_DUTY = "OFF_DUTY"
    SLEEPER_BERTH = "SLEEPER_BERTH"
    DRIVING = "DRIVING"
    ON_DUTY = "ON_DUTY"


@dataclass
class Event:
    """A single activity segment on a daily log sheet."""

    start_min: int
    end_min: int
    status: LogStatus
    remark: str
    location: str = ""


@dataclass
class Stop:
    """A scheduled stop (fuel, rest, pickup, drop-off, overnight)."""

    order: int
    stop_type: str
    label: str
    location: str
    latitude: float
    longitude: float
    day: int
    arrival_min: int
    departure_min: int
    cumulative_miles: float


def build_trip_plan(
    *,
    current: dict,
    pickup: dict,
    dropoff: dict,
    cycle_used_hours: float,
    route: dict,
    start_date: date | None = None,
) -> dict:
    """Build a full driving plan for a trip.

    Args:
        current:  ``{"label", "latitude", "longitude"}``
        pickup:   ``{"label", "latitude", "longitude"}``
        dropoff:  ``{"label", "latitude", "longitude"}``
        cycle_used_hours: hours already used in the current 70-hour cycle
        route: output of :func:`routing.get_route`
        start_date: optional first day of the trip

    Returns a serializable dict with the keys ``summary``, ``stops``,
    ``days`` and ``route``.
    """
    legs = route.get("legs") or [route["distance_miles"]]
    miles_to_pickup = legs[0] if legs else 0.0
    miles_to_dropoff = legs[1] if len(legs) > 1 else 0.0
    total_miles = route["distance_miles"]
    avg_speed_mph = total_miles / route["duration_hours"] if route["duration_hours"] > 0 else 60.0

    remaining_to_pickup = miles_to_pickup
    remaining_to_dropoff = miles_to_dropoff
    pickup_done = remaining_to_pickup <= MILE_EPSILON
    dropoff_done = remaining_to_dropoff <= MILE_EPSILON

    cumulative_miles = 0.0
    miles_since_fuel = 0.0
    cycle_remaining = max(CYCLE_LIMIT_HOURS - cycle_used_hours, 0.0)

    first_day = start_date or date.today()

    days: list[dict] = []
    stops: list[Stop] = []
    stop_order = 0
    total_driving_hours = 0.0
    total_on_duty_hours = 0.0
    cycle_exhausted = False

    def register_stop(
        stop_type: str,
        label: str,
        location: str,
        coordinates: tuple[float, float],
        day: int,
        arrival_min: int,
        departure_min: int,
    ) -> None:
        """Record a stop, snapping its position to the route when needed."""
        nonlocal stop_order
        stop_order += 1
        stops.append(
            Stop(
                order=stop_order,
                stop_type=stop_type,
                label=label,
                location=location,
                latitude=round(coordinates[0], 6),
                longitude=round(coordinates[1], 6),
                day=day,
                arrival_min=arrival_min,
                departure_min=departure_min,
                cumulative_miles=round(cumulative_miles, 1),
            )
        )

    def route_point(miles: float) -> tuple[float, float]:
        point = point_at_distance_miles(route["polyline"], miles)
        return point[0], point[1]

    register_stop(
        "current",
        "Trip start",
        current["label"],
        (current["latitude"], current["longitude"]),
        day=1,
        arrival_min=0,
        departure_min=0,
    )

    overnight_label = current["label"]

    while not dropoff_done:
        if cycle_remaining <= 0:
            cycle_exhausted = True
            break

        day_number = len(days) + 1
        events: list[Event] = []
        clock_min = 0
        driving_hours = 0.0
        on_duty_hours = 0.0
        driving_since_break = 0.0
        day_miles = 0.0
        trip_completed_today = False

        events.append(
            Event(
                clock_min,
                clock_min + int(PRE_TRIP_HOURS * MINUTES_PER_HOUR),
                LogStatus.ON_DUTY,
                "Pre-trip inspection",
                overnight_label,
            )
        )
        clock_min += int(PRE_TRIP_HOURS * MINUTES_PER_HOUR)
        on_duty_hours += PRE_TRIP_HOURS

        while True:
            # 1. Arrived at pickup -> 1 hour on duty.
            if not pickup_done and remaining_to_pickup <= MILE_EPSILON:
                if on_duty_hours + PICKUP_HOURS > DAILY_ON_DUTY_LIMIT_HOURS:
                    break
                events.append(
                    Event(
                        clock_min,
                        clock_min + int(PICKUP_HOURS * MINUTES_PER_HOUR),
                        LogStatus.ON_DUTY,
                        "Pickup",
                        pickup["label"],
                    )
                )
                clock_min += int(PICKUP_HOURS * MINUTES_PER_HOUR)
                on_duty_hours += PICKUP_HOURS
                pickup_done = True
                register_stop(
                    "pickup",
                    "Pickup",
                    pickup["label"],
                    (pickup["latitude"], pickup["longitude"]),
                    day_number,
                    clock_min - int(PICKUP_HOURS * MINUTES_PER_HOUR),
                    clock_min,
                )
                continue

            # 2. Arrived at drop-off -> 1 hour on duty + post-trip inspection.
            if remaining_to_dropoff <= MILE_EPSILON:
                if on_duty_hours + DROPOFF_HOURS + POST_TRIP_HOURS > DAILY_ON_DUTY_LIMIT_HOURS:
                    break
                dropoff_start = clock_min
                events.append(
                    Event(
                        clock_min,
                        clock_min + int(DROPOFF_HOURS * MINUTES_PER_HOUR),
                        LogStatus.ON_DUTY,
                        "Drop-off",
                        dropoff["label"],
                    )
                )
                clock_min += int(DROPOFF_HOURS * MINUTES_PER_HOUR)
                on_duty_hours += DROPOFF_HOURS
                events.append(
                    Event(
                        clock_min,
                        clock_min + int(POST_TRIP_HOURS * MINUTES_PER_HOUR),
                        LogStatus.ON_DUTY,
                        "Post-trip inspection",
                        dropoff["label"],
                    )
                )
                clock_min += int(POST_TRIP_HOURS * MINUTES_PER_HOUR)
                on_duty_hours += POST_TRIP_HOURS
                dropoff_done = True
                trip_completed_today = True
                register_stop(
                    "dropoff",
                    "Drop-off",
                    dropoff["label"],
                    (dropoff["latitude"], dropoff["longitude"]),
                    day_number,
                    dropoff_start,
                    clock_min,
                )
                break

            # 3. 30-minute rest break after 8 cumulative hours of driving.
            if driving_since_break >= BREAK_TRIGGER_DRIVING_HOURS:
                events.append(
                    Event(
                        clock_min,
                        clock_min + int(BREAK_DURATION_HOURS * MINUTES_PER_HOUR),
                        LogStatus.OFF_DUTY,
                        "30-min rest break",
                        "En route",
                    )
                )
                clock_min += int(BREAK_DURATION_HOURS * MINUTES_PER_HOUR)
                driving_since_break = 0.0
                register_stop(
                    "rest",
                    "Rest break",
                    f"Rest stop at {int(round(cumulative_miles))} mi",
                    route_point(cumulative_miles),
                    day_number,
                    clock_min - int(BREAK_DURATION_HOURS * MINUTES_PER_HOUR),
                    clock_min,
                )
                continue

            # 4. Fuel stop at least every 1,000 miles.
            if miles_since_fuel >= FUEL_INTERVAL_MILES:
                if on_duty_hours + FUEL_STOP_HOURS > DAILY_ON_DUTY_LIMIT_HOURS:
                    break
                events.append(
                    Event(
                        clock_min,
                        clock_min + int(FUEL_STOP_HOURS * MINUTES_PER_HOUR),
                        LogStatus.ON_DUTY,
                        "Fuel stop",
                        "En route",
                    )
                )
                clock_min += int(FUEL_STOP_HOURS * MINUTES_PER_HOUR)
                on_duty_hours += FUEL_STOP_HOURS
                miles_since_fuel = 0.0
                register_stop(
                    "fuel",
                    "Fuel stop",
                    f"Fuel stop at {int(round(cumulative_miles))} mi",
                    route_point(cumulative_miles),
                    day_number,
                    clock_min - int(FUEL_STOP_HOURS * MINUTES_PER_HOUR),
                    clock_min,
                )
                continue

            # 5. Daily limits reached -> end of shift.
            if (
                driving_hours >= DAILY_DRIVING_LIMIT_HOURS
                or on_duty_hours >= DAILY_ON_DUTY_LIMIT_HOURS
            ):
                break

            # 6. Drive the next segment, capped by the closest constraint.
            target_miles = remaining_to_pickup if not pickup_done else remaining_to_dropoff
            capacity_hours = min(
                DAILY_DRIVING_LIMIT_HOURS - driving_hours,
                DAILY_ON_DUTY_LIMIT_HOURS - on_duty_hours,
            )
            miles_to_fuel = FUEL_INTERVAL_MILES - miles_since_fuel
            miles_to_break = max(
                (BREAK_TRIGGER_DRIVING_HOURS - driving_since_break) * avg_speed_mph, 0.0
            )
            segment_miles = min(target_miles, capacity_hours * avg_speed_mph, miles_to_fuel, miles_to_break)

            if segment_miles <= MILE_EPSILON:
                break

            drive_hours = segment_miles / avg_speed_mph
            events.append(
                Event(
                    clock_min,
                    clock_min + int(round(drive_hours * MINUTES_PER_HOUR)),
                    LogStatus.DRIVING,
                    "Driving",
                    "En route",
                )
            )
            clock_min += int(round(drive_hours * MINUTES_PER_HOUR))
            driving_hours += drive_hours
            on_duty_hours += drive_hours
            driving_since_break += drive_hours
            day_miles += segment_miles
            cumulative_miles += segment_miles
            miles_since_fuel += segment_miles
            if not pickup_done:
                remaining_to_pickup -= segment_miles
            else:
                remaining_to_dropoff -= segment_miles

        # --- End of day ------------------------------------------------------
        if not trip_completed_today and clock_min < MINUTES_PER_DAY:
            overnight_label = f"Rest stop at {int(round(cumulative_miles))} mi"
            events.append(
                Event(
                    clock_min,
                    MINUTES_PER_DAY,
                    LogStatus.SLEEPER_BERTH,
                    "Overnight rest",
                    overnight_label,
                )
            )
            register_stop(
                "overnight",
                "Overnight rest",
                overnight_label,
                route_point(cumulative_miles),
                day_number,
                clock_min,
                MINUTES_PER_DAY,
            )
        elif trip_completed_today and clock_min < MINUTES_PER_DAY:
            events.append(
                Event(clock_min, MINUTES_PER_DAY, LogStatus.OFF_DUTY, "Off duty", dropoff["label"])
            )

        total_driving_hours += driving_hours
        total_on_duty_hours += on_duty_hours
        cycle_remaining = max(cycle_remaining - on_duty_hours, 0.0)

        days.append(
            {
                "day": day_number,
                "date": (first_day + timedelta(days=day_number - 1)).isoformat(),
                "totals": {
                    "driving_hours": round(driving_hours, 1),
                    "on_duty_hours": round(on_duty_hours, 1),
                    "distance_miles": round(day_miles, 1),
                },
                "events": [_serialize_event(event) for event in merge_adjacent(events)],
            }
        )

    return {
        "summary": {
            "trip_miles": round(total_miles, 1),
            "estimated_driving_hours": round(total_driving_hours, 1),
            "total_on_duty_hours": round(total_on_duty_hours, 1),
            "number_of_days": len(days),
            "average_speed_mph": round(avg_speed_mph, 1),
            "cycle_hours_used": round(cycle_used_hours, 1),
            "cycle_hours_remaining": round(cycle_remaining, 1),
            "fuel_stops": sum(1 for stop in stops if stop.stop_type == "fuel"),
            "rest_stops": sum(
                1 for stop in stops if stop.stop_type in ("rest", "overnight")
            ),
            "cycle_exhausted": cycle_exhausted,
        },
        "stops": [_serialize_stop(stop) for stop in stops],
        "days": days,
        "route": {
            "polyline": route["polyline"],
            "distance_miles": round(route["distance_miles"], 1),
            "duration_hours": round(route["duration_hours"], 1),
        },
    }


def merge_adjacent(events: list[Event]) -> list[Event]:
    """Merge back-to-back events that share the same status."""
    merged: list[Event] = []
    for event in events:
        if (
            merged
            and merged[-1].status == event.status
            and merged[-1].end_min == event.start_min
        ):
            merged[-1].end_min = event.end_min
        else:
            merged.append(event)
    return merged


def _serialize_event(event: Event) -> dict:
    return {
        "start_min": event.start_min,
        "end_min": event.end_min,
        "status": event.status.value,
        "remark": event.remark,
        "location": event.location,
    }


def _serialize_stop(stop: Stop) -> dict:
    return {
        "order": stop.order,
        "type": stop.stop_type,
        "label": stop.label,
        "location": stop.location,
        "latitude": stop.latitude,
        "longitude": stop.longitude,
        "day": stop.day,
        "arrival_min": stop.arrival_min,
        "departure_min": stop.departure_min,
        "cumulative_miles": stop.cumulative_miles,
    }