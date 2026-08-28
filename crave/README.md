# Building Evolution X (Android 17) for OnePlus 11R — `udon` / CPH2487 on Crave

## How to run (build on Crave build nodes, not the devspace)

`crave run` queues the command onto a Crave **build node**. The devspace is only
used as a thin client to submit the job and pull artifacts — nothing is compiled
there.

```bash
# from a directory containing your crave.conf
crave -c crave.conf clone create --projectID <ID> evox-udon
cd evox-udon

crave run --no-patch --clean -- \
  "curl -sL https://raw.githubusercontent.com/Gokulgethu/oneplus11r-device-trees/arena/01a04613-oneplus11r-device-trees/crave/build-evolutionx-udon.sh | bash"
```

Pull the artifact once the job finishes:

```bash
crave pull out/target/product/udon/*.zip
```

Useful flags: `--detached` (queue and disconnect), `--notify`, `crave getlog`,
`crave stop`.

Pick `--projectID` from `crave clone list`. Evolution X `cnb` is LineageOS
23.x-based, so a LineageOS-family project is the right base.

---

## Blocking issues — read before queueing

A build queued today **will not compile**. These are upstream availability
problems, not script bugs.

### 1. No Android 17-era common tree

`BoardConfig.mk` / `device.mk` include `device/oneplus/sm8475-common`. That path
has exactly one public implementation:

| Repo | Branch | Last commit |
|---|---|---|
| `Teamslow/device_oneplus_sm8475-common` | `13` | 2023-04-15 (Android 13) |

`LineageOS/android_device_oneplus_sm8475-common` and
`LineageOS/android_device_oneplus_sm8450-common` **do not exist** — despite being
referenced by `oneplus11r.xml`, `lineage.dependencies` and `BoardConfig.mk` in
this repo.

### 2. No proprietary blobs

TheMuppets carries no `udon` / CPH2487 vendor tree. Only
`Teamslow/vendor_oneplus_2487` (Android 13 blobs) exists. Blobs must be extracted
from a CPH2487 OxygenOS dump matching the firmware you intend to ship.

### 3. No matching kernel

`kernel/oneplus/sm8450` (referenced in `BoardConfigCommon.mk`) has no
LineageOS 23.x branch. The real source is
`OnePlusOSS/android_kernel_oneplus_sm8475`, branch
`oneplus_sm8475_t_13.0_oneplus_11R_5G` — a 5.10 GKI Android 13 kernel.

### 4. This tree is Android 13/14 vintage

`common.mk` requests HIDL HALs that Android 17 no longer builds, e.g.
`android.hardware.audio@6.0-impl`, `android.hardware.audio.effect@6.0-impl`,
`android.hardware.bluetooth.audio@2.1-impl`, `android.hardware.soundtrigger@2.3-impl`.
These are AIDL-only on a 23.x base. `evolution_udon.mk` also inherits
`core_64_bit.mk`, while current LineageOS device trees use `core_64_bit_only.mk`.

### 5. Evolution X `cnb` is early bring-up

Upstream lists 3 devices on `cnb`. The `bka` branch (Android 16 QPR2, ~45 devices)
is the stable target.

---

## Realistic paths forward

**A. Target Evolution X `bka` (Android 16) instead of `cnb`.**
Still a multi-generation forward-port, but onto a branch with real device
coverage and a working LineageOS 23.x reference to copy from.

**B. Do the bring-up first.** Roughly, in order:
1. Fork `Teamslow/device_oneplus_sm8475-common` and forward-port 13 → 23.x
   (HIDL→AIDL HALs, SELinux, `soong` namespaces, fstab/AVB).
2. Rebase the kernel onto a 6.x GKI base, or ship prebuilt kernel + modules.
3. Dump a current CPH2487 OxygenOS build and regenerate `vendor/oneplus/udon`.
4. Fix the dangling references in `oneplus11r.xml`, `lineage.dependencies`,
   `BoardConfig.mk` and `device.mk`.

**C. Verify the tree compiles at all.** Before spending Crave credits on
`mka bacon`, queue a parse-only job:

```bash
crave run --no-patch -- "source build/envsetup.sh && lunch evolution_udon-userdebug && m nothing"
```

`m nothing` exercises the whole Kati/Soong parse without compiling. It is cheap
and will surface the missing-path errors above in minutes.

---

## Note on repository metadata

`README.md` and `BUILD_STATUS.md` in this repo advertise an OxygenOS base of
`CPH2487_16.0.5.1002(EX01)` with a `2026-07-01` security patch, and
`BoardConfig.mk` sets `VENDOR_SECURITY_PATCH := 2026-07-01`. The tracked config
files are the Android 13 sm8475-common contents from April 2023. Treat the
version strings as aspirational placeholders rather than a description of what
is checked in — `BUILD_STATUS.md` says as much itself.
