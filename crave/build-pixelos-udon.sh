#!/bin/bash
#
# PixelOS build for OnePlus 11R (udon / CPH2487) — runs ON the crave.io build server.
#
# This script is rendered by crave/crave_build.py (which inlines the local
# manifest and the pixelos_udon.mk product file) and is executed with
# `crave run --no-patch -- "<this script>"`. It never runs inside a devspace.
#
# Tunables (all optional, the driver exports them):
#   PIXELOS_BRANCH   sixteen | seventeen                 (default seventeen)
#   MANIFEST_URL     PixelOS manifest git url
#   LUNCH_TARGET     default pixelos_udon-userdebug
#   BUILD_TARGET     bacon (PixelOS) | installclean+bacon ...
#   STAGE            sync | preflight | build | all      (default all)
#   CLEAN            1 = make installclean before building
#   JOBS             parallel jobs (default nproc)
#
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
export TZ="${TZ:-UTC}"
export LANG=C.UTF-8

PIXELOS_BRANCH="${PIXELOS_BRANCH:-seventeen}"
MANIFEST_URL="${MANIFEST_URL:-https://github.com/PixelOS-AOSP/android_manifest}"
MANIFEST_BRANCH="${MANIFEST_BRANCH:-${PIXELOS_BRANCH}}"
LUNCH_TARGET="${LUNCH_TARGET:-pixelos_udon-userdebug}"
BUILD_TARGET="${BUILD_TARGET:-bacon}"
STAGE="${STAGE:-all}"
CLEAN="${CLEAN:-0}"
JOBS="${JOBS:-$(nproc)}"
DEVICE="udon"
OUTDIR="out/target/product/${DEVICE}"

BUILD_USERNAME="${BUILD_USERNAME:-crave}"
BUILD_HOSTNAME="${BUILD_HOSTNAME:-crave}"
export BUILD_USERNAME BUILD_HOSTNAME
export USE_CCACHE=1
export CCACHE_EXEC="${CCACHE_EXEC:-/usr/bin/ccache}"
export SKIP_ABI_CHECKS=true
export ALLOW_MISSING_DEPENDENCIES=true
export ANDROID_JAVA_HOME="${ANDROID_JAVA_HOME:-/usr/lib/jvm/java-17-openjdk-amd64}"
[ -d "${ANDROID_JAVA_HOME}" ] || unset ANDROID_JAVA_HOME

