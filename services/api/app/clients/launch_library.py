import logging
import time
from contextvars import ContextVar
from datetime import datetime
from typing import Any
from urllib.parse import urlsplit

import httpx
from pydantic import BaseModel, Field

UPCOMING_LAUNCHES_URL = "https://ll.thespacedevs.com/2.3.0/launches/upcoming/"
logger = logging.getLogger(__name__)
request_count: ContextVar[int] = ContextVar("launch_provider_request_count", default=0)


class LaunchLibraryError(Exception):
    """Raised when Launch Library cannot provide a usable response."""

    def __init__(self, message: str, retry_after: str | None = None,
                 category: str = "unknown", http_status: int | None = None):
        super().__init__(message)
        self.retry_after = retry_after
        self.category = category
        self.http_status = http_status


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
        mission_links=parse_entity_links(provider, configuration, pad, mission, payload),
        **parse_image(configuration, payload),
    )


def parse_entity_links(provider, configuration, pad, mission, payload) -> list[dict[str, Any]]:
    """Keep source-provided websites, without inferring official status or fetching more APIs."""
    links = []
    for kind, entity in (("agency", provider), ("vehicle", configuration), ("pad", pad)):
        url = safe_image_url(entity.get("info_url"))
        if url:
            links.append({"url": url, "title": entity.get("name"), "kind": kind,
                          "source": "Launch Library 2"})
    for entity in (mission, payload):
        for link in parse_links(entity.get("info_urls")):
            links.append({**link, "kind": "mission"})
    return links


def _get_upcoming_launches_once(limit: int) -> list[LaunchSummary]:
    try:
        request_count.set(request_count.get() + 1)
        response = httpx.get(
            UPCOMING_LAUNCHES_URL,
            params={"format": "json", "mode": "detailed", "ordering": "net", "limit": limit},
            timeout=30.0,
        )
        if response.status_code == 429:
            raise LaunchLibraryError(
                "Launch Library rate limit reached. Retry later.",
                retry_after=response.headers.get("Retry-After"),
                category="rate_limited", http_status=429,
            )
        response.raise_for_status()
        payload = response.json()
        if not isinstance(payload, dict) or not isinstance(payload.get("results"), list):
            raise TypeError("Invalid result shape")
        return [parse_launch(launch) for launch in payload["results"]]
    except httpx.TimeoutException as error:
        raise LaunchLibraryError("Provider request timed out.", category="timeout") from error
    except httpx.HTTPStatusError as error:
        raise LaunchLibraryError(
            "Provider returned an unsuccessful HTTP status.", category="http_error",
            http_status=error.response.status_code,
            retry_after=error.response.headers.get("Retry-After"),
        ) from error
    except httpx.RequestError as error:
        raise LaunchLibraryError("Provider network request failed.", category="network") from error
    except (KeyError, TypeError, ValueError, AttributeError) as error:
        raise LaunchLibraryError("Provider returned invalid launch data.",
                                 category="invalid_payload") from error


def get_upcoming_launches(limit: int = 20) -> list[LaunchSummary]:
    """One bounded retry inside the existing shared synchronization reservation."""
    for attempt in (1, 2):
        started = time.monotonic()
        try:
            result = _get_upcoming_launches_once(limit)
        except LaunchLibraryError as error:
            # Never log raw exceptions, response bodies, URLs or credentials.
            retryable = error.category in {"timeout", "network"} or (
                error.category == "http_error" and error.http_status in {500, 502, 503, 504}
            )
            # A server-directed delay is handled by the persisted cooldown, not a short retry.
            retry = attempt == 1 and retryable and error.retry_after is None
            logger.warning(
                "launch_provider attempt=%s category=%s http_status=%s elapsed_ms=%s retry=%s",
                attempt, error.category, error.http_status,
                round((time.monotonic() - started) * 1000), retry,
            )
            if not retry:
                raise
            time.sleep(5)
        else:
            logger.info("launch_provider attempt=%s outcome=success count=%s", attempt, len(result))
            return result
    raise AssertionError("Unreachable retry state")
