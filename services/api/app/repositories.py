from datetime import UTC, datetime

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.clients.launch_library import LaunchSummary
from app.models import Launch


def list_launches(
    db: Session,
    limit: int,
    query: str | None = None,
    agency: str | None = None,
    vehicle: str | None = None,
) -> list[Launch]:
    statement = select(Launch)

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

    statement = statement.order_by(Launch.net).limit(limit)
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
        launch.source_updated_at = datetime.now(UTC)

    db.commit()
    return len(launches)
