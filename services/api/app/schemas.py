from datetime import datetime

from pydantic import BaseModel, ConfigDict


class LaunchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    status: str
    net: datetime
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


class SyncResponse(BaseModel):
    imported: int


class FilterOptionsResponse(BaseModel):
    agencies: list[str]
    vehicles: list[str]


class DataStatusResponse(BaseModel):
    source: str = "Launch Library 2"
    cached_launches: int
    last_updated_at: datetime | None
    stale: bool
