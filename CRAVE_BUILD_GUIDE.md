# 🚀 Crave.io Build Guide: Evolution X (Android 17) for OnePlus 11R (`udon` / `CPH2487`)

This guide explains how to compile **Evolution X 12.1 (Android 17 - `cnb`)** for the **OnePlus 11R 5G (`udon` / `CPH2487`)** using **[Crave.io](https://crave.io)** cloud devspaces.

---

## 📋 Device & Build Overview

| Parameter | Value |
|:---|:---|
| **Device Codename** | `udon` / `CPH2487` (Project ID: `22881`) |
| **SoC** | Qualcomm Snapdragon 8+ Gen 1 (`SM8475` / `taro`) |
| **ROM Base** | [Evolution X](https://github.com/Evolution-X) |
| **Android Version** | **Android 17** (Manifest Branch: `cnb`, Version: `12.1`) |
| **Target Product** | `evolution_udon` |
| **Lunch Target** | `evolution_udon-userdebug` |
| **Build Platform** | Crave.io Cloud Build Nodes (foss.crave.io) |

---

## ⚡ Method 1: Automatic Build via GitHub Actions (One-Click)

The repository includes a ready-to-use GitHub Actions workflow located at `ci/crave_evolution_x.yml` (can be symlinked or placed into `.github/workflows/crave_evolution_x.yml`).

### Prerequisites
1. Go to your repository on GitHub: **Settings > Secrets and variables > Actions**.
2. Optional: Add `CRAVE_USERNAME` and `CRAVE_TOKEN` (from `crave.conf` downloaded from [foss.crave.io](https://foss.crave.io)).
   *(If omitted, built-in defaults configured for Gokulgethu are automatically applied).*

### Run the Build:
1. Navigate to the **Actions** tab on GitHub.
2. Select **Build Evolution X Android 17 (Crave.io)**.
3. Click **Run workflow**:
   - **Build Variant:** `userdebug`
   - **Clean workspace:** `no` (uses cached ccache on Crave for ~15 min builds)
   - **Compilation Command:** `mka bacon`
4. Click **Run workflow**. Crave cloud nodes will compile the ROM, pull the `.zip` and `.img` files, and automatically upload them as workflow artifacts and release assets!

---

## 🖥️ Method 2: Crave Devspace CLI Build (Recommended for Developers)

### Step 1: Install and Configure Crave CLI
If you don't have the `crave` binary on your machine:
```bash
# Download Crave CLI
curl -s https://raw.githubusercontent.com/accupara/crave/master/get_crave.sh | bash -s --
sudo mv crave /usr/local/bin/

# Verify installation
crave version
```

Place your `crave.conf` in your home directory `~/.crave/crave.conf` or `~/crave.conf`:
```json
{
  "username": "YOUR_EMAIL@gmail.com",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "YOUR_CRAVE_JWT_TOKEN",
    "User-Agent": "Crave"
  },
  "projects": [],
  "server": "https://foss.crave.io/api"
}
```

---

### Step 2: Initialize Devspace or Run One-Shot Command

You can use the included `crave_run.sh` script or run the command directly:

```bash
./crave_run.sh
```

Or execute the complete Crave pipeline manually:

```bash
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
```

---

### Step 3: Pull the Built ROM and Images

Once compilation finishes, pull the artifacts to your local workstation:

```bash
# Pull the flashable ROM zip
crave pull "out/target/product/udon/EvolutionX-17.0-*.zip"

# Pull the boot and recovery images
crave pull out/target/product/udon/boot.img
crave pull out/target/product/udon/recovery.img
crave pull out/target/product/udon/dtbo.img
crave pull out/target/product/udon/vendor_boot.img
```

---

## 📦 Manifest Architecture (`evolution_udon.xml`)

The Crave build pulls these exact trees for OnePlus 11R:

| Component | Path | Source Repository | Branch |
|:---|:---|:---|:---|
| **Device Tree** | `device/oneplus/udon` | `Gokulgethu/oneplus11r-device-trees` | `arena/01a042ed-oneplus11r-device-trees` |
| **Common Tree** | `device/oneplus/sm8450-common` | `pjgowtham/android_device_oneplus_sm8450-common` | `lineage-22.1` |
| **Kernel Source** | `kernel/oneplus/sm8450` | `LineageOS/android_kernel_oneplus_sm8450` | `lineage-22.1` |
| **Hardware HALs** | `hardware/oplus` | `LineageOS/android_hardware_oplus` | `lineage-24.0` (Android 17) |
| **Proprietary Vendor** | `vendor/oneplus/udon` | `oneplus-11r-udon/vendor_oneplus_udon` | `14` |
| **Common Vendor** | `vendor/oneplus/sm8450-common` | `oneplus-11r-udon/vendor_oneplus_sm8450-common` | `staging` |

---

## 📲 Flashing Instructions (OnePlus 11R 5G)

### Pre-requisites
- Unlocked bootloader on official OxygenOS 14/15/16 firmware.
- Custom Recovery installed (OrangeFox or TWRP recovery).
- Latest platform-tools (`fastboot`, `adb`).

### Step-by-Step Installation:
1. **Reboot to Recovery**:
   ```bash
   adb reboot recovery
   ```
2. **Format Data** *(Mandatory for Android 17 File-Based Encryption)*:
   - In recovery, navigate to **Wipe > Format Data** and type `yes`.
3. **Flash ROM Zip**:
   - In recovery, select **Apply update from ADB** (or Advanced > ADB Sideload).
   ```bash
   adb sideload EvolutionX-17.0-*-udon-*.zip
   ```
4. **Reboot**:
   - Reboot system. The first boot on Android 17 takes 2–4 minutes.
