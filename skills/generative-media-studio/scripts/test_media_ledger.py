"""Tests for media_ledger.py. Run: python3 -I scripts/test_media_ledger.py"""
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import media_ledger  # noqa: E402


class Ledger(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.dir = Path(self.tmp.name)
        self.ledger = str(self.dir / "l.jsonl")
        self.asset = self.dir / "a.png"
        self.asset.write_bytes(b"png")

    def add(self, cost, **kw):
        args = ["add", "--file", str(self.asset), "--tool", kw.get("tool", "fal"), "--model", "m",
                "--cost", str(cost), "--ledger", self.ledger]
        if kw.get("licence"):
            args += ["--licence", kw["licence"]]
        if kw.get("prompt"):
            args += ["--prompt", kw["prompt"]]
        return media_ledger.main(args)

    def test_add_and_budget(self):
        self.assertEqual(self.add(0.5, licence="apache-2.0"), 0)
        self.assertEqual(self.add(0.75, licence="apache-2.0", tool="replicate"), 0)
        self.assertEqual(len(media_ledger.read(Path(self.ledger))), 2)
        self.assertEqual(media_ledger.main(["budget", "--limit", "2", "--ledger", self.ledger]), 0)
        self.assertEqual(media_ledger.main(["budget", "--limit", "1", "--ledger", self.ledger]), 1)
        self.assertEqual(media_ledger.main(["total", "--ledger", self.ledger]), 0)

    def test_refuses_secrets(self):
        self.assertEqual(self.add(0, prompt="use key sk-abcdefghijklmnopqrstuvwxyz"), 2)
        self.assertEqual(media_ledger.read(Path(self.ledger)), [])

    def test_check_flags_missing_licence_and_changes(self):
        self.add(0.1)
        self.assertEqual(media_ledger.main(["check", "--ledger", self.ledger]), 1)
        self.tmp2 = self.dir / "b.png"
        self.asset = self.tmp2
        self.asset.write_bytes(b"x")
        self.ledger = str(self.dir / "l2.jsonl")
        self.add(0.1, licence="mit")
        self.assertEqual(media_ledger.main(["check", "--ledger", self.ledger]), 0)
        self.asset.write_bytes(b"changed")
        self.assertEqual(media_ledger.main(["check", "--ledger", self.ledger]), 1)


if __name__ == "__main__":
    unittest.main()
