# Implementation Checklist — Online Tech Uganda

Legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Phase 0 — Foundation & DevOps (this repo)
- [x] Monorepo (pnpm workspaces + Turborepo)
- [x] Root config: `package.json`, `turbo.json`, `.gitignore`, `.env.example`
- [x] Docs: ROADMAP, CHECKLIST, ARCHITECTURE
- [x] Brand theme (colors `#F15A29` / `#282363`, typography, logo)
- [x] `apps/web` — Next.js storefront scaffold
- [x] `apps/api` — FastAPI backend scaffold
- [x] `apps/admin` — admin dashboard scaffold
- [x] `packages/ui`, `packages/types`
- [x] `docker-compose.yml` (PostgreSQL for local dev)
- [ ] CI (GitHub Actions: lint, typecheck, build, pytest)
- [ ] Deploy web → Vercel; api → VPS (Docker + Caddy/Nginx + systemd)
- [ ] Domain + DNS + SPF/DKIM/DMARC for Resend
- [ ] Error monitoring (Sentry) + uptime checks

## Phase 1 — Startup website (Months 1–2)
- [x] Global layout: header, mobile nav, footer, WhatsApp CTA
- [x] Home page (hero, value props, featured products, services, learn teaser, CTA)
- [x] Shop page (product grid + filters UI, currency in UGX)
- [x] Services page (web design, repairs, IT support, networking)
- [x] Learn page (course catalog teaser)
- [x] About page (mission, structure, why us)
- [x] Contact page (form → API → Resend, map, WhatsApp, phone)
- [x] SEO metadata, Open Graph, sitemap, robots
- [x] Mobile-responsive + accessible (WCAG AA targets)
- [ ] Analytics (Vercel Analytics / Plausible)
- [ ] Content: real product photos, copy, pricing
- [ ] Social pages linked (FB, Instagram, TikTok, X, LinkedIn)

## Phase 2 — E-commerce growth (Months 3–6)
- [~] Product model: categories, brands, stock, structured specs (JSON column) done · variants + image uploads pending
- [x] Catalog API (list/detail/search/filter/sort/pagination) — DB-backed w/ seed fallback
- [x] Shopping cart (guest + localStorage-persisted) + cart drawer
- [x] Checkout flow (details, delivery, payment method) + server-side price validation
- [x] Orders: create + reference + status field + delivery-fee calc + order lookup/history
- [~] Payments: cash-on-delivery + Mobile Money (instructions) done · MTN/Airtel/Flutterwave API pending
- [~] Delivery: fee by town + free-over-3M done · rider assignment + tracking pending
- [ ] Customer accounts (auth, profile, addresses, order history)
- [ ] Reviews & ratings; wishlist
- [~] Admin: product list + order list (read) done · product CRUD + status updates pending
- [~] Email notifications: order confirmation done · shipped/delivered + SMS pending
- [ ] Coupons / discounts
- [ ] Order status pipeline transitions + PDF invoices
- [x] Catalog expanded: 31 SKUs incl. computers UGX 550k → 6.5M with specs

## Phase 3 — Professional services (Months 6–12)
- [ ] Services catalog with packages & pricing tiers
- [ ] Quote-request & lead-capture forms per service
- [ ] Project intake + CRM-lite (leads → quotes → projects)
- [ ] Repair booking: device, issue, drop-off/pickup, ticket status
- [ ] Portfolio / case studies section
- [ ] Client portal (project status, invoices, files)

## Phase 4 — Online learning platform (Year 1)
- [ ] Course model: modules, lessons, video, attachments, quizzes
- [ ] Enrollment + payment-gated content unlock
- [ ] Video hosting/streaming (Mux/Bunny/Cloudflare Stream) + DRM-lite
- [ ] Progress tracking, resume, completion %
- [ ] Quizzes & assessments; pass thresholds
- [ ] Certificate generation (PDF, verifiable code)
- [ ] Subscriptions (20k UGX/month) + per-course purchase
- [ ] Instructor/admin course authoring UI
- [ ] Seed courses: Computer Basics, MS Office, Web Dev, Programming, Networking

## Phase 5 — Software products (Year 1–2)
- [ ] Multi-tenant foundation (orgs, roles, billing)
- [ ] School Management System
- [ ] Inventory System
- [ ] POS System
- [ ] SACCO System
- [ ] Setup-fee + annual-subscription billing

## Phase 6 — Company mobile app (Year 2)
- [ ] React Native / Expo app
- [ ] Shop, courses, service requests, repair booking, support
- [ ] Push notifications, offline catalog

## Phase 7 — Marketplace (Year 2–3)
- [ ] Supplier onboarding & vendor dashboards
- [ ] Multi-vendor catalog & order splitting
- [ ] Commission, featured listings, advertising
- [ ] Payouts & reconciliation

---

## Cross-cutting
- [ ] Auth & RBAC (customer / staff / instructor / vendor / admin)
- [ ] Internationalization (English; consider Luganda/Swahili later)
- [ ] Performance budget (Core Web Vitals green)
- [ ] Security: OWASP, rate limiting, input validation, secrets mgmt
- [ ] Backups & disaster recovery for PostgreSQL
- [ ] Legal: Terms, Privacy, Refund/Return policy (Uganda compliance)
