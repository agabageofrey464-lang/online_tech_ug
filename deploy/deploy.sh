#!/usr/bin/env bash
# Deploy the OnlineTechUg API to the VPS.
# Backend-only: the shop and admin go to Vercel (`vercel deploy --prod` from
# apps/web and apps/admin).
# Run from the repo root:  bash deploy/deploy.sh
#
# The server does not run Docker. The API is a systemd service,
# `onlinetech-api`, running uvicorn on 127.0.0.1:8010 out of
# /home/ubuntu/onlinetech-api, which holds the contents of apps/api next to the
# server's own .env, .venv and uploads/. This script only ever writes code into
# that folder; those three are never touched.
#
# SSH is firewalled to known addresses. If the connection times out, add this
# machine's public IP to the instance's security group (TCP 22) first.
set -euo pipefail

KEY="${SSH_KEY:-$HOME/.ssh/onlinetech-deploy}"
SERVER="${SERVER:-ubuntu@16.171.228.73}"
REMOTE="${REMOTE_DIR:-/home/ubuntu/onlinetech-api}"
SERVICE="${SERVICE:-onlinetech-api}"
HEALTH="http://127.0.0.1:8010/api/v1/health"
SSH="ssh -i $KEY -o BatchMode=yes -o ConnectTimeout=15 -o StrictHostKeyChecking=accept-new"

# What ships. Everything else in apps/api is local-only (venv, logs, Docker).
CODE="app scripts migrations alembic alembic.ini requirements.txt"

if ! git diff --quiet HEAD -- apps/api; then
  echo "ERROR: apps/api has uncommitted changes. Commit them first, so what is live is in git."
  exit 1
fi

echo "==> [1/5] Checking the connection"
$SSH "$SERVER" "test -d $REMOTE/app && test -f $REMOTE/.env" \
  || { echo "ERROR: cannot reach $SERVER, or $REMOTE is not the API folder."; exit 1; }

echo "==> [2/5] Uploading the code to a staging folder and checking it compiles"
# git archive sends exactly what is committed, with the line endings git stores.
git archive --format=tar HEAD:apps/api $CODE | $SSH "$SERVER" "
  set -e
  rm -rf ~/deploy-stage && mkdir ~/deploy-stage && tar xf - -C ~/deploy-stage
  $REMOTE/.venv/bin/python -m compileall -q ~/deploy-stage/app > /dev/null
"

echo "==> [3/5] Backing up the live code"
STAMP=$($SSH "$SERVER" "date +%Y%m%d-%H%M%S")
BACKUP="/home/ubuntu/onlinetech-api-backup-$STAMP.tar.gz"
$SSH "$SERVER" "cd $REMOTE && tar czf $BACKUP --exclude='__pycache__' $CODE && echo \"    $BACKUP\""

echo "==> [4/5] Installing and restarting"
$SSH "$SERVER" "
  set -e
  if ! cmp -s ~/deploy-stage/requirements.txt $REMOTE/requirements.txt; then
    echo '    requirements changed - installing'
    $REMOTE/.venv/bin/pip install -q -r ~/deploy-stage/requirements.txt
  fi
  find ~/deploy-stage -name '__pycache__' -type d -prune -exec rm -rf {} +
  cp -r ~/deploy-stage/. $REMOTE/
  rm -rf ~/deploy-stage
  sudo systemctl restart $SERVICE
"

echo "==> [5/5] Waiting for the API to answer"
if $SSH "$SERVER" "for i in \$(seq 1 30); do sleep 2; [ \"\$(curl -s -o /dev/null -w '%{http_code}' $HEALTH)\" = 200 ] && exit 0; done; exit 1"; then
  echo "==> Done. $(git rev-parse --short HEAD) is live. Backup of the previous code: $BACKUP"
else
  echo "==> The API did not come back. Restoring the previous code."
  $SSH "$SERVER" "cd $REMOTE && tar xzf $BACKUP && sudo systemctl restart $SERVICE && sleep 6 && curl -s -o /dev/null -w '    health after restore: %{http_code}\n' $HEALTH; journalctl -u $SERVICE -n 30 --no-pager"
  exit 1
fi
