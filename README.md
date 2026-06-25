<div align="center">
  <img src="./logo.jpeg" alt="Online Tech Uganda" width="120" />
  <h1>Online Tech Uganda Ltd</h1>
  <p><b>Online computer store · Digital agency · Software company · Online learning · IT services</b></p>
  <p>🟧 <code>#F15A29</code> &nbsp; 🟦 <code>#282363</code></p>
</div>

---

A monorepo powering everything Online Tech Uganda offers — shop, services, learning and support — under one integrated system.

## Tech stack
- **Frontend:** Next.js 15 (App Router, TypeScript, Tailwind) → Vercel
- **Backend:** FastAPI (Python 3.12) + SQLAlchemy + Alembic → VPS
- **Database:** PostgreSQL
- **Email:** Resend
- **Monorepo:** pnpm workspaces + Turborepo

## Structure
| Path | What |
| --- | --- |
| `apps/web` | Customer storefront (Home, Shop, Services, Learn, About, Contact) |
| `apps/admin` | Admin dashboard (web app) |
| `apps/api` | FastAPI backend |
| `packages/ui` | Shared UI + brand tokens |
| `packages/types` | Shared TypeScript types / API contracts |
| `docs/` | [Roadmap](docs/ROADMAP.md) · [Checklist](docs/CHECKLIST.md) · [Architecture](docs/ARCHITECTURE.md) |

## Quick start

### Prerequisites
- Node.js ≥ 20, pnpm ≥ 11
- Python ≥ 3.12
- Docker (for local PostgreSQL) — or a local Postgres instance

### 1. Install JS deps
```bash
pnpm install
```

### 2. Environment
```bash
cp .env.example .env        # then fill in values
```

### 3. Database
```bash
pnpm db:up                  # starts PostgreSQL via docker compose
```

### 4. Backend (FastAPI)
```bash
cd apps/api
python -m venv .venv && . .venv/Scripts/activate   # Windows
# source .venv/bin/activate                          # macOS/Linux
pip install -r requirements.txt
alembic upgrade head        # run migrations
uvicorn app.main:app --reload
# API docs at http://localhost:8000/docs
```

### 5. Frontend
```bash
pnpm dev                    # runs web (:3000) and admin (:3001) via turbo
# or a single app:
pnpm --filter @onlinetech/web dev
```

## Scripts (root)
| Command | Action |
| --- | --- |
| `pnpm dev` | Run all dev servers (turbo) |
| `pnpm build` | Build all apps |
| `pnpm lint` / `pnpm typecheck` | Quality checks |
| `pnpm db:up` / `pnpm db:down` | Start/stop local PostgreSQL |

See [`docs/`](docs/) for the full plan. Built phase by phase — currently **Phase 1**.
