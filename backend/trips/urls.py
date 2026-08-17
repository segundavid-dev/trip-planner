"""URL configuration for the trips app."""

from django.urls import path

from .views import TripPlanView

urlpatterns = [
    path("trips/plan/", TripPlanView.as_view(), name="trip-plan"),
]