"""Refresh cached launches from a scheduled job or an operator command."""

from app.clients.launch_library import get_upcoming_launches
from app.db import SessionLocal
from app.repositories import upsert_launches


def main() -> None:
    launches = get_upcoming_launches(limit=100)
    with SessionLocal() as db:
        imported = upsert_launches(db, launches)
    print(f"Imported {imported} launches.")


if __name__ == "__main__":
    main()
