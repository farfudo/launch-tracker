"""Refresh cached launches from a scheduled job or an operator command."""

import sys

from app.clients.launch_library import LaunchLibraryError, get_upcoming_launches
from app.db import SessionLocal
from app.sync_service import sync_cache


def main() -> None:
    try:
        with SessionLocal() as db:
            result = sync_cache(db, fetch_launches=get_upcoming_launches)
    except LaunchLibraryError as error:
        print(f"Sync failed: {error}", file=sys.stderr)
        if error.retry_after:
            print(f"Retry-After: {error.retry_after}", file=sys.stderr)
        raise SystemExit(1) from None
    if result.skipped:
        print(f"Sync skipped: {result.reason}.")
    else:
        print(f"Imported {result.imported} launches.")


if __name__ == "__main__":
    main()
