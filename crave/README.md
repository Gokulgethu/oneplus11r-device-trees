# PixelOS for OnePlus 11R (`udon` / `CPH2487`) — crave.io API build kit

Build PixelOS on crave.io **with your crave API key only** — no devspace, no
`crave_aosp_builder` GitHub Action, no local 200 GB `repo sync`.
The whole build runs on crave's servers; this directory is the control plane.

```
your machine / any VPS ──crave CLI (crave.conf = API key)──▶ crave.io build server
                                                              ├─ repo init PixelOS
                                                              ├─ + udon local manifest
                                                              ├─ repo sync (server side)
                                                              └─ lunch pixelos_udon-userdebug && mka bacon
```

---

## 1. Prerequisites

| What | Where |
| :--- | :--- |
| crave API key (`crave.conf`) | https://foss.crave.io/app/#/apikeys → **API Keys** → download |
| network access to `foss.crave.io` | required on the machine that *launches* the build |
| `python3`, `curl`, `bash` | the launching machine |

`crave.conf` looks like this (JSON):

```json
{
  "username": "your-crave-username",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "your-crave-token",
    "User-Agent": "Crave"
  },
  "projects": [],
  "server": "https://foss.crave.io/api"
}
```

Three ways to hand the credentials to the driver — pick one:

```bash
export CRAVE_USERNAME=... CRAVE_TOKEN=...        # env vars
cp ~/Downloads/crave.conf crave/crave.conf       # file (gitignored)
./crave_build.py --username ... --token ...      # flags
```

---

## 2. Quick start

```bash
cd crave

# 0) offline sanity check of everything this kit generates
python3 preflight.py --net

# 1) see exactly what would be sent to crave (touches nothing)
CRAVE_USERNAME=... CRAVE_TOKEN=... ./crave_build.py --branch seventeen --dry-run

# 2) launch the build (detached — safe to close the terminal)
CRAVE_USERNAME=... CRAVE_TOKEN=... ./crave_build.py --branch seventeen --stage all
```

Stages — `--stage` lets you stop early instead of burning a 3-hour job on a
tree that cannot even configure:

| Stage | What happens on the crave server | Why you want it |
| :--- | :--- | :--- |
| `sync` | `repo init` + local manifest + `repo sync` | warm up the workspace |
| `preflight` | sync, then `lunch pixelos_udon-userdebug` + `m nothing` | **fails in ~10 min** if the tree is broken |
| `build` | `lunch` + `mka bacon` (re-use the synced workspace) | iterate on build errors |
| `all` | sync → preflight → build → collect | one-shot |

Recommended first run: `--stage preflight`.
If it passes, re-run with `--stage build` — the workspace is preserved, so
nothing is re-downloaded.

---

## 3. Running it from a machine without the repo

`--print-command` emits a single self-contained script (credentials + build
script inlined as base64). Pipe it to any shell that can reach crave.io:

```bash
CRAVE_USERNAME=... CRAVE_TOKEN=... ./crave_build.py --branch seventeen --print-command > /tmp/build-udon.sh
bash /tmp/build-udon.sh
```

---

## 4. Files

| File | Purpose |
| :--- | :--- |
| `crave_build.py` | the driver: renders, launches, polls, pulls artifacts |
| `build-pixelos-udon.sh` | runs **on the crave server**; template with `@@LOCAL_MANIFEST@@` / `@@PIXELOS_PRODUCT_MK@@` placeholders |
| `manifests/gen_local_manifest.py` | generates the udon local manifest (device/vendor/kernel + the CAF HALs PixelOS does not ship) |
| `manifests/pixelos-udon-sixteen.xml` | generated — PixelOS 16 (Android 16) |
| `manifests/pixelos-udon-seventeen.xml` | generated — PixelOS 17 (Android 17, latest) |
| `device-overlay/pixelos_udon.mk` | injected into `device/oneplus/udon/` — the `pixelos_udon` product |
| `crave.conf.example` | credential template |
| `preflight.py` | offline + `--net` validation of everything above |

Artifacts are declared in `crave_build.py` (`ARTIFACTS`) and pulled to
`out/target/product/udon/` on the machine that runs `crave pull`
(`--pull`, or `crave pull out/target/product/udon` afterwards).

---

## 5. Which PixelOS branch?

| Branch | Android | Device trees | Status |
| :--- | :--- | :--- | :--- |
| `sixteen` | 16 (`android-16.0.0_r1`) | LineageOS 23.2 / A16 udon trees + A16 CAF HALs | **matched** |
| `seventeen` | 17 (`android-17.0.0_r1`) | same A16 trees + A17 CAF HALs | latest, but the device/kernel/vendor trees have no A17 port yet |

`--branch` defaults to `seventeen` (latest, as requested). If the A17 build
fails in HAL/kernel glue, switch to `--branch sixteen` — everything else stays
identical and the device trees are then version-matched.

---

## 6. About the source set (read this once)

PixelOS is AOSP based: its manifest ships **no** Qualcomm CAF HALs, no
`device/qcom/sepolicy_vndr` and no `vendor/qcom/opensource/*`. The udon trees
are LineageOS style and need all of them, so
`manifests/gen_local_manifest.py` merges:

* the udon device / vendor / kernel / hardware trees (pinned, known-good),
* the `sm8450` CAF HAL set extracted from the LineageOS manifest for the
  matching Android version,
* `hardware/oplus` and `hardware/dolby`.

`python3 preflight.py --net` verifies that **every** one of those ~44
repositories and revisions actually exists before you spend build hours on it.

Run `python3 manifests/gen_local_manifest.py --android 16` (or `17`) to
regenerate the manifests after an upstream change.

---

## 7. Signing (optional)

For a signed build, add to `crave_build.py`'s rendered `crave.yaml` (or pass
`--message` / edit `crave.yaml` after rendering):

```yaml
PixelOS:
  env:
    BUCKET_NAME: ...
    KEY_ENCRYPTION_PASSWORD: ...
    BKEY_ID: ...
    BAPP_KEY: ...
```

and set `--build-target "target-files-package otatools"` then run
`/opt/crave/crave_sign.sh`.
