#!/usr/bin/env bash
# ==============================================================================
# One-line Crave.io Build Trigger for Evolution X Android 17 (OnePlus 11R / udon)
# Usage: ./crave_run.sh
# Requires: crave CLI installed and configured with crave.conf
# ==============================================================================

set -eo pipefail

echo "==> Sending build command to Crave.io..."

crave run --no-patch -- "rm -rf .repo/local_manifests && \
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
lunch evolution_udon-userdebug && \
make installclean && \
mka bacon -j\$(nproc --all)"

echo "==> Build complete on Crave! Pulling build artifacts..."
mkdir -p out_crave
crave pull out/target/product/udon/*.zip
crave pull out/target/product/udon/boot.img
crave pull out/target/product/udon/recovery.img
crave pull out/target/product/udon/dtbo.img
crave pull out/target/product/udon/vendor_boot.img

echo "==> Artifacts downloaded to current workspace!"
ls -lh *.zip *.img 2>/dev/null || true
