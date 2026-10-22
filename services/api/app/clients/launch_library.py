from datetime import datetime
from typing import Any

import httpx
from pydantic import BaseModel

UPCOMING_LAUNCHES_URL = "https://ll.thespacedevs.com/2.3.0/launches/upcoming/"


class LaunchLibraryError(Exception):
    """Raised when Launch Library cannot provide a usable response."""

    def __init__(self, message: str, retry_after: str | None = None):
        super().__init__(message)
        self.retry_after = retry_after


class LaunchSummary(BaseModel):
    id: str
    name: str
    status: str
    net: datetime
    agency: str | None = None
    vehicle: str | None = None
    source_url: str | None = None
    mission_name: str | None = None
    mission_description: str | None = None
    pad_name: str | None = None
    location_name: str | None = None
    launch_timezone: str | None = None
    window_start: datetime | None = None
    window_end: datetime | None = None


def parse_launch(payload: dict[str, Any]) -> LaunchSummary:
    provider = payload.get("launch_service_provider") or {}
    rocket = payload.get("rocket") or {}
    configuration = rocket.get("configuration") or {}
    status = payload.get("status") or {}
    mission = payload.get("mission") or {}
    pad = payload.get("pad") or {}
    location = pad.get("location") or {}

    return LaunchSummary(
        id=payload["id"],
        name=payload["name"],
        status=status.get("name", "Unknown"),
        net=payload["net"],
        agency=provider.get("name"),
        vehicle=configuration.get("full_name"),
        source_url=payload.get("url"),
        mission_name=mission.get("name") or None,
        mission_description=mission.get("description") or None,
        pad_name=pad.get("name") or None,
        location_name=location.get("name") or None,
        launch_timezone=location.get("timezone_name") or None,
        window_start=payload.get("window_start"),
        window_end=payload.get("window_end"),
    )


def get_upcoming_launches(limit: int = 20) -> list[LaunchSummary]:
    try:
        response = httpx.get(
            UPCOMING_LAUNCHES_URL,
            params={"format": "json", "mode": "normal", "ordering": "net", "limit": limit},
            timeout=10.0,
        )
        if response.status_code == 429:
            raise LaunchLibraryError(
                "Launch Library rate limit reached. Retry later.",
                retry_after=response.headers.get("Retry-After"),
            )
        response.raise_for_status()
        payload = response.json()
        return [parse_launch(launch) for launch in payload["results"]]
    except (httpx.HTTPError, KeyError, TypeError, ValueError) as error:
        raise LaunchLibraryError("Unable to retrieve upcoming launches.") from error
