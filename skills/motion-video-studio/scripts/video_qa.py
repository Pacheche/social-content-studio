#!/usr/bin/env python3
"""Mechanical QA for a rendered video: specs, loudness, black/frozen/silent stretches, review sheets.

Usage:
  python3 video_qa.py film.mp4 [--spec spec.json] [--sheets out/qa] [--json]

spec.json (all keys optional):
  {"duration": 15.0, "width": 1080, "height": 1920, "fps": 30,
   "lufs": -14, "lufs_tolerance": 1.0, "true_peak_max": -1.0,
   "max_freeze": 3.0, "silent_ok": false}

Exit codes: 0 all checks passed, 1 findings, 2 the file could not be read or FFmpeg is missing.
Needs ffmpeg and ffprobe on the PATH. Standard library only.
A pass removes mechanical failures; it does not approve story, motion or design.
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

DEFAULTS = {"lufs": -14.0, "lufs_tolerance": 1.0, "true_peak_max": -1.0, "max_freeze": 3.0,
            "duration_tolerance": 0.05, "silent_ok": False}


def run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")


def probe(path: str) -> dict:
    res = run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", path])
    if res.returncode != 0:
        raise RuntimeError(res.stderr.strip() or "ffprobe failed")
    data = json.loads(res.stdout)
    v = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), None)
    a = next((s for s in data.get("streams", []) if s.get("codec_type") == "audio"), None)
    if v is None:
        raise RuntimeError("no video stream")
    num, _, den = (v.get("avg_frame_rate") or v.get("r_frame_rate") or "0/1").partition("/")
    fps = float(num) / float(den or 1) if float(den or 1) else 0.0
    return {
        "duration": float(data.get("format", {}).get("duration") or v.get("duration") or 0),
        "width": v.get("width"), "height": v.get("height"), "fps": round(fps, 3),
        "vcodec": v.get("codec_name"), "pix_fmt": v.get("pix_fmt"),
        "color_space": v.get("color_space"), "color_transfer": v.get("color_transfer"),
        "color_primaries": v.get("color_primaries"),
        "acodec": a.get("codec_name") if a else None,
        "sample_rate": int(a["sample_rate"]) if a and a.get("sample_rate") else None,
    }


def parse_ebur128(stderr: str) -> dict:
    """Read the summary block printed by the ebur128 filter."""
    tail = stderr[stderr.rfind("Summary:"):] if "Summary:" in stderr else stderr
    out = {}
    for key, pattern in (("integrated", r"I:\s*(-?[\d.]+|-inf)\s*LUFS"), ("lra", r"LRA:\s*(-?[\d.]+)\s*LU"),
                         ("true_peak", r"Peak:\s*(-?[\d.]+|-inf)\s*dBFS")):
        m = re.search(pattern, tail)
        if m:
            out[key] = float("-inf") if m.group(1) == "-inf" else float(m.group(1))
    return out


def parse_intervals(stderr: str, start_key: str, end_key: str) -> list[tuple[float, float]]:
    starts = [float(x) for x in re.findall(rf"{start_key}[:=]\s*(-?[\d.]+)", stderr)]
    ends = [float(x) for x in re.findall(rf"{end_key}[:=]\s*(-?[\d.]+)", stderr)]
    return [(s, ends[i] if i < len(ends) else float("nan")) for i, s in enumerate(starts)]


def parse_cuts(stderr: str) -> list[float]:
    return sorted({round(float(x), 3) for x in re.findall(r"lavfi\.scd\.time[:=]\s*([\d.]+)", stderr)})


def analyze(path: str, has_audio: bool) -> dict:
    out = {}
    if has_audio:
        res = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"])
        out["loudness"] = parse_ebur128(res.stderr)
        res = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "silencedetect=noise=-50dB:d=0.5",
                   "-f", "null", "-"])
        out["silences"] = parse_intervals(res.stderr, "silence_start", "silence_end")
    res = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-vf",
               "blackdetect=d=0.1:pix_th=0.10,freezedetect=n=0.003:d=1,scdet=threshold=12", "-an", "-f", "null", "-"])
    out["black"] = parse_intervals(res.stderr, "black_start", "black_end")
    out["freezes"] = parse_intervals(res.stderr, "freeze_start", "freeze_end")
    out["cuts"] = parse_cuts(res.stderr)
    return out


def evaluate(info: dict, an: dict, spec: dict) -> list[dict]:
    s = {**DEFAULTS, **spec}
    f = []

    def add(check, ok, detail):
        f.append({"check": check, "ok": bool(ok), "detail": detail})

    for key in ("width", "height"):
        if key in spec:
            add(key, info[key] == spec[key], f"{info[key]} (spec {spec[key]})")
    if "fps" in spec:
        add("fps", abs(info["fps"] - spec["fps"]) < 0.01, f"{info['fps']} (spec {spec['fps']})")
    if "duration" in spec:
        add("duration", abs(info["duration"] - spec["duration"]) <= s["duration_tolerance"],
            f"{info['duration']:.3f}s (spec {spec['duration']}s)")
    if info["vcodec"] == "h264":
        add("pixel format", info["pix_fmt"] == "yuv420p", f"{info['pix_fmt']} (social players expect yuv420p)")
    add("color tags", info["color_space"] in ("bt709", None) and info["color_primaries"] in ("bt709", None),
        f"space={info['color_space']} primaries={info['color_primaries']} (tag BT.709 explicitly)")

    black = an.get("black", [])
    add("first frame", not any(b[0] <= 0.04 for b in black),
        "starts black or near-empty" if any(b[0] <= 0.04 for b in black) else "has content")
    inner_black = [b for b in black if b[0] > 0.04 and (b[1] != b[1] or b[1] < info["duration"] - 0.05)]
    add("black stretches", not inner_black, f"{len(inner_black)} inside the film: {inner_black[:5]}")

    long_freezes = [z for z in an.get("freezes", [])
                    if z[1] == z[1] and z[1] - z[0] > s["max_freeze"]]
    add("dead stretches", not long_freezes,
        f"{len(long_freezes)} frozen > {s['max_freeze']}s: {[(round(a, 2), round(b, 2)) for a, b in long_freezes[:5]]}"
        " (deliberate holds: raise max_freeze in the spec and say why)")

    if info["acodec"] is None:
        add("audio", s["silent_ok"] or info["duration"] <= 15,
            "no audio track" + ("" if s["silent_ok"] else "; films over 15 s usually need sound, set silent_ok if muted on purpose"))
    else:
        loud = an.get("loudness", {})
        i, tp = loud.get("integrated"), loud.get("true_peak")
        if i is not None:
            add("integrated loudness", abs(i - s["lufs"]) <= s["lufs_tolerance"], f"{i} LUFS (target {s['lufs']})")
        if tp is not None:
            add("true peak", tp <= s["true_peak_max"], f"{tp} dBTP (max {s['true_peak_max']})")
        if "lra" in loud:
            add("loudness range", 3 <= loud["lra"] <= 12, f"{loud['lra']} LU (an arc usually sits at 5-9)")
        holes = [x for x in an.get("silences", []) if x[0] > 0.1 and x[1] == x[1] and x[1] < info["duration"] - 0.1]
        add("silent holes", not holes, f"{len(holes)} silences >= 0.5 s inside the film: {holes[:5]}")
    return f


def sheets(path: str, info: dict, cuts: list[float], folder: str) -> list[str]:
    out = Path(folder)
    out.mkdir(parents=True, exist_ok=True)
    made = []
    d = max(info["duration"], 0.1)
    rate = min(2.0, 30.0 / d)
    jobs = [("contact-sheet.jpg", f"fps={rate:.4f},scale=480:-2,tile=6x5"),
            ("phone-sheet.jpg", f"fps={min(1.0, 12.0 / d):.4f},scale=360:-2,tile=4x3")]
    for name, vf in jobs:
        target = str(out / name)
        res = run(["ffmpeg", "-y", "-v", "error", "-i", path, "-vf", vf, "-frames:v", "1", "-update", "1", target])
        if res.returncode == 0:
            made.append(target)
    for n, t in enumerate(cuts[:12], 1):
        target = str(out / f"seam-{n:02d}-{t:.2f}s.jpg")
        res = run(["ffmpeg", "-y", "-v", "error", "-ss", f"{max(t - 0.2, 0):.3f}", "-i", path, "-t", "0.4",
                   "-vf", "scale=320:-2,tile=12x1", "-frames:v", "1", "-update", "1", target])
        if res.returncode == 0:
            made.append(target)
    return made


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="Mechanical QA for a rendered video.")
    ap.add_argument("video")
    ap.add_argument("--spec", help="spec JSON with expected values")
    ap.add_argument("--sheets", help="folder for contact, phone and seam sheets")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args(argv)

    if not (shutil.which("ffmpeg") and shutil.which("ffprobe")):
        print("NOT CHECKED: ffmpeg and ffprobe must be on the PATH", file=sys.stderr)
        return 2
    try:
        info = probe(args.video)
    except (RuntimeError, json.JSONDecodeError, ValueError) as e:
        print(f"NOT CHECKED: {args.video}: {e}", file=sys.stderr)
        return 2
    spec = json.loads(Path(args.spec).read_text(encoding="utf-8")) if args.spec else {}
    an = analyze(args.video, info["acodec"] is not None)
    findings = evaluate(info, an, spec)
    made = sheets(args.video, info, an.get("cuts", []), args.sheets) if args.sheets else []

    failed = [x for x in findings if not x["ok"]]
    if args.json:
        print(json.dumps({"file": args.video, "info": info, "analysis": an, "findings": findings, "sheets": made},
                         indent=2, default=str))
    else:
        print(f"{args.video}: {info['width']}x{info['height']} {info['fps']} fps {info['duration']:.2f}s "
              f"{info['vcodec']}/{info['acodec']}")
        for x in findings:
            print(f"  [{'ok' if x['ok'] else 'FAIL'}] {x['check']}: {x['detail']}")
        if an.get("cuts"):
            print(f"  cuts detected at: {', '.join(f'{c:.2f}' for c in an['cuts'][:20])}")
        for m in made:
            print(f"  sheet: {m}")
        print(f"\n{len(failed)} finding(s). Open the sheets: a pass does not approve story, motion or design.")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
