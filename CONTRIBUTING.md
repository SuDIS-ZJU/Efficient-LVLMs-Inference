# Contributing

Thank you for helping keep this collection accurate and useful.

## What belongs here

A contribution should directly improve the inference efficiency of a large vision-language model or provide a benchmark specifically useful for evaluating efficient LVLM inference. Relevant directions include:

- efficient vision encoders and modality adapters;
- frame, resolution, or visual-token reduction;
- sparse attention and KV-cache compression;
- attention reuse and speculative decoding;
- adaptive or efficient multimodal reasoning;
- efficiency-focused datasets, benchmarks, and system studies.

## Adding a paper

For a lightweight submission, open the [paper submission form](https://github.com/SuDIS-ZJU/Efficient-LVLMs-Inference/issues/new?template=add-paper.yml). To add a paper directly:

1. Place the paper at its primary intervention stage: Encoding, Prefilling, or Decoding.
2. Use the official paper or proceedings URL when available; otherwise use arXiv.
3. Link the official code repository or project page only when it is publicly available.
4. Keep the contribution summary to one concise sentence.
5. Use the published venue and year when accepted; otherwise use `arXiv YEAR`.
6. Add the paper’s catalog ID to `data/paper_metadata.json` with `added_on` set to the date it first joins this collection (`YYYY-MM-DD`). This is a catalog date, not the paper’s publication date. Run the build script to see the ID if it is missing. Keep this date when updating an existing entry; if renaming a title changes its ID, move the existing metadata to the new ID. The optional `added_in` field links to a full commit SHA when the original inclusion commit is known.

Use this row format:

```markdown
| [**Paper title**](paper-url) | Venue YEAR | [![GitHub](https://img.shields.io/badge/GitHub-black?logo=github)](code-url) | One-sentence contribution |
```

## Pull requests

- Avoid unrelated formatting changes.
- Check that the paper is not already listed under another stage.
- Explain why the selected category is the paper's primary intervention point.
- Verify that every new link resolves before submitting.
- Run `python scripts/build_catalog.py` to refresh the JSON, YAML, CSV, and BibTeX exports.
- Run `python scripts/build_catalog.py --check` before opening the pull request.
- Optionally run `python scripts/check_links.py` to inspect external link health.

## Generated catalog

The README is the human-edited catalog. `scripts/build_catalog.py` parses its paper tables, validates required fields and URLs, merges cross-listed papers, and updates the machine-readable files in `docs/data/`. Please do not edit generated files by hand.

`data/paper_metadata.json` stores first-inclusion dates independently of the generated exports. Existing entries were recovered from the first matching paper title in README Git history, using the introducing commit’s date and SHA. New additions must supply an `added_on` date; validation rejects missing or invalid dates so builds stay reproducible.

The Hub distinguishes a **Code** repository from a **Project page**, using the resource badge in the README table. A project homepage alone does not count as an open-source implementation. “Newest venue year” sorts by the listed venue/preprint year; “Recently added” sorts by the catalog inclusion date, with title order as the tie-breaker.

Single-paper BibTeX uses the same catalog reference as the full `.bib` export. These references contain the title, venue, year and URL; use the official publisher or arXiv export when you need complete author metadata.
