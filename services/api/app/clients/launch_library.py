from datetime import datetime
from typing import Any

import httpx
from pydantic import BaseModel

UPCOMING_LAUNCHES_URL = "https://ll.thespacedevs.com/2.3.0/launches/upcoming/"


class LaunchLibraryError(Exception):
    """Raised when Launch Library cannot provide a usable response."""


class LaunchSummary(BaseModel):
    id: str
    name: str
    status: str
    net: datetime
    agency: str | None = None
    vehicle: str | None = None
    source_url: str | None = None


def parse_launch(payload: dict[str, Any]) -> LaunchSummary:
    provider = payload.get("launch_service_provider") or {}
    rocket = payload.get("rocket") or {}
    configuration = rocket.get("configuration") or {}
    status = payload.get("status") or {}

    return LaunchSummary(
        id=payload["id"],
        name=payload["name"],
        status=status.get("name", "Unknown"),
        net=payload["net"],
        agency=provider.get("name"),
        vehicle=configuration.get("full_name"),
        source_url=payload.get("url"),
    )


def get_upcoming_launches(limit: int = 20) -> list[LaunchSummary]:
    try:
        response = httpx.get(
            UPCOMING_LAUNCHES_URL,
            params={"format": "json", "mode": "normal", "ordering": "net", "limit": limit},
            timeout=10.0,
        )
        response.raise_for_status()
        payload = response.json()
        return [parse_launch(launch) for launch in payload["results"]]
    except (httpx.HTTPError, KeyError, TypeError, ValueError) as error:
        raise LaunchLibraryError("Unable to retrieve upcoming launches.") from error
