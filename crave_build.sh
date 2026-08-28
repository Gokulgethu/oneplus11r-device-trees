#!/usr/bin/env bash
# ==============================================================================
# Crave.io Evolution X Android 17 (cnb) Build Script
# Target Device: OnePlus 11R 5G (udon / CPH2487)
# SoC: Qualcomm Snapdragon 8+ Gen 1 (SM8475 / taro)
# ==============================================================================

set -eo pipefail

echo "================================================================================"
echo " Starting Evolution X Android 17 (v12.1) Build for OnePlus 11R (udon)"
echo " Build Platform: foss.crave.io Devspace"
echo " Date: $(date -u)"
echo "================================================================================"

DEVICE="udon"
PRODUCT="evolution_udon"
BUILD_TYPE="userdebug"
ROM_MANIFEST="https://github.com/Evolution-X/manifest"
ROM_BRANCH="cnb"
DEVICE_TREE_REPO="https://github.com/Gokulgethu/oneplus11r-device-trees.git"
DEVICE_TREE_BRANCH="arena/01a042ed-oneplus11r-device-trees"

# 1. Clean existing local manifests
echo "==> Step 1: Configuring local manifests..."
rm -rf .repo/local_manifests
mkdir -p .repo/local_manifests

# 2. Initialize Evolution X Android 17 repository
echo "==> Step 2: Initializing Evolution X ($ROM_BRANCH) manifest..."
repo init -u "$ROM_MANIFEST" -b "$ROM_BRANCH" --git-lfs --depth=1

# 3. Create the device local manifest
echo "==> Step 3: Installing OnePlus 11R local manifest..."
cat << 'EOF' > .repo/local_manifests/evolution_udon.xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest>
  <remote name="github" fetch="https://github.com/" />
  <remote name="gitlab" fetch="https://gitlab.com/" />

  <!-- OnePlus 11R 5G (udon / CPH2487) Device Tree -->
  <project name="Gokulgethu/oneplus11r-device-trees"
           path="device/oneplus/udon"
           remote="github"
           revision="arena/01a042ed-oneplus11r-device-trees" />

  <!-- Common Chipset Tree (SM8450 / SM8475 Snapdragon 8+ Gen 1) -->
  <project name="pjgowtham/android_device_oneplus_sm8450-common"
           path="device/oneplus/sm8450-common"
           remote="github"
           revision="lineage-22.1" />

  <!-- Unified Kernel Source for SM8450 / SM8475 -->
  <project name="LineageOS/android_kernel_oneplus_sm8450"
           path="kernel/oneplus/sm8450"
           remote="github"
           revision="lineage-22.1" />

  <!-- Hardware OPlus HAL Additions -->
  <project name="LineageOS/android_hardware_oplus"
           path="hardware/oplus"
           remote="github"
           revision="lineage-24.0" />

  <!-- OnePlus 11R Proprietary Vendor Blobs -->
  <project name="oneplus-11r-udon/vendor_oneplus_udon"
           path="vendor/oneplus/udon"
           remote="github"
           revision="14" />

  <!-- Common Proprietary Vendor Blobs -->
  <project name="oneplus-11r-udon/vendor_oneplus_sm8450-common"
           path="vendor/oneplus/sm8450-common"
           remote="github"
           revision="staging" />
</manifest>
EOF

# 4. Crave Resync (leverages local NVMe caches on foss.crave.io)
echo "==> Step 4: Synchronizing repositories..."
if [ -f /opt/crave/resync.sh ]; then
  echo "Using Crave accelerated resync script..."
  /opt/crave/resync.sh
elif [ -f /usr/bin/resync ]; then
  /usr/bin/resync
else
  echo "Falling back to standard repo sync..."
  repo sync -c -j"$(nproc --all)" --force-sync --no-clone-bundle --no-tags --optimized-fetch --prune
fi

# 5. Ensure device tree path symlinks
echo "==> Step 5: Setting up device directories..."
if [ -d device/oneplus/udon ] && [ ! -d device/oneplus/CPH2487 ]; then
  ln -sf udon device/oneplus/CPH2487
elif [ -d device/oneplus/CPH2487 ] && [ ! -d device/oneplus/udon ]; then
  ln -sf CPH2487 device/oneplus/udon
fi

# 6. Environment Setup
echo "==> Step 6: Setting up build environment..."
export BUILD_USERNAME="Gokulgethu"
export BUILD_HOSTNAME="crave"
export EVO_BUILD_TYPE="Unofficial"
export WITH_GMS="true"

source build/envsetup.sh

# 7. Lunch target configuration
echo "==> Step 7: Selecting lunch combo (${PRODUCT}-${BUILD_TYPE})..."
lunch "${PRODUCT}-${BUILD_TYPE}"

# 8. Clean target output directory
echo "==> Step 8: Running installclean..."
make installclean

# 9. Build compilation
echo "==> Step 9: Compiling Evolution X package with $(nproc --all) cores..."
mka bacon -j"$(nproc --all)"

# 10. Summary and checksums
echo "================================================================================"
echo " BUILD FINISHED SUCCESSFULLY!"
echo " Artifacts in out/target/product/${DEVICE}/:"
echo "================================================================================"
ls -lh out/target/product/${DEVICE}/*.zip || true
ls -lh out/target/product/${DEVICE}/*.img || true

echo "--- SHA256 Checksums ---"
sha256sum out/target/product/${DEVICE}/*.zip 2>/dev/null || true
sha256sum out/target/product/${DEVICE}/boot.img 2>/dev/null || true
sha256sum out/target/product/${DEVICE}/recovery.img 2>/dev/null || true
echo "================================================================================"
