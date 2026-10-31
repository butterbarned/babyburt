#!/usr/bin/env bash
# Runs update.sh repeatedly for init systems without a timer facility.
set -u

interval=${FLIGHT_UPDATE_INTERVAL:-120}
case "$interval" in
  ''|*[!0-9]*)
    echo "FLIGHT_UPDATE_INTERVAL must be a positive number of seconds" >&2
    exit 2
    ;;
esac

if [ "$interval" -eq 0 ]; then
  echo "FLIGHT_UPDATE_INTERVAL must be greater than zero" >&2
  exit 2
fi

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

while :; do
  # A failed fetch or rejected update should not stop future update attempts.
  "$script_dir/update.sh" || echo "dusklight update failed; will retry in $interval seconds" >&2
  sleep "$interval"
done
