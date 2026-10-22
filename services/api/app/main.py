import os
import secrets
from typing import Literal

from fastapi import Depends, FastAPI, Header, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.clients.launch_library import (
    LaunchLibraryError,
    get_upcoming_launches,
)
from app.db import get_db
from app.repositories import get_data_status, get_filter_options, get_launch, upsert_launches
from app.repositories import list_launches as list_cached_launches
from app.schemas import (
    DataStatusResponse,
    FilterOptionsResponse,
    LaunchDetailResponse,
    LaunchResponse,
    SyncResponse,
)

app = FastAPI(title="LaunchSkyline API", version="0.1.0")


class HealthResponse(BaseModel):
    status: Literal["ok"]


@app.get("/health", response_model=HealthResponse, tags=["system"])
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.get("/api/v1/data-status", response_model=DataStatusResponse, tags=["system"])
def data_status(db: Session = Depends(get_db)) -> DataStatusResponse:
    return get_data_status(db)


@app.get("/api/v1/launches", response_model=list[LaunchResponse], tags=["launches"])
def list_launches(
    limit: int = Query(default=20, ge=1, le=100),
    q: str | None = Query(default=None, min_length=1, max_length=100),
    agency: str | None = Query(default=None, max_length=200),
    vehicle: str | None = Query(default=None, max_length=200),
    db: Session = Depends(get_db),
) -> list[LaunchResponse]:
    """List launches stored in the local cache."""
    return list_cached_launches(db, limit, q, agency, vehicle)


@app.get(
    "/api/v1/launches/filter-options",
    response_model=FilterOptionsResponse,
    tags=["launches"],
)
def filter_options(db: Session = Depends(get_db)) -> FilterOptionsResponse:
    """List the filters available in the locally cached data."""
    agencies, vehicles = get_filter_options(db)
    return FilterOptionsResponse(agencies=agencies, vehicles=vehicles)


@app.get("/api/v1/launches/{launch_id}", response_model=LaunchDetailResponse, tags=["launches"])
def launch_detail(launch_id: str, db: Session = Depends(get_db)) -> LaunchDetailResponse:
    """Return one launch from the local cache."""
    launch = get_launch(db, launch_id)
    if launch is None:
        raise HTTPException(status_code=404, detail="Launch not found.")
    return launch


@app.post("/api/v1/launches/sync", response_model=SyncResponse, tags=["launches"])
def sync_launches(
    x_sync_token: str | None = Header(default=None), db: Session = Depends(get_db)
) -> SyncResponse:
    """Refresh the local cache from the external launch provider."""
    sync_token = os.getenv("SYNC_TOKEN")
    if not sync_token:
        raise HTTPException(status_code=503, detail="HTTP sync is disabled. Use the scheduled job.")
    if x_sync_token is None or not secrets.compare_digest(x_sync_token, sync_token):
        raise HTTPException(status_code=401, detail="Invalid sync credentials.")
    try:
        launches = get_upcoming_launches(limit=100)
    except LaunchLibraryError as error:
        raise HTTPException(status_code=503, detail="Launch data is temporarily unavailable.") from error

    return SyncResponse(imported=upsert_launches(db, launches))
