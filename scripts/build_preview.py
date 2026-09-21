#!/usr/bin/env python3
"""Create a self-contained local preview of the Research Hub."""

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
OUTPUT = ROOT / "research-hub-preview.html"


def main() -> None:
    html = (DOCS / "index.html").read_text(encoding="utf-8")
    css = (DOCS / "assets" / "style.css").read_text(encoding="utf-8")
    js = (DOCS / "assets" / "app.js").read_text(encoding="utf-8")
    data = (DOCS / "data" / "papers.json").read_text(encoding="utf-8").replace("</script", "<\\/script")
    html = html.replace('<link rel="stylesheet" href="assets/style.css">', f"<style>\n{css}\n</style>")
    html = html.replace(
        '<script src="assets/app.js" defer></script>',
        f'<script id="catalog-data" type="application/json">{data}</script>\n<script>\n{js}\n</script>',
    )
    OUTPUT.write_text(html, encoding="utf-8")
    print(OUTPUT)


if __name__ == "__main__":
    main()
