import importlib.util
import io
import json
import unittest
from contextlib import redirect_stdout
from datetime import UTC, datetime, timedelta
from pathlib import Path

spec = importlib.util.spec_from_file_location(
    "production_checks", Path(__file__).parents[2] / "scripts/verify-production.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class ProductionChecks(unittest.TestCase):
    def setUp(self):
        self.output = io.StringIO()
        context = redirect_stdout(self.output)
        context.__enter__()
        self.addCleanup(context.__exit__, None, None, None)

    def fixture(self, feedback=422, private=401, old=False, empty_page=False):
        self.calls = []

        def fetch(url, data=None):
            self.calls.append((url, data))
            headers = {"Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow"}
            if url.endswith("/api/feedback"):
                return feedback, headers, b'{}'
            if "/api/admin/" in url or url.endswith("/admin/feedback"):
                return private, headers, b'{}'
            if url.endswith("/health"):
                return 200, headers, b'{"status":"ok"}'
            if url.endswith("/data-status"):
                return 200, headers, json.dumps({
                    "source": "Launch Library 2", "cached_launches": 123, "stale": old,
                    "last_updated_at": (datetime.now(UTC) - timedelta(hours=7 if old else 1)).isoformat(),
                }).encode()
            return 200, headers, b'' if empty_page else b'<main>NextRocketLaunch</main>'
        return fetch

    def test_healthy_checks_never_create_feedback_or_call_sync(self):
        self.assertTrue(module.checks(self.fixture(), freshness=True))
        mutations = [(url, data) for url, data in self.calls if data is not None]
        self.assertEqual(mutations, [(module.WEB + "/api/feedback", b"{}")])
        self.assertFalse(any("/sync" in url for url, _ in self.calls))

    def test_missing_feedback_configuration_is_a_failure(self):
        self.assertFalse(module.checks(self.fixture(feedback=503)))

    def test_exposed_or_disabled_admin_fails(self):
        for status in (200, 503):
            self.assertFalse(module.checks(self.fixture(private=status)))

    def test_empty_success_page_fails(self):
        self.assertFalse(module.checks(self.fixture(empty_page=True)))

    def test_stale_cache_alert_independent_of_deployment(self):
        self.assertTrue(module.checks(self.fixture(old=True)))
        self.assertFalse(module.checks(self.fixture(old=True), freshness=True))

    def test_future_and_naive_timestamp_are_rejected(self):
        now = datetime.now(UTC)
        for stamp in (now.replace(tzinfo=None), now + timedelta(hours=1)):
            with self.assertRaises(ValueError):
                module.validate_cache({"source": "Launch Library 2", "cached_launches": 1,
                                       "stale": False, "last_updated_at": stamp.isoformat()}, now)


if __name__ == "__main__":
    unittest.main()
