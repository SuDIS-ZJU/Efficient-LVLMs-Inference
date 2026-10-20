"""Regression checks for catalog dates, resource types, and references."""
import copy
import json
import unittest

from build_catalog import ROOT, bibtex_record, enrich_catalog, parse_catalog, to_bibtex


class CatalogTests(unittest.TestCase):
    def setUp(self):
        self.catalog = parse_catalog((ROOT / 'README.md').read_text())
        self.metadata = json.loads((ROOT / 'data/paper_metadata.json').read_text())

    def test_resource_counts_distinguish_code_and_project_pages(self):
        stats = self.catalog['stats']
        self.assertEqual(stats['with_resources'], stats['with_code'] + stats['with_project_page'])
        self.assertTrue(all(p['code_url'] for p in self.catalog['papers'] if p['code_type']))
        self.assertTrue(any(p['code_type'] == 'Project page' for p in self.catalog['papers']))

    def test_missing_or_invalid_dates_are_rejected(self):
        key = self.catalog['papers'][0]['id']
        for value in (None, '2026-02-30', '2026-1-1', '20261020'):
            metadata = copy.deepcopy(self.metadata)
            metadata['papers'][key]['added_on'] = value
            self.assertTrue(enrich_catalog(copy.deepcopy(self.catalog), metadata), value)
        metadata = copy.deepcopy(self.metadata)
        del metadata['papers'][key]
        self.assertTrue(enrich_catalog(self.catalog, metadata))

    def test_malformed_metadata_and_commit_provenance_are_rejected(self):
        self.assertTrue(enrich_catalog(self.catalog, []))
        key = self.catalog["papers"][0]["id"]
        for value in ("abc", 123):
            metadata = copy.deepcopy(self.metadata)
            metadata["papers"][key]["added_in"] = value
            self.assertTrue(enrich_catalog(copy.deepcopy(self.catalog), metadata))

    def test_rebuild_preserves_inclusion_dates_and_single_paper_references(self):
        self.assertEqual(enrich_catalog(self.catalog, self.metadata), [])
        exported = to_bibtex(self.catalog)
        for paper in self.catalog['papers']:
            self.assertEqual(paper['added_on'], self.metadata['papers'][paper['id']]['added_on'])
            self.assertEqual(paper['bibtex'], bibtex_record(paper))
            self.assertIn(paper['bibtex'], exported)
        self.assertGreater(len({p['added_on'] for p in self.catalog['papers']}), 1)

    def test_cross_listed_placements_survive_export(self):
        self.assertTrue(any(len(p['placements']) > 1 for p in self.catalog['papers']))
        for paper in self.catalog['papers']:
            self.assertEqual(set(paper['stages']), {p['stage'] for p in paper['placements']})


if __name__ == '__main__':
    unittest.main()
