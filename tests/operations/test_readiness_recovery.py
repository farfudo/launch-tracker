"""Isolated readiness regressions. These tests never contact production."""
import contextlib
import importlib.util
import io
import json
from datetime import UTC, datetime, timedelta
from pathlib import Path
import unittest
from unittest.mock import patch
import urllib.error

spec = importlib.util.spec_from_file_location(
    "readiness", Path(__file__).parents[2] / "scripts/verify-production.py"
)
readiness = importlib.util.module_from_spec(spec)
spec.loader.exec_module(readiness)


def fixture(url, data=None):
    if url.endswith("/api/v1/data-status"):
        return 200, {}, json.dumps({
            "source": "Launch Library 2", "cached_launches": 100,
            "last_updated_at": datetime.now(UTC).isoformat(), "stale": False,
        }).encode()
    if url.endswith("/health"):
        return 200, {}, b'{"status":"ok"}'
    if url.endswith(("/api/admin/feedback", "/api/admin/session", "/admin/feedback")):
        return 401, {"Cache-Control": "no-store", "X-Robots-Tag": "noindex"}, b""
    if data is not None:
        return 422, {}, b""
    return 200, {}, b"<main>NextRocketLaunch</main>"


class ReadinessTests(unittest.TestCase):
    def run_checks(self, fetch):
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            result = readiness.checks(fetch=fetch, freshness=True)
        return result, output.getvalue()

    def test_stale_data_reports_reason_and_still_fails(self):
        def stale(url, data=None):
            if url.endswith("/api/v1/data-status"):
                return 200, {}, json.dumps({
                    "source": "Launch Library 2", "cached_launches": 100,
                    "last_updated_at": (datetime.now(UTC) - timedelta(hours=8)).isoformat(),
                    "stale": True,
                }).encode()
            return fixture(url, data)
        ok, output = self.run_checks(stale)
        self.assertFalse(ok)
        self.assertIn("FAIL database/cache freshness reason=cache_stale", output)
        self.assertIn("age_minutes=480", output)

    def test_one_transient_get_failure_can_recover(self):
        calls = []
        def fetch(url, data=None):
            calls.append((url, data))
            if url == readiness.WEB + "/" and calls.count((url, data)) == 1:
                raise TimeoutError("private diagnostic")
            return fixture(url, data)
        with patch.object(readiness.time, "sleep"):
            ok, output = self.run_checks(fetch)
        self.assertTrue(ok)
        self.assertEqual(calls.count((readiness.WEB + "/", None)), 2)
        self.assertIn("RETRY page / reason=timeout", output)
        self.assertNotIn("private diagnostic", output)

    def test_gateway_failure_retries_once_but_wrong_page_content_does_not(self):
        calls = []
        def fetch(url, data=None):
            calls.append((url, data))
            if url == readiness.WEB + "/":
                if calls.count((url, data)) == 1:
                    return 503, {}, b"private"
            if url == readiness.WEB + "/explore-space":
                return 200, {}, b"private"
            return fixture(url, data)
        with patch.object(readiness.time, "sleep"):
            ok, output = self.run_checks(fetch)
        self.assertFalse(ok)
        self.assertEqual(calls.count((readiness.WEB + "/", None)), 2)
        self.assertEqual(calls.count((readiness.WEB + "/explore-space", None)), 1)
        self.assertIn("RETRY page / reason=page_status http_status=503", output)
        self.assertIn("FAIL page /explore-space reason=page_content", output)

    def test_timeout_is_bounded_and_sanitized(self):
        calls = []
        def fetch(url, data=None):
            if url == readiness.WEB + "/":
                calls.append(url)
                raise urllib.error.URLError(TimeoutError("secret"))
            return fixture(url, data)
        with patch.object(readiness.time, "sleep"):
            ok, output = self.run_checks(fetch)
        self.assertFalse(ok)
        self.assertEqual(len(calls), 2)
        self.assertIn("FAIL page / reason=timeout", output)
        self.assertNotIn("secret", output)

    def test_authorization_failures_and_feedback_post_are_never_retried(self):
        calls = []
        def fetch(url, data=None):
            calls.append((url, data))
            if url.endswith("/api/admin/session"):
                return 200, {}, b"private"
            if data is not None:
                return 503, {}, b"private"
            return fixture(url, data)
        with patch.object(readiness.time, "sleep"):
            ok, output = self.run_checks(fetch)
        self.assertFalse(ok)
        self.assertEqual(calls.count((readiness.WEB + "/api/admin/session", None)), 1)
        self.assertEqual(calls.count((readiness.WEB + "/api/feedback", b"{}")), 1)
        self.assertIn("reason=private_status http_status=200", output)
        self.assertNotIn("RETRY private", output)
        self.assertNotIn("RETRY feedback", output)


if __name__ == "__main__":
    unittest.main()
