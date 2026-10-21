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


class SyncResponse(BaseModel):
    imported: int
