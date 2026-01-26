# File: Dockerfile
# Purpose: Build a local Jekyll runtime image for this site (used by docker-compose).
# How to run:
#   - Preferred: docker compose up --build
# Related files:
#   - docker-compose.yml (runs this image, mounts the repo, exposes ports)
#   - entrypoint.sh (fixes permissions for mounted volumes and runs Jekyll as non-root)
#   - Gemfile / Gemfile.lock (Ruby dependencies)
# Safe edits:
#   - OK: Add apt packages (e.g., git, build tools), tweak CMD flags (livereload/polling).
#   - Careful: WORKDIR, BUNDLE_* env vars, and mount paths; they affect caching/permissions.

FROM ruby:3.2-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs npm \
    && rm -rf /var/lib/apt/lists/*

# Non-root user for running the server (mounted volumes may be root-owned; entrypoint fixes that).
RUN useradd -m -u 1000 -d /home/jekyll -s /bin/bash jekyll

WORKDIR /srv/jekyll

ENV HOME=/home/jekyll \
    BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_APP_CONFIG=/usr/local/bundle \
    BUNDLE_USER_CACHE=/usr/local/bundle/cache \
    BUNDLE_SILENCE_ROOT_WARNING=1

COPY Gemfile Gemfile.lock* ./
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 4000 35729

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["bundle exec jekyll serve --host 0.0.0.0 --livereload --force_polling"]
