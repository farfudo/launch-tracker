#!/bin/sh
set -eu

alembic upgrade head
if ! python -m app.sync; then
    echo "WARNING: Launch sync failed; starting API with the existing cache. Retry sync later." >&2
fi
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
