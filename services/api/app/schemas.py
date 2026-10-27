from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.clients.launch_library import NetPrecision


class MissionLinkResponse(BaseModel):
    kind: Literal["agency", "vehicle", "pad", "mission"] | None = None
    url: str
    title: str | None = None
    source: str | None = None
    publisher: str | None = None
    priority: int = 99
    live: bool | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None


class LaunchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    status: str
    net: datetime
    net_precision: NetPrecision | None = None
    agency: str | None
    vehicle: str | None
    source_url: str | None
    source_updated_at: datetime
    launch_timezone: str | None
    image_url: str | None = None
    image_credit: str | None = None
    image_license: str | None = None
    image_license_url: str | None = None
    image_kind: str | None = None
    image_title: str | None = None


class LaunchDetailResponse(LaunchResponse):
    mission_name: str | None
    mission_description: str | None
    pad_name: str | None
    location_name: str | None
    window_start: datetime | None
    window_end: datetime | None
    streams: list[MissionLinkResponse] = Field(default_factory=list)
    mission_links: list[MissionLinkResponse] = Field(default_factory=list)


class SyncResponse(BaseModel):
    imported: int
    skipped: bool = False
    reason: str | None = None


class FilterOptionsResponse(BaseModel):
    agencies: list[str]
    vehicles: list[str]


class DataStatusResponse(BaseModel):
    source: str = "Launch Library 2"
    cached_launches: int
    last_updated_at: datetime | None
    stale: bool
