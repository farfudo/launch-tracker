from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.clients.launch_library import LaunchSummary
from app.models import Launch


def list_launches(db: Session, limit: int) -> list[Launch]:
    statement = select(Launch).order_by(Launch.net).limit(limit)
    return list(db.scalars(statement))


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
        launch.source_updated_at = datetime.now(UTC)

    db.commit()
    return len(launches)
