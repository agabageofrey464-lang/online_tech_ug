#!/usr/bin/env bash
# Deploy the OnlineTechUg backend (FastAPI + PostgreSQL) to the VPS.
# Backend-only: frontends are deployed to Vercel separately.
# Run from the repo root:  bash deploy/deploy.sh
set -euo pipefail

KEY="${SSH_KEY:-$HOME/.ssh/beds-beddings-key.pem}"
SERVER="${SERVER:-ubuntu@16.171.228.73}"
REMOTE="${REMOTE_DIR:-/home/ubuntu/onlinetech_ug}"
SSH="ssh -i $KEY -o StrictHostKeyChecking=accept-new"

echo "==> [1/6] Ensuring remote directory $REMOTE"
$SSH "$SERVER" "mkdir -p $REMOTE"

echo "==> [2/6] Uploading backend + deploy assets"
tar czf - \
  --exclude='*/.venv' --exclude='*/venv' --exclude='*/__pycache__' \
  --exclude='*.db' --exclude='*.pyc' \
  apps/api deploy | $SSH "$SERVER" "tar xzf - -C $REMOTE"

echo "==> [3/6] Verifying secrets file exists (deploy/.env.prod)"
$SSH "$SERVER" "test -f $REMOTE/deploy/.env.prod || { echo 'ERROR: $REMOTE/deploy/.env.prod missing. Copy .env.prod.example -> .env.prod and fill secrets.'; exit 1; }"

echo "==> [4/6] Building & starting containers (api + postgres)"
$SSH "$SERVER" "cd $REMOTE/deploy && docker compose -f docker-compose.prod.yml up -d --build"

echo "==> [5/6] Waiting for API health on 127.0.0.1:8000"
$SSH "$SERVER" "for i in \$(seq 1 30); do curl -sf http://127.0.0.1:8000/api/v1/health >/dev/null && { echo OK; break; } || sleep 2; done"

echo "==> [6/6] Seeding catalog (idempotent)"
$SSH "$SERVER" "cd $REMOTE/deploy && docker compose -f docker-compose.prod.yml exec -T api python -m scripts.seed"

echo "==> Done. API is healthy on 127.0.0.1:8000. Configure nginx + TLS next (see deploy/README.md)."
