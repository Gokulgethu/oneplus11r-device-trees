# Building DerpFest for OnePlus 11R — `udon` / CPH2487 on Crave

**Target:** DerpFest **16.2** (Android 16, LineageOS 23.2 base) — the newest
published DerpFest manifest branch.

```
repo init -u https://github.com/DerpFest-AOSP/android_manifest.git -b 16.2 --git-lfs
lunch lineage_udon-userdebug
```

DerpFest ships its vendor fork at `vendor/lineage` and keeps LineageOS's
`lineage_<codename>` product naming, so the lunch target is `lineage_udon`,
not `derp_udon`.

> There is no DerpFest `17` manifest branch yet. `android_vendor_derpfest` and a
> few device trees have a `17` branch, but `DerpFest-AOSP/android_manifest` only
> publishes `16`, `16-priv`, `16.2`, `16.2-priv`. 16.2 is the newest buildable.

---

## Running the build on Crave

`crave run` queues onto a Crave **build node**. The devspace is only a thin
client for submitting the job and pulling artifacts — nothing compiles there.

```bash
# from a directory containing your crave.conf
crave -c crave.conf clone create --projectID <ID> derp-udon
cd derp-udon
```

**Step 1 — parse-only smoke test (do this first, it is cheap):**

```bash
crave run --no-patch --clean -- \
  "curl -sL https://raw.githubusercontent.com/Gokulgethu/oneplus11r-device-trees/arena/01a04613-oneplus11r-device-trees/crave/build-derpfest-udon.sh | BUILD_GOAL=nothing bash"
```

`m nothing` runs the full Kati/Soong parse without compiling. It surfaces every
missing path, dead HAL module name and broken inherit in minutes instead of
burning hours of build time.

**Step 2 — full build, once the parse is clean:**

```bash
crave run --no-patch --clean -- \
  "curl -sL https://raw.githubusercontent.com/Gokulgethu/oneplus11r-device-trees/arena/01a04613-oneplus11r-device-trees/crave/build-derpfest-udon.sh | bash"
```

**Pull the artifact:**

```bash
crave pull out/target/product/udon/*.zip
```

Useful flags: `--detached` (queue and disconnect), `--notify`, plus
`crave getlog`, `crave list`, `crave stop`.

Pick `--projectID` from `crave clone list` — a LineageOS-family project is the
right base for DerpFest 16.2.

---

## Upstream availability — the real constraint

| Component | Best available | Gap to 23.2 |
|---|---|---|
| `device/oneplus/sm8475-common` | `Teamslow/device_oneplus_sm8475-common` branch `13`, last commit **2023-04-15** | Android 13 → 16 |
| Kernel | `LineageOS/android_kernel_oneplus_sm8450` branch `lineage-22.2` | Android 15, 5.10 GKI |
| Vendor blobs | none published | must be extracted from a dump |

`LineageOS/android_device_oneplus_sm8450-common` and
`android_device_oneplus_ovaltine` **exist but are empty placeholder repos**
(0 bytes, no branches) — OnePlus SM8450/SM8475 was never brought up upstream.
Any manifest that references them will sync nothing.

There is no LineageOS `sm8475-common` at all, and
`android_kernel_oneplus_sm8450` has no 23.x branch.

---

## What was fixed in this repo

- `BoardConfig.mk` — `DEVICE_PATH` corrected `CPH2487` → `udon`; removed
  includes of the empty `sm8450-common`; removed the `OPLUS_LINEAGE_TOUCH_HAL`
  Soong config pointing at a nonexistent `touch/include`; dropped the duplicate
  matrix-file assignments already set by the common tree.
- `device.mk` — no longer includes both the local flattened common copy *and*
  the real common tree; vendor inherits reduced to paths `extract-files.sh`
  actually generates.
- `Android.mk` — `TARGET_DEVICE` guard was `CPH2487` while the product sets
  `PRODUCT_DEVICE := udon`, so the generated blob block never applied.
- `extract-files.sh` / `setup-makefiles.sh` — `DEVICE` corrected to `udon`.
- `lineage_udon.mk` — `core_64_bit.mk` → `core_64_bit_only.mk`; migrated the
  legacy `PRIVATE_BUILD_DESC` / `BUILD_FINGERPRINT` pair to the current
  `BuildDesc` / `BuildFingerprint` / `DeviceName` / `DeviceProduct` /
  `SystemDevice` / `SystemName` form; added `DERPFEST_BUILD_TYPE`.
- `lineage.dependencies`, `oneplus11r.xml` — repointed at repos that exist.

## What still has to be done

1. **Forward-port `sm8475-common` 13 → 23.2.** It supplies `bluetooth/include`,
   `sepolicy/`, `fingerprint/`, `KeyHandler`, `gpt-utils`, `interfaces/`,
   `oplus-fwk/` and the `libinit_oplus_taro` / `libudfps_extension.oplus_taro`
   Soong modules — none of which exist in this device tree.
2. **Drop the dead HIDL HALs.** `common.mk` still requests
   `android.hardware.audio@6.0-impl`, `android.hardware.audio.effect@6.0-impl`,
   `android.hardware.bluetooth.audio@2.1-impl` and
   `android.hardware.soundtrigger@2.3-impl`. These are AIDL-only on a 23.2 base.
3. **Kernel.** Either rebase `lineage-22.2` sm8450 onto 23.2, or ship a prebuilt
   kernel + modules from a matching OxygenOS build. `TARGET_KERNEL_CONFIG` is
   currently `vendor/taro-qgki_defconfig` — verify against the synced source.
4. **Blobs.** Dump a CPH2487 OxygenOS build matching the fingerprint in
   `lineage_udon.mk` and run `extract-files.sh` in both the common and device
   trees.
5. **Delete the vestigial flattened copies** (`common.mk`,
   `BoardConfigCommon.mk`, and the `configs/` overlap) once (1) lands.
6. **AVB keys.** `BoardConfigCommon.mk` uses
   `external/avb/test/data/testkey_rsa4096.pem` for every partition. Fine for
   testing, not for release. Do not relock the bootloader.

---

## Note on repository metadata

`README.md` and `BUILD_STATUS.md` advertise an OxygenOS base of
`CPH2487_16.0.5.1002(EX01)` with a `2026-07-01` security patch. The tracked
config files are the Android 13 sm8475-common contents from April 2023. Treat
the version strings as placeholders describing the intended target, not the
current state — `BUILD_STATUS.md` says as much itself.
