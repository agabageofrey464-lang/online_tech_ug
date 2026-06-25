# Online Tech Uganda — API (FastAPI)

## Run locally
```bash
python -m venv .venv
. .venv/Scripts/activate      # Windows  (use: source .venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
cp .env.example .env          # adjust values
uvicorn app.main:app --reload
```
- Interactive docs: http://localhost:8000/docs
- Health: http://localhost:8000/api/v1/health

> The API starts even without a database (degraded mode) so the storefront's
> seed catalog keeps working during development.

## Database & migrations
```bash
# start Postgres from the repo root:
#   pnpm db:up    (or: docker compose up -d db)

alembic revision --autogenerate -m "init"   # create a migration
alembic upgrade head                          # apply migrations
python -m scripts.seed                        # load Phase 1 seed catalog
```

## Endpoints
| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/products` | List products (`?category=&search=&sort=&limit=&offset=`) |
| GET | `/api/v1/products/{slug}` | Product detail |
| POST | `/api/v1/orders` | Create an order (server-side price validation + email) |
| GET | `/api/v1/orders` | List recent orders (admin) |
| GET | `/api/v1/orders/{reference}` | Order detail by reference |
| POST | `/api/v1/contact` | Submit a contact message (persists + emails) |

> Orders require the database (they are persisted). Catalog & contact degrade
> gracefully to seed/email-only when the DB is unavailable.

## Layout
```
app/
├── main.py            app factory, CORS, lifespan
├── core/config.py     settings (.env)
├── db/                Base, engine, session
├── models/            ORM: Product, ContactMessage
├── schemas/           Pydantic I/O
├── api/routes/        health, products, contact
└── services/          email (Resend), catalog (seed)
```
