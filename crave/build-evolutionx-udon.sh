#!/usr/bin/env bash
#
# Evolution X (Android 17, manifest branch "cnb") for OnePlus 11R 5G
#   codename: udon   model: CPH2487   SoC: SM8475
#
# This script is meant to be executed BY A CRAVE BUILD NODE, i.e. passed to
# `crave run`, NOT run inside the devspace. See crave/README.md.
#
set -euxo pipefail

DEVICE="udon"
LUNCH_TARGET="evolution_${DEVICE}-userdebug"
MANIFEST_URL="https://github.com/Evolution-X/manifest"
MANIFEST_BRANCH="cnb"                    # Android 17
LM_REPO="https://github.com/Gokulgethu/oneplus11r-device-trees"
LM_BRANCH="arena/01a04613-oneplus11r-device-trees"

# ---------------------------------------------------------------- init
# Crave projects usually arrive pre-initialised. Only init if they did not.
if [ ! -d .repo ]; then
  repo init -u "$MANIFEST_URL" -b "$MANIFEST_BRANCH" --git-lfs --depth=1
fi

# ---------------------------------------------------------------- local manifests
rm -rf .repo/local_manifests
mkdir -p .repo/local_manifests
tmp_lm="$(mktemp -d)"
git clone --depth 1 -b "$LM_BRANCH" "$LM_REPO" "$tmp_lm"
cp "$tmp_lm/crave/local_manifests/"*.xml .repo/local_manifests/
rm -rf "$tmp_lm"

# ---------------------------------------------------------------- sync
# /opt/crave/resync.sh is Crave's cache-accelerated wrapper around `repo sync`.
if [ -x /opt/crave/resync.sh ]; then
  /opt/crave/resync.sh
else
  repo sync -c -j"$(nproc --all)" --force-sync --no-clone-bundle --no-tags
fi

# ---------------------------------------------------------------- build
source build/envsetup.sh
lunch "$LUNCH_TARGET"
mka bacon -j"$(nproc --all)"
