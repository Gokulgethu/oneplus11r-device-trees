#!/usr/bin/env python3
"""
Drive a PixelOS build for OnePlus 11R (udon / CPH2487) on crave.io using only
the crave API key (crave.conf) — no devspace, no GitHub Actions.

What it does
------------
1.  Loads credentials (args > env > crave.conf).
2.  Renders the server side build script (local manifest + product makefile
    inlined) into <workdir>/rendered/.
3.  Creates a tiny *control* checkout (repo init --depth=1, no sync — nothing
    big is downloaded locally) that crave uses to identify the project.
4.  Runs:  crave run --no-patch --projectID <id> [--detached] -- "<script>"
    The script is base64 inlined so no local file has to be uploaded and no
    devspace is needed.
5.  Polls the job, tails the log and (optionally) pulls the artifacts.

Examples
--------
    # show exactly what would run, touch nothing (works offline)
    ./crave_build.py --dry-run

    # real run (needs network access to foss.crave.io)
    ./crave_build.py --branch seventeen --stage all

    # resume: source is already synced in the remote workspace
    ./crave_build.py --branch seventeen --stage build

    # print the one-line command so you can run it on another machine
    ./crave_build.py --print-command > ~/build-udon.sh

Credentials
-----------
    --username / --token, or CRAVE_USERNAME / CRAVE_TOKEN, or a crave.conf
    (JSON, as downloaded from https://foss.crave.io/app/#/apikeys) found in the
    current directory, a parent, $HOME, or given with --config.
    The token is never printed (it is masked in all output).
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
MANIFESTS = HERE / "manifests"
OVERLAY = HERE / "device-overlay"

DEFAULT_SERVER = "https://foss.crave.io/api"
DEFAULT_MANIFEST_URL = "https://github.com/PixelOS-AOSP/android_manifest"
CRAVE_VERSION = "0.2-7183"          # get_crave.sh default
GET_CRAVE_URL = "https://raw.githubusercontent.com/accupara/crave/master/get_crave.sh"

BRANCH_CHOICES = ("sixteen", "sixteen-qpr1", "sixteen-qpr2", "seventeen")

ARTIFACTS = [
    "out/target/product/udon/PixelOS_*.zip",
    "out/target/product/udon/PixelOS_*.json",
    "out/target/product/udon/boot.img",
    "out/target/product/udon/dtbo.img",
    "out/target/product/udon/vendor_boot.img",
    "out/target/product/udon/recovery.img",
]


# --------------------------------------------------------------------------- #
# helpers
# --------------------------------------------------------------------------- #
LOG_TO_STDERR = False


def log(msg: str = "") -> None:
    print(msg, flush=True, file=sys.stderr if LOG_TO_STDERR else sys.stdout)


def step(msg: str) -> None:
    log(f"\n\033[1;36m==> {msg}\033[0m")


def warn(msg: str) -> None:
    log(f"\033[1;33m[warn]\033[0m {msg}")


def die(msg: str) -> int:
    log(f"\033[1;31m[fail]\033[0m {msg}")
    return 1


def mask(token: str) -> str:
    if not token:
        return "<none>"
    return f"{token[:4]}…{token[-4:]} (len={len(token)})"


def sh(cmd: list[str], cwd: Path | None = None, check: bool = True,
       capture: bool = False) -> subprocess.CompletedProcess:
    log(f"    $ {' '.join(cmd)}")
    return subprocess.run(cmd, cwd=str(cwd) if cwd else None, check=check,
                          text=True, capture_output=capture)


def find_config(explicit: str | None) -> Path | None:
    if explicit:
        p = Path(explicit).expanduser()
        return p if p.is_file() else None
    for base in [Path.cwd(), *Path.cwd().parents, Path.home()]:
        cand = base / "crave.conf"
        if cand.is_file():
            return cand
    return None


def load_credentials(args) -> dict:
    """Return a crave.conf style dict. Priority: args > env > crave.conf."""
    conf: dict = {}
    cfg_path = find_config(args.config)
    if cfg_path:
        try:
            conf = json.loads(cfg_path.read_text())
        except json.JSONDecodeError as exc:
            raise SystemExit(f"{cfg_path}: not valid JSON ({exc})")
        log(f"    credentials file: {cfg_path}")
    username = (args.username or os.environ.get("CRAVE_USERNAME")
                or conf.get("username") or "")
    token = (args.token or os.environ.get("CRAVE_TOKEN")
             or (conf.get("headers") or {}).get("Authorization") or "")
    server = (args.server or conf.get("server") or DEFAULT_SERVER)
    if token and token.startswith("REPLACE_"):
        token = ""
    return {
        "username": username,
        "headers": {
            "Content-Type": "application/json",
            "Authorization": token,
            "User-Agent": "Crave",
        },
        "projects": [],                       # never reuse stale mappings
        "server": server.rstrip("/"),
    }


def write_conf(conf: dict, path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(conf, indent=2) + "\n")
    try:
        os.chmod(path, 0o600)
    except OSError:
        pass
    return path


def import_config(src: Path) -> int:
    """Store a downloaded crave.conf as crave/crave.conf (gitignored)."""
    if not src.is_file():
        return die(f"no such file: {src}")
    try:
        conf = json.loads(src.read_text())
    except json.JSONDecodeError as exc:
        return die(f"{src} is not valid JSON: {exc}")
    token = (conf.get("headers") or {}).get("Authorization", "")
    if not conf.get("username") or not token:
        return die(f"{src} has no username/Authorization — is this the file from "
                   f"https://foss.crave.io/app/#/apikeys ?")
    dest = HERE / "crave.conf"
    write_conf({"username": conf["username"],
                "headers": {"Content-Type": "application/json",
                            "Authorization": token,
                            "User-Agent": "Crave"},
                "projects": [],
                "server": (conf.get("server") or DEFAULT_SERVER).rstrip("/")}, dest)
    step("Imported credentials")
    log(f"    from   : {src}")
    log(f"    stored : {dest} (mode 600, gitignored)")
    log(f"    username: {conf['username']}")
    log(f"    token  : {mask(token)}")
    log(f"    server : {(conf.get('server') or DEFAULT_SERVER)}")
    log("\n    next: ./crave_build.py --branch seventeen --fallback sixteen --stage preflight")
    return 0


# --------------------------------------------------------------------------- #
# rendering
# --------------------------------------------------------------------------- #
def render(args, workdir: Path) -> tuple[Path, Path]:
    """Render build script + crave.yaml. Returns (script, crave_yaml)."""
    manifest_file = Path(args.local_manifest) if args.local_manifest else \
        MANIFESTS / f"pixelos-udon-{args.branch}.xml"
    if not manifest_file.is_file():
        raise SystemExit(f"local manifest not found: {manifest_file}\n"
                         f"generate it with: python3 {MANIFESTS}/gen_local_manifest.py "
                         f"--android {'17' if args.branch.startswith('seventeen') else '16'}")
    product_mk = Path(args.product_mk) if args.product_mk else OVERLAY / "pixelos_udon.mk"
    template = HERE / "build-pixelos-udon.sh"

    local_manifest = manifest_file.read_text().rstrip()
    script = template.read_text()
    script = script.replace("@@LOCAL_MANIFEST@@", local_manifest)
    script = script.replace("@@PIXELOS_PRODUCT_MK@@", product_mk.read_text().rstrip())
    if "@@" in script:
        raise SystemExit("unrendered placeholders left in build script")

    out_dir = workdir / "rendered"
    out_dir.mkdir(parents=True, exist_ok=True)
    script_path = out_dir / f"build-pixelos-udon-{args.branch}.sh"
    script_path.write_text(script)
    os.chmod(script_path, 0o755)

    project_key = args.project_name or "PixelOS"
    yaml_lines = [
        "# Rendered by crave/crave_build.py — place at .repo/manifests/crave.yaml",
        "settings:",
        "  projects:",
        f"    - {project_key}",
    ]
    if args.project_id:
        yaml_lines.append(f"  project-ids: [{args.project_id}]")
    yaml_lines += [
        f"{project_key}:",
        "  ignoreClientHostname: true",   # same workspace from any machine
        "  no-patch: true",
        "  artifacts:",
    ]
    yaml_lines += [f'    - "{a}"' for a in ARTIFACTS]
    yaml_path = out_dir / "crave.yaml"
    yaml_path.write_text("\n".join(yaml_lines) + "\n")

    log(f"    local manifest : {manifest_file}")
    log(f"    product mk     : {product_mk}")
    log(f"    rendered script: {script_path} ({script_path.stat().st_size} bytes)")
    return script_path, yaml_path


def remote_command(script_path: Path, args) -> str:
    """Command string handed to `crave run`. The script travels as base64."""
    blob = base64.b64encode(script_path.read_bytes()).decode()
    env = " ".join([
        f"PIXELOS_BRANCH={args.branch}",
        f"MANIFEST_URL={args.manifest_url}",
        f"MANIFEST_BRANCH={args.branch}",
        f"LUNCH_TARGET={args.lunch}",
        f"BUILD_TARGET={args.build_target}",
        f"STAGE={args.stage}",
        f"CLEAN={1 if args.clean else 0}",
        f"JOBS={args.jobs}",
    ])
    return (f"{env} bash -c "
            f"'echo {blob} | base64 -d > /tmp/udon-build.sh && "
            f"bash /tmp/udon-build.sh'")


# --------------------------------------------------------------------------- #
# crave client
# --------------------------------------------------------------------------- #
def ensure_crave(args, workdir: Path) -> str:
    if args.crave_bin:
        return str(Path(args.crave_bin).expanduser())
    found = shutil.which("crave")
    if found:
        return found
    target = workdir / "bin" / "crave"
    if target.is_file():
        return str(target)
    if args.dry_run:
        return str(target)
    step("Installing the crave CLI")
    target.parent.mkdir(parents=True, exist_ok=True)
    url = (f"https://github.com/accupara/crave/releases/download/{args.crave_version}/"
           f"crave-{args.crave_version}-linux-amd64.bin")
    sh(["curl", "-fsSL", "-o", str(target), url], check=False)
    if not target.is_file():
        raise SystemExit(
            "Could not download the crave CLI.\n"
            "Download it yourself from https://github.com/accupara/crave/releases\n"
            f"(or https://foss.crave.io/app/#/downloads) and pass --crave-bin /path/to/crave\n"
            f"Expected: {url}")
    os.chmod(target, 0o755)
    return str(target)


def prepare_workspace(args, conf: dict, crave_yaml: Path, workdir: Path) -> Path:
    """Control checkout: just enough for crave to map this dir to a project."""
    ws = workdir / f"control-{args.branch}"
    ws.mkdir(parents=True, exist_ok=True)
    write_conf(conf, ws / "crave.conf")

    manifests = ws / ".repo" / "manifests"
    manifests.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(crave_yaml, manifests / "crave.yaml")

    if not args.no_repo_init and shutil.which("repo"):
        if not (ws / ".repo" / "manifest.xml").exists():
            sh(["repo", "init", "-u", args.manifest_url, "-b", args.branch,
                "--depth=1", "--no-tags"], cwd=ws, check=False)
    return ws


def resolve_project(crave: str, ws: Path, args) -> str | None:
    """Best effort: find the crave project id/name via `crave list --json`."""
    if args.project_id:
        return args.project_id
    try:
        proc = subprocess.run([crave, "list", "--json"], cwd=str(ws), text=True,
                              capture_output=True, timeout=120)
        data = json.loads(proc.stdout)
    except Exception:
        return None
    projects = data.get("projects") or data.get("Projects") or []
    wanted = (args.project_name or "").lower()
    for p in projects:
        name = (p.get("name") or p.get("Name") or "")
        if wanted and wanted in name.lower():
            return str(p.get("id") or p.get("Id"))
    return None


def launch(crave: str, ws: Path, args, command: str) -> tuple[str, str]:
    cmd = [crave, "-c", str(ws / "crave.conf")]
    if args.project_id:
        cmd += ["run", "--no-patch", "--projectID", str(args.project_id)]
    else:
        cmd += ["run", "--no-patch"]
    if args.platform:
        cmd += ["--platform", args.platform]
    if args.clean_ws:
        cmd += ["--clean"]
    if args.message:
        cmd += ["--message", args.message]
    if args.detach:
        cmd += ["--detached", "--json"]
    cmd += ["--", command]

    log("\n    --- crave command (token never shown) ---")
    printable = " ".join(
        (f"'{c}'" if (len(c) > 120 or " " in c) else c) for c in cmd)
    log(f"    {printable[:600]}{' …[script elided]' if len(printable) > 600 else ''}")
    log("    ------------------------------------------")

    proc = subprocess.run(cmd, cwd=str(ws), text=True,
                          capture_output=args.detach)
    out = (proc.stdout or "") + (proc.stderr or "")
    job_id = ""
    url = ""
    m = re.search(r"build[ /]id:?\s*(\d+)", out, re.I)
    if m:
        job_id = m.group(1)
    m = re.search(r"https?://\S*crave\.io\S*build/info/\d+\S*", out)
    if m:
        url = m.group(0)
    return job_id, url


def poll(crave: str, ws: Path, job_id: str, url: str, args) -> str:
    log(f"\n    job {job_id or '(unknown)'} started — {url or 'see crave dashboard'}")
    if not job_id:
        return "unknown"
    deadline = time.time() + args.max_wait * 3600
    seen = 0
    status = "running"
    while time.time() < deadline:
        time.sleep(args.poll_interval)
        try:
            proc = subprocess.run([crave, "list", "--json"], cwd=str(ws), text=True,
                                  capture_output=True, timeout=180)
            data = json.loads(proc.stdout or "{}")
        except Exception as exc:
            warn(f"poll failed: {exc}")
            continue
        jobs = data.get("jobs") or data.get("Jobs") or []
        job = next((j for j in jobs
                    if str(j.get("id") or j.get("Job Id") or j.get("Id")) == job_id), None)
        if job:
            status = str(job.get("status") or job.get("Job Status") or "running")
        # tail the log so the controlling terminal stays useful
        try:
            gl = subprocess.run([crave, "getlog"], cwd=str(ws), text=True,
                                capture_output=True, timeout=300)
            text = gl.stdout or ""
            if len(text) > seen:
                sys.stdout.write(text[seen:])
                sys.stdout.flush()
                seen = len(text)
        except Exception:
            pass
        if status and status.lower() not in ("running", "queued", "starting",
                                             "pending", "waiting"):
            break
    return status


def pull(crave: str, ws: Path, args) -> None:
    for path in ("out/target/product/udon",):
        proc = subprocess.run([crave, "-c", str(ws / "crave.conf"), "pull", path],
                              cwd=str(ws), text=True, capture_output=True,
                              timeout=6 * 3600)
        log((proc.stdout or "")[-4000:])
        if proc.returncode != 0:
            warn(f"crave pull {path} failed: {(proc.stderr or '')[-500:]}")


# --------------------------------------------------------------------------- #
# main
# --------------------------------------------------------------------------- #
def parse_args(argv=None):
    ap = argparse.ArgumentParser(
        description="Build PixelOS for OnePlus 11R (udon) on crave.io via API keys",
        formatter_class=argparse.RawDescriptionHelpFormatter)
    g = ap.add_argument_group("credentials")
    g.add_argument("--username")
    g.add_argument("--token", help="crave API token (Authorization value from crave.conf)")
    g.add_argument("--config", help="path to a crave.conf (JSON)")
    g.add_argument("--import-config", metavar="PATH",
                   help="copy a downloaded crave.conf into ./crave.conf (chmod 600) and exit")
    g.add_argument("--server", help=f"crave API base url (default {DEFAULT_SERVER})")

    g = ap.add_argument_group("build")
    g.add_argument("--branch", default="seventeen", choices=BRANCH_CHOICES,
                   help="PixelOS source branch (default: seventeen = latest)")
    g.add_argument("--manifest-url", default=DEFAULT_MANIFEST_URL)
    g.add_argument("--local-manifest", help="override the generated udon local manifest")
    g.add_argument("--product-mk", help="override device-overlay/pixelos_udon.mk")
    g.add_argument("--lunch", default="pixelos_udon-userdebug")
    g.add_argument("--build-target", default="bacon")
    g.add_argument("--stage", default="all", choices=("sync", "preflight", "build", "all"))
    g.add_argument("--clean", action="store_true", help="make installclean before building")
    g.add_argument("--clean-ws", action="store_true", help="crave --clean (fresh workspace)")
    g.add_argument("--jobs", type=int, default=0, help="parallel jobs (0 = let the server decide)")
    g.add_argument("--platform", help="crave platform, e.g. aosp-silver for the paid queue")

    g = ap.add_argument_group("crave")
    g.add_argument("--project-id", help="crave project id (else auto-detected)")
    g.add_argument("--project-name", default="PixelOS", help="crave project name to look for")
    g.add_argument("--crave-bin", help="path to the crave CLI (else downloaded)")
    g.add_argument("--crave-version", default=CRAVE_VERSION)
    g.add_argument("--message", help="job message shown in the crave dashboard")
    g.add_argument("--no-detach", dest="detach", action="store_false",
                   help="stream the build log instead of polling (default: detach+poll)")
    g.add_argument("--poll-interval", type=int, default=120, help="seconds")
    g.add_argument("--max-wait", type=float, default=11.0, help="hours")
    g.add_argument("--pull", action="store_true", help="pull artifacts when the build finishes")
    g.add_argument("--fallback-branch", choices=BRANCH_CHOICES,
                   help="if the first branch fails, re-run the build on this one")
    g.add_argument("--no-repo-init", action="store_true",
                   help="skip repo init in the control checkout")

    g = ap.add_argument_group("local")
    g.add_argument("--workdir", default=str(HERE / "work"))
    g.add_argument("--dry-run", action="store_true",
                   help="render everything and print the commands, run nothing")
    g.add_argument("--print-command", action="store_true",
                   help="print a self-contained shell command for another machine")
    ap.set_defaults(detach=True)
    return ap.parse_args(argv)


def main(argv=None) -> int:
    global LOG_TO_STDERR
    args = parse_args(argv)
    if args.print_command:
        # stdout is the generated script, so chatter goes to stderr
        LOG_TO_STDERR = True
    if args.import_config:
        return import_config(Path(args.import_config).expanduser())

    workdir = Path(args.workdir).expanduser().resolve()
    workdir.mkdir(parents=True, exist_ok=True)

    step("Credentials")
    conf = load_credentials(args)
    log(f"    username : {conf['username'] or '<missing>'}")
    log(f"    token    : {mask(conf['headers']['Authorization'])}")
    log(f"    server   : {conf['server']}")

    step("Rendering the build")
    script_path, crave_yaml = render(args, workdir)
    command = remote_command(script_path, args)
    log(f"    remote command: {len(command)} bytes (build script inlined as base64)")

    ws = prepare_workspace(args, conf, crave_yaml, workdir)
    log(f"    control workspace: {ws}")

    if not conf["username"] or not conf["headers"]["Authorization"]:
        warn("no credentials yet — pass --username/--token, set CRAVE_USERNAME/"
             "CRAVE_TOKEN, or drop a crave.conf next to this script or in $HOME")

    if args.print_command:
        # Everything needed on another machine: credentials + inlined script.
        # The CLI is only needed at run time, so keep this independent of it.
        blob = base64.b64encode(script_path.read_bytes()).decode()
        env = " ".join([
            f"PIXELOS_BRANCH={args.branch}",
            f"MANIFEST_URL={args.manifest_url}",
            f"MANIFEST_BRANCH={args.branch}",
            f"LUNCH_TARGET={args.lunch}",
            f"BUILD_TARGET={args.build_target}",
            f"STAGE={args.stage}",
            f"CLEAN={1 if args.clean else 0}",
            f"JOBS={args.jobs}",
        ])
        shell = "\n".join([
            "#!/bin/bash",
            "# Generated by crave/crave_build.py — run anywhere that can reach crave.io.",
            "# The build itself runs on crave's servers: no devspace, no local sync.",
            "set -euo pipefail",
            "mkdir -p \"${HOME}/.crave-udon\" && cd \"${HOME}/.crave-udon\"",
            "cat > crave.conf <<'CRAVE_CONF_EOF'",
            json.dumps(conf, indent=2),
            "CRAVE_CONF_EOF",
            "chmod 600 crave.conf",
            f"if ! command -v crave >/dev/null; then",
            f"  curl -fsSL -o ./crave https://github.com/accupara/crave/releases/"
            f"download/{args.crave_version}/crave-{args.crave_version}-linux-amd64.bin",
            "  chmod +x ./crave",
            "  CRAVE=./crave",
            "else",
            "  CRAVE=crave",
            "fi",
        ])
        cmd_lines = [f'$CRAVE -c crave.conf run --no-patch']
        if args.project_id:
            cmd_lines.append(f'--projectID {args.project_id}')
        if args.platform:
            cmd_lines.append(f'--platform {args.platform}')
        if args.detach:
            cmd_lines.append('--detached --json')
        if args.message:
            cmd_lines.append(f'--message {shlex.quote(args.message)}')
        payload = (f"{env} bash -c 'echo {blob} | base64 -d > /tmp/udon-build.sh "
                   f"&& bash /tmp/udon-build.sh'")
        cmd_lines.append(f'-- {shlex.quote(payload)}')
        lines = shell.split("\n")
        lines.append(" \\\n  ".join(cmd_lines))
        lines.append('echo "job submitted - follow it on the crave dashboard"')
        sys.stdout.write("\n".join(lines) + "\n")
        return 0

    crave = ensure_crave(args, workdir)
    log(f"    crave CLI: {crave}")

    if args.dry_run:
        step("Dry run — nothing was sent to crave")
        log(f"    rendered script : {script_path}")
        log(f"    control ws      : {ws}")
        log(f"    crave conf      : {ws / 'crave.conf'}")
        log(f"    crave.yaml      : {ws / '.repo' / 'manifests' / 'crave.yaml'}")
        log("\n    Next: ./crave_build.py --branch {} --stage {} "
            "(from a machine that can reach {})".format(
                args.branch, args.stage, conf["server"]))
        return 0

    if not conf["username"] or not conf["headers"]["Authorization"]:
        return die("missing crave credentials")

    branches = [args.branch]
    if args.fallback_branch and args.fallback_branch != args.branch:
        branches.append(args.fallback_branch)

    reports = []
    success = False
    for index, branch in enumerate(branches):
        if index:
            warn(f"PixelOS {branches[index - 1]} failed — falling back to {branch}")
            args.branch = branch
            script_path, crave_yaml = render(args, workdir)
            ws = prepare_workspace(args, conf, crave_yaml, workdir)

        step(f"Resolving crave project ({branch})")
        pid = resolve_project(crave, ws, args)
        if pid:
            log(f"    project id: {pid}")
            args.project_id = pid

        step(f"Starting the PixelOS {branch} build on crave")
        job_id, url = launch(crave, ws, args, remote_command(script_path, args))
        status = "unknown"
        if args.detach:
            status = poll(crave, ws, job_id, url, args)
        else:
            status = "finished (streamed)"

        report = {
            "branch": branch,
            "lunch": args.lunch,
            "stage": args.stage,
            "job_id": job_id,
            "job_url": url,
            "status": status,
            "artifacts": ARTIFACTS,
        }
        report_path = workdir / f"run-{job_id or 'noid'}-{branch}.json"
        report_path.write_text(json.dumps(report, indent=2) + "\n")
        reports.append(report)
        log(f"\n    report: {report_path}")

        success = bool(status) and "fail" not in status.lower()
        if success:
            if args.pull:
                step("Pulling artifacts")
                pull(crave, ws, args)
            break

    (workdir / "runs.json").write_text(json.dumps(reports, indent=2) + "\n")
    if len(reports) > 1:
        step("Summary")
        for r in reports:
            log(f"    {r['branch']:>10}  job {r['job_id'] or '?':>8}  {r['status']}")
    return 0 if success else 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(130)
