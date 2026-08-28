#!/usr/bin/env bash
# ============================================================================
# OnePlus 11R 5G (udon / CPH2487) — direct foss.crave.io build script
# No GitHub Actions, no crave_aosp_builder — talks to the Crave API directly.
#
# Usage:
#   ./build_udon.sh derp14     # DerpFest 14 (branch "14")  — matches this tree
#   ./build_udon.sh derp15     # DerpFest 15.2 (latest source, DerpFest-LOS)
#
# Auth (either one):
#   a) Download crave.conf from https://foss.crave.io/app/#/api-keys and put it
#      next to this script, in its parent chain, or in $HOME
#   b) export CRAVE_USERNAME="your-username" CRAVE_TOKEN="Token xxxx..."
#
# The flashable zip appears in the Crave Artifacts tab:
#   https://foss.crave.io/app/#/builds?team=14
# ============================================================================
set -euo pipefail

ROM="${1:-derp14}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ---- Defaults (override via environment) ------------------------------------
LOCAL_MANIFEST_REPO="${LOCAL_MANIFEST_REPO:-https://github.com/Gokulgethu/local_manifests}"
LOCAL_MANIFEST_BRANCH="${LOCAL_MANIFEST_BRANCH:-main}"
DEVICE="${DEVICE:-udon}"
BUILD_TYPE="${BUILD_TYPE:-userdebug}"

# ---- Render crave.conf from env if not already present ----------------------
if ! find "$(pwd)" "$HOME" -maxdepth 1 -name crave.conf 2>/dev/null | grep -q .; then
  if [[ -n "${CRAVE_USERNAME:-}" && -n "${CRAVE_TOKEN:-}" ]]; then
    sed -e "s|\${CRAVE_USERNAME}|${CRAVE_USERNAME}|g" \
        -e "s|\${CRAVE_TOKEN}|${CRAVE_TOKEN}|g" \
        "${SCRIPT_DIR}/crave.conf.template" > "${HOME}/crave.conf"
    chmod 600 "${HOME}/crave.conf"
    echo "==> Rendered ${HOME}/crave.conf from CRAVE_USERNAME / CRAVE_TOKEN"
  else
    echo "ERROR: no crave.conf found and CRAVE_USERNAME/CRAVE_TOKEN not set." >&2
    echo "       Download crave.conf from https://foss.crave.io/app/#/api-keys" >&2
    exit 1
  fi
fi

command -v crave >/dev/null 2>&1 || { echo "ERROR: crave CLI not in PATH (curl -s https://raw.githubusercontent.com/accupara/crave/master/get_crave.sh | bash)" >&2; exit 1; }
command -v repo  >/dev/null 2>&1 || { echo "ERROR: repo tool not in PATH (sudo apt install repo or use ~/bin/repo)" >&2; exit 1; }
crave version

# ---- ROM selection -----------------------------------------------------------
case "$ROM" in
  derp14)
    # Crave base project: "DerpFest 14.0" (projectID 64). Branch 14 HEAD.
    # Matches this tree: hardware/oplus lineage-21, derp_udon lunch, mka derp.
    PROJECT_ID="${PROJECT_ID:-64}"
    BASE_INIT="repo init -u https://github.com/DerpFest-AOSP/manifest.git -b 14 --depth=1"
    REMOTE_INIT="repo init -u https://github.com/DerpFest-AOSP/manifest.git -b 14 --depth=1"
    LUNCH_TARGET="derp_${DEVICE}-${BUILD_TYPE}"
    BUILD_COMMAND="${BUILD_COMMAND:-mka derp}"
    MANIFEST_PATCH=""
    ;;
  derp15)
    # Latest DerpFest source: 15.2 (DerpFest-LOS). Closest A15 Crave cousin base
    # (PixelOS 15 = projectID 82). Hardware oplus HAL is bumped lineage-21 ->
    # lineage-22.1 on the fly to match Android 15.
    PROJECT_ID="${PROJECT_ID:-82}"
    BASE_INIT="repo init -u https://github.com/DerpFest-AOSP/manifest.git -b 14 --depth=1"
    REMOTE_INIT="repo init -u https://github.com/DerpFest-LOS/android_manifest.git -b 15.2 --git-lfs --depth=1"
    LUNCH_TARGET="lineage_${DEVICE}-bp1a-${BUILD_TYPE}"
    BUILD_COMMAND="${BUILD_COMMAND:-mka derp}"
    MANIFEST_PATCH="sed -i '/android_hardware_oplus/s|lineage-21|lineage-22.1|' .repo/local_manifests/udon.xml && "
    ;;
  *)
    echo "Unknown ROM '$ROM'. Use derp14 or derp15." >&2
    exit 1
    ;;
esac

# ---- Local workspace (gives crave its manifest/crave.yaml context) -----------
WORKSPACE="${WORKSPACE:-${HOME}/crave-udon-${ROM}}"
mkdir -p "$WORKSPACE"
cd "$WORKSPACE"
if [ ! -d .repo/manifests ]; then
  echo "==> Initializing base manifest in $WORKSPACE"
  $BASE_INIT
fi
mkdir -p .repo/manifests
cp -f "${SCRIPT_DIR}/crave.yaml" .repo/manifests/crave.yaml

PROJECT_FLAG=""
if [ -n "$PROJECT_ID" ]; then
  PROJECT_FLAG="--projectID $PROJECT_ID"
fi

echo "==> ROM: $ROM | device: $DEVICE | lunch: $LUNCH_TARGET | cmd: $BUILD_COMMAND"
echo "==> Queuing on foss.crave.io — watch https://foss.crave.io/app/#/builds?team=14"

# ---- Queue the build on Crave (all compilation happens on their nodes) -------
crave run --no-patch $PROJECT_FLAG -- \
  "rm -rf .repo/local_manifests/ && \
  $REMOTE_INIT ; \
  git clone $LOCAL_MANIFEST_REPO --depth 1 -b $LOCAL_MANIFEST_BRANCH .repo/local_manifests && \
  ${MANIFEST_PATCH}if [ -f /usr/bin/resync ]; then /usr/bin/resync; else /opt/crave/resync.sh; fi && \
  export BUILD_USERNAME=$(whoami) ; \
  export BUILD_HOSTNAME=crave ; \
  source build/envsetup.sh && \
  lunch $LUNCH_TARGET && \
  make installclean && \
  $BUILD_COMMAND"

echo "==> Done. Download the zip from the Crave Artifacts tab:"
echo "    https://foss.crave.io/app/#/builds?team=14"
