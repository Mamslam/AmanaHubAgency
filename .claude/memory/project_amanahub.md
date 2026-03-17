---
name: AmanaHub Project
description: Next.js 16 multilingual digital agency app with hidden internal audit portal and full Command Center
type: project
---

Full-stack app at /home/tall/Repos/AmanaHubAgency

**Why:** Solo AI-powered digital agency operating system for automated outreach and delivery.

**How to apply:** When working in this repo, understand both the public landing site and the private command center are in the same Next.js app.

## Structure
- `app/[locale]/` — public multilingual landing site (EN/FR/DE) with next-intl
- `app/portal/` — original simple audit portal (accessed via Konami "amana" key sequence on landing)
- `app/command/` — full Command Center (10 modules, accessed at /command/login)
- `backend/` — separate Express.js server for Railway deployment

## Command Center Modules
- `/command/login` — JWT auth (code: AMANAHUB2026)
- `/command/dashboard` — KPIs, charts, activity feed
- `/command/leads` — CSV import, lead table, filters, slide-over profile
- `/command/audit` — audit wizard (single/batch), score rings, reports
- `/command/outreach` — email compose (4 languages), queue, follow-up engine
- `/command/agent` — AI agent control panel, real-time log terminal, WebSocket
- `/command/pipeline` — Kanban board (7 stages) + list view
- `/command/delivery` — project tracker with interactive checklists
- `/command/billing` — invoice generator, revenue overview, recurring clients
- `/command/analytics` — Recharts dashboards (outreach, revenue, audit insights)
- `/command/settings` — agency profile, integrations (Gmail/Telegram/Stripe/Anthropic), agent defaults, pricing, templates, invoice

## Key Tech
- Frontend: Next.js 16 App Router, TypeScript strict, Tailwind CSS v4, Recharts
- i18n: next-intl (only for [locale] routes, excluded from command/* via middleware)
- CSS animations only (no Framer Motion in command center)
- Backend: Express.js + Prisma + PostgreSQL + WebSocket + node-cron
- Mock data: lib/mock-data.ts (10 leads, KPIs, agent logs, etc.)
- Types: types/index.ts
- Auth: lib/command-auth.ts (localStorage JWT, 24h expiry)

## Backend (Railway)
- `backend/src/index.ts` — Express server + WebSocket
- `backend/src/agent/AgentEngine.ts` — full AI agent loop
- `backend/src/services/` — pagespeed, claude, telegram, gmail
- `backend/src/routes/` — auth, leads, agent, audit
- `backend/src/prisma/schema.prisma` — full DB schema
- Crons: daily agent at 08:00, reply checker every 30min

## Env vars needed
- PORTAL_CODE, ANTHROPIC_API_KEY, PAGESPEED_API_KEY (frontend)
- NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL (frontend)
- DATABASE_URL, JWT_SECRET, GMAIL_*, TELEGRAM_*, STRIPE_* (backend)

## Routing notes
- middleware (proxy.ts) excludes /command/* from next-intl locale routing
- /command/* routes go through app/command/layout.tsx (auth-gated)
- Root app/layout.tsx loads DM Sans + Playfair Display fonts for all routes
