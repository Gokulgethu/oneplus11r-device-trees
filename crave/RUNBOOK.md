# RUNBOOK — kicking off the DerpFest 16.2 build for `udon`

Copy-paste commands. Run these from your own machine or your Crave devspace —
they cannot be run from the Arena sandbox (see "Why not from here" at the end).

Target: **DerpFest 16.2** (Android 16, LineageOS 23.2 base)
Lunch:  **`lineage_udon-userdebug`**

---

## 0. One-time setup

```bash
# crave CLI
curl -s https://raw.githubusercontent.com/accupara/crave/master/get_crave.sh | bash -s --
chmod +x ./crave
sudo mv ./crave /usr/local/bin/

# put your crave.conf next to where you will run commands, or at $HOME/crave.conf
# crave searches CWD, then parents, then $HOME
mv "crave.conf (11).txt" ~/crave.conf
chmod 600 ~/crave.conf
```

Never commit `crave.conf` — it carries your API token. This repo's `.gitignore`
covers it.

## 1. Create the workspace

```bash
crave clone list                     # find a LineageOS-family projectID
crave clone create --projectID <ID> derp-udon
cd derp-udon
```

The build script re-runs `repo init` against the DerpFest manifest itself, so it
does not matter much which project you pick — it just needs to be an
Android/LineageOS-family one.

---

## 2. Parse-only smoke test — RUN THIS FIRST

Costs minutes, not hours. `m nothing` does the full Kati/Soong parse without
compiling, so it enumerates every missing path and dead HAL module at once.

```bash
crave run --no-patch --clean -- "\
rm -rf .repo/local_manifests && \
mkdir -p .repo/local_manifests && \
curl -sL -o .repo/local_manifests/udon.xml \
  https://raw.githubusercontent.com/Gokulgethu/oneplus11r-device-trees/arena/01a04613-oneplus11r-device-trees/crave/local_manifests/udon.xml && \
repo init -u https://github.com/DerpFest-AOSP/android_manifest.git -b 16.2 --git-lfs && \
/opt/crave/resync.sh && \
source build/envsetup.sh && \
lunch lineage_udon-userdebug && \
m nothing"
```

**Expect this to fail.** That is the point — the failure list is the bring-up
TODO. Paste the log back to me and I will work through it.

Known issues it should surface, per the audit in `crave/README.md`:

- `device/oneplus/sm8475-common` is Android 13 and will not parse against 23.2
- `common.mk` requests HIDL modules that no longer exist
  (`android.hardware.audio@6.0-impl`, `android.hardware.audio.effect@6.0-impl`,
  `android.hardware.bluetooth.audio@2.1-impl`,
  `android.hardware.soundtrigger@2.3-impl`)
- `vendor/oneplus/udon` is absent — no blobs have been extracted yet

---

## 3. Full build — only once step 2 is clean

```bash
crave run --no-patch --clean --notify -- \
  "curl -sL https://raw.githubusercontent.com/Gokulgethu/oneplus11r-device-trees/arena/01a04613-oneplus11r-device-trees/crave/build-derpfest-udon.sh | bash"
```

Add `--detached` to queue and disconnect.

## 4. Collect

```bash
crave list                       # job status
crave getlog                     # stream/show log
crave pull out/target/product/udon/*.zip
```

---

## Why this cannot be run from the Arena sandbox

Two independent blockers, both verified:

1. **`crave.conf` never arrived.** The attachment did not materialise in the
   workspace — there is no `/home/user/uploads/`, and no new file anywhere on
   the filesystem.
2. **Egress to Crave is blocked.** The sandbox proxy allows `github.com` only.
   TCP to `crave.io:443` connects but TLS is refused
   (`SSL_ERROR_SYSCALL`), and `raw.githubusercontent.com` is blocked too — so
   the crave CLI cannot even be installed here, let alone authenticate.

Even with the conf file, the build could not be launched from this sandbox. The
commands above have to run somewhere with real network access. Everything else —
device tree fixes, manifest, build script, log triage — I can do from here.
