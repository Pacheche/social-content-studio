"""File-level regression cases. All artifacts stay in a temporary directory."""
import json
import subprocess
import sys
import tempfile
from pathlib import Path
import unittest

from PIL import Image
from audit_exports import audit_exports


class ExportAuditTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='social-skill-test-')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.contract = {'version': 1, 'canvas': {'width': 4, 'height': 5},
                         'export': {'width': 8, 'height': 10}, 'files': ['Slide 1.png']}
        Image.new('RGB', (8, 10), '#1f6a4c').save(self.root / 'Slide 1.png')

    def audit(self):
        return audit_exports(self.root, self.contract)

    def test_valid_keeps_visual_pending(self):
        report = self.audit()
        self.assertEqual(report['technical_status'], 'passed')
        self.assertEqual(report['files'][0]['visual_review'], 'pending')

    def test_real_three_four_mismatch(self):
        self.contract['canvas'] = {'width': 1080, 'height': 1350}
        self.contract['export'] = {'width': 2160, 'height': 2700}
        Image.new('RGB', (1536, 2048)).save(self.root / 'Slide 1.png')
        self.assertEqual(self.audit()['technical_status'], 'failed')

    def test_same_ratio_wrong_resolution(self):
        Image.new('RGB', (4, 5)).save(self.root / 'Slide 1.png')
        self.assertEqual(self.audit()['technical_status'], 'failed')

    def test_missing(self):
        self.contract['files'].append('Slide 2.png')
        self.assertIn('Missing PNG: Slide 2.png', self.audit()['errors'])

    def test_corrupt(self):
        (self.root / 'Slide 1.png').write_bytes(b'\x89PNG\r\n\x1a\ntruncated')
        self.assertEqual(self.audit()['technical_status'], 'failed')

    def test_jpeg_named_png(self):
        Image.new('RGB', (8, 10)).save(self.root / 'Slide 1.png', format='JPEG')
        self.assertIn('not PNG', self.audit()['errors'][0])

    def test_auxiliary_declared(self):
        Image.new('RGB', (90, 30)).save(self.root / 'preview.png')
        self.assertEqual(self.audit()['technical_status'], 'failed')
        self.contract['auxiliary_pngs'] = ['preview.png']
        self.assertEqual(self.audit()['technical_status'], 'passed')

    def test_duplicate(self):
        self.contract['files'].append('slide 1.png')
        with self.assertRaises(ValueError): self.audit()

    def test_path_escape(self):
        for name in ('../outside.png', 'C:\\outside.png', '/outside.png'):
            with self.subTest(name=name):
                self.contract['files'] = [name]
                with self.assertRaises(ValueError): self.audit()

    def test_contract_ratio_mismatch(self):
        self.contract['canvas']['height'] = 6
        with self.assertRaises(ValueError): self.audit()

    def test_invalid_dimensions(self):
        for value in (0, -1, 2.5, True, '8'):
            with self.subTest(value=value):
                self.contract['export']['width'] = value
                with self.assertRaises(ValueError): self.audit()

    def test_hash_changes_after_visual_edit(self):
        before = self.audit()['files'][0]['sha256']
        Image.new('RGB', (8, 10), '#ffcc99').save(self.root / 'Slide 1.png')
        after = self.audit()
        self.assertNotEqual(before, after['files'][0]['sha256'])
        self.assertEqual(after['visual_review'], 'pending')

    def test_error_screenshot_not_visually_certified(self):
        Image.new('RGB', (8, 10), 'white').save(self.root / 'Slide 1.png')
        report = self.audit()
        self.assertEqual(report['technical_status'], 'passed')
        self.assertEqual(report['visual_review'], 'pending')

    def test_cli_writes_report_and_returns_failure_for_bad_export(self):
        contract_path = self.root / 'contract.json'
        report_path = self.root / 'report.json'
        contract_path.write_text(json.dumps(self.contract), encoding='utf-8')
        command = [sys.executable, str(Path(__file__).with_name('audit_exports.py')),
                   str(self.root), '--contract', str(contract_path), '--report', str(report_path)]
        good = subprocess.run(command, capture_output=True, text=True)
        self.assertEqual(good.returncode, 0, good.stderr)
        self.assertEqual(json.loads(report_path.read_text())['visual_review'], 'pending')
        Image.new('RGB', (3, 4)).save(self.root / 'Slide 1.png')
        bad = subprocess.run(command, capture_output=True, text=True)
        self.assertEqual(bad.returncode, 1, bad.stderr)
        self.assertEqual(json.loads(report_path.read_text())['technical_status'], 'failed')

    def test_cli_cannot_overwrite_contract_or_image(self):
        contract_path = self.root / 'contract.json'
        contract_path.write_text(json.dumps(self.contract), encoding='utf-8')
        for path in (contract_path, self.root / 'Slide 1.png'):
            with self.subTest(path=path):
                before = path.read_bytes()
                run = subprocess.run([sys.executable,
                    str(Path(__file__).with_name('audit_exports.py')), str(self.root),
                    '--contract', str(contract_path), '--report', str(path)],
                    capture_output=True, text=True)
                self.assertEqual(run.returncode, 2)
                self.assertEqual(path.read_bytes(), before)


if __name__ == '__main__':
    unittest.main(verbosity=2)
