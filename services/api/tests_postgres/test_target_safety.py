import pytest

from tests_postgres.conftest import validate_test_url


@pytest.mark.parametrize("url", [
    "postgresql+psycopg://launch_test:test@neon.example/launch_tracker_test",
    "postgresql+psycopg://launch_test:test@127.0.0.1/production",
    "postgresql+psycopg://admin:test@127.0.0.1/launch_tracker_test",
    "postgresql+psycopg://launch_test:test@127.0.0.1/launch_tracker_test?host=remote.example",
    "postgresql://launch_test:test@127.0.0.1/launch_tracker_test",
    "sqlite://",
])
def test_integration_target_rejects_non_disposable_locations(url):
    with pytest.raises(ValueError):
        validate_test_url(url)


def test_integration_target_accepts_only_dedicated_loopback_database():
    url = "postgresql+psycopg://launch_test:test@127.0.0.1:55441/launch_tracker_test"
    assert validate_test_url(url) == url