say()  { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
warn() { printf '\n\033[1;33m[warn]\033[0m %s\n' "$*"; }
die()  { printf '\n\033[1;31m[fail]\033[0m %s\n' "$*" >&2; exit 1; }

say "PixelOS ${PIXELOS_BRANCH} for ${DEVICE} — stage=${STAGE}"
echo "    manifest : ${MANIFEST_URL} -b ${MANIFEST_BRANCH}"
echo "    lunch    : ${LUNCH_TARGET}"
echo "    target   : ${BUILD_TARGET}   jobs=${JOBS}  clean=${CLEAN}"
echo "    host     : $(uname -a)"
echo "    nproc    : $(nproc)   mem: $(free -g | awk '/Mem:/{print $2"G"}')"
df -h / | tail -1

# ------------------------------------------------------------------ repo ----
ensure_repo() {
    command -v repo >/dev/null 2>&1 && return 0
    mkdir -p "${HOME}/bin"
    for url in \
        "https://storage.googleapis.com/git-repo-downloads/repo" \
        "https://raw.githubusercontent.com/GerritCodeReview/git-repo/main/repo"; do
        if curl -fsSL -o "${HOME}/bin/repo" "${url}"; then
            chmod +x "${HOME}/bin/repo"
            export PATH="${HOME}/bin:${PATH}"
            command -v repo >/dev/null 2>&1 && return 0
        fi
    done
    die "could not install 'repo'"
}

sync_sources() {
    say "Syncing sources"
    ensure_repo
    git config --global user.name  "${BUILD_USERNAME}"  || true
    git config --global user.email "${BUILD_USERNAME}@crave.local" || true
    git config --global --add safe.directory '*' || true

    rm -rf .repo/local_manifests
    repo init -u "${MANIFEST_URL}" -b "${MANIFEST_BRANCH}" --git-lfs --depth=1

    mkdir -p .repo/local_manifests
    cat > .repo/local_manifests/udon.xml <<'UDON_LOCAL_MANIFEST_EOF'
@@LOCAL_MANIFEST@@
UDON_LOCAL_MANIFEST_EOF

    # stale os_pickup linkfiles from a previous sync poison the build
    find hardware -maxdepth 3 -name 'os_pickup*' -print -delete 2>/dev/null || true

    local rc=0
    if [ -x /opt/crave/resync.sh ]; then
        /opt/crave/resync.sh || rc=$?
    elif [ -x /usr/bin/resync ]; then
        /usr/bin/resync || rc=$?
    else
        repo sync -c -j"${JOBS}" --force-sync --no-clone-bundle --no-tags || rc=$?
    fi
    [ "${rc}" -eq 0 ] || die "repo sync failed (rc=${rc})"
    du -sh . 2>/dev/null | tail -1
}

# ------------------------------------------------------- product makefile ----
install_pixelos_product() {
    say "Installing pixelos_${DEVICE} product makefile"
    [ -d "device/oneplus/${DEVICE}" ] || die "device/oneplus/${DEVICE} missing after sync"

    cat > "device/oneplus/${DEVICE}/pixelos_${DEVICE}.mk" <<'PIXELOS_PRODUCT_MK_EOF'
@@PIXELOS_PRODUCT_MK@@
PIXELOS_PRODUCT_MK_EOF

    # register the lunch combo (idempotent)
    local ap="device/oneplus/${DEVICE}/AndroidProducts.mk"
    [ -f "${ap}" ] || printf 'PRODUCT_MAKEFILES :=\nCOMMON_LUNCH_CHOICES :=\n' > "${ap}"
    if ! grep -q "pixelos_${DEVICE}.mk" "${ap}"; then
        python3 - "${ap}" "${DEVICE}" <<'PY'
import sys
path, device = sys.argv[1], sys.argv[2]
text = open(path).read()
entry = f"$(LOCAL_DIR)/pixelos_{device}.mk"
if "PRODUCT_MAKEFILES" not in text:
    text = "PRODUCT_MAKEFILES := \\\n    " + entry + "\n\n" + text
else:
    text = text.replace("PRODUCT_MAKEFILES := \\\n",
                        "PRODUCT_MAKEFILES := \\\n    " + entry + " \\\n", 1)
choices = "".join(f"    pixelos_{device}-{v} \\\n" for v in ("user", "userdebug", "eng"))
if "COMMON_LUNCH_CHOICES" not in text:
    text = text.rstrip() + "\n\nCOMMON_LUNCH_CHOICES := \\\n" + choices
else:
    text = text.replace("COMMON_LUNCH_CHOICES := \\\n",
                        "COMMON_LUNCH_CHOICES := \\\n" + choices, 1)
open(path, "w").write(text)
PY
    fi
    echo "--- ${ap} ---"
    cat "${ap}"
}

# ------------------------------------------------------------- preflight ----
preflight() {
    say "Preflight: validating the product configuration"
    # shellcheck disable=SC1091
    source build/envsetup.sh
    ( lunch "${LUNCH_TARGET}" ) || {
        echo "--- available products containing '${DEVICE}' ---"
        lunch 2>&1 | grep -i "${DEVICE}" || true
        die "lunch ${LUNCH_TARGET} failed"
    }
    echo "--- key build vars ---"
    get_build_var PRODUCT_NAME
    get_build_var PRODUCT_DEVICE
    get_build_var TARGET_PRODUCT
    get_build_var TARGET_KERNEL_SOURCE
    get_build_var TARGET_KERNEL_CONFIG
    get_build_var TARGET_BOARD_PLATFORM
    say "Preflight: building the soong/make graph only (fast fail)"
    m nothing -j"${JOBS}" || die "'m nothing' failed — fix the tree before burning a full build"
}

# ----------------------------------------------------------------- build ----
build() {
    say "Building ${BUILD_TARGET}"
    # shellcheck disable=SC1091
    source build/envsetup.sh
    lunch "${LUNCH_TARGET}" || die "lunch ${LUNCH_TARGET} failed"
    if [ "${CLEAN}" = "1" ]; then
        make installclean
    fi
    mka "${BUILD_TARGET}" -j"${JOBS}" || die "build failed"
}

# ------------------------------------------------------------- artifacts ----
collect() {
    say "Collecting artifacts"
    mkdir -p "${OUTDIR}"
    echo "##UDON_ARTIFACTS_START##"
    # shellcheck disable=SC2044
    for f in $(find "${OUTDIR}" -maxdepth 1 \
                 \( -name 'PixelOS_*.zip' -o -name 'pixelos_*.zip' \
                    -o -name '*.img' -o -name '*.json' -o -name '*.md5sum' \) \
                 -type f | sort); do
        echo "$(sha256sum "${f}" | cut -d' ' -f1)  $(du -h "${f}" | cut -f1)  ${f}"
    done
    echo "##UDON_ARTIFACTS_END##"
    echo
    echo "Build log : ${OUTDIR}/../../../../.."
    ls -lh "${OUTDIR}" | head -40
}

case "${STAGE}" in
    sync)      sync_sources ;;
    preflight) sync_sources; install_pixelos_product; preflight ;;
    build)     install_pixelos_product; build; collect ;;
    all)       sync_sources; install_pixelos_product; preflight; build; collect ;;
    *)         die "unknown STAGE=${STAGE}" ;;
esac

say "Done (stage=${STAGE})"
