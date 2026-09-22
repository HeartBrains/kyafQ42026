#!/usr/bin/env bash
set -euo pipefail

# Fail-closed guard for duplicate builds/deployments. This script performs no
# network calls and never mutates a repository or host.

required=(
  DUPLICATE_REPO_URL
  DUPLICATE_HOST
  DUPLICATE_DOCUMENT_ROOT
  DUPLICATE_WP_BASE_URL
  DUPLICATE_SITE_URL
)

missing=()
for name in "${required[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    missing+=("$name")
  fi
done

if (( ${#missing[@]} > 0 )); then
  printf 'Duplicate preflight failed: missing %s\n' "${missing[*]}" >&2
  exit 2
fi

# These are known live identifiers from this repository's deployment context.
# Add any additional production host/repository identifiers via
# LIVE_TARGET_IDENTIFIERS (comma-separated) before running the guard.
live_identifiers=(
  "content.khaoyaiart.org"
  "khaoyaiart.org"
  "github.com/HeartBrains/khaoyaiart-next"
)

# Explicitly approved staging identifiers may share the parent domain with
# production (for example, dev.khaoyaiart.org). They are still checked against
# the live list unless listed here.
allowed_staging_identifiers=(
  "dev.khaoyaiart.org"
  "q42026.content.khaoyaiart.org"
)
if [[ -n "${DUPLICATE_ALLOWED_IDENTIFIERS:-}" ]]; then
  IFS=',' read -r -a extra_allowed <<< "$DUPLICATE_ALLOWED_IDENTIFIERS"
  allowed_staging_identifiers+=("${extra_allowed[@]}")
fi
if [[ -n "${LIVE_TARGET_IDENTIFIERS:-}" ]]; then
  IFS=',' read -r -a extra_identifiers <<< "$LIVE_TARGET_IDENTIFIERS"
  live_identifiers+=("${extra_identifiers[@]}")
fi

targets=(
  "$DUPLICATE_REPO_URL"
  "$DUPLICATE_HOST"
  "$DUPLICATE_DOCUMENT_ROOT"
  "$DUPLICATE_WP_BASE_URL"
  "$DUPLICATE_SITE_URL"
)

for target in "${targets[@]}"; do
  normalized_target="${target,,}"
  is_allowed=false
  for allowed in "${allowed_staging_identifiers[@]}"; do
    normalized_allowed="${allowed,,}"
    if [[ -n "$normalized_allowed" && (
      "$normalized_target" == "$normalized_allowed" ||
      "$normalized_target" == "https://$normalized_allowed" ||
      "$normalized_target" == "https://$normalized_allowed/"* ||
      "$normalized_target" == "http://$normalized_allowed" ||
      "$normalized_target" == "http://$normalized_allowed/"*
    ) ]]; then
      is_allowed=true
      break
    fi
  done
  if [[ "$is_allowed" == true ]]; then
    continue
  fi
  for live in "${live_identifiers[@]}"; do
    normalized_live="${live,,}"
    if [[ -n "$normalized_live" && "$normalized_target" == *"$normalized_live"* ]]; then
      printf 'Duplicate preflight failed: duplicate target contains live identifier %q\n' "$live" >&2
      exit 3
    fi
  done
done

if [[ "$DUPLICATE_DOCUMENT_ROOT" == "/" || "$DUPLICATE_DOCUMENT_ROOT" == "." ]]; then
  printf 'Duplicate preflight failed: document root is too broad: %q\n' "$DUPLICATE_DOCUMENT_ROOT" >&2
  exit 4
fi

printf 'Duplicate preflight passed.\n'
printf 'Repository: %s\n' "$DUPLICATE_REPO_URL"
printf 'Host: %s\n' "$DUPLICATE_HOST"
printf 'Document root: %s\n' "$DUPLICATE_DOCUMENT_ROOT"
printf 'WordPress base URL: %s\n' "$DUPLICATE_WP_BASE_URL"
printf 'Site URL: %s\n' "$DUPLICATE_SITE_URL"
