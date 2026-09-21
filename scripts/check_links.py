#!/usr/bin/env python3
"""Check external links in README.md with conservative false-positive handling."""

from __future__ import annotations

import argparse
import re
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
URL = re.compile(r"https?://[^\s)>]+")
IGNORED_HOSTS = {"img.shields.io"}
SOFT_STATUSES = {401, 403, 405, 406, 409, 418, 429}


def check(url: str) -> tuple[str, str, int | None]:
    headers = {"User-Agent": "Efficient-LVLMs-Inference link checker"}
    request = Request(url, headers=headers, method="HEAD")
    try:
        with urlopen(request, timeout=8) as response:
            return url, "ok", response.status
    except HTTPError as error:
        if error.code in SOFT_STATUSES:
            return url, "soft", error.code
        try:
            fallback = Request(url, headers={**headers, "Range": "bytes=0-0"}, method="GET")
            with urlopen(fallback, timeout=8) as response:
                return url, "ok", response.status
        except HTTPError as fallback_error:
            if fallback_error.code in SOFT_STATUSES:
                return url, "soft", fallback_error.code
            return url, "broken", fallback_error.code
        except (URLError, TimeoutError, OSError):
            return url, "soft", None
    except (URLError, TimeoutError, OSError):
        return url, "soft", None


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--strict", action="store_true", help="return a failing exit code for confirmed broken links")
    args = parser.parse_args()

    text = (ROOT / "README.md").read_text(encoding="utf-8")
    urls = sorted({item.rstrip(".,};\"") for item in URL.findall(text)})
    urls = [url for url in urls if not any(host in url for host in IGNORED_HOSTS)]
    results = []
    with ThreadPoolExecutor(max_workers=24) as executor:
        futures = [executor.submit(check, url) for url in urls]
        for future in as_completed(futures):
            results.append(future.result())

    broken = sorted(item for item in results if item[1] == "broken")
    soft = sorted(item for item in results if item[1] == "soft")
    print(f"Checked {len(urls)} external links: {len(broken)} broken, {len(soft)} inconclusive.")
    for url, _, status in broken:
        print(f"BROKEN {status or 'network'} {url}")
    for url, _, status in soft:
        print(f"WARN   {status or 'network'} {url}")
    return 1 if args.strict and broken else 0


if __name__ == "__main__":
    raise SystemExit(main())
