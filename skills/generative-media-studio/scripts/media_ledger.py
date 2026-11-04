#!/usr/bin/env python3
"""Provenance and spend ledger for generated media (one JSON object per line).

Usage:
  python3 media_ledger.py add --file out/hero-v1.png --tool fal --model fal-ai/flux-2/klein \\
      --prompt "..." --cost 0.009 [--route api] [--licence apache-2.0] [--consent none] \\
      [--seed 42] [--ref brand/ref1.png] [--note "draft"] [--ledger media-ledger.jsonl]
  python3 media_ledger.py total [--since 2026-11-01] [--ledger media-ledger.jsonl]
  python3 media_ledger.py budget --limit 20 [--since 2026-11-01]   # exit 1 when spend >= limit
  python3 media_ledger.py check                                      # assets missing licence or file

Standard library only. Never put API keys in a ledger entry.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

DEFAULT = "media-ledger.jsonl"
SECRET = re.compile(r"(sk-[A-Za-z0-9_-]{16,}|hf_[A-Za-z0-9]{20,}|key[-_][A-Za-z0-9]{16,}|r8_[A-Za-z0-9]{20,})")


def sha256(path: Path) -> str | None:
    if not path.is_file():
        return None
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def read(ledger: Path) -> list[dict]:
    if not ledger.exists():
        return []
    rows = []
    for n, line in enumerate(ledger.read_text(encoding="utf-8").splitlines(), 1):
        if line.strip():
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                print(f"skipping unreadable line {n}", file=sys.stderr)
    return rows


def add(args) -> int:
    text = " ".join(str(v) for v in vars(args).values() if v)
    if SECRET.search(text):
        print("REFUSED: the entry looks like it contains an API key", file=sys.stderr)
        return 2
    path = Path(args.file)
    row = {
        "time": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "file": str(path), "sha256": sha256(path), "tool": args.tool, "model": args.model,
        "route": args.route, "prompt": args.prompt, "refs": args.ref or [], "seed": args.seed,
        "cost": float(args.cost), "currency": args.currency, "licence": args.licence,
        "consent": args.consent, "note": args.note,
    }
    ledger = Path(args.ledger)
    with ledger.open("a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")
    print(f"logged {path} ({row['cost']} {row['currency']})" + ("" if row["sha256"] else " - file not found yet"))
    return 0


def filtered(rows: list[dict], since: str | None) -> list[dict]:
    return [r for r in rows if not since or r.get("time", "") >= since]


def total(args) -> int:
    rows = filtered(read(Path(args.ledger)), args.since)
    by_tool, by_day, sums = defaultdict(float), defaultdict(float), defaultdict(float)
    for r in rows:
        cur = r.get("currency", "USD")
        by_tool[(r.get("tool"), cur)] += r.get("cost", 0)
        by_day[(r.get("time", "")[:10], cur)] += r.get("cost", 0)
        sums[cur] += r.get("cost", 0)
    for (tool, cur), v in sorted(by_tool.items()):
        print(f"  {tool}: {v:.4f} {cur}")
    for (day, cur), v in sorted(by_day.items()):
        print(f"  {day}: {v:.4f} {cur}")
    print(f"{len(rows)} asset(s); total " + (", ".join(f"{v:.4f} {c}" for c, v in sums.items()) or "0"))
    return 0


def budget(args) -> int:
    rows = filtered(read(Path(args.ledger)), args.since)
    spent = sum(r.get("cost", 0) for r in rows if r.get("currency", "USD") == args.currency)
    left = args.limit - spent
    print(f"spent {spent:.4f} of {args.limit:.4f} {args.currency}; left {left:.4f}")
    return 1 if spent >= args.limit else 0


def check(args) -> int:
    problems = []
    for r in read(Path(args.ledger)):
        if not r.get("licence"):
            problems.append(f"{r.get('file')}: no licence recorded")
        if not Path(r.get("file", "")).is_file():
            problems.append(f"{r.get('file')}: file missing")
        elif r.get("sha256") and sha256(Path(r["file"])) != r["sha256"]:
            problems.append(f"{r.get('file')}: changed since it was logged")
    for p in problems:
        print("  " + p)
    print(f"{len(problems)} problem(s)")
    return 1 if problems else 0


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="Provenance and spend ledger for generated media.")
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("add")
    a.add_argument("--file", required=True)
    a.add_argument("--tool", required=True)
    a.add_argument("--model", required=True)
    a.add_argument("--prompt", default="")
    a.add_argument("--cost", default="0")
    a.add_argument("--currency", default="USD")
    a.add_argument("--route", default="api")
    a.add_argument("--licence", default="")
    a.add_argument("--consent", default="")
    a.add_argument("--seed", default=None)
    a.add_argument("--ref", action="append")
    a.add_argument("--note", default="")
    for p in (a, sub.add_parser("total"), sub.add_parser("budget"), sub.add_parser("check")):
        p.add_argument("--ledger", default=DEFAULT)
    for name in ("total", "budget"):
        sub.choices[name].add_argument("--since")
    sub.choices["budget"].add_argument("--limit", type=float, required=True)
    sub.choices["budget"].add_argument("--currency", default="USD")
    args = ap.parse_args(argv)
    return {"add": add, "total": total, "budget": budget, "check": check}[args.cmd](args)


if __name__ == "__main__":
    sys.exit(main())
