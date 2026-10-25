from datetime import UTC, datetime
from typing import Literal

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.clients.launch_library import LaunchSummary
from app.models import Launch
from app.schemas import DataStatusResponse

STATUS_GROUPS = {
    "go": ["Go", "Go for Launch"],
    "tbc": ["TBC", "To Be Confirmed"],
    "tbd": ["TBD", "To Be Determined"],
    "success": ["Success", "Launch Successful"],
    "hold": ["Hold"],
    "failure": ["Failure", "Launch Failure"],
    "partial": ["Partial Failure", "Launch was a Partial Failure"],
    "inflight": ["In Flight", "Launch in Flight"],
}


def get_data_status(db: Session) -> DataStatusResponse:
    count, last_updated = db.execute(
        select(func.count(Launch.id), func.max(Launch.source_updated_at))
    ).one()
    if last_updated is not None and last_updated.tzinfo is None:
        last_updated = last_updated.replace(tzinfo=UTC)
    stale = last_updated is None or (datetime.now(UTC) - last_updated).total_seconds() > 21600
    return DataStatusResponse(
        cached_launches=count, last_updated_at=last_updated, stale=stale
    )


def list_launches(
    db: Session,
    limit: int,
    query: str | None = None,
    agency: str | None = None,
    vehicle: str | None = None,
    period: Literal["all", "upcoming", "past"] = "all",
    now: datetime | None = None,
    status: str | None = None,
) -> list[Launch]:
    statement = select(Launch)
    reference = now or datetime.now(UTC)
    if period == "upcoming":
        statement = statement.where(Launch.net >= reference)
    elif period == "past":
        statement = statement.where(Launch.net < reference)

    if query:
        search = f"%{query.strip()}%"
        statement = statement.where(
            or_(
                Launch.name.ilike(search),
                Launch.agency.ilike(search),
                Launch.vehicle.ilike(search),
            )
        )
    if agency:
        statement = statement.where(Launch.agency == agency)
    if vehicle:
        statement = statement.where(Launch.vehicle == vehicle)
    if status:
        statement = statement.where(Launch.status.in_(STATUS_GROUPS.get(status, [])))

    ordering = Launch.net.desc() if period == "past" else Launch.net.asc()
    statement = statement.order_by(ordering, Launch.id).limit(limit)
    return list(db.scalars(statement))


def get_launch(db: Session, launch_id: str) -> Launch | None:
    return db.get(Launch, launch_id)


def get_filter_options(db: Session) -> tuple[list[str], list[str]]:
    agencies = list(
        db.scalars(
            select(Launch.agency)
            .where(Launch.agency.is_not(None))
            .distinct()
            .order_by(Launch.agency)
        )
    )
    vehicles = list(
        db.scalars(
            select(Launch.vehicle)
            .where(Launch.vehicle.is_not(None))
            .distinct()
            .order_by(Launch.vehicle)
        )
    )
    return agencies, vehicles


def upsert_launches(db: Session, launches: list[LaunchSummary]) -> int:
    for summary in launches:
        launch = db.get(Launch, summary.id)
        if launch is None:
            launch = Launch(id=summary.id)
            db.add(launch)

        launch.name = summary.name
        launch.status = summary.status
        launch.net = summary.net
        launch.agency = summary.agency
        launch.vehicle = summary.vehicle
        launch.source_url = summary.source_url
        launch.mission_name = summary.mission_name
        launch.mission_description = summary.mission_description
        launch.pad_name = summary.pad_name
        launch.location_name = summary.location_name
        launch.launch_timezone = summary.launch_timezone
        launch.window_start = summary.window_start
        launch.window_end = summary.window_end
        launch.image_url = summary.image_url
        launch.image_credit = summary.image_credit
        launch.image_license = summary.image_license
        launch.image_license_url = summary.image_license_url
        launch.image_kind = summary.image_kind
        launch.image_title = summary.image_title
        launch.streams = summary.streams
        launch.mission_links = summary.mission_links
        launch.source_updated_at = datetime.now(UTC)

    db.commit()
    return len(launches)
