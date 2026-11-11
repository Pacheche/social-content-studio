#!/usr/bin/env python3
"""Check and install what this skill needs (FFmpeg, Node.js, Python packages, browsers).

Usage:
  python setup_deps.py                 install every missing required dependency of this skill
  python setup_deps.py --check         only report; exit 1 if something required is missing
  python setup_deps.py --with demucs   also install optional ones (comma separated)
  python setup_deps.py --all           every dependency of the whole package
  python setup_deps.py --dry-run       print the install commands without running them
  python setup_deps.py --json          machine-readable report

The skill is taken from the folder this script lives in; --skill overrides it.
Installs with the system package manager (winget, Chocolatey or Scoop on Windows; Homebrew on
macOS; apt, dnf, pacman or zypper on Linux) and with pip for Python packages.
Exit codes: 0 everything required is present, 1 something is still missing, 2 bad arguments.
The same file ships in every skill of the package; keep the copies identical.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import platform
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class Dep:
    name: str
    why: str
    bins: list[str] = field(default_factory=list)      # executables that must be on PATH
    module: str = ""                                    # Python module that must import
    pip: str = ""                                       # pip requirement
    min_version: tuple[int, ...] = ()                   # checked on `<bins[0]> --version`
    managers: dict[str, list[str]] = field(default_factory=dict)  # manager -> package ids
    post: list[list[str]] = field(default_factory=list)  # commands after install ({py} = this Python)
    probe: str = ""                                     # Python code that must run without error
    size: str = ""                                      # rough download size, for the report


DEPS: dict[str, Dep] = {d.name: d for d in [
    Dep("ffmpeg", "cut, encode, measure loudness, contact sheets (video_qa.py)", bins=["ffmpeg", "ffprobe"],
        managers={"winget": ["Gyan.FFmpeg"], "choco": ["ffmpeg"], "scoop": ["ffmpeg"], "brew": ["ffmpeg"],
                  "apt": ["ffmpeg"], "dnf": ["ffmpeg"], "pacman": ["ffmpeg"], "zypper": ["ffmpeg"]}, size="~100 MB"),
    Dep("node", "Remotion and HyperFrames run through npx (HyperFrames needs 22+)", bins=["node", "npx"], min_version=(22,),
        managers={"winget": ["OpenJS.NodeJS.LTS"], "choco": ["nodejs-lts"], "scoop": ["nodejs-lts"], "brew": ["node"],
                  "apt": ["nodejs", "npm"], "dnf": ["nodejs", "npm"], "pacman": ["nodejs", "npm"], "zypper": ["nodejs", "npm"]},
        size="~40 MB"),
    Dep("pillow", "PNG audit of exports (audit_exports.py)", module="PIL", pip="Pillow>=10,<13", size="~5 MB"),
    Dep("playwright", "render HTML/CSS to PNG and PDF with headless Chromium", module="playwright", pip="playwright",
        post=[["{py}", "-m", "playwright", "install", "chromium"]],
        probe="from playwright.sync_api import sync_playwright as s\np=s().start();b=p.chromium.launch();b.close();p.stop()",
        size="~180 MB with Chromium"),
    Dep("poppler", "check exported PDFs (pdfinfo, pdffonts)", bins=["pdfinfo", "pdffonts"],
        managers={"winget": ["oschwartz10612.Poppler"], "choco": ["poppler"], "scoop": ["poppler"], "brew": ["poppler"],
                  "apt": ["poppler-utils"], "dnf": ["poppler-utils"], "pacman": ["poppler"], "zypper": ["poppler-tools"]},
        size="~20 MB"),
    Dep("faster-whisper", "local transcription with word times", module="faster_whisper", pip="faster-whisper",
        size="~100 MB, plus the model on first use"),
    Dep("gifski", "high quality GIFs from frames", bins=["gifski"],
        managers={"winget": ["ImageOptim.gifski"], "choco": ["gifski"], "scoop": ["gifski"], "brew": ["gifski"], "pacman": ["gifski"]}, size="~5 MB"),
    Dep("demucs", "separate voice, music and effects", module="demucs", pip="demucs", size="~2 GB with PyTorch"),
    Dep("rembg", "local background removal", module="rembg", pip="rembg[cpu]", size="~300 MB with the model"),
    Dep("opencv", "frame-level checks on renders (loop seams, frozen scenes)", module="cv2",
        pip="opencv-python-headless", size="~60 MB"),
    Dep("blender", "3D shots rendered from scripts", bins=["blender"],
        managers={"winget": ["BlenderFoundation.Blender"], "choco": ["blender"],
                  "brew": ["--cask", "blender"], "apt": ["blender"], "dnf": ["blender"], "pacman": ["blender"]},
        size="~400 MB"),
]}

SKILLS: dict[str, dict[str, list[str]]] = {
    "content-studio": {"required": [], "optional": []},
    "social-content-studio": {"required": ["pillow", "playwright", "poppler"], "optional": ["ffmpeg", "gifski"]},
    "motion-video-studio": {"required": ["ffmpeg", "node"], "optional": ["playwright", "opencv", "blender", "gifski"]},
    "footage-edit-studio": {"required": ["ffmpeg", "faster-whisper"], "optional": ["node", "demucs", "opencv"]},
    "generative-media-studio": {"required": ["ffmpeg"], "optional": ["rembg", "demucs", "faster-whisper"]},
}

WINDOWS_EXTRA_PATHS = [
    r"%LOCALAPPDATA%\Microsoft\WinGet\Links",
    r"%ProgramFiles%\nodejs",
    r"%ProgramData%\chocolatey\bin",
    r"%USERPROFILE%\scoop\shims",
]


def system() -> str:
    s = platform.system().lower()
    return "windows" if s.startswith("win") else "macos" if s == "darwin" else "linux"


def refresh_path() -> None:
    """Make tools installed by this run visible without a new shell."""
    if system() != "windows":
        extra = ["/opt/homebrew/bin", "/usr/local/bin", os.path.expanduser("~/.local/bin")]
    else:
        extra = [os.path.expandvars(p) for p in WINDOWS_EXTRA_PATHS]
        import winreg
        for root, key in [(winreg.HKEY_CURRENT_USER, "Environment"),
                          (winreg.HKEY_LOCAL_MACHINE, r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment")]:
            try:
                with winreg.OpenKey(root, key) as k:
                    extra += [os.path.expandvars(p) for p in winreg.QueryValueEx(k, "Path")[0].split(";") if p]
            except OSError:
                pass
    parts = os.environ.get("PATH", "").split(os.pathsep)
    os.environ["PATH"] = os.pathsep.join(parts + [p for p in extra if p and p not in parts])


def version_of(binary: str) -> tuple[int, ...]:
    try:
        out = subprocess.run([shutil.which(binary) or binary, "--version"], capture_output=True, text=True, timeout=20).stdout
    except (OSError, subprocess.SubprocessError):
        return ()
    m = re.search(r"(\d+)\.(\d+)(?:\.(\d+))?", out)
    return tuple(int(g) for g in m.groups() if g) if m else ()


def present(dep: Dep) -> tuple[bool, str]:
    for b in dep.bins:
        if not shutil.which(b):
            return False, f"{b} not on PATH"
    if dep.min_version and dep.bins:
        v = version_of(dep.bins[0])
        if v and v < dep.min_version:
            return False, f"{dep.bins[0]} {'.'.join(map(str, v))} is older than {'.'.join(map(str, dep.min_version))}"
    if dep.module and importlib.util.find_spec(dep.module) is None:
        return False, f"Python module {dep.module} missing for {sys.executable}"
    if dep.probe:
        res = subprocess.run([sys.executable, "-c", dep.probe], capture_output=True, text=True, timeout=120)
        if res.returncode != 0:
            return False, "installed but not working: " + (res.stderr.strip().splitlines() or ["error"])[-1][:160]
    return True, "ok"


def available_managers() -> list[str]:
    order = {"windows": ["winget", "choco", "scoop"], "macos": ["brew"],
             "linux": ["apt-get", "dnf", "pacman", "zypper", "brew"]}[system()]
    return [m for m in order if shutil.which(m)]


def manager_command(manager: str, pkgs: list[str]) -> list[str]:
    sudo = [] if system() == "windows" or manager == "brew" or os.geteuid() == 0 else ["sudo"]
    if manager == "winget":
        return ["winget", "install", "--id", pkgs[0], "-e", "--silent",
                "--accept-package-agreements", "--accept-source-agreements"]
    if manager == "choco":
        return ["choco", "install", "-y", *pkgs]
    if manager == "scoop":
        return ["scoop", "install", *pkgs]
    if manager == "brew":
        return ["brew", "install", *pkgs]
    if manager == "apt-get":
        return [*sudo, "apt-get", "install", "-y", *pkgs]
    if manager == "dnf":
        return [*sudo, "dnf", "install", "-y", *pkgs]
    if manager == "pacman":
        return [*sudo, "pacman", "-S", "--noconfirm", "--needed", *pkgs]
    if manager == "zypper":
        return [*sudo, "zypper", "--non-interactive", "install", *pkgs]
    raise ValueError(manager)


def install_plans(dep: Dep, managers: list[str]) -> list[list[list[str]]]:
    """Alternative command sequences, tried in order until one leaves the dependency present."""
    if dep.pip:
        base = [sys.executable, "-m", "pip", "install", "--upgrade", dep.pip]
        post = [[sys.executable if a == "{py}" else a for a in c] for c in dep.post]
        return [[base + extra] + post for extra in ([], ["--user"], ["--user", "--break-system-packages"])]
    plans = []
    for m in managers:
        key = "apt" if m == "apt-get" else m
        if key in dep.managers:
            plan = [manager_command(m, dep.managers[key])]
            if m == "apt-get":
                plan.insert(0, plan[0][:plan[0].index("apt-get")] + ["apt-get", "update"])
            plans.append(plan)
    return plans


def run(cmd: list[str]) -> bool:
    print("  $ " + " ".join(cmd), flush=True)
    try:
        return subprocess.run(cmd, timeout=3600).returncode == 0
    except (OSError, subprocess.SubprocessError) as e:
        print(f"  failed: {e}")
        return False


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--skill", default=Path(__file__).resolve().parent.parent.name)
    ap.add_argument("--with", dest="extra", default="", help="optional dependencies to add, comma separated")
    ap.add_argument("--all", action="store_true", help="every dependency of the package")
    ap.add_argument("--check", action="store_true", help="report only")
    ap.add_argument("--dry-run", action="store_true", help="print install commands, run nothing")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(errors="backslashreplace")
    if args.skill not in SKILLS and not args.all:
        print(f"unknown skill {args.skill!r}; use --skill one of {', '.join(SKILLS)} or --all", file=sys.stderr)
        return 2
    extra = [x.strip() for x in args.extra.split(",") if x.strip()]
    unknown = [x for x in extra if x not in DEPS]
    if unknown:
        print(f"unknown dependency {', '.join(unknown)}; known: {', '.join(DEPS)}", file=sys.stderr)
        return 2

    names = list(DEPS) if args.all else SKILLS[args.skill]["required"] + [x for x in extra if x not in SKILLS[args.skill]["required"]]
    optional = [] if args.all else [x for x in SKILLS[args.skill]["optional"] if x not in names]
    refresh_path()
    managers = available_managers()
    report = []
    for name in names:
        dep = DEPS[name]
        ok, detail = present(dep)
        entry = {"name": name, "why": dep.why, "present": ok, "detail": detail, "size": dep.size}
        if not ok and not args.check:
            plans = install_plans(dep, managers)
            if not plans:
                have = ", ".join(managers) or "no package manager"
                entry["detail"] = (detail + f"; no package for it through {have}: install it by hand"
                                   + (" or add one of: " + ", ".join(dep.managers) if dep.managers else ""))
            for plan in plans:
                if args.dry_run:
                    entry.setdefault("commands", []).extend(" ".join(c) for c in plan)
                    break
                print(f"installing {name} ({dep.size})", flush=True)
                if all(run(c) for c in plan):
                    refresh_path()
                    ok, detail = present(dep)
                    entry.update(present=ok, detail=detail, installed=ok)
                    if ok:
                        break
            if plans and not ok and not args.dry_run and system() == "windows" and dep.bins:
                entry["detail"] += "; if it was just installed, open a new terminal so PATH updates"
        report.append(entry)

    missing = [e["name"] for e in report if not e["present"]]
    if args.json:
        print(json.dumps({"skill": "all" if args.all else args.skill, "system": system(), "python": sys.executable,
                          "managers": managers, "dependencies": report, "optional": optional,
                          "missing": missing}, ensure_ascii=True, indent=2))
    else:
        print(f"{'package' if args.all else args.skill} on {system()}, Python {platform.python_version()}")
        for e in report:
            mark = "ok" if e["present"] else ("would install" if args.dry_run else "MISSING")
            print(f"  [{mark}] {e['name']}: {e['why']}" + ("" if e["present"] else f" ({e['detail']})"))
            for c in e.get("commands", []):
                print(f"      $ {c}")
        if optional:
            print("  optional, on demand: " + ", ".join(f"{n} ({DEPS[n].size})" for n in optional)
                  + "  ->  python setup_deps.py --with <name>")
    return 1 if missing and not args.dry_run else 0


if __name__ == "__main__":
    sys.exit(main())
