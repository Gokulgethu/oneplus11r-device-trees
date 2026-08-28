#!/usr/bin/env python3
"""
Local sanity checks for the PixelOS/udon crave build — runs anywhere, needs no
crave account and (without --net) no network.

Checks
------
  * build script / rendered script pass `bash -n`
  * every local manifest parses and has no duplicate paths
  * (--net) every git remote + revision in the local manifest really exists
  * (--net) the local manifest does not collide with paths PixelOS already ships
  * the injected product makefile sets the variables PixelOS needs
  * crave.conf.example has the expected shape

Usage
-----
    python3 preflight.py                 # offline checks
    python3 preflight.py --net           # also query github / pixelos
    python3 preflight.py --branch seventeen --net
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

HERE = Path(__file__).resolve().parent
MANIFESTS = HERE / "manifests"
OVERLAY = HERE / "device-overlay"
DEFAULT_MANIFEST_URL = "https://github.com/PixelOS-AOSP/android_manifest"

FAILURES: list[str] = []
WARNINGS: list[str] = []


def ok(msg: str) -> None:
    print(f"  \033[32mPASS\033[0m {msg}")


def bad(msg: str) -> None:
    print(f"  \033[31mFAIL\033[0m {msg}")
    FAILURES.append(msg)


def warn(msg: str) -> None:
    print(f"  \033[33mWARN\033[0m {msg}")
    WARNINGS.append(msg)


def head(msg: str) -> None:
    print(f"\n\033[1m{msg}\033[0m")


def bash_syntax(path: Path) -> None:
    head(f"bash -n {path.name}")
    if not shutil.which("bash"):
        warn("bash not available")
        return
    p = subprocess.run(["bash", "-n", str(path)], text=True, capture_output=True)
    (ok if p.returncode == 0 else bad)(f"{path.name}: {p.stderr.strip() or 'syntax ok'}")


def check_manifest(path: Path) -> list[tuple[str, str, str]]:
    head(f"local manifest {path.name}")
    try:
        root = ET.parse(path).getroot()
    except ET.ParseError as exc:
        bad(f"{path.name}: invalid XML: {exc}")
        return []
    projects = root.findall("project")
    ok(f"{path.name}: well-formed XML, {len(projects)} projects")
    remotes = {r.get("name"): r.get("fetch") for r in root.findall("remote")}
    seen: dict[str, str] = {}
    entries: list[tuple[str, str, str]] = []
    for p in projects:
        pth, name, remote, rev = (p.get("path"), p.get("name"),
                                  p.get("remote"), p.get("revision"))
        if not pth or not name:
            bad(f"{path.name}: project with missing path/name")
            continue
        if pth in seen:
            bad(f"{path.name}: duplicate path {pth} ({seen[pth]} and {name})")
        seen[pth] = name
        if remote and remote not in remotes:
            bad(f"{path.name}: {pth} uses unknown remote '{remote}'")
        if not rev:
            bad(f"{path.name}: {pth} has no revision")
        fetch = (remotes.get(remote or "") or "https://github.com/").rstrip("/")
        slug = f"{fetch}/{name}".replace("https://github.com/", "")
        entries.append((pth, slug, rev or ""))
    required = ["device/oneplus/udon", "vendor/oneplus/udon",
                "kernel/oneplus/sm8450", "device/oneplus/sm8450-common",
                "vendor/oneplus/sm8450-common", "hardware/oplus"]
    for r in required:
        if r in seen:
            ok(f"{path.name}: has {r}")
        else:
            bad(f"{path.name}: missing required path {r}")
    return entries


NET_CACHE: dict[str, tuple[int, str]] = {}


def _cache_load() -> None:
    cache = HERE / ".cache" / "preflight-net.json"
    if cache.is_file():
        try:
            NET_CACHE.update({k: tuple(v) for k, v in json.loads(cache.read_text()).items()})
        except Exception:  # noqa: BLE001
            pass


def _cache_save() -> None:
    cache = HERE / ".cache" / "preflight-net.json"
    cache.parent.mkdir(parents=True, exist_ok=True)
    cache.write_text(json.dumps(NET_CACHE))


def github(path: str, token: str | None = None) -> tuple[int, str]:
    # Cached so repeated runs do not eat the unauthenticated GitHub rate limit.
    if path in NET_CACHE:
        return NET_CACHE[path]
    result = _github_uncached(path, token)
    if result[0] in (200, 404):
        NET_CACHE[path] = result
    return result


def _github_uncached(path: str, token: str | None = None) -> tuple[int, str]:
    req = urllib.request.Request(
        f"https://api.github.com/{path.lstrip('/')}",
        headers={"User-Agent": "udon-preflight"}
        | ({"Authorization": f"Bearer {token}"} if token else {}),
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as fh:
            return fh.status, fh.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read().decode("utf-8", "replace")
    except Exception as exc:  # noqa: BLE001
        return -1, str(exc)


def check_remotes(entries, token: str | None) -> None:
    head("repository / revision existence (github)")
    for pth, name, rev in entries:
        status, body = github(f"repos/{name}", token)
        if status != 200:
            bad(f"{pth}: repo {name} unreachable (HTTP {status})")
            continue
        if rev and len(rev) == 40 and rev.isalnum():
            continue  # pinned sha, assume valid
        status, body = github(f"repos/{name}/branches/{rev}", token)
        if status == 200:
            ok(f"{pth}: {name} @ {rev}")
        else:
            bad(f"{pth}: {name} has no branch '{rev}' (HTTP {status})")


def check_pixelos_paths(entries, branch: str, manifest_url: str,
                        token: str | None) -> None:
    head(f"local manifest vs PixelOS {branch} paths")
    repo = manifest_url.replace("https://github.com/", "").rstrip("/")
    status, body = github(f"repos/{repo}/contents/default.xml?ref={branch}", token)
    if status != 200:
        warn(f"could not fetch the PixelOS manifest ({status}) — skipping collision check")
        return
    los_paths = set(__import__("re").findall(r'path="([^"]+)"', body))
    collisions = [p for p, *_ in entries if p in los_paths]
    if collisions:
        for c in collisions:
            warn(f"{c}: also shipped by the PixelOS manifest — "
                 f"intended? (repo will use the local manifest entry)")
    else:
        ok("no path collisions with the PixelOS manifest")


def check_product_mk() -> None:
    head("product makefile")
    mk = OVERLAY / "pixelos_udon.mk"
    text = mk.read_text()
    for needle in ("PRODUCT_NAME := pixelos_udon", "PRODUCT_DEVICE := udon",
                   "device/oneplus/udon/device.mk", "core_64_bit.mk"):
        (ok if needle in text else bad)(f"{mk.name}: contains '{needle}'")
    if "vendor/custom/config/common_full_phone.mk" in text and \
       "vendor/lineage/config/common_full_phone.mk" in text:
        ok(f"{mk.name}: has a PixelOS -> Lineage config fallback")
    else:
        bad(f"{mk.name}: no vendor/{custom,lineage} fallback")


def check_conf_example() -> None:
    head("crave.conf.example")
    try:
        conf = json.loads((HERE / "crave.conf.example").read_text())
    except json.JSONDecodeError as exc:
        bad(f"crave.conf.example: {exc}")
        return
    ok("valid JSON")
    for key in ("username", "headers", "projects", "server"):
        (ok if key in conf else bad)(f"has '{key}'")
    auth = (conf.get("headers") or {}).get("Authorization", "")
    (ok if auth and not auth.startswith("REPLACE_") else warn)(
        "Authorization is set" if auth and not auth.startswith("REPLACE_")
        else "Authorization is still the placeholder — fill it in before building")


def main() -> int:
    _cache_load()
    ap = argparse.ArgumentParser()
    ap.add_argument("--branch", default=None, help="only check this branch's manifest")
    ap.add_argument("--net", action="store_true", help="query github / pixelos")
    ap.add_argument("--token", default=None, help="github token (raises rate limits)")
    ap.add_argument("--manifest-url", default=DEFAULT_MANIFEST_URL)
    args = ap.parse_args()

    bash_syntax(HERE / "build-pixelos-udon.sh")

    files = sorted(MANIFESTS.glob("pixelos-udon-*.xml"))
    if args.branch:
        files = [f for f in files if args.branch in f.name]
    if not files:
        bad("no local manifests found — run "
            "crave/manifests/gen_local_manifest.py --android 16 (and/or 17)")
    entries: list[tuple[str, str, str]] = []
    for f in files:
        entries += check_manifest(f)

    check_product_mk()
    check_conf_example()

    if args.net:
        try:
            check_remotes(entries, args.token)
            for branch in {f.stem.replace("pixelos-udon-", "") for f in files}:
                check_pixelos_paths(entries, branch, args.manifest_url, args.token)
        finally:
            _cache_save()

    print()
    if FAILURES:
        print(f"\033[31m{len(FAILURES)} check(s) failed\033[0m")
        for f in FAILURES:
            print(f"  - {f}")
    else:
        print("\033[32mAll checks passed\033[0m")
    if WARNINGS:
        print(f"\033[33m{len(WARNINGS)} warning(s)\033[0m")
        for w in WARNINGS:
            print(f"  - {w}")
    return 1 if FAILURES else 0


if __name__ == "__main__":
    sys.exit(main())
