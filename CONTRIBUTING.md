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
