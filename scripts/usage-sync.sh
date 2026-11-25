#!/usr/bin/env bash
# Runs the usage sync. Put your Supabase values in ~/.config/portfolio-usage.env:
#   SUPABASE_URL=https://xyz.supabase.co
#   SUPABASE_SECRET_KEY=sb_secret_...
set -euo pipefail
cd "$(dirname "$0")/.."
ENV_FILE="${PORTFOLIO_USAGE_ENV:-$HOME/.config/portfolio-usage.env}"
if [ -f "$ENV_FILE" ]; then set -a; . "$ENV_FILE"; set +a; fi
node scripts/claude-usage.mjs
