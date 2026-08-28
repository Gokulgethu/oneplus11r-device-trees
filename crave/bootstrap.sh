#!/bin/bash
#
# One-shot launcher — run this on ANY machine that can reach crave.io
# (your PC, a VPS, WSL, Termux...). No devspace, no GitHub Actions, no local
# 200 GB repo sync: the build itself happens on crave's servers.
#
#   bash <(curl -sL <RAW_URL_OF_THIS_FILE>) [crave.conf] [stage] [branch] [fallback] [extra args]
#
#   bash <(curl -sL .../bootstrap.sh) ~/Downloads/crave.conf preflight
#   bash <(curl -sL .../bootstrap.sh) ~/Downloads/crave.conf build seventeen sixteen
#   bash <(curl -sL .../bootstrap.sh) ""                     preflight   # creds via $HOME/crave.conf
#
# Your API key never leaves your machine: this script only copies the
# crave.conf you already downloaded into the kit directory (mode 600).
#
set -euo pipefail

REPO="Gokulgethu/oneplus11r-device-trees"
BRANCH="${KIT_BRANCH:-arena/01a048dd-oneplus11r-device-trees}"
TARBALL="https://codeload.github.com/${REPO}/tar.gz/refs/heads/${BRANCH}"

CONF_ARG="${1-}"
STAGE="${2:-preflight}"
PIXELOS_BRANCH="${3:-seventeen}"
FALLBACK="${4:-sixteen}"
EXTRA=("${@:5}")

KIT_DIR="${KIT_DIR:-${HOME}/.crave-udon-kit}"

say()  { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m[warn]\033[0m %s\n' "$*"; }
die()  { printf '\n\033[1;31m[fail]\033[0m %s\n' "$*" >&2; exit 1; }

command -v python3 >/dev/null || die "python3 is required"
command -v curl    >/dev/null || die "curl is required"

say "Fetching the build kit (${REPO}@${BRANCH})"
mkdir -p "${KIT_DIR}"
TMP="$(mktemp -d)"
trap 'rm -rf "${TMP}"' EXIT

# keep any credentials already installed
[ -f "${KIT_DIR}/crave/crave.conf" ] && cp "${KIT_DIR}/crave/crave.conf" "${TMP}/crave.conf.bak"

curl -fsSL -o "${TMP}/kit.tgz" "${TARBALL}" || die "download failed: ${TARBALL}"
tar xzf "${TMP}/kit.tgz" -C "${TMP}" --strip-components=1 --wildcards '*/crave/*' \
    || die "the kit does not contain a crave/ directory on branch ${BRANCH}"
[ -d "${TMP}/crave" ] || die "crave/ missing in the downloaded tarball"

rm -rf "${KIT_DIR}/crave"
mkdir -p "${KIT_DIR}/crave"
cp -a "${TMP}/crave/." "${KIT_DIR}/crave/"
chmod +x "${KIT_DIR}/crave/crave_build.py" "${KIT_DIR}/crave/run_build.sh" \
         "${KIT_DIR}/crave/preflight.py" 2>/dev/null || true
[ -f "${TMP}/crave.conf.bak" ] && cp "${TMP}/crave.conf.bak" "${KIT_DIR}/crave/crave.conf"
say "Kit installed in ${KIT_DIR}/crave"

cd "${KIT_DIR}/crave"

# ------------------------------------------------------------ credentials ---
if [ -n "${CONF_ARG}" ]; then
    [ -f "${CONF_ARG}" ] || die "crave.conf not found: ${CONF_ARG}"
    ./crave_build.py --import-config "${CONF_ARG}"
elif [ -f "${HOME}/crave.conf" ]; then
    ./crave_build.py --import-config "${HOME}/crave.conf"
elif [ -n "${CRAVE_USERNAME:-}" ] && [ -n "${CRAVE_TOKEN:-}" ]; then
    ./crave_build.py --import-config - <<EOF
{
  "username": "${CRAVE_USERNAME}",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "${CRAVE_TOKEN}",
    "User-Agent": "Crave"
  },
  "projects": [],
  "server": "https://foss.crave.io/api"
}
EOF
elif [ -f crave.conf ]; then
    say "Reusing the credentials already in ${KIT_DIR}/crave/crave.conf"
else
    cat <<'MSG'

No credentials given. Do one of these:

  1) point this script at the file you downloaded from
     https://foss.crave.io/app/#/apikeys :

       bash <(curl -sL .../bootstrap.sh) ~/Downloads/crave.conf preflight

  2) put it at $HOME/crave.conf and re-run

  3) export CRAVE_USERNAME=... CRAVE_TOKEN=... and re-run

MSG
    exit 1
fi

# ------------------------------------------------------------------ launch ---
say "Validating the source set (offline checks)"
python3 preflight.py || warn "preflight reported warnings — continuing"

say "Launching: stage=${STAGE} branch=${PIXELOS_BRANCH} fallback=${FALLBACK}"
exec ./run_build.sh "${STAGE}" "${PIXELOS_BRANCH}" "${FALLBACK}" "${EXTRA[@]}"
