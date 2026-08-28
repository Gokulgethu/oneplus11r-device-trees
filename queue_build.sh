#!/usr/bin/env bash
# ==============================================================================
# Crave.io Queue Build Script: Evolution X Android 17 (cnb)
# Target Device: OnePlus 11R 5G (udon / CPH2487)
# SoC: Qualcomm Snapdragon 8+ Gen 1 (SM8475 / taro)
#
# NOTE: This submits the build to Crave's cloud build queue via crave.conf.
# It does NOT run inside devspace hardware. The job is queued and processed
# by Crave's dedicated 64GB RAM cloud build nodes.
# ==============================================================================

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/crave.conf"

if [ ! -f "$CONFIG_FILE" ]; then
  if [ -f "${HOME}/crave.conf" ]; then
    CONFIG_FILE="${HOME}/crave.conf"
  elif [ -f "${SCRIPT_DIR}/crave.conf.sample" ]; then
    echo "==> crave.conf not found. Initializing from crave.conf.sample..."
    cp "${SCRIPT_DIR}/crave.conf.sample" "${SCRIPT_DIR}/crave.conf"
    CONFIG_FILE="${SCRIPT_DIR}/crave.conf"
  else
    echo "Error: crave.conf not found! Download your API key from https://foss.crave.io/#/apikeys"
    exit 1
  fi
fi

# Ensure crave CLI binary is available
if ! command -v crave &>/dev/null; then
  echo "==> crave binary not found in PATH. Checking local directory..."
  if [ -f "${SCRIPT_DIR}/crave" ]; then
    CRAVE_BIN="${SCRIPT_DIR}/crave"
  else
    echo "==> Downloading latest Crave CLI binary..."
    curl -s https://raw.githubusercontent.com/accupara/crave/master/get_crave.sh | bash -s --
    chmod +x crave
    CRAVE_BIN="${SCRIPT_DIR}/crave"
  fi
else
  CRAVE_BIN="crave"
fi

# Parse CLI options
DETACHED=""
CLEAN=""
BUILD_VARIANT="userdebug"

for arg in "$@"; do
  case $arg in
    --detached|-d)
      DETACHED="--detached"
      shift
      ;;
    --clean|-c)
      CLEAN="--clean"
      shift
      ;;
    --user)
      BUILD_VARIANT="user"
      shift
      ;;
    --eng)
      BUILD_VARIANT="eng"
      shift
      ;;
  esac
done

echo "================================================================================"
echo " Submitting Evolution X Android 17 Build to Crave Cloud Queue"
echo " Device: OnePlus 11R 5G (udon / CPH2487)"
echo " SoC: Qualcomm Snapdragon 8+ Gen 1 (SM8475)"
echo " ROM: Evolution X 12.1 (cnb)"
echo " Target: evolution_udon-${BUILD_VARIANT}"
echo " Config: ${CONFIG_FILE}"
[ -n "$DETACHED" ] && echo " Mode: Detached (submits to queue and exits immediately)"
[ -n "$CLEAN" ] && echo " Workspace: Clean full rebuild"
echo "================================================================================"

# Build command payload executed on the Crave 64GB cloud build node
BUILD_PAYLOAD="rm -rf .repo/local_manifests && \
mkdir -p .repo/local_manifests && \
repo init -u https://github.com/Evolution-X/manifest -b cnb --git-lfs --depth=1 && \
curl -sL https://raw.githubusercontent.com/Gokulgethu/oneplus11r-device-trees/arena/01a042ed-oneplus11r-device-trees/evolution_udon.xml -o .repo/local_manifests/evolution_udon.xml && \
if [ -f /opt/crave/resync.sh ]; then /opt/crave/resync.sh; else /usr/bin/resync; fi && \
[ -d device/oneplus/udon ] && [ ! -d device/oneplus/CPH2487 ] && ln -sf udon device/oneplus/CPH2487; \
export BUILD_USERNAME=Gokulgethu && \
export BUILD_HOSTNAME=crave && \
export EVO_BUILD_TYPE=Unofficial && \
export WITH_GMS=true && \
source build/envsetup.sh && \
lunch evolution_udon-${BUILD_VARIANT} && \
make installclean && \
mka bacon -j\$(nproc --all)"

# Submit to queue
"$CRAVE_BIN" -c "$CONFIG_FILE" run --no-patch $CLEAN $DETACHED -- "$BUILD_PAYLOAD"

if [ -n "$DETACHED" ]; then
  echo ""
  echo "================================================================================"
  echo " Job successfully queued on Crave!"
  echo " - Track build progress in browser: https://foss.crave.io/#/builds"
  echo " - Check running jobs in CLI:       $CRAVE_BIN list"
  echo " - Stream live build logs:          $CRAVE_BIN getlog"
  echo " - Once complete, pull ROM:         $CRAVE_BIN pull out/target/product/udon/*.zip"
  echo "================================================================================"
else
  echo ""
  echo "================================================================================"
  echo " Build finished on Crave Cloud node!"
  echo " Pulling generated artifacts to local workspace..."
  echo "================================================================================"
  "$CRAVE_BIN" -c "$CONFIG_FILE" pull "out/target/product/udon/EvolutionX-17.0-*.zip" || true
  "$CRAVE_BIN" -c "$CONFIG_FILE" pull "out/target/product/udon/boot.img" || true
  "$CRAVE_BIN" -c "$CONFIG_FILE" pull "out/target/product/udon/recovery.img" || true
  "$CRAVE_BIN" -c "$CONFIG_FILE" pull "out/target/product/udon/dtbo.img" || true
  "$CRAVE_BIN" -c "$CONFIG_FILE" pull "out/target/product/udon/vendor_boot.img" || true
  ls -lh *.zip *.img 2>/dev/null || true
fi
