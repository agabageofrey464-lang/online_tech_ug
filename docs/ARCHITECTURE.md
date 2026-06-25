# Architecture — Online Tech Uganda

## Monorepo layout

```
onlinetech_ug/
├── apps/
│   ├── web/      # Next.js 15 storefront (Vercel)   :3000
│   ├── admin/    # Next.js 15 admin dashboard        :3001
│   └── api/      # FastAPI backend (VPS)             :8000
├── packages/
│   ├── ui/       # Shared React UI primitives + brand
│   └── types/    # Shared TS types (API contracts)
├── docs/         # Roadmap, checklist, architecture
├── docker-compose.yml   # Local PostgreSQL (+ api/web optional)
├── turbo.json           # Task pipeline + caching
└── pnpm-workspace.yaml
```

## Why this shape
- **Headless / API-first.** Web and admin talk to FastAPI over HTTP only; FastAPI
  auto-generates an OpenAPI schema we turn into typed clients in `packages/types`.
- **Turborepo** caches builds/tests across apps for fast CI.
- **Independent deploys.** Frontend → Vercel (edge, fast in EA region via CDN);
  backend → VPS (full control, cheaper for long-running workloads, DB locality).

## Backend (FastAPI)
```
apps/api/app/
├── main.py            # app factory, CORS, routers, lifespan
├── core/config.py     # pydantic-settings (.env)
├── db/                # SQLAlchemy engine, session, Base
├── models/            # ORM models (product, contact, ...)
├── schemas/           # Pydantic request/response
├── api/routes/        # routers: health, products, contact
└── services/          # email (Resend), business logic
```
- **SQLAlchemy 2.0** ORM + **Alembic** migrations.
- **psycopg (v3)** driver. DSN: `postgresql+psycopg://...`.
- **Resend** for transactional email (contact, orders, certificates).

## Frontend (Next.js)
- App Router, TypeScript, Tailwind CSS v4 with brand tokens.
- Server Components for content/SEO; client components for interactive bits.
- Brand tokens centralized so colors/typography stay consistent across apps.

## Data flow (Phase 1 contact form)
```
web ContactForm ──POST /api/v1/contact──▶ FastAPI ──Resend──▶ inbox
                                              └──▶ contact_messages table
```

## Environments
- `.env.example` documents every variable. Copy to `.env` per app as needed.
- Secrets in Vercel project settings (web) and VPS env / secrets manager (api).

## Deployment (target)
- **web/admin:** Vercel (Git-connected, preview deploys per PR).
- **api:** VPS with Docker Compose → Caddy/Nginx reverse proxy + TLS, systemd or
  Docker restart policy, PostgreSQL (managed or self-hosted with backups).
