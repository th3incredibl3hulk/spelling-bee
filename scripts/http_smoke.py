#!/usr/bin/env python3
"""Smoke-test a running spelling practice server."""

from __future__ import annotations

import json
import sys
import urllib.request


def request(base_url: str, path: str, payload: dict | None = None) -> dict:
    data = None
    method = "GET"
    headers = {"Content-Type": "application/json"}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        method = "POST"
    req = urllib.request.Request(f"{base_url}{path}", data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=5) as response:
        return json.loads(response.read().decode("utf-8"))


def main() -> None:
    base_url = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "http://127.0.0.1:8787"
    health = request(base_url, "/api/health")
    if not health.get("ok"):
        raise SystemExit("health check failed")
    bootstrap = request(base_url, "/api/bootstrap")
    child = bootstrap["children"][0]
    session = request(
        base_url,
        "/api/sessions",
        {"child_id": child["id"], "grade_level": 2, "theme_id": "storybook", "mode": "practice"},
    )
    first_word = session["words"][0]
    hint = request(
        base_url,
        f"/api/sessions/{session['id']}/hint",
        {"session_word_id": first_word["session_word_id"]},
    )
    if hint["hints_used"] != 1:
        raise SystemExit("hint endpoint failed")
    abandoned = request(base_url, f"/api/sessions/{session['id']}/abandon", {})
    if not abandoned.get("abandoned"):
        raise SystemExit("abandon endpoint failed")
    dashboard = request(base_url, "/api/dashboard")
    print(
        json.dumps(
            {
                "health": health["ok"],
                "children": len(bootstrap["children"]),
                "themes": len(bootstrap["themes"]),
                "session_words": len(session["words"]),
                "dashboard_children": len(dashboard["children"]),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
