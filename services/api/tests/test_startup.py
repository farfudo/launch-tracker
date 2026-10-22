import os
import subprocess
from pathlib import Path

import pytest


@pytest.mark.parametrize(
    ("migration_status", "sync_status", "expected_status", "server_started"),
    [(0, 0, 0, True), (0, 1, 0, True), (1, 0, 1, False)],
)
def test_startup_preserves_migration_gate_but_tolerates_sync_failure(
    tmp_path, migration_status, sync_status, expected_status, server_started
):
    for name, body in {
        "alembic": f"exit {migration_status}",
        "python": f"exit {sync_status}",
        "uvicorn": 'echo "server started on $*"',
    }.items():
        executable = tmp_path / name
        executable.write_text(f"#!/bin/sh\n{body}\n")
        executable.chmod(0o755)

    script = Path(__file__).resolve().parents[1] / "start.sh"
    result = subprocess.run(
        ["/bin/sh", str(script)],
        env={**os.environ, "PATH": str(tmp_path), "PORT": "10000"},
        capture_output=True,
        text=True,
        check=False,
    )

    assert result.returncode == expected_status
    assert ("server started" in result.stdout) is server_started
    if server_started:
        assert "--port 10000" in result.stdout
    if migration_status == 0 and sync_status != 0:
        assert "WARNING" in result.stderr
