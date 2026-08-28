#!/usr/bin/env bash
#
# DerpFest 16.2 (Android 16 / LineageOS 23.2 base) for OnePlus 11R 5G
#   codename: udon    model: CPH2487    SoC: SM8475 (taro)
#
# Executed BY A CRAVE BUILD NODE via `crave run` -- never inside the devspace.
# See crave/README.md.
#
set -euxo pipefail

DEVICE="udon"
LUNCH_TARGET="lineage_${DEVICE}-userdebug"
MANIFEST_URL="https://github.com/DerpFest-AOSP/android_manifest.git"
MANIFEST_BRANCH="16.2"
LM_REPO="https://github.com/Gokulgethu/oneplus11r-device-trees"
LM_BRANCH="arena/01a04613-oneplus11r-device-trees"

# BUILD_GOAL=nothing  -> parse-only smoke test (cheap, minutes)
# BUILD_GOAL=bacon    -> full flashable zip
BUILD_GOAL="${BUILD_GOAL:-bacon}"

# ---------------------------------------------------------------- init
# Always (re)init. Crave pre-initialises the workspace with whatever manifest
# the chosen --projectID maps to, which may not be DerpFest. repo init is
# idempotent and cheap, so this guarantees we are on DerpFest 16.2 regardless
# of which project the job was queued against.
repo init -u "$MANIFEST_URL" -b "$MANIFEST_BRANCH" --git-lfs

# ---------------------------------------------------------------- local manifests
rm -rf .repo/local_manifests
mkdir -p .repo/local_manifests
tmp_lm="$(mktemp -d)"
git clone --depth 1 -b "$LM_BRANCH" "$LM_REPO" "$tmp_lm"
cp "$tmp_lm/crave/local_manifests/"*.xml .repo/local_manifests/
rm -rf "$tmp_lm"

# ---------------------------------------------------------------- sync
# /opt/crave/resync.sh is Crave's cache-accelerated `repo sync` wrapper.
if [ -x /opt/crave/resync.sh ]; then
  /opt/crave/resync.sh
else
  repo sync -c -j"$(nproc --all)" --force-sync --no-clone-bundle --no-tags
fi

# ---------------------------------------------------------------- build
source build/envsetup.sh
lunch "$LUNCH_TARGET"

if [ "$BUILD_GOAL" = "nothing" ]; then
  # Full Kati/Soong parse without compiling anything. Surfaces missing
  # paths, dead HAL module names and broken inherits in minutes.
  m nothing
else
  mka bacon -j"$(nproc --all)"
fi
