import json
from pathlib import Path

import pytest
from sqlalchemy import select

from app.clients.launch_library import LaunchSummary, parse_launch
from app.models import Launch
from app.repositories import upsert_launches
from app.schemas import LaunchResponse

CATALOGUE = json.loads((Path(__file__).parent / "fixtures/net_precisions.json").read_text())


@pytest.mark.parametrize("precision", CATALOGUE)
def test_official_precision_round_trip(precision, db_session):
    summary = parse_launch({"id": "precision", "name": "Mission", "net": "2026-10-27T00:00:00Z",
                            "status": {"name": "Go"}, "net_precision": precision})
    assert summary.net_precision.model_dump() == precision
    upsert_launches(db_session, [summary])
    response = LaunchResponse.model_validate(db_session.scalar(select(Launch)))
    assert response.net_precision.model_dump() == precision


@pytest.mark.parametrize("precision", [None, {}, {"id": True}, {"id": "0"}, "Second"])
def test_absent_or_malformed_precision_remains_unknown(precision):
    summary = parse_launch({"id": "unknown", "name": "Legacy", "net": "2000-01-01T00:00:00Z",
                            "net_precision": precision})
    assert summary.net_precision is None


def test_legacy_unknown_and_future_id_are_not_inferred(db_session):
    old = LaunchSummary(id="old", name="Old", status="Go", net="2000-01-01T00:00:00Z")
    upsert_launches(db_session, [old])
    assert LaunchResponse.model_validate(db_session.get(Launch, "old")).net_precision is None
    future = parse_launch({"id": "future", "name": "Future", "net": "2099-01-01T00:00:00Z",
                           "net_precision": {"id": 99, "name": "New precision"}})
    upsert_launches(db_session, [future])
    assert db_session.get(Launch, "future").net_precision["id"] == 99
