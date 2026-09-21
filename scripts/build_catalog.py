#!/usr/bin/env python3
"""Build machine-readable exports for the Efficient-LVLMs paper catalog."""

from __future__ import annotations

import argparse
import csv
import io
import json
import re
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
README = ROOT / "README.md"
OUTPUTS = {
    "json": ROOT / "docs" / "data" / "papers.json",
    "yaml": ROOT / "docs" / "data" / "papers.yaml",
    "csv": ROOT / "docs" / "data" / "papers.csv",
    "bib": ROOT / "docs" / "data" / "papers.bib",
}

PAPER_CELL = re.compile(r"^\[\*\*(.+?)\*\*\]\((https?://[^)]+)\)$")
URL = re.compile(r"https?://[^)\s]+")
YEAR = re.compile(r"\b(20\d{2})\b")
UPDATED = re.compile(r"\*Last Updated:\s*([^*]+)\*")
STAGES = {"Encoding Stage": "Encoding", "Prefilling Stage": "Prefilling", "Decoding Stage": "Decoding"}


def plain_heading(text: str) -> str:
    return re.sub(r"^[^A-Za-z0-9]+", "", text).strip()


def slugify(text: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return value or "paper"


def valid_url(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def parse_catalog(markdown: str) -> dict:
    stage = None
    category = None
    subcategory = None
    entries: list[dict] = []

    for raw_line in markdown.splitlines():
        line = raw_line.strip()
        if line.startswith("## ") and not line.startswith("### "):
            heading = plain_heading(line[3:])
            stage = STAGES.get(heading)
            category = None
            subcategory = None
            continue
        if line.startswith("### ") and stage:
            category = plain_heading(line[4:])
            subcategory = None
            continue
        if line.startswith("#### ") and stage:
            subcategory = plain_heading(line[5:])
            continue
        if not stage or not category or not line.startswith("|"):
            continue

        cells = [cell.strip() for cell in line.strip("|").split("|")]
        if len(cells) != 4:
            continue
        paper_match = PAPER_CELL.match(cells[0])
        if not paper_match:
            continue

        title, paper_url = paper_match.groups()
        venue = cells[1]
        year_match = YEAR.search(venue)
        code_urls = [candidate for candidate in URL.findall(cells[2]) if "img.shields.io" not in candidate]
        code_url = code_urls[-1] if code_urls else None
        code_type = "Project page" if "Project-Page" in cells[2] else ("Code" if code_url else None)
        entries.append(
            {
                "title": title,
                "paper_url": paper_url,
                "venue": venue,
                "year": int(year_match.group(1)) if year_match else None,
                "code_url": code_url,
                "code_type": code_type,
                "contribution": cells[3],
                "placement": {
                    "stage": stage,
                    "category": category,
                    "subcategory": subcategory,
                },
            }
        )

    merged: dict[str, dict] = {}
    for entry in entries:
        key = re.sub(r"\W+", "", entry["title"].casefold())
        if key not in merged:
            merged[key] = {
                key_: value for key_, value in entry.items() if key_ != "placement"
            }
            merged[key]["placements"] = [entry["placement"]]
        elif entry["placement"] not in merged[key]["placements"]:
            merged[key]["placements"].append(entry["placement"])

    used_ids: Counter[str] = Counter()
    papers = []
    for paper in merged.values():
        base_id = slugify(paper["title"])
        used_ids[base_id] += 1
        paper["id"] = base_id if used_ids[base_id] == 1 else f"{base_id}-{used_ids[base_id]}"
        paper["stages"] = sorted({item["stage"] for item in paper["placements"]})
        paper["categories"] = sorted({item["category"] for item in paper["placements"]})
        papers.append(paper)

    papers.sort(key=lambda item: (-(item["year"] or 0), item["title"].casefold()))
    updated_match = UPDATED.search(markdown)
    last_updated = updated_match.group(1).strip() if updated_match else None
    stage_counts = Counter(stage_ for paper in papers for stage_ in paper["stages"])
    return {
        "schema_version": 1,
        "last_updated": last_updated,
        "source": "README.md",
        "repository": "https://github.com/SuDIS-ZJU/Efficient-LVLMs-Inference",
        "stats": {
            "papers": len(papers),
            "with_code": sum(bool(paper["code_url"]) for paper in papers),
            "stages": dict(sorted(stage_counts.items())),
        },
        "papers": papers,
    }


def validate(catalog: dict) -> list[str]:
    errors = []
    ids = Counter(paper["id"] for paper in catalog["papers"])
    for paper_id, count in ids.items():
        if count > 1:
            errors.append(f"duplicate id: {paper_id}")
    for paper in catalog["papers"]:
        label = paper["title"]
        for field in ("title", "paper_url", "venue", "contribution"):
            if not paper.get(field):
                errors.append(f"{label}: missing {field}")
        for field in ("paper_url", "code_url"):
            if paper.get(field) and not valid_url(paper[field]):
                errors.append(f"{label}: invalid {field}: {paper[field]}")
        if not paper["placements"]:
            errors.append(f"{label}: missing taxonomy placement")
    return errors


def yaml_scalar(value: object) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, int):
        return str(value)
    return json.dumps(value, ensure_ascii=False)


def to_yaml(catalog: dict) -> str:
    lines = [
        f"schema_version: {catalog['schema_version']}",
        f"last_updated: {yaml_scalar(catalog['last_updated'])}",
        f"source: {yaml_scalar(catalog['source'])}",
        f"repository: {yaml_scalar(catalog['repository'])}",
        "papers:",
    ]
    for paper in catalog["papers"]:
        lines.extend(
            [
                f"  - id: {yaml_scalar(paper['id'])}",
                f"    title: {yaml_scalar(paper['title'])}",
                f"    paper_url: {yaml_scalar(paper['paper_url'])}",
                f"    venue: {yaml_scalar(paper['venue'])}",
                f"    year: {yaml_scalar(paper['year'])}",
                f"    code_url: {yaml_scalar(paper['code_url'])}",
                f"    code_type: {yaml_scalar(paper['code_type'])}",
                f"    contribution: {yaml_scalar(paper['contribution'])}",
                "    placements:",
            ]
        )
        for placement in paper["placements"]:
            lines.extend(
                [
                    f"      - stage: {yaml_scalar(placement['stage'])}",
                    f"        category: {yaml_scalar(placement['category'])}",
                    f"        subcategory: {yaml_scalar(placement['subcategory'])}",
                ]
            )
    return "\n".join(lines) + "\n"


def to_csv(catalog: dict) -> str:
    output = io.StringIO()
    fields = ["id", "title", "paper_url", "venue", "year", "code_url", "stages", "categories", "contribution"]
    writer = csv.DictWriter(output, fieldnames=fields, lineterminator="\n")
    writer.writeheader()
    for paper in catalog["papers"]:
        writer.writerow(
            {
                "id": paper["id"],
                "title": paper["title"],
                "paper_url": paper["paper_url"],
                "venue": paper["venue"],
                "year": paper["year"],
                "code_url": paper["code_url"] or "",
                "stages": "; ".join(paper["stages"]),
                "categories": "; ".join(paper["categories"]),
                "contribution": paper["contribution"],
            }
        )
    return output.getvalue()


def bib_escape(value: str) -> str:
    return value.replace("&", r"\&").replace("%", r"\%").replace("_", r"\_")


def to_bibtex(catalog: dict) -> str:
    records = []
    for paper in catalog["papers"]:
        key = re.sub(r"[^a-z0-9]", "", paper["id"])[:42] + str(paper["year"] or "")
        records.append(
            "\n".join(
                [
                    f"@misc{{{key},",
                    f"  title = {{{bib_escape(paper['title'])}}},",
                    f"  year = {{{paper['year'] or ''}}},",
                    f"  howpublished = {{{bib_escape(paper['venue'])}}},",
                    f"  url = {{{paper['paper_url']}}}",
                    "}",
                ]
            )
        )
    return "\n\n".join(records) + "\n"


def rendered_outputs(catalog: dict) -> dict[str, str]:
    return {
        "json": json.dumps(catalog, ensure_ascii=False, indent=2) + "\n",
        "yaml": to_yaml(catalog),
        "csv": to_csv(catalog),
        "bib": to_bibtex(catalog),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="fail when committed exports are stale")
    args = parser.parse_args()

    catalog = parse_catalog(README.read_text(encoding="utf-8"))
    errors = validate(catalog)
    if errors:
        print("Catalog validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    outputs = rendered_outputs(catalog)
    if args.check:
        stale = []
        for name, path in OUTPUTS.items():
            if not path.exists() or path.read_text(encoding="utf-8") != outputs[name]:
                stale.append(str(path.relative_to(ROOT)))
        if stale:
            print("Generated exports are stale. Run: python scripts/build_catalog.py", file=sys.stderr)
            for path in stale:
                print(f"- {path}", file=sys.stderr)
            return 1
    else:
        for name, path in OUTPUTS.items():
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(outputs[name], encoding="utf-8")

    stats = catalog["stats"]
    print(f"Validated {stats['papers']} unique papers ({stats['with_code']} with code/project links).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
