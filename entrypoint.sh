#!/usr/bin/env bash
set -euo pipefail

# File: entrypoint.sh
# Purpose: Development entrypoint for the Docker container. Fixes permissions for mounted volumes and runs Jekyll as non-root.
# How to run:
#   - Preferred: docker compose up --build
# Related files:
#   - Dockerfile (installs runtime deps and calls this entrypoint)
#   - docker-compose.yml (mounts the repo into /srv/jekyll and caches gems under /usr/local/bundle)
# Safe edits:
#   - OK: Add extra setup steps (e.g., install additional gems) or tweak the final Jekyll command flags.
#   - Careful: The chown targets and bundle paths; changing them can reintroduce permission errors.

mkdir -p /usr/local/bundle /usr/local/bundle/cache /home/jekyll/.bundle
chown -R jekyll:jekyll /usr/local/bundle /home/jekyll /srv/jekyll

# Install gems into the mounted bundle cache (fast after the first run)
su -s /bin/bash jekyll -c "bundle install"

# Run the provided command (defaults to Jekyll serve) as non-root
exec su -s /bin/bash jekyll -c "$*"
