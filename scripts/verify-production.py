"""Bounded production checks. Never submits valid feedback or triggers LL2."""
import argparse
import json
import sys
import urllib.error
import urllib.request
from datetime import UTC, datetime, timedelta
from urllib.parse import urlsplit

WEB = "https://launch-tracker-beryl.vercel.app"
API = "https://launch-tracker-ie09.onrender.com"
MAX_BODY = 2 * 1024 * 1024


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
            raise ValueError("Response too large")
        return response.status, response.headers, body


def validate_cache(data, now, freshness=False):
    if data.get("source") != "Launch Library 2":
        raise ValueError("Unexpected source")
    count = data.get("cached_launches")
    if isinstance(count, bool) or not isinstance(count, int) or count < 1:
        raise ValueError("Empty or invalid launch cache")
    stamp = datetime.fromisoformat(data["last_updated_at"])
    if stamp.tzinfo is None or stamp > now + timedelta(minutes=5):
        raise ValueError("Invalid cache timestamp")
    if not isinstance(data.get("stale"), bool):
        raise TypeError("Missing freshness indicator")
    if freshness and (data["stale"] or now - stamp > timedelta(hours=6)):
        raise ValueError("Launch cache older than six hours")


def checks(fetch=request, freshness=False):
    failures = []

    def check(name, action):
        try:
            action()
            print("PASS " + name)
        except (ValueError, TypeError, KeyError, OSError, urllib.error.URLError):
            # Never print response bodies, exception text, headers or user data.
            print("FAIL " + name)
            failures.append(name)

    def page(path):
        status, _, body = fetch(WEB + path)
        if status != 200 or b"NextRocketLaunch" not in body or b"<main" not in body:
            raise ValueError("Page unavailable")

    def health():
        status, _, body = fetch(API + "/health")
        if status != 200 or json.loads(body).get("status") != "ok":
            raise ValueError("API unavailable")

    def cache():
        status, _, body = fetch(API + "/api/v1/data-status")
        if status != 200:
            raise ValueError("Database unavailable")
        validate_cache(json.loads(body), datetime.now(UTC), freshness)

    def private(url):
        status, headers, _ = fetch(url)
        if status != 401 or "no-store" not in headers.get("Cache-Control", ""):
            raise ValueError("Private endpoint exposed or unavailable")
        if "noindex" not in headers.get("X-Robots-Tag", ""):
            raise ValueError("Private endpoint indexable")

    def feedback():
        # No Idempotency-Key and an empty object: API validation cannot insert it.
        status, _, _ = fetch(WEB + "/api/feedback", data=b"{}")
        if status != 422:
            raise ValueError("Feedback configuration unavailable")

    for path in ("/", "/explore-space", "/admin/login"):
        check("page " + path, lambda path=path: page(path))
    check("API process", health)
    check("database/cache" + (" freshness" if freshness else ""), cache)
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
