# Deploying the OnlineTechUg API (VPS)

> **How it runs today (checked 2026-10-06).** The server does not use Docker. The API is a
> systemd service, `onlinetech-api`, running uvicorn on `127.0.0.1:8010` from
> `/home/ubuntu/onlinetech-api`, with PostgreSQL installed on the host. `bash deploy/deploy.sh`
> deploys to that layout: it uploads the committed `apps/api` code, backs up what is live,
> restarts the service and restores the backup if the health check fails. It uses the key at
> `~/.ssh/onlinetech-deploy` (override with `SSH_KEY`). The Docker instructions below describe
> the original plan and are kept for reference only.

Backend-only deployment (FastAPI + PostgreSQL in Docker). Frontends go to Vercel.
This server is **shared** with Beds & Beddings — the setup is isolated and does
**not** modify existing nginx vhosts or services.

| Thing | Value |
| --- | --- |
| Server | `ubuntu@16.171.228.73` |
| Existing apps | `api.bedsbeddings.com` (nginx 1.24, Let's Encrypt) — untouched |
| OnlineTech API | runs on `127.0.0.1:8000` (localhost only), proxied by nginx |
| OnlineTech DB | PostgreSQL container, internal network only (not published) |

## Prerequisites (one-time, you)
1. **Open SSH** to the deploy machine's IP in the EC2 Security Group (TCP 22).
2. **DNS:** point the API domain (e.g. `api.onlinetechug.com`) — an `A` record → `16.171.228.73`.
3. Ensure **Docker + compose plugin** are installed on the server:
   ```bash
   docker --version && docker compose version
   # if missing:  curl -fsSL https://get.docker.com | sudo sh && sudo usermod -aG docker ubuntu
   ```

## 1. Configure secrets
On the server (or before first deploy):
```bash
cd /home/ubuntu/onlinetech_ug/deploy
cp .env.prod.example .env.prod
nano .env.prod        # set strong POSTGRES_PASSWORD, SECRET_KEY, CORS_ORIGINS (Vercel URLs), Resend key
```

## 2. Deploy (from your local repo root)
```bash
bash deploy/deploy.sh
```
This uploads the backend, builds the image, starts `api` + `db`, waits for health, and seeds the catalog.

## 3. nginx reverse proxy + HTTPS (one-time)
```bash
cd /home/ubuntu/onlinetech_ug/deploy/nginx
sed -i 's/API_DOMAIN/api.onlinetechug.com/g' onlinetech-api.conf      # your domain
sudo cp onlinetech-api.conf /etc/nginx/sites-available/onlinetech-api
sudo ln -s /etc/nginx/sites-available/onlinetech-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.onlinetechug.com                          # free TLS + auto-redirect
```

## 4. Verify
```bash
curl -s https://api.onlinetechug.com/api/v1/health
curl -s https://api.onlinetechug.com/api/v1/products | head
```

## Operations
```bash
cd /home/ubuntu/onlinetech_ug/deploy
docker compose -f docker-compose.prod.yml logs -f api      # logs
docker compose -f docker-compose.prod.yml restart api      # restart
docker compose -f docker-compose.prod.yml down             # stop (keeps DB volume)
docker compose -f docker-compose.prod.yml exec -T api python -m scripts.seed   # re-seed
```

## Redeploy after code changes
Just run `bash deploy/deploy.sh` again — it re-uploads, rebuilds, and restarts.

## Frontends (Vercel) — separate
Deploy `apps/web` and `apps/admin` on Vercel with env var
`NEXT_PUBLIC_API_URL=https://api.onlinetechug.com`. Add those Vercel domains to
`CORS_ORIGINS` in `.env.prod` and redeploy the API.
