#!/bin/env bash

SCRIPT_DIR="$(dirname -- "$(readlink -f -- "${BASH_SOURCE[0]}")")"

COMMIT_HASH="$(git rev-parse --short @)"
BUILD_DIR_PREFIX="$SCRIPT_DIR/build"
BUILD_DIR="$BUILD_DIR_PREFIX/$COMMIT_HASH"

ZIP_NAME="sk7725timecontrol.zip"
ZIP_PATH="$BUILD_DIR_PREFIX/$ZIP_NAME"

cleanup() {
    rm -rf "$BUILD_DIR"
}
trap cleanup EXIT

rm -rf "$BUILD_DIR_PREFIX"
mkdir -p "$BUILD_DIR"

git ls-files | xargs -I @ARG@ cp --parents -t "$BUILD_DIR/" @ARG@

cd "$BUILD_DIR_PREFIX"
rm -f "$ZIP_PATH"
zip -r "$ZIP_PATH" .

echo -e '\e[1m'"Saved mod file to '$ZIP_PATH'"'\e[0m'
