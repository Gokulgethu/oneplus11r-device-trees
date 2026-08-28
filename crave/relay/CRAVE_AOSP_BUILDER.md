# Building with `crave_aosp_builder` (your fork)

Your fork: **https://github.com/Gokulgethu/crave_aosp_builder** (fork of
`sounddrill31/crave_aosp_builder`, updated 2026‑08‑28).

The Arena agent's GitHub App token can only write to
`Gokulgethu/oneplus11r-device-trees` (push to the builder fork returns
`Permission ... denied to arena-ai-coding-agent[bot]`) and it has no
`workflows` / `secrets` / `actions` permission, so **two clicks are yours** and
everything else is prepared below.

---

## 0. ⚠️ Do this first — your crave API key is public

These files are committed in the **public** fork:

```
.github/workflows/CRAVE_TOKEN     -> 161-char JWT   (eyJhbG…SW0U)
.github/workflows/CRAVE_USERNAME  -> gokulg….com
```

Anyone can read them. Fix, in this order:

1. https://foss.crave.io/app/#/apikeys → **delete that key / regenerate** it.
2. Delete both files from the fork (they are not secrets, they are plain files —
   real secrets live in *Settings → Secrets and variables → Actions*).
3. Add the **new** key as a repository secret named `CRAVE_TOKEN`.

---

## 1. Activate the no-devspace builder (2 clicks)

`.github/workflows/main.obsolete` is the classic “Crave Builder”: all three
jobs run on `ubuntu-latest` and it calls `crave run` directly — **no devspace,
no self-hosted runner**. It is disabled only by its file name.

GitHub UI → the file → ✏️ (Edit) → change the name field to
`.github/workflows/main.yml` → *Commit changes*.

> The other workflow, `selfhosted.yml` (“Crave Builder(self-hosted)”), needs a
> GitHub runner installed **inside a crave devspace** (that is what its
> `Start-Runner` job does). Your 2026‑08‑23 runs of it failed. Use
> `main.yml` unless you specifically want the devspace runner.

## 2. Add the secrets

*Settings → Secrets and variables → Actions → New repository secret*

| Name | Value |
| :--- | :--- |
| `CRAVE_USERNAME` | your crave username (`gokulgethu30@gmail.com`) |
| `CRAVE_TOKEN` | the `Authorization` value from your (newly generated) `crave.conf` |

## 3. Run it

*Actions → Crave Builder → Run workflow*, with exactly these inputs:

| Input | Value | Why |
| :--- | :--- | :--- |
| `BASE_PROJECT` | **PixelOS 15** | crave project id 82 — pre-synced PixelOS workspace, so the sync to `seventeen` is incremental |
| `BUILD_DIFFERENT_ROM` | `repo init -u https://github.com/PixelOS-AOSP/android_manifest.git -b seventeen --git-lfs --depth=1` | latest PixelOS (Android 17) |
| `LOCAL_MANIFEST` | `https://raw.githubusercontent.com/Gokulgethu/oneplus11r-device-trees/arena/01a048dd-oneplus11r-device-trees/crave/manifests/pixelos-udon-seventeen.xml` | udon trees + the CAF HALs PixelOS does not ship |
| `LOCAL_MANIFEST_BRANCH` | *(leave default — ignored for a raw .xml URL)* | |
| `DEVICE_NAME` | `udon` | |
| `PRODUCT_NAME` | **`lineage_udon`** | see note below |
| `BUILD_TYPE` | `userdebug` | |
| `BUILD_COMMAND` | `mka bacon` | PixelOS build target |
| `CLEAN_BUILD` | `no` | |
| `REMOVALS` | *(leave empty)* | |

**About `PRODUCT_NAME`:** the udon device tree is a LineageOS-style tree; its
`AndroidProducts.mk` only defines `lineage_udon`. Use `lineage_udon` and you get
a ROM built from **PixelOS source** (PixelOS frameworks, Settings, apps) with a
Lineage-flavoured product — this is the normal shape of unofficial PixelOS
builds and it works unchanged.

If you want the product literally named `pixelos_udon`:

1. Fork `rocko5498/android_device_oneplus_udon` (branch `fresh-udon-20260727`).
2. Copy in `crave/device-overlay/pixelos_udon.mk` from this repo.
3. Add it to your fork's `AndroidProducts.mk`:
   ```make
   PRODUCT_MAKEFILES := \
       $(LOCAL_DIR)/lineage_udon.mk \
       $(LOCAL_DIR)/pixelos_udon.mk
   ```
4. Point the local manifest's `device/oneplus/udon` project at your fork.
5. Then set `PRODUCT_NAME=pixelos_udon`.

## 4. If Android 17 fails, fall back

Rerun with `BUILD_DIFFERENT_ROM` =
`repo init -u https://github.com/PixelOS-AOSP/android_manifest.git -b sixteen --git-lfs --depth=1`
and `LOCAL_MANIFEST` =
`…/crave/manifests/pixelos-udon-sixteen.xml`.

`sixteen` is Android 16 and matches the udon device/HAL/kernel trees exactly, so
it is the higher-probability build.

---

## Notes

* Everything the job needs is either in this repo (local manifests, product
  makefile) or on crave; no devspace is involved.
* `python3 crave/preflight.py --net` in this repo verifies all ~44
  repositories/revisions in the manifest before you spend build hours.
* The workflow's `Test Local Manifests` job syncs for 10 minutes as a smoke
  test first — if your manifest URL is wrong, it fails there in minutes.
