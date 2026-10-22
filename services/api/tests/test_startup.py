import os
import subprocess
from pathlib import Path

import pytest


@pytest.mark.parametrize(
    ("migration_status", "expected_status", "server_started"),
    [(0, 0, True), (1, 1, False)],
)
def test_startup_requires_migrations_and_never_syncs(
    tmp_path, migration_status, expected_status, server_started
):
    for name, body in {
        "alembic": f"exit {migration_status}",
        "python": 'echo "unexpected sync" >&2; exit 99',
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
    assert "unexpected sync" not in result.stderr
