from unittest.mock import MagicMock, Mock

import pytest

from app.clients.launch_library import LaunchLibraryError
from app.sync import main


def test_cli_prints_safe_category_not_raw_exception_or_retry_header(monkeypatch, capsys):
    monkeypatch.setattr("app.sync.SessionLocal", MagicMock())
    monkeypatch.setattr("app.sync.sync_cache", Mock(side_effect=LaunchLibraryError(
        "private response body", retry_after="private header", category="http_error",
        http_status=503,
    )))
    with pytest.raises(SystemExit) as error:
        main()
    assert error.value.code == 1
    output = capsys.readouterr().err
    assert "category=http_error http_status=503" in output
    assert "private" not in output
