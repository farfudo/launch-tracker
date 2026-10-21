from typing import Literal

from fastapi import Depends, FastAPI, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.clients.launch_library import (
    LaunchLibraryError,
    get_upcoming_launches,
)
from app.db import get_db
from app.repositories import list_launches as list_cached_launches
from app.repositories import upsert_launches
from app.schemas import LaunchResponse, SyncResponse

app = FastAPI(title="Launch Tracker API", version="0.1.0")


class HealthResponse(BaseModel):
    status: Literal["ok"]


@app.get("/health", response_model=HealthResponse, tags=["system"])
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.get("/api/v1/launches", response_model=list[LaunchResponse], tags=["launches"])
def list_launches(
    limit: int = Query(default=20, ge=1, le=100), db: Session = Depends(get_db)
) -> list[LaunchResponse]:
    """List launches stored in the local cache."""
    return list_cached_launches(db, limit)


@app.post("/api/v1/launches/sync", response_model=SyncResponse, tags=["launches"])
def sync_launches(db: Session = Depends(get_db)) -> SyncResponse:
    """Refresh the local cache from the external launch provider."""
    try:
        launches = get_upcoming_launches(limit=100)
    except LaunchLibraryError as error:
        raise HTTPException(status_code=503, detail="Launch data is temporarily unavailable.") from error

    return SyncResponse(imported=upsert_launches(db, launches))
