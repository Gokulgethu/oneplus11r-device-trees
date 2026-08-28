# Installing the crave relay (GitHub Actions launcher)

The Arena coding agent's GitHub credential is an **App installation token**
without the `workflows` and `secrets: write` permissions, so it cannot create
`.github/workflows/*` or set repository secrets:

```
! [remote rejected] ... refusing to allow a GitHub App to create or update
  workflow `.github/workflows/crave-pixelos-udon.yml` without `workflows` permission
gh api .../actions/secrets/public-key -> 403 Resource not accessible by integration
```

Granting extra scopes inside Arena does not change it for a live session — the
token is minted with its permissions at issue time. So install the relay once,
by hand, using **one** of the routes below. After that the agent can dispatch
and monitor runs on its own (`gh workflow run`, `gh run watch`).

---

## Route A — one paste, needs `gh` + a GitHub login on your machine

```bash
cd /tmp && rm -rf udon-kit && git clone --depth 1 \
  -b arena/01a048dd-oneplus11r-device-trees \
  https://github.com/Gokulgethu/oneplus11r-device-trees.git udon-kit && cd udon-kit \
&& mkdir -p .github/workflows \
&& cp crave/relay/github-workflow.yml .github/workflows/crave-pixelos-udon.yml \
&& git add .github && git commit -m "ci: crave relay" && git push \
&& gh secret set CRAVE_USERNAME -b 'YOUR_CRAVE_USERNAME' -R Gokulgethu/oneplus11r-device-trees \
&& gh secret set CRAVE_TOKEN    -b 'YOUR_CRAVE_TOKEN'    -R Gokulgethu/oneplus11r-device-trees \
&& gh workflow run crave-pixelos-udon.yml -f mode=list
```

## Route B — GitHub web UI, no terminal

1. **Workflow file** — repo → *Add file* → *Create new file*
   → name it `.github/workflows/crave-pixelos-udon.yml`
   → paste the contents of [`github-workflow.yml`](github-workflow.yml) → *Commit changes*.
2. **Secrets** — *Settings* → *Secrets and variables* → *Actions* → *New repository secret*:
   * `CRAVE_USERNAME` = your crave username (e.g. `gokulgethu30@gmail.com`)
   * `CRAVE_TOKEN` = the `Authorization` value from the `crave.conf` you
     downloaded at https://foss.crave.io/app/#/apikeys
3. **Run it** — *Actions* → *PixelOS udon (crave relay)* → *Run workflow*:
   * `mode=list` first (prints the crave project ids available to your account)
   * then `mode=build`, `stage=sync` → `stage=preflight` → `stage=build`

---

## Notes

* This is **not** `crave_aosp_builder`, and it does **not** use a devspace.
  The runner only installs `repo` + the crave CLI and runs
  `crave/crave_build.py`, which calls `crave run --no-patch`.
* The API key lives only in GitHub secrets and in the runner's temp
  `crave.conf` (mode 600). It is never written into the repository.
* Compilation happens on crave's servers, so a build keeps running even if
  the GitHub job is cancelled or times out.
