#!/usr/bin/env bash
#
# recover-tunnel.sh - one-command recovery when the netbird tunnel URL rotates.
#
# The `netbird expose 8000` URL changes every time the tunnel process
# restarts (VPS reboot, netbird restart, or a crash).  This script takes the
# new URL, verifies the planner is alive behind it, rebuilds the frontend
# bundle with the new URL + key baked in, and pushes so Vercel redeploys.
#
# Usage (from the women-safety repo, on a machine with the repo + git):
#   bash scripts/recover-tunnel.sh
#
# You still need the new URL first - from the VPS:
#   sudo journalctl -u netbird-expose-8000 -n 30 | grep -E 'URL:|exposed'
#
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==============================================================="
echo " Tunnel URL recovery"
echo "==============================================================="
echo "1) Get the current URL on the VPS:"
echo "     sudo journalctl -u netbird-expose-8000 -n 30 | grep -E 'URL:|exposed'"
echo
read -rp "2) Paste the new tunnel URL (https://....netbird.services): " NEW_URL
NEW_URL="${NEW_URL%/}"   # strip any trailing slash

if [[ -z "$NEW_URL" || "$NEW_URL" != https://* ]]; then
  echo "ERROR: that does not look like an https:// tunnel URL. Aborting - nothing changed."
  exit 1
fi

echo
echo "== Verifying $NEW_URL/health ..."
if ! curl -fsS -m 20 "$NEW_URL/health" | grep -q '"status":"ok"'; then
  echo "ERROR: $NEW_URL/health did not return {\"status\":\"ok\"}."
  echo "  - Is the planner running?  sudo systemctl status planner.service"
  echo "  - Is the tunnel up?        sudo systemctl status netbird-expose-8000"
  echo "Aborting - nothing changed."
  exit 1
fi
echo "OK - planner is alive behind the new URL."

# Keep the API key already in .env (either name), else prompt for one.
KEY=""
if [[ -f .env ]]; then
  KEY="$(grep -E '^(PLANNER_API_KEY|VITE_PLANNER_API_KEY)=' .env | tail -1 | cut -d= -f2- || true)"
fi
if [[ -z "$KEY" ]]; then
  read -rp "Planner API key (from the VPS unit file): " KEY
fi
if [[ -z "$KEY" ]]; then
  echo "ERROR: no API key provided - a bundle without the key would be rejected"
  echo "       by the planner (401) and the app would fall back to straight lines."
  echo "  Grab it on the VPS: sudo grep PLANNER_API_KEY /etc/systemd/system/planner.service"
  echo "Aborting - nothing changed."
  exit 1
fi

echo "== Testing the API key against $NEW_URL ..."
if ! curl -fsS -m 30 -X POST "$NEW_URL/generate-route" \
    -H 'content-type: application/json' -H "X-API-Key: $KEY" \
    -d '{"start_lat":30.338,"start_lon":76.3895,"goal_lat":30.3286,"goal_lon":76.3978,"altitude_m":80,"speed_mps":15,"snap_start_goal":true}' \
    | grep -q '"mission_id"'; then
  echo "ERROR: the API key was rejected by the new URL (401)."
  echo "  Check the unit on the VPS: sudo grep PLANNER_API_KEY /etc/systemd/system/planner.service"
  echo "  Fix it, restart planner.service, then re-run this script."
  echo "Aborting - nothing changed."
  exit 1
fi
echo "OK - key accepted."

# Rewrite .env with both the server-side (PLANNER_*) and build-time (VITE_*) vars.
{
  grep -vE '^(VITE_)?PLANNER_API_(URL|KEY)=' .env 2>/dev/null || true
  printf 'PLANNER_API_URL=%s\n' "$NEW_URL"
  printf 'PLANNER_API_KEY=%s\n' "$KEY"
  printf 'VITE_PLANNER_API_URL=%s\n' "$NEW_URL"
  printf 'VITE_PLANNER_API_KEY=%s\n' "$KEY"
} > .env.new && mv .env.new .env
echo "== .env updated."

echo "== Rebuilding the frontend bundle (npm run build) ..."
npm run build

echo "== Verifying the URL made it into the bundle ..."
if ! grep -q "$NEW_URL" dist/assets/*.js; then
  echo "ERROR: the new URL is not in the built bundle. Aborting - nothing pushed."
  exit 1
fi
echo "OK - URL is baked in."

echo "== Committing + pushing ..."
git add dist/
if git diff --cached --quiet; then
  echo "No dist changes (same URL as before?) - nothing to commit."
else
  git commit -m "Rebuild dist with new tunnel URL"
  git push origin "$(git branch --show-current)"
  echo "Pushed. Vercel auto-redeploys in a few minutes."
fi

echo
echo "==============================================================="
echo " DONE. Two more things so the runtime config stays fresh:"
echo "==============================================================="
echo "1) Vercel dashboard -> Settings -> Environment Variables:"
echo "     PLANNER_API_URL = $NEW_URL"
echo "     PLANNER_API_KEY = $KEY"
echo "   (these serve /api/planner-config, so future rotations only"
echo "    need a Vercel env change + redeploy - no rebuild at all)"
echo "2) Hard-refresh the deployed site (Ctrl+Shift+R) and trigger an SOS."
echo "   Confirm on the VPS: sudo journalctl -u planner.service -f"
