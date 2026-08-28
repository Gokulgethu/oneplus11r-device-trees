#!/bin/bash
#
# Convenience wrapper around crave_build.py.
#
#   ./run_build.sh [stage] [branch] [fallback-branch] [extra crave_build.py args]
#
#   ./run_build.sh preflight                 # PixelOS 17 first, fall back to 16
#   ./run_build.sh build   seventeen sixteen
#   ./run_build.sh all     sixteen
#
# Credentials come from crave/crave.conf (gitignored), $HOME/crave.conf or the
# CRAVE_USERNAME / CRAVE_TOKEN environment variables.
#
set -euo pipefail
cd "$(dirname "$0")"

STAGE="${1:-preflight}"
BRANCH="${2:-seventeen}"
FALLBACK="${3:-sixteen}"
EXTRA=("${@:4}")

if [ ! -f crave.conf ] && [ ! -f "$HOME/crave.conf" ] && [ -z "${CRAVE_TOKEN:-}" ]; then
    echo "No crave credentials found."
    echo
    echo "  1. download crave.conf from https://foss.crave.io/app/#/apikeys"
    echo "  2. then either:"
    echo "       cp /path/to/crave.conf $(pwd)/crave.conf"
    echo "     or:"
    echo "       ./crave_build.py --import-config /path/to/crave.conf"
    echo
    echo "  (crave.conf is gitignored — it will never be committed)"
    exit 1
fi

exec ./crave_build.py \
    --branch "$BRANCH" \
    --fallback-branch "$FALLBACK" \
    --stage "$STAGE" \
    "${EXTRA[@]}"
