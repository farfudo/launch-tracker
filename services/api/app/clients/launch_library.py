from datetime import datetime
from typing import Any
from urllib.parse import urlsplit

import httpx
from pydantic import BaseModel, Field

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
    image_url: str | None = None
    image_credit: str | None = None
    image_license: str | None = None
    image_license_url: str | None = None
    image_kind: str | None = None
    image_title: str | None = None
    streams: list[dict[str, Any]] = Field(default_factory=list)
    mission_links: list[dict[str, Any]] = Field(default_factory=list)


def parse_links(value: Any, *, video: bool = False) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    links = []
    seen = set()
    for item in value:
        if not isinstance(item, dict):
            continue
        url = safe_image_url(item.get("url"))
        if not url or url in seen:
            continue
        seen.add(url)
        link = {"url": url}
        for key in ("title", "publisher", "source"):
            link[key] = item[key].strip() if isinstance(item.get(key), str) else None
        link["priority"] = item["priority"] if type(item.get("priority")) is int else 99
        if video:
            link["live"] = item["live"] if type(item.get("live")) is bool else None
            for key in ("start_time", "end_time"):
                try:
                    date = datetime.fromisoformat(item.get(key, ""))
                    link[key] = date.isoformat() if date.tzinfo else None
                except (ValueError, TypeError, AttributeError):
                    link[key] = None
        links.append(link)
    return sorted(links, key=lambda link: link["priority"])


def safe_image_url(value: Any) -> str | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = urlsplit(value)
        if (parsed.scheme == "https" and parsed.hostname
                and parsed.username is None and parsed.password is None
                and not any(char.isspace() for char in value)):
            return value
    except ValueError:
        pass
    return None


def parse_image(configuration: dict[str, Any], payload: dict[str, Any]) -> dict[str, str | None]:
    for kind, candidate in (("vehicle", configuration.get("image")), ("launch", payload.get("image"))):
        if not isinstance(candidate, dict):
            continue
        url = safe_image_url(candidate.get("image_url"))
        if not url:
            continue
        license_data = candidate.get("license")
        if not isinstance(license_data, dict):
            license_data = {}
        return {
            "image_url": url,
            "image_credit": candidate.get("credit") or None,
            "image_license": license_data.get("name") or None,
            "image_license_url": safe_image_url(license_data.get("link")),
            "image_kind": kind,
            "image_title": candidate.get("name") or None,
        }
    return {}


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
        streams=parse_links(payload.get("vid_urls"), video=True),
        mission_links=parse_links(payload.get("info_urls")),
        **parse_image(configuration, payload),
    )


def get_upcoming_launches(limit: int = 20) -> list[LaunchSummary]:
    try:
        response = httpx.get(
            UPCOMING_LAUNCHES_URL,
            params={"format": "json", "mode": "detailed", "ordering": "net", "limit": limit},
            timeout=30.0,
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
