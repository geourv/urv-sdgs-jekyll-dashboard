# File: Gemfile
# Purpose: Ruby dependencies for Jekyll (kept minimal for GitHub Pages compatibility).
# How to use: Used by Dockerfile and GitHub Actions build.
# Related files:
#   - Dockerfile
#   - .github/workflows/pages.yml
# Safe edits:
#   - OK: Pin versions carefully; keep plugins minimal
#   - Careful: Adding unsupported plugins can break GitHub Pages build

source 'https://rubygems.org'

# GitHub Pages dependency set (also works locally)
gem 'github-pages', group: :jekyll_plugins

# Needed for `jekyll serve` on Ruby 3+ in some environments (including Docker)
gem 'webrick', '~> 1.8'