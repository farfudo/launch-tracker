"""Refresh cached launches from a scheduled job or an operator command."""

import sys

from app.clients.launch_library import LaunchLibraryError, get_upcoming_launches
from app.db import SessionLocal
from app.repositories import upsert_launches


def main() -> None:
    try:
        launches = get_upcoming_launches(limit=100)
    except LaunchLibraryError as error:
        print(f"Sync failed: {error}", file=sys.stderr)
        if error.retry_after:
            print(f"Retry-After: {error.retry_after}", file=sys.stderr)
        raise SystemExit(1) from None
    with SessionLocal() as db:
        imported = upsert_launches(db, launches)
    print(f"Imported {imported} launches.")


if __name__ == "__main__":
    main()
