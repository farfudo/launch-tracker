"""Bounded production checks. Never submits valid feedback or triggers LL2."""
import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from datetime import UTC, datetime, timedelta
from urllib.parse import urlsplit

WEB = "https://launch-tracker-beryl.vercel.app"
API = "https://launch-tracker-ie09.onrender.com"
MAX_BODY = 2 * 1024 * 1024


class CheckFailure(ValueError):
    """Only explicitly supplied diagnostic fields may reach the log."""

    def __init__(self, code, *, status=None, age_minutes=None):
        self.code = code
        self.status = status
        self.age_minutes = age_minutes
        super().__init__(code)

    def diagnostic(self):
        fields = [f"reason={self.code}"]
        if self.status is not None:
            fields.append(f"http_status={self.status}")
        if self.age_minutes is not None:
            fields.append(f"age_minutes={self.age_minutes}")
        return " ".join(fields)


def require_status(actual, expected, code):
    if actual != expected:
        raise CheckFailure(code, status=actual)


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def request(url, data=None):
    headers = {"User-Agent": "NextRocketLaunch-readiness/1", "Accept": "application/json"}
    if data is not None:
        headers.update({"Content-Type": "application/json", "Origin": WEB})
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        response = urllib.request.build_opener(NoRedirect).open(req, timeout=35)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        body = response.read(MAX_BODY + 1)
        if len(body) > MAX_BODY:
            raise CheckFailure("response_too_large")
        return response.status, response.headers, body


def validate_cache(data, now, freshness=False):
    if data.get("source") != "Launch Library 2":
        raise CheckFailure("cache_source")
    count = data.get("cached_launches")
    if isinstance(count, bool) or not isinstance(count, int) or count < 1:
        raise CheckFailure("cache_empty_or_invalid")
    stamp = datetime.fromisoformat(data["last_updated_at"])
    if stamp.tzinfo is None or stamp > now + timedelta(minutes=5):
        raise CheckFailure("cache_timestamp")
    if not isinstance(data.get("stale"), bool):
        raise CheckFailure("cache_freshness_missing")
    if freshness and (data["stale"] or now - stamp > timedelta(hours=6)):
        raise CheckFailure("cache_stale", age_minutes=int((now - stamp).total_seconds() // 60))


def checks(fetch=request, freshness=False):
    failures = []

    def check(name, action, *, retry_read=False):
        for attempt in range(2 if retry_read else 1):
            try:
                action()
                print("PASS " + name)
                return
            except (ValueError, TypeError, KeyError, OSError, urllib.error.URLError) as error:
                # Classify known failures; never expose arbitrary exception text or bodies.
                if isinstance(error, CheckFailure):
                    diagnostic = error.diagnostic()
                    transient = error.status in (502, 503, 504)
                elif isinstance(error, TimeoutError) or (
                    isinstance(error, urllib.error.URLError)
                    and isinstance(error.reason, TimeoutError)
                ):
                    diagnostic, transient = "reason=timeout", True
                elif isinstance(error, OSError):
                    diagnostic, transient = "reason=transport", True
                else:
                    diagnostic, transient = "reason=invalid_response", False
                if retry_read and attempt == 0 and transient:
                    print(f"RETRY {name} {diagnostic}")
                    time.sleep(3)
                    continue
                print(f"FAIL {name} {diagnostic}")
                failures.append(name)
                return

    def page(path):
        status, _, body = fetch(WEB + path)
        require_status(status, 200, "page_status")
        if b"NextRocketLaunch" not in body or b"<main" not in body:
            raise CheckFailure("page_content")

    def health():
        status, _, body = fetch(API + "/health")
        require_status(status, 200, "api_status")
        if json.loads(body).get("status") != "ok":
            raise CheckFailure("api_health")

    def cache():
        status, _, body = fetch(API + "/api/v1/data-status")
        require_status(status, 200, "cache_status")
        validate_cache(json.loads(body), datetime.now(UTC), freshness)

    def private(url):
        status, headers, _ = fetch(url)
        require_status(status, 401, "private_status")
        if "no-store" not in headers.get("Cache-Control", ""):
            raise CheckFailure("private_cache_control")
        if "noindex" not in headers.get("X-Robots-Tag", ""):
            raise CheckFailure("private_indexing")

    def feedback():
        # No Idempotency-Key and an empty object: API validation cannot insert it.
        status, _, _ = fetch(WEB + "/api/feedback", data=b"{}")
        require_status(status, 422, "feedback_status")

    for path in ("/", "/explore-space", "/admin/login"):
        check("page " + path, lambda path=path: page(path), retry_read=True)
    check("API process", health, retry_read=True)
    check("database/cache" + (" freshness" if freshness else ""), cache, retry_read=True)
    for url in (WEB + "/api/admin/feedback", WEB + "/api/admin/session", API + "/admin/feedback"):
        check("private " + urlsplit(url).path + " @ " + urlsplit(url).hostname,
              lambda url=url: private(url))
    check("feedback validation without insertion", feedback)
    return not failures


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--freshness", action="store_true", help="Fail on cache older than 6h")
    args = parser.parse_args()
    sys.exit(0 if checks(freshness=args.freshness) else 1)
