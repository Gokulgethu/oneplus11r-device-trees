# Universal Custom ROM Device Tree for OnePlus 11R 5G (`udon` / `CPH2487`)

This device tree is engineered for **universal compatibility** across all major AOSP and CAF-based custom ROMs (LineageOS, crDroid, PixelOS, Evolution X, RisingOS, Project Matrixx, DerpFest, SuperiorOS, etc.).

---

## 📱 Hardware & Firmware Specifications

| Feature | Specification |
|:---|:---|
| **Device Model** | OnePlus 11R 5G (India / Global) — `CPH2487` (Project ID: `22881`) |
| **Codename** | `udon` |
| **SoC** | Qualcomm Snapdragon 8+ Gen 1 (`SM8475`) |
| **Board / Platform** | `taro` / `waipio` (`sm8450-common` / `sm8475-common`) |
| **Architecture** | `arm64-v8a`, `armeabi-v7a` (Kryo 385 / Cortex-X2/A710/A510) |
| **Display** | 6.74" 1240 x 2772 pixels AMOLED, 120Hz, HDR10+, 450 PPI |
| **Fingerprint** | Optical Under-Display FOD (`POS_X=445`, `POS_Y=2200`, `SIZE=190`) |
| **Firmware Base** | Official OxygenOS `CPH2487_16.0.5.1002(EX01)` (Security Patch: `2026-07-01`) |
| **Stock Fingerprint** | `OnePlus/CPH2487/OP5961L1:16/BP2A.250605.015/T.R4T3.2e09920-970cae-a2101f:user/release-keys` |

---

## 🚀 Build target

**Primary target: DerpFest 16.2** (Android 16, LineageOS 23.2 base).

| Custom ROM | Manifest | Lunch Command | Product Makefile |
|:---|:---|:---|:---|
| **DerpFest** | `DerpFest-AOSP/android_manifest` `-b 16.2` | `lunch lineage_udon-userdebug` | `lineage_udon.mk` |
| **LineageOS** | `LineageOS/android` `-b lineage-23.2` | `lunch lineage_udon-userdebug` | `lineage_udon.mk` |

DerpFest ships its vendor fork at `vendor/lineage` and keeps LineageOS's
`lineage_<codename>` product naming, so the lunch target is `lineage_udon`,
not `derp_udon`.

The `aosp_udon.mk`, `crdroid_udon.mk`, `evolution_udon.mk` and `rising_udon.mk`
makefiles are retained but have **not** been updated for a 23.x base.

---

## ⚠️ Build status: bring-up incomplete

This tree does not compile yet. The blockers are upstream availability, not
configuration:

- **No modern common tree.** `device/oneplus/sm8475-common` exists only as
  `Teamslow/device_oneplus_sm8475-common` branch `13` (last commit 2023-04-15,
  Android 13). `LineageOS/android_device_oneplus_sm8450-common` is an *empty
  placeholder repo* — OnePlus SM8450/SM8475 was never brought up upstream.
- **No modern kernel.** `LineageOS/android_kernel_oneplus_sm8450` tops out at
  `lineage-22.2` (Android 15, 5.10 GKI).
- **No published blobs.** TheMuppets has no `udon` / CPH2487 vendor tree; they
  must be extracted from an OxygenOS dump.
- **Android 13-era HALs.** `common.mk` still requests HIDL modules such as
  `android.hardware.audio@6.0-impl` that are AIDL-only on 23.2.

Read **[`crave/README.md`](crave/README.md)** for the full audit, the Crave
build commands, and the remaining task list.

---

## 🛠️ Build Guide

### 1. Sync the source

```bash
repo init -u https://github.com/DerpFest-AOSP/android_manifest.git -b 16.2 --git-lfs
mkdir -p .repo/local_manifests
curl -sL -o .repo/local_manifests/udon.xml \
  https://raw.githubusercontent.com/Gokulgethu/oneplus11r-device-trees/main/crave/local_manifests/udon.xml
repo sync -c -j$(nproc --all) --force-sync --no-clone-bundle --no-tags
```

### 2. Extract proprietary blobs

From a CPH2487 OxygenOS dump matching the fingerprint in `lineage_udon.mk`:

```bash
cd device/oneplus/sm8475-common && ./extract-files.sh <path-to-dump>
cd ../udon                      && ./extract-files.sh <path-to-dump>
```

### 3. Verify the tree parses before compiling

```bash
source build/envsetup.sh
lunch lineage_udon-userdebug
m nothing        # full Kati/Soong parse, no compilation
```

### 4. Build

```bash
mka bacon -j$(nproc --all)
```

---

## 📂 Repository Contents

```
├── Android.bp
├── Android.mk
├── AndroidProducts.mk          # Unified lunch choices for all ROMs
├── BoardConfig.mk              # Chipset SM8475 / taro, display 450 DPI, FOD coords
├── BoardConfigCommon.mk        # Dynamic partitions, AVB 2.0, kernel definitions
├── BoardConfigVendor.mk
├── common.mk
├── lineage_udon.mk             # LineageOS product makefile
├── crdroid_udon.mk             # crDroid product makefile
├── evolution_udon.mk           # Evolution X product makefile
├── rising_udon.mk              # RisingOS product makefile
├── aosp_udon.mk                # Generic AOSP / PixelOS product makefile
├── lineage_CPH2487.mk          # CPH2487 model product makefile
├── vendorsetup.sh              # Lunch combos registration
├── lineage.dependencies        # Common tree and kernel dependencies
├── board-info.txt
├── config.fs
├── compatibility_matrix.xml
├── manifest.xml                # HAL definitions (Audio, Camera, Sensors, Fingerprint)
├── proprietary-files.txt       # Proprietary blob extraction list
├── extract-files.sh / setup-makefiles.sh
├── configs/audio/              # Audio policies, effects & mixer paths
├── init/                       # Stock fstab.qcom & fstab.default
└── overlay/                    # Framework and Bluetooth RRO overlays
```
