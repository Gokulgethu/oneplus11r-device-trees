# Direct Crave Build — OnePlus 11R (`udon`)

Queues ROM builds on [foss.crave.io](https://foss.crave.io/app/#/builds?team=14) using the
**crave CLI / API directly**. No GitHub Actions, no crave_aosp_builder.

## One-time setup (on your PC / VPS)

1. **Crave credentials** — download `crave.conf` from the API Keys page:
   <https://foss.crave.io/app/#/api-keys>
   Place it in `$HOME` or next to `build_udon.sh`.
   *(Alternative: `export CRAVE_USERNAME=...` and `export CRAVE_TOKEN=...` — the script
   renders `crave.conf` for you. Never paste the token in chats or commits.)*

2. **Install the crave CLI**:
   ```bash
   curl -s https://raw.githubusercontent.com/accupara/crave/master/get_crave.sh | bash
   sudo mv crave /usr/local/bin/
   ```

3. **Install `repo`**:
   ```bash
   sudo apt install repo   # or: mkdir -p ~/bin && curl https://storage.googleapis.com/git-repo-downloads/repo > ~/bin/repo && chmod a+x ~/bin/repo
   ```

## Start a build

```bash
./build_udon.sh derp14   # DerpFest 14  — derp_udon-userdebug + mka derp (matches this tree)
./build_udon.sh derp15   # DerpFest 15.2 (latest source) — lineage_udon-bp1a-userdebug + mka derp
```

The script prints the queue position, streams the sync/build log, and the flashable
`.zip` lands in the **Artifacts** tab of <https://foss.crave.io/app/#/builds?team=14>.

## Equivalent dashboard values (manual "New Build")

| Field | Value |
|:---|:---|
| Base Project | DerpFest 14.0 |
| Local Manifests Repository | `https://github.com/Gokulgethu/local_manifests` |
| Manifest Branch | `main` |
| Device Codename | `udon` |
| Lunch Target | `derp_udon-userdebug` |
| Build Command | `mka derp` |

## Notes

- `derp15` re-initializes the remote manifest to `DerpFest-LOS/android_manifest` branch
  `15.2` and bumps `hardware/oplus` to `lineage-22.1` automatically (your local manifest
  pins `lineage-21`, which matches DerpFest 14). If Crave's project list changed, override
  the A15 base with `PROJECT_ID=<id>` (`crave clone list` shows available projects).
- For a full clean build, add `--clean` to the `crave run` line inside the script.
- Files: `crave.conf.template` (credential template), `crave.yaml` (workspace persistence),
  `build_udon.sh` (the build entry point).
