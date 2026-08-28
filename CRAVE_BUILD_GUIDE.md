# 🚀 Crave.io Build Guide: Evolution X (Android 17) for OnePlus 11R (`udon` / `CPH2487`)

This guide explains how to compile **Evolution X 12.1 (Android 17 - `cnb`)** for the **OnePlus 11R 5G (`udon` / `CPH2487`)** using **`crave.conf` to submit builds to the Crave cloud queue** at [foss.crave.io](https://foss.crave.io).

---

## ⚠️ Important: Queue vs Devspace

> **Do NOT try to build the ROM inside devspace hardware (`crave devspace`).**
>
> - **Devspaces** have limited RAM and CPU meant only for file editing and git operations. Compiling full AOSP/Evolution X inside devspace will run out of memory.
> - **Build Queue (`crave run` with `crave.conf`)**: Submits the job to Crave's dedicated high-performance cloud build cluster (64GB+ RAM, 32 vCPUs, NVMe build caching). Your build waits in the queue, gets picked up by a build node, compiles rapidly, and can be pulled once finished.

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
| **Authentication** | `crave.conf` API Key |
| **Build Host** | Crave Cloud Build Queue (`foss.crave.io`) |

---

## 🔑 Step 1: Set Up `crave.conf`

The Crave CLI requires an API key in `crave.conf` to authenticate your account and submit builds to the queue.

A ready-to-use template is included at `crave.conf.sample`:

```json
{
  "username": "YOUR_EMAIL@gmail.com",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "YOUR_JWT_CRAVE_TOKEN",
    "User-Agent": "Crave"
  },
  "projects": [],
  "server": "https://foss.crave.io/api"
}
```

Copy the sample or download your active key from [foss.crave.io/api/keys](https://foss.crave.io):
```bash
cp crave.conf.sample crave.conf
# Or place it at ~/.crave/crave.conf
```

---

## ⚡ Step 2: Queue the Build

### Option A: Using the Automated Queue Runner (`queue_build.sh`)

The included `queue_build.sh` script handles CLI verification, parameter parsing, and queue submission:

```bash
# Standard queue submission (streams live build output in your terminal)
./queue_build.sh

# Detached queue submission (submits to queue and returns immediately)
./queue_build.sh --detached

# Clean rebuild (forces full clean build without cache)
./queue_build.sh --clean
```

---

### Option B: Manual Crave CLI Queue Command

Run directly from your terminal using `crave run`:

```bash
crave -c crave.conf run --no-patch -- "rm -rf .repo/local_manifests && \
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

To queue in the background (detached mode):
```bash
crave -c crave.conf run --detached --no-patch -- "..."
```

---

## 📊 Step 3: Monitoring the Build Queue

You can check the status of your queued build at any time:

1. **Web Dashboard**: View your queue position and live graphs at [https://foss.crave.io/#/builds](https://foss.crave.io/#/builds).
2. **CLI List**:
   ```bash
   crave list
   ```
3. **Live Log Stream**:
   ```bash
   crave getlog
   ```
4. **Cancel / Stop Build**:
   ```bash
   crave stop
   ```

---

## 📦 Step 4: Download Build Artifacts

Once the queue completes compilation:

```bash
# Pull flashable Evolution X ROM zip
crave pull "out/target/product/udon/EvolutionX-17.0-*.zip"

# Pull partition images for recovery/fastboot
crave pull out/target/product/udon/boot.img
crave pull out/target/product/udon/recovery.img
crave pull out/target/product/udon/dtbo.img
crave pull out/target/product/udon/vendor_boot.img
```

---

## ⚙️ Manifest Architecture (`evolution_udon.xml`)

| Component | Path in Tree | Remote Repository | Branch |
|:---|:---|:---|:---|
| **Device Tree** | `device/oneplus/udon` | `Gokulgethu/oneplus11r-device-trees` | `arena/01a042ed-oneplus11r-device-trees` |
| **Common Tree** | `device/oneplus/sm8450-common` | `pjgowtham/android_device_oneplus_sm8450-common` | `lineage-22.1` |
| **Kernel Source** | `kernel/oneplus/sm8450` | `LineageOS/android_kernel_oneplus_sm8450` | `lineage-22.1` |
| **Hardware HALs** | `hardware/oplus` | `LineageOS/android_hardware_oplus` | `lineage-24.0` (Android 17) |
| **Proprietary Vendor** | `vendor/oneplus/udon` | `oneplus-11r-udon/vendor_oneplus_udon` | `14` |
| **Common Vendor** | `vendor/oneplus/sm8450-common` | `oneplus-11r-udon/vendor_oneplus_sm8450-common` | `staging` |

---

## 📲 Flashing Instructions (OnePlus 11R 5G)

1. **Reboot to Recovery**:
   ```bash
   adb reboot recovery
   ```
2. **Format Data** *(Mandatory for Android 17 File-Based Encryption)*:
   - In recovery, navigate to **Wipe > Format Data** and type `yes`.
3. **Flash ROM Zip**:
   - Select **Apply update from ADB** (or Advanced > ADB Sideload).
   ```bash
   adb sideload EvolutionX-17.0-*-udon-*.zip
   ```
4. **Reboot**:
   - Select **Reboot system now**. Initial boot takes 2–4 minutes.
